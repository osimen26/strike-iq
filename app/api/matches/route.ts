import { NextResponse } from 'next/server';

const API_KEY = process.env.THE_ODDS_API_KEY;

export async function GET(request: Request) {
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
    
    // Only show Football matches for the 5 Leagues and the World Cup, plus Basketball
    const ALLOWED_LEAGUES = [
      'soccer_epl', 'soccer_spain_la_liga', 'soccer_italy_serie_a', 
      'soccer_germany_bundesliga', 'soccer_france_ligue_one',
      'soccer_fifa_world_cup',
      'basketball_nba', 'basketball_wnba', 'basketball_ncaab', 'basketball_euroleague'
    ];
    
    const filteredData = data.filter((match: any) => ALLOWED_LEAGUES.includes(match.sport_key));
    
    return NextResponse.json({ success: true, data: filteredData });
  } catch (error: any) {
    console.error("Odds API Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
