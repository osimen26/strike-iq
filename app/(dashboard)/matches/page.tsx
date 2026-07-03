import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function MatchesPage() {
  const matches = await prisma.match.findMany({
    where: { isDeleted: false },
    include: {
      homeTeam: true,
      awayTeam: true,
      league: true,
      sport: true,
    },
    orderBy: { matchDate: "asc" },
    take: 30,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white font-heading">Matches Calendar</h1>
          <p className="text-[var(--color-accent-mutedSage)] mt-1">Upcoming events and live scores.</p>
        </div>
        
        <div className="flex space-x-3">
          <select className="px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[var(--color-brand-emerald)]">
            <option>All Sports</option>
            <option>Football</option>
            <option>Basketball</option>
          </select>
          <select className="px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[var(--color-brand-emerald)]">
            <option>Next 7 Days</option>
            <option>Today</option>
            <option>Past Results</option>
          </select>
        </div>
      </div>

      <div className="space-y-4 mt-8">
        {matches.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No upcoming matches scheduled.
          </div>
        ) : (
          <div className="bg-[var(--color-background-surface)] border border-[var(--color-border-glass)] rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-black/20 border-b border-white/10 text-xs uppercase text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Date & Time</th>
                  <th className="px-6 py-4 font-medium">League</th>
                  <th className="px-6 py-4 font-medium text-right">Home</th>
                  <th className="px-6 py-4 font-medium text-center">Score</th>
                  <th className="px-6 py-4 font-medium">Away</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {matches.map((match) => (
                  <tr key={match.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {new Date(match.matchDate).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      <span className="px-2 py-1 bg-white/5 rounded">
                        {match.league.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-white text-right">
                      {match.homeTeam.name}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-center text-[var(--color-brand-emerald)]">
                      {match.status === "SCHEDULED" ? "VS" : `${match.homeScore ?? "-"} : ${match.awayScore ?? "-"}`}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      {match.awayTeam.name}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        match.status === 'LIVE' ? 'bg-red-500/20 text-red-400' :
                        match.status === 'FINISHED' ? 'bg-gray-500/20 text-gray-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {match.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
