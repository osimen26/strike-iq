import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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

    if (error) throw error;

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

    const { data, error } = await supabase
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
        tags: Array.isArray(body.tags) ? body.tags.map((t: any) => String(t).slice(0, 50)) : []
      })
      .eq('id', id)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
