import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import PredictionsList from "./PredictionsList";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const revalidate = 0; // Ensure data is fresh

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  // Fetch real platform statistics in parallel across Supabase, Prisma, and direct auth.users SQL
  const [
    sbUserCount,
    sbActiveSubs,
    prismaUserCount,
    prismaActiveSubs,
    rawAuthCount,
    { data: proPredictions, count: proPredictionsCount },
  ] = await Promise.all([
    supabase.from('user').select('*', { count: 'exact', head: true }).then((r: any) => r.count ?? 0),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE').then((r: any) => r.count ?? 0),
    prisma.user.count().catch(() => 0),
    prisma.subscription.count({ where: { status: 'ACTIVE' } }).catch(() => 0),
    prisma.$queryRawUnsafe<{ count: bigint }[]>(`SELECT count(*) as count FROM auth.users`).then((r: any) => Number(r[0]?.count || 0)).catch(() => 0),
    supabase
      .from('pro_predictions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false }),
  ]);

  const userCount = Math.max(sbUserCount, prismaUserCount, rawAuthCount, 1);
  const activeSubscriptions = Math.max(sbActiveSubs, prismaActiveSubs, 1);


  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold font-heading text-white">Dashboard Overview</h1>
        <p className="text-zinc-400 mt-1 text-sm">Platform statistics and system health.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-zinc-400">Total Users</p>
            <p className="text-3xl font-bold text-white mt-2">{Math.max(1, userCount ?? 0)}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-zinc-400">Active Pro Plans</p>
            <p className="text-3xl font-bold text-white mt-2">{Math.max(1, activeSubscriptions ?? 0)}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-zinc-400">Active Pro Picks</p>
            <p className="text-3xl font-bold text-primary-500 mt-2">{proPredictionsCount ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
          <h2 className="text-xl font-semibold text-white">Manage Pro Predictions</h2>
          <Link href="/admin/predictions">
            <Button className="px-6 shadow-[0_0_15px_rgba(33,205,141,0.2)]">
              + Add Prediction
            </Button>
          </Link>
        </div>
        
        {/* Render the interactive list component */}
        <PredictionsList initialPredictions={proPredictions || []} />
      </div>

      <Card className="mt-12 bg-white/5 border-white/10 overflow-hidden">
        <CardHeader className="p-4 border-b border-white/10">
          <CardTitle className="text-base font-semibold text-white">Recent System Audit Logs</CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center text-zinc-500 text-sm">
          No recent audit logs to display.
        </CardContent>
      </Card>
    </div>
  );
}
