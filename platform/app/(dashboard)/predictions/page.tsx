"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MatchCard } from "@/components/dashboard/MatchCard";
import { createClient } from "@/lib/supabase/client";
import SignInModal from "@/components/auth/SignInModal";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function PredictionsFeed() {
  const [activeSport, setActiveSport] = useState("All");
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

    fetch("/api/subscriptions/current")
      .then((r) => r.json())
      .then((sub) => { if (sub.success && sub.isPro) setIsProUser(true); })
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
    return matchesSport && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-zinc-900 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-primary-600 font-bold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse" />
            AI PREDICTION TERMINAL // ALL MARKETS
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white font-heading uppercase tracking-tight">
            AI PREDICTIONS FEED
          </h1>
          <p className="text-zinc-400 text-sm font-mono mt-1">
            Discover high-value quantitative betting opportunities &amp; freemium daily booking codes powered by Strike IQ.
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

      {/* Sport Filters — shadcn Tabs */}
      <Tabs value={activeSport} onValueChange={setActiveSport} className="w-auto">
        <TabsList className="bg-[#09090b] border border-zinc-800 h-auto p-1 gap-0.5">
          {["All", "Football", "Basketball"].map((sport) => (
            <TabsTrigger
              key={sport}
              value={sport}
              className="font-mono text-xs font-bold uppercase tracking-wider px-5 py-2 data-[state=active]:bg-primary-600 data-[state=active]:text-white data-[state=inactive]:text-zinc-400 data-[state=inactive]:hover:text-white rounded-md transition-all"
            >
              {sport === "All" ? "ALL MARKETS" : sport.toUpperCase()}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Feed */}
      {loading ? (
        /* Skeleton loading cards */
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl bg-[#09090b] border border-zinc-800/90 p-5 sm:p-6">
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="flex-1 flex gap-6">
                  <div className="flex flex-col gap-2 w-32">
                    <Skeleton className="h-3 w-20 bg-zinc-800" />
                    <Skeleton className="h-3 w-14 bg-zinc-800" />
                  </div>
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex flex-col items-center gap-2 w-2/5">
                      <Skeleton className="w-12 h-12 rounded-lg bg-zinc-800" />
                      <Skeleton className="h-3 w-20 bg-zinc-800" />
                    </div>
                    <Skeleton className="h-5 w-8 bg-zinc-800 rounded" />
                    <div className="flex flex-col items-center gap-2 w-2/5">
                      <Skeleton className="w-12 h-12 rounded-lg bg-zinc-800" />
                      <Skeleton className="h-3 w-20 bg-zinc-800" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-2 items-end">
                    <Skeleton className="h-5 w-24 bg-zinc-800 rounded-full" />
                    <Skeleton className="h-8 w-40 bg-zinc-800 rounded-lg" />
                  </div>
                  <Skeleton className="w-14 h-14 rounded-full bg-zinc-800" />
                </div>
              </div>
            </div>
          ))}
          <p className="text-center text-zinc-500 font-mono text-xs uppercase tracking-widest animate-pulse">
            Syncing Quantitative Models...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 mt-4 rounded-xl bg-[#09090b] border border-dashed border-zinc-800 text-center flex flex-col items-center justify-center text-zinc-400 font-mono">
          <span className="text-5xl mb-4 opacity-50">⚽</span>
          <h3 className="text-base text-white font-heading tracking-wide uppercase mb-2">
            No {activeSport !== "All" ? activeSport.toUpperCase() : ""} Predictions Found
          </h3>
          <p className="text-xs max-w-md text-zinc-400 leading-relaxed font-sans mb-6">
            {searchQuery
              ? `No results for "${searchQuery}". Try a different search term.`
              : "No predictions available for this market right now. Check back soon for new freemium daily slips and VIP picks."}
          </p>
          {(activeSport !== "All" || searchQuery) && (
            <button
              onClick={() => { setActiveSport("All"); setSearchQuery(""); }}
              className="px-5 py-2 rounded-lg bg-primary-600 text-white text-xs font-mono font-bold hover:bg-[#0f6b4d] transition-all uppercase tracking-wider"
            >
              View All Markets
            </button>
          )}
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
