import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function PredictionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let prediction: any = await prisma.prediction.findUnique({
    where: { id, isDeleted: false },
    include: {
      match: {
        include: {
          homeTeam: true,
          awayTeam: true,
          league: true,
        }
      },
      sport: true,
      explanation: true,
      statistics: true,
    }
  });

  // If not found in older table, check the pro_predictions table
  if (!prediction) {
    const proPred = await prisma.proPrediction.findUnique({
      where: { id },
    });

    if (!proPred) {
      notFound();
    }

    const tagsList = Array.isArray(proPred.tags) ? proPred.tags : [];
    const isFreePick = tagsList.some((t: any) => 
      typeof t === 'string' && (
        t.toUpperCase().includes('FREE') || 
        t.toUpperCase().includes('COMMUNITY') || 
        t.toUpperCase().includes('TEASER') ||
        t.toUpperCase().includes('PUBLIC')
      )
    ) || (typeof proPred.league === 'string' && proPred.league.toUpperCase().includes('FREE'));

    prediction = {
      isProPrediction: true,
      confidence: proPred.confidence,
      selection: proPred.prediction,
      odds: null,
      bookingCode: proPred.bookingCode,
      bookmaker: proPred.bookmaker,
      isFreePick,
      match: {
        league: { name: proPred.league },
        homeTeam: { name: proPred.homeTeam },
        awayTeam: { name: proPred.awayTeam },
        matchDate: proPred.matchDate || proPred.createdAt || new Date(),
      },
      explanation: {
        content: proPred.analysis,
        keyFactors: tagsList,
      },
      statistics: [],
    };
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/predictions" className="text-zinc-400 hover:text-white font-mono text-sm transition-colors flex items-center gap-2">
          <span>←</span> Back to Predictions Terminal
        </Link>
      </div>

      <div className="p-8 rounded-2xl bg-[#09090b] border border-zinc-800 relative overflow-hidden shadow-2xl">
        {/* Background glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#138561]/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        
        <div className="relative z-10 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-3 py-1 text-xs font-mono font-bold uppercase rounded bg-[#121215] border border-zinc-800 text-zinc-300">
                  {prediction.match.league.name}
                </span>
                <span className="text-zinc-500 font-mono text-xs">
                  {new Date(prediction.match.matchDate).toLocaleString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                {prediction.isFreePick && (
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                    🎁 FREE COMMUNITY SLIP
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white mt-2 uppercase tracking-tight">
                {prediction.match.homeTeam.name} <span className="text-zinc-600 font-mono text-xl">VS</span> {prediction.match.awayTeam.name}
              </h1>
            </div>
            <div className="text-left md:text-right bg-[#121215] px-5 py-3 rounded-xl border border-zinc-800 shrink-0">
              <p className="text-xs text-zinc-400 font-mono uppercase tracking-wider">Confidence Score</p>
              <p className="text-3xl font-bold text-[#138561] font-mono mt-0.5">{prediction.confidence}%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 border-y border-zinc-800/80 py-6">
            <div className="bg-[#121215] p-4 rounded-xl border border-zinc-800/60">
              <p className="text-xs text-zinc-400 font-mono uppercase tracking-wider">AI Pick / Selection</p>
              <p className="text-lg font-bold text-[#138561] font-mono mt-1">{prediction.selection}</p>
            </div>
            {prediction.bookingCode ? (
              <div className="bg-[#121215] p-4 rounded-xl border border-zinc-800/60">
                <p className="text-xs text-zinc-400 font-mono uppercase tracking-wider">
                  {prediction.bookmaker || "Booking"} Code
                </p>
                <p className="text-lg font-bold text-white font-mono mt-1 select-all tracking-widest">
                  {prediction.bookingCode}
                </p>
              </div>
            ) : (
              <div className="bg-[#121215] p-4 rounded-xl border border-zinc-800/60">
                <p className="text-xs text-zinc-400 font-mono uppercase tracking-wider">Current Odds</p>
                <p className="text-lg font-bold text-white font-mono mt-1">{prediction.odds?.toFixed(2) || "VIP Edge"}</p>
              </div>
            )}
            <div className="bg-[#121215] p-4 rounded-xl border border-zinc-800/60 sm:col-span-2 md:col-span-1">
              <p className="text-xs text-zinc-400 font-mono uppercase tracking-wider">Model Status</p>
              <p className="text-lg font-bold text-emerald-400 font-mono mt-1">QUANT VERIFIED ✅</p>
            </div>
          </div>

          {/* AI Explanation Section */}
          <div className="bg-[#121215] p-6 rounded-xl border border-zinc-800">
            <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2 font-mono uppercase tracking-wide">
              <span className="text-[#138561]">⚡</span>
              <span>Quant Insights & Rationale</span>
            </h2>
            {prediction.explanation && prediction.explanation.content ? (
              <div className="space-y-4">
                <div className="text-sm text-zinc-300 leading-relaxed font-sans whitespace-pre-wrap">
                  {prediction.explanation.content}
                </div>
                {prediction.explanation.keyFactors && prediction.explanation.keyFactors.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-zinc-800/80">
                    <p className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">Key Factors & Tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {prediction.explanation.keyFactors.map((factor: any, idx: number) => (
                        <span key={idx} className="px-3 py-1 rounded-md text-xs font-mono font-bold bg-black/50 text-[#138561] border border-[#138561]/30 uppercase tracking-wider">
                          {String(factor)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-zinc-500 italic text-sm font-sans">No detailed analysis available for this prediction.</p>
            )}
          </div>

          {/* Statistics Section */}
          {prediction.statistics && prediction.statistics.length > 0 && (
            <div>
              <h2 className="text-base font-bold text-white mb-4 font-mono uppercase tracking-wide">Supporting Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {prediction.statistics.map((stat: any) => (
                  <div key={stat.id} className="p-4 rounded-xl bg-[#121215] border border-zinc-800">
                    <p className="text-xs text-zinc-400 font-mono uppercase tracking-wider">{stat.statName}</p>
                    <p className="text-lg font-bold text-white font-mono mt-1">{stat.statValue}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
