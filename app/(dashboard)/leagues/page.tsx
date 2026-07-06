"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface League {
  id: string;
  name: string;
  country?: string;
  logo?: string;
  sport: { name: string; slug: string };
  matches?: any[];
  _count?: { matches: number; predictions: number };
}

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);

  useEffect(() => {
    fetchLeagues();
  }, [selectedSport]);

  const fetchLeagues = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/leagues?sport=${selectedSport}`);
      const data = await res.json();
      if (data.success && data.data) {
        setLeagues(data.data);
        // Select first league by default if none selected
        if (!selectedLeague && data.data.length > 0) {
          setSelectedLeague(data.data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching leagues:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeagues = leagues.filter((l) =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.country && l.country.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight font-heading">
              Sports Competitions & Leagues
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#138561]/20 text-[#138561] border border-[#138561]/40 whitespace-nowrap shrink-0 shadow-[0_0_15px_rgba(19,133,97,0.15)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#138561] animate-pulse"></span>
              AI COVERAGE ACTIVE
            </span>
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
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[var(--color-brand-emerald)] placeholder-gray-500 shadow-inner"
            />
            <svg className="w-4 h-4 text-gray-500 absolute right-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 w-full sm:w-auto">
            <button
              onClick={() => setSelectedSport('all')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedSport === 'all'
                  ? 'bg-[var(--color-brand-emerald)] text-white shadow-md shadow-[var(--color-brand-emerald)]/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedSport('football')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedSport === 'football'
                  ? 'bg-[var(--color-brand-emerald)] text-white shadow-md shadow-[var(--color-brand-emerald)]/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              ⚽ Football
            </button>
            <button
              onClick={() => setSelectedSport('basketball')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedSport === 'basketball'
                  ? 'bg-[var(--color-brand-emerald)] text-white shadow-md shadow-[var(--color-brand-emerald)]/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🏀 Basketball
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="w-10 h-10 border-4 border-[var(--color-brand-emerald)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredLeagues.length === 0 ? (
        <div className="text-center py-16 bg-[var(--color-background-surface)] border border-white/10 rounded-2xl">
          <p className="text-gray-400 font-medium">No competitions match your search criteria.</p>
          <button onClick={() => setSearchQuery('')} className="mt-3 text-xs text-[var(--color-brand-electricGreen)] underline">
            Clear Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* League Directory List (Left Column) */}
          <div className="lg:col-span-1 space-y-3 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">
              Available Competitions ({filteredLeagues.length})
            </div>
            {filteredLeagues.map((league) => {
              const isSelected = selectedLeague?.id === league.id;
              return (
                <div
                  key={league.id}
                  onClick={() => setSelectedLeague(league)}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-950/60 to-black border-[var(--color-brand-emerald)] shadow-lg shadow-[var(--color-brand-emerald)]/10 scale-[1.01]'
                      : 'bg-[var(--color-background-surface)] border-white/10 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center p-1.5 shrink-0">
                      {league.logo ? (
                        <img src={league.logo} alt={league.name} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-lg">{league.sport.slug === 'football' ? '⚽' : '🏀'}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white leading-tight">{league.name}</h3>
                      <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <span>{league.country || 'International'}</span>
                        <span>•</span>
                        <span className="uppercase text-[10px] text-[var(--color-brand-emerald)] font-semibold">
                          {league.sport.name}
                        </span>
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
                </div>
              );
            })}
          </div>

          {/* Selected League Fixtures View (Right Column) */}
          <div className="lg:col-span-2 bg-[var(--color-background-surface)] border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
            {selectedLeague ? (
              <>
                {/* Competition Banner */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-black/80 border border-[var(--color-brand-emerald)]/40 flex items-center justify-center p-2 shadow-md shadow-[var(--color-brand-emerald)]/10">
                      {selectedLeague.logo ? (
                        <img src={selectedLeague.logo} alt={selectedLeague.name} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-2xl">{selectedLeague.sport.slug === 'football' ? '⚽' : '🏀'}</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-extrabold text-white font-heading">{selectedLeague.name}</h2>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-gray-300">
                          {selectedLeague.country || 'International'}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-accent-mutedSage)] mt-1">
                        AI Model Accuracy for this league: <span className="text-[var(--color-brand-electricGreen)] font-bold">86.4% Win Rate</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href="/dashboard"
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all flex items-center gap-1.5"
                    >
                      <span>View Live Feed</span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </div>

                {/* Fixtures List */}
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
                          <div
                            key={match.id}
                            className="p-4 rounded-xl bg-black/40 border border-white/5 hover:border-white/15 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                          >
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
                                  <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-white/10 text-gray-300">vs</span>
                                  <span className="text-sm font-bold text-white">{match.awayTeam?.name || 'Away Team'}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  {isLive ? (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-500/20 text-red-400 animate-pulse border border-red-500/30">
                                      ● LIVE SCORE: {match.homeScore ?? 0} - {match.awayScore ?? 0}
                                    </span>
                                  ) : (
                                    <span className="text-[11px] text-gray-500 font-medium uppercase">
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
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-gray-500">
                Select a league from the left panel to explore competition intelligence.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
