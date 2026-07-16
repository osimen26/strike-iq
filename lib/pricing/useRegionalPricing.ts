"use client";

import { useState, useEffect, useCallback } from 'react';
import { REGIONAL_PRICING_CONFIG, getRegionalConfig, RegionalConfig } from './regional';

const STORAGE_KEY = 'strikeiq_region';
const COOKIE_NAME = 'strikeiq_region';

export function useRegionalPricing() {
  const [countryCode, setCountryState] = useState<string>('US');
  const [config, setConfig] = useState<RegionalConfig>(REGIONAL_PRICING_CONFIG.US);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper to persist selection to both localStorage and cookies
  const persistRegion = useCallback((code: string) => {
    const cleanCode = code.toUpperCase().trim();
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, cleanCode);
        document.cookie = `${COOKIE_NAME}=${cleanCode}; path=/; max-age=31536000; SameSite=Lax`;
      }
    } catch (e) {
      console.warn('Could not persist region preference:', e);
    }
  }, []);

  const setCountryCode = useCallback((newCode: string) => {
    const cleanCode = newCode.toUpperCase().trim();
    setCountryState(cleanCode);
    setConfig(getRegionalConfig(cleanCode));
    persistRegion(cleanCode);
  }, [persistRegion]);

  useEffect(() => {
    let isMounted = true;

    async function initializeRegion() {
      // 1. Check local storage first for immediate zero-latency hydration
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && /^[A-Z]{2}$/i.test(stored)) {
          if (isMounted) {
            setCountryState(stored.toUpperCase());
            setConfig(getRegionalConfig(stored.toUpperCase()));
            setIsLoading(false);
          }
          // Sync cookie just in case
          persistRegion(stored.toUpperCase());
          return;
        }
      }

      // 2. Otherwise, fetch automatic detection from server location API
      try {
        const res = await fetch('/api/location');
        if (res.ok) {
          const data = await res.json();
          const detected = data?.countryCode || 'US';
          if (isMounted) {
            setCountryState(detected);
            setConfig(getRegionalConfig(detected));
            setIsLoading(false);
          }
          persistRegion(detected);
          return;
        }
      } catch (err) {
        console.warn('Failed to fetch location API, defaulting to USD:', err);
      }

      // 3. Fallback to USD ('US') if API failed and no stored preference
      if (isMounted) {
        setCountryState('US');
        setConfig(REGIONAL_PRICING_CONFIG.US);
        setIsLoading(false);
      }
    }

    initializeRegion();

    return () => {
      isMounted = false;
    };
  }, [persistRegion]);

  return {
    countryCode,
    config,
    isLoading,
    setCountryCode,
    availableRegions: Object.values(REGIONAL_PRICING_CONFIG)
  };
}
