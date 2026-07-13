"use client";

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
    <div className="w-64 border-r border-white/10 bg-[#0c0c0e] p-6 flex flex-col shrink-0">
      <div className="flex items-center space-x-2.5 mb-10 text-[var(--color-brand-emerald)] font-heading text-xl">
        <span className="text-2xl text-[var(--color-brand-emerald)]">
          <SettingsIcon size={22} />
        </span>
        <span className="font-bold tracking-tight text-white">
          Strike <span className="text-[var(--color-brand-emerald)]">Admin</span>
        </span>
      </div>

      <nav className="space-y-2 flex-1">
        {navItems.map((item) => {
          return (
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
          );
        })}

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
  );
}
