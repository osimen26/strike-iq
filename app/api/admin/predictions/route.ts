import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { sanitizePayload, sanitizeNumber } from '@/lib/security/validator';
import { requireMasterAdmin, logAdminAudit } from '@/lib/security/adminGuard';
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rateLimit';

export async function POST(request: Request) {
  // Rate limit: 20 admin writes per minute per IP
  const ip = getClientIp(request);
  const rl = checkRateLimit(`admin-predict-write:${ip}`, RATE_LIMITS.ADMIN_WRITE);
  if (!rl.success) return rateLimitResponse(rl);

  try {
    const { user, errorResponse } = await requireMasterAdmin();
    if (errorResponse) return errorResponse;

    const supabase = await createClient();
    const rawBody = await request.json();
    const body = sanitizePayload(rawBody);

    // Log security audit
    logAdminAudit("CREATE_PRO_PREDICTION", { match: `${body.homeTeam} vs ${body.awayTeam}`, league: body.league });

    // Ensure proper tier tags are attached so the feed knows whether it is Free vs Pro
    const tagsArray = Array.isArray(body.tags) ? body.tags.map((t: any) => String(t).slice(0, 50)) : [];
    const isFreeTier = body.tier === 'FREE' || tagsArray.some((t: string) => t.toUpperCase().includes('FREE'));
    if (isFreeTier && !tagsArray.some((t: string) => t.toUpperCase().includes('FREE'))) {
      tagsArray.unshift('FREE TEASER');
    }

    // Auto-migrate schema & refresh PostgREST schema cache to guarantee booking_code column exists
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE pro_predictions ADD COLUMN IF NOT EXISTS booking_code TEXT`);
      await prisma.$executeRawUnsafe(`ALTER TABLE pro_predictions ADD COLUMN IF NOT EXISTS bookmaker TEXT`);
      await prisma.$executeRawUnsafe(`ALTER TABLE pro_predictions ADD COLUMN IF NOT EXISTS created_by TEXT`);
      await prisma.$executeRawUnsafe(`NOTIFY pgrst, 'reload schema'`);
    } catch (migErr) {
      console.warn("Schema check/reload notice:", migErr);
    }

    // 1. Insert the Pro Prediction with sanitized fields
    let insertedData: any = null;
    const { data: sbData, error: sbError } = await supabase
      .from('pro_predictions')
      .insert([
        {
          home_team: body.homeTeam,
          away_team: body.awayTeam,
          league: body.league,
          sport: body.sport,
          match_date: body.matchDate,
          match_time: body.matchTime,
          prediction: body.prediction,
          confidence: sanitizeNumber(body.confidence, 0, 100, 75),
          analysis: body.analysis,
          booking_code: body.bookingCode || null,
          bookmaker: body.bookmaker || null,
          tags: tagsArray,
          created_by: user.id
        }
      ])
      .select();

    if (sbError || !sbData) {
      console.warn("Supabase insert fallback to Prisma due to error:", sbError);
      const created = await prisma.proPrediction.create({
        data: {
          homeTeam: body.homeTeam,
          awayTeam: body.awayTeam,
          league: body.league,
          sport: body.sport,
          matchDate: body.matchDate,
          matchTime: body.matchTime,
          prediction: body.prediction,
          confidence: sanitizeNumber(body.confidence, 0, 100, 75),
          analysis: body.analysis,
          bookingCode: body.bookingCode || null,
          bookmaker: body.bookmaker || null,
          tags: tagsArray,
          createdBy: user.id
        }
      });
      insertedData = [created];
    } else {
      insertedData = sbData;
    }

    // 2. Fetch all user IDs and subscriptions to send targeted notifications (if enabled)
    if (body.notifyUsers !== false) {
      const [{ data: allUsers }, { data: activeSubs }] = await Promise.all([
        supabase.from('user').select('id'),
        supabase.from('subscriptions').select('userId').in('status', ['ACTIVE', 'TRIAL'])
      ]);

      const proUserIds = new Set((activeSubs || []).map((s: any) => s.userId));

      if (allUsers && allUsers.length > 0) {
        const notifications = allUsers.map((u: { id: string }) => {
          const isUserPro = proUserIds.has(u.id);

          let title = '';
          let message = '';

          if (isFreeTier) {
            // Free Tier Drop: Notify everyone equally
            title = body.bookingCode 
              ? `🎁 Free Daily Betting Code Dropped: ${body.bookmaker || 'Betting Slip'}` 
              : `🎁 Free Pick Dropped: ${body.homeTeam} vs ${body.awayTeam}`;
            message = body.bookingCode 
              ? `${body.bookmaker || 'Betting'} Code: ${body.bookingCode} (${body.confidence}% confidence). Copy your free daily slip now on the dashboard!` 
              : `${body.league} · ${body.prediction} (${body.confidence}% confidence). Check out your free community pick now!`;
          } else {
            // VIP Pro Tier Drop: Pro users get direct details/code, Free users get FOMO teaser
            if (isUserPro) {
              title = body.bookingCode 
                ? `👑 VIP Pro Code Dropped: ${body.bookmaker || 'Betting'} (${body.bookingCode})` 
                : `👑 VIP Pro Game Dropped: ${body.homeTeam} vs ${body.awayTeam}`;
              message = body.bookingCode 
                ? `${body.bookmaker || 'Betting'} Code: ${body.bookingCode} — ${body.confidence}% confidence. Load your VIP slip now on the dashboard!` 
                : `${body.league} · ${body.prediction} (${body.confidence}% confidence). Check out your exclusive Pro verdict now!`;
            } else {
              title = body.bookingCode 
                ? `🔒 New VIP Pro Code Dropped (${body.bookmaker || 'Betting Slip'})` 
                : `🔒 New VIP Pro Game Dropped: ${body.homeTeam} vs ${body.awayTeam}`;
              message = body.bookingCode 
                ? `Our AI just released a high-confidence (${body.confidence}%) VIP booking code on ${body.bookmaker || 'SportyBet'}. Upgrade to Pro to copy & play today's winning slip!` 
                : `Our quantitative models flagged a ${body.confidence}% confidence VIP edge on ${body.homeTeam} vs ${body.awayTeam}. Upgrade to Pro to unlock the verdict!`;
            }
          }

          return {
            userId: u.id,
            title,
            message,
            type: 'PREDICTION_ALERT',
            isRead: false,
            link: isFreeTier || isUserPro ? '/dashboard' : '/dashboard/subscription',
            createdAt: new Date().toISOString(),
          };
        });

        const { error: notifError } = await supabase
          .from('notifications')
          .insert(notifications);

        if (notifError) {
          console.error("Notification insert error:", notifError);
          // Don't fail the whole request — prediction was saved successfully
        }
      }
    }

    return NextResponse.json({ success: true, data: insertedData });

  } catch (error: any) {
    console.error("Pro Prediction API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  // Rate limit: 60 admin reads per minute per IP
  const ip = getClientIp(request);
  const rl = checkRateLimit(`admin-predict-read:${ip}`, RATE_LIMITS.ADMIN_READ);
  if (!rl.success) return rateLimitResponse(rl);

  try {
    const { errorResponse } = await requireMasterAdmin();
    if (errorResponse) return errorResponse;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('pro_predictions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(25);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data: data || [] });
  } catch (err: any) {
    console.error('[GET /api/admin/predictions]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

