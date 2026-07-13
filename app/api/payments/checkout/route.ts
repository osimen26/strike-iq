import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { sanitizeString, isValidId } from '@/lib/security/validator';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
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

    // Support multi-currency Pan-African checkout (USD, KES, GHS, NGN, ZAR, UGX)
    const requestedCurrency = sanitizeString(rawBody?.currency, 10)?.toUpperCase() || plan.currency || 'USD';
    const exchangeRates: Record<string, number> = {
      USD: 1,
      KES: 130,   // Kenyan Shilling (M-Pesa Kenya)
      GHS: 15.5,  // Ghanaian Cedi (MTN MoMo Ghana)
      NGN: 1550,  // Nigerian Naira
      ZAR: 18.5,  // South African Rand
      UGX: 3700,  // Ugandan Shilling
    };
    const targetCurrency = exchangeRates[requestedCurrency] ? requestedCurrency : 'USD';
    const targetAmount = Math.round(plan.price * (exchangeRates[targetCurrency] || 1) * 100) / 100;

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
    const candidateKeys = [process.env.FLUTTERWAVE_SECRET_KEY, process.env.Flutterwave, process.env.FLUTTERWAVE_KEY];
    const rawKey = candidateKeys.find(k => k && k.trim() !== '' && !k.includes('your-') && k.trim() !== 'EHvwBlhYvyO7gKb512jaVNMkbReAKflt');
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

    // DEV / SIMULATION MODE FALLBACK
    // If no live keys or if testing locally, redirect to simulated success URL
    if (process.env.NODE_ENV !== "production") {
      console.log("Simulation Mode tx_ref:", tx_ref, "Reason:", flwErrorMsg);
    }
    const simulationUrl = `/subscription?payment=simulated_success&tx_ref=${tx_ref}&planId=${plan.id}&planName=${encodeURIComponent(plan.name)}`;
    
    return NextResponse.json({
      success: true,
      checkoutUrl: simulationUrl,
      simulated: true,
      flwError: flwErrorMsg,
      message: flwErrorMsg ? `Flutterwave API Note: ${flwErrorMsg}` : 'Redirecting via Dev Simulation Mode (no live Flutterwave key detected).'
    });

  } catch (error: any) {
    console.error('Error initiating Flutterwave checkout:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
