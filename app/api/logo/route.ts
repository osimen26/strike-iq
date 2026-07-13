import { NextRequest, NextResponse } from "next/server";
import { COUNTRY_FLAGS, TEAM_LOGOS } from "@/lib/logos";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from "@/lib/security/rateLimit";

export const dynamic = "force-dynamic";

/**
 * GET /api/logo?team=TeamName
 * Dynamically resolves and redirects to the official badge/logo for ANY sports team globally.
 * Checks static dictionaries first, then queries TheSportsDB API, with intelligent fallback.
 */
export async function GET(req: NextRequest) {
  // Rate limit: 100 logo requests per minute per IP
  const ip = getClientIp(req);
  const rl = checkRateLimit(`logo:${ip}`, RATE_LIMITS.PUBLIC);
  if (!rl.success) return rateLimitResponse(rl);

  const { searchParams } = new URL(req.url);
  const rawTeam = searchParams.get("team");

  if (!rawTeam) {
    return NextResponse.redirect("https://ui-avatars.com/api/?name=Team&background=138561&color=fff&bold=true");
  }

  const cleaned = rawTeam.trim();
  const lower = cleaned.toLowerCase();

  // 1. Check exact country flags
  if (COUNTRY_FLAGS[cleaned]) {
    return redirectWithCache(COUNTRY_FLAGS[cleaned]);
  }

  // 2. Check exact club logos
  if (TEAM_LOGOS[cleaned]) {
    return redirectWithCache(TEAM_LOGOS[cleaned]);
  }

  // 3. Substring / keyword check against local dictionary
  for (const [key, url] of Object.entries(TEAM_LOGOS)) {
    if (lower === key.toLowerCase() || lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return redirectWithCache(url);
    }
  }

  try {
    // 4. Query TheSportsDB free global team search API
    const badgeUrl = await searchTheSportsDB(cleaned);
    if (badgeUrl) {
      return redirectWithCache(badgeUrl);
    }

    // 5. Try searching stripped team name (remove FC, IF, BK, BC, SC, CF, United)
    const stripped = cleaned.replace(/\b(FC|IF|BK|BC|SC|CF|United|City|Town|Albion|Wanderers)\b/gi, "").trim();
    if (stripped && stripped !== cleaned && stripped.length > 2) {
      const strippedBadge = await searchTheSportsDB(stripped);
      if (strippedBadge) {
        return redirectWithCache(strippedBadge);
      }
    }
  } catch (err) {
    console.error("[API_LOGO] Error searching TheSportsDB:", err);
  }

  // 6. Sleek fallback
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(cleaned)}&background=138561&color=fff&bold=true&rounded=true&size=128`;
  return redirectWithCache(fallbackUrl);
}

async function searchTheSportsDB(teamName: string): Promise<string | null> {
  const url = `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(teamName)}`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return null;

  const data = await res.json();
  if (data && Array.isArray(data.teams) && data.teams.length > 0) {
    // Return first valid strBadge
    for (const t of data.teams) {
      if (t && t.strBadge) {
        return t.strBadge;
      }
    }
  }
  return null;
}

const ALLOWED_LOGO_DOMAINS = [
  "espncdn.com",
  "a.espncdn.com",
  "thesportsdb.com",
  "www.thesportsdb.com",
  "ui-avatars.com",
  "upload.wikimedia.org",
  "logos-world.net",
  "ssl.gstatic.com",
];

function isAllowedDomain(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return ALLOWED_LOGO_DOMAINS.some((d) => hostname === d || hostname.endsWith("." + d));
  } catch {
    return false;
  }
}

function redirectWithCache(url: string) {
  const safeUrl = isAllowedDomain(url)
    ? url
    : `https://ui-avatars.com/api/?name=Team&background=138561&color=fff&bold=true&rounded=true&size=128`;

  return NextResponse.redirect(safeUrl, {
    status: 302,
    headers: {
      "Cache-Control": "public, max-age=86400, s-maxage=604800",
    },
  });
}

