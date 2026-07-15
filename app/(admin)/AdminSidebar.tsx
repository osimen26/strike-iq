"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartBarIcon,
  ZapIcon,
  UsersIcon,
  SettingsIcon,
  ArrowLeftIcon,
} from "@/components/icons/Icons";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      label: "Overview",
      href: "/admin",
      icon: <ChartBarIcon size={18} />,
      isActive: pathname === "/admin",
    },
    {
      label: "Add Pro Prediction",
      href: "/admin/predictions",
      icon: <ZapIcon size={18} />,
      isActive: pathname === "/admin/predictions" || pathname.startsWith("/admin/predictions/"),
    },
    {
      label: "Users",
      href: "/admin/users",
      icon: <UsersIcon size={18} />,
      isActive: pathname === "/admin/users" || pathname.startsWith("/admin/users/"),
    },
  ];

  return (
    <>
      {/* MOBILE TOP HEADER (md:hidden) */}
      <header className="md:hidden h-16 bg-[#0c0c0e] border-b border-zinc-800/80 px-4 flex items-center justify-between sticky top-0 z-40 shrink-0 shadow-md">
        <div className="flex items-center space-x-2 text-[var(--color-brand-emerald)] font-heading text-lg">
          <span className="text-xl text-[var(--color-brand-emerald)]">
            <SettingsIcon size={20} />
          </span>
          <span className="font-bold tracking-tight text-white">
            Strike <span className="text-[var(--color-brand-emerald)]">Admin</span>
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-300 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </header>

      {/* MOBILE BACKDROP & DRAWER (md:hidden) */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="w-72 max-w-[85vw] bg-[#0c0c0e] border-r border-zinc-800 h-full p-6 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800">
              <div className="flex items-center space-x-2 text-[var(--color-brand-emerald)] font-heading text-xl">
                <SettingsIcon size={22} />
                <span className="font-bold tracking-tight text-white">
                  Strike <span className="text-[var(--color-brand-emerald)]">Admin</span>
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <nav className="space-y-2 flex-1 overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                    item.isActive
                      ? "bg-[var(--color-brand-emerald)]/15 text-[var(--color-brand-emerald)] font-bold border border-[var(--color-brand-emerald)]/30 shadow-[0_0_15px_rgba(19,133,97,0.15)]"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent"
                  }`}
                >
                  <span className="shrink-0 flex items-center justify-center">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}

              <div className="pt-6 mt-6 border-t border-zinc-800/80">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:bg-white/5 hover:text-zinc-300 transition-colors font-medium text-sm border border-transparent"
                >
                  <ArrowLeftIcon size={16} />
                  <span>Back to App</span>
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR (hidden md:flex) */}
      <div className="hidden md:flex w-64 border-r border-white/10 bg-[#0c0c0e] p-6 flex-col shrink-0 min-h-screen">
        <div className="flex items-center space-x-2.5 mb-10 text-[var(--color-brand-emerald)] font-heading text-xl">
          <span className="text-2xl text-[var(--color-brand-emerald)]">
            <SettingsIcon size={22} />
          </span>
          <span className="font-bold tracking-tight text-white">
            Strike <span className="text-[var(--color-brand-emerald)]">Admin</span>
          </span>
        </div>

        <nav className="space-y-2 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                item.isActive
                  ? "bg-[var(--color-brand-emerald)]/15 text-[var(--color-brand-emerald)] font-bold border border-[var(--color-brand-emerald)]/30 shadow-[0_0_15px_rgba(19,133,97,0.15)]"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent"
              }`}
            >
              <span className="shrink-0 flex items-center justify-center">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}

          <div className="pt-6 mt-6 border-t border-zinc-800/80">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:bg-white/5 hover:text-zinc-300 transition-colors font-medium text-sm border border-transparent"
            >
              <ArrowLeftIcon size={16} />
              <span>Back to App</span>
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
