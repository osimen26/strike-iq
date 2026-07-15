"use client";

import { useState } from "react";
import Link from "next/link";
import { getLeagueLogo } from "@/lib/logos";
import { TrashIcon, GiftIcon, CrownIcon, TicketIcon } from "@/components/icons/Icons";

export default function PredictionsList({ initialPredictions }: { initialPredictions: any[] }) {
  const [predictions, setPredictions] = useState(initialPredictions);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this Pro Prediction? This cannot be undone.")) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/predictions/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete");
      }

      // Remove from UI
      setPredictions(predictions.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete prediction.");
    } finally {
      setDeletingId(null);
    }
  };

  if (predictions.length === 0) {
    return (
      <div className="p-12 text-center bg-white/5 border border-white/10 rounded-xl">
        <p className="text-gray-400">You haven't added any Pro Predictions yet.</p>
        <Link href="/admin/predictions" className="mt-4 inline-block px-6 py-2 bg-[var(--color-brand-emerald)] hover:bg-[var(--color-brand-actionGreen)] text-white font-bold rounded-lg transition-colors">
          + Add First Prediction
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black/40 border-b border-white/10 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <th className="px-6 py-4">Match</th>
              <th className="px-6 py-4">League</th>
              <th className="px-6 py-4">Date & Time</th>
              <th className="px-6 py-4">Pick (Confidence)</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {predictions.map((p) => {
              const isFreeTier = p.tags?.some((t: string) => String(t).toUpperCase().includes("FREE"));
              return (
                <tr key={p.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 flex items-center justify-center shrink-0">
                        <img src={getLeagueLogo(p.league, p.sport)} alt={p.league} className="max-w-full max-h-full object-contain opacity-80" />
                      </div>
                      <span className="font-semibold text-white whitespace-nowrap">{p.home_team} vs {p.away_team}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 ${
                        isFreeTier 
                          ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40" 
                          : "bg-[#138561]/20 text-[#138561] border border-[#138561]/40"
                      }`}>
                        {isFreeTier ? (
                          <><GiftIcon size={11} className="text-cyan-400" /><span>FREE MARKETING CODE</span></>
                        ) : (
                          <><CrownIcon size={11} className="text-[#138561]" /><span>VIP PRO LOCK</span></>
                        )}
                      </span>
                      {p.booking_code && (
                        <span className="px-2 py-0.5 rounded bg-black/60 text-zinc-300 border border-zinc-700 text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                          <TicketIcon size={12} className="text-emerald-400" />
                          <span>{p.bookmaker || 'CODE'}:</span>
                          <span className="text-emerald-400 font-bold">{p.booking_code}</span>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-300 text-sm">{p.league}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">{p.match_date}</div>
                    <div className="text-xs text-gray-500 font-mono">{p.match_time}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-[var(--color-brand-mint)] font-bold text-sm">{p.prediction}</span>
                      <span className="text-xs text-gray-400">{p.confidence}% Confidence</span>
                    </div>
                  </td>
                <td className="px-6 py-4">
                  {p.status === 'WON' && <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/30">✅ WON</span>}
                  {p.status === 'LOST' && <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 font-mono text-xs font-bold border border-red-500/30">❌ LOST</span>}
                  {p.status === 'VOID' && <span className="px-2 py-1 rounded bg-zinc-500/20 text-zinc-400 font-mono text-xs font-bold border border-zinc-500/30">⚪ VOID</span>}
                  {(!p.status || p.status === 'PENDING') && <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 font-mono text-xs font-bold border border-amber-500/30">⏳ PENDING</span>}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link 
                      href={`/admin/predictions/${p.id}/edit`}
                      className="text-sm font-medium text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      Edit
                    </Link>
                    <button 
                      onClick={() => handleDelete(p.id)}
                      disabled={deletingId === p.id}
                      className="text-sm font-medium text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <TrashIcon size={15} />
                      <span>{deletingId === p.id ? "Deleting..." : "Delete"}</span>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
