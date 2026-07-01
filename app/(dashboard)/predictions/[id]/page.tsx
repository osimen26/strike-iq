import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function PredictionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const prediction = await prisma.prediction.findUnique({
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

  if (!prediction) {
    notFound();
  }

  // NOTE: In a real implementation, we would check if this is premium and if the user has a subscription.
  // We can handle this logic via middleware or inline server checks.

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/predictions" className="text-gray-400 hover:text-white">
          ← Back to Predictions
        </Link>
      </div>

      <div className="p-8 rounded-xl bg-[var(--color-background-surface)] border border-[var(--color-border-glass)] relative overflow-hidden">
        {/* Background glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-brand-emerald)]/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="relative z-10 space-y-8">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className="px-3 py-1 text-sm font-semibold rounded bg-white/10 text-white">
                  {prediction.match.league.name}
                </span>
                <span className="text-gray-400 text-sm">
                  {new Date(prediction.match.matchDate).toLocaleString()}
                </span>
              </div>
              <h1 className="text-3xl font-bold font-heading text-white mt-2">
                {prediction.match.homeTeam.name} vs {prediction.match.awayTeam.name}
              </h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Confidence Score</p>
              <p className="text-4xl font-bold text-[var(--color-brand-mint)]">{prediction.confidence}%</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-y border-white/10 py-6">
            <div>
              <p className="text-sm text-gray-400">Our Prediction</p>
              <p className="text-xl font-bold text-white mt-1">{prediction.selection}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Current Odds</p>
              <p className="text-xl font-bold text-[var(--color-brand-emerald)] mt-1">{prediction.odds?.toFixed(2) || "N/A"}</p>
            </div>
          </div>

          {/* AI Explanation Section */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
              <span>🤖</span>
              <span>AI Analysis</span>
            </h2>
            {prediction.explanation ? (
              <div className="space-y-4">
                <div className="prose prose-invert max-w-none text-gray-300">
                  {/* Ideally render markdown, but for now just text */}
                  {prediction.explanation.content}
                </div>
                {prediction.explanation.keyFactors && prediction.explanation.keyFactors.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-white mb-2">Key Factors:</p>
                    <div className="flex flex-wrap gap-2">
                      {prediction.explanation.keyFactors.map((factor, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full text-xs bg-[var(--color-brand-actionGreen)]/20 text-[var(--color-brand-mint)] border border-[var(--color-brand-actionGreen)]/30">
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 italic">No detailed analysis available for this prediction.</p>
            )}
          </div>

          {/* Statistics Section */}
          {prediction.statistics && prediction.statistics.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Supporting Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {prediction.statistics.map((stat) => (
                  <div key={stat.id} className="p-4 rounded-lg bg-black/40 border border-white/5">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">{stat.statName}</p>
                    <p className="text-lg font-bold text-white mt-1">{stat.statValue}</p>
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
