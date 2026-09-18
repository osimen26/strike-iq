"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from "@/lib/supabase/client";
import { ProUpsellBanner } from "@/components/dashboard/ProUpsellBanner";
import { LockIcon } from "@/components/icons/Icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

interface League {
  id: string;
  name: string;
  country?: string;
  logo?: string;
  sport: { name: string; slug: string };
  tier: 'free' | 'pro';
  matches?: any[];
  _count?: { matches: number; predictions: number };
}

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [isProUser, setIsProUser] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetch('/api/subscriptions/current')
      .then((r) => r.json())
      .then((sub) => {
        if (sub.success && sub.isPro) {
          setIsProUser(true);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchLeagues();
  }, [selectedSport]);

  async function fetchLeagues() {
    try {
      setLoading(true);
      const res = await fetch(`/api/leagues?sport=${selectedSport}`);
      const data = await res.json();
      if (data.success && data.data) {
        setLeagues(data.data);
        const firstFree = data.data.find((l: League) => l.tier === 'free') || data.data[0];
        if (!selectedLeague && firstFree) {
          setSelectedLeague(firstFree);
        }
      }
    } catch (err) {
      console.error('Error fetching leagues:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredLeagues = leagues.filter((l) =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.country && l.country.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const groupedLeagues = filteredLeagues.reduce((acc, league) => {
    const country = league.country || 'International';
    if (!acc[country]) acc[country] = [];
    acc[country].push(league);
    return acc;
  }, {} as Record<string, League[]>);

  const sortedCountries = Object.keys(groupedLeagues).sort((a, b) => {
    const priority = ['International', 'Europe', 'Asia'];
    if (priority.includes(a) && !priority.includes(b)) return -1;
    if (!priority.includes(a) && priority.includes(b)) return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight font-heading whitespace-nowrap">
              Sports Competitions
            </h1>
            <Badge variant="outline" className="text-[10px] font-mono font-bold bg-primary-600/20 text-primary-600 border-primary-600/40 uppercase tracking-wider py-1 shadow-[0_0_15px_rgba(19,133,97,0.15)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse"></span>
              AI COVERAGE ACTIVE
            </Badge>
          </div>
          <p className="text-[var(--color-accent-mutedSage)] mt-2 text-sm md:text-base">
            Select a competition to view tailored AI odds, form intelligence, and high-confidence predictions.
          </p>
        </div>

        {/* Sport Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search leagues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[var(--color-brand-emerald)] placeholder-gray-500 shadow-inner h-9"
            />
          </div>

          <Tabs value={selectedSport} onValueChange={setSelectedSport} className="w-full sm:w-auto">
            <TabsList className="bg-[#09090b] border border-zinc-800 h-auto p-1 gap-0.5 w-full flex">
              {['all', 'football', 'basketball'].map(sport => (
                <TabsTrigger
                  key={sport}
                  value={sport}
                  className="font-mono text-xs font-bold uppercase tracking-wider px-5 py-2 text-zinc-400 hover:text-white data-active:bg-white data-active:text-black rounded-md transition-all"
                >
                  {sport === 'all' ? 'ALL MARKETS' : sport}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4 items-center justify-center py-24">
          <Skeleton className="w-12 h-12 rounded-full bg-zinc-800" />
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest animate-pulse">Loading Competitions...</p>
        </div>
      ) : filteredLeagues.length === 0 ? (
        <Card className="bg-[var(--color-background-surface)] border-white/10">
          <CardContent className="text-center py-16 flex flex-col items-center">
            <p className="text-zinc-400 font-medium">No competitions match your search criteria.</p>
            <Button variant="link" onClick={() => setSearchQuery('')} className="mt-3 text-xs text-primary-500">
              Clear Search
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* League Directory List (Left Column) */}
          <div className="lg:col-span-1 space-y-6 max-h-[700px] overflow-y-auto px-1.5 py-1.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {sortedCountries.map(country => (
              <div key={country} className="space-y-3">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1 sticky top-0 bg-black/80 backdrop-blur pb-1 pt-2 z-10">
                  {country}
                </div>
                {groupedLeagues[country].map((league) => {
                  const isSelected = selectedLeague?.id === league.id;
                  
                  return (
                    <Card
                      key={league.id}
                      onClick={() => setSelectedLeague(league)}
                      className={`cursor-pointer transition-all duration-200 border ${
                        isSelected
                          ? 'bg-gradient-to-r from-emerald-950/70 via-black to-black border-primary-500 shadow-md shadow-primary-600/15 ring-1 ring-primary-500/40'
                          : 'bg-[var(--color-background-surface)] border-white/10 hover:border-white/20 hover:bg-white/5'
                      }`}
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white border border-white/10 flex items-center justify-center p-1.5 shrink-0">
                            {league.logo ? (
                              <img src={league.logo} alt={league.name} className="w-full h-full object-contain" />
                            ) : (
                              <span className="text-lg">{league.sport.slug === 'football' ? '⚽' : '🏀'}</span>
                            )}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white leading-tight flex items-center gap-2">
                              {league.name}
                              {league.tier === 'pro' && (
                                <span className="text-amber-400"><LockIcon size={12} /></span>
                              )}
                            </h3>
                            <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                              <span className="uppercase text-[10px] text-[var(--color-brand-emerald)] font-semibold">
                                {league.sport.name}
                              </span>
                              {league.tier === 'pro' && (
                                <Badge variant="outline" className="px-1.5 py-0 text-[8px] font-mono font-bold bg-amber-500/20 text-amber-300 border-amber-500/30 uppercase">
                                  Pro
                                </Badge>
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs font-bold text-white">
                            {league._count?.matches ?? 0} <span className="text-gray-500 font-normal">games</span>
                          </div>
                          <div className="text-[10px] text-[var(--color-brand-electricGreen)] font-medium mt-0.5">
                            {league._count?.predictions ?? 0} AI picks
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Selected League Fixtures View (Right Column) */}
          <Card className="lg:col-span-2 bg-[var(--color-background-surface)] border-white/10">
            <CardContent className="p-6 md:p-8 space-y-6">
              {selectedLeague ? (
                <>
                  {/* Competition Banner */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white border border-[var(--color-brand-emerald)]/40 flex items-center justify-center p-2 shadow-md shadow-[var(--color-brand-emerald)]/10">
                        {selectedLeague.logo ? (
                          <img src={selectedLeague.logo} alt={selectedLeague.name} className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-2xl">{selectedLeague.sport.slug === 'football' ? '⚽' : '🏀'}</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-2xl font-extrabold text-white font-heading">{selectedLeague.name}</h2>
                          <Badge variant="secondary" className="px-2 py-0.5 text-[10px] font-bold bg-white/10 text-gray-300 border-0">
                            {selectedLeague.country || 'International'}
                          </Badge>
                        </div>
                        <p className="text-xs text-[var(--color-accent-mutedSage)] mt-1">
                          AI Model Accuracy for this league: <span className="text-[var(--color-brand-electricGreen)] font-bold">86.4% Win Rate</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href="/dashboard" className="w-full">
                        <Button variant="outline" className="w-full bg-white/5 hover:bg-white/10 border-white/10 text-white font-bold text-xs h-9">
                          View Live Feed
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Upsell or Fixtures */}
                  {selectedLeague.tier === 'pro' && !isProUser ? (
                    <div className="py-8">
                      <ProUpsellBanner context={`Get deep AI analysis, predictions, and form intelligence for ${selectedLeague.name} and 20+ other elite competitions.`} />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
                        <span>Upcoming & Live Fixtures</span>
                        <span>AI Prediction & Confidence</span>
                      </div>

                      {!selectedLeague.matches || selectedLeague.matches.length === 0 ? (
                        <div className="text-center py-14 border border-dashed border-white/10 rounded-xl bg-black/20">
                          <p className="text-gray-400 text-sm font-medium">No active scheduled fixtures for {selectedLeague.name} right now.</p>
                          <p className="text-xs text-gray-500 mt-1">Check back soon or explore another competition from the left panel.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {selectedLeague.matches.map((match: any) => {
                            const topPrediction = match.predictions && match.predictions.length > 0 ? match.predictions[0] : null;
                            const isLive = match.status === 'IN_PROGRESS' || match.status === 'LIVE';

                            return (
                              <Card key={match.id} className="bg-black/40 border-white/5 hover:border-white/15 transition-all">
                                <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                  <div className="flex items-center gap-4 w-full sm:w-auto">
                                    <div className="text-center shrink-0 w-12">
                                      <div className="text-[11px] text-gray-400 uppercase font-semibold">
                                        {new Date(match.matchDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                      </div>
                                      <div className="text-xs font-bold text-white mt-0.5">
                                        {new Date(match.matchDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </div>
                                    </div>

                                    <div className="h-8 w-px bg-white/10 hidden sm:block"></div>

                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-white">{match.homeTeam?.name || 'Home Team'}</span>
                                        <Badge variant="outline" className="text-[10px] font-bold px-1.5 py-0 bg-white/10 text-gray-300 border-0 h-4">vs</Badge>
                                        <span className="text-sm font-bold text-white">{match.awayTeam?.name || 'Away Team'}</span>
                                      </div>
                                      <div className="flex items-center gap-2 mt-1">
                                        {isLive ? (
                                          <Badge className="px-2 py-0.5 text-[10px] font-extrabold bg-red-500/20 text-red-400 hover:bg-red-500/30 animate-pulse border-red-500/30 border">
                                            ● LIVE SCORE: {match.homeScore ?? 0} - {match.awayScore ?? 0}
                                          </Badge>
                                        ) : (
                                          <span className="text-[11px] text-zinc-500 font-medium uppercase">
                                            Status: {match.status}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Prediction Badge */}
                                  <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-white/5">
                                    {topPrediction ? (
                                      <div className={`px-3.5 py-2 rounded-xl border flex items-center gap-2.5 shadow-md ${
                                        topPrediction.isPremium
                                          ? 'bg-gradient-to-r from-amber-950/40 to-black border-amber-500/40 text-amber-300'
                                          : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                                      }`}>
                                        <div>
                                          <div className="text-[10px] uppercase font-bold tracking-wider opacity-75">
                                            {topPrediction.isPremium ? '👑 Pro Pick' : '⚡ AI Signal'}
                                          </div>
                                          <div className="text-xs font-extrabold flex items-center gap-1.5 mt-0.5">
                                            <span>{topPrediction.selection}</span>
                                            <span>•</span>
                                            <span className="text-[var(--color-brand-electricGreen)]">{topPrediction.confidence}% Conf</span>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="text-xs text-gray-500 font-medium italic px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                                        Analyzing Odds...
                                      </span>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20 text-zinc-500">
                  Select a league from the left panel to explore competition intelligence.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
