import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { sanitizePayload, sanitizeNumber, isValidId } from '@/lib/security/validator';
import { requireMasterAdmin, logAdminAudit } from '@/lib/security/adminGuard';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, errorResponse } = await requireMasterAdmin();
    if (errorResponse) return errorResponse;

    const supabase = await createClient();
    const { id } = await params;
    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid ID parameter" }, { status: 400 });
    }

    logAdminAudit("DELETE_PRO_PREDICTION", { predictionId: id });

    const { error } = await supabase
      .from('pro_predictions')
      .delete()
      .eq('id', id);

    if (error) {
      await prisma.proPrediction.delete({ where: { id } }).catch(() => null);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, errorResponse } = await requireMasterAdmin();
    if (errorResponse) return errorResponse;

    const supabase = await createClient();
    const rawBody = await request.json();
    const body = sanitizePayload(rawBody);
    const { id } = await params;

    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid ID parameter" }, { status: 400 });
    }

    logAdminAudit("UPDATE_PRO_PREDICTION", { predictionId: id, match: `${body.homeTeam} vs ${body.awayTeam}` });

    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE pro_predictions ADD COLUMN IF NOT EXISTS booking_code TEXT`);
      await prisma.$executeRawUnsafe(`ALTER TABLE pro_predictions ADD COLUMN IF NOT EXISTS bookmaker TEXT`);
      await prisma.$executeRawUnsafe(`ALTER TABLE pro_predictions ADD COLUMN IF NOT EXISTS created_by TEXT`);
      await prisma.$executeRawUnsafe(`NOTIFY pgrst, 'reload schema'`);
    } catch (migErr) {
      console.warn("Schema check/reload notice:", migErr);
    }

    let updatedData: any = null;
    const { data: sbData, error: sbError } = await supabase
      .from('pro_predictions')
      .update({
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
        status: body.status || "PENDING",
        tags: Array.isArray(body.tags) ? body.tags.map((t: any) => String(t).slice(0, 50)) : []
      })
      .eq('id', id)
      .select();

    if (sbError || !sbData) {
      console.warn("Supabase update fallback to Prisma due to error:", sbError);
      const updated = await prisma.proPrediction.update({
        where: { id },
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
          status: body.status || "PENDING",
          tags: Array.isArray(body.tags) ? body.tags.map((t: any) => String(t).slice(0, 50)) : []
        }
      });
      updatedData = [updated];
    } else {
      updatedData = sbData;
    }

    return NextResponse.json({ success: true, data: updatedData });
  } catch (error: any) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
