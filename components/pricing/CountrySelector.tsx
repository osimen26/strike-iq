"use client";

import React, { useState, useRef, useEffect } from 'react';
import { RegionalConfig, REGIONAL_PRICING_CONFIG, getRegionalConfig } from '@/lib/pricing/regional';

interface CountrySelectorProps {
  currentCountryCode: string;
  onSelectCountry: (countryCode: string) => void;
  availableRegions?: RegionalConfig[];
  className?: string;
}

export default function CountrySelector({
  currentCountryCode,
  onSelectCountry,
  availableRegions = Object.values(REGIONAL_PRICING_CONFIG),
  className = ''
}: CountrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeConfig = getRegionalConfig(currentCountryCode);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#121215] hover:bg-[#1a1a1f] border border-zinc-800 text-xs font-mono font-medium text-zinc-300 hover:text-white transition-all focus:outline-none focus:border-zinc-700"
        title="Select your country / currency preference"
      >
        <span className="text-base">{activeConfig.flag}</span>
        <span className="font-bold">{activeConfig.countryName}</span>
        <span className="text-zinc-500">({activeConfig.currencySymbol} {activeConfig.currency})</span>
        <svg
          className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 sm:left-0 mt-2 w-64 rounded-xl bg-[#09090b] border border-zinc-800 p-1.5 shadow-2xl z-50 animate-fadeIn">
          <div className="px-2.5 py-1.5 border-b border-zinc-800/80 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              Select Regional Pricing
            </span>
          </div>
          <div className="max-h-60 overflow-y-auto space-y-0.5">
            {availableRegions.map((region) => {
              const isSelected = region.countryCode === activeConfig.countryCode;
              return (
                <button
                  key={region.countryCode}
                  type="button"
                  onClick={() => {
                    onSelectCountry(region.countryCode);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition-colors ${
                    isSelected
                      ? 'bg-[#138561]/20 text-emerald-400 font-bold border border-[#138561]/40'
                      : 'text-zinc-300 hover:bg-[#121215] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{region.flag}</span>
                    <div className="flex flex-col items-start">
                      <span>{region.countryName}</span>
                      <span className="text-[10px] text-zinc-500 font-normal">
                        {region.plans.pro_monthly.formattedPrice} / mo
                      </span>
                    </div>
                  </div>
                  <span className="text-zinc-400 text-[11px] font-semibold">
                    {region.currency} ({region.currencySymbol})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
