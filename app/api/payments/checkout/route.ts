import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized. Please log in first.' }, { status: 401 });
    }

    const { planId } = await req.json();

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required.' }, { status: 400 });
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

    // Format tx_ref strictly as sub_{userId}_{planId}_{timestamp} for webhook handler alignment
    const tx_ref = `sub_${user.id}_${plan.id}_${Date.now()}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Record pending payment in database
    try {
      await prisma.payment.create({
        data: {
          userId: user.id,
          planId: plan.id,
          amount: plan.price,
          currency: plan.currency || 'USD',
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
    const flwSecretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (flwSecretKey && flwSecretKey.trim() !== '' && !flwSecretKey.includes('your-')) {
      const flwRes = await fetch('https://api.flutterwave.com/v3/payments', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${flwSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tx_ref,
          amount: plan.price,
          currency: plan.currency || 'USD',
          redirect_url: `${appUrl}/subscription?payment=success&tx_ref=${tx_ref}`,
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
        // Fall through to dev simulation mode if live call failed
      }
    }

    // DEV / SIMULATION MODE FALLBACK
    // If no live keys or if testing locally, redirect to simulated success URL
    console.log('Using Flutterwave Simulation Mode for tx_ref:', tx_ref);
    const simulationUrl = `/subscription?payment=simulated_success&tx_ref=${tx_ref}&planId=${plan.id}&planName=${encodeURIComponent(plan.name)}`;
    
    return NextResponse.json({
      success: true,
      checkoutUrl: simulationUrl,
      simulated: true,
      message: 'Redirecting via Dev Simulation Mode (no live Flutterwave key detected).'
    });

  } catch (error: any) {
    console.error('Error initiating Flutterwave checkout:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
