/**
 * Pure utility helper functions for MatchCard analysis, detection, and formatting.
 * Separated from components/dashboard/MatchCard.tsx to adhere to ContentSplit code organisation and <600 lines limits.
 */

/**
 * Determine whether a match/prediction object represents an Accumulator Slip or Booking Code,
 * rather than a standard head-to-head (VS) match.
 */
export function isBookingSlipItem(match: any): boolean {
  if (!match) return false;
  return (
    Boolean(match.bookingCode) ||
    Boolean(match.isFreePick) ||
    Boolean(match.league?.toUpperCase().includes("FREE")) ||
    Boolean(match.league?.toUpperCase().includes("TEASER")) ||
    Boolean(match.awayTeam?.toUpperCase().includes("CODE")) ||
    Boolean(match.homeTeam?.toLowerCase().includes("odd")) ||
    Boolean(match.prediction?.toUpperCase().includes("CODE")) ||
    Boolean(
      match.tags?.some(
        (t: any) =>
          typeof t === "string" &&
          (t.toUpperCase().includes("BOOKING") ||
            t.toUpperCase().includes("TEASER") ||
            t.toUpperCase().includes("SLIP") ||
            t.toUpperCase().includes("FREE"))
      )
    )
  );
}

/**
 * Extract platform name (e.g. SportyBet, 1xBet, Bet9ja, etc.) from bookmaker field or match strings.
 */
export function getBettingPlatformName(match: any): string {
  if (!match) return "SportyBet / Betting Platform";
  if (match.bookmaker && typeof match.bookmaker === "string" && match.bookmaker.trim() !== "") {
    return match.bookmaker;
  }
  const checkStr = `${match.awayTeam || ""} ${match.prediction || ""} ${
    Array.isArray(match.tags) ? match.tags.join(" ") : ""
  }`.toLowerCase();
  
  if (checkStr.includes("sportybet") || checkStr.includes("sporty")) return "SportyBet";
  if (checkStr.includes("1xbet")) return "1xBet";
  if (checkStr.includes("bet9ja")) return "Bet9ja";
  if (checkStr.includes("betking")) return "BetKing";
  if (checkStr.includes("msport")) return "MSport";
  if (checkStr.includes("pari") || checkStr.includes("parimatch")) return "Parimatch";
  return "SportyBet / Betting Platform";
}

/**
 * Extract clean alphanumeric booking code string from match properties.
 */
export function getCleanBookingCodeString(match: any): string {
  if (!match) return "CHECK ANALYSIS FOR CODE";
  if (match.bookingCode && typeof match.bookingCode === "string" && match.bookingCode.trim() !== "") {
    return match.bookingCode;
  }
  const checkStr = `${match.awayTeam || ""} ${match.prediction || ""}`;
  const matchFound = checkStr.match(/CODE:\s*([A-Za-z0-9]+)/i);
  if (matchFound && matchFound[1]) {
    return matchFound[1].toUpperCase();
  }
  if (match.awayTeam && typeof match.awayTeam === "string" && !match.awayTeam.includes(" ")) {
    return match.awayTeam.toUpperCase();
  }
  if (match.prediction && typeof match.prediction === "string" && !match.prediction.includes(" ")) {
    return match.prediction.toUpperCase();
  }
  return "CHECK ANALYSIS FOR CODE";
}

/**
 * Get border/glow color based on prediction confidence score.
 */
export function getConfidenceGlowColor(confidence: number = 0): string {
  if (confidence >= 85) return "#138561";
  if (confidence >= 75) return "#108960";
  return "#52525b";
}
