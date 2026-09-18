import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { MASTER_ADMIN_EMAIL, MASTER_ADMIN_EMAILS } from "@/lib/security/adminGuard";
import type { Metadata } from "next";
import AdminSidebar from "./AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Prevent static prerendering — admin pages require Supabase client at runtime
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Control Panel",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get("strike_admin_auth");

  if (!adminCookie || adminCookie.value !== "true") {
    redirect("/admin/login");
  }

  // Admin access granted via cookie bypass

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[var(--color-background-app)] text-white font-main">
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex h-16 border-b border-white/10 bg-black/20 items-center px-8 shrink-0">
          <h2 className="text-lg font-semibold text-gray-300">System Control Panel</h2>
        </header>
        <main className="flex-1 p-4 pt-20 sm:p-6 md:p-8 md:pt-8 overflow-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
