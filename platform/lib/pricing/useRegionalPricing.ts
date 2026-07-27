"use client";

import { useState, useEffect, useCallback } from 'react';
import { REGIONAL_PRICING_CONFIG, getRegionalConfig, RegionalConfig } from './regional';

const STORAGE_KEY = 'strikeiq_region';
const COOKIE_NAME = 'strikeiq_region';

export function useRegionalPricing() {
  const [countryCode, setCountryState] = useState<string>('NG');
  const [config, setConfig] = useState<RegionalConfig>(REGIONAL_PRICING_CONFIG.NG);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

    // Helper to detect country from browser timezone when offline / localhost
    const getCountryFromTimezone = (): string => {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        if (tz.includes('Lagos') || tz.includes('Nigeria')) return 'NG';
        if (tz.includes('Accra') || tz.includes('Ghana')) return 'GH';
        if (tz.includes('Johannesburg') || tz.includes('South_Africa')) return 'ZA';
        if (tz.includes('Nairobi') || tz.includes('Kenya')) return 'KE';
        if (tz.includes('Cairo') || tz.includes('Egypt')) return 'EG';
        if (tz.includes('Europe/London')) return 'GB';
      } catch {
        // Optional catch binding
      }
      return 'NG'; // Nigeria-Only focus default
    };

    async function initializeRegion() {
      // 1. Check local storage first for instant zero-latency hydration
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && /^[A-Z]{2}$/i.test(stored)) {
          if (isMounted) {
            setCountryState(stored.toUpperCase());
            setConfig(getRegionalConfig(stored.toUpperCase()));
            setIsLoading(false);
          }
        }
      }

      // 2. Always fetch automatic detection from server location API to ensure live accuracy
      try {
        const tz = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone || '' : '';
        const res = await fetch('/api/location', {
          headers: { 'x-timezone': tz }
        });
        if (res.ok) {
          const data = await res.json();
          let detected = data?.countryCode || 'US';
          if (data?.source === 'default_fallback' || detected === 'US') {
            const tzCountry = getCountryFromTimezone();
            if (tzCountry !== 'US') {
              detected = tzCountry;
            }
          }
          if (isMounted) {
            setCountryState(detected);
            setConfig(getRegionalConfig(detected));
            setIsLoading(false);
          }
          persistRegion(detected);
          return;
        }
      } catch (err) {
        console.warn('Failed to fetch location API, trying timezone:', err);
      }

      // 3. Fallback to browser timezone or USD ('US')
      if (isMounted) {
        const fallbackCountry = getCountryFromTimezone();
        setCountryState(fallbackCountry);
        setConfig(getRegionalConfig(fallbackCountry));
        setIsLoading(false);
        persistRegion(fallbackCountry);
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
