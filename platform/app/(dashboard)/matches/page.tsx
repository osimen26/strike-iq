"use client";

import React, { useState, useEffect } from "react";
import { getTeamLogo, getLeagueLogo } from "@/lib/logos";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

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
            <Badge variant="outline" className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-primary-600/20 text-primary-600 border-primary-600/40 uppercase">
              3-Day Live Horizon
            </Badge>
          </div>
          <p className="text-[var(--color-accent-mutedSage)] mt-1 text-sm">
            Real-time upcoming schedule across all major international and club competitions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Select value={selectedSport} onValueChange={(val) => val && setSelectedSport(val)}>
            <SelectTrigger className="w-[140px] bg-black/50 border-white/10 text-xs text-white h-9 rounded-xl font-bold">
              <SelectValue placeholder="Select Sport" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-white font-mono text-xs">
              <SelectItem value="All Sports">All Sports</SelectItem>
              <SelectItem value="Football">Football</SelectItem>
              <SelectItem value="Basketball">Basketball</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedDate} onValueChange={(val) => val && setSelectedDate(val)}>
            <SelectTrigger className="w-[140px] bg-black/50 border-white/10 text-xs text-white h-9 rounded-xl font-bold">
              <SelectValue placeholder="Select Date" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-white font-mono text-xs">
              <SelectItem value="All Days">All Days</SelectItem>
              <SelectItem value="Today">Today</SelectItem>
              <SelectItem value="Tomorrow">Tomorrow</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={fetchMatches}
            className="w-9 h-9 bg-white/5 hover:bg-white/10 border-white/10 rounded-xl text-zinc-300 transition-colors"
            title="Refresh Calendar"
          >
            <svg className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Skeleton className="w-12 h-12 rounded-full bg-zinc-800" />
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest animate-pulse">Syncing Fixtures...</p>
        </div>
      ) : filteredMatches.length === 0 ? (
        <Card className="bg-[var(--color-background-surface)] border-white/10">
          <CardContent className="text-center py-16 flex flex-col items-center">
            <p className="text-zinc-400 font-medium">No upcoming matches scheduled matching your filters.</p>
            <Button
              variant="link"
              onClick={() => {
                setSelectedSport("All Sports");
                setSelectedDate("All Days");
              }}
              className="mt-3 text-xs text-[var(--color-brand-electricGreen)] font-bold h-auto p-0"
            >
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-[var(--color-background-surface)] border-white/10 shadow-xl overflow-hidden">
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader className="bg-black/40 border-b border-white/10">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-6 py-4 text-[11px] uppercase tracking-wider text-zinc-400 font-bold font-mono h-auto">Date & Time</TableHead>
                  <TableHead className="px-6 py-4 text-[11px] uppercase tracking-wider text-zinc-400 font-bold font-mono h-auto">Competition</TableHead>
                  <TableHead className="px-6 py-4 text-[11px] uppercase tracking-wider text-zinc-400 font-bold font-mono h-auto text-right">Home Team</TableHead>
                  <TableHead className="px-6 py-4 text-[11px] uppercase tracking-wider text-zinc-400 font-bold font-mono h-auto text-center">VS</TableHead>
                  <TableHead className="px-6 py-4 text-[11px] uppercase tracking-wider text-zinc-400 font-bold font-mono h-auto">Away Team</TableHead>
                  <TableHead className="px-6 py-4 text-[11px] uppercase tracking-wider text-zinc-400 font-bold font-mono h-auto text-right">AI Signal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMatches.map((match) => (
                  <TableRow key={match.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${match.date === "Today" ? "bg-emerald-500 animate-pulse" : "bg-blue-400"}`}></span>
                        {match.date}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5 font-mono">{match.time}</div>
                    </TableCell>

                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded bg-black/60 border border-white/10 p-1 flex items-center justify-center shrink-0">
                          <img src={getLeagueLogo(match.league, match.sport)} alt={match.league} className="w-full h-full object-contain" />
                        </div>
                        <span className="text-xs font-bold text-zinc-300 max-w-[180px] truncate">{match.league}</span>
                      </div>
                    </TableCell>

                    <TableCell className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-3">
                        <span className="text-sm font-extrabold text-white group-hover:text-[var(--color-brand-electricGreen)] transition-colors">
                          {match.homeTeam}
                        </span>
                        <div className="w-7 h-7 rounded-full bg-black/60 border border-white/10 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow">
                          <img src={getTeamLogo(match.homeTeam)} alt={match.homeTeam} className="w-full h-full object-contain" />
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-6 py-4 text-center whitespace-nowrap">
                      <Badge variant="outline" className="px-2 py-0.5 bg-white/5 border-white/10 text-[10px] font-mono font-bold text-zinc-400 rounded h-auto">
                        VS
                      </Badge>
                    </TableCell>

                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-black/60 border border-white/10 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow">
                          <img src={getTeamLogo(match.awayTeam)} alt={match.awayTeam} className="w-full h-full object-contain" />
                        </div>
                        <span className="text-sm font-extrabold text-white group-hover:text-[var(--color-brand-electricGreen)] transition-colors">
                          {match.awayTeam}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="px-6 py-4 text-right whitespace-nowrap">
                      {match.prediction ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 shadow-sm">
                          <span className="text-xs font-bold">{match.prediction}</span>
                          {match.confidence && (
                            <Badge className="text-[10px] font-mono font-extrabold bg-emerald-500/20 px-1.5 py-0 text-[var(--color-brand-electricGreen)] h-4 rounded">
                              {match.confidence}%
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-500 italic">Live Odds</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
