"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ZapIcon,
  ChartBarIcon,
  TrophyIcon,
  UserIcon,
  CrownIcon,
  SettingsIcon,
} from "@/components/icons/Icons";

const navigation = [
  { name: "Predictions Feed", href: "/dashboard", icon: <ZapIcon size={18} /> },
  { name: "AI Performance", href: "/dashboard/analytics", icon: <ChartBarIcon size={18} /> },
  { name: "Leagues", href: "/dashboard/leagues", icon: <TrophyIcon size={18} /> },
  { name: "My Profile", href: "/dashboard/profile", icon: <UserIcon size={18} /> },
  { name: "Subscription", href: "/dashboard/subscription", icon: <CrownIcon size={18} /> },
  { name: "Settings", href: "/dashboard/settings", icon: <SettingsIcon size={18} /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(false), 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-3 left-4 z-50 p-2 bg-[#09090b] rounded-md border border-zinc-800 text-white hover:bg-zinc-800 transition-colors"
        aria-label="Open menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/80 z-40 transition-opacity" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed top-0 left-0 h-screen w-64 bg-[#000000] border-r border-zinc-800/80 flex flex-col z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between border-b border-zinc-900">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#138561] rounded-md flex items-center justify-center font-bold text-white shadow-sm">
              <ZapIcon size={18} className="text-white" />
            </div>
            <span className="text-xl font-heading text-white tracking-wider uppercase font-bold">Strike<span className="text-[#138561]">IQ</span></span>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-zinc-400 hover:text-white">
            ✕
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1.5 mt-4 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all font-mono text-sm ${
                  isActive
                    ? "bg-[#138561]/15 text-[#00FF88] border border-[#138561]/50 font-bold shadow-[0_0_15px_rgba(0,255,136,0.15)]"
                    : "text-zinc-400 hover:bg-[#09090b] hover:text-white"
                }`}
              >
                <span className="shrink-0 flex items-center justify-center">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-900">
          <div className="p-4 rounded-xl bg-[#09090b] border border-zinc-800/80 shadow-md">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#138561]">Pro Tier</span>
              <span className="text-[#138561]"><CrownIcon size={16} /></span>
            </div>
            <p className="text-[11px] text-zinc-400 mb-3 leading-relaxed font-sans">Unlock real-time AI rationales and high-confidence predictions.</p>
            <Link href="/dashboard/subscription" className="block text-center text-xs font-mono font-bold bg-[#138561] text-white py-2.5 rounded-lg hover:bg-[#0f6b4d] transition-colors uppercase tracking-wider shadow-[0_0_15px_rgba(19,133,97,0.3)]">
              Upgrade Pro
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
