import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OddsApiFixture } from "@/types";

export const dynamic = "force-dynamic";

const SPORT_KEY_TO_LEAGUE: Record<string, { leagueName: string; sportSlug: string }> = {
  'soccer_epl': { leagueName: 'Premier League', sportSlug: 'football' },
  'soccer_spain_la_liga': { leagueName: 'La Liga', sportSlug: 'football' },
  'soccer_italy_serie_a': { leagueName: 'Serie A', sportSlug: 'football' },
  'soccer_germany_bundesliga': { leagueName: 'Bundesliga', sportSlug: 'football' },
  'soccer_france_ligue_one': { leagueName: 'Ligue 1', sportSlug: 'football' },
  'soccer_uefa_champs_league': { leagueName: 'UEFA Champions League', sportSlug: 'football' },
  'soccer_uefa_europa_league': { leagueName: 'UEFA Europa League', sportSlug: 'football' },
  'basketball_nba': { leagueName: 'NBA', sportSlug: 'basketball' },
  'basketball_euroleague': { leagueName: 'EuroLeague', sportSlug: 'basketball' },
};

/**
 * GET /api/cron/sync-matches
 * Automated Cron Job to fetch upcoming odds for SPECIFIC leagues and upsert them into the database.
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Optional auth for testing manually, but required for Vercel Cron
    if (cronSecret && authHeader !== `Bearer ${cronSecret}` && !request.url.includes("localhost")) {
      console.warn("[SYNC_MATCHES] Unauthorized cron execution attempt blocked.");
      return NextResponse.json({ error: "Unauthorized cron execution." }, { status: 401 });
    }

    const apiKey = process.env.THE_ODDS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key missing" }, { status: 500 });
    }

    let syncedCount = 0;

    // Loop through each allowed sport key and fetch specifically, to avoid pagination/truncation issues
    for (const [sportKey, mapping] of Object.entries(SPORT_KEY_TO_LEAGUE)) {
      console.log(`[SYNC_MATCHES] Fetching odds for ${sportKey}...`);
      const url = `https://api.the-odds-api.com/v4/sports/${sportKey}/odds/?apiKey=${apiKey}&regions=us,eu&markets=h2h&oddsFormat=decimal`;
      
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`[SYNC_MATCHES] Failed to fetch ${sportKey}: ${res.statusText}`);
        continue;
      }

      const rawOdds: OddsApiFixture[] = await res.json();
      
      // Ensure Sport and League exist in DB before adding matches
      const sport = await prisma.sport.findUnique({ where: { slug: mapping.sportSlug } });
      let league = await prisma.league.findFirst({ where: { name: mapping.leagueName } });
      
      if (!sport || !league) {
        console.warn(`[SYNC_MATCHES] Skipping ${sportKey}, sport or league missing in DB.`);
        continue;
      }

      const now = new Date();
      const threeDaysOut = new Date();
      threeDaysOut.setDate(now.getDate() + 4);

      for (const m of rawOdds) {
        if (!m.id || !m.home_team || !m.away_team || !m.commence_time) continue;
        
        const matchDate = new Date(m.commence_time);
        if (matchDate > threeDaysOut) continue; // Keep within 3-day horizon

        // Upsert Home Team
        const homeTeam = await prisma.team.upsert({
          where: { id: `team_${sportKey}_${m.home_team.replace(/\s+/g, '_')}` },
          create: {
            id: `team_${sportKey}_${m.home_team.replace(/\s+/g, '_')}`,
            name: m.home_team,
          },
          update: { name: m.home_team },
        });

        // Upsert Away Team
        const awayTeam = await prisma.team.upsert({
          where: { id: `team_${sportKey}_${m.away_team.replace(/\s+/g, '_')}` },
          create: {
            id: `team_${sportKey}_${m.away_team.replace(/\s+/g, '_')}`,
            name: m.away_team,
          },
          update: { name: m.away_team },
        });

        // Upsert Match
        await prisma.match.upsert({
          where: { externalId: m.id },
          create: {
            externalId: m.id,
            sportId: sport.id,
            leagueId: league.id,
            homeTeamId: homeTeam.id,
            awayTeamId: awayTeam.id,
            matchDate: matchDate,
            status: "SCHEDULED",
          },
          update: {
            matchDate: matchDate,
          },
        });
        
        syncedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Sync completed successfully.",
      syncedMatches: syncedCount,
    });

  } catch (error: any) {
    console.error("[SYNC_MATCHES] Fatal error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
