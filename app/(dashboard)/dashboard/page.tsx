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
  SparklesIcon,
} from "@/components/icons/Icons";
import { MatchCard } from "@/components/dashboard/MatchCard";
import SignInModal from "@/components/auth/SignInModal";

export default function PredictionsFeed() {
  const [user, setUser] = useState<User | null>(null);
  const [isProUser, setIsProUser] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const supabase = createClient();
  const [activeFilter, setActiveFilter] = useState("All");
  
  const [matches, setMatches] = useState<any[]>([]);
  const [proPicks, setProPicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isGuest = !user;

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
                  ? "bg-[#138561] text-white" 
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
              
              return (
                <MatchCard 
                  key={match.id} 
                  match={match} 
                  isLocked={isLocked}
                  isGuest={isGuest}
                  onRequireLogin={() => setIsAuthModalOpen(true)}
                />
              );
            })
          ) : (
            <div className="p-12 mt-4 rounded-xl bg-[#09090b] border border-dashed border-zinc-800 text-center flex flex-col items-center justify-center text-zinc-400 font-mono">
              <div className="w-14 h-14 rounded-xl bg-[#121215] border border-zinc-800 flex items-center justify-center text-[#138561] mb-5">
                <ZapIcon size={28} className="text-[#138561]" />
              </div>
              <h3 className="text-base text-white font-heading tracking-wide uppercase mb-2">NO ACTIVE {activeFilter !== "All" ? activeFilter.toUpperCase() : ""} FIXTURES RIGHT NOW</h3>
              <p className="text-xs max-w-md text-zinc-400 leading-relaxed font-sans mb-6">
                Our proprietary Strike-IQ quantitative engines are continuously scanning upcoming schedules and market odds. New high-confidence algorithmic predictions will appear here automatically once lines open.
              </p>
              {activeFilter !== "All" && (
                <button onClick={() => setActiveFilter("All")} className="px-5 py-2 rounded-lg bg-[#138561] text-white text-xs font-mono font-bold hover:bg-[#0f6b4d] transition-all uppercase tracking-wider">
                  View All Markets
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <SignInModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        reason="copy this booking code and access live quantitative signals"
      />
    </div>
  );
}
