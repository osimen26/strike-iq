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

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Strategist";

  return (
    <header className="h-16 border-b border-zinc-800/80 bg-[#000000] flex items-center justify-between pl-14 pr-4 sm:pr-8 lg:px-8 sticky top-0 z-10">
      <div className="flex-1">
        {/* Search placeholder */}
        <div className="relative w-64 hidden sm:block">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-mono">SEARCH://</span>
          <input 
            type="text" 
            placeholder="Fixtures, leagues, odds..." 
            className="w-full pl-20 pr-4 py-1.5 bg-[#09090b] border border-zinc-800 rounded-md text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-[#138561] transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Notification Bell with live badge */}
        <Link 
          href="/dashboard/notifications" 
          className="relative p-2 text-zinc-400 hover:text-[#138561] transition-colors"
          onClick={() => setUnreadCount(0)}
          title="Notifications"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 bg-[#138561] rounded-full flex items-center justify-center text-[9px] font-mono font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>
        
        <div className="h-6 w-px bg-zinc-800 mx-1 sm:mx-2"></div>
        
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="flex flex-col items-end mr-1 hidden sm:flex">
            <span className="text-xs font-mono font-bold text-white tracking-wide">{displayName}</span>
            <span className="text-[10px] font-mono text-zinc-500 uppercase">{user?.email || "ONLINE"}</span>
          </div>
          <Link href="/dashboard/profile" className="shrink-0 w-8 h-8 rounded-md bg-[#121215] border border-zinc-700 flex items-center justify-center text-[#138561] font-mono font-bold text-xs hover:border-[#138561] transition-all cursor-pointer" title="View Profile">
            {displayName.charAt(0).toUpperCase()}
          </Link>
          <button 
            onClick={handleLogout}
            className="whitespace-nowrap ml-1 sm:ml-2 px-2.5 py-1 rounded border border-zinc-800 bg-[#09090b] text-xs font-mono text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
          >
            LOGOUT
          </button>
        </div>
      </div>
    </header>
  );
}
