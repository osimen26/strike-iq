"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MatchCard } from "@/components/dashboard/MatchCard";
import { createClient } from "@/lib/supabase/client";
import SignInModal from "@/components/auth/SignInModal";

export default function PredictionsFeed() {
  const [activeSport, setActiveSport] = useState("All");
  const [activeLeague, setActiveLeague] = useState("All");
  const [dateFilter, setDateFilter] = useState("All"); 
  const [minConfidence, setMinConfidence] = useState(0); 
  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProUser, setIsProUser] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const supabase = createClient();

  const isGuest = !user;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // Check if user is pro
    fetch("/api/subscriptions/current")
      .then((r) => r.json())
      .then((sub) => {
        if (sub.success && sub.isPro) {
          setIsProUser(true);
        }
      })
      .catch(() => {});

    fetch("/api/feed")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const all = [...(data.data.proPicks || []), ...(data.data.matches || [])];
          setPredictions(all);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const uniqueLeagues = Array.from(new Set(predictions.map((p) => p.league)))
    .filter(Boolean)
    .sort() as string[];

  const filtered = predictions.filter((pred) => {
    const matchesSport =
      activeSport === "All" ||
      (activeSport === "Football" && pred.sport === "football") ||
      (activeSport === "Basketball" && pred.sport === "basketball");
      
    const matchesSearch =
      !searchQuery ||
      pred.homeTeam?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pred.awayTeam?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pred.league?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesLeague = activeLeague === "All" || pred.league === activeLeague;
    
    const conf = pred.confidence || 0;
    const matchesConfidence = conf >= minConfidence;
    
    let matchesDate = true;
    if (dateFilter === "Upcoming") {
      if (pred.status === "FINISHED" || pred.status === "COMPLETED") matchesDate = false;
    } else if (dateFilter === "Past") {
      if (pred.status !== "FINISHED" && pred.status !== "COMPLETED") matchesDate = false;
    }

    return matchesSport && matchesSearch && matchesLeague && matchesConfidence && matchesDate;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-zinc-900 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-primary-600 font-bold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse"></span>
            AI PREDICTION TERMINAL // ALL MARKETS
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white font-heading uppercase tracking-tight">
            AI PREDICTIONS FEED
          </h1>
          <p className="text-zinc-400 text-sm font-mono mt-1">
            Discover high-value quantitative betting opportunities & freemium daily booking codes powered by Strike IQ.
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">🔍</span>
          <input
            type="text"
            placeholder="Search teams or leagues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#09090b] border border-zinc-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-primary-600 transition-colors"
          />
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Sport Filters */}
        <div className="flex bg-[#09090b] p-1 rounded-lg border border-zinc-800 shrink-0 font-mono">
          {["All", "Football", "Basketball"].map((sport) => (
            <button
              key={sport}
              onClick={() => {
                setActiveSport(sport);
                setActiveLeague("All"); // Reset league when sport changes
              }}
              className={`px-4 py-2 rounded-md text-xs font-bold transition-all duration-200 whitespace-nowrap uppercase tracking-wider ${
                activeSport === sport
                  ? "bg-primary-600 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-[#121215]"
              }`}
            >
              {sport === "All" ? "ALL SPORTS" : sport}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 font-mono text-xs w-full md:w-auto">
          {/* League Dropdown */}
          <select
            value={activeLeague}
            onChange={(e) => setActiveLeague(e.target.value)}
            className="bg-[#09090b] border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-600 appearance-none flex-1 min-w-[140px]"
          >
            <option value="All">ALL LEAGUES</option>
            {uniqueLeagues.map(league => (
              <option key={league} value={league}>{league.toUpperCase()}</option>
            ))}
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-[#09090b] border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-600 appearance-none flex-1 min-w-[120px]"
          >
            <option value="All">ALL DATES</option>
            <option value="Upcoming">UPCOMING</option>
            <option value="Past">PAST RESULTS</option>
          </select>

          {/* Confidence Filter */}
          <select
            value={minConfidence}
            onChange={(e) => setMinConfidence(Number(e.target.value))}
            className="bg-[#09090b] border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-600 appearance-none flex-1 min-w-[140px]"
          >
            <option value={0}>ALL CONFIDENCE</option>
            <option value={70}>70%+ CONFIDENCE</option>
            <option value={80}>80%+ CONFIDENCE (VIP)</option>
          </select>
        </div>
      </div>

      {/* Feed */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#09090b] rounded-xl border border-zinc-800/80">
          <div className="w-10 h-10 border-2 border-zinc-800 border-t-[var(--primary-600)] rounded-full animate-spin mb-4"></div>
          <p className="text-zinc-400 font-mono text-xs uppercase tracking-widest animate-pulse">Syncing Quantitative Models...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 mt-4 rounded-xl bg-[#09090b] border border-dashed border-zinc-800 text-center flex flex-col items-center justify-center text-zinc-400 font-mono">
          <span className="text-5xl mb-4 opacity-50">⚽</span>
          <h3 className="text-base text-white font-heading tracking-wide uppercase mb-2">
            No Predictions Found
          </h3>
          <p className="text-xs max-w-md text-zinc-400 leading-relaxed font-sans mb-6">
            Adjust your filters or try a different search term.
          </p>
          <button
            onClick={() => { setActiveSport("All"); setActiveLeague("All"); setDateFilter("All"); setMinConfidence(0); setSearchQuery(""); }}
            className="px-5 py-2 rounded-lg bg-primary-600 text-white text-xs font-mono font-bold hover:bg-[#0f6b4d] transition-all uppercase tracking-wider"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((pred) => {
            const isLocked = pred.isProPick && !isProUser;
            return (
              <MatchCard
                key={pred.id}
                match={pred}
                isLocked={isLocked}
                isGuest={isGuest}
                onRequireLogin={() => setIsAuthModalOpen(true)}
              />
            );
          })}
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
