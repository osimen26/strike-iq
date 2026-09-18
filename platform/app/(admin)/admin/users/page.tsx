"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { MASTER_ADMIN_EMAIL, MASTER_ADMIN_EMAILS } from "@/lib/security/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
  const [pageSize, setPageSize] = useState("10");
  const [showAddModal, setShowAddModal] = useState(false);
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
    if (!showAddModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowAddModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showAddModal]);

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
          role: MASTER_ADMIN_EMAILS.includes(u.email?.toLowerCase()) ? "admin" : "user",
          emailVerified: u.emailVerified ?? true,
          createdAt: u.createdAt || new Date().toISOString(),
          subscriptionStatus: subMap[u.id] || "FREE",
          referralCode: u.referralCode || undefined,
        }));
      }

      // Ensure Master VIP Admin is always present
      const hasMaster = formatted.some((u) => MASTER_ADMIN_EMAILS.includes(u.email.toLowerCase()));
      if (!hasMaster) {
        formatted.unshift({
          id: "master-admin",
          email: MASTER_ADMIN_EMAIL,
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

    return true;
  });

  const uniqueReferrals = Array.from(
    new Set(users.map((u) => u.referralCode).filter(Boolean))
  ) as string[];

  const standardUsersCount = users.filter((u) => u.role !== "admin").length;
  const numericPageSize = Number(pageSize);
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / numericPageSize));
  const startIndex = (currentPage - 1) * numericPageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + numericPageSize);

  return (
    <div className="space-y-8 max-w-6xl pb-16 font-main">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold font-heading text-white">User Management</h1>
            <Badge variant="outline" className="text-[10px] font-mono font-bold bg-primary-600/20 text-primary-600 border-primary-600/40 px-2 py-0.5">
              {users.length} Total Users ({standardUsersCount} Standard)
            </Badge>
          </div>
          <p className="text-zinc-400 mt-1 text-sm">
            View registered user clearances, roles, subscription statuses, and create user accounts.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-56">
            <input
              type="text"
              placeholder="Search email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-primary-600 placeholder-zinc-500 shadow-inner h-9"
            />
          </div>

          <Select value={roleFilter} onValueChange={(val) => val && setRoleFilter(val)}>
            <SelectTrigger className="w-[180px] bg-black/50 border-white/10 text-xs text-white h-9 rounded-xl font-bold">
              <SelectValue placeholder="All Roles & Tiers" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-white text-xs">
              <SelectItem value="ALL">All Roles & Tiers</SelectItem>
              <SelectItem value="ADMIN">VIP Admins Only</SelectItem>
              <SelectItem value="USER">Standard Users</SelectItem>
              <SelectItem value="PRO">Active Pro Subscribers</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              onClick={() => setShowAddModal(true)}
              className="flex-1 sm:flex-initial h-9 bg-primary-600 hover:bg-[#0f6b4d] text-white font-bold rounded-xl text-xs transition-colors shadow-[0_0_15px_rgba(19,133,97,0.3)]"
            >
              + Add User
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={fetchUsersAndSubscriptions}
              className="w-9 h-9 bg-white/5 hover:bg-white/10 border-white/10 rounded-xl text-zinc-300 transition-colors"
              title={loading ? 'Refreshing users...' : 'Refresh users list'}
            >
              <svg className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </Button>
          </div>
        </div>
      </div>



      {/* CREATE USER MODAL */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-user-modal-title"
        >
          <Card className="bg-[#121215] border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
              <h3 id="add-user-modal-title" className="text-lg font-bold text-white font-heading">Add User Account</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white h-6 w-6"
              >
                ✕
              </Button>
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
                  className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-600"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Full Name</label>
                <input
                  placeholder="e.g. Alex Johnson"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Role</label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                    className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary-600 h-[42px]"
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
                    className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary-600 h-[42px]"
                  >
                    <option value="FREE">Free Tier</option>
                    <option value="ACTIVE">Active Pro Tier</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-6 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-sm transition-colors border-0 h-12"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creatingUser}
                  className="flex-1 py-3 bg-primary-600 hover:bg-[#0f6b4d] text-white font-bold rounded-xl text-sm transition-colors shadow-lg disabled:opacity-50 h-12"
                >
                  {creatingUser ? "Creating..." : "Create Account"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}



      {fetchError && (
        <div role="alert" aria-live="assertive" className="flex items-center gap-3 bg-red-950/40 border border-red-500/40 rounded-xl px-5 py-3.5 text-red-300 text-sm font-medium">
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
      ) : filteredUsers.length === 0 ? (
        <Card className="bg-[#121215] border-zinc-800 rounded-2xl">
          <CardContent className="text-center py-16 space-y-4">
            <p className="text-zinc-400 font-medium">No user accounts found matching your filter criteria ({roleFilter === "USER" ? "Standard Users" : roleFilter}).</p>
            {roleFilter === "USER" && standardUsersCount === 0 && (
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Currently only your VIP Admin account is listed. You can add a Standard User account to test or view standard permissions.
              </p>
            )}
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button
                variant="link"
                onClick={() => {
                  setSearchQuery("");
                  setRoleFilter("ALL");
                }}
                className="text-xs text-primary-400 font-bold"
              >
                Reset Search Filters
              </Button>
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-primary-600 text-white font-bold rounded-lg text-xs hover:bg-[#0f6b4d]"
              >
                + Add Standard User Account
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-[#121215] border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader className="bg-black/40 border-b border-zinc-800">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-6 py-4 text-[11px] uppercase tracking-wider text-zinc-400 font-bold font-mono h-auto">User Profile</TableHead>
                  <TableHead className="px-6 py-4 text-[11px] uppercase tracking-wider text-zinc-400 font-bold font-mono h-auto">Security Clearance</TableHead>
                  <TableHead className="px-6 py-4 text-[11px] uppercase tracking-wider text-zinc-400 font-bold font-mono h-auto">Subscription Plan</TableHead>
                  <TableHead className="px-6 py-4 text-[11px] uppercase tracking-wider text-zinc-400 font-bold font-mono h-auto">Verification</TableHead>
                  <TableHead className="px-6 py-4 text-[11px] uppercase tracking-wider text-zinc-400 font-bold font-mono h-auto text-right">Registered</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => {
                  const isAdmin = MASTER_ADMIN_EMAILS.includes(user.email.toLowerCase());
                  const isPro = user.subscriptionStatus === "ACTIVE" || isAdmin;

                  return (
                    <TableRow key={user.id} className="border-b border-zinc-800/60 hover:bg-white/5 transition-colors">
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <Avatar className={`w-9 h-9 border ${
                            isAdmin ? "border-amber-300" : "border-primary-600/30"
                          }`}>
                            <AvatarFallback className={`text-sm font-bold ${
                              isAdmin ? "bg-gradient-to-br from-amber-500 to-amber-700 text-black" : "bg-primary-600/20 text-primary-600"
                            }`}>
                              {user.name ? user.name[0].toUpperCase() : "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-bold text-white flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {isAdmin && <span title="Master VIP Admin" className="text-xs">👑</span>}
                            </div>
                            <div className="text-xs text-zinc-400 font-mono mt-0.5">{user.email}</div>
                            {user.referralCode && (
                              <Badge variant="outline" className="mt-1 px-2 py-0.5 bg-emerald-950/60 border-emerald-500/30 text-[10px] font-mono text-emerald-300 h-auto">
                                🏷️ Ref: {user.referralCode}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="outline" className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider h-auto ${
                          isAdmin
                            ? "bg-amber-950/60 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.15)]"
                            : "bg-white/5 text-zinc-300 border-white/10"
                        }`}>
                          {isAdmin ? "👑 MASTER ADMIN" : "🛡️ STANDARD USER"}
                        </Badge>
                      </TableCell>

                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="outline" className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 w-fit h-auto ${
                          isPro
                            ? "bg-emerald-950/60 text-primary-400 border-primary-600/40 shadow-[0_0_10px_rgba(33,205,141,0.15)]"
                            : "bg-gray-900/60 text-zinc-400 border-white/10"
                        }`}>
                          <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${isPro ? "bg-primary-400 animate-pulse" : "bg-gray-500"}`}></span>
                          <span className="sr-only">{isPro ? 'Status: Active' : 'Status: Free'}</span>
                          {isPro ? "PRO VIP TIER" : "FREE TIER"}
                        </Badge>
                      </TableCell>

                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Verified
                        </span>
                      </TableCell>

                      <TableCell className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="text-xs font-mono text-zinc-300">
                          {new Date(user.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                          {new Date(user.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>

          {/* Pagination Footer */}
          <div className="px-6 py-4 bg-black/40 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center gap-2 text-zinc-400">
              <span>Showing</span>
              <span className="font-bold text-white">
                {filteredUsers.length === 0 ? 0 : startIndex + 1}
              </span>
              <span>to</span>
              <span className="font-bold text-white">
                {Math.min(startIndex + numericPageSize, filteredUsers.length)}
              </span>
              <span>of</span>
              <span className="font-bold text-primary-600">
                {filteredUsers.length}
              </span>
              <span>users</span>

              <Select value={pageSize} onValueChange={(val) => val && setPageSize(val)}>
                <SelectTrigger className="ml-3 h-7 px-2.5 py-1 rounded bg-zinc-900 border-zinc-700 text-white text-xs font-mono w-[110px]">
                  <SelectValue placeholder="Page Size" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700 text-white text-xs font-mono">
                  <SelectItem value="5">5 per page</SelectItem>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="25">25 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 h-auto rounded bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300 font-bold"
                title="First Page"
              >
                «
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 h-auto rounded bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300 font-bold flex items-center gap-1"
              >
                ‹ Prev
              </Button>

              <Badge variant="outline" className="px-3 py-1.5 h-auto rounded bg-primary-600/10 border-primary-600/30 text-primary-600 font-bold border">
                Page {currentPage} of {totalPages}
              </Badge>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 h-auto rounded bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300 font-bold flex items-center gap-1"
              >
                Next ›
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1.5 h-auto rounded bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300 font-bold"
                title="Last Page"
              >
                »
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
