export const TEAM_LOGOS: Record<string, string> = {
  // Premier League
  "Arsenal": "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
  "Manchester City": "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
  "Manchester United": "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg",
  "Chelsea": "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg",
  "Liverpool": "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
  "Tottenham Hotspur": "https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg",
  "Newcastle United": "https://upload.wikimedia.org/wikipedia/en/5/56/Newcastle_United_Logo.svg",
  "Aston Villa": "https://upload.wikimedia.org/wikipedia/en/9/9f/Aston_Villa_logo.svg",
  "Everton": "https://upload.wikimedia.org/wikipedia/en/7/7c/Everton_FC_logo.svg",
  
  // La Liga
  "Real Madrid": "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
  "Barcelona": "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
  "Atletico Madrid": "https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg",

  // NBA
  "Los Angeles Lakers": "https://upload.wikimedia.org/wikipedia/commons/3/3c/Los_Angeles_Lakers_logo.svg",
  "Golden State Warriors": "https://upload.wikimedia.org/wikipedia/en/0/01/Golden_State_Warriors_logo.svg",
  "Boston Celtics": "https://upload.wikimedia.org/wikipedia/en/8/8f/Boston_Celtics.svg",
  "Miami Heat": "https://upload.wikimedia.org/wikipedia/en/d/db/Miami_Heat_logo.svg",
  "Denver Nuggets": "https://upload.wikimedia.org/wikipedia/en/7/76/Denver_Nuggets.svg",
  "New York Knicks": "https://upload.wikimedia.org/wikipedia/en/2/25/New_York_Knicks_logo.svg",
  
  // Internationals
  "Brazil": "https://upload.wikimedia.org/wikipedia/en/0/05/CBF_logo.svg",
  "France": "https://upload.wikimedia.org/wikipedia/en/8/8c/French_Football_Federation_logo.svg",
  "Argentina": "https://upload.wikimedia.org/wikipedia/en/c/c1/Argentina_national_football_team_logo.svg",
  "Germany": "https://upload.wikimedia.org/wikipedia/en/e/e3/DFB_Logo_1995.svg",
};

/**
 * Returns a team logo URL. 
 * If the team is not in our known dictionary, it falls back to a sleek generated initial avatar.
 */
export function getTeamLogo(teamName: string): string {
  // Check direct match
  if (TEAM_LOGOS[teamName]) {
    return TEAM_LOGOS[teamName];
  }
  
  // Check if string includes (e.g. "Manchester City FC" -> "Manchester City")
  const key = Object.keys(TEAM_LOGOS).find(k => teamName.includes(k) || k.includes(teamName));
  if (key) {
    return TEAM_LOGOS[key];
  }

  // Fallback to UI-Avatars with our dark theme colors
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(teamName)}&background=0D1117&color=fff&bold=true&rounded=true`;
}
