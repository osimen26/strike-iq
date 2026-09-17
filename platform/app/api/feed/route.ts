import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rateLimit';
import { MatchItem, OddsApiFixture, MatchOutcome } from '@/types';

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
    let picks: Record<string, unknown>[] = [];

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
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
    interface RawPredictionRow {
      id?: string | number;
      homeTeam?: string;
      home_team?: string;
      awayTeam?: string;
      away_team?: string;
      league?: string;
      sport?: string;
      matchDate?: string | Date | null;
      match_date?: string | Date | null;
      matchTime?: string | null;
      match_time?: string | null;
      prediction?: string;
      confidence?: number | string | null;
      analysis?: string | null;
      status?: string;
      tags?: string[] | unknown;
      bookingCode?: string | null;
      booking_code?: string | null;
      bookmaker?: string | null;
      createdAt?: string | Date | null;
      created_at?: string | Date | null;
    }
    const shaped: MatchItem[] = (picks as RawPredictionRow[]).map((p: RawPredictionRow): MatchItem => {
      const matchDateStr = p.matchDate || p.match_date || null;
      const matchTimeStr = p.matchTime || p.match_time || '';
      const homeTeam = String(p.homeTeam || p.home_team || 'Home Team');
      const awayTeam = String(p.awayTeam || p.away_team || 'Away Team');
      const bookingCode = p.bookingCode || p.booking_code ? String(p.bookingCode || p.booking_code) : null;
      const bookmaker = p.bookmaker ? String(p.bookmaker) : null;

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

      const tagsList = Array.isArray(p.tags) ? (p.tags as string[]) : [];
      const isFreePick = tagsList.some((t: string) => 
        typeof t === 'string' && (
          t.toUpperCase().includes('FREE') || 
          t.toUpperCase().includes('COMMUNITY') || 
          t.toUpperCase().includes('TEASER') ||
          t.toUpperCase().includes('PUBLIC')
        )
      ) || (typeof p.league === 'string' && p.league.toUpperCase().includes('FREE'));

      return {
        id: String(p.id || ''),
        homeTeam,
        awayTeam,
        league: String(p.league || 'League'),
        sport: String(p.sport || 'football'),
        date: dateLabel,
        time: timeLabel,
        prediction: p.prediction ? String(p.prediction) : undefined,
        confidence: p.confidence !== undefined && p.confidence !== null ? Number(p.confidence) : undefined,
        analysis: p.analysis ? String(p.analysis) : '',
        status: p.status ? String(p.status) : 'PENDING',
        tags: tagsList,
        bookingCode,
        bookmaker,
        isProPick: !isFreePick, // If tagged as FREE TEASER/COMMUNITY, unlocked for all users!
        isFreePick: isFreePick,
        createdAt: p.createdAt ? String(p.createdAt) : (p.created_at ? String(p.created_at) : undefined),
      };
    });

    // Fetch live matches from local database (synced by cron job)
    let liveMatches: MatchItem[] = [];
    try {
      const dbMatches = await prisma.match.findMany({
        where: {
          isDeleted: false,
          matchDate: {
            gte: new Date(new Date().setHours(0,0,0,0)), // Today onwards
            lte: new Date(new Date().setDate(new Date().getDate() + 3)) // Next 3 days
          }
        },
        include: {
          homeTeam: true,
          awayTeam: true,
          league: { include: { sport: true } },
          predictions: {
            where: { isDeleted: false, status: 'PUBLISHED' },
            include: { explanation: true }
          }
        },
        orderBy: { matchDate: 'asc' },
        take: 30
      });

      liveMatches = dbMatches.map((m: any) => {
        let timeLabel = 'Upcoming';
        let dateLabel = 'Today';
        if (m.matchDate) {
          const dt = new Date(m.matchDate);
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

        const topPrediction = m.predictions[0];

          const isProLeague = m.league.tier === 'pro';
          const isPremiumPrediction = topPrediction?.isPremium || false;
          const isProPick = isProLeague || isPremiumPrediction;
          
          let tags = ['LIVE ODDS'];
          if (isProLeague) tags.push('PRO LEAGUE');
          if (isPremiumPrediction) tags.push('VIP PRO', 'AI SIGNAL');
          if (!isProPick) tags.push('FREE PICKS');

          return {
            id: m.id,
            homeTeam: m.homeTeam.name,
            awayTeam: m.awayTeam.name,
            league: m.league.name,
            sport: m.league.sport.slug,
            date: dateLabel,
            time: timeLabel,
            prediction: topPrediction?.selection || 'Pending AI Analysis',
            confidence: topPrediction?.confidence || undefined,
            analysis: topPrediction?.explanation?.content || 'AI analysis is currently processing for this fixture.',
            status: m.status,
            tags,
            isProPick,
            isFreePick: !isProPick,
            createdAt: m.createdAt.toISOString(),
          };
      });
    } catch (dbErr) {
      console.error('[FEED] Failed to fetch live matches from DB:', dbErr);
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
  } catch (error: unknown) {
    console.error('[FEED] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
