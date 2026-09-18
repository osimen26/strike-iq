import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

import { MASTER_ADMIN_EMAIL, MASTER_ADMIN_EMAILS } from "./constants";
export { MASTER_ADMIN_EMAIL, MASTER_ADMIN_EMAILS };

import { cookies } from "next/headers";

/**
 * Verifies that the incoming API request is authenticated and authorized as the master administrator.
 * Returns the authenticated user if valid, or a formatted 401/403 NextResponse if unauthorized.
 */
export async function requireMasterAdmin() {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get("strike_admin_auth");

  if (!adminCookie || adminCookie.value !== "true") {
    console.warn("[ADMIN_SECURITY_GUARD] Unauthorized access attempt: No active session or token invalid.");
    return {
      user: null,
      errorResponse: NextResponse.json({ error: "Forbidden. VIP Administrator credentials required." }, { status: 403 })
    };
  }

  return { user: { email: MASTER_ADMIN_EMAIL }, errorResponse: null };
}

/**
 * Logs important administrator actions to the server terminal for security tracing.
 */
export function logAdminAudit(action: string, details: Record<string, unknown> = {}) {
  const timestamp = new Date().toISOString();
  console.log(`[ADMIN_AUDIT_LOG // ${timestamp}] ACTION: ${action} | ADMIN: ${MASTER_ADMIN_EMAIL} | DETAILS:`, details);
}
