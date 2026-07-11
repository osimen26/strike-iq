"use client";

import React, { useState, useEffect } from "react";
import { getTeamLogo, getLeagueLogo } from "@/lib/logos";

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  sport: string;
  date: string;
  time: string;
  prediction?: string;
  confidence?: number;
  status?: string;
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState<string>("All Sports");
  const [selectedDate, setSelectedDate] = useState<string>("All Days");

  useEffect(() => {
    fetchMatches();
  }, []);

  async function fetchMatches() {
    try {
      setLoading(true);
      const res = await fetch("/api/feed");
      const data = await res.json();
      if (data.success && data.data) {
        // Merge pro picks and live fixtures
        const combined = [
          ...(data.data.proPicks || []),
          ...(data.data.matches || []),
        ];
        // Remove duplicates by id
        const unique = Array.from(new Map(combined.map((m) => [m.id, m])).values());
        setMatches(unique);
      }
    } catch (err) {
      console.error("Failed to fetch calendar matches:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches = matches.filter((m) => {
    if (selectedSport !== "All Sports") {
      if (selectedSport === "Football" && m.sport !== "football") return false;
      if (selectedSport === "Basketball" && m.sport !== "basketball") return false;
    }
    if (selectedDate !== "All Days") {
      if (selectedDate === "Today" && m.date !== "Today") return false;
      if (selectedDate === "Tomorrow" && m.date !== "Tomorrow") return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-white font-heading">Matches Calendar</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#138561]/20 text-[#138561] border border-[#138561]/40 uppercase">
              3-Day Live Horizon
            </span>
          </div>
          <p className="text-[var(--color-accent-mutedSage)] mt-1">
            Real-time upcoming schedule across all major international and club competitions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="px-4 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[var(--color-brand-emerald)] font-bold cursor-pointer"
          >
            <option>All Sports</option>
            <option>Football</option>
            <option>Basketball</option>
          </select>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[var(--color-brand-emerald)] font-bold cursor-pointer"
          >
            <option>All Days</option>
            <option>Today</option>
            <option>Tomorrow</option>
          </select>
          <button
            onClick={fetchMatches}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 transition-colors"
            title="Refresh Calendar"
          >
            <svg className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="w-10 h-10 border-4 border-[var(--color-brand-emerald)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="text-center py-16 bg-[var(--color-background-surface)] border border-white/10 rounded-2xl">
          <p className="text-gray-400 font-medium">No upcoming matches scheduled matching your filters.</p>
          <button
            onClick={() => {
              setSelectedSport("All Sports");
              setSelectedDate("All Days");
            }}
            className="mt-3 text-xs text-[var(--color-brand-electricGreen)] underline font-bold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="bg-[var(--color-background-surface)] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-black/40 border-b border-white/10 text-[11px] uppercase tracking-wider text-gray-400 font-bold font-mono">
                <tr>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Competition</th>
                  <th className="px-6 py-4 text-right">Home Team</th>
                  <th className="px-6 py-4 text-center">VS</th>
                  <th className="px-6 py-4">Away Team</th>
                  <th className="px-6 py-4 text-right">AI Signal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredMatches.map((match) => (
                  <tr key={match.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${match.date === "Today" ? "bg-emerald-500 animate-pulse" : "bg-blue-400"}`}></span>
                        {match.date}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5 font-mono">{match.time}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded bg-black/60 border border-white/10 p-1 flex items-center justify-center shrink-0">
                          <img
                            src={getLeagueLogo(match.league, match.sport)}
                            alt={match.league}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="text-xs font-bold text-gray-300 max-w-[180px] truncate">{match.league}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-3">
                        <span className="text-sm font-extrabold text-white group-hover:text-[var(--color-brand-electricGreen)] transition-colors">
                          {match.homeTeam}
                        </span>
                        <div className="w-7 h-7 rounded-full bg-black/60 border border-white/10 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow">
                          <img
                            src={getTeamLogo(match.homeTeam)}
                            alt={match.homeTeam}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-mono font-bold text-gray-400">
                        VS
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-black/60 border border-white/10 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow">
                          <img
                            src={getTeamLogo(match.awayTeam)}
                            alt={match.awayTeam}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="text-sm font-extrabold text-white group-hover:text-[var(--color-brand-electricGreen)] transition-colors">
                          {match.awayTeam}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {match.prediction ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
                          <span className="text-xs font-bold">{match.prediction}</span>
                          {match.confidence && (
                            <span className="text-[10px] font-mono font-extrabold bg-emerald-500/20 px-1.5 py-0.5 rounded text-[var(--color-brand-electricGreen)]">
                              {match.confidence}%
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 italic">Live Odds</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
