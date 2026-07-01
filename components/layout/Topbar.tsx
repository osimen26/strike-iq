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

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
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
        <div className="relative w-64">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full pl-10 pr-4 py-2 bg-black/50 border border-[var(--color-border-glass)] rounded-lg text-sm text-white focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors hidden sm:block"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Link href="/dashboard/notifications" className="relative p-2 text-gray-400 hover:text-white transition-colors">
          🔔
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Link>
        
        <div className="h-8 w-px bg-[var(--color-border-glass)] mx-2"></div>
        
        <div className="flex items-center space-x-3">
          <div className="flex flex-col items-end mr-1 hidden sm:flex">
            <span className="text-sm font-medium text-white">{displayName}</span>
            <span className="text-xs text-[var(--color-accent-mutedSage)]">{user?.email || ""}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[var(--color-brand-emerald)] to-[var(--color-brand-mint)] flex items-center justify-center text-[var(--color-background-app)] font-bold text-xs">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <button 
            onClick={handleLogout}
            className="ml-2 text-sm font-medium text-gray-400 hover:text-[var(--color-brand-mint)] transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
