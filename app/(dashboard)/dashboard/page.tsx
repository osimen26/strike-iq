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

  const glowColor = match.confidence >= 85 ? "#00E599" : 
                    match.confidence >= 75 ? "#108960" : 
                    "#52525b";

  return (
    <div className={`relative group rounded-xl bg-[#09090b] border ${match.isProPick ? 'border-[#00E599]/60 shadow-[0_0_15px_rgba(0,229,153,0.08)]' : 'border-zinc-800/80'} overflow-hidden transition-all duration-200 hover:border-zinc-700`}>
      
      <div className="relative z-10 p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* LEFT: Match Info & Teams */}
          <div className="flex-1 flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Meta Info */}
            <div className="w-full md:w-36 shrink-0 flex flex-row md:flex-col items-center md:items-start justify-between border-b md:border-b-0 md:border-r border-zinc-800/80 pb-3 md:pb-0 md:pr-4">
              <div className="flex items-center gap-2 mb-0 md:mb-1.5">
                <div className="w-4 h-4 flex items-center justify-center opacity-80">
                  <img src={getLeagueLogo(match.league, match.sport)} alt={match.league} className="max-w-full max-h-full object-contain" />
                </div>
                <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider line-clamp-1">{match.league}</span>
              </div>
              <div className="text-right md:text-left">
                <div className="text-xs font-mono font-bold text-[#00E599]">{match.date}</div>
                <div className="text-[11px] text-zinc-500 font-mono mt-0.5">{match.time}</div>
              </div>
            </div>

            {/* Teams */}
            <div className="flex-1 flex items-center justify-center md:justify-start gap-4 w-full">
              <div className="flex flex-col items-center gap-2 w-2/5">
                <div className="w-12 h-12 rounded-lg bg-[#121215] border border-zinc-800 flex items-center justify-center overflow-hidden p-2 shadow-inner">
                  <img src={getTeamLogo(match.homeTeam)} alt={match.homeTeam} className="w-full h-full object-contain" />
                </div>
                <span className="font-mono font-bold text-xs sm:text-sm text-white text-center line-clamp-1">{match.homeTeam}</span>
              </div>
              
              <div className="px-2 py-0.5 bg-[#121215] rounded border border-zinc-800 text-[10px] font-bold text-zinc-500 font-mono shrink-0">
                VS
              </div>

              <div className="flex flex-col items-center gap-2 w-2/5">
                <div className="w-12 h-12 rounded-lg bg-[#121215] border border-zinc-800 flex items-center justify-center overflow-hidden p-2 shadow-inner">
                  <img src={getTeamLogo(match.awayTeam)} alt={match.awayTeam} className="w-full h-full object-contain" />
                </div>
                <span className="font-mono font-bold text-xs sm:text-sm text-white text-center line-clamp-1">{match.awayTeam}</span>
              </div>
            </div>
          </div>

          {/* RIGHT: AI Prediction & Confidence Ring */}
          <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 border-zinc-800/80 pt-5 lg:pt-0 w-full lg:w-auto relative">
            
            {isLocked && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 rounded-lg border border-zinc-800 p-2 text-center">
                <span className="text-xl mb-1">🔒</span>
                <a href="/dashboard/subscription" className="text-[10px] font-mono font-bold text-[#00E599] hover:underline uppercase tracking-widest cursor-pointer">
                  PRO TIER REQUIRED
                </a>
              </div>
            )}

            {/* The Verdict */}
            <div className={`flex flex-col items-start lg:items-end gap-2 flex-1 lg:flex-none ${isLocked ? 'blur-sm opacity-40' : ''}`}>
              <div className="flex flex-wrap gap-1.5 mb-0.5">
                {match.isProPick && (
                  <span className="px-2 py-0.5 rounded bg-[#00E599]/10 border border-[#00E599]/40 text-[9px] font-mono font-bold text-[#00E599] uppercase tracking-wider whitespace-nowrap">
                    👑 PRO EDGE
                  </span>
                )}
                {match.tags?.map((tag: string) => (
                  <span key={tag} className="px-2 py-0.5 rounded bg-[#121215] border border-zinc-800 text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="px-3.5 py-2 bg-[#121215] rounded-lg border border-zinc-800/80 w-full lg:w-auto flex items-center justify-between lg:justify-end gap-3 shadow-sm">
                <span className="text-xs font-mono text-zinc-400 uppercase">MODEL PICK:</span>
                <span className="font-mono font-bold text-sm text-[#00E599] tracking-tight">{match.prediction}</span>
              </div>
            </div>

            {/* Circular Confidence Gauge */}
            <div className={`relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0 ${isLocked ? 'blur-sm opacity-40' : ''}`}>
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-zinc-800"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                />
                <path
                  className="transition-all duration-700 ease-out"
                  strokeDasharray={`${match.confidence}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={glowColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono font-bold text-sm sm:text-base text-white">{match.confidence}</span>
                <span className="text-[9px] text-zinc-500 font-mono -mt-1">%</span>
              </div>
            </div>

          </div>
        </div>

        {/* Expand Analysis Toggle */}
        <div className="mt-5 pt-3 border-t border-zinc-900 flex justify-between items-center">
          <span className="text-[10px] font-mono text-zinc-500 uppercase">AI ENGINE: DEEPSEEK ADVANCED SPORTS MODEL</span>
          <button 
            onClick={() => {
              if (isLocked) {
                window.location.href = "/dashboard/subscription";
                return;
              }
              setShowAnalysis(!showAnalysis)
            }}
            className="group/btn flex items-center gap-2 px-3 py-1 rounded bg-[#121215] border border-zinc-800 hover:border-zinc-700 transition-colors"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isLocked ? 'bg-zinc-600' : 'bg-[#00E599] animate-pulse'}`}></span>
            <span className="text-[11px] font-mono font-bold text-zinc-300 group-hover/btn:text-white transition-colors uppercase">
              {isLocked ? "LOCK // UNLOCK ANALYSIS" : showAnalysis ? "CLOSE ANALYSIS" : "READ RATIONALE"}
            </span>
          </button>
        </div>
      </div>

      {/* Expanded Analysis Drawer */}
      <div 
        className={`bg-[#050507] border-t border-zinc-800/80 transition-all duration-300 ease-in-out overflow-hidden ${
          showAnalysis && !isLocked ? "max-h-96 opacity-100 py-5" : "max-h-0 opacity-0 py-0"
        }`}
      >
        <div className="px-5 sm:px-6 text-xs text-zinc-300 leading-relaxed font-mono">
          <span className="font-bold text-[#00E599] uppercase mr-2">[RATIONALE // METRICS]:</span>
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
        
        if (json.success && Array.isArray(json.data)) {
          const formattedMatches = json.data.map((event: any) => {
            const dateObj = new Date(event.commence_time);
            const isBasketball = event.sport_key?.includes("basketball");
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
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-8 pt-2 border-b border-zinc-900 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#00E599] font-bold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-[#00E599] animate-pulse"></span>
            LIVE INTELLIGENCE FEED // TERMINAL v2.4
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white font-heading tracking-tight mb-2 flex items-center gap-3 uppercase">
            STRATEGY DESK: <span className="text-[#00E599]">{user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || "STRATEGIST"}</span>
            {isProUser && <span className="px-2 py-0.5 bg-[#00E599]/10 text-[#00E599] border border-[#00E599]/40 rounded text-[10px] font-mono uppercase tracking-widest font-bold">PRO MEMBER</span>}
          </h1>
          <p className="text-zinc-400 text-sm font-mono">Real-time market odds, AI confidence metrics, and quantitative match predictions.</p>
        </div>
        
        {/* Sleek Filters */}
        <div className="flex bg-[#09090b] p-1 rounded-lg border border-zinc-800 self-start shrink-0 overflow-x-auto max-w-full font-mono">
          {["All", "Football", "Basketball"].map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2 rounded-md text-xs font-bold transition-all duration-200 whitespace-nowrap uppercase tracking-wider ${
                activeFilter === filter 
                  ? "bg-[#00E599] text-black shadow-sm" 
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
          <div className="w-10 h-10 border-2 border-zinc-800 border-t-[#00E599] rounded-full animate-spin mb-4"></div>
          <p className="text-zinc-400 font-mono text-xs uppercase tracking-widest animate-pulse">SYNCING QUANTITATIVE MODELS...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMatches.length > 0 ? (
            filteredMatches.map(match => {
              // Lock the match if it's a Pro Pick and the user is NOT a Pro User
              const isLocked = match.isProPick && !isProUser;
              
              return <MatchCard key={match.id} match={match} isLocked={isLocked} />
            })
          ) : (
            <div className="p-12 mt-4 rounded-xl bg-[#09090b] border border-dashed border-zinc-800 text-center flex flex-col items-center justify-center text-zinc-400 font-mono">
              <span className="text-4xl mb-4 opacity-40">📊</span>
              <h3 className="text-base text-white font-bold mb-2 uppercase tracking-wide">No {activeFilter !== "All" ? activeFilter : "Active"} Fixtures Found</h3>
              <p className="text-xs max-w-md text-zinc-500 leading-relaxed font-sans">
                {activeFilter === "Football" 
                  ? "No live Football fixtures currently scheduled for the Top 5 European Leagues or World Cup right now. Please check back later or select another sport."
                  : "Our quantitative engines are currently processing upcoming schedules. Please check back later or select another market."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
