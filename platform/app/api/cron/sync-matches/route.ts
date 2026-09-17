import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OddsApiFixture } from "@/types";

export const dynamic = "force-dynamic";

import { getSyncEnabledCompetitions } from "@/lib/competitions";

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

    const syncComps = getSyncEnabledCompetitions();

    // Loop through each allowed sport key and fetch specifically, to avoid pagination/truncation issues
    for (const comp of syncComps) {
      const sportKey = comp.providerKey;
      console.log(`[SYNC_MATCHES] Fetching odds for ${sportKey}...`);
      const url = `https://api.the-odds-api.com/v4/sports/${sportKey}/odds/?apiKey=${apiKey}&regions=us,eu&markets=h2h&oddsFormat=decimal`;
      
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`[SYNC_MATCHES] Failed to fetch ${sportKey}: ${res.statusText}`);
        continue;
      }

      const rawOdds: OddsApiFixture[] = await res.json();
      
      // Ensure Sport and League exist in DB before adding matches
      const sport = await prisma.sport.findUnique({ where: { slug: comp.sport } });
      let league = await prisma.league.findFirst({ where: { name: comp.name } });
      
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
