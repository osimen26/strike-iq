/**
 * Scalable Regional Pricing Configuration for Strike IQ
 * 
 * Centralized configuration mapping ISO country codes to localized pricing tiers.
 * Easily scalable: to add a new country or pricing tier, simply insert an entry
 * into REGIONAL_PRICING_CONFIG below.
 */

export interface PlanPricingTier {
  price: number;
  formattedPrice: string;
  interval: 'MONTHLY' | 'YEARLY';
  periodLabel: string;
  subpriceLabel?: string;
  savingsBadge?: string;
}

export interface RegionalConfig {
  countryCode: string;
  countryName: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  plans: {
    free: PlanPricingTier;
    pro_monthly: PlanPricingTier;
    pro_yearly: PlanPricingTier;
  };
}

export const REGIONAL_PRICING_CONFIG: Record<string, RegionalConfig> = {
  // Nigeria (₦5,000/month as required)
  NG: {
    countryCode: 'NG',
    countryName: 'Nigeria',
    flag: '🇳🇬',
    currency: 'NGN',
    currencySymbol: '₦',
    plans: {
      free: {
        price: 0,
        formattedPrice: '₦0',
        interval: 'MONTHLY',
        periodLabel: '/ TIER'
      },
      pro_monthly: {
        price: 3000,
        formattedPrice: '₦3,000',
        interval: 'MONTHLY',
        periodLabel: '/ MONTH',
        subpriceLabel: 'Billed annually (₦30,000/yr)'
      },
      pro_yearly: {
        price: 30000,
        formattedPrice: '₦30,000',
        interval: 'YEARLY',
        periodLabel: '/ YEAR',
        subpriceLabel: '₦2,500 / month effective rate'
      }
    }
  },

  // Default / International USD ($9.99/month as required)
  US: {
    countryCode: 'US',
    countryName: 'International (USD)',
    flag: '🌐',
    currency: 'USD',
    currencySymbol: '$',
    plans: {
      free: {
        price: 0,
        formattedPrice: '$0',
        interval: 'MONTHLY',
        periodLabel: '/ TIER'
      },
      pro_monthly: {
        price: 9.99,
        formattedPrice: '$9.99',
        interval: 'MONTHLY',
        periodLabel: '/ MONTH',
        subpriceLabel: 'Billed annually ($119.88/yr)'
      },
      pro_yearly: {
        price: 119.88,
        formattedPrice: '$119.88',
        interval: 'YEARLY',
        periodLabel: '/ YEAR',
        subpriceLabel: '$9.99 / month effective rate'
      }
    }
  },

  // Kenya (Example scalable tier - KES)
  // Kenya (KSh 650/month as required)
  KE: {
    countryCode: 'KE',
    countryName: 'Kenya',
    flag: '🇰🇪',
    currency: 'KES',
    currencySymbol: 'KSh ',
    plans: {
      free: {
        price: 0,
        formattedPrice: 'KSh 0',
        interval: 'MONTHLY',
        periodLabel: '/ TIER'
      },
      pro_monthly: {
        price: 650,
        formattedPrice: 'KSh 650',
        interval: 'MONTHLY',
        periodLabel: '/ MONTH',
        subpriceLabel: 'Billed annually (KSh 7,800/yr)'
      },
      pro_yearly: {
        price: 7800,
        formattedPrice: 'KSh 7,800',
        interval: 'YEARLY',
        periodLabel: '/ YEAR',
        subpriceLabel: 'KSh 650 / month effective rate'
      }
    }
  },

  // Ghana (50 cedis/month as required)
  GH: {
    countryCode: 'GH',
    countryName: 'Ghana',
    flag: '🇬🇭',
    currency: 'GHS',
    currencySymbol: 'GH₵ ',
    plans: {
      free: {
        price: 0,
        formattedPrice: 'GH₵ 0',
        interval: 'MONTHLY',
        periodLabel: '/ TIER'
      },
      pro_monthly: {
        price: 50,
        formattedPrice: 'GH₵ 50',
        interval: 'MONTHLY',
        periodLabel: '/ MONTH',
        subpriceLabel: 'Billed annually (GH₵ 600/yr)'
      },
      pro_yearly: {
        price: 600,
        formattedPrice: 'GH₵ 600',
        interval: 'YEARLY',
        periodLabel: '/ YEAR',
        subpriceLabel: 'GH₵ 50 / month effective rate'
      }
    }
  },

  // South Africa (R 90/month as required)
  ZA: {
    countryCode: 'ZA',
    countryName: 'South Africa',
    flag: '🇿🇦',
    currency: 'ZAR',
    currencySymbol: 'R ',
    plans: {
      free: {
        price: 0,
        formattedPrice: 'R 0',
        interval: 'MONTHLY',
        periodLabel: '/ TIER'
      },
      pro_monthly: {
        price: 90,
        formattedPrice: 'R 90',
        interval: 'MONTHLY',
        periodLabel: '/ MONTH',
        subpriceLabel: 'Billed annually (R 1,080/yr)'
      },
      pro_yearly: {
        price: 1080,
        formattedPrice: 'R 1,080',
        interval: 'YEARLY',
        periodLabel: '/ YEAR',
        subpriceLabel: 'R 90 / month effective rate'
      }
    }
  },

  // Pan-Africa / Rest of Africa ($4.99/month as required)
  AF: {
    countryCode: 'AF',
    countryName: 'Pan-Africa (USD)',
    flag: '🌍',
    currency: 'USD',
    currencySymbol: '$',
    plans: {
      free: {
        price: 0,
        formattedPrice: '$0',
        interval: 'MONTHLY',
        periodLabel: '/ TIER'
      },
      pro_monthly: {
        price: 4.99,
        formattedPrice: '$4.99',
        interval: 'MONTHLY',
        periodLabel: '/ MONTH',
        subpriceLabel: 'Billed annually ($59.88/yr)'
      },
      pro_yearly: {
        price: 59.88,
        formattedPrice: '$59.88',
        interval: 'YEARLY',
        periodLabel: '/ YEAR',
        subpriceLabel: '$4.99 / month effective rate'
      }
    }
  }
};

const AFRICAN_COUNTRY_CODES = new Set([
  'DZ', 'AO', 'BJ', 'BW', 'BF', 'BI', 'CV', 'CM', 'CF', 'TD', 'KM', 'CG', 'CD', 'CI', 'DJ', 'EG', 'GQ',
  'ER', 'SZ', 'ET', 'GA', 'GM', 'GN', 'GW', 'LS', 'LR', 'LY', 'MG', 'MW', 'ML', 'MR', 'MU', 'MA',
  'MZ', 'NA', 'NE', 'RW', 'ST', 'SN', 'SC', 'SL', 'SO', 'SS', 'SD', 'TZ', 'TG', 'TN', 'UG', 'EH', 'ZM', 'ZW'
]);

/**
 * Get the regional pricing configuration for a specific ISO country code.
 * Routes to the correct pricing tier based on ISO 3166-1 alpha-2 country code.
 * Falls back to Pan-Africa pricing for unlisted African countries, and USD for all others.
 */
export function getRegionalConfig(countryCode?: string | null): RegionalConfig {
  if (!countryCode) return REGIONAL_PRICING_CONFIG.NG; // Default to Nigeria if no country detected
  const upper = countryCode.toUpperCase();
  if (REGIONAL_PRICING_CONFIG[upper]) return REGIONAL_PRICING_CONFIG[upper]; // Exact match (NG, KE, GH, ZA)
  if (AFRICAN_COUNTRY_CODES.has(upper)) return REGIONAL_PRICING_CONFIG.AF;  // Rest of Africa → Pan-Africa USD
  return REGIONAL_PRICING_CONFIG.US; // All other countries → International USD
}

/**
 * Resolve exact pricing for a database plan based on plan name/interval and target country code.
 */
export function getLocalizedPlanPrice(
  planName: string = '',
  interval: string = 'MONTHLY',
  countryCode?: string | null
): { price: number; currency: string; formattedPrice: string; savingsBadge?: string } {
  const config = getRegionalConfig(countryCode);
  const nameUpper = planName.toUpperCase();
  const intervalUpper = interval.toUpperCase();

  if (nameUpper.includes('FREE') || planName.trim() === 'Free') {
    return {
      price: config.plans.free.price,
      currency: config.currency,
      formattedPrice: config.plans.free.formattedPrice
    };
  }

  if (intervalUpper === 'YEARLY' || nameUpper.includes('YEARLY') || nameUpper.includes('ANNUAL')) {
    return {
      price: config.plans.pro_yearly.price,
      currency: config.currency,
      formattedPrice: config.plans.pro_yearly.formattedPrice,
      savingsBadge: config.plans.pro_yearly.savingsBadge
    };
  }

  // Default to pro_monthly
  return {
    price: config.plans.pro_monthly.price,
    currency: config.currency,
    formattedPrice: config.plans.pro_monthly.formattedPrice,
    savingsBadge: undefined
  };
}
