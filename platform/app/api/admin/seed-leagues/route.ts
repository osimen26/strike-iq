import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireMasterAdmin } from '@/lib/security/adminGuard';

export const dynamic = 'force-dynamic';

const SPORTS = [
  { name: 'Football', slug: 'football' },
  { name: 'Basketball', slug: 'basketball' },
];

const LEAGUES = [
  { name: 'Premier League',       country: 'England', sportSlug: 'football',   logo: 'https://media.api-sports.io/football/leagues/39.png' },
  { name: 'Championship',         country: 'England', sportSlug: 'football',   logo: 'https://media.api-sports.io/football/leagues/40.png' },
  { name: 'UEFA Champions League',country: 'Europe',  sportSlug: 'football',   logo: 'https://media.api-sports.io/football/leagues/2.png' },
  { name: 'La Liga',              country: 'Spain',   sportSlug: 'football',   logo: 'https://media.api-sports.io/football/leagues/140.png' },
  { name: 'Serie A',              country: 'Italy',   sportSlug: 'football',   logo: 'https://media.api-sports.io/football/leagues/135.png' },
  { name: 'Bundesliga',           country: 'Germany', sportSlug: 'football',   logo: 'https://media.api-sports.io/football/leagues/78.png' },
  { name: 'Ligue 1',              country: 'France',  sportSlug: 'football',   logo: 'https://media.api-sports.io/football/leagues/61.png' },
  { name: 'Süper Lig',            country: 'Turkey',  sportSlug: 'football',   logo: 'https://media.api-sports.io/football/leagues/203.png' },
  { name: 'NBA',                  country: 'USA',     sportSlug: 'basketball', logo: 'https://media.api-sports.io/basketball/leagues/12.png' },
  { name: 'EuroLeague',           country: 'Europe',  sportSlug: 'basketball', logo: 'https://media.api-sports.io/basketball/leagues/120.png' },
];

export async function GET() {
  const { errorResponse } = await requireMasterAdmin();
  if (errorResponse) return errorResponse;

  try {
    const sportMap: Record<string, string> = {};

    // Upsert sports first
    for (const s of SPORTS) {
      const sport = await prisma.sport.upsert({
        where: { slug: s.slug },
        update: { name: s.name },
        create: { name: s.name, slug: s.slug, isActive: true },
      });
      sportMap[s.slug] = sport.id;
    }

    const results: { name: string; action: string }[] = [];

    // Insert or skip each league
    for (const l of LEAGUES) {
      const sportId = sportMap[l.sportSlug];
      if (!sportId) continue;

      const existing = await prisma.league.findFirst({ where: { name: l.name } });
      if (existing) {
        // Ensure it is active and logo is up to date
        await prisma.league.update({
          where: { id: existing.id },
          data: { isActive: true, logo: l.logo, country: l.country },
        });
        results.push({ name: l.name, action: 'updated' });
      } else {
        await prisma.league.create({
          data: {
            name: l.name,
            country: l.country,
            logo: l.logo,
            sportId,
            isActive: true,
          },
        });
        results.push({ name: l.name, action: 'created' });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[SEED-LEAGUES]', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
