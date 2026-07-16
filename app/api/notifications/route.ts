import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rateLimit';

// GET - Fetch current user's notifications
export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`notifications-get:${ip}`, RATE_LIMITS.USER);
  if (!rl.success) return rateLimitResponse(rl);
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('userId', user.id)
      .order('createdAt', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('[NOTIFICATIONS] GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH - Mark all notifications as read
export async function PATCH(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`notifications-patch:${ip}`, RATE_LIMITS.USER);
  if (!rl.success) return rateLimitResponse(rl);
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('notifications')
      .update({ isRead: true })
      .eq('userId', user.id)
      .eq('isRead', false);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[NOTIFICATIONS] PATCH error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
