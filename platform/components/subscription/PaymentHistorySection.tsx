"use client";

import React from "react";
import Link from "next/link";
import type { Plan, PaymentRecord } from "@/types";

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

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "SUCCESSFUL"
      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
      : status === "PENDING"
      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
      : "bg-red-500/20 text-red-400 border border-red-500/30";
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${cls}`}>
      {status}
    </span>
  );
}

// ─── Paginated Table ──────────────────────────────────────────────────────────
const PAGE_SIZE = 5;

function PaginatedTable({ payments }: { payments: PaymentRecord[] }) {
  const [page, setPage] = React.useState(1);

  const totalPages = Math.ceil(payments.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const visible = payments.slice(start, start + PAGE_SIZE);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-gray-400 bg-black/20">
              <th className="py-3 px-4 font-semibold">Date</th>
              <th className="py-3 px-4 font-semibold">Reference</th>
              <th className="py-3 px-4 font-semibold">Plan</th>
              <th className="py-3 px-4 font-semibold">Amount</th>
              <th className="py-3 px-4 font-semibold">Method</th>
              <th className="py-3 px-4 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs">
            {visible.map((tx) => (
              <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                <td className="py-3.5 px-4 text-gray-300">
                  {new Date(tx.createdAt).toLocaleDateString()}{" "}
                  <span className="text-gray-500 text-[10px]">
                    {new Date(tx.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono text-[11px] text-gray-400 max-w-[200px] truncate">
                  {tx.reference}
                </td>
                <td className="py-3.5 px-4 font-bold text-white">
                  {tx.plan?.name || "Pro Plan"}
                </td>
                <td className="py-3.5 px-4 font-bold text-[var(--color-brand-electricGreen)]">
                  {currencySymbol(tx.currency)}
                  {tx.amount.toFixed(2)}
                </td>
                <td className="py-3.5 px-4 text-gray-300 uppercase">
                  {tx.paymentMethod || "Card / Bank"}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <StatusBadge status={tx.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5 pt-4 border-t border-white/10">
          <p className="text-xs text-gray-500 font-mono">
            Showing{" "}
            <span className="text-white font-bold">{start + 1}–{Math.min(start + PAGE_SIZE, payments.length)}</span>{" "}
            of{" "}
            <span className="text-white font-bold">{payments.length}</span> transactions
          </p>

          <div className="flex items-center gap-1.5">
            {/* Prev */}
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 font-mono font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← Prev
            </button>

            {/* Page number buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-md text-xs font-mono font-bold transition-colors ${
                  p === page
                    ? "bg-[#10b981] text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                    : "bg-white/5 hover:bg-white/10 text-gray-400 border border-white/10"
                }`}
              >
                {p}
              </button>
            ))}

            {/* Next */}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 font-mono font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next →
            </button>
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
        <Link
          href="mailto:syndicate@strikeiq.ai"
          className="px-6 py-3 rounded-xl font-bold text-xs uppercase bg-white text-black hover:bg-gray-200 transition-all shrink-0 shadow-lg"
        >
          Talk to Syndicate Desk
        </Link>
      </div>
    </>
  );
}
