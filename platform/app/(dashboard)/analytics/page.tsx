"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { AreaChart, DonutChart, BarChart } from "@/components/analytics/Charts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export interface AnalyticsData {
  winRate: number;
  totalPredictions: number;
  avgConfidence: number;
  roi: string;
  monthlyAccuracy: number[];
  winLoss: { won: number; lost: number };
  bySport: { label: string; value: number; color?: string }[];
  byConfidence: { label: string; value: number; color?: string }[];
  recentPredictions: any[];
}

// ─── Initial Empty State ────────────────────────────────────────────────────────
const EMPTY_ANALYTICS: AnalyticsData = {
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
  const [data, setData] = useState<AnalyticsData>(EMPTY_ANALYTICS);
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
    { label: "Overall Win Rate", value: `${data.winRate}%`, sub: "Last 30 days", icon: "🎯", color: "text-primary-600" },
    { label: "Total Pro Predictions", value: data.totalPredictions.toLocaleString(), sub: "Verified & settled", icon: "📊", color: "text-blue-400" },
    { label: "Avg AI Confidence", value: `${data.avgConfidence}%`, sub: "Per prediction", icon: "📈", color: "text-primary-600" },
    { label: "Net Yield ROI", value: data.roi, sub: "Flat 1U stake", icon: "💰", color: "text-amber-400" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Skeleton className="w-12 h-12 rounded-full bg-zinc-800" />
        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest animate-pulse">Loading Analytics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-zinc-900 pb-6">
        <div>
          <Badge variant="outline" className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-600/20 border-primary-600/40 mb-3 shadow-[0_0_15px_rgba(19,133,97,0.15)] text-primary-600">
            <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse"></span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest">VERIFIED MODEL METRICS</span>
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-white font-heading tracking-tight uppercase">STRIKE-IQ QUANTITATIVE AI BENCHMARKS</h1>
          <p className="text-zinc-400 mt-1.5 font-mono text-sm">Real-time quantitative audit of our algorithmic track record, ROI, and prediction accuracy across all markets.</p>
        </div>
        {/* Trust badge */}
        <Card className="bg-primary-600/10 border-primary-600/30 shrink-0 shadow-sm px-4 py-3 h-auto">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="text-sm font-bold text-white font-mono uppercase tracking-wide">Verified Algorithmic Audit</p>
              <p className="text-xs text-zinc-400 font-mono">100% On-Chain & Immutable Logging</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Upgrade CTA banner for free users */}
      <Card className="bg-gradient-to-br from-emerald-950/40 via-black/80 to-[#09090b] border border-emerald-500/30 shadow-[0_0_20px_rgba(19,133,97,0.1)] relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0">👑</span>
            <div>
              <p className="text-sm font-bold text-white font-heading tracking-wide uppercase">UNLOCK FULL QUANTITATIVE RATIONALES</p>
              <p className="text-xs text-zinc-400 mt-0.5 font-mono">Upgrade to StrikeIQ Pro to receive real-time alerts, Kelly Criterion sizing, and proprietary edge formulas.</p>
            </div>
          </div>
          <Link href="/dashboard/subscription" className="shrink-0">
            <Button className="bg-[#10b981] hover:bg-[#059669] text-white text-xs font-mono font-bold rounded-full uppercase tracking-widest shadow-sm">
              UPGRADE PRO &rarr;
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <Card key={i} className="bg-[var(--color-background-surface)] border-[var(--color-border-glass)] hover:border-white/20 transition-colors">
            <CardContent className="p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">{k.label}</span>
                <span className="text-xl">{k.icon}</span>
              </div>
              <p className={`text-3xl font-bold font-heading tracking-tight ${k.color}`}>{k.value}</p>
              <p className="text-xs text-zinc-500">{k.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Win/Loss Donut */}
        <Card className="bg-[var(--color-background-surface)] border-[var(--color-border-glass)]">
          <CardHeader>
            <CardTitle className="text-lg text-white font-heading">Win / Loss Split</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center gap-6">
            <DonutChart won={won} lost={lost} />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary-600"></div>
                <span className="text-sm text-zinc-300">Won <strong className="text-white">{won}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-zinc-300">Lost <strong className="text-white">{lost}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-zinc-600"></div>
                <span className="text-sm text-zinc-300">Total <strong className="text-white">{total}</strong></span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confidence Trend */}
        <Card className="lg:col-span-2 bg-[var(--color-background-surface)] border-[var(--color-border-glass)] flex flex-col">
          <CardHeader className="flex flex-row justify-between items-start space-y-0 pb-2">
            <CardTitle className="text-lg text-white font-heading">Confidence Trend</CardTitle>
            <Badge variant="secondary" className="text-[10px] text-zinc-400 bg-white/5 border-0">Last 7 picks</Badge>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col pt-0">
            <div className="flex-1 h-32">
              <AreaChart data={padded} color="var(--primary-600)" />
            </div>
            <div className="flex justify-between text-xs text-zinc-500 px-2 mt-2">
              <span>Oldest</span>
              <span>Latest</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Sport breakdown */}
        <Card className="bg-[var(--color-background-surface)] border-[var(--color-border-glass)]">
          <CardHeader>
            <CardTitle className="text-lg text-white font-heading">Picks by Sport</CardTitle>
          </CardHeader>
          <CardContent>
            {data.bySport && data.bySport.length > 0 ? (
              <BarChart data={data.bySport} />
            ) : (
              <p className="text-zinc-500 text-xs py-4">No sport distribution recorded yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Confidence Breakdown */}
        <Card className="bg-[var(--color-background-surface)] border-[var(--color-border-glass)]">
          <CardHeader>
            <CardTitle className="text-lg text-white font-heading">Confidence Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {data.byConfidence && data.byConfidence.length > 0 ? (
              <BarChart data={data.byConfidence} />
            ) : (
              <p className="text-zinc-500 text-xs py-4">No confidence distribution recorded yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Leagues Table */}
      <Card className="bg-[var(--color-background-surface)] border-[var(--color-border-glass)]">
        <CardHeader>
          <CardTitle className="text-lg text-white font-heading">Picks by League</CardTitle>
        </CardHeader>
        <CardContent>
          {topLeagues.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-6">No picks published yet. Post a Pro Pick from the admin panel to see stats here.</p>
          ) : (
            <div className="space-y-3">
              {topLeagues.map(([league, count], i) => {
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={i} className="flex items-center gap-4">
                    <span className="w-5 text-sm font-bold text-zinc-500">#{i + 1}</span>
                    <span className="flex-1 text-sm text-white font-medium">{league}</span>
                    <span className="text-sm text-zinc-400 w-10 text-right">{count}</span>
                    <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-primary-600 transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-zinc-500 w-8 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Picks Table */}
      <Card className="bg-[var(--color-background-surface)] border-[var(--color-border-glass)]">
        <CardHeader>
          <CardTitle className="text-lg text-white font-heading">Recent Pro Picks</CardTitle>
        </CardHeader>
        <CardContent>
          {proPicks.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-6">No Pro Picks published yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-md border border-zinc-800">
              <Table>
                <TableHeader className="bg-black/20">
                  <TableRow className="border-b border-zinc-800 hover:bg-transparent">
                    <TableHead className="text-xs text-zinc-400 uppercase tracking-wider h-10">Match</TableHead>
                    <TableHead className="text-xs text-zinc-400 uppercase tracking-wider h-10">League</TableHead>
                    <TableHead className="text-xs text-zinc-400 uppercase tracking-wider h-10">Pick</TableHead>
                    <TableHead className="text-xs text-zinc-400 uppercase tracking-wider text-right h-10">Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proPicks.slice(0, 8).map((p, i) => (
                    <TableRow key={i} className="border-b border-zinc-800/50 hover:bg-white/5 transition-colors">
                      <TableCell className="py-3 text-white font-medium text-xs">{p.home_team} vs {p.away_team}</TableCell>
                      <TableCell className="py-3 text-zinc-400 text-xs">{p.league}</TableCell>
                      <TableCell className="py-3 text-primary-100 text-xs">{p.prediction}</TableCell>
                      <TableCell className="py-3 text-right">
                        <Badge variant="outline" className={`text-[10px] uppercase font-bold border-0 ${p.confidence >= 80 ? "bg-primary-600/20 text-primary-400" : p.confidence >= 65 ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"}`}>
                          {p.confidence}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
