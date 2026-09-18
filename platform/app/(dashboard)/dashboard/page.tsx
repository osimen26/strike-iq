"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import {
  ZapIcon,
  CrownIcon,
  ChartBarIcon,
} from "@/components/icons/Icons";
import { MatchCard } from "@/components/dashboard/MatchCard";
import SignInModal from "@/components/auth/SignInModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

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
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    fetch('/api/subscriptions/current')
      .then((r) => r.json())
      .then((sub) => {
        if (sub.success && sub.isPro) setIsProUser(true);
      })
      .catch(() => {});

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
          <div className="flex items-center gap-2 text-xs font-mono text-primary-600 font-bold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse"></span>
            AI PREDICTION TERMINAL // LIVE FEED
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white font-heading tracking-tight mb-2 flex items-center gap-3 uppercase">
            STRATEGY DESK: <span className="text-primary-600">{user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || "STRATEGIST"}</span>
            {isProUser && (
              <Badge className="bg-primary-600/20 text-primary-600 border-primary-600/40 text-[10px] font-mono uppercase tracking-widest font-bold">
                PRO MEMBER
              </Badge>
            )}
          </h1>
          <p className="text-zinc-400 text-sm font-mono">
            Real-time quantitative odds, Strike-IQ proprietary match analytics, and high-confidence algorithmic betting rationales across elite global leagues.
          </p>
        </div>
        
        {/* Sleek Filters using shadcn Tabs */}
        <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-auto">
          <TabsList className="bg-[#09090b] border border-zinc-800 h-auto p-1 gap-0.5">
            {["All", "Football", "Basketball"].map(filter => (
              <TabsTrigger
                key={filter}
                value={filter}
                className="font-mono text-xs font-bold uppercase tracking-wider px-5 py-2 text-zinc-400 hover:text-white data-active:bg-white data-active:text-black rounded-md transition-all"
              >
                {filter === "All" ? "ALL MARKETS" : filter.toUpperCase()}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* AI Market Intelligence Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-[#09090b] border-zinc-800 relative overflow-hidden">
          <CardContent className="p-5">
            <div className="absolute top-0 right-0 p-4 opacity-10"><ZapIcon size={40} /></div>
            <h3 className="text-xs font-mono text-zinc-400 font-bold uppercase mb-1">Active AI Signals</h3>
            <div className="text-3xl font-extrabold text-white">{filteredMatches.length} <span className="text-sm font-normal text-zinc-500">picks</span></div>
            <div className="text-[10px] text-primary-500 font-mono mt-2 flex items-center gap-1">
               <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></span> LIVE SCANNERS ACTIVE
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#09090b] border-zinc-800 relative overflow-hidden">
          <CardContent className="p-5">
            <div className="absolute top-0 right-0 p-4 opacity-10"><CrownIcon size={40} /></div>
            <h3 className="text-xs font-mono text-zinc-400 font-bold uppercase mb-1">Pro Competitions</h3>
            <div className="text-3xl font-extrabold text-white">20+ <span className="text-sm font-normal text-zinc-500">leagues</span></div>
            <div className="text-[10px] text-amber-500 font-mono mt-2 flex items-center gap-1">
               {isProUser ? 'VIP ACCESS UNLOCKED' : 'PRO SUBSCRIPTION REQUIRED'}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#09090b] border-zinc-800 relative overflow-hidden">
          <CardContent className="p-5">
            <div className="absolute top-0 right-0 p-4 opacity-10"><ChartBarIcon size={40} /></div>
            <h3 className="text-xs font-mono text-zinc-400 font-bold uppercase mb-1">Model Accuracy (7D)</h3>
            <div className="text-3xl font-extrabold text-white">82.4% <span className="text-sm font-normal text-zinc-500">win rate</span></div>
            <div className="text-[10px] text-primary-500 font-mono mt-2 flex items-center gap-1">
               STRIKE-IQ QUANT V4
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Predictions Feed list */}
      {loading ? (
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
            SYNCING QUANTITATIVE MODELS...
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMatches.length > 0 ? (
            filteredMatches.map(match => {
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
              <div className="w-14 h-14 rounded-xl bg-[#121215] border border-zinc-800 flex items-center justify-center text-primary-600 mb-5">
                <ZapIcon size={28} className="text-primary-600" />
              </div>
              <h3 className="text-base text-white font-heading tracking-wide uppercase mb-2">NO ACTIVE {activeFilter !== "All" ? activeFilter.toUpperCase() : ""} FIXTURES RIGHT NOW</h3>
              <p className="text-xs max-w-md text-zinc-400 leading-relaxed font-sans mb-6">
                Our proprietary Strike-IQ quantitative engines are continuously scanning upcoming schedules and market odds. New high-confidence algorithmic predictions will appear here automatically once lines open.
              </p>
              {activeFilter !== "All" && (
                <Button 
                  onClick={() => setActiveFilter("All")} 
                  className="bg-primary-600 hover:bg-[#0f6b4d] text-white text-xs font-mono font-bold uppercase tracking-wider h-auto py-2 px-5"
                >
                  View All Markets
                </Button>
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
