"use client";

import React, { useState, useEffect } from "react";
import { useRegionalPricing } from "@/lib/pricing/useRegionalPricing";
import { isBookingSlipItem } from "./MatchCardHelpers";
import { BookingSlipCard } from "./BookingSlipCard";
import { MatchCardVerdict } from "./MatchCardVerdict";

interface MatchCardProps {
  match: any;
  isLocked?: boolean;
  isGuest?: boolean;
  onRequireLogin?: () => void;
}

export function MatchCard({
  match,
  isLocked = false,
  isGuest = false,
  onRequireLogin,
}: MatchCardProps) {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isTeasing, setIsTeasing] = useState(false);
  const { config: regionalConfig } = useRegionalPricing();
  const proPriceText = regionalConfig.plans.pro_monthly.formattedPrice;

  const isBookingSlip = isBookingSlipItem(match);

  // For guests (unauthenticated users), ALL predictions on the dashboard start visible for 300ms (teaser)
  // and then blur out, requiring them to sign in or register to copy code or unlock signals.
  // For logged-in users (!isGuest), freemium items (isFreePick) are unlocked, while Pro picks require a subscription.
  const requiresGuestAuth = Boolean(isGuest);
  const requiresProAuth = Boolean(!isGuest && isLocked && !match.isFreePick);
  const actuallyLocked = requiresGuestAuth || requiresProAuth;

  // 300ms Teaser effect: code starts visible for 300ms, then blurs when timer completes
  useEffect(() => {
    if (actuallyLocked) {
      setIsTeasing(true);
      const timer = setTimeout(() => {
        setIsTeasing(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [actuallyLocked]);

  const isBlurred = actuallyLocked && !isTeasing;

  // League logo helper
  const getLeagueLogo = (league?: string, sport?: string) => {
    if (match.leagueLogo && match.leagueLogo.trim() !== "") {
      return match.leagueLogo;
    }
    const checkStr = `${league || ""} ${sport || ""}`.toLowerCase();
    if (checkStr.includes("premier league") || checkStr.includes("epl")) {
      return "https://media.api-sports.io/football/leagues/39.png";
    }
    if (checkStr.includes("la liga") || checkStr.includes("primera")) {
      return "https://media.api-sports.io/football/leagues/140.png";
    }
    if (checkStr.includes("serie a")) {
      return "https://media.api-sports.io/football/leagues/135.png";
    }
    if (checkStr.includes("bundesliga")) {
      return "https://media.api-sports.io/football/leagues/78.png";
    }
    if (checkStr.includes("champions league") || checkStr.includes("ucl")) {
      return "https://media.api-sports.io/football/leagues/2.png";
    }
    if (checkStr.includes("nba") || checkStr.includes("basketball")) {
      return "https://media.api-sports.io/basketball/leagues/12.png";
    }
    if (checkStr.includes("atp") || checkStr.includes("tennis") || checkStr.includes("wta")) {
      return "https://api.iconify.design/noto:tennis.svg";
    }
    return "https://media.api-sports.io/football/leagues/39.png";
  };

  // Team logo helper
  const getTeamLogo = (teamName?: string) => {
    if (!teamName) return "https://media.api-sports.io/football/teams/33.png";
    if (match.homeTeamLogo && teamName === match.homeTeam && match.homeTeamLogo.trim() !== "") {
      return match.homeTeamLogo;
    }
    if (match.awayTeamLogo && teamName === match.awayTeam && match.awayTeamLogo.trim() !== "") {
      return match.awayTeamLogo;
    }
    const name = teamName.toLowerCase().trim();
    const teamMap: Record<string, number> = {
      "arsenal": 42,
      "manchester united": 33,
      "manchester city": 50,
      "chelsea": 49,
      "liverpool": 40,
      "tottenham": 47,
      "real madrid": 541,
      "barcelona": 529,
      "bayern munich": 157,
      "psg": 85,
      "juventus": 496,
      "inter milan": 505,
      "ac milan": 489,
    };

    for (const [key, id] of Object.entries(teamMap)) {
      if (name.includes(key)) {
        return `https://media.api-sports.io/football/teams/${id}.png`;
      }
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      teamName
    )}&background=121215&color=138561&bold=true`;
  };

  if (isBookingSlip) {
    return (
      <BookingSlipCard
        match={match}
        actuallyLocked={actuallyLocked}
        isTeasing={isTeasing}
        isBlurred={isBlurred}
        requiresGuestAuth={requiresGuestAuth}
        requiresProAuth={requiresProAuth}
        proPriceText={proPriceText}
        onRequireLogin={onRequireLogin}
        showAnalysis={showAnalysis}
        setShowAnalysis={setShowAnalysis}
      />
    );
  }

  return (
    <MatchCardVerdict
      match={match}
      actuallyLocked={actuallyLocked}
      isTeasing={isTeasing}
      isBlurred={isBlurred}
      requiresGuestAuth={requiresGuestAuth}
      requiresProAuth={requiresProAuth}
      proPriceText={proPriceText}
      onRequireLogin={onRequireLogin}
      showAnalysis={showAnalysis}
      setShowAnalysis={setShowAnalysis}
      getLeagueLogo={getLeagueLogo}
      getTeamLogo={getTeamLogo}
    />
  );
}
