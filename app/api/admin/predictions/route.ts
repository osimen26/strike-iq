import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sanitizePayload, sanitizeNumber } from '@/lib/security/validator';
import { requireMasterAdmin, logAdminAudit } from '@/lib/security/adminGuard';

export async function POST(request: Request) {
  try {
    const { user, errorResponse } = await requireMasterAdmin();
    if (errorResponse) return errorResponse;

    const supabase = await createClient();
    const rawBody = await request.json();
    const body = sanitizePayload(rawBody);

    // Log security audit
    logAdminAudit("CREATE_PRO_PREDICTION", { match: `${body.homeTeam} vs ${body.awayTeam}`, league: body.league });

    // 1. Insert the Pro Prediction with sanitized fields
    const { data, error } = await supabase
      .from('pro_predictions')
      .insert([
        {
          home_team: body.homeTeam,
          away_team: body.awayTeam,
          league: body.league,
          sport: body.sport,
          match_date: body.matchDate,
          match_time: body.matchTime,
          prediction: body.prediction,
          confidence: sanitizeNumber(body.confidence, 0, 100, 75),
          analysis: body.analysis,
          tags: Array.isArray(body.tags) ? body.tags.map((t: any) => String(t).slice(0, 50)) : [],
          created_by: user.id
        }
      ])
      .select();

    if (error) {
      console.error("Supabase Insertion Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 2. Fetch all user IDs to notify
    const { data: allUsers } = await supabase
      .from('user')
      .select('id');

    if (allUsers && allUsers.length > 0) {
      const notifications = allUsers.map((u: { id: string }) => ({
        userId: u.id,
        title: `👑 New Pro Pick: ${body.homeTeam} vs ${body.awayTeam}`,
        message: `${body.league} · ${body.prediction} — ${body.confidence}% confidence. Check it out now!`,
        type: 'PREDICTION_ALERT',
        isRead: false,
        link: '/dashboard',
        createdAt: new Date().toISOString(),
      }));

      const { error: notifError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notifError) {
        console.error("Notification insert error:", notifError);
        // Don't fail the whole request — prediction was saved successfully
      }
    }

    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error("Pro Prediction API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
