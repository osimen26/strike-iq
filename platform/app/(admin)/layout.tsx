import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { MASTER_ADMIN_EMAIL, MASTER_ADMIN_EMAILS } from "@/lib/security/adminGuard";
import type { Metadata } from "next";
import AdminSidebar from "./AdminSidebar";

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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get("strike_admin_auth");

  if (!user || !adminCookie || adminCookie.value !== "true") {
    redirect("/admin/login");
  }

  if (!user.email || !MASTER_ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    return (
      <div className="min-h-screen bg-[var(--color-background-app)] flex flex-col items-center justify-center p-4">
        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl max-w-md text-center">
          <div className="text-5xl mb-4">🛑</div>
          <h1 className="text-2xl font-bold text-white mb-2 font-heading">Access Denied</h1>
          <p className="text-gray-400 mb-6 text-sm">
            You do not have the required security clearance to view this page. If you believe this is an error, please contact the system administrator.
          </p>
          <Link href="/dashboard" className="px-6 py-2.5 bg-[var(--color-brand-emerald)] hover:bg-[var(--color-brand-actionGreen)] text-white font-bold rounded-lg transition-colors inline-block">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Admin access granted for MASTER_ADMIN_EMAIL

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[var(--color-background-app)] text-white font-main">
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex h-16 border-b border-white/10 bg-black/20 items-center px-8 shrink-0">
          <h2 className="text-lg font-semibold text-gray-300">System Control Panel</h2>
        </header>
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
