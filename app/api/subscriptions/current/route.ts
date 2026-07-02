import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch active subscription
    const activeSub = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: 'ACTIVE',
        currentPeriodEnd: {
          gt: new Date()
        }
      },
      include: {
        plan: true,
      },
      orderBy: {
        currentPeriodEnd: 'desc',
      },
    });

    // Fetch recent billing history
    const payments = await prisma.payment.findMany({
      where: {
        userId: user.id,
      },
      include: {
        plan: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    if (activeSub) {
      const daysRemaining = Math.max(0, Math.ceil((new Date(activeSub.currentPeriodEnd).getTime() - Date.now()) / (1000 * 3600 * 24)));
      return NextResponse.json({
        success: true,
        isPro: true,
        subscription: activeSub,
        planName: activeSub.plan.name,
        daysRemaining,
        payments,
      });
    }

    return NextResponse.json({
      success: true,
      isPro: false,
      subscription: null,
      planName: 'Free',
      daysRemaining: 0,
      payments,
    });
  } catch (error: any) {
    console.error('Error fetching subscription status:', error);
    // Graceful fallback for offline dev/demo
    return NextResponse.json({
      success: true,
      isPro: false,
      subscription: null,
      planName: 'Free',
      daysRemaining: 0,
      payments: [],
      fallback: true
    });
  }
}
