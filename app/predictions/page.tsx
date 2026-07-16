"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MatchCard } from "@/components/dashboard/MatchCard";
import { createClient } from "@/lib/supabase/client";
import SignInModal from "@/components/landing/SignInModal";
import NavBar from "@/components/landing/NavBar";
import Footer from "@/components/landing/Footer";
import { ZapIcon, LockIcon, GiftIcon, CrownIcon } from "@/components/icons/Icons";

export default function PublicPredictionsPreview() {
  const [activeSport, setActiveSport] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isProUser, setIsProUser] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalReason, setModalReason] = useState("copy this booking code and access live quantitative signals");
  const supabase = createClient();

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Check if user is pro
    fetch("/api/subscriptions/current")
      .then((r) => r.json())
      .then((sub) => {
        if (sub.success && sub.isPro) {
          setIsProUser(true);
        }
      })
      .catch(() => {});

    // Fetch live feed
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

  const handleRequireLogin = (reason = "copy this booking code and unlock live quantitative intelligence") => {
    setModalReason(reason);
    setIsModalOpen(true);
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

  const isGuest = !user;

  return (
    <div className="min-h-screen bg-[#050B14] text-white flex flex-col font-main">
      <NavBar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-24 pb-16 space-y-8">
        {/* Guest Banner */}
        {isGuest && (
          <div className="bg-gradient-to-r from-emerald-950/60 via-zinc-900/90 to-emerald-950/60 border border-[var(--color-brand-emerald)]/40 rounded-2xl p-5 md:p-6 shadow-xl shadow-emerald-950/30 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-brand-emerald)]/20 border border-[var(--color-brand-emerald)]/40 flex items-center justify-center text-[var(--color-brand-electricGreen)] shrink-0">
                <LockIcon size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[var(--color-brand-electricGreen)] uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-brand-electricGreen)] animate-ping"></span>
                  LIVE INTERACTIVE PREVIEW MODE
                </div>
                <h2 className="text-lg md:text-xl font-bold text-white font-heading tracking-tight mt-0.5">
                  Try Before You Buy &mdash; Experience Strike IQ Intelligence
                </h2>
                <p className="text-zinc-400 text-xs sm:text-sm font-mono mt-1">
                  Explore our real-time odds & AI verification below. Free codes are visible; <span className="text-emerald-400 font-bold">VIP Pro codes are blurred</span> until you sign in to copy.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
              <Link
                href="/login"
                className="flex-1 md:flex-initial py-2.5 px-5 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#138561] text-white hover:bg-emerald-600 transition-all text-center border border-emerald-400/50 shadow-lg flex items-center justify-center gap-1.5"
              >
                <ZapIcon size={14} />
                <span>Log In</span>
              </Link>
              <Link
                href="/register"
                className="flex-1 md:flex-initial py-2.5 px-5 rounded-xl font-bold text-xs uppercase tracking-wider bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 transition-all text-center"
              >
                Sign Up Free
              </Link>
            </div>
          </div>
        )}

        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-zinc-900 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#138561] font-bold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-[#138561] animate-pulse"></span>
              QUANT PREDICTIONS TERMINAL // LIVE FEED
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white font-heading uppercase tracking-tight">
              PUBLIC AI PREDICTIONS FEED
            </h1>
            <p className="text-zinc-400 text-sm font-mono mt-1">
              Verify our AI confidence signals right now. Click &quot;Copy Code&quot; on any slip to get your booking codes.
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">🔍</span>
            <input
              type="text"
              placeholder="Search teams or leagues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#09090b] border border-zinc-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-[#138561] transition-colors shadow-lg"
            />
          </div>
        </div>

        {/* Sport Filters & Stats */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2 bg-[#09090b] p-1.5 rounded-lg border border-zinc-900">
            {["All", "Football", "Basketball"].map((sport) => (
              <button
                key={sport}
                onClick={() => setActiveSport(sport)}
                className={`px-4 py-1.5 rounded-md text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                  activeSport === sport
                    ? "bg-[#138561] text-white shadow"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                {sport}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded bg-zinc-900/80 border border-zinc-800">
              <GiftIcon size={12} className="text-cyan-400" />
              <span>Free Slips: Open</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded bg-zinc-900/80 border border-zinc-800">
              <CrownIcon size={12} className="text-[#138561]" />
              <span>VIP Pro: {isGuest ? "Locked (Sign In to Copy)" : isProUser ? "Unlocked" : "Upgrade to Unlock"}</span>
            </span>
          </div>
        </div>

        {/* Feed Content */}
        {loading ? (
          <div className="text-center py-20 bg-[#09090b]/50 border border-zinc-900 rounded-2xl">
            <div className="w-8 h-8 border-2 border-[#138561] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-zinc-500 font-mono text-sm uppercase tracking-wider">
              Syncing Quant Models & Booking Codes...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-[#09090b]/50 border border-zinc-900 rounded-2xl">
            <p className="text-zinc-400 font-mono font-bold text-sm uppercase">
              No predictions matching your search
            </p>
            <button
              onClick={() => {
                setActiveSport("All");
                setSearchQuery("");
              }}
              className="mt-4 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-xs font-mono font-bold text-[#138561] uppercase rounded border border-zinc-800 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((pred, i) => (
              <MatchCard
                key={pred.id || i}
                match={pred}
                isLocked={pred.isProPick && !isProUser}
                isGuest={isGuest}
                onRequireLogin={handleRequireLogin}
              />
            ))}
          </div>
        )}

        {/* Bottom CTA for Guests */}
        {isGuest && (
          <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-[#0d1624] via-[#090f19] to-[#0d1624] border border-[var(--color-brand-emerald)]/30 text-center space-y-4 shadow-2xl">
            <h3 className="text-2xl font-extrabold text-white font-heading uppercase tracking-tight">
              Ready to copy all high-confidence booking codes?
            </h3>
            <p className="text-zinc-400 text-sm font-mono max-w-xl mx-auto">
              Join thousands of smart bettors using Strike IQ&apos;s machine learning verification engine. Create your free account in less than 30 seconds.
            </p>
            <div className="flex items-center justify-center gap-4 pt-2">
              <Link
                href="/register"
                className="py-3 px-6 rounded-xl font-extrabold text-sm uppercase tracking-wider bg-[#138561] text-white hover:bg-emerald-600 transition-all shadow-[0_0_20px_rgba(19,133,97,0.4)]"
              >
                Create Free Account
              </Link>
              <Link
                href="/login"
                className="py-3 px-6 rounded-xl font-extrabold text-sm uppercase tracking-wider bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 transition-all"
              >
                Log In Existing Account
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Sign In Required Modal */}
      <SignInModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        reason={modalReason}
      />
    </div>
  );
}
