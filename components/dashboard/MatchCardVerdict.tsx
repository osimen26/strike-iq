"use client";

import React, { useState } from "react";
import {
  ZapIcon,
  LockIcon,
  TicketIcon,
  CopyIcon,
  CrownIcon,
  SparklesIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon,
  HourglassIcon,
  GiftIcon,
} from "@/components/icons/Icons";

interface MatchCardVerdictProps {
  match: any;
  actuallyLocked: boolean;
  isTeasing: boolean;
  isBlurred: boolean;
  requiresGuestAuth: boolean;
  requiresProAuth: boolean;
  proPriceText: string;
  onRequireLogin?: () => void;
  showAnalysis: boolean;
  setShowAnalysis: (val: boolean) => void;
  getLeagueLogo: (league?: string, sport?: string) => string;
  getTeamLogo: (teamName: string) => string;
}

export function MatchCardVerdict({
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
  getLeagueLogo,
  getTeamLogo,
}: MatchCardVerdictProps) {
  const [copied, setCopied] = useState(false);

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
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* LEFT: Match Info & Teams */}
          <div className="flex-1 flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Meta Info */}
            <div className="w-full md:w-36 shrink-0 flex flex-row md:flex-col items-center md:items-start justify-between border-b md:border-b-0 md:border-r border-zinc-800/80 pb-3 md:pb-0 md:pr-4">
              <div className="flex items-center gap-2 mb-0 md:mb-1.5">
                <div className="w-4 h-4 flex items-center justify-center opacity-80">
                  <img
                    src={getLeagueLogo(match.league, match.sport)}
                    alt={match.league}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider line-clamp-1">
                  {match.league}
                </span>
              </div>
              <div className="text-right md:text-left">
                <div className="text-xs font-mono font-bold text-[#138561]">
                  {match.date}
                </div>
                <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                  {match.time}
                </div>
              </div>
            </div>

            {/* Teams */}
            <div className="flex-1 flex items-center justify-center md:justify-start gap-4 w-full">
              <div className="flex flex-col items-center gap-2 w-2/5">
                <div className="w-12 h-12 rounded-lg bg-[#121215] border border-zinc-800 flex items-center justify-center overflow-hidden p-2">
                  <img
                    src={getTeamLogo(match.homeTeam)}
                    alt={match.homeTeam}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span
                  title={match.homeTeam}
                  className="font-mono font-bold text-xs sm:text-sm text-white text-center line-clamp-1"
                >
                  {match.homeTeam}
                </span>
              </div>

              <div className="px-2 py-0.5 bg-[#121215] rounded border border-zinc-800 text-[10px] font-bold text-zinc-500 font-mono shrink-0">
                VS
              </div>

              <div className="flex flex-col items-center gap-2 w-2/5">
                <div className="w-12 h-12 rounded-lg bg-[#121215] border border-zinc-800 flex items-center justify-center overflow-hidden p-2">
                  <img
                    src={getTeamLogo(match.awayTeam)}
                    alt={match.awayTeam}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span
                  title={match.awayTeam}
                  className="font-mono font-bold text-xs sm:text-sm text-white text-center line-clamp-1"
                >
                  {match.awayTeam}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: AI Prediction & Confidence Ring */}
          <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 border-zinc-800/80 pt-5 lg:pt-0 w-full lg:w-auto relative">
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
                className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#09090b]/95 rounded-lg border border-zinc-800 p-3 text-center cursor-pointer hover:bg-black transition-all group/lock animate-fadeIn"
              >
                <div className="w-8 h-8 rounded-xl bg-[#121215] border border-zinc-800 flex items-center justify-center mb-1 transition-transform">
                  <LockIcon size={16} className="text-[#138561]" />
                </div>
                <span className="text-[11px] font-mono font-bold text-white uppercase tracking-wider mb-0.5">
                  {match.bookingCode
                    ? `${match.bookmaker || "VIP"} CODE LOCKED`
                    : "VIP GAME VERDICT LOCKED"}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#138561] tracking-widest">
                  <ZapIcon size={12} />
                  <span>
                    {requiresGuestAuth
                      ? "SIGN IN OR REGISTER TO VIEW VERDICT"
                      : `UPGRADE TO PRO (${proPriceText}) TO UNLOCK`}
                  </span>
                </span>
              </div>
            )}

            {/* The Verdict */}
            <div
              className={`flex flex-col items-start lg:items-end gap-2 flex-1 lg:flex-none ${
                isBlurred ? "blur-sm opacity-40 select-none pointer-events-none" : ""
              }`}
            >
              <div className="flex flex-wrap gap-1.5 mb-0.5">
                {match.status === "WON" && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
                    <CheckCircleIcon size={12} />
                    <span>WON (+0.85u)</span>
                  </span>
                )}
                {match.status === "LOST" && (
                  <span className="px-2 py-0.5 rounded bg-red-500/15 border border-red-500/30 text-[9px] font-mono font-bold text-red-400 uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
                    <XCircleIcon size={12} />
                    <span>LOST (-1.0u)</span>
                  </span>
                )}
                {match.status === "VOID" && (
                  <span className="px-2 py-0.5 rounded bg-zinc-500/15 border border-zinc-500/30 text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
                    <AlertCircleIcon size={12} />
                    <span>VOID</span>
                  </span>
                )}
                {match.status === "PENDING" && (
                  <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-[9px] font-mono font-bold text-amber-400 uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
                    <HourglassIcon size={12} />
                    <span>PENDING</span>
                  </span>
                )}
                {match.isFreePick && (
                  <span className="px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
                    <GiftIcon size={12} />
                    <span>FREE COMMUNITY SLIP</span>
                  </span>
                )}
                {match.isProPick && !match.isFreePick && (
                  <span className="px-2 py-0.5 rounded bg-[#138561]/15 border border-[#138561]/30 text-[9px] font-mono font-bold text-[#138561] uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
                    <CrownIcon size={12} /> PRO EDGE
                  </span>
                )}
                {match.tags?.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded bg-[#121215] border border-zinc-800 text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="px-3.5 py-2 bg-[#121215] rounded-lg border border-zinc-800/80 w-full lg:w-auto flex items-center justify-between lg:justify-end gap-3">
                <span className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <SparklesIcon size={13} className="text-[#138561]" />
                  AI PREDICTION:
                </span>
                <span className="font-mono font-bold text-sm text-[#138561] tracking-tight">
                  {match.prediction}
                </span>
              </div>
              {match.bookingCode && (
                <div
                  onClick={(e) => handleCopy(e, match.bookingCode)}
                  title={
                    requiresGuestAuth
                      ? "Sign in to copy booking code"
                      : requiresProAuth
                      ? "Upgrade to Pro to copy booking code"
                      : "Click to copy booking code"
                  }
                  className={`px-3 py-1.5 rounded-lg border bg-[#121215] w-full lg:w-auto flex items-center justify-between lg:justify-end gap-2.5 cursor-pointer transition-all group/code ${
                    copied
                      ? "border-emerald-500 bg-emerald-950/30"
                      : "border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <TicketIcon
                      size={14}
                      className={match.isFreePick ? "text-cyan-400" : "text-[#138561]"}
                    />{" "}
                    {match.bookmaker || "BOOKING CODE"}:
                  </span>
                  <span
                    className={`font-mono font-bold text-xs tracking-widest select-all bg-black/40 px-2 py-0.5 rounded border ${
                      copied
                        ? "text-emerald-400 border-emerald-500/60"
                        : "text-white border-zinc-800 group-hover/code:border-[#138561]"
                    }`}
                  >
                    {isBlurred
                      ? `${match.bookingCode.slice(0, 2)}•••• [LOCKED]`
                      : match.bookingCode}
                  </span>
                  <span
                    className={`text-[10px] transition-colors flex items-center gap-1 font-bold ${
                      copied
                        ? "text-emerald-400"
                        : match.isFreePick
                        ? "text-cyan-400 group-hover/code:text-white"
                        : "text-[#138561] group-hover/code:text-white"
                    }`}
                  >
                    {isBlurred ? "LOCK 🔒" : copied ? "COPIED! ✅" : "COPY"}{" "}
                    {!isBlurred && !copied && <CopyIcon size={12} />}
                  </span>
                </div>
              )}
            </div>

            {/* Circular Confidence Gauge */}
            <div
              className={`relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0 ${
                isBlurred ? "blur-sm opacity-40" : ""
              }`}
            >
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
                    match.confidence >= 85
                      ? "text-[#138561]"
                      : match.confidence >= 75
                      ? "text-emerald-500"
                      : "text-zinc-500"
                  }
                  strokeDasharray={`${match.confidence}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono font-bold text-sm sm:text-base text-white">
                  {match.confidence}
                </span>
                <span className="text-[9px] text-zinc-500 font-mono -mt-1">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Toggle Analysis Button */}
        <div className="mt-4 pt-3 border-t border-zinc-800/50 flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (actuallyLocked) {
                window.location.href = "/dashboard/subscription";
              } else {
                setShowAnalysis(!showAnalysis);
              }
            }}
            className="group/btn flex items-center gap-2 px-3 py-1 rounded bg-[#121215] border border-zinc-800 hover:border-zinc-700 transition-colors"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                actuallyLocked ? "bg-zinc-600" : "bg-[#138561] animate-pulse"
              }`}
            ></span>
            <span className="text-[11px] font-mono font-bold text-zinc-300 group-hover/btn:text-white transition-colors uppercase">
              {actuallyLocked
                ? "UNLOCK PRO INSIGHTS"
                : showAnalysis
                ? "HIDE ANALYSIS"
                : "VIEW AI ANALYSIS"}
            </span>
          </button>
        </div>
      </div>

      {/* Expanded Analysis Drawer */}
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
            {match.analysis}
          </p>
        </div>
      </div>
    </div>
  );
}
