"use client";

import React, { useState, useEffect } from "react";
import { MASTER_ADMIN_EMAILS } from "@/lib/security/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

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
  const [commissionRate, setCommissionRate] = useState("25");

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
          <p className="text-zinc-400 mt-1 text-sm">
            Generate custom influencer referral links and track attribution, signups, and payouts.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <Select value={referralFilter} onValueChange={(val) => val && setReferralFilter(val)}>
            <SelectTrigger className="w-full sm:w-[280px] bg-black/50 border-white/10 text-xs text-white h-9 rounded-xl font-bold">
              <SelectValue placeholder="Select an Affiliate Code" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-white text-xs">
              <SelectItem value="ALL">Select an Affiliate Code ({uniqueReferrals.length})</SelectItem>
              {uniqueReferrals.map((code) => (
                <SelectItem key={code} value={code}>Ref: {code}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={() => {
              setCustomRefCode("");
              setCopiedLink(false);
              setShowReferralModal(true);
            }}
            className="w-full sm:w-auto h-9 px-4 bg-primary-600 hover:bg-[#0f6b4d] text-white font-bold rounded-xl text-xs transition-colors shadow-[0_0_15px_rgba(19,133,97,0.3)] flex items-center justify-center gap-1.5"
          >
            <span>🔗</span>
            <span>Create Referral Link</span>
          </Button>
        </div>
      </div>

      {fetchError && (
        <div role="alert" className="flex items-center gap-3 bg-red-950/40 border border-red-500/40 rounded-xl px-5 py-3.5 text-red-300 text-sm font-medium">
          <span aria-hidden="true">⚠️</span>
          {fetchError}
          <Button variant="link" onClick={fetchUsersAndSubscriptions} className="ml-auto text-xs font-bold text-red-300 h-auto p-0">
            Retry
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : referralFilter === "ALL" ? (
        <Card className="bg-[#121215] border-zinc-800 rounded-2xl">
          <CardContent className="text-center py-16 space-y-4">
            <div className="text-4xl">🔗</div>
            <h3 className="text-xl font-bold text-white font-heading">No Affiliate Selected</h3>
            <p className="text-zinc-400 font-medium max-w-md mx-auto text-sm">
              Select an existing affiliate code from the dropdown above to view attribution metrics, or create a new referral link for a partner.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-r from-[#0d2e21] via-black to-[#0b1d16] border-primary-600/60 shadow-[0_0_25px_rgba(19,133,97,0.25)] rounded-2xl">
          <CardContent className="p-6 flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="text-xs uppercase font-mono tracking-wider text-primary-600 font-bold">Influencer Payout & Attribution Engine</div>
                <h3 className="text-2xl font-bold text-white mt-0.5 flex items-center gap-2">
                  <span>Code:</span>
                  <Badge variant="outline" className="font-mono text-emerald-400 bg-white/5 px-3 py-1 border-emerald-500/30 text-base">
                    {referralFilter}
                  </Badge>
                </h3>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  const link = `${window.location.origin}/register?ref=${referralFilter}`;
                  navigator.clipboard.writeText(link);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2500);
                }}
                className="bg-emerald-900/60 hover:bg-emerald-800 border-emerald-400/40 hover:text-white text-emerald-300 font-mono text-xs rounded-xl flex items-center gap-2 transition-all shadow-md h-10"
              >
                <span>{copiedLink ? "✅ Copied Custom Referral Link!" : "📋 Copy Custom Referral Link"}</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <Card className="bg-black/50 border-white/10 rounded-xl">
                <CardContent className="p-3.5">
                  <div className="text-[10px] text-zinc-400 font-mono uppercase">Referred Signups</div>
                  <div className="text-xl font-bold text-white mt-1">{referredUsersCount} Users</div>
                </CardContent>
              </Card>
              <Card className="bg-black/50 border-white/10 rounded-xl">
                <CardContent className="p-3.5">
                  <div className="text-[10px] text-zinc-400 font-mono uppercase">Pro VIP Conversions</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">{referredProCount} PRO (₦5,000/mo)</div>
                </CardContent>
              </Card>
              <Card className="bg-emerald-950/40 border-emerald-500/30 rounded-xl">
                <CardContent className="p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-emerald-300 font-mono uppercase">Influencer Share ({commissionRate}%)</span>
                    <Select value={commissionRate} onValueChange={(val) => val && setCommissionRate(val)}>
                      <SelectTrigger className="w-[60px] h-6 bg-black text-emerald-300 text-[10px] font-mono rounded px-1.5 py-0 border-emerald-500/40 outline-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-700 text-emerald-300 text-[10px] font-mono">
                        <SelectItem value="20">20%</SelectItem>
                        <SelectItem value="25">25%</SelectItem>
                        <SelectItem value="30">30%</SelectItem>
                        <SelectItem value="50">50%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="text-xl font-bold text-emerald-300 mt-1">
                    ₦{((referredProCount * 5000 * Number(commissionRate)) / 100).toLocaleString('en-NG')} / mo
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-black/70 border-white/10 rounded-xl">
                <CardContent className="p-3.5">
                  <div className="text-[10px] text-zinc-400 font-mono uppercase">Strike IQ Net Profit</div>
                  <div className="text-xl font-bold text-white mt-1">
                    ₦{((referredProCount * 5000 * (100 - Number(commissionRate))) / 100).toLocaleString('en-NG')} / mo
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CREATE REFERRAL LINK MODAL */}
      {showReferralModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="referral-modal-title"
        >
          <Card className="bg-[#121215] border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
              <h3 id="referral-modal-title" className="text-lg font-bold text-white font-heading">🔗 Create Influencer Referral Link</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowReferralModal(false)}
                className="text-zinc-400 hover:text-white h-6 w-6"
              >
                ✕
              </Button>
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
                  <div className="text-[10px] font-mono text-zinc-400 uppercase">Generated Shareable Link:</div>
                  <div className="text-xs font-mono text-emerald-400 break-all">
                    {window.location.origin}/register?ref={customRefCode}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-6 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowReferralModal(false)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-sm transition-colors border-0 h-12"
                >
                  Close
                </Button>
                <Button
                  type="button"
                  disabled={!customRefCode}
                  onClick={() => {
                    const link = `${window.location.origin}/register?ref=${customRefCode}`;
                    navigator.clipboard.writeText(link);
                    setReferralFilter(customRefCode);
                    setShowReferralModal(false);
                  }}
                  className="flex-1 py-3 bg-primary-600 hover:bg-[#0f6b4d] text-white font-bold rounded-xl text-sm transition-colors shadow-lg disabled:opacity-50 h-12"
                >
                  Copy & Filter Table
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
