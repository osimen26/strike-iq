"use client";

import { useState } from "react";
import Link from "next/link";
import { getLeagueLogo } from "@/lib/logos";

// Mock Data
const MOCK_PREDICTIONS = [
  {
    id: "1",
    homeTeam: "Brazil",
    awayTeam: "France",
    league: "World Cup 2026",
    kickoff: "Today, 20:00",
    predictionType: "Match Winner",
    prediction: "Brazil",
    confidence: 88,
    confidenceLabel: "High",
    isPremium: false,
  },
  {
    id: "2",
    homeTeam: "Argentina",
    awayTeam: "Germany",
    league: "World Cup 2026",
    kickoff: "Tomorrow, 15:30",
    predictionType: "Both Teams To Score",
    prediction: "Yes",
    confidence: 92,
    confidenceLabel: "Very High",
    isPremium: true,
  },
  {
    id: "3",
    homeTeam: "Real Madrid",
    awayTeam: "Barcelona",
    league: "La Liga",
    kickoff: "Sat, 21:00",
    predictionType: "Over/Under Goals",
    prediction: "Over 2.5",
    confidence: 72,
    confidenceLabel: "Medium",
    isPremium: true,
  },
  {
    id: "4",
    homeTeam: "Manchester City",
    awayTeam: "Arsenal",
    league: "Premier League",
    kickoff: "Sun, 16:30",
    predictionType: "Double Chance",
    prediction: "Man City or Draw",
    confidence: 88,
    confidenceLabel: "High",
    isPremium: false,
  }
];

export default function PredictionsFeed() {
  const [activeSport, setActiveSport] = useState("Football");
  const [searchQuery, setSearchQuery] = useState("");

  const getConfidenceColor = (label: string) => {
    switch (label) {
      case "Very High": return "text-[var(--color-brand-mint)] bg-[var(--color-brand-mint)]/10 border-[var(--color-brand-mint)]/20";
      case "High": return "text-green-400 bg-green-400/10 border-green-400/20";
      case "Medium": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "Low": return "text-red-400 bg-red-400/10 border-red-400/20";
      default: return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

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

      {/* Filters */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        <button 
          onClick={() => setActiveSport("Football")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeSport === "Football" ? "bg-white text-black" : "bg-[var(--color-background-surface)] text-gray-400 border border-[var(--color-border-glass)] hover:text-white"}`}
        >
          <img src="https://upload.wikimedia.org/wikipedia/en/f/f2/Premier_League_Logo.svg" alt="Football" className="w-4 h-4 object-contain" />
          Football
        </button>
        <button 
          onClick={() => setActiveSport("Basketball")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeSport === "Basketball" ? "bg-white text-black" : "bg-[var(--color-background-surface)] text-gray-400 border border-[var(--color-border-glass)] hover:text-white"}`}
        >
          <img src="https://upload.wikimedia.org/wikipedia/en/0/03/National_Basketball_Association_logo.svg" alt="Basketball" className="w-4 h-4 object-contain" />
          Basketball
        </button>
        <div className="w-px h-6 bg-[var(--color-border-glass)] mx-2"></div>
        <button className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap bg-[var(--color-background-surface)] text-gray-400 border border-[var(--color-border-glass)] hover:text-white transition-colors">
          Any League ▾
        </button>
        <button className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap bg-[var(--color-background-surface)] text-gray-400 border border-[var(--color-border-glass)] hover:text-white transition-colors">
          Any Market ▾
        </button>
        <button className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap bg-[var(--color-background-surface)] text-gray-400 border border-[var(--color-border-glass)] hover:text-white transition-colors">
          Confidence ▾
        </button>
      </div>

      {/* Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {MOCK_PREDICTIONS.map((pred) => (
          <div key={pred.id} className="relative rounded-2xl bg-[var(--color-background-surface)] border border-[var(--color-border-glass)] shadow-xl overflow-hidden group">
            
            {/* Top Bar */}
            <div className="p-4 border-b border-[var(--color-border-glass)] bg-white/5 flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-300 bg-black/40 px-2 py-1 rounded border border-white/5 uppercase tracking-wider">{pred.league}</span>
              <span className="text-xs text-gray-500 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {pred.kickoff}
              </span>
            </div>

            {/* Match Info */}
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="text-center flex-1">
                  <div className="w-12 h-12 mx-auto bg-black/50 rounded-full flex items-center justify-center border border-[var(--color-border-glass)] mb-2 shadow-inner">
                    <span className="text-xs text-gray-500">Logo</span>
                  </div>
                  <h3 className="text-sm font-bold text-white truncate px-2">{pred.homeTeam}</h3>
                </div>
                <div className="px-4 text-xs font-bold text-gray-600">VS</div>
                <div className="text-center flex-1">
                  <div className="w-12 h-12 mx-auto bg-black/50 rounded-full flex items-center justify-center border border-[var(--color-border-glass)] mb-2 shadow-inner">
                    <span className="text-xs text-gray-500">Logo</span>
                  </div>
                  <h3 className="text-sm font-bold text-white truncate px-2">{pred.awayTeam}</h3>
                </div>
              </div>

              {/* Prediction Box */}
              <div className="bg-black/40 rounded-xl p-4 border border-[var(--color-border-glass)] mb-6 relative overflow-hidden">
                {pred.isPremium && (
                  <div className="absolute inset-0 backdrop-blur-md bg-black/60 z-10 flex flex-col items-center justify-center p-4">
                    <span className="text-xl mb-1">👑</span>
                    <h4 className="text-sm font-bold text-white mb-2">Premium Prediction</h4>
                    <Link href="/dashboard/subscription" className="px-3 py-1.5 bg-[var(--color-brand-emerald)] hover:bg-[var(--color-brand-actionGreenHover)] text-white text-xs font-bold rounded shadow-lg transition-colors">
                      Unlock Now
                    </Link>
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-[var(--color-accent-mutedSage)] uppercase tracking-wider">{pred.predictionType}</span>
                  <div className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getConfidenceColor(pred.confidenceLabel)}`}>
                    {pred.confidence}% {pred.confidenceLabel}
                  </div>
                </div>
                <p className="text-lg font-bold text-white font-heading">{pred.prediction}</p>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <Link href={`/dashboard/predictions/${pred.id}`} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold rounded-lg text-center transition-colors border border-white/5">
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
    </div>
  );
}
