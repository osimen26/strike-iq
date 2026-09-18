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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MatchItem } from "@/types";

interface MatchCardVerdictProps {
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
  const bookingCodeVal = match.bookingCode ?? "";
  const confidenceVal = match.confidence ?? 0;

  const handleCopy = (e: React.MouseEvent, textToCopy: string = "") => {
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
    setTimeout(() => setCopied(false), 2000);
  };

  // Confidence colour thresholds
  const confidenceColor =
    confidenceVal >= 85
      ? "text-primary-600"
      : confidenceVal >= 75
      ? "text-emerald-500"
      : "text-zinc-500";

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
                <div className="text-xs font-mono font-bold text-primary-600">{match.date}</div>
                <div className="text-[11px] text-zinc-500 font-mono mt-0.5">{match.time}</div>
              </div>
            </div>

            {/* Teams */}
            <div className="flex-1 flex items-center justify-center md:justify-start gap-4 w-full">
              <div className="flex flex-col items-center gap-2 w-2/5">
                <div className="w-12 h-12 rounded-lg bg-[#121215] border border-zinc-800 flex items-center justify-center overflow-hidden p-2">
                  <img src={getTeamLogo(match.homeTeam)} alt={match.homeTeam} className="w-full h-full object-contain" />
                </div>
                <span title={match.homeTeam} className="font-mono font-bold text-xs sm:text-sm text-white text-center line-clamp-1">
                  {match.homeTeam}
                </span>
              </div>

              <div className="px-2 py-0.5 bg-[#121215] rounded border border-zinc-800 text-[10px] font-bold text-zinc-500 font-mono shrink-0">
                VS
              </div>

              <div className="flex flex-col items-center gap-2 w-2/5">
                <div className="w-12 h-12 rounded-lg bg-[#121215] border border-zinc-800 flex items-center justify-center overflow-hidden p-2">
                  <img src={getTeamLogo(match.awayTeam)} alt={match.awayTeam} className="w-full h-full object-contain" />
                </div>
                <span title={match.awayTeam} className="font-mono font-bold text-xs sm:text-sm text-white text-center line-clamp-1">
                  {match.awayTeam}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: AI Prediction & Confidence */}
          <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 border-zinc-800/80 pt-5 lg:pt-0 w-full lg:w-auto relative">

            {/* Lock overlay */}
            {actuallyLocked && !isTeasing && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  if (requiresGuestAuth && onRequireLogin) onRequireLogin();
                  else window.location.href = "/dashboard/subscription";
                }}
                className="absolute -inset-2 z-30 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md rounded-xl border border-white/5 p-3 text-center cursor-pointer hover:bg-black/60 transition-all duration-300 animate-fadeIn shadow-2xl"
              >
                <div className="w-8 h-8 rounded-full bg-primary-600/10 border border-primary-600/30 flex items-center justify-center mb-2">
                  <LockIcon size={14} className="text-primary-600" />
                </div>
                <span className="text-[11px] font-mono font-bold text-white uppercase tracking-wider mb-1">
                  {match.bookingCode ? `${match.bookmaker || "VIP"} CODE LOCKED` : "VIP GAME VERDICT LOCKED"}
                </span>
                <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-primary-500 tracking-widest bg-primary-950/40 px-2 py-0.5 rounded-full border border-primary-900/50">
                  <ZapIcon size={10} />
                  <span>{requiresGuestAuth ? "SIGN IN TO UNLOCK" : "UPGRADE TO PRO TO UNLOCK"}</span>
                </span>
              </div>
            )}

            {/* Verdict + Status Badges */}
            <div className={`flex flex-col items-start lg:items-end gap-2 flex-1 lg:flex-none ${isBlurred ? "blur-sm opacity-40 select-none pointer-events-none" : ""}`}>

              {/* Status badges using shadcn Badge */}
              <div className="flex flex-wrap gap-1.5 mb-0.5">
                {match.status === "WON" && (
                  <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 text-[9px] font-mono uppercase tracking-wider gap-1">
                    <CheckCircleIcon size={10} /> WON (+0.85u)
                  </Badge>
                )}
                {match.status === "LOST" && (
                  <Badge className="bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/20 text-[9px] font-mono uppercase tracking-wider gap-1">
                    <XCircleIcon size={10} /> LOST (-1.0u)
                  </Badge>
                )}
                {match.status === "VOID" && (
                  <Badge className="bg-zinc-500/15 text-zinc-400 border-zinc-500/30 hover:bg-zinc-500/20 text-[9px] font-mono uppercase tracking-wider gap-1">
                    <AlertCircleIcon size={10} /> VOID
                  </Badge>
                )}
                {match.status === "PENDING" && (
                  <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/20 text-[9px] font-mono uppercase tracking-wider gap-1">
                    <HourglassIcon size={10} /> PENDING
                  </Badge>
                )}
                {match.isFreePick && (
                  <Badge className="bg-cyan-500/15 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20 text-[9px] font-mono uppercase tracking-wider gap-1">
                    <GiftIcon size={10} /> FREE COMMUNITY SLIP
                  </Badge>
                )}
                {match.isProPick && !match.isFreePick && (
                  <Badge className="bg-primary-600/15 text-primary-600 border-primary-600/30 hover:bg-primary-600/20 text-[9px] font-mono uppercase tracking-wider gap-1">
                    <CrownIcon size={10} /> PRO EDGE
                  </Badge>
                )}
                {match.tags?.map((tag: string) => (
                  <Badge key={tag} variant="outline" className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider border-zinc-800">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* AI Prediction row */}
              <div className="px-3.5 py-2 bg-[#121215] rounded-lg border border-zinc-800/80 w-full lg:w-auto flex items-center justify-between lg:justify-end gap-3">
                <span className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <SparklesIcon size={13} className="text-primary-600" />
                  AI PREDICTION:
                </span>
                <span className="font-mono font-bold text-sm text-primary-600 tracking-tight">
                  {match.prediction}
                </span>
              </div>

              {/* Booking Code */}
              {match.bookingCode && (
                <div
                  onClick={(e) => handleCopy(e, bookingCodeVal)}
                  title={
                    requiresGuestAuth
                      ? "Sign in to copy booking code"
                      : requiresProAuth
                      ? "Upgrade to Pro to copy booking code"
                      : "Click to copy booking code"
                  }
                  className={`px-3 py-1.5 rounded-lg border bg-[#121215] w-full lg:w-auto flex items-center justify-between lg:justify-end gap-2.5 cursor-pointer transition-all group/code ${
                    copied ? "border-emerald-500 bg-emerald-950/30" : "border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <TicketIcon size={14} className={match.isFreePick ? "text-cyan-400" : "text-primary-600"} />{" "}
                    {match.bookmaker || "BOOKING CODE"}:
                  </span>
                  <span className={`font-mono font-bold text-xs tracking-widest select-all bg-black/40 px-2 py-0.5 rounded border ${
                    copied ? "text-emerald-400 border-emerald-500/60" : "text-white border-zinc-800 group-hover/code:border-primary-600"
                  }`}>
                    {isBlurred ? `${bookingCodeVal.slice(0, 2)}•••• [LOCKED]` : bookingCodeVal}
                  </span>
                  <span className={`text-[10px] transition-colors flex items-center gap-1 font-bold ${
                    copied ? "text-emerald-400" : match.isFreePick ? "text-cyan-400 group-hover/code:text-white" : "text-primary-600 group-hover/code:text-white"
                  }`}>
                    {isBlurred ? "LOCK 🔒" : copied ? "COPIED! ✅" : "COPY"}{" "}
                    {!isBlurred && !copied && <CopyIcon size={12} />}
                  </span>
                </div>
              )}
            </div>

            {/* Circular Confidence Gauge — shadcn Tooltip wrapping */}
            <Tooltip>
              <TooltipTrigger render={<div className={`relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0 cursor-default ${isBlurred ? "blur-sm opacity-40" : ""}`} />}>
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-zinc-800"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    />
                    <path
                      className={confidenceColor}
                      strokeDasharray={`${confidenceVal}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-mono font-bold text-sm sm:text-base text-white">{confidenceVal}</span>
                    <span className="text-[9px] text-zinc-500 font-mono -mt-1">%</span>
                  </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-zinc-900 border-zinc-700 text-white text-xs font-mono">
                <p>AI Confidence: <span className="font-bold text-primary-600">{confidenceVal}%</span></p>
                <p className="text-zinc-400 text-[10px] mt-0.5">
                  {confidenceVal >= 85 ? "🔥 High conviction signal" : confidenceVal >= 75 ? "✅ Moderate confidence" : "⚠️ Low confidence — use caution"}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Toggle Analysis Button — shadcn Button */}
        <div className="mt-4 pt-3 border-t border-zinc-800/50 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              if (actuallyLocked) window.location.href = "/dashboard/subscription";
              else setShowAnalysis(!showAnalysis);
            }}
            className="bg-[#121215] border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white font-mono text-[11px] uppercase tracking-wider gap-2 h-7"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${actuallyLocked ? "bg-zinc-600" : "bg-primary-600 animate-pulse"}`} />
            {actuallyLocked ? "UNLOCK PRO INSIGHTS" : showAnalysis ? "HIDE ANALYSIS" : "VIEW AI ANALYSIS"}
          </Button>
        </div>
      </div>

      {/* Expanded Analysis Drawer */}
      <div className={`bg-[#050507] border-t border-zinc-800/80 transition-all duration-300 ease-in-out overflow-hidden ${
        showAnalysis && !actuallyLocked ? "max-h-96 opacity-100 py-5" : "max-h-0 opacity-0 py-0"
      }`}>
        <div className="px-5 sm:px-6">
          <div className="flex items-center gap-2 mb-2">
            <SparklesIcon size={14} className="text-primary-600" />
            <span className="font-mono font-bold text-xs text-primary-600 uppercase tracking-wider">
              QUANT INSIGHTS & RATIONALE
            </span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed font-sans whitespace-pre-wrap">{match.analysis}</p>
        </div>
      </div>
    </div>
  );
}
