/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * STRIKE IQ — Centralized Competition Configuration
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Single source of truth for all competition metadata across the platform.
 *
 * COST CONTROL:
 *   syncEnabled: true  → Cron fetches fixtures from The Odds API (existing cost)
 *   syncEnabled: false → No API calls. Data only via admin-published ProPredictions.
 *
 * To start auto-syncing a new league, set syncEnabled: true and ensure the
 * providerKey is valid for your Odds API subscription tier.
 */

// ─── Types ──────────────────────────────────────────────────────────────────────

export type AccessTier = 'free' | 'pro';
export type CompetitionType = 'league' | 'cup';
export type SportSlug = 'football' | 'basketball';

export interface CompetitionConfig {
  /** Internal stable identifier */
  id: string;
  /** The Odds API sport_key (e.g. "soccer_epl") */
  providerKey: string;
  /** Human-readable display name */
  name: string;
  /** Country or region for grouping */
  country: string;
  /** Sport category */
  sport: SportSlug;
  /** League vs knockout tournament */
  type: CompetitionType;
  /** Free or Pro access tier */
  tier: AccessTier;
  /** Sort priority — lower numbers appear first */
  priority: number;
  /** League logo URL */
  logo: string;
  /** Whether to show in the UI */
  active: boolean;
  /** Whether the cron job should fetch data from The Odds API for this league */
  syncEnabled: boolean;
  /** Available data capabilities */
  capabilities: string[];
}

// ─── Competition Registry ───────────────────────────────────────────────────────

export const COMPETITIONS: CompetitionConfig[] = [
  // ═══════════════════════════════════════════════════════════════════════════════
  // FREE TIER — Existing leagues (syncEnabled: true, zero additional cost)
  // ═══════════════════════════════════════════════════════════════════════════════

  // England
  {
    id: 'comp_epl',
    providerKey: 'soccer_epl',
    name: 'Premier League',
    country: 'England',
    sport: 'football',
    type: 'league',
    tier: 'free',
    priority: 1,
    logo: 'https://media.api-sports.io/football/leagues/39.png',
    active: true,
    syncEnabled: true,
    capabilities: ['odds', 'fixtures', 'h2h'],
  },

  // Spain
  {
    id: 'comp_la_liga',
    providerKey: 'soccer_spain_la_liga',
    name: 'La Liga',
    country: 'Spain',
    sport: 'football',
    type: 'league',
    tier: 'free',
    priority: 2,
    logo: 'https://media.api-sports.io/football/leagues/140.png',
    active: true,
    syncEnabled: true,
    capabilities: ['odds', 'fixtures', 'h2h'],
  },

  // Italy
  {
    id: 'comp_serie_a',
    providerKey: 'soccer_italy_serie_a',
    name: 'Serie A',
    country: 'Italy',
    sport: 'football',
    type: 'league',
    tier: 'free',
    priority: 3,
    logo: 'https://media.api-sports.io/football/leagues/135.png',
    active: true,
    syncEnabled: true,
    capabilities: ['odds', 'fixtures', 'h2h'],
  },

  // Germany
  {
    id: 'comp_bundesliga',
    providerKey: 'soccer_germany_bundesliga',
    name: 'Bundesliga',
    country: 'Germany',
    sport: 'football',
    type: 'league',
    tier: 'free',
    priority: 4,
    logo: 'https://media.api-sports.io/football/leagues/78.png',
    active: true,
    syncEnabled: true,
    capabilities: ['odds', 'fixtures', 'h2h'],
  },

  // France
  {
    id: 'comp_ligue_1',
    providerKey: 'soccer_france_ligue_one',
    name: 'Ligue 1',
    country: 'France',
    sport: 'football',
    type: 'league',
    tier: 'free',
    priority: 5,
    logo: 'https://media.api-sports.io/football/leagues/61.png',
    active: true,
    syncEnabled: true,
    capabilities: ['odds', 'fixtures', 'h2h'],
  },

  // Europe — UEFA
  {
    id: 'comp_ucl',
    providerKey: 'soccer_uefa_champs_league',
    name: 'UEFA Champions League',
    country: 'Europe',
    sport: 'football',
    type: 'cup',
    tier: 'free',
    priority: 6,
    logo: 'https://media.api-sports.io/football/leagues/2.png',
    active: true,
    syncEnabled: true,
    capabilities: ['odds', 'fixtures', 'h2h'],
  },
  {
    id: 'comp_uel',
    providerKey: 'soccer_uefa_europa_league',
    name: 'UEFA Europa League',
    country: 'Europe',
    sport: 'football',
    type: 'cup',
    tier: 'free',
    priority: 7,
    logo: 'https://media.api-sports.io/football/leagues/3.png',
    active: true,
    syncEnabled: true,
    capabilities: ['odds', 'fixtures', 'h2h'],
  },

  // Basketball
  {
    id: 'comp_nba',
    providerKey: 'basketball_nba',
    name: 'NBA',
    country: 'USA',
    sport: 'basketball',
    type: 'league',
    tier: 'free',
    priority: 10,
    logo: 'https://media.api-sports.io/basketball/leagues/12.png',
    active: true,
    syncEnabled: true,
    capabilities: ['odds', 'fixtures', 'h2h'],
  },
  {
    id: 'comp_euroleague',
    providerKey: 'basketball_euroleague',
    name: 'EuroLeague',
    country: 'Europe',
    sport: 'basketball',
    type: 'league',
    tier: 'free',
    priority: 11,
    logo: 'https://media.api-sports.io/basketball/leagues/117.png',
    active: true,
    syncEnabled: true,
    capabilities: ['odds', 'fixtures', 'h2h'],
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // PRO TIER — New leagues (syncEnabled: false = ZERO API COST)
  // Data populated only via admin-published ProPredictions.
  // ═══════════════════════════════════════════════════════════════════════════════

  // England — Second Tier
  {
    id: 'comp_championship',
    providerKey: 'soccer_england_league1',
    name: 'Championship',
    country: 'England',
    sport: 'football',
    type: 'league',
    tier: 'pro',
    priority: 12,
    logo: 'https://media.api-sports.io/football/leagues/40.png',
    active: true,
    syncEnabled: false,
    capabilities: ['odds', 'fixtures'],
  },

  // Spain — Second Tier
  {
    id: 'comp_segunda',
    providerKey: 'soccer_spain_segunda_division',
    name: 'Segunda División',
    country: 'Spain',
    sport: 'football',
    type: 'league',
    tier: 'pro',
    priority: 13,
    logo: 'https://media.api-sports.io/football/leagues/141.png',
    active: true,
    syncEnabled: false,
    capabilities: ['odds', 'fixtures'],
  },

  // Italy — Second Tier
  {
    id: 'comp_serie_b',
    providerKey: 'soccer_italy_serie_b',
    name: 'Serie B',
    country: 'Italy',
    sport: 'football',
    type: 'league',
    tier: 'pro',
    priority: 14,
    logo: 'https://media.api-sports.io/football/leagues/136.png',
    active: true,
    syncEnabled: false,
    capabilities: ['odds', 'fixtures'],
  },

  // Germany — Second Tier
  {
    id: 'comp_bundesliga_2',
    providerKey: 'soccer_germany_bundesliga2',
    name: '2. Bundesliga',
    country: 'Germany',
    sport: 'football',
    type: 'league',
    tier: 'pro',
    priority: 15,
    logo: 'https://media.api-sports.io/football/leagues/79.png',
    active: true,
    syncEnabled: false,
    capabilities: ['odds', 'fixtures'],
  },

  // France — Second Tier
  {
    id: 'comp_ligue_2',
    providerKey: 'soccer_france_ligue_two',
    name: 'Ligue 2',
    country: 'France',
    sport: 'football',
    type: 'league',
    tier: 'pro',
    priority: 16,
    logo: 'https://media.api-sports.io/football/leagues/62.png',
    active: true,
    syncEnabled: false,
    capabilities: ['odds', 'fixtures'],
  },

  // Netherlands
  {
    id: 'comp_eredivisie',
    providerKey: 'soccer_netherlands_eredivisie',
    name: 'Eredivisie',
    country: 'Netherlands',
    sport: 'football',
    type: 'league',
    tier: 'pro',
    priority: 17,
    logo: 'https://media.api-sports.io/football/leagues/71.png',
    active: true,
    syncEnabled: false,
    capabilities: ['odds', 'fixtures'],
  },

  // Portugal
  {
    id: 'comp_primeira_liga',
    providerKey: 'soccer_portugal_primeira_liga',
    name: 'Primeira Liga',
    country: 'Portugal',
    sport: 'football',
    type: 'league',
    tier: 'pro',
    priority: 18,
    logo: 'https://media.api-sports.io/football/leagues/94.png',
    active: true,
    syncEnabled: false,
    capabilities: ['odds', 'fixtures'],
  },

  // Turkey
  {
    id: 'comp_super_lig',
    providerKey: 'soccer_turkey_super_league',
    name: 'Süper Lig',
    country: 'Turkey',
    sport: 'football',
    type: 'league',
    tier: 'pro',
    priority: 19,
    logo: 'https://media.api-sports.io/football/leagues/203.png',
    active: true,
    syncEnabled: false,
    capabilities: ['odds', 'fixtures'],
  },

  // Belgium
  {
    id: 'comp_belgian_pro',
    providerKey: 'soccer_belgium_first_div',
    name: 'Belgian Pro League',
    country: 'Belgium',
    sport: 'football',
    type: 'league',
    tier: 'pro',
    priority: 20,
    logo: 'https://media.api-sports.io/football/leagues/144.png',
    active: true,
    syncEnabled: false,
    capabilities: ['odds', 'fixtures'],
  },

  // Scotland
  {
    id: 'comp_scottish_prem',
    providerKey: 'soccer_spl',
    name: 'Scottish Premiership',
    country: 'Scotland',
    sport: 'football',
    type: 'league',
    tier: 'pro',
    priority: 21,
    logo: 'https://media.api-sports.io/football/leagues/281.png',
    active: true,
    syncEnabled: false,
    capabilities: ['odds', 'fixtures'],
  },

  // Greece
  {
    id: 'comp_super_league_greece',
    providerKey: 'soccer_greece_super_league',
    name: 'Super League Greece',
    country: 'Greece',
    sport: 'football',
    type: 'league',
    tier: 'pro',
    priority: 22,
    logo: 'https://media.api-sports.io/football/leagues/197.png',
    active: true,
    syncEnabled: false,
    capabilities: ['odds', 'fixtures'],
  },

  // USA & Canada
  {
    id: 'comp_mls',
    providerKey: 'soccer_usa_mls',
    name: 'MLS',
    country: 'USA & Canada',
    sport: 'football',
    type: 'league',
    tier: 'pro',
    priority: 23,
    logo: 'https://media.api-sports.io/football/leagues/253.png',
    active: true,
    syncEnabled: false,
    capabilities: ['odds', 'fixtures'],
  },

  // Saudi Arabia
  {
    id: 'comp_saudi_pro',
    providerKey: 'soccer_saudi_professional_league',
    name: 'Saudi Pro League',
    country: 'Saudi Arabia',
    sport: 'football',
    type: 'league',
    tier: 'pro',
    priority: 24,
    logo: 'https://media.api-sports.io/football/leagues/307.png',
    active: true,
    syncEnabled: false,
    capabilities: ['odds', 'fixtures'],
  },

  // Europe — UEFA Conference League
  {
    id: 'comp_uecl',
    providerKey: 'soccer_uefa_europa_conference_league',
    name: 'UEFA Conference League',
    country: 'Europe',
    sport: 'football',
    type: 'cup',
    tier: 'pro',
    priority: 25,
    logo: 'https://media.api-sports.io/football/leagues/848.png',
    active: true,
    syncEnabled: false,
    capabilities: ['odds', 'fixtures'],
  },

  // Asia — AFC Champions League
  {
    id: 'comp_afc_cl',
    providerKey: 'soccer_afc_champions_league',
    name: 'AFC Champions League Elite',
    country: 'Asia',
    sport: 'football',
    type: 'cup',
    tier: 'pro',
    priority: 26,
    logo: 'https://media.api-sports.io/football/leagues/17.png',
    active: true,
    syncEnabled: false,
    capabilities: ['fixtures'],
  },
];

// ─── Utility Functions ──────────────────────────────────────────────────────────

/** Get all active competitions */
export function getActiveCompetitions(): CompetitionConfig[] {
  return COMPETITIONS.filter(c => c.active).sort((a, b) => a.priority - b.priority);
}

/** Get only competitions that should be synced by the cron job */
export function getSyncEnabledCompetitions(): CompetitionConfig[] {
  return COMPETITIONS.filter(c => c.active && c.syncEnabled);
}

/** Get competitions by tier */
export function getCompetitionsByTier(tier: AccessTier): CompetitionConfig[] {
  return getActiveCompetitions().filter(c => c.tier === tier);
}

/** Get competitions grouped by country */
export function getCompetitionsGroupedByCountry(): Record<string, CompetitionConfig[]> {
  const groups: Record<string, CompetitionConfig[]> = {};
  for (const comp of getActiveCompetitions()) {
    if (!groups[comp.country]) {
      groups[comp.country] = [];
    }
    groups[comp.country].push(comp);
  }
  return groups;
}

/** Get football competitions only */
export function getFootballCompetitions(): CompetitionConfig[] {
  return getActiveCompetitions().filter(c => c.sport === 'football');
}

/** Find a competition by provider key */
export function findCompetitionByProviderKey(key: string): CompetitionConfig | undefined {
  return COMPETITIONS.find(c => c.providerKey === key);
}

/** Find a competition by display name */
export function findCompetitionByName(name: string): CompetitionConfig | undefined {
  return COMPETITIONS.find(c => c.name.toLowerCase() === name.toLowerCase());
}

/** Get the country display order for the league selector */
export const COUNTRY_DISPLAY_ORDER: string[] = [
  'England',
  'Spain',
  'Italy',
  'Germany',
  'France',
  'Netherlands',
  'Portugal',
  'Turkey',
  'Belgium',
  'Scotland',
  'Greece',
  'USA & Canada',
  'Saudi Arabia',
  'Europe',
  'Asia',
  'USA',        // Basketball
];
