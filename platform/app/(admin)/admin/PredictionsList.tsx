"use client";

import { useState } from "react";
import Link from "next/link";
import { getLeagueLogo } from "@/lib/logos";
import { TrashIcon, GiftIcon, CrownIcon, TicketIcon, HourglassIcon, CheckCircleIcon, XCircleIcon, AlertCircleIcon } from "@/components/icons/Icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
      <Card className="bg-white/5 border-white/10 rounded-xl">
        <CardContent className="p-12 text-center">
          <p className="text-zinc-400 mb-4">You haven't added any Pro Predictions yet.</p>
          <Link href="/admin/predictions">
            <Button className="bg-primary-600 hover:bg-primary-500 text-white font-bold">
              + Add First Prediction
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 rounded-xl border-white/10 overflow-hidden">
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader className="bg-black/40 border-b border-white/10">
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider h-auto">Match</TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider h-auto">League</TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider h-auto">Date & Time</TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider h-auto">Pick (Confidence)</TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider h-auto">Status</TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider h-auto text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-white/10">
            {predictions.map((p) => {
              const isFreeTier = p.tags?.some((t: string) => String(t).toUpperCase().includes("FREE"));
              return (
                <TableRow key={p.id} className="hover:bg-white/5 transition-colors border-0">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 flex items-center justify-center shrink-0">
                        <img src={getLeagueLogo(p.league, p.sport)} alt={p.league} className="max-w-full max-h-full object-contain opacity-80" />
                      </div>
                      <span className="font-semibold text-white whitespace-nowrap">{p.home_team} vs {p.away_team}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      <Badge variant="outline" className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 h-auto ${
                        isFreeTier 
                          ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40" 
                          : "bg-primary-600/20 text-primary-600 border-primary-600/40"
                      }`}>
                        {isFreeTier ? (
                          <><GiftIcon size={11} className="text-cyan-400" /><span>FREE MARKETING CODE</span></>
                        ) : (
                          <><CrownIcon size={11} className="text-primary-600" /><span>VIP PRO LOCK</span></>
                        )}
                      </Badge>
                      {p.booking_code && (
                        <Badge variant="outline" className="px-2 py-0.5 rounded bg-black/60 text-zinc-300 border-zinc-700 text-[10px] font-mono font-bold uppercase flex items-center gap-1 h-auto">
                          <TicketIcon size={12} className="text-emerald-400" />
                          <span>{p.bookmaker || 'CODE'}:</span>
                          <span className="text-emerald-400 font-bold">{p.booking_code}</span>
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="text-zinc-300 text-sm">{p.league}</span>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="text-sm text-white">{p.match_date}</div>
                    <div className="text-xs text-zinc-500 font-mono">{p.match_time}</div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-primary-300 font-bold text-sm">{p.prediction}</span>
                      <span className="text-xs text-zinc-400">{p.confidence}% Confidence</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    {p.status === 'WON' && <Badge variant="outline" className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold border-emerald-500/30 flex items-center gap-1.5 w-fit h-auto"><CheckCircleIcon size={14} /><span>WON</span></Badge>}
                    {p.status === 'LOST' && <Badge variant="outline" className="px-2.5 py-1 rounded bg-red-500/20 text-red-400 font-mono text-xs font-bold border-red-500/30 flex items-center gap-1.5 w-fit h-auto"><XCircleIcon size={14} /><span>LOST</span></Badge>}
                    {p.status === 'VOID' && <Badge variant="outline" className="px-2.5 py-1 rounded bg-zinc-500/20 text-zinc-400 font-mono text-xs font-bold border-zinc-500/30 flex items-center gap-1.5 w-fit h-auto"><AlertCircleIcon size={14} /><span>VOID</span></Badge>}
                    {(!p.status || p.status === 'PENDING') && <Badge variant="outline" className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 font-mono text-xs font-bold border-amber-500/30 flex items-center gap-1.5 w-fit h-auto"><HourglassIcon size={14} /><span>PENDING</span></Badge>}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/predictions/${p.id}/edit`}>
                        <Button variant="outline" size="sm" className="h-8 px-3 rounded-lg border-white/10 hover:bg-white/10 text-zinc-300">
                          Edit
                        </Button>
                      </Link>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(p.id)}
                        disabled={deletingId === p.id}
                        className="h-8 px-3 rounded-lg border-red-500/20 hover:bg-red-500/10 text-red-400 hover:text-red-300 flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <TrashIcon size={15} />
                        <span>{deletingId === p.id ? "Deleting..." : "Delete"}</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
