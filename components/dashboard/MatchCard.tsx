"use client";

import { useState } from "react";
import { getTeamLogo, getLeagueLogo } from "@/lib/logos";
import {
  ZapIcon,
  LockIcon,
  TicketIcon,
  CopyIcon,
  CrownIcon,
  SparklesIcon,
} from "@/components/icons/Icons";

export function MatchCard({ match, isLocked }: { match: any; isLocked?: boolean }) {
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Freemium items are NEVER locked, regardless of subscription
  const actuallyLocked = isLocked && !match.isFreePick;

  // Determine if this item is a Booking Code / Accumulator Slip
  // (e.g. Free Daily Teaser, Community Slip, or any pick with a booking code)
  const isBookingSlip =
    Boolean(match.bookingCode) ||
    match.isFreePick ||
    match.league?.toUpperCase().includes("FREE") ||
    match.league?.toUpperCase().includes("TEASER") ||
    match.awayTeam?.toUpperCase().includes("CODE") ||
    match.homeTeam?.toLowerCase().includes("odd") ||
    match.prediction?.toUpperCase().includes("CODE") ||
    match.tags?.some((t: any) =>
      typeof t === "string" &&
      (t.toUpperCase().includes("BOOKING") ||
        t.toUpperCase().includes("TEASER") ||
        t.toUpperCase().includes("SLIP") ||
        t.toUpperCase().includes("FREE"))
    );

  const glowColor =
    match.confidence >= 85
      ? "#138561"
      : match.confidence >= 75
      ? "#108960"
      : "#52525b";

  // Helper: Extract platform name (SportyBet, 1xBet, Bet9ja, etc.) if not explicitly set
  const getBettingPlatform = () => {
    if (match.bookmaker && match.bookmaker.trim() !== "") {
      return match.bookmaker;
    }
    const checkStr = `${match.awayTeam || ""} ${match.prediction || ""} ${
      match.tags?.join(" ") || ""
    }`.toLowerCase();
    if (checkStr.includes("sportybet") || checkStr.includes("sporty")) return "SportyBet";
    if (checkStr.includes("1xbet")) return "1xBet";
    if (checkStr.includes("bet9ja")) return "Bet9ja";
    if (checkStr.includes("betking")) return "BetKing";
    if (checkStr.includes("msport")) return "MSport";
    if (checkStr.includes("pari") || checkStr.includes("parimatch")) return "Parimatch";
    return "SportyBet / Betting Platform";
  };

  // Helper: Extract actual code if it was typed inside awayTeam or prediction
  const getCleanBookingCode = () => {
    if (match.bookingCode && match.bookingCode.trim() !== "") {
      return match.bookingCode;
    }
    const checkStr = `${match.awayTeam || ""} ${match.prediction || ""}`;
    const matchFound = checkStr.match(/CODE:\s*([A-Za-z0-9]+)/i);
    if (matchFound && matchFound[1]) {
      return matchFound[1].toUpperCase();
    }
    if (match.awayTeam && !match.awayTeam.includes(" ")) {
      return match.awayTeam.toUpperCase();
    }
    return "CHECK ANALYSIS FOR CODE";
  };

  // ==========================================
  // 1. BOOKING CODE SLIP LAYOUT
  // Strictly follows user rules:
  // - No glowing effects or shadows
  // - No VS (not a 1v1 match)
  // - Shows Booking Code + Betting Platform prominently
  // - Strike IQ Logo (/favicon.svg) right beside header
  // - NO AI Prediction row displayed
  // ==========================================
  if (isBookingSlip) {
    const bettingPlatform = getBettingPlatform();
    const cleanCode = getCleanBookingCode();
    const headerTitle = match.league || "FREE DAILY TEASER";

    return (
      <div className="relative group rounded-xl bg-[#09090b] border border-zinc-800/90 overflow-hidden transition-all duration-200 hover:border-zinc-700">
        <div className="relative z-10 p-5 sm:p-6">
          {/* Top Header: Strike IQ Logo + Header Title + Badges + Date */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-zinc-800/80">
            <div className="flex flex-wrap items-center gap-3">
              {/* Strike IQ Logo right beside the Free Daily header */}
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#121215] border border-zinc-800 flex items-center justify-center p-1.5 shrink-0">
                  <img src="/favicon.svg" alt="Strike IQ" className="w-full h-full object-contain" />
                </div>
                <span className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                  {headerTitle}
                </span>
              </div>

              {match.isFreePick && (
                <span className="px-2.5 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  🎁 FREE COMMUNITY SLIP
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
              {match.time && (
                <span className="text-zinc-500 ml-2">{match.time}</span>
              )}
            </div>
          </div>

          {/* Center: Betting Platform + Booking Code & AI Rating Ring (NO GLOW, NO VS, NO AI PREDICTION) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 relative">
            {actuallyLocked && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = "/dashboard/subscription";
                }}
                className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 rounded-xl border border-zinc-700 p-4 text-center cursor-pointer hover:bg-black transition-all group/lock"
              >
                <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-1 group-hover/lock:scale-110 transition-transform">
                  <LockIcon size={18} className="text-emerald-400" />
                </div>
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-0.5">
                  {bettingPlatform} BOOKING CODE LOCKED
                </span>
                <span className="text-[11px] font-mono font-bold text-emerald-400 underline underline-offset-2 tracking-widest">
                  ⚡ UPGRADE TO PRO ($9.99) TO COPY SLIP
                </span>
              </div>
            )}

            {/* ONLY THE BETTING PLATFORM & BOOKING CODE (FLAT MATTE DARK BOX, NO GLOW) */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (actuallyLocked) {
                  window.location.href = "/dashboard/subscription";
                  return;
                }
                navigator.clipboard.writeText(cleanCode);
                alert(
                  `Copied ${bettingPlatform} Booking Code: ${cleanCode}`
                );
              }}
              title={
                actuallyLocked
                  ? "Upgrade to Pro to copy booking code"
                  : "Click to copy booking code"
              }
              className={`flex-1 p-5 sm:p-6 rounded-xl border bg-[#121215] border-zinc-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-5 cursor-pointer transition-all group/code hover:border-zinc-700 ${
                actuallyLocked
                  ? "blur-sm opacity-40 pointer-events-none select-none"
                  : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                    match.isFreePick
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
                    <span className="text-zinc-600">//</span>
                    <span>BOOKING CODE SLIP</span>
                  </div>
                  <div
                    className={`font-mono font-extrabold text-2xl sm:text-3xl text-white tracking-widest select-all mt-1.5 ${
                      match.isFreePick
                        ? "group-hover/code:text-cyan-300"
                        : "group-hover/code:text-emerald-300"
                    } transition-colors`}
                  >
                    {actuallyLocked
                      ? `${cleanCode.slice(0, 2)}•••• [LOCKED]`
                      : cleanCode}
                  </div>
                </div>
              </div>

              <div
                className={`px-5 py-3 rounded-lg border font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shrink-0 ${
                  match.isFreePick
                    ? "bg-cyan-500 text-black border-cyan-400 group-hover/code:bg-cyan-400"
                    : "bg-[#138561] text-white border-emerald-400 group-hover/code:bg-emerald-600"
                }`}
              >
                <span>{actuallyLocked ? "LOCK 🔒" : "COPY CODE"}</span>
                {!actuallyLocked && <CopyIcon size={15} />}
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
                <svg
                  className="w-full h-full transform -rotate-90"
                  viewBox="0 0 36 36"
                >
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
                  <span className="font-mono font-bold text-base text-white">
                    {match.confidence}
                  </span>
                  <span className="text-[9px] text-zinc-500 font-mono -mt-1">
                    %
                  </span>
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
                {actuallyLocked
                  ? "UNLOCK PRO INSIGHTS"
                  : showAnalysis
                  ? "HIDE ANALYSIS"
                  : "VIEW AI ANALYSIS"}
              </span>
            </button>
          </div>
        </div>

        {/* ONLY THE ANALYSIS DRAWER */}
        <div
          className={`bg-[#050507] border-t border-zinc-800/80 transition-all duration-300 ease-in-out overflow-hidden ${
            showAnalysis && !actuallyLocked
              ? "max-h-96 opacity-100 py-5"
              : "max-h-0 opacity-0 py-0"
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

  // ==========================================
  // 2. STANDARD 1v1 MATCH CARD LAYOUT
  // Flat matte design with no glow effects
  // ==========================================
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
            {actuallyLocked && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = "/dashboard/subscription";
                }}
                className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 rounded-lg border border-zinc-700 p-3 text-center cursor-pointer hover:bg-black transition-all group/lock"
              >
                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-1 group-hover/lock:scale-110 transition-transform">
                  <LockIcon size={16} className="text-emerald-400" />
                </div>
                <span className="text-[11px] font-mono font-bold text-white uppercase tracking-wider mb-0.5">
                  {match.bookingCode
                    ? `${match.bookmaker || "VIP"} CODE LOCKED`
                    : "VIP GAME VERDICT LOCKED"}
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-400 underline underline-offset-2 tracking-widest">
                  ⚡ UPGRADE TO PRO ($9.99) TO COPY SLIP
                </span>
              </div>
            )}

            {/* The Verdict */}
            <div
              className={`flex flex-col items-start lg:items-end gap-2 flex-1 lg:flex-none ${
                actuallyLocked
                  ? "blur-sm opacity-40 select-none pointer-events-none"
                  : ""
              }`}
            >
              <div className="flex flex-wrap gap-1.5 mb-0.5">
                {match.status === "WON" && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider whitespace-nowrap">
                    ✅ WON (+0.85u)
                  </span>
                )}
                {match.status === "LOST" && (
                  <span className="px-2 py-0.5 rounded bg-red-500/15 border border-red-500/30 text-[9px] font-mono font-bold text-red-400 uppercase tracking-wider whitespace-nowrap">
                    ❌ LOST (-1.0u)
                  </span>
                )}
                {match.status === "VOID" && (
                  <span className="px-2 py-0.5 rounded bg-zinc-500/15 border border-zinc-500/30 text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                    ⚪ VOID
                  </span>
                )}
                {match.isFreePick && (
                  <span className="px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
                    🎁 FREE COMMUNITY SLIP
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
                  onClick={(e) => {
                    e.stopPropagation();
                    if (actuallyLocked) {
                      window.location.href = "/dashboard/subscription";
                      return;
                    }
                    navigator.clipboard.writeText(match.bookingCode);
                    alert(
                      `Copied ${match.bookmaker || "Booking"} Code: ${
                        match.bookingCode
                      }`
                    );
                  }}
                  title={
                    actuallyLocked
                      ? "Upgrade to Pro to copy booking code"
                      : "Click to copy booking code"
                  }
                  className="px-3 py-1.5 rounded-lg border bg-[#121215] border-zinc-800 w-full lg:w-auto flex items-center justify-between lg:justify-end gap-2.5 cursor-pointer transition-all group/code hover:border-zinc-700"
                >
                  <span className="text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <TicketIcon
                      size={14}
                      className={
                        match.isFreePick ? "text-cyan-400" : "text-[#138561]"
                      }
                    />{" "}
                    {match.bookmaker || "BOOKING CODE"}:
                  </span>
                  <span
                    className={`font-mono font-bold text-xs text-white tracking-widest select-all bg-black/40 px-2 py-0.5 rounded border border-zinc-800 ${
                      match.isFreePick
                        ? "group-hover/code:border-cyan-400"
                        : "group-hover/code:border-[#138561]"
                    }`}
                  >
                    {actuallyLocked
                      ? `${match.bookingCode.slice(0, 2)}•••• [LOCKED]`
                      : match.bookingCode}
                  </span>
                  <span
                    className={`text-[10px] transition-colors flex items-center gap-1 ${
                      match.isFreePick
                        ? "text-cyan-400 group-hover/code:text-white"
                        : "text-[#138561] group-hover/code:text-white"
                    }`}
                  >
                    {actuallyLocked ? "LOCK 🔒" : "COPY"}{" "}
                    {!actuallyLocked && <CopyIcon size={12} />}
                  </span>
                </div>
              )}
            </div>

            {/* Circular Confidence Gauge */}
            <div
              className={`relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0 ${
                actuallyLocked ? "blur-sm opacity-40" : ""
              }`}
            >
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 36 36"
              >
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
                <span className="text-[9px] text-zinc-500 font-mono -mt-1">
                  %
                </span>
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
          showAnalysis && !actuallyLocked
            ? "max-h-96 opacity-100 py-5"
            : "max-h-0 opacity-0 py-0"
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
