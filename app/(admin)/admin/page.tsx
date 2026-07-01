import { createClient } from "@/lib/supabase/server";
import PredictionsList from "./PredictionsList";

export const revalidate = 0; // Ensure data is fresh

export default async function AdminOverviewPage() {
  const supabase = await createClient();
  
  // Placeholder counts since we removed prisma
  const userCount = 42;
  const activeSubscriptions = 12;
  
  // Fetch pro predictions
  const { data: proPredictions, count: aiJobs } = await supabase
    .from('pro_predictions')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold font-heading">Dashboard Overview</h1>
        <p className="text-gray-400 mt-1">Platform statistics and system health.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <p className="text-sm font-medium text-gray-400">Total Users</p>
          <p className="text-3xl font-bold text-white mt-2">{userCount}</p>
        </div>
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <p className="text-sm font-medium text-gray-400">Active Pro Plans</p>
          <p className="text-3xl font-bold text-white mt-2">{activeSubscriptions}</p>
        </div>
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <p className="text-sm font-medium text-gray-400">Active Pro Picks</p>
          <p className="text-3xl font-bold text-[var(--color-brand-emerald)] mt-2">{aiJobs || 0}</p>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-xl font-semibold text-white">Manage Pro Predictions</h2>
          <a href="/admin/predictions" className="px-6 py-2.5 bg-[var(--color-brand-emerald)] hover:bg-[var(--color-brand-actionGreen)] text-white font-bold rounded-lg transition-colors text-sm shadow-[0_0_15px_rgba(33,205,141,0.2)]">
            + Add Prediction
          </a>
        </div>
        
        {/* Render the interactive list component */}
        <PredictionsList initialPredictions={proPredictions || []} />
      </div>

      <div className="mt-12 bg-white/5 rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="font-semibold text-white">Recent System Audit Logs</h3>
        </div>
        <div className="p-8 text-center text-gray-500 text-sm">
          No recent audit logs to display.
        </div>
      </div>
    </div>
  );
}
