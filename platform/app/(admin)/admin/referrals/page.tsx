"use client";

import React, { useState, useEffect } from "react";
import { MASTER_ADMIN_EMAILS } from "@/lib/security/constants";

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  role?: string;
  emailVerified?: boolean;
  createdAt: string;
  subscriptionStatus?: string;
  referralCode?: string;
}

export default function AdminReferralsPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [referralFilter, setReferralFilter] = useState("ALL");
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [customRefCode, setCustomRefCode] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [commissionRate, setCommissionRate] = useState(25);

  useEffect(() => {
    fetchUsersAndSubscriptions();
  }, []);

  useEffect(() => {
    if (!showReferralModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowReferralModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showReferralModal]);

  async function fetchUsersAndSubscriptions() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      const data = await res.json();

      if (data && data.users && data.users.length > 0) {
        const subMap = data.subscriptions || {};
        const formatted = data.users.map((u: any) => ({
          id: u.id,
          email: u.email || "Unknown Email",
          name: u.name || u.email?.split("@")[0] || "User",
          role: MASTER_ADMIN_EMAILS.includes(u.email?.toLowerCase()) ? "admin" : "user",
          emailVerified: u.emailVerified ?? true,
          createdAt: u.createdAt || new Date().toISOString(),
          subscriptionStatus: subMap[u.id] || "FREE",
          referralCode: u.referralCode || undefined,
        }));
        setUsers(formatted);
      }
      setFetchError(null);
    } catch (err) {
      console.error("Failed to load users:", err);
      setFetchError('Failed to load users for referral data. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  const uniqueReferrals = Array.from(
    new Set(users.map((u) => u.referralCode).filter(Boolean))
  ) as string[];

  const referredUsersCount = referralFilter !== "ALL"
    ? users.filter((u) => u.referralCode === referralFilter).length
    : 0;
  const referredProCount = referralFilter !== "ALL"
    ? users.filter((u) => u.referralCode === referralFilter && u.subscriptionStatus === "ACTIVE").length
    : 0;

  return (
    <div className="space-y-8 max-w-6xl pb-16 font-main">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold font-heading text-white">Affiliates & Referrals</h1>
          </div>
          <p className="text-gray-400 mt-1 text-sm">
            Generate custom influencer referral links and track attribution, signups, and payouts.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <select
            value={referralFilter}
            onChange={(e) => setReferralFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-black/50 border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-primary-600 cursor-pointer"
          >
            <option value="ALL">Select an Affiliate Code ({uniqueReferrals.length})</option>
            {uniqueReferrals.map((code) => (
              <option key={code} value={code}>Ref: {code}</option>
            ))}
          </select>

          <button
            onClick={() => {
              setCustomRefCode("");
              setCopiedLink(false);
              setShowReferralModal(true);
            }}
            className="w-full sm:w-auto px-4 py-2 bg-primary-600 hover:bg-[#0f6b4d] text-white font-bold rounded-xl text-xs transition-colors shadow-[0_0_15px_rgba(19,133,97,0.3)] cursor-pointer text-center flex items-center justify-center gap-1.5"
          >
            <span>🔗</span>
            <span>Create Referral Link</span>
          </button>
        </div>
      </div>

      {fetchError && (
        <div role="alert" className="flex items-center gap-3 bg-red-950/40 border border-red-500/40 rounded-xl px-5 py-3.5 text-red-300 text-sm font-medium">
          <span aria-hidden="true">⚠️</span>
          {fetchError}
          <button onClick={fetchUsersAndSubscriptions} className="ml-auto text-xs underline underline-offset-2 hover:text-red-200 transition-colors">
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : referralFilter === "ALL" ? (
        <div className="text-center py-16 bg-[#121215] border border-zinc-800 rounded-2xl space-y-4">
          <div className="text-4xl">🔗</div>
          <h3 className="text-xl font-bold text-white font-heading">No Affiliate Selected</h3>
          <p className="text-gray-400 font-medium max-w-md mx-auto text-sm">
            Select an existing affiliate code from the dropdown above to view attribution metrics, or create a new referral link for a partner.
          </p>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0d2e21] via-black to-[#0b1d16] border border-primary-600/60 flex flex-col gap-5 shadow-[0_0_25px_rgba(19,133,97,0.25)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="text-xs uppercase font-mono tracking-wider text-primary-600 font-bold">Influencer Payout & Attribution Engine</div>
              <h3 className="text-2xl font-bold text-white mt-0.5 flex items-center gap-2">
                <span>Code:</span>
                <span className="font-mono text-emerald-400 bg-white/5 px-3 py-1 rounded-lg border border-emerald-500/30">{referralFilter}</span>
              </h3>
            </div>
            <button
              onClick={() => {
                const link = `${window.location.origin}/register?ref=${referralFilter}`;
                navigator.clipboard.writeText(link);
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2500);
              }}
              className="px-4 py-2 bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-400/40 text-emerald-300 font-mono text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <span>{copiedLink ? "✅ Copied Custom Referral Link!" : "📋 Copy Custom Referral Link"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-black/50 p-3.5 rounded-xl border border-white/10">
              <div className="text-[10px] text-gray-400 font-mono uppercase">Referred Signups</div>
              <div className="text-xl font-bold text-white mt-1">{referredUsersCount} Users</div>
            </div>
            <div className="bg-black/50 p-3.5 rounded-xl border border-white/10">
              <div className="text-[10px] text-gray-400 font-mono uppercase">Pro VIP Conversions</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">{referredProCount} PRO (₦5,000/mo)</div>
            </div>
            <div className="bg-emerald-950/40 p-3.5 rounded-xl border border-emerald-500/30">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-emerald-300 font-mono uppercase">Influencer Share ({commissionRate}%)</span>
                <select
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                  className="bg-black text-emerald-300 text-[10px] font-mono rounded px-1.5 py-0.5 border border-emerald-500/40 outline-none"
                >
                  <option value={20}>20%</option>
                  <option value={25}>25%</option>
                  <option value={30}>30%</option>
                  <option value={50}>50%</option>
                </select>
              </div>
              <div className="text-xl font-bold text-emerald-300 mt-1">
                ₦{((referredProCount * 5000 * commissionRate) / 100).toLocaleString('en-NG')} / mo
              </div>
            </div>
            <div className="bg-black/70 p-3.5 rounded-xl border border-white/10">
              <div className="text-[10px] text-gray-400 font-mono uppercase">Strike IQ Net Profit</div>
              <div className="text-xl font-bold text-white mt-1">
                ₦{((referredProCount * 5000 * (100 - commissionRate)) / 100).toLocaleString('en-NG')} / mo
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE REFERRAL LINK MODAL */}
      {showReferralModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="referral-modal-title"
        >
          <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6 max-w-md w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 id="referral-modal-title" className="text-lg font-bold text-white font-heading">🔗 Create Influencer Referral Link</h3>
              <button
                type="button"
                onClick={() => setShowReferralModal(false)}
                className="text-zinc-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Influencer / Partner Code</label>
                <input
                  type="text"
                  placeholder="e.g. TWITTER-KING or VIP2026"
                  value={customRefCode}
                  onChange={(e) => setCustomRefCode(e.target.value.toUpperCase())}
                  className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-4 py-2.5 text-white text-sm font-mono uppercase focus:outline-none focus:border-primary-600"
                />
              </div>

              {customRefCode && (
                <div className="p-3 bg-black/60 rounded-xl border border-emerald-500/30 space-y-2">
                  <div className="text-[10px] font-mono text-gray-400 uppercase">Generated Shareable Link:</div>
                  <div className="text-xs font-mono text-emerald-400 break-all">
                    {window.location.origin}/register?ref={customRefCode}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowReferralModal(false)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-sm transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={!customRefCode}
                  onClick={() => {
                    const link = `${window.location.origin}/register?ref=${customRefCode}`;
                    navigator.clipboard.writeText(link);
                    setReferralFilter(customRefCode);
                    setShowReferralModal(false);
                  }}
                  className="flex-1 py-3 bg-primary-600 hover:bg-[#0f6b4d] text-white font-bold rounded-xl text-sm transition-colors shadow-lg disabled:opacity-50"
                >
                  Copy & Filter Table
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
