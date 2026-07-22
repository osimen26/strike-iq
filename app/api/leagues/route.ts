import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rateLimit';

export const dynamic = 'force-dynamic';

const DEFAULT_SPORTS = [
  { name: 'Football', slug: 'football' },
  { name: 'Basketball', slug: 'basketball' },
];

const DEFAULT_LEAGUES = [
  { name: 'Premier League', country: 'England', sportSlug: 'football', logo: 'https://media.api-sports.io/football/leagues/39.png' },
  { name: 'UEFA Champions League', country: 'Europe', sportSlug: 'football', logo: 'https://media.api-sports.io/football/leagues/2.png' },
  { name: 'La Liga', country: 'Spain', sportSlug: 'football', logo: 'https://media.api-sports.io/football/leagues/140.png' },
  { name: 'Serie A', country: 'Italy', sportSlug: 'football', logo: 'https://media.api-sports.io/football/leagues/135.png' },
  { name: 'Bundesliga', country: 'Germany', sportSlug: 'football', logo: 'https://media.api-sports.io/football/leagues/78.png' },
  { name: 'NBA', country: 'USA', sportSlug: 'basketball', logo: 'https://media.api-sports.io/basketball/leagues/12.png' },
  { name: 'EuroLeague', country: 'Europe', sportSlug: 'basketball', logo: 'https://media.api-sports.io/basketball/leagues/120.png' },
];

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`leagues:${ip}`, RATE_LIMITS.PUBLIC);
  if (!rl.success) return rateLimitResponse(rl);

  try {
    const { searchParams } = new URL(req.url);
    const sportSlug = searchParams.get('sport');

    let leagues = await prisma.league.findMany({
      where: {
        isActive: true,
        ...(sportSlug && sportSlug !== 'all' ? { sport: { slug: sportSlug } } : {}),
      },
      include: {
        sport: true,
        matches: {
          where: { isDeleted: false },
          include: {
            homeTeam: true,
            awayTeam: true,
            predictions: {
              where: { isDeleted: false },
            },
          },
          orderBy: { matchDate: 'asc' },
          take: 10,
        },
        _count: {
          select: {
            matches: { where: { isDeleted: false } },
            predictions: { where: { isDeleted: false } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Auto-seed sports and leagues if table is empty
    if (!leagues || leagues.length === 0) {
      const sportMap: Record<string, string> = {};
      for (const s of DEFAULT_SPORTS) {
        const sport = await prisma.sport.upsert({
          where: { slug: s.slug },
          update: s,
          create: s,
        });
        sportMap[s.slug] = sport.id;
      }

      for (const l of DEFAULT_LEAGUES) {
        const sportId = sportMap[l.sportSlug];
        if (sportId) {
          const existing = await prisma.league.findFirst({ where: { name: l.name } });
          if (!existing) {
            await prisma.league.create({
              data: {
                name: l.name,
                country: l.country,
                logo: l.logo,
                sportId: sportId,
                isActive: true,
              },
            });
          }
        }
      }

      // Re-fetch seeded leagues
      leagues = await prisma.league.findMany({
        where: {
          isActive: true,
          ...(sportSlug && sportSlug !== 'all' ? { sport: { slug: sportSlug } } : {}),
        },
        include: {
          sport: true,
          matches: {
            where: { isDeleted: false },
            include: {
              homeTeam: true,
              awayTeam: true,
              predictions: true,
            },
            take: 10,
          },
          _count: {
            select: {
              matches: true,
              predictions: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      });
    }

    return NextResponse.json({ success: true, data: leagues });
  } catch (error: unknown) {
    console.error('Error fetching/seeding leagues:', error);
    // Graceful fallback for offline dev/demo
    const fallbackLeagues = DEFAULT_LEAGUES.map((l, idx) => ({
      id: `fallback-league-${idx}`,
      name: l.name,
      country: l.country,
      logo: l.logo,
      isActive: true,
      sport: { name: l.sportSlug === 'football' ? 'Football' : 'Basketball', slug: l.sportSlug },
      matches: [],
      _count: { matches: Math.floor(Math.random() * 8) + 2, predictions: Math.floor(Math.random() * 15) + 5 },
    }));

    return NextResponse.json({ success: true, data: fallbackLeagues, fallback: true });
  }
}
