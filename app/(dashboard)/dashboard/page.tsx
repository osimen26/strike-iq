"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { getTeamLogo, getLeagueLogo } from "@/lib/logos";
import {
  ZapIcon,
  LockIcon,
  TicketIcon,
  CopyIcon,
  CrownIcon,
} from "@/components/icons/Icons";



function MatchCard({ match, isLocked }: { match: any, isLocked?: boolean }) {
  const [showAnalysis, setShowAnalysis] = useState(false);

  const glowColor = match.confidence >= 85 ? "#138561" : 
                    match.confidence >= 75 ? "#108960" : 
                    "#52525b";

  return (
    <div className={`relative group rounded-xl bg-[#09090b] border ${match.isProPick ? 'border-[#138561]/80 shadow-[0_0_20px_rgba(19,133,97,0.15)]' : 'border-zinc-800/80'} overflow-hidden transition-all duration-200 hover:border-zinc-700`}>
      
      <div className="relative z-10 p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* LEFT: Match Info & Teams */}
          <div className="flex-1 flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Meta Info */}
            <div className="w-full md:w-36 shrink-0 flex flex-row md:flex-col items-center md:items-start justify-between border-b md:border-b-0 md:border-r border-zinc-800/80 pb-3 md:pb-0 md:pr-4">
              <div className="flex items-center gap-2 mb-0 md:mb-1.5">
                <div className="w-4 h-4 flex items-center justify-center opacity-80">
                  <img src={getLeagueLogo(match.league, match.sport)} alt={match.league} className="max-w-full max-h-full object-contain" />
                </div>
                <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider line-clamp-1">{match.league}</span>
              </div>
              <div className="text-right md:text-left">
                <div className="text-xs font-mono font-bold text-[#138561]">{match.date}</div>
                <div className="text-[11px] text-zinc-500 font-mono mt-0.5">{match.time}</div>
              </div>
            </div>

            {/* Teams */}
            <div className="flex-1 flex items-center justify-center md:justify-start gap-4 w-full">
              <div className="flex flex-col items-center gap-2 w-2/5">
                <div className="w-12 h-12 rounded-lg bg-[#121215] border border-zinc-800 flex items-center justify-center overflow-hidden p-2 shadow-inner">
                  <img src={getTeamLogo(match.homeTeam)} alt={match.homeTeam} className="w-full h-full object-contain" />
                </div>
                <span title={match.homeTeam} className="font-mono font-bold text-xs sm:text-sm text-white text-center line-clamp-1">{match.homeTeam}</span>
              </div>
              
              <div className="px-2 py-0.5 bg-[#121215] rounded border border-zinc-800 text-[10px] font-bold text-zinc-500 font-mono shrink-0">
                VS
              </div>

              <div className="flex flex-col items-center gap-2 w-2/5">
                <div className="w-12 h-12 rounded-lg bg-[#121215] border border-zinc-800 flex items-center justify-center overflow-hidden p-2 shadow-inner">
                  <img src={getTeamLogo(match.awayTeam)} alt={match.awayTeam} className="w-full h-full object-contain" />
                </div>
                <span title={match.awayTeam} className="font-mono font-bold text-xs sm:text-sm text-white text-center line-clamp-1">{match.awayTeam}</span>
              </div>
            </div>
          </div>

          {/* RIGHT: AI Prediction & Confidence Ring */}
          <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 border-zinc-800/80 pt-5 lg:pt-0 w-full lg:w-auto relative">
            
            {isLocked && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 rounded-lg border border-zinc-800 p-2 text-center">
                <LockIcon size={24} className="text-zinc-400 mb-1" />
                <a href="/dashboard/subscription" className="text-[10px] font-mono font-bold text-[#138561] hover:underline uppercase tracking-widest cursor-pointer">
                  PRO TIER REQUIRED
                </a>
              </div>
            )}

            {/* The Verdict */}
            <div className={`flex flex-col items-start lg:items-end gap-2 flex-1 lg:flex-none ${isLocked ? 'blur-sm opacity-40' : ''}`}>
              <div className="flex flex-wrap gap-1.5 mb-0.5">
                {match.status === 'WON' && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider whitespace-nowrap shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                    ✅ WON (+0.85u)
                  </span>
                )}
                {match.status === 'LOST' && (
                  <span className="px-2 py-0.5 rounded bg-red-500/20 border border-red-500/40 text-[9px] font-mono font-bold text-red-400 uppercase tracking-wider whitespace-nowrap">
                    ❌ LOST (-1.0u)
                  </span>
                )}
                {match.status === 'VOID' && (
                  <span className="px-2 py-0.5 rounded bg-zinc-500/20 border border-zinc-500/40 text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                    ⚪ VOID
                  </span>
                )}
                {match.isProPick && (
                  <span className="px-2 py-0.5 rounded bg-[#138561]/20 border border-[#138561]/40 text-[9px] font-mono font-bold text-[#138561] uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
                    <CrownIcon size={12} /> PRO EDGE
                  </span>
                )}
                {match.tags?.map((tag: string) => (
                  <span key={tag} className="px-2 py-0.5 rounded bg-[#121215] border border-zinc-800 text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="px-3.5 py-2 bg-[#121215] rounded-lg border border-zinc-800/80 w-full lg:w-auto flex items-center justify-between lg:justify-end gap-3 shadow-sm">
                <span className="text-xs font-mono text-zinc-400 uppercase">MODEL PICK:</span>
                <span className="font-mono font-bold text-sm text-[#138561] tracking-tight">{match.prediction}</span>
              </div>
              {match.bookingCode && (
                <div 
                  onClick={() => {
                    navigator.clipboard.writeText(match.bookingCode);
                    alert(`Copied ${match.bookmaker || 'Booking'} Code: ${match.bookingCode}`);
                  }}
                  title="Click to copy booking code"
                  className="px-3 py-1.5 bg-gradient-to-r from-[#138561]/25 to-emerald-950/40 rounded-lg border border-[#138561]/60 w-full lg:w-auto flex items-center justify-between lg:justify-end gap-2.5 shadow-[0_0_12px_rgba(19,133,97,0.2)] cursor-pointer hover:border-emerald-400 transition-all group/code"
                >
                  <span className="text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <TicketIcon size={14} className="text-[#138561]" /> {match.bookmaker || 'BOOKING CODE'}:
                  </span>
                  <span className="font-mono font-bold text-xs text-white tracking-widest select-all bg-black/40 px-2 py-0.5 rounded border border-white/10 group-hover/code:border-[#138561]">
                    {match.bookingCode}
                  </span>
                  <span className="text-[10px] text-[#138561] group-hover/code:text-white transition-colors flex items-center gap-1">COPY <CopyIcon size={12} /></span>
                </div>
              )}
            </div>

            {/* Circular Confidence Gauge */}
            <div className={`relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0 ${isLocked ? 'blur-sm opacity-40' : ''}`}>
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-zinc-800"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                />
                <path
                  className="transition-all duration-700 ease-out"
                  strokeDasharray={`${match.confidence}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={glowColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono font-bold text-sm sm:text-base text-white">{match.confidence}</span>
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
              if (isLocked) {
                window.location.href = "/dashboard/subscription";
              } else {
                setShowAnalysis(!showAnalysis);
              }
            }}
            className="group/btn flex items-center gap-2 px-3 py-1 rounded bg-[#121215] border border-zinc-800 hover:border-zinc-700 transition-colors"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isLocked ? 'bg-zinc-600' : 'bg-[#138561] animate-pulse'}`}></span>
            <span className="text-[11px] font-mono font-bold text-zinc-300 group-hover/btn:text-white transition-colors uppercase">
              {isLocked ? "LOCK // UNLOCK ANALYSIS" : showAnalysis ? "CLOSE ANALYSIS" : "READ RATIONALE"}
            </span>
          </button>
        </div>
      </div>

      {/* Expanded Analysis Drawer */}
      <div 
        className={`bg-[#050507] border-t border-zinc-800/80 transition-all duration-300 ease-in-out overflow-hidden ${
          showAnalysis && !isLocked ? "max-h-96 opacity-100 py-5" : "max-h-0 opacity-0 py-0"
        }`}
      >
        <div className="px-5 sm:px-6 text-xs text-zinc-300 leading-relaxed font-mono">
          <span className="font-bold text-[#138561] uppercase mr-2">[RATIONALE // METRICS]:</span>
          {match.analysis}
        </div>
      </div>
    </div>
  );
}

export default function PredictionsFeed() {
  const [user, setUser] = useState<User | null>(null);
  const [isProUser, setIsProUser] = useState(false);
  const supabase = createClient();
  const [activeFilter, setActiveFilter] = useState("All");
  
  const [matches, setMatches] = useState<any[]>([]);
  const [proPicks, setProPicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the real user and their subscription status in parallel
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    fetch('/api/subscriptions/current')
      .then((r) => r.json())
      .then((sub) => {
        if (sub.success && sub.isPro) {
          setIsProUser(true);
        }
      })
      .catch(() => {}); // Non-critical — free tier is the safe fallback

    const fetchFeed = async () => {
      try {
        const res = await fetch("/api/feed");
        const data = await res.json();
        if (data.success) {
          setProPicks(data.data.proPicks || []);
          setMatches(data.data.matches || []);
        }
      } catch (err) {
        console.error("Failed to load predictions feed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, []);

  // Deduplicate by id, pro picks first
  const seen = new Set<string>();
  const combinedFeed = [...proPicks, ...matches].filter(m => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });

  const filteredMatches = combinedFeed.filter(match => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Football") return match.sport === "football";
    if (activeFilter === "Basketball") return match.sport === "basketball";
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-8 pt-2 border-b border-zinc-900 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#138561] font-bold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-[#138561] animate-pulse"></span>
            AI PREDICTION TERMINAL // LIVE FEED
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white font-heading tracking-tight mb-2 flex items-center gap-3 uppercase">
            STRATEGY DESK: <span className="text-[#138561]">{user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || "STRATEGIST"}</span>
            {isProUser && <span className="px-2 py-0.5 bg-[#138561]/20 text-[#138561] border border-[#138561]/40 rounded text-[10px] font-mono uppercase tracking-widest font-bold">PRO MEMBER</span>}
          </h1>
          <p className="text-zinc-400 text-sm font-mono">Real-time quantitative odds, Strike-IQ proprietary match analytics, and high-confidence algorithmic betting rationales across elite global leagues.</p>
        </div>
        
        {/* Sleek Filters */}
        <div className="flex bg-[#09090b] p-1 rounded-lg border border-zinc-800 self-start shrink-0 overflow-x-auto max-w-full font-mono">
          {["All", "Football", "Basketball"].map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2 rounded-md text-xs font-bold transition-all duration-200 whitespace-nowrap uppercase tracking-wider ${
                activeFilter === filter 
                  ? "bg-[#138561] text-white shadow-sm shadow-[#138561]/20" 
                  : "text-zinc-400 hover:text-white hover:bg-[#121215]"
              }`}
            >
              {filter === "All" ? "ALL MARKETS" : filter.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Predictions Feed list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#09090b] rounded-xl border border-zinc-800/80">
          <div className="w-10 h-10 border-2 border-zinc-800 border-t-[#138561] rounded-full animate-spin mb-4"></div>
          <p className="text-zinc-400 font-mono text-xs uppercase tracking-widest animate-pulse">SYNCING QUANTITATIVE MODELS...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMatches.length > 0 ? (
            filteredMatches.map(match => {
              // Lock the match if it's a Pro Pick and the user is NOT a Pro User
              const isLocked = match.isProPick && !isProUser;
              
              return <MatchCard key={match.id} match={match} isLocked={isLocked} />
            })
          ) : (
            <div className="p-12 mt-4 rounded-xl bg-[#09090b] border border-dashed border-zinc-800 text-center flex flex-col items-center justify-center text-zinc-400 font-mono">
              <div className="w-12 h-12 rounded-2xl bg-[#138561]/10 border border-[#138561]/30 flex items-center justify-center text-[#138561] mb-4 shadow-[0_0_15px_rgba(19,133,97,0.15)]">
                <ZapIcon size={24} className="text-[#138561]" />
              </div>
              <h3 className="text-base text-white font-heading tracking-wide uppercase mb-2">NO ACTIVE {activeFilter !== "All" ? activeFilter.toUpperCase() : ""} FIXTURES RIGHT NOW</h3>
              <p className="text-xs max-w-md text-zinc-400 leading-relaxed font-sans mb-6">
                Our proprietary Strike-IQ quantitative engines are continuously scanning upcoming schedules and market odds. New high-confidence algorithmic predictions will appear here automatically once lines open.
              </p>
              {activeFilter !== "All" && (
                <button onClick={() => setActiveFilter("All")} className="px-5 py-2 rounded-lg bg-[#138561] text-white text-xs font-mono font-bold hover:bg-[#0f6b4d] transition-all uppercase tracking-wider shadow-md">
                  View All Markets
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
