export interface MatchOutcome {
  name: string;
  price: number;
}

export interface MatchMarket {
  key: string;
  last_update?: string;
  outcomes?: MatchOutcome[];
}

export interface MatchBookmaker {
  key: string;
  title: string;
  last_update?: string;
  markets?: MatchMarket[];
}

export interface OddsApiFixture {
  id: string;
  sport_key?: string;
  sport_title?: string;
  commence_time?: string;
  home_team?: string;
  away_team?: string;
  bookmakers?: MatchBookmaker[];
}

export interface MatchItem {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  sport: string;
  date: string;
  time: string;
  prediction?: string;
  confidence?: number;
  analysis?: string;
  status?: string;
  tags?: string[];
  bookingCode?: string | null;
  bookmaker?: string | null;
  isProPick?: boolean;
  isFreePick?: boolean;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  leagueLogo?: string;
  createdAt?: string | Date;
  link?: string;
  title?: string;
  dateLabel?: string;
  competition?: string;
}

export interface UserSummaryRow {
  id: string;
  email: string;
  fullName?: string | null;
  role?: string;
  isPro?: boolean;
  proPlan?: string | null;
  status?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
