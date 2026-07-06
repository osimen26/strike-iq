"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getLeagueLogo, getTeamLogo } from "@/lib/logos";

export default function PredictionsFeed() {
  const [activeSport, setActiveSport] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return "text-[var(--color-brand-mint)] bg-[var(--color-brand-mint)]/10 border-[var(--color-brand-mint)]/20";
    if (confidence >= 75) return "text-green-400 bg-green-400/10 border-green-400/20";
    if (confidence >= 65) return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
    return "text-red-400 bg-red-400/10 border-red-400/20";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 85) return "Very High";
    if (confidence >= 75) return "High";
    if (confidence >= 65) return "Medium";
    return "Low";
  };

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
    <div className="space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white font-heading">AI Predictions</h1>
          <p className="text-[var(--color-accent-mutedSage)] mt-1">Discover high-value betting opportunities powered by Strike IQ.</p>
        </div>
        <div className="relative w-full md:w-72">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search teams or leagues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--color-background-surface)] border border-[var(--color-border-glass)] rounded-lg text-sm text-white focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors shadow-lg"
          />
        </div>
      </div>

      {/* Sport Filters */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {["All", "Football", "Basketball"].map((sport) => (
          <button
            key={sport}
            onClick={() => setActiveSport(sport)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeSport === sport
                ? "bg-white text-black"
                : "bg-[var(--color-background-surface)] text-gray-400 border border-[var(--color-border-glass)] hover:text-white"
            }`}
          >
            {sport === "Football" ? "⚽ " : sport === "Basketball" ? "🏀 " : "⚡ "}
            {sport === "All" ? "All Markets" : sport}
          </button>
        ))}
      </div>

      {/* Feed */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[var(--color-background-surface)] rounded-xl border border-[var(--color-border-glass)]">
          <div className="w-10 h-10 border-2 border-zinc-800 border-t-[#138561] rounded-full animate-spin mb-4"></div>
          <p className="text-zinc-400 font-mono text-xs uppercase tracking-widest animate-pulse">Syncing Quantitative Models...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 mt-4 rounded-2xl bg-[var(--color-background-surface)] border border-dashed border-white/20 text-center flex flex-col items-center justify-center text-gray-400">
          <span className="text-5xl mb-4 opacity-50">⚽</span>
          <h3 className="text-xl text-white font-bold mb-2 font-heading">
            No {activeSport !== "All" ? activeSport : ""} Predictions Found
          </h3>
          <p className="text-sm max-w-md">
            {searchQuery
              ? `No results for "${searchQuery}". Try a different search term.`
              : "No predictions available for this market right now. Check back soon or ask the admin to publish a pick."}
          </p>
          {(activeSport !== "All" || searchQuery) && (
            <button
              onClick={() => { setActiveSport("All"); setSearchQuery(""); }}
              className="mt-4 px-5 py-2 rounded-lg bg-[#138561] text-white text-xs font-mono font-bold hover:bg-[#0f6b4d] transition-all uppercase tracking-wider"
            >
              View All Markets
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((pred) => (
            <div key={pred.id} className="relative rounded-2xl bg-[var(--color-background-surface)] border border-[var(--color-border-glass)] shadow-xl overflow-hidden group">

              {/* Top Bar */}
              <div className="p-4 border-b border-[var(--color-border-glass)] bg-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <img src={getLeagueLogo(pred.league, pred.sport)} alt={pred.league} className="max-w-full max-h-full object-contain" />
                  </div>
                  <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider line-clamp-1">{pred.league}</span>
                </div>
                <span className="text-xs text-gray-500 flex items-center gap-1 shrink-0">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {pred.date} {pred.time}
                </span>
              </div>

              {/* Match Info */}
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="text-center flex-1">
                    <div className="w-12 h-12 mx-auto bg-black/50 rounded-full flex items-center justify-center border border-[var(--color-border-glass)] mb-2 shadow-inner overflow-hidden p-1">
                      <img src={getTeamLogo(pred.homeTeam)} alt={pred.homeTeam} className="w-full h-full object-contain" />
                    </div>
                    <h3 className="text-sm font-bold text-white truncate px-2">{pred.homeTeam}</h3>
                  </div>
                  <div className="px-4 text-xs font-bold text-gray-600">VS</div>
                  <div className="text-center flex-1">
                    <div className="w-12 h-12 mx-auto bg-black/50 rounded-full flex items-center justify-center border border-[var(--color-border-glass)] mb-2 shadow-inner overflow-hidden p-1">
                      <img src={getTeamLogo(pred.awayTeam)} alt={pred.awayTeam} className="w-full h-full object-contain" />
                    </div>
                    <h3 className="text-sm font-bold text-white truncate px-2">{pred.awayTeam}</h3>
                  </div>
                </div>

                {/* Prediction Box */}
                <div className="bg-black/40 rounded-xl p-4 border border-[var(--color-border-glass)] mb-6">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-[var(--color-accent-mutedSage)] uppercase tracking-wider font-mono">AI PICK</span>
                    <div className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getConfidenceColor(pred.confidence)}`}>
                      {pred.confidence}% {getConfidenceLabel(pred.confidence)}
                    </div>
                  </div>
                  <p className="text-lg font-bold text-white font-heading">{pred.prediction}</p>
                  {pred.isProPick && (
                    <span className="inline-block mt-2 px-2 py-0.5 rounded bg-[#138561]/20 border border-[#138561]/40 text-[9px] font-mono font-bold text-[#138561] uppercase tracking-wider">
                      👑 PRO EDGE
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <Link
                    href={`/dashboard/predictions/${pred.id}`}
                    className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold rounded-lg text-center transition-colors border border-white/5"
                  >
                    View Analysis
                  </Link>
                  <button className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-colors text-gray-400 hover:text-white">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
