"use client";

const LEAGUES = [
  { name: "Premier League", icon: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", count: 12 },
  { name: "La Liga", icon: "🇪🇸", count: 8 },
  { name: "Serie A", icon: "🇮🇹", count: 9 },
  { name: "Bundesliga", icon: "🇩🇪", count: 5 },
  { name: "Ligue 1", icon: "🇫🇷", count: 4 },
  { name: "NBA", icon: "🇺🇸", count: 14 },
  { name: "World Cup", icon: "🌍", count: 2 },
];

export default function LeaguesPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pt-4 pb-12">
      <div>
        <h1 className="text-4xl font-bold text-white font-heading tracking-tight mb-2">Leagues & Competitions</h1>
        <p className="text-[var(--color-accent-mutedSage)] text-lg">Browse AI predictions by specific tournaments.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
        {LEAGUES.map(league => (
          <button key={league.name} className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-background-surface)] border border-white/5 hover:border-[var(--color-brand-emerald)]/30 hover:bg-white/5 transition-all text-left group">
            <div className="flex items-center gap-3">
              <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">{league.icon}</span>
              <span className="font-semibold text-white group-hover:text-[var(--color-brand-mint)] transition-colors">{league.name}</span>
            </div>
            <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-xs text-gray-400 font-mono">
              {league.count}
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-12 p-8 rounded-2xl border border-dashed border-white/20 text-center flex flex-col items-center justify-center text-gray-400">
        <span className="text-4xl mb-4 opacity-50">🏆</span>
        <h3 className="text-white font-bold mb-2">More Leagues Coming Soon</h3>
        <p className="text-sm max-w-md">Our models are currently training on additional data for NFL, NHL, and lower division European football.</p>
      </div>
    </div>
  );
}
