import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rateLimit';

const API_KEY = process.env.THE_ODDS_API_KEY;

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`matches:${ip}`, RATE_LIMITS.PUBLIC);
  if (!rl.success) return rateLimitResponse(rl);

  const { searchParams } = new URL(request.url);
  const sport = searchParams.get('sport') || 'upcoming';
  
  if (!API_KEY) {
    return NextResponse.json({ 
      error: "API key is missing",
      message: "Please add THE_ODDS_API_KEY to your .env file."
    }, { status: 401 });
  }

  try {
    // The Odds API endpoint for upcoming matches across sports
    // We request 'upcoming' which gives the next 8 matches across multiple sports
    // We can also query specific sports like 'soccer_epl' or 'basketball_nba'
    const url = `https://api.the-odds-api.com/v4/sports/${sport}/odds/?apiKey=${API_KEY}&regions=us,eu&markets=h2h&oddsFormat=decimal`;

    const res = await fetch(url, {
      next: { revalidate: 3600 } // Cache for 1 hour to save API credits
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Failed to fetch from The Odds API');
    }

    const data = await res.json();
    
    // Allowed leagues: PRD top-5 + UEFA club comps + International & World Football + Basketball
    const ALLOWED_SPORT_KEYS = new Set([
      'soccer_epl',
      'soccer_spain_la_liga',
      'soccer_italy_serie_a',
      'soccer_germany_bundesliga',
      'soccer_france_ligue_one',
      'soccer_uefa_champs_league',
      'soccer_uefa_europa_league',
      'soccer_uefa_europa_conference_league',
      'soccer_fifa_world_cup',
      'soccer_fifa_world_cup_winner',
      'soccer_fifa_world_cup_qualification',
      'soccer_fifa_club_world_cup',
      'soccer_uefa_nations_league',
      'soccer_uefa_european_championship',
      'soccer_uefa_euro_qualification',
      'soccer_conmebol_copa_america',
      'soccer_conmebol_copa_libertadores',
      'soccer_africa_cup_of_nations',
      'basketball_nba',
      'basketball_wnba',
      'basketball_ncaab',
      'basketball_euroleague',
    ]);

    const now = new Date();
    const threeDaysOut = new Date();
    threeDaysOut.setDate(now.getDate() + 4);

    const filteredData = data.filter((match: any) => {
      if (!match || !match.id || !match.home_team || !match.away_team || !match.commence_time) return false;
      const matchDate = new Date(match.commence_time);
      if (matchDate > threeDaysOut) return false;

      const k = match.sport_key || '';
      return ALLOWED_SPORT_KEYS.has(k) || k.includes('fifa') || k.includes('world_cup') || k.includes('uefa') || k.includes('copa') || k.includes('nations');
    }).sort((a: any, b: any) => new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime()).slice(0, 50);
    
    return NextResponse.json({ success: true, data: filteredData });
  } catch (error) {
    console.error('[MATCHES] Odds API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
