"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [referralFilter, setReferralFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [customRefCode, setCustomRefCode] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [commissionRate, setCommissionRate] = useState(25);
  const [creatingUser, setCreatingUser] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [newUserData, setNewUserData] = useState({
    email: "",
    name: "",
    role: "user",
    subscriptionStatus: "FREE",
  });

  useEffect(() => {
    fetchUsersAndSubscriptions();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, referralFilter, pageSize]);

  // Modal accessibility: listen for Escape key to close open dialogs
  useEffect(() => {
    if (!showAddModal && !showReferralModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowAddModal(false);
        setShowReferralModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showAddModal, showReferralModal]);

  async function fetchUsersAndSubscriptions() {
    try {
      setLoading(true);

      // Fetch users via server API to bypass browser RLS policies
      const res = await fetch("/api/admin/users");
      const data = await res.json();

      let formatted: UserProfile[] = [];
      if (data && data.users && data.users.length > 0) {
        const subMap = data.subscriptions || {};
        formatted = data.users.map((u: any) => ({
          id: u.id,
          email: u.email || "Unknown Email",
          name: u.name || u.email?.split("@")[0] || "User",
          role: u.email?.toLowerCase() === "osimenvictor04@gmail.com" ? "admin" : "user",
          emailVerified: u.emailVerified ?? true,
          createdAt: u.createdAt || new Date().toISOString(),
          subscriptionStatus: subMap[u.id] || "FREE",
          referralCode: u.referralCode || undefined,
        }));
      }

      // Ensure Master VIP Admin is always present
      const hasMaster = formatted.some((u) => u.email.toLowerCase() === "osimenvictor04@gmail.com");
      if (!hasMaster) {
        formatted.unshift({
          id: "master-admin",
          email: "osimenvictor04@gmail.com",
          name: "Osimen Victor (Master Admin)",
          role: "admin",
          emailVerified: true,
          createdAt: new Date().toISOString(),
          subscriptionStatus: "ACTIVE",
        });
      }

      setUsers(formatted);
      setFetchError(null);
    } catch (err) {
      console.error("Failed to load users:", err);
      setFetchError('Failed to load users. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.email.trim()) return;
    setCreatingUser(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUserData),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to create user");
      }
      setShowAddModal(false);
      setNewUserData({ email: "", name: "", role: "user", subscriptionStatus: "FREE" });
      await fetchUsersAndSubscriptions();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreatingUser(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;

    if (roleFilter === "ADMIN" && u.role !== "admin") return false;
    if (roleFilter === "USER" && u.role === "admin") return false;
    if (roleFilter === "PRO" && u.subscriptionStatus !== "ACTIVE") return false;
    if (referralFilter !== "ALL" && u.referralCode !== referralFilter) return false;

    return true;
  });

  const uniqueReferrals = Array.from(
    new Set(users.map((u) => u.referralCode).filter(Boolean))
  ) as string[];

  const referredUsersCount = referralFilter !== "ALL"
    ? users.filter((u) => u.referralCode === referralFilter).length
    : 0;
  const referredProCount = referralFilter !== "ALL"
    ? users.filter((u) => u.referralCode === referralFilter && u.subscriptionStatus === "ACTIVE").length
    : 0;

  const standardUsersCount = users.filter((u) => u.role !== "admin").length;
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-8 max-w-6xl pb-16 font-main">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold font-heading text-white">User Management</h1>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[var(--color-brand-emerald)]/20 text-[var(--color-brand-emerald)] border border-[var(--color-brand-emerald)]/40">
              {users.length} Total Users ({standardUsersCount} Standard)
            </span>
          </div>
          <p className="text-gray-400 mt-1 text-sm">
            View registered user clearances, roles, subscription statuses, and create user accounts.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 w-full md:w-auto">
          <div className="relative w-full sm:w-56">
            <input
              type="text"
              placeholder="Search email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[var(--color-brand-emerald)] placeholder-gray-500 shadow-inner"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-black/50 border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[var(--color-brand-emerald)] cursor-pointer"
          >
            <option value="ALL">All Roles & Tiers</option>
            <option value="ADMIN">VIP Admins Only</option>
            <option value="USER">Standard Users</option>
            <option value="PRO">Active Pro Subscribers</option>
          </select>

          <select
            value={referralFilter}
            onChange={(e) => setReferralFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-black/50 border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[var(--color-brand-emerald)] cursor-pointer"
          >
            <option value="ALL">🏷️ All Referrals ({uniqueReferrals.length})</option>
            {uniqueReferrals.map((code) => (
              <option key={code} value={code}>Ref: {code}</option>
            ))}
          </select>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setCustomRefCode("");
                setCopiedLink(false);
                setShowReferralModal(true);
              }}
              className="flex-1 sm:flex-initial px-3 py-2 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-bold rounded-xl text-xs transition-colors shadow-[0_0_15px_rgba(19,133,97,0.2)] cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>🔗</span>
              <span>Referral Link</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex-1 sm:flex-initial px-3.5 py-2 bg-[var(--color-brand-emerald)] hover:bg-[#0f6b4d] text-white font-bold rounded-xl text-xs transition-colors shadow-[0_0_15px_rgba(19,133,97,0.3)] cursor-pointer text-center"
            >
              + Add User
            </button>

            <button
              onClick={fetchUsersAndSubscriptions}
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 transition-colors cursor-pointer shrink-0 flex items-center justify-center"
              aria-label={loading ? 'Refreshing users...' : 'Refresh users list'}
            >
              <svg className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {referralFilter !== "ALL" && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0d2e21] via-black to-[#0b1d16] border border-[#138561]/60 flex flex-col gap-5 shadow-[0_0_25px_rgba(19,133,97,0.25)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="text-xs uppercase font-mono tracking-wider text-[#138561] font-bold">Influencer Payout & Attribution Engine</div>
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

          {/* Payout Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-black/50 p-3.5 rounded-xl border border-white/10">
              <div className="text-[10px] text-gray-400 font-mono uppercase">Referred Signups</div>
              <div className="text-xl font-bold text-white mt-1">{referredUsersCount} Users</div>
            </div>
            <div className="bg-black/50 p-3.5 rounded-xl border border-white/10">
              <div className="text-[10px] text-gray-400 font-mono uppercase">Pro VIP Conversions</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">{referredProCount} PRO ($9.99/mo)</div>
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
                ${((referredProCount * 9.99 * commissionRate) / 100).toFixed(2)} / mo
              </div>
            </div>
            <div className="bg-black/70 p-3.5 rounded-xl border border-white/10">
              <div className="text-[10px] text-gray-400 font-mono uppercase">Strike IQ Net Profit</div>
              <div className="text-xl font-bold text-white mt-1">
                ${((referredProCount * 9.99 * (100 - commissionRate)) / 100).toFixed(2)} / mo
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE USER MODAL */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-user-modal-title"
        >
          <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6 max-w-md w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 id="add-user-modal-title" className="text-lg font-bold text-white font-heading">Add User Account</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Email Address</label>
                <input
                  required
                  type="email"
                  placeholder="e.g. member@strikeiq.com"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[var(--color-brand-emerald)]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Full Name</label>
                <input
                  placeholder="e.g. Alex Johnson"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[var(--color-brand-emerald)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Role</label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                    className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[var(--color-brand-emerald)]"
                  >
                    <option value="user">Standard User</option>
                    <option value="admin">VIP Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Subscription Plan</label>
                  <select
                    value={newUserData.subscriptionStatus}
                    onChange={(e) => setNewUserData({ ...newUserData, subscriptionStatus: e.target.value })}
                    className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[var(--color-brand-emerald)]"
                  >
                    <option value="FREE">Free Tier</option>
                    <option value="ACTIVE">Active Pro Tier</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="flex-1 py-3 bg-[var(--color-brand-emerald)] hover:bg-[#0f6b4d] text-white font-bold rounded-xl text-sm transition-colors shadow-lg disabled:opacity-50"
                >
                  {creatingUser ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
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
                  className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-4 py-2.5 text-white text-sm font-mono uppercase focus:outline-none focus:border-[var(--color-brand-emerald)]"
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
                  className="flex-1 py-3 bg-[var(--color-brand-emerald)] hover:bg-[#0f6b4d] text-white font-bold rounded-xl text-sm transition-colors shadow-lg disabled:opacity-50"
                >
                  Copy & Filter Table
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {fetchError && (
        <div role="alert" aria-live="assertive" className="flex items-center gap-3 bg-red-950/40 border border-red-500/40 rounded-xl px-5 py-3.5 text-red-300 text-sm font-medium">
          <span aria-hidden="true">⚠️</span>
          {fetchError}
          <button onClick={fetchUsersAndSubscriptions} className="ml-auto text-xs underline underline-offset-2 hover:text-red-200 transition-colors">
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="w-10 h-10 border-4 border-[var(--color-brand-emerald)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-16 bg-[#121215] border border-zinc-800 rounded-2xl space-y-4">
          <p className="text-gray-400 font-medium">No user accounts found matching your filter criteria ({roleFilter === "USER" ? "Standard Users" : roleFilter}).</p>
          {roleFilter === "USER" && standardUsersCount === 0 && (
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              Currently only your VIP Admin account is listed. You can add a Standard User account to test or view standard permissions.
            </p>
          )}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => {
                setSearchQuery("");
                setRoleFilter("ALL");
              }}
              className="text-xs text-[var(--color-brand-electricGreen)] underline font-bold cursor-pointer"
            >
              Reset Search Filters
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-[var(--color-brand-emerald)] text-white font-bold rounded-lg text-xs hover:bg-[#0f6b4d] transition-colors cursor-pointer"
            >
              + Add Standard User Account
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#121215] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-black/40 border-b border-zinc-800 text-[11px] uppercase tracking-wider text-gray-400 font-bold font-mono">
                <tr>
                  <th className="px-6 py-4">User Profile</th>
                  <th className="px-6 py-4">Security Clearance</th>
                  <th className="px-6 py-4">Subscription Plan</th>
                  <th className="px-6 py-4">Verification</th>
                  <th className="px-6 py-4 text-right">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {paginatedUsers.map((user) => {
                  const isAdmin = user.email.toLowerCase() === "osimenvictor04@gmail.com";
                  const isPro = user.subscriptionStatus === "ACTIVE" || isAdmin;

                  return (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow ${
                            isAdmin
                              ? "bg-gradient-to-br from-amber-500 to-amber-700 text-black border border-amber-300"
                              : "bg-[var(--color-brand-emerald)]/20 text-[var(--color-brand-emerald)] border border-[var(--color-brand-emerald)]/30"
                          }`}>
                            {user.name ? user.name[0].toUpperCase() : "U"}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {isAdmin && <span title="Master VIP Admin" className="text-xs">👑</span>}
                            </div>
                            <div className="text-xs text-gray-400 font-mono mt-0.5">{user.email}</div>
                            {user.referralCode && (
                              <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-[10px] font-mono text-emerald-300">
                                <span>🏷️ Ref: {user.referralCode}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border ${
                          isAdmin
                            ? "bg-amber-950/60 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.15)]"
                            : "bg-white/5 text-gray-300 border-white/10"
                        }`}>
                          {isAdmin ? "👑 MASTER ADMIN" : "🛡️ STANDARD USER"}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border flex items-center gap-1 w-fit ${
                          isPro
                            ? "bg-emerald-950/60 text-[var(--color-brand-electricGreen)] border-[var(--color-brand-emerald)]/40 shadow-[0_0_10px_rgba(33,205,141,0.15)]"
                            : "bg-gray-900/60 text-gray-400 border-white/10"
                        }`}>
                          <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${isPro ? "bg-[var(--color-brand-electricGreen)] animate-pulse" : "bg-gray-500"}`}></span>
                          <span className="sr-only">{isPro ? 'Status: Active' : 'Status: Free'}</span>
                          {isPro ? "PRO VIP TIER" : "FREE TIER"}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Verified
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="text-xs font-mono text-gray-300">
                          {new Date(user.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                          {new Date(user.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4 bg-black/40 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center gap-2 text-gray-400">
              <span>Showing</span>
              <span className="font-bold text-white">
                {filteredUsers.length === 0 ? 0 : startIndex + 1}
              </span>
              <span>to</span>
              <span className="font-bold text-white">
                {Math.min(startIndex + pageSize, filteredUsers.length)}
              </span>
              <span>of</span>
              <span className="font-bold text-[var(--color-brand-emerald)]">
                {filteredUsers.length}
              </span>
              <span>users</span>

              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="ml-3 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700 text-white text-xs font-mono focus:outline-none focus:border-[var(--color-brand-emerald)] cursor-pointer"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed border border-zinc-800 text-gray-300 font-bold transition-all cursor-pointer"
                title="First Page"
              >
                «
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed border border-zinc-800 text-gray-300 font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                ‹ Prev
              </button>

              <span className="px-3 py-1.5 rounded bg-[var(--color-brand-emerald)]/10 border border-[var(--color-brand-emerald)]/30 text-[var(--color-brand-emerald)] font-bold">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed border border-zinc-800 text-gray-300 font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                Next ›
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed border border-zinc-800 text-gray-300 font-bold transition-all cursor-pointer"
                title="Last Page"
              >
                »
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
