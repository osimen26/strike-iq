import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/feed
 * Returns published Pro Picks from the pro_predictions table.
 * Shapes data to match the dashboard MatchCard component expectations.
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Verify the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all pro predictions, most recent first
    const { data: rawPicks, error } = await supabase
      .from('pro_predictions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[FEED] Supabase fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const picks = rawPicks || [];

    // Shape each row from the pro_predictions table into the format
    // the dashboard MatchCard component expects
    const shaped = picks.map((p: any) => {
      // Build a human-readable date/time label from match_date + match_time
      let dateLabel = 'TBD';
      let timeLabel = '';

      if (p.match_date) {
        const matchDate = new Date(p.match_date);
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        const isSameDay = (a: Date, b: Date) =>
          a.getFullYear() === b.getFullYear() &&
          a.getMonth() === b.getMonth() &&
          a.getDate() === b.getDate();

        if (isSameDay(matchDate, today)) {
          dateLabel = 'Today';
        } else if (isSameDay(matchDate, tomorrow)) {
          dateLabel = 'Tomorrow';
        } else {
          dateLabel = matchDate.toLocaleDateString('en-GB', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
          });
        }
      }

      if (p.match_time) {
        // match_time is stored as HH:MM (24h), display with GMT suffix
        timeLabel = `${p.match_time} GMT`;
      }

      return {
        id: p.id,
        homeTeam: p.home_team,
        awayTeam: p.away_team,
        league: p.league,
        sport: p.sport || 'football',
        date: dateLabel,
        time: timeLabel,
        prediction: p.prediction,
        confidence: p.confidence,
        analysis: p.analysis || '',
        tags: Array.isArray(p.tags) ? p.tags : [],
        isProPick: true, // All admin-published picks are Pro Picks
        createdAt: p.created_at,
      };
    });

    // Separate into proPicks (all of them) and matches (empty — matches come from
    // a future sports-data integration). The dashboard merges both arrays.
    return NextResponse.json({
      success: true,
      data: {
        proPicks: shaped,
        matches: [],
      },
    });
  } catch (error: any) {
    console.error('[FEED] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
