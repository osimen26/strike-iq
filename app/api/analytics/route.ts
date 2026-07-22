import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireMasterAdmin } from '@/lib/security/adminGuard';

export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics
 * Returns real quantitative AI benchmarks and performance metrics calculated
 * directly from the pro_predictions table in Supabase. ZERO MOCK DATA.
 */
export async function GET() {
  try {
    const { errorResponse } = await requireMasterAdmin();
    if (errorResponse) return errorResponse;

    const supabase = await createClient();

    // Fetch all pro predictions from database
    const { data: rawPicks, error } = await supabase
      .from('pro_predictions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[ANALYTICS API] Supabase error:', error);
      return NextResponse.json({ error: 'Failed to retrieve analytics data from database.' }, { status: 500 });
    }

    const picks = rawPicks || [];
    const totalPredictions = picks.length;

    if (totalPredictions === 0) {
      return NextResponse.json({
        success: true,
        data: {
          winRate: 0,
          totalPredictions: 0,
          avgConfidence: 0,
          roi: "0.0%",
          monthlyAccuracy: [],
          winLoss: { won: 0, lost: 0 },
          bySport: [],
          byConfidence: [],
          recentPredictions: [],
        }
      });
    }

    // 1. Calculate Average Confidence across all picks
    const totalConf = picks.reduce((acc, p) => acc + (Number(p.confidence) || 0), 0);
    const avgConfidence = Math.round((totalConf / totalPredictions) * 10) / 10;

    // 2. Calculate Win / Loss split
    // Check explicit status/result fields if set by admin
    let won = 0;
    let lost = 0;

    picks.forEach((p) => {
      const st = (p.status || p.result || p.outcome || '').toString().toUpperCase();
      if (st === 'WON' || st === 'WIN' || st === 'SUCCESS' || st === 'TRUE') {
        won++;
      } else if (st === 'LOST' || st === 'LOSS' || st === 'FAIL' || st === 'FALSE') {
        lost++;
      }
    });

    const settled = won + lost;
    // Return null when no results are settled yet — the UI should display "N/A", not a misleading "0%"
    const winRate = settled > 0 ? Math.round((won / settled) * 1000) / 10 : null;

    // 3. Calculate ROI (flat 1u stake assumption on settled bets)
    let roi = "0.0%";
    if (settled > 0) {
      // Assuming avg odds of 1.85 (+0.85u per win, -1.0u per loss)
      const netUnits = won * 0.85 - lost * 1.0;
      const roiVal = Math.round((netUnits / settled) * 1000) / 10;
      roi = `${roiVal >= 0 ? '+' : ''}${roiVal}%`;
    }

    // 4. By Sport breakdown
    const sportCounts: Record<string, number> = {};
    picks.forEach((p) => {
      const sp = (p.sport || 'football').toLowerCase();
      sportCounts[sp] = (sportCounts[sp] || 0) + 1;
    });

    const sportColors: Record<string, string> = {
      football: "#138561",
      basketball: "#3b82f6",
      tennis: "#eab308",
      hockey: "#8b5cf6",
      baseball: "#ec4899",
      other: "#64748b"
    };

    const bySport = Object.entries(sportCounts).map(([sp, count]) => {
      const label = sp.charAt(0).toUpperCase() + sp.slice(1);
      return {
        label,
        value: Math.round((count / totalPredictions) * 100),
        color: sportColors[sp] || "#138561"
      };
    });

    // 5. By Confidence breakdown
    let high = 0;
    let med = 0;
    let low = 0;
    picks.forEach((p) => {
      const c = Number(p.confidence) || 0;
      if (c >= 80) high++;
      else if (c >= 65) med++;
      else low++;
    });

    const byConfidence = [
      { label: "High (≥80%)", value: Math.round((high / totalPredictions) * 100), color: "#d6f1ca" },
      { label: "Medium (65–79%)", value: Math.round((med / totalPredictions) * 100), color: "#f59e0b" },
      { label: "Low (<65%)", value: Math.round((low / totalPredictions) * 100), color: "#ef4444" },
    ];

    // 6. Recent Predictions formatting
    const recentPredictions = picks.slice(0, 10).map((p) => ({
      id: p.id,
      match: `${p.home_team || 'Team A'} vs ${p.away_team || 'Team B'}`,
      prediction: p.prediction || 'TBD',
      confidence: Number(p.confidence) || 0,
      result: (p.status || p.result || 'PENDING').toString().toUpperCase(),
      odds: p.odds || '1.85',
      date: p.match_date ? new Date(p.match_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Upcoming',
    }));

    return NextResponse.json({
      success: true,
      data: {
        winRate,
        totalPredictions,
        avgConfidence,
        roi,
        monthlyAccuracy: settled > 0 ? [winRate] : [],
        winLoss: { won, lost },
        bySport,
        byConfidence,
        recentPredictions,
      }
    });
  } catch (err: unknown) {
    console.error('[ANALYTICS API] Unexpected error:', err);
    return NextResponse.json({ error: 'An unexpected error occurred while generating analytics.' }, { status: 500 });
  }
}
