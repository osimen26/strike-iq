import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * GET /api/feed
 * Returns published Pro Picks from the pro_predictions table.
 * Uses the service role / anon key directly so no session cookie is required.
 */
export async function GET() {
  try {
    // Use the Supabase anon client directly — no cookies needed for public reads
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );

    // Fetch all pro predictions, most recent first
    const { data: rawPicks, error } = await supabase
      .from('pro_predictions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[FEED] Supabase fetch error:', error);
      // Don't 500 — fall through with empty shaped array so Odds API still loads
    }

    const picks = rawPicks || [];

    // Shape each row from the pro_predictions table into the format
    // the dashboard MatchCard component expects
    const shaped = picks.map((p: any) => {
      // Build a human-readable date/time label from match_date + match_time
      let dateLabel = 'TBD';
      let timeLabel = '';

      if (p.match_date) {
        let matchDate: Date;
        if (typeof p.match_date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(p.match_date)) {
          const [year, month, day] = p.match_date.split('-').map(Number);
          matchDate = new Date(year, month - 1, day);
        } else {
          matchDate = new Date(p.match_date);
        }

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

      const isFreePick = Array.isArray(p.tags) && p.tags.some((t: any) => 
        typeof t === 'string' && (t.toUpperCase().includes('FREE') || t.toUpperCase().includes('COMMUNITY'))
      );

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
        status: p.status || 'PENDING',
        tags: Array.isArray(p.tags) ? p.tags : [],
        bookingCode: p.booking_code || null,
        bookmaker: p.bookmaker || null,
        isProPick: !isFreePick, // If tagged as FREE TEASER/COMMUNITY, unlocked for all users!
        isFreePick: isFreePick,
        createdAt: p.created_at,
      };
    });

    // Fetch live matches from The Odds API so the dashboard always has active fixtures
    let liveMatches: any[] = [];
    try {
      const apiKey = process.env.THE_ODDS_API_KEY;
      if (apiKey) {
        const url = `https://api.the-odds-api.com/v4/sports/upcoming/odds/?apiKey=${apiKey}&regions=us,eu&markets=h2h&oddsFormat=decimal`;
        const res = await fetch(url, { next: { revalidate: 1800 } });
        if (res.ok) {
          const rawOdds = await res.json();
          if (Array.isArray(rawOdds)) {
            // Allowed leagues: PRD top-5 football + UEFA club comps + International & World Tournaments + Basketball
            const ALLOWED_SPORT_KEYS = new Set([
              // Top-5 European Football Leagues
              'soccer_epl',                         // Premier League
              'soccer_spain_la_liga',               // La Liga
              'soccer_italy_serie_a',               // Serie A
              'soccer_germany_bundesliga',          // Bundesliga
              'soccer_france_ligue_one',            // Ligue 1
              // UEFA Club Competitions
              'soccer_uefa_champs_league',          // Champions League
              'soccer_uefa_europa_league',          // Europa League
              'soccer_uefa_europa_conference_league', // Conference League
              // International & World Football
              'soccer_fifa_world_cup',              // FIFA World Cup
              'soccer_fifa_world_cup_winner',
              'soccer_fifa_world_cup_qualification',
              'soccer_fifa_club_world_cup',
              'soccer_uefa_nations_league',
              'soccer_uefa_european_championship',
              'soccer_uefa_euro_qualification',
              'soccer_conmebol_copa_america',
              'soccer_conmebol_copa_libertadores',
              'soccer_africa_cup_of_nations',
              // Basketball
              'basketball_nba',
              'basketball_wnba',
              'basketball_ncaab',
              'basketball_euroleague',
            ]);

            const now = new Date();
            const threeDaysOut = new Date();
            threeDaysOut.setDate(now.getDate() + 4); // Ensure full 3+ days ahead horizon

            const allowed = rawOdds.filter((m: any) => {
              if (!m || !m.id || !m.home_team || !m.away_team || !m.commence_time) return false; // Validate fixture integrity
              const matchDate = new Date(m.commence_time);
              if (matchDate > threeDaysOut) return false; // Keep within 3-day upcoming horizon

              const k = m.sport_key || '';
              return ALLOWED_SPORT_KEYS.has(k) || k.includes('fifa') || k.includes('world_cup') || k.includes('uefa') || k.includes('copa') || k.includes('nations');
            }).sort((a: any, b: any) => new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime()).slice(0, 50);

            liveMatches = allowed.map((m: any) => {
              let timeLabel = 'Upcoming';
              let dateLabel = 'Today';
              if (m.commence_time) {
                const dt = new Date(m.commence_time);
                timeLabel = dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' GMT';
                const today = new Date();
                const tomorrow = new Date();
                tomorrow.setDate(today.getDate() + 1);
                if (dt.toDateString() === today.toDateString()) {
                  dateLabel = 'Today';
                } else if (dt.toDateString() === tomorrow.toDateString()) {
                  dateLabel = 'Tomorrow';
                } else {
                  dateLabel = dt.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
                }
              }

              // Extract best pick from h2h bookmakers
              let pick = m.home_team + ' Win';
              let conf = 74;
              if (m.bookmakers && m.bookmakers[0] && m.bookmakers[0].markets && m.bookmakers[0].markets[0]) {
                const outcomes = m.bookmakers[0].markets[0].outcomes || [];
                if (outcomes.length >= 2) {
                  // Find lowest price (favorite)
                  const fav = outcomes.reduce((prev: any, curr: any) => (curr.price < prev.price ? curr : prev), outcomes[0]);
                  if (fav && fav.name) {
                    pick = fav.name === 'Draw' ? 'Draw' : `${fav.name} Win`;
                    if (fav.price) {
                      conf = Math.min(92, Math.max(65, Math.round((1 / fav.price) * 100 * 0.95)));
                    }
                  }
                }
              }

              return {
                id: m.id,
                homeTeam: m.home_team,
                awayTeam: m.away_team,
                league: m.sport_title || 'Global League',
                sport: (m.sport_key || '').includes('basketball') ? 'basketball' : 'football',
                date: dateLabel,
                time: timeLabel,
                prediction: pick,
                confidence: conf,
                analysis: `Strike-IQ quantitative odds engine detects market value and favorable implied probability for ${pick}.`,
                status: 'PENDING',
                tags: ['LIVE ODDS', 'AI QUANT VALUE'],
                isProPick: false, // Free pick from Odds API
                createdAt: m.commence_time || new Date().toISOString(),
              };
            });
          }
        }
      }
    } catch (oddsErr) {
      console.error('[FEED] Failed to fetch live odds:', oddsErr);
    }

    // Separate into proPicks (all admin picks) and matches (live Odds API fixtures).
    // The dashboard merges both arrays.
    return NextResponse.json({
      success: true,
      data: {
        proPicks: shaped,
        matches: liveMatches,
      },
    });
  } catch (error: any) {
    console.error('[FEED] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
