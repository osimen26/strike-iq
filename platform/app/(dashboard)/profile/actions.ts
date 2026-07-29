"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { UAParser } from "ua-parser-js";

export type SessionInfo = {
  id: string;
  os: string;
  browser: string;
  deviceType: "desktop" | "mobile" | "tablet" | "unknown";
  ip: string;
  lastActive: string;
  isCurrent: boolean;
};

// Helper for relative time without date-fns
function getRelativeTimeString(date: Date): string {
  const timeMs = date.getTime();
  const deltaSeconds = Math.round((timeMs - Date.now()) / 1000);
  const cutoffs = [60, 3600, 86400, 86400 * 7, 86400 * 30, 86400 * 365, Infinity];
  const units: Intl.RelativeTimeFormatUnit[] = ["second", "minute", "hour", "day", "week", "month", "year"];
  
  const unitIndex = cutoffs.findIndex(cutoff => cutoff > Math.abs(deltaSeconds));
  const divisor = unitIndex ? cutoffs[unitIndex - 1] : 1;
  
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  return rtf.format(Math.round(deltaSeconds / divisor), units[unitIndex]);
}

export async function getActiveSessions(): Promise<{ success: boolean; sessions?: SessionInfo[]; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // Get current session to identify "Current Device"
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    
    let currentSessionId: string | null = null;
    if (currentSession?.access_token) {
      try {
        const payload = JSON.parse(Buffer.from(currentSession.access_token.split('.')[1], 'base64').toString());
        currentSessionId = payload.session_id || null;
      } catch (e) {}
    }

    // Query auth.sessions schema using Prisma raw query
    const dbSessions = await prisma.$queryRawUnsafe<any[]>(
      'SELECT id, created_at, updated_at, ip, user_agent FROM auth.sessions WHERE user_id = $1::uuid ORDER BY updated_at DESC',
      user.id
    );

    const parsedSessions: SessionInfo[] = dbSessions.map((s) => {
      const parser = new UAParser(s.user_agent || "");
      const os = parser.getOS();
      const browser = parser.getBrowser();
      const device = parser.getDevice();

      let deviceType: SessionInfo["deviceType"] = "desktop";
      if (device.type === "mobile") deviceType = "mobile";
      else if (device.type === "tablet") deviceType = "tablet";
      else if (os.name === "iOS" || os.name === "Android") deviceType = "mobile"; // Fallback

      const osName = os.name ? `${os.name} ${os.version || ""}`.trim() : "Unknown OS";
      const browserName = browser.name ? `${browser.name}` : "Unknown Browser";

      return {
        id: s.id,
        os: osName,
        browser: browserName,
        deviceType,
        ip: s.ip || "Unknown IP",
        lastActive: getRelativeTimeString(new Date(s.updated_at)),
        isCurrent: currentSessionId === s.id,
      };
    });

    return { success: true, sessions: parsedSessions };
  } catch (error: any) {
    console.error("Failed to fetch sessions:", error);
    return { success: false, error: "Failed to fetch active sessions." };
  }
}
