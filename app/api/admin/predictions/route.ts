import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Verify authentication and admin email
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== "osimen30@gmail.com") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // 1. Insert the Pro Prediction
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
          confidence: Number(body.confidence),
          analysis: body.analysis,
          tags: body.tags,
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
