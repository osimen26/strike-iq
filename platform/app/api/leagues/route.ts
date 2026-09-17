import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rateLimit';

export const dynamic = 'force-dynamic';

import { COMPETITIONS } from '@/lib/competitions';

const DEFAULT_SPORTS = [
  { name: 'Football', slug: 'football' },
  { name: 'Basketball', slug: 'basketball' },
];

const DEFAULT_LEAGUES = COMPETITIONS.map(c => ({
  name: c.name,
  country: c.country,
  sportSlug: c.sport,
  logo: c.logo || '',
  tier: c.tier,
  providerKey: c.providerKey,
  priority: c.priority,
}));

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

    // Auto-seed missing sports and leagues
    const existingLeagueNames = new Set(leagues.map((l: any) => l.name));
    const missingLeagues = DEFAULT_LEAGUES.filter(l => !existingLeagueNames.has(l.name));

    if (missingLeagues.length > 0) {
      const sportMap: Record<string, string> = {};
      for (const s of DEFAULT_SPORTS) {
        const sport = await prisma.sport.upsert({
          where: { slug: s.slug },
          update: s,
          create: s,
        });
        sportMap[s.slug] = sport.id;
      }

      for (const l of missingLeagues) {
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
                tier: l.tier,
                providerKey: l.providerKey,
                priority: l.priority,
              } as any,
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
