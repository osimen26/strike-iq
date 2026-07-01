"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Predictions Feed", href: "/dashboard", icon: "🎯" },
  { name: "Leagues", href: "/dashboard/leagues", icon: "⚽" },
  { name: "My Profile", href: "/dashboard/profile", icon: "👤" },
  { name: "Subscription", href: "/dashboard/subscription", icon: "⭐" },
  { name: "Settings", href: "/dashboard/settings", icon: "⚙️" },
]; // Cache buster for hydration error

import { useState, useEffect } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-3 left-4 z-50 p-2 bg-[var(--color-background-surface)] rounded-md border border-[var(--color-border-glass)] text-white hover:bg-white/10 transition-colors"
        aria-label="Open menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed top-0 left-0 h-screen w-64 bg-[var(--color-background-surface)] border-r border-[var(--color-border-glass)] flex flex-col z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[var(--color-brand-emerald)] rounded-lg"></div>
            <span className="text-xl font-heading text-white tracking-wide">Strike IQ</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? "bg-[var(--color-brand-actionGreen)] text-white shadow-md"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[var(--color-border-glass)]">
          <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--color-brand-emerald)]/20 to-transparent border border-[var(--color-brand-emerald)]/30">
            <p className="text-sm font-semibold text-white mb-1 flex items-center">Upgrade Pro <span className="ml-1">👑</span></p>
            <p className="text-[10px] text-[var(--color-brand-mint)] mb-3 leading-tight">Get AI explanations and confidence scores.</p>
            <Link href="/dashboard/subscription" className="block text-center text-xs font-bold bg-[var(--color-brand-emerald)] text-white py-2 rounded-lg hover:bg-[var(--color-brand-actionGreenHover)] shadow-lg transition-colors">
              Upgrade Now
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
