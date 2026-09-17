"use client";

import Link from "next/link";
import { CrownIcon, ZapIcon } from "@/components/icons/Icons";

interface ProUpsellBannerProps {
  /** Short contextual message. Defaults to a general message. */
  context?: string;
  /** Whether to show the full expanded version or a compact inline version */
  compact?: boolean;
}

/**
 * Reusable Pro upgrade CTA shown when Free users attempt to access Pro content.
 * Used across leagues page, predictions page, and dashboard.
 */
export function ProUpsellBanner({ context, compact = false }: ProUpsellBannerProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-950/30 to-black/60 border border-amber-500/30">
        <span className="text-amber-400 shrink-0"><CrownIcon size={16} /></span>
        <p className="text-xs text-amber-200/80 flex-1">
          {context || "This competition is available with StrikeIQ Pro."}
        </p>
        <Link
          href="/dashboard/subscription"
          className="shrink-0 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-mono font-bold rounded-full uppercase tracking-wider transition-colors border border-amber-500/30"
        >
          Upgrade →
        </Link>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/30 via-black/80 to-emerald-950/20 p-8 md:p-10">
      {/* Background glow effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-amber-400"><CrownIcon size={22} /></span>
            <h3 className="text-lg md:text-xl font-bold text-white font-heading tracking-tight">
              Unlock More Competitions with StrikeIQ Pro
            </h3>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed max-w-lg">
            {context || "Get deeper match intelligence across leagues including the Süper Lig, MLS, Saudi Pro League, Eredivisie, and more. Pro members unlock expanded coverage across 25+ football and basketball competitions worldwide."}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {["More Leagues", "Deeper AI Analysis", "Market Intelligence", "Advanced Filters"].map((feature) => (
              <span
                key={feature}
                className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-white/5 text-zinc-400 border border-white/10 uppercase tracking-wider"
              >
                <ZapIcon size={10} className="inline mr-1 text-amber-400" />
                {feature}
              </span>
            ))}
          </div>
        </div>

        <Link
          href="/dashboard/subscription"
          className="shrink-0 px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-mono font-extrabold rounded-full uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
        >
          <CrownIcon size={14} />
          <span>Upgrade Pro</span>
        </Link>
      </div>
    </div>
  );
}
