import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // Rate limit: 30 requests per minute per IP
  const ip = getClientIp(request);
  const rl = checkRateLimit(`cancel:${ip}`, RATE_LIMITS.USER);
  if (!rl.success) return rateLimitResponse(rl);

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    // 1. Update subscription status in Prisma
    await prisma.subscription.updateMany({
      where: {
        userId: user.id,
        status: 'ACTIVE',
      },
      data: {
        status: 'CANCELLED',
        cancelAtPeriodEnd: true,
      },
    });

    // 2. Also update in Supabase subscriptions table
    try {
      await supabase
        .from('subscriptions')
        .update({ status: 'CANCELLED' })
        .eq('userId', user.id);
    } catch (sbErr) {
      console.warn('Could not update Supabase subscriptions table:', sbErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Your recurring subscription has been successfully stopped. You will not be billed again.',
    });
  } catch (error: unknown) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json({ error: 'Failed to cancel subscription. Please try again or contact support.' }, { status: 500 });
  }
}
