"use client";

import React, { useState } from "react";
import {
  ZapIcon,
  LockIcon,
  TicketIcon,
  CopyIcon,
  CrownIcon,
  SparklesIcon,
  GiftIcon,
} from "@/components/icons/Icons";
import { getBettingPlatformName, getCleanBookingCodeString } from "./MatchCardHelpers";
import { MatchItem } from "@/types";

interface BookingSlipCardProps {
  match: MatchItem;
  actuallyLocked: boolean;
  isTeasing: boolean;
  isBlurred: boolean;
  requiresGuestAuth: boolean;
  requiresProAuth: boolean;
  proPriceText: string;
  onRequireLogin?: () => void;
  showAnalysis: boolean;
  setShowAnalysis: (val: boolean) => void;
}

export function BookingSlipCard({
  match,
  actuallyLocked,
  isTeasing,
  isBlurred,
  requiresGuestAuth,
  requiresProAuth,
  proPriceText,
  onRequireLogin,
  showAnalysis,
  setShowAnalysis,
}: BookingSlipCardProps) {
  const [copied, setCopied] = useState(false);
  const bettingPlatform = getBettingPlatformName(match);
  const cleanCode = getCleanBookingCodeString(match);
  const headerTitle = match.league || "FREE DAILY TEASER";
  const confidenceVal = match.confidence ?? 0;

  const handleCopy = (e: React.MouseEvent, textToCopy: string) => {
    e.stopPropagation();
    if (requiresGuestAuth) {
      if (onRequireLogin) onRequireLogin();
      return;
    }
    if (requiresProAuth) {
      window.location.href = "/dashboard/subscription";
      return;
    }
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="relative group rounded-xl bg-[#09090b] border border-zinc-800/90 overflow-hidden transition-all duration-200 hover:border-zinc-700">
      <div className="relative z-10 p-5 sm:p-6">
        {/* Top Header: Strike IQ Logo + Header Title + Badges + Date */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-zinc-800/80">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#121215] border border-zinc-800 flex items-center justify-center p-1.5 shrink-0">
                <img src="/favicon.svg" alt="Strike IQ" className="w-full h-full object-contain" />
              </div>
              <span className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                {headerTitle}
              </span>
            </div>

            {match.isFreePick && (
              <span className="px-2.5 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                <GiftIcon size={12} />
                <span>FREE COMMUNITY SLIP</span>
              </span>
            )}
            {match.isProPick && !match.isFreePick && (
              <span className="px-2.5 py-0.5 rounded bg-[#138561]/15 border border-[#138561]/30 text-[10px] font-mono font-bold text-[#138561] uppercase tracking-wider flex items-center gap-1">
                <CrownIcon size={13} /> PRO EDGE
              </span>
            )}
            {match.homeTeam?.toLowerCase().includes("odd") && (
              <span className="px-2.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                🔥 {match.homeTeam}
              </span>
            )}
          </div>
          <div className="text-right font-mono text-xs text-zinc-400">
            <span className="text-[#138561] font-bold">{match.date}</span>
            {match.time && <span className="text-zinc-500 ml-2">{match.time}</span>}
          </div>
        </div>

        {/* Center: Betting Platform + Booking Code & AI Rating Ring */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 relative">
          {actuallyLocked && !isTeasing && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (requiresGuestAuth && onRequireLogin) {
                  onRequireLogin();
                } else {
                  window.location.href = "/dashboard/subscription";
                }
              }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#09090b]/95 rounded-xl border border-zinc-800 p-4 text-center cursor-pointer hover:bg-black transition-all group/lock animate-fadeIn"
            >
              <div className="w-9 h-9 rounded-xl bg-[#121215] border border-zinc-800 flex items-center justify-center mb-1 transition-transform">
                <LockIcon size={18} className="text-[#138561]" />
              </div>
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-0.5">
                {bettingPlatform} BOOKING CODE LOCKED
              </span>
              <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-[#138561] tracking-widest">
                <ZapIcon size={12} />
                <span>
                  {requiresGuestAuth
                    ? "SIGN IN OR REGISTER TO COPY SLIP"
                    : `UPGRADE TO PRO (${proPriceText}) TO COPY SLIP`}
                </span>
              </span>
            </div>
          )}

          {/* ONLY THE BETTING PLATFORM & BOOKING CODE */}
          <div
            onClick={(e) => handleCopy(e, cleanCode)}
            title={
              requiresGuestAuth
                ? "Sign in to copy booking code"
                : requiresProAuth
                ? "Upgrade to Pro to copy booking code"
                : "Click to copy booking code"
            }
            className={`flex-1 p-5 sm:p-6 rounded-xl border bg-[#121215] flex flex-col sm:flex-row sm:items-center justify-between gap-5 cursor-pointer transition-all group/code ${
              copied
                ? "border-emerald-500/80 bg-emerald-950/20"
                : "border-zinc-800/90 hover:border-zinc-700"
            } ${
              isBlurred ? "blur-sm opacity-40 pointer-events-none select-none" : ""
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                  copied
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                    : match.isFreePick
                    ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-400"
                    : "bg-[#138561]/15 border-[#138561]/30 text-[#138561]"
                }`}
              >
                <TicketIcon size={24} />
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="text-white font-extrabold px-2 py-0.5 rounded bg-black/60 border border-zinc-800">
                    {bettingPlatform}
                  </span>
                  <span className="text-zinc-600">{"//"}</span>
                  <span>BOOKING CODE SLIP</span>
                </div>
                <div
                  className={`font-mono font-extrabold text-2xl sm:text-3xl tracking-widest select-all mt-1.5 transition-colors ${
                    copied
                      ? "text-emerald-400 scale-[1.01]"
                      : "text-white group-hover/code:text-emerald-300"
                  }`}
                >
                  {actuallyLocked ? `${cleanCode.slice(0, 2)}•••• [LOCKED]` : cleanCode}
                </div>
              </div>
            </div>

            <div
              className={`px-5 py-3 rounded-lg border font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shrink-0 ${
                copied
                  ? "bg-emerald-500 text-black border-emerald-400 scale-105 shadow-md font-extrabold"
                  : match.isFreePick
                  ? "bg-cyan-500 text-black border-cyan-400 group-hover/code:bg-cyan-400"
                  : "bg-[#138561] text-white border-emerald-400 group-hover/code:bg-emerald-600"
              }`}
            >
              <span>
                {actuallyLocked ? "LOCK 🔒" : copied ? "COPIED! ✅" : "COPY CODE"}
              </span>
              {!actuallyLocked && !copied && <CopyIcon size={15} />}
            </div>
          </div>

          {/* ONLY THE RATING */}
          <div
            className={`flex sm:flex-col items-center justify-between sm:justify-center gap-2 px-6 py-4 bg-[#121215] rounded-xl border border-zinc-800 shrink-0 ${
              actuallyLocked ? "blur-sm opacity-40 pointer-events-none" : ""
            }`}
          >
            <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
              AI RATING
            </span>
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-zinc-800"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                />
                 <path
                  className={
                    confidenceVal >= 85
                      ? "text-[#138561]"
                      : confidenceVal >= 75
                      ? "text-emerald-500"
                      : "text-zinc-500"
                  }
                  strokeDasharray={`${confidenceVal}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono font-bold text-base text-white">
                  {confidenceVal}
                </span>
                <span className="text-[9px] text-zinc-500 font-mono -mt-1">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Toggle Analysis Button */}
        <div className="mt-5 pt-3 border-t border-zinc-800/50 flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (actuallyLocked) {
                window.location.href = "/dashboard/subscription";
              } else {
                setShowAnalysis(!showAnalysis);
              }
            }}
            className="group/btn flex items-center gap-2 px-4 py-1.5 rounded bg-[#121215] border border-zinc-800 hover:border-zinc-700 transition-colors"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                actuallyLocked ? "bg-zinc-600" : "bg-[#138561] animate-pulse"
              }`}
            ></span>
            <span className="text-xs font-mono font-bold text-zinc-300 group-hover/btn:text-white transition-colors uppercase tracking-wider">
              {actuallyLocked ? "UNLOCK PRO INSIGHTS" : showAnalysis ? "HIDE ANALYSIS" : "VIEW AI ANALYSIS"}
            </span>
          </button>
        </div>
      </div>

      {/* ONLY THE ANALYSIS DRAWER */}
      <div
        className={`bg-[#050507] border-t border-zinc-800/80 transition-all duration-300 ease-in-out overflow-hidden ${
          showAnalysis && !actuallyLocked ? "max-h-96 opacity-100 py-5" : "max-h-0 opacity-0 py-0"
        }`}
      >
        <div className="px-5 sm:px-6">
          <div className="flex items-center gap-2 mb-2">
            <SparklesIcon size={14} className="text-[#138561]" />
            <span className="font-mono font-bold text-xs text-[#138561] uppercase tracking-wider">
              QUANT INSIGHTS & RATIONALE
            </span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed font-sans whitespace-pre-wrap">
            {match.analysis || "Detailed quantitative rationale for this accumulator slip."}
          </p>
        </div>
      </div>
    </div>
  );
}
