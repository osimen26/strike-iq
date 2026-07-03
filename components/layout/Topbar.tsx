"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

export default function Topbar() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async (userId: string) => {
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("userId", userId)
      .eq("isRead", false);
    setUnreadCount(count || 0);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        fetchUnreadCount(data.user.id);
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Loading...";

  return (
    <header className="h-16 border-b border-[var(--color-border-glass)] bg-[var(--color-background-surface)]/80 backdrop-blur-md flex items-center justify-between pl-14 pr-4 sm:pr-8 lg:px-8 sticky top-0 z-10">
      <div className="flex-1">
        {/* Search placeholder */}
        <div className="relative w-64 hidden sm:block">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full pl-10 pr-4 py-2 bg-black/50 border border-[var(--color-border-glass)] rounded-lg text-sm text-white focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Notification Bell with live badge */}
        <Link 
          href="/notifications" 
          className="relative p-2 text-gray-400 hover:text-white transition-colors"
          onClick={() => setUnreadCount(0)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>
        
        <div className="h-8 w-px bg-[var(--color-border-glass)] mx-1 sm:mx-2"></div>
        
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="flex flex-col items-end mr-1 hidden sm:flex">
            <span className="text-sm font-medium text-white">{displayName}</span>
            <span className="text-xs text-[var(--color-accent-mutedSage)]">{user?.email || ""}</span>
          </div>
          <Link href="/dashboard/profile" className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-[var(--color-brand-emerald)] to-[var(--color-brand-mint)] flex items-center justify-center text-[var(--color-background-app)] font-bold text-xs hover:scale-105 transition-transform cursor-pointer" title="View Profile & Settings">
            {displayName.charAt(0).toUpperCase()}
          </Link>
          <button 
            onClick={handleLogout}
            className="whitespace-nowrap ml-1 sm:ml-2 text-sm font-medium text-gray-400 hover:text-[var(--color-brand-mint)] transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
