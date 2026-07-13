import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { sanitizeString, isValidId } from '@/lib/security/validator';
import { MASTER_ADMIN_EMAIL, MASTER_ADMIN_EMAILS } from '@/lib/security/adminGuard';
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  // Rate limit: 5 simulation attempts per minute per IP
  const ip = getClientIp(req);
  const rl = checkRateLimit(`simulate:${ip}`, RATE_LIMITS.PAYMENT);
  if (!rl.success) return rateLimitResponse(rl);

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In production, strictly restrict payment simulation to VIP Administrator only!
    if (process.env.NODE_ENV === 'production' && (!user.email || !MASTER_ADMIN_EMAILS.includes(user.email.toLowerCase()))) {
      console.warn(`[SECURITY_ALERT] Unauthorized payment simulation attempt in production by ${user.email}`);
      return NextResponse.json({ error: 'Forbidden: Payment simulation is disabled in production for standard accounts.' }, { status: 403 });
    }

    const rawBody = await req.json();
    const tx_ref = sanitizeString(rawBody?.tx_ref, 128);
    const planId = sanitizeString(rawBody?.planId, 100);

    if (!tx_ref || !planId || !isValidId(planId) || !isValidId(tx_ref)) {
      return NextResponse.json({ error: 'Invalid or missing Transaction reference or Plan ID.' }, { status: 400 });
    }

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    const planName = plan?.name || 'Pro Plan';
    const isYearly = plan?.interval === 'YEARLY';

    const now = new Date();
    const endDate = new Date(now);
    if (isYearly) {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // 1. Update or record Payment as SUCCESSFUL
    try {
      await prisma.payment.upsert({
        where: { reference: tx_ref },
        update: { status: 'SUCCESSFUL' },
        create: {
          userId: user.id,
          planId: planId,
          amount: plan?.price || 9.99,
          currency: plan?.currency || 'USD',
          status: 'SUCCESSFUL',
          provider: 'FLUTTERWAVE_DEV_SIMULATION',
          reference: tx_ref,
          paymentMethod: 'simulated_card',
        },
      });
    } catch (err) {
      console.warn('Could not update payment record in DB:', err);
    }

    // 2. Activate Subscription
    try {
      await prisma.subscription.upsert({
        where: {
          externalSubscriptionId: `flw_sim_${user.id}_${planId}`,
        },
        update: {
          status: 'ACTIVE',
          currentPeriodEnd: endDate,
        },
        create: {
          userId: user.id,
          planId: planId,
          status: 'ACTIVE',
          currentPeriodStart: now,
          currentPeriodEnd: endDate,
          externalSubscriptionId: `flw_sim_${user.id}_${planId}`,
        },
      });
    } catch (err) {
      console.warn('Could not upsert subscription in DB:', err);
    }

    // 3. Notify User
    try {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: '⚡ Pro Subscription Activated',
          message: `Your subscription to ${planName} is now active via Flutterwave. Welcome to Strike IQ Pro!`,
          type: 'PAYMENT',
          link: '/dashboard',
        },
      });
    } catch (err) {
      console.warn('Could not create notification:', err);
    }

    return NextResponse.json({ success: true, message: `Successfully simulated activation for ${planName}.` });
  } catch (error: any) {
    console.error('Error in simulation activation:', error);
    return NextResponse.json({ error: error.message || 'Simulation failed' }, { status: 500 });
  }
}
