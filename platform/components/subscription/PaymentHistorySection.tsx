"use client";

import React from "react";
import Link from "next/link";
import type { PaymentRecord } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PaymentHistorySectionProps {
  payments: PaymentRecord[];
}

// ─── Currency symbol helper ───────────────────────────────────────────────────
function currencySymbol(code: string) {
  if (code === "NGN") return "₦";
  if (code === "GHS") return "GH₵";
  if (code === "KES") return "KSh";
  if (code === "ZAR") return "R";
  return "$";
}

// ─── Status badge using shadcn Badge ─────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "SUCCESSFUL"
      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
      : status === "PENDING"
      ? "bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/25"
      : "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/25";
  return (
    <Badge className={`text-[10px] font-extrabold uppercase ${styles}`}>
      {status}
    </Badge>
  );
}

// ─── Paginated Table using shadcn Table ───────────────────────────────────────
const PAGE_SIZE = 5;

function PaginatedTable({ payments }: { payments: PaymentRecord[] }) {
  const [page, setPage] = React.useState(1);

  const totalPages = Math.ceil(payments.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const visible = payments.slice(start, start + PAGE_SIZE);

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-zinc-800/60">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-white/10 bg-black/20 hover:bg-black/20">
              <TableHead className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold py-3">Date</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold py-3">Reference</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold py-3">Plan</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold py-3">Amount</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold py-3">Method</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold py-3 text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((tx) => (
              <TableRow key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <TableCell className="py-3.5 text-gray-300 text-xs">
                  {new Date(tx.createdAt).toLocaleDateString()}{" "}
                  <span className="text-gray-500 text-[10px]">
                    {new Date(tx.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </TableCell>
                <TableCell className="py-3.5 font-mono text-[11px] text-gray-400 max-w-[200px] truncate">
                  {tx.reference}
                </TableCell>
                <TableCell className="py-3.5 font-bold text-white text-xs">
                  {tx.plan?.name || "Pro Plan"}
                </TableCell>
                <TableCell className="py-3.5 font-bold text-primary-600 text-xs">
                  {currencySymbol(tx.currency)}{tx.amount.toFixed(2)}
                </TableCell>
                <TableCell className="py-3.5 text-gray-300 uppercase text-xs">
                  {tx.paymentMethod || "Card / Bank"}
                </TableCell>
                <TableCell className="py-3.5 text-right">
                  <StatusBadge status={tx.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls using shadcn Button */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5 pt-4 border-t border-white/10">
          <p className="text-xs text-gray-500 font-mono">
            Showing{" "}
            <span className="text-white font-bold">{start + 1}–{Math.min(start + PAGE_SIZE, payments.length)}</span>{" "}
            of{" "}
            <span className="text-white font-bold">{payments.length}</span> transactions
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="bg-white/5 border-white/10 text-gray-300 font-mono text-xs h-8 hover:bg-white/10 disabled:opacity-30"
            >
              ← Prev
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === page ? "default" : "outline"}
                size="sm"
                onClick={() => setPage(p)}
                className={`w-8 h-8 text-xs font-mono font-bold p-0 ${
                  p === page
                    ? "bg-primary-600 hover:bg-primary-600/90 text-white border-0 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                }`}
              >
                {p}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="bg-white/5 border-white/10 text-gray-300 font-mono text-xs h-8 hover:bg-white/10 disabled:opacity-30"
            >
              Next →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export function PaymentHistorySection({ payments }: PaymentHistorySectionProps) {
  return (
    <>
      {/* Billing History */}
      <div className="mt-14 bg-[var(--color-background-surface)] border border-white/10 rounded-2xl p-6 md:p-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white font-heading">
              Billing &amp; Transaction History
            </h2>
            <p className="text-xs text-[var(--color-accent-mutedSage)] mt-1">
              All billing history and subscription payments are recorded here.
            </p>
          </div>
          <div className="text-xs text-gray-400">
            Currency: <span className="text-white font-bold">Regional / Dynamic</span>
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            No previous payment transactions recorded yet.
          </div>
        ) : (
          <PaginatedTable payments={payments} />
        )}
      </div>

      {/* Syndicate Support Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-black to-emerald-950/40 border border-[var(--color-brand-emerald)]/30 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl mt-8">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="text-lg font-bold text-white">
            Serious volume or high-roller betting syndicate?
          </h3>
          <p className="text-xs text-[var(--color-accent-mutedSage)] max-w-xl">
            Meet <span className="text-white font-bold">Strike IQ Syndicate</span>. Get direct API
            webhook access to our deep-learning inference engines, custom odds models, and priority
            risk management alerts.
          </p>
        </div>
        <Link href="mailto:syndicate@strikeiq.ai">
          <Button className="bg-white text-black hover:bg-gray-200 font-bold text-xs uppercase shrink-0 shadow-lg rounded-xl px-6 py-3 h-auto">
            Talk to Syndicate Desk
          </Button>
        </Link>
      </div>
    </>
  );
}
