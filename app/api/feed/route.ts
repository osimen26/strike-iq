import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rateLimit';

export const dynamic = 'force-dynamic';

/**
 * GET /api/feed
 * Returns published Pro Picks from the pro_predictions table.
 * Uses both Prisma direct connection and Supabase anon client so queries are always fast, cache-immune, and never blocked.
 */
export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`feed:${ip}`, RATE_LIMITS.PUBLIC);
  if (!rl.success) return rateLimitResponse(rl);

  try {
    let picks: any[] = [];

    // Primary: fetch via direct Prisma connection (bypasses RLS & PostgREST cache)
    try {
      picks = await prisma.proPrediction.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (prismaErr) {
      console.error('[FEED] Prisma fetch fallback triggered:', prismaErr);
      // Fallback: fetch via Supabase anon client
      const supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
      );
      const { data: rawPicks, error } = await supabase
        .from('pro_predictions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[FEED] Supabase fetch error:', error);
      } else if (rawPicks) {
        picks = rawPicks;
      }
    }

    // Shape each row from the pro_predictions table into the format
    // the dashboard MatchCard component expects
    const shaped = picks.map((p: any) => {
      const matchDateStr = p.matchDate || p.match_date || null;
      const matchTimeStr = p.matchTime || p.match_time || '';
      const homeTeam = p.homeTeam || p.home_team || 'Home Team';
      const awayTeam = p.awayTeam || p.away_team || 'Away Team';
      const bookingCode = p.bookingCode || p.booking_code || null;
      const bookmaker = p.bookmaker || p.bookmaker || null;

      // Build a human-readable date/time label from matchDate + matchTime
      let dateLabel = 'TBD';
      let timeLabel = '';

      if (matchDateStr) {
        let matchDate: Date;
        if (typeof matchDateStr === 'string' && /^\d{4}-\d{2}-\d{2}/.test(matchDateStr)) {
          const [year, month, day] = matchDateStr.split('-').map(Number);
          matchDate = new Date(year, month - 1, day);
        } else {
          matchDate = new Date(matchDateStr);
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

      if (matchTimeStr) {
        // matchTime is stored as HH:MM (24h), display with GMT suffix
        timeLabel = `${matchTimeStr} GMT`;
      }

      const tagsList = Array.isArray(p.tags) ? p.tags : [];
      const isFreePick = tagsList.some((t: any) => 
        typeof t === 'string' && (
          t.toUpperCase().includes('FREE') || 
          t.toUpperCase().includes('COMMUNITY') || 
          t.toUpperCase().includes('TEASER') ||
          t.toUpperCase().includes('PUBLIC')
        )
      ) || (typeof p.league === 'string' && p.league.toUpperCase().includes('FREE'));

      return {
        id: p.id,
        homeTeam,
        awayTeam,
        league: p.league,
        sport: p.sport || 'football',
        date: dateLabel,
        time: timeLabel,
        prediction: p.prediction,
        confidence: p.confidence,
        analysis: p.analysis || '',
        status: p.status || 'PENDING',
        tags: tagsList,
        bookingCode,
        bookmaker,
        isProPick: !isFreePick, // If tagged as FREE TEASER/COMMUNITY, unlocked for all users!
        isFreePick: isFreePick,
        createdAt: p.createdAt || p.created_at,
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
