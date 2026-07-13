"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// ─── Pure SVG Line / Area Chart ─────────────────────────────────────────────
function AreaChart({ data, color = "#138561" }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const w = 400; const h = 120; const pad = 10;
  const pts = data.map((v, i) => ({
    x: pad + (i / (data.length - 1)) * (w - pad * 2),
    y: h - pad - ((v - min) / (max - min || 1)) * (h - pad * 2),
  }));
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${h - pad} L ${pts[0].x} ${h - pad} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#areaGrad)" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} stroke="#111" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

// ─── Donut Chart ─────────────────────────────────────────────────────────────
function DonutChart({ won, lost }: { won: number; lost: number }) {
  const total = won + lost || 1;
  const winPct = (won / total) * 100;
  const r = 40; const cx = 60; const cy = 60;
  const circ = 2 * Math.PI * r;
  const wonDash = (winPct / 100) * circ;
  return (
    <svg viewBox="0 0 120 120" className="w-32 h-32">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1f2937" strokeWidth="14" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ef4444" strokeWidth="14"
        strokeDasharray={`${circ - wonDash} ${wonDash}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#138561" strokeWidth="14"
        strokeDasharray={`${wonDash} ${circ - wonDash}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cy - 4} textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">{Math.round(winPct)}%</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#6b7280" fontSize="8">Win Rate</text>
    </svg>
  );
}

// ─── Horizontal Bar Chart ────────────────────────────────────────────────────
function BarChart({ data }: { data: { label: string; value: number; color?: string }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={i} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-300 font-medium">{d.label}</span>
            <span className="font-mono text-white font-bold">{d.value}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#18181c] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(d.value / max) * 100}%`,
                backgroundColor: d.color || "#138561",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Initial Empty State ────────────────────────────────────────────────────────
const EMPTY_ANALYTICS = {
  winRate: 0,
  totalPredictions: 0,
  avgConfidence: 0,
  roi: "0.0%",
  monthlyAccuracy: [],
  winLoss: { won: 0, lost: 0 },
  bySport: [],
  byConfidence: [],
  recentPredictions: [],
};

// ─── Main Analytics Page ──────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [data, setData] = useState<any>(EMPTY_ANALYTICS);
  const [proPicks, setProPicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("pro_predictions")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data: picks }) => {
        if (picks) {
          setProPicks(picks);
        }
      });

    // Fetch live quantitative benchmarks from database
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          setData(res.data);
        }
      })
      .catch((err) => {
        console.error("Failed to load analytics:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const won = data.winLoss?.won || 0;
  const lost = data.winLoss?.lost || 0;
  const total = data.totalPredictions || proPicks.length || 0;
  const padded = data.monthlyAccuracy && data.monthlyAccuracy.length > 0 ? data.monthlyAccuracy : [data.winRate || 0];

  const leagueCounts: Record<string, number> = {};
  proPicks.forEach((p) => {
    const lg = p.league || "Other";
    leagueCounts[lg] = (leagueCounts[lg] || 0) + 1;
  });
  const topLeagues: [string, number][] = Object.entries(leagueCounts).sort((a, b) => b[1] - a[1]);

  const kpis = [
    { label: "Overall Win Rate", value: `${data.winRate}%`, sub: "Last 30 days", icon: "🎯", color: "text-[#138561]" },
    { label: "Total Pro Predictions", value: data.totalPredictions.toLocaleString(), sub: "Verified & settled", icon: "📊", color: "text-blue-400" },
    { label: "Avg AI Confidence", value: `${data.avgConfidence}%`, sub: "Per prediction", icon: "📈", color: "text-[#138561]" },
    { label: "Net Yield ROI", value: data.roi, sub: "Flat 1U stake", icon: "💰", color: "text-amber-400" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-white/10 border-t-[#138561] rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 text-sm animate-pulse">Loading Analytics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-zinc-900 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#138561]/20 border border-[#138561]/40 mb-3 shadow-[0_0_15px_rgba(19,133,97,0.15)]">
            <span className="w-2 h-2 rounded-full bg-[#138561] animate-pulse"></span>
            <span className="text-xs font-mono font-bold text-[#138561] uppercase tracking-widest">VERIFIED MODEL METRICS</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white font-heading tracking-tight uppercase">STRIKE-IQ QUANTITATIVE AI BENCHMARKS</h1>
          <p className="text-zinc-400 mt-1.5 font-mono text-sm">Real-time quantitative audit of our algorithmic track record, ROI, and prediction accuracy across all markets.</p>
        </div>
        {/* Trust badge */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#138561]/10 border border-[#138561]/30 shrink-0 shadow-sm">
          <span className="text-2xl">🏆</span>
          <div>
            <p className="text-sm font-bold text-white font-mono uppercase tracking-wide">Verified Algorithmic Audit</p>
            <p className="text-xs text-zinc-400 font-mono">100% On-Chain & Immutable Logging</p>
          </div>
        </div>
      </div>

      {/* Upgrade CTA banner for free users */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#138561]/20 to-[#138561]/5 border border-[#138561]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_20px_rgba(19,133,97,0.1)]">
        <div className="flex items-start gap-3">
          <span className="text-2xl shrink-0">👑</span>
          <div>
            <p className="text-sm font-bold text-white font-heading tracking-wide uppercase">UNLOCK FULL QUANTITATIVE RATIONALES</p>
            <p className="text-xs text-zinc-400 mt-0.5 font-mono">Upgrade to StrikeIQ Pro to receive real-time alerts, Kelly Criterion sizing, and proprietary edge formulas.</p>
          </div>
        </div>
        <a 
          href="/dashboard/subscription" 
          className="group relative shrink-0 px-6 py-2.5 bg-gradient-to-r from-[#138561] via-[#10b981] to-[#138561] bg-[length:200%_auto] text-white text-xs font-mono font-bold rounded-xl border border-emerald-400/60 uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.5),0_0_40px_rgba(19,133,97,0.3)] hover:shadow-[0_0_28px_rgba(16,185,129,0.85),0_0_55px_rgba(19,133,97,0.5)] hover:border-emerald-300 transition-all duration-300 overflow-hidden"
        >
          <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-in-out" />
          <span className="relative z-10">UPGRADE PRO →</span>
        </a>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <div key={i} className="p-5 rounded-2xl bg-[var(--color-background-surface)] border border-[var(--color-border-glass)] flex flex-col gap-3 hover:border-white/20 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">{k.label}</span>
              <span className="text-xl">{k.icon}</span>
            </div>
            <p className={`text-3xl font-bold font-heading tracking-tight ${k.color}`}>{k.value}</p>
            <p className="text-xs text-gray-500">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Win/Loss Donut */}
        <div className="p-6 rounded-2xl bg-[var(--color-background-surface)] border border-[var(--color-border-glass)] flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-white font-heading">Win / Loss Split</h2>
          <div className="flex items-center justify-center gap-6">
            <DonutChart won={won} lost={lost} />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#138561]"></div>
                <span className="text-sm text-gray-300">Won <strong className="text-white">{won}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-gray-300">Lost <strong className="text-white">{lost}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                <span className="text-sm text-gray-300">Total <strong className="text-white">{total}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Confidence Trend */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[var(--color-background-surface)] border border-[var(--color-border-glass)] flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <h2 className="text-lg font-semibold text-white font-heading">Confidence Trend</h2>
            <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">Last 7 picks</span>
          </div>
          <div className="flex-1 h-32">
            <AreaChart data={padded} color="#138561" />
          </div>
          <div className="flex justify-between text-xs text-gray-500 px-2">
            <span>Oldest</span>
            <span>Latest</span>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Sport breakdown */}
        <div className="p-6 rounded-2xl bg-[var(--color-background-surface)] border border-[var(--color-border-glass)] flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-white font-heading">Picks by Sport</h2>
          {data.bySport && data.bySport.length > 0 ? (
            <BarChart data={data.bySport} />
          ) : (
            <p className="text-gray-500 text-xs py-4">No sport distribution recorded yet.</p>
          )}
        </div>

        {/* Confidence Breakdown */}
        <div className="p-6 rounded-2xl bg-[var(--color-background-surface)] border border-[var(--color-border-glass)] flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-white font-heading">Confidence Breakdown</h2>
          {data.byConfidence && data.byConfidence.length > 0 ? (
            <BarChart data={data.byConfidence} />
          ) : (
            <p className="text-gray-500 text-xs py-4">No confidence distribution recorded yet.</p>
          )}
        </div>
      </div>

      {/* Top Leagues Table */}
      <div className="p-6 rounded-2xl bg-[var(--color-background-surface)] border border-[var(--color-border-glass)]">
        <h2 className="text-lg font-semibold text-white font-heading mb-5">Picks by League</h2>
        {topLeagues.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-6">No picks published yet. Post a Pro Pick from the admin panel to see stats here.</p>
        ) : (
          <div className="space-y-3">
            {topLeagues.map(([league, count], i) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={i} className="flex items-center gap-4">
                  <span className="w-5 text-sm font-bold text-gray-500">#{i + 1}</span>
                  <span className="flex-1 text-sm text-white font-medium">{league}</span>
                  <span className="text-sm text-gray-400 w-10 text-right">{count}</span>
                  <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#138561] transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Picks Table */}
      <div className="p-6 rounded-2xl bg-[var(--color-background-surface)] border border-[var(--color-border-glass)]">
        <h2 className="text-lg font-semibold text-white font-heading mb-5">Recent Pro Picks</h2>
        {proPicks.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-6">No Pro Picks published yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-white/10">
                  <th className="pb-3 text-left">Match</th>
                  <th className="pb-3 text-left">League</th>
                  <th className="pb-3 text-left">Pick</th>
                  <th className="pb-3 text-right">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {proPicks.slice(0, 8).map((p, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 text-white font-medium">{p.home_team} vs {p.away_team}</td>
                    <td className="py-3 text-gray-400">{p.league}</td>
                    <td className="py-3 text-[#d6f1ca]">{p.prediction}</td>
                    <td className="py-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${p.confidence >= 80 ? "bg-[#138561]/20 text-[#d6f1ca]" : p.confidence >= 65 ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"}`}>
                        {p.confidence}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
