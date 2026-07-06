import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { MASTER_ADMIN_EMAIL } from "@/lib/security/adminGuard";

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

  if (user.email !== MASTER_ADMIN_EMAIL) {
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
    <div className="flex min-h-screen bg-[var(--color-background-app)] text-white font-main">
      {/* Admin Sidebar */}
      <div className="w-64 border-r border-white/10 bg-black/40 p-6 flex flex-col shrink-0">
        <div className="flex items-center space-x-2 mb-10 text-[var(--color-brand-emerald)] font-heading text-xl">
          <span>⚙️</span>
          <span className="font-bold tracking-tight">Strike Admin</span>
        </div>
        <nav className="space-y-3 flex-1">
          <Link href="/admin" className="block px-4 py-2.5 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors font-medium">
            Overview
          </Link>
          <Link href="/admin/predictions" className="block px-4 py-2.5 rounded-lg bg-[var(--color-brand-emerald)]/10 text-[var(--color-brand-emerald)] font-bold border border-[var(--color-brand-emerald)]/20 transition-all">
            Add Pro Prediction
          </Link>
          <Link href="/admin/users" className="block px-4 py-2.5 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors font-medium">
            Users
          </Link>
          <Link href="/dashboard" className="block px-4 py-2.5 mt-8 rounded-lg text-gray-500 hover:bg-white/5 hover:text-white transition-colors font-medium">
            ← Back to App
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-white/10 bg-black/20 flex items-center px-8 shrink-0">
          <h2 className="text-lg font-semibold text-gray-300">System Control Panel</h2>
        </header>
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
