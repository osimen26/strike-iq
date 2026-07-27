"use client";

import React, { useState, useEffect } from "react";
import { useRegionalPricing } from "@/lib/pricing/useRegionalPricing";
import { isBookingSlipItem } from "./MatchCardHelpers";
import { BookingSlipCard } from "./BookingSlipCard";
import { MatchCardVerdict } from "./MatchCardVerdict";
import { getTeamLogo as globalGetTeamLogo, getLeagueLogo as globalGetLeagueLogo } from "@/lib/logos";
import { MatchItem } from "@/types";

interface MatchCardProps {
  match: MatchItem;
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
    return globalGetLeagueLogo(league || match.league || match.competition || "", sport || match.sport || "football");
  };

  // Team logo helper
  const getTeamLogo = (teamName?: string) => {
    if (!teamName) return globalGetTeamLogo("Team");
    if (match.homeTeamLogo && teamName === match.homeTeam && match.homeTeamLogo.trim() !== "") {
      return match.homeTeamLogo;
    }
    if (match.awayTeamLogo && teamName === match.awayTeam && match.awayTeamLogo.trim() !== "") {
      return match.awayTeamLogo;
    }
    return globalGetTeamLogo(teamName);
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
