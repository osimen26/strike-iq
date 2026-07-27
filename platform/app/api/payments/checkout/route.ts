import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { sanitizeString, isValidId } from '@/lib/security/validator';
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rateLimit';
import { getLocalizedPlanPrice } from '@/lib/pricing/regional';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  // Rate limit: 5 checkout attempts per minute per IP
  const ip = getClientIp(req);
  const rl = checkRateLimit(`checkout:${ip}`, RATE_LIMITS.PAYMENT);
  if (!rl.success) return rateLimitResponse(rl);

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized. Please log in first.' }, { status: 401 });
    }

    const rawBody = await req.json();
    const planId = sanitizeString(rawBody?.planId, 100);

    if (!planId || !isValidId(planId)) {
      return NextResponse.json({ error: 'Invalid or missing Plan ID parameter.' }, { status: 400 });
    }

    // Find requested plan
    let plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      // Fallback try name search if planId was passed as a name
      plan = await prisma.plan.findFirst({ where: { name: planId } });
    }

    if (!plan) {
      return NextResponse.json({ error: 'Selected plan not found.' }, { status: 404 });
    }

    if (plan.price === 0) {
      return NextResponse.json({ error: 'Free plan does not require checkout.' }, { status: 400 });
    }

    // Resolve exact scalable regional pricing (e.g. NGN 5,000 for Nigeria, USD 9.99 for International)
    const cookieStore = await cookies();
    const cookieCountry = cookieStore.get('strikeiq_region')?.value;
    const requestedCountry = sanitizeString(rawBody?.countryCode, 5)?.toUpperCase() || cookieCountry || 'US';

    const localized = getLocalizedPlanPrice(plan.name, plan.interval || 'MONTHLY', requestedCountry);
    const targetCurrency = localized.currency;
    const targetAmount = localized.price;

    // Format tx_ref strictly as sub_{userId}_{planId}_{timestamp} for webhook handler alignment
    const tx_ref = `sub_${user.id}_${plan.id}_${Date.now()}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Record pending payment in database
    try {
      await prisma.payment.create({
        data: {
          userId: user.id,
          planId: plan.id,
          amount: targetAmount,
          currency: targetCurrency,
          status: 'PENDING',
          provider: 'FLUTTERWAVE',
          reference: tx_ref,
          paymentMethod: 'hosted_checkout',
        },
      });
    } catch (dbErr) {
      console.warn('Could not record pending payment in database (offline/demo mode):', dbErr);
    }

    // Check if live Flutterwave Secret Key is configured (supports both V3 FLWSECK keys and V4 Client Secrets)
    // NOTE: Never hardcode key values as a blacklist — if the env var changes the check breaks silently.
    const candidateKeys = [process.env.FLUTTERWAVE_SECRET_KEY, process.env.Flutterwave, process.env.FLUTTERWAVE_KEY];
    const rawKey = candidateKeys.find(k => k && k.trim() !== '' && !k.includes('your-'));
    const flwSecretKey = rawKey ? rawKey.replace(/^["']|["']$/g, '').trim() : null;
    let flwErrorMsg: string | null = null;

    if (flwSecretKey) {
      if (flwSecretKey.startsWith('FLWPUBK')) {
        flwErrorMsg = 'You pasted your Public Key (FLWPUBK...). Please use your Secret Key (FLWSECK...) from Flutterwave Settings -> API Keys.';
      } else if (!flwSecretKey.startsWith('FLWSECK')) {
        flwErrorMsg = `Invalid key format. Flutterwave V3 secret keys must start with FLWSECK_TEST- or FLWSECK-. (Received key starting with: "${flwSecretKey.substring(0, 8)}...")`;
      } else {
        const flwRes = await fetch('https://api.flutterwave.com/v3/payments', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${flwSecretKey}`,
            'Content-Type': 'application/json',
          },
        body: JSON.stringify({
          tx_ref,
          amount: targetAmount,
          currency: targetCurrency,
          redirect_url: `${appUrl}/subscription?flw_return=1&tx_ref=${tx_ref}`,
          customer: {
            email: user.email,
            name: user.user_metadata?.full_name || user.email.split('@')[0] || 'Strike IQ Member',
          },
          customizations: {
            title: `Strike IQ - ${plan.name}`,
            description: plan.description || 'Sports AI Intelligence Subscription',
            logo: 'https://strikeiq.ai/logo.png',
          },
        }),
      });

      const flwData = await flwRes.json();
      if (flwData.status === 'success' && flwData.data?.link) {
        return NextResponse.json({ success: true, checkoutUrl: flwData.data.link });
      } else {
        console.error('Flutterwave API returned error:', flwData);
        flwErrorMsg = flwData.message || flwData.error || JSON.stringify(flwData);
        // Fall through to dev simulation mode if live call failed
      }
    }
    } else {
      flwErrorMsg = 'No live secret key found in environment variables (Vercel/local).';
    }

    // CRITICAL SECURITY: Never allow simulation flow in production — payment bypass risk.
    if (process.env.NODE_ENV === 'production') {
      console.error('[CHECKOUT] Flutterwave live payment failed in production. Cannot fall back to simulation.', flwErrorMsg);
      return NextResponse.json(
        { error: 'Payment gateway unavailable. Please try again or contact support.' },
        { status: 503 }
      );
    }

    // DEV / SIMULATION MODE FALLBACK — development and staging only
    console.log('[CHECKOUT] Simulation Mode tx_ref:', tx_ref, 'Reason:', flwErrorMsg);
    const simulationUrl = `/subscription?payment=simulated_success&tx_ref=${tx_ref}&planId=${plan.id}&planName=${encodeURIComponent(plan.name)}`;

    return NextResponse.json({
      success: true,
      checkoutUrl: simulationUrl,
      simulated: true,
      message: flwErrorMsg
        ? `Dev simulation (Flutterwave note: ${flwErrorMsg})`
        : 'Redirecting via Dev Simulation Mode (no live Flutterwave key detected).',
    });

  } catch (error) {
    console.error('[CHECKOUT] Error initiating Flutterwave checkout:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
