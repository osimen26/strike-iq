import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AnalyticsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  // In a real scenario, we would calculate this dynamically based on the user's saved predictions and actual outcomes
  const stats = {
    totalPredictions: 142,
    won: 94,
    lost: 48,
    winRate: 66.2,
    roi: 12.5,
    profit: 345.50
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white font-heading">Performance Analytics</h1>
        <p className="text-[var(--color-accent-mutedSage)] mt-1">Track your betting success over time.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-[var(--color-background-surface)] border border-[var(--color-border-glass)]">
          <p className="text-sm text-gray-400">Total Tracked</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.totalPredictions}</p>
        </div>
        <div className="p-5 rounded-xl bg-[var(--color-background-surface)] border border-[var(--color-border-glass)]">
          <p className="text-sm text-gray-400">Win Rate</p>
          <p className="text-2xl font-bold text-[var(--color-brand-mint)] mt-1">{stats.winRate}%</p>
        </div>
        <div className="p-5 rounded-xl bg-[var(--color-background-surface)] border border-[var(--color-border-glass)]">
          <p className="text-sm text-gray-400">ROI</p>
          <p className="text-2xl font-bold text-[var(--color-brand-emerald)] mt-1">+{stats.roi}%</p>
        </div>
        <div className="p-5 rounded-xl bg-[var(--color-background-surface)] border border-[var(--color-border-glass)]">
          <p className="text-sm text-gray-400">Net Profit (Units)</p>
          <p className="text-2xl font-bold text-white mt-1">+{stats.profit}</p>
        </div>
      </div>

      {/* Charts area (placeholders) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-[var(--color-background-surface)] border border-[var(--color-border-glass)] h-80 flex flex-col justify-between">
          <h2 className="text-lg font-semibold text-white">Win Rate Trend (Last 30 Days)</h2>
          <div className="flex-1 flex items-center justify-center text-gray-500 border border-dashed border-white/10 rounded-lg mt-4">
            [ Line Chart Rendered Here using Recharts / Chart.js ]
          </div>
        </div>
        
        <div className="p-6 rounded-xl bg-[var(--color-background-surface)] border border-[var(--color-border-glass)] h-80 flex flex-col justify-between">
          <h2 className="text-lg font-semibold text-white">Profit by Sport</h2>
          <div className="flex-1 flex items-center justify-center text-gray-500 border border-dashed border-white/10 rounded-lg mt-4">
            [ Bar Chart Rendered Here using Recharts / Chart.js ]
          </div>
        </div>
      </div>
    </div>
  );
}
