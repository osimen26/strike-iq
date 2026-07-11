import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
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
  } catch (error: any) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json({ error: error.message || 'Failed to cancel subscription' }, { status: 500 });
  }
}
