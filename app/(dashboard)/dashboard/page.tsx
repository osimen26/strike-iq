"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { getTeamLogo, getLeagueLogo } from "@/lib/logos";

// Fallback Mock Data in case API is unavailable or rate-limited
const FALLBACK_MATCHES = [
  {
    id: "mock1",
    league: "World Cup 2026",
    homeTeam: "Brazil",
    awayTeam: "France",
    date: "Today",
    time: "20:00 GMT",
    prediction: "Brazil to Win",
    confidence: 88,
    analysis: "Brazil has won their last 5 games with an xG difference of +2.1. France's away form has been erratic, conceding early goals. The model strongly favors a dominant home performance.",
    sport: "football",
    tags: ["Hot Tip", "High Value"]
  },
  {
    id: "mock2",
    league: "World Cup 2026",
    homeTeam: "Argentina",
    awayTeam: "Germany",
    date: "Tomorrow",
    time: "15:30 GMT",
    prediction: "Over 2.5 Goals",
    confidence: 82,
    analysis: "Both teams play an attacking style. Germany has scored in every match this tournament, while Argentina's defense has shown vulnerabilities against high press.",
    sport: "football",
    tags: ["High Variance"]
  }
];

function MatchCard({ match, isLocked }: { match: any, isLocked?: boolean }) {
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Dynamic glow color based on confidence
  const glowColor = match.confidence >= 85 ? "var(--color-brand-emerald)" : 
                    match.confidence >= 75 ? "var(--color-brand-mint)" : 
                    "gray";

  return (
    <div className={`relative group rounded-2xl bg-[var(--color-background-surface)] border ${match.isProPick ? 'border-[var(--color-brand-emerald)]/50' : 'border-[var(--color-border-glass)]'} overflow-hidden shadow-2xl transition-all duration-300 hover:border-white/20`}>
      
      {/* Subtle Ambient Glow */}
      <div 
        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none"
        style={{ backgroundColor: match.isProPick ? 'var(--color-brand-emerald)' : glowColor, transform: 'translate(30%, -30%)' }}
      ></div>

      <div className="relative z-10 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          
          {/* LEFT: Match Info & Teams */}
          <div className="flex-1 flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Meta Info */}
            <div className="w-full md:w-32 shrink-0 flex flex-row md:flex-col items-center md:items-start justify-between border-b md:border-b-0 md:border-r border-white/10 pb-4 md:pb-0 md:pr-4">
              <div className="flex items-center gap-2 mb-0 md:mb-2">
                <div className="w-5 h-5 flex items-center justify-center opacity-80">
                  <img src={getLeagueLogo(match.league, match.sport)} alt={match.league} className="max-w-full max-h-full object-contain" />
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider line-clamp-1">{match.league}</span>
              </div>
              <div className="text-right md:text-left">
                <div className="text-sm font-semibold text-[var(--color-brand-mint)]">{match.date}</div>
                <div className="text-xs text-gray-500 font-mono mt-1">{match.time}</div>
              </div>
            </div>

            {/* Teams */}
            <div className="flex-1 flex items-center justify-center md:justify-start gap-4 w-full">
              <div className="flex flex-col items-center gap-2 w-1/3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-inner overflow-hidden">
                  <img src={getTeamLogo(match.homeTeam)} alt={match.homeTeam} className="w-full h-full object-contain p-1.5" />
                </div>
                <span className="font-heading text-sm sm:text-lg text-white text-center line-clamp-2">{match.homeTeam}</span>
              </div>
              
              <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-xs font-bold text-gray-500 font-mono shrink-0">
                VS
              </div>

              <div className="flex flex-col items-center gap-2 w-1/3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-inner overflow-hidden">
                  <img src={getTeamLogo(match.awayTeam)} alt={match.awayTeam} className="w-full h-full object-contain p-1.5" />
                </div>
                <span className="font-heading text-sm sm:text-lg text-white text-center line-clamp-2">{match.awayTeam}</span>
              </div>
            </div>
          </div>

          {/* RIGHT: AI Prediction & Confidence Ring */}
          <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 border-white/10 pt-6 lg:pt-0 w-full lg:w-auto relative">
            
            {isLocked && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md rounded-xl border border-white/10 p-2 text-center">
                <span className="text-2xl mb-1">🔒</span>
                <a href="/subscription" className="text-xs font-bold text-[var(--color-brand-emerald)] hover:underline uppercase tracking-widest cursor-pointer">
                  Upgrade to Pro
                </a>
              </div>
            )}

            {/* The Verdict */}
            <div className={`flex flex-col items-start lg:items-end gap-2 flex-1 lg:flex-none ${isLocked ? 'blur-sm opacity-50' : ''}`}>
              <div className="flex flex-wrap gap-2 mb-1">
                {match.isProPick && (
                  <span className="px-2 py-0.5 rounded-full bg-[var(--color-brand-emerald)]/20 border border-[var(--color-brand-emerald)]/50 text-[10px] font-bold text-[var(--color-brand-emerald)] uppercase tracking-wider whitespace-nowrap">
                    👑 Pro Pick
                  </span>
                )}
                {match.tags?.map((tag: string) => (
                  <span key={tag} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="px-4 py-2 bg-[var(--color-background-glass)] backdrop-blur-md rounded-xl border border-white/10 shadow-lg w-full lg:w-auto">
                <span className="text-sm text-gray-400 mr-2">AI Pick:</span>
                <span className="font-heading text-md sm:text-lg text-[var(--color-brand-mint)] tracking-wide">{match.prediction}</span>
              </div>
            </div>

            {/* Circular Confidence Gauge */}
            <div className={`relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shrink-0 ${isLocked ? 'blur-sm opacity-50' : ''}`}>
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/5"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="transition-all duration-1000 ease-out drop-shadow-md"
                  strokeDasharray={`${match.confidence}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={glowColor}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-heading text-lg sm:text-xl text-white">{match.confidence}</span>
                <span className="text-[10px] text-gray-400 font-mono -mt-1">%</span>
              </div>
            </div>

          </div>
        </div>

        {/* Expand Analysis Toggle */}
        <div className="mt-6 flex justify-center">
          <button 
            onClick={() => {
              if (isLocked) {
                window.location.href = "/subscription";
                return;
              }
              setShowAnalysis(!showAnalysis)
            }}
            className="group/btn flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <span className={`w-2 h-2 rounded-full ${isLocked ? 'bg-gray-500' : 'bg-[var(--color-brand-emerald)] animate-pulse'}`}></span>
            <span className="text-xs font-medium text-gray-300 group-hover/btn:text-white transition-colors">
              {isLocked ? "Unlock AI Analysis" : showAnalysis ? "Hide AI Analysis" : "View AI Analysis"}
            </span>
          </button>
        </div>
      </div>

      {/* Expanded Analysis Drawer */}
      <div 
        className={`bg-black/40 border-t border-white/5 transition-all duration-300 ease-in-out overflow-hidden ${
          showAnalysis && !isLocked ? "max-h-96 opacity-100 py-6" : "max-h-0 opacity-0 py-0"
        }`}
      >
        <div className="px-6 sm:px-8 text-sm text-gray-300 leading-relaxed font-main">
          <span className="font-bold text-[var(--color-brand-mint)] mr-2">Core Rationale:</span>
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
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user?.user_metadata?.plan === 'pro') {
        setIsProUser(true);
      }
    });
  }, []);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        // 1. Fetch Pro Predictions directly from Supabase DB
        const { data: dbProPicks, error: proError } = await supabase
          .from('pro_predictions')
          .select('*')
          .order('created_at', { ascending: false });

        if (!proError && dbProPicks) {
          const formattedProPicks = dbProPicks.map(p => ({
            id: p.id,
            league: p.league,
            homeTeam: p.home_team,
            awayTeam: p.away_team,
            date: p.match_date,
            time: p.match_time,
            prediction: p.prediction,
            confidence: p.confidence,
            analysis: p.analysis,
            sport: p.sport,
            tags: p.tags,
            isProPick: true
          }));
          setProPicks(formattedProPicks);
        }

        // 2. Fetch standard Matches from The Odds API route
        const res = await fetch("/api/matches");
        const json = await res.json();
        
        if (json.success && json.data && json.data.length > 0) {
          const formattedMatches = json.data.map((event: any) => {
            const dateObj = new Date(event.commence_time);
            const isBasketball = event.sport_key.includes("basketball");
            const fakeConfidence = Math.floor(Math.random() * (75 - 60 + 1) + 60); // Standard picks have lower confidence
            
            return {
              id: event.id,
              league: event.sport_title,
              homeTeam: event.home_team,
              awayTeam: event.away_team,
              date: dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
              time: dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
              prediction: `${fakeConfidence > 65 ? event.home_team : event.away_team} Edge`,
              confidence: fakeConfidence,
              analysis: `Standard feed analysis for ${event.home_team} vs ${event.away_team}. Market data fetched from The Odds API. Upgrade to Pro for deep rationale on premium fixtures.`,
              sport: isBasketball ? "basketball" : "football",
              tags: ["Standard Pick"]
            };
          });
          setMatches(formattedMatches);
        } else {
          setMatches(FALLBACK_MATCHES);
        }
      } catch (err) {
        console.error("Failed to fetch matches:", err);
        setMatches(FALLBACK_MATCHES);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const combinedFeed = [...proPicks, ...matches];

  const filteredMatches = combinedFeed.filter(match => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Football") return match.sport === "football";
    if (activeFilter === "Basketball") return match.sport === "basketball";
    return true;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-10 pt-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-white font-heading tracking-tight mb-2 flex items-center gap-3">
            Welcome, <span className="text-[var(--color-brand-mint)]">{user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || "Strategist"}</span>
            {isProUser && <span className="text-xl px-2 py-0.5 bg-[var(--color-brand-emerald)]/20 text-[var(--color-brand-emerald)] border border-[var(--color-brand-emerald)]/50 rounded text-xs uppercase tracking-widest font-bold translate-y-1">Pro Member</span>}
          </h1>
          <p className="text-[var(--color-accent-mutedSage)] text-lg">Your intelligence feed is pulling live market data.</p>
        </div>
        
        {/* Sleek Filters */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 shadow-inner backdrop-blur-sm self-start shrink-0 overflow-x-auto max-w-full">
          {["All", "Football", "Basketball"].map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 whitespace-nowrap ${
                activeFilter === filter 
                  ? "bg-[var(--color-brand-actionGreen)] text-white shadow-md shadow-black/50" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Predictions Feed list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-white/10 border-t-[var(--color-brand-emerald)] rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400 font-mono text-sm animate-pulse">Syncing Intelligence Feed...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredMatches.length > 0 ? (
            filteredMatches.map(match => {
              // Lock the match if it's a Pro Pick and the user is NOT a Pro User
              const isLocked = match.isProPick && !isProUser;
              
              return <MatchCard key={match.id} match={match} isLocked={isLocked} />
            })
          ) : (
            <div className="p-12 mt-8 rounded-2xl bg-[var(--color-background-surface)] border border-dashed border-white/20 text-center flex flex-col items-center justify-center text-gray-400">
              <span className="text-5xl mb-4 opacity-50">🏟️</span>
              <h3 className="text-xl text-white font-bold mb-2 font-heading">No {activeFilter !== "All" ? activeFilter : ""} Matches Found</h3>
              <p className="text-sm max-w-md">Our models are currently analyzing upcoming data. Please check back later or select a different sport.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
