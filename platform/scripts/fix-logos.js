const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const logoMap = {
  'soccer_epl': 'https://media.api-sports.io/football/leagues/39.png',
  'soccer_spain_la_liga': 'https://media.api-sports.io/football/leagues/140.png',
  'soccer_italy_serie_a': 'https://media.api-sports.io/football/leagues/135.png',
  'soccer_germany_bundesliga': 'https://media.api-sports.io/football/leagues/78.png',
  'soccer_france_ligue_one': 'https://media.api-sports.io/football/leagues/61.png',
  'soccer_uefa_champs_league': 'https://media.api-sports.io/football/leagues/2.png',
  'soccer_uefa_europa_league': 'https://media.api-sports.io/football/leagues/3.png',
  'basketball_nba': 'https://media.api-sports.io/basketball/leagues/12.png',
  'basketball_euroleague': 'https://media.api-sports.io/basketball/leagues/117.png',
  'soccer_england_league1': 'https://media.api-sports.io/football/leagues/40.png',
  'soccer_spain_segunda_division': 'https://media.api-sports.io/football/leagues/141.png',
  'soccer_italy_serie_b': 'https://media.api-sports.io/football/leagues/136.png',
  'soccer_germany_bundesliga2': 'https://media.api-sports.io/football/leagues/79.png',
  'soccer_france_ligue_two': 'https://media.api-sports.io/football/leagues/62.png',
  'soccer_netherlands_eredivisie': 'https://media.api-sports.io/football/leagues/71.png',
  'soccer_portugal_primeira_liga': 'https://media.api-sports.io/football/leagues/94.png',
  'soccer_turkey_super_league': 'https://media.api-sports.io/football/leagues/203.png',
  'soccer_belgium_first_div': 'https://media.api-sports.io/football/leagues/144.png',
  'soccer_spl': 'https://media.api-sports.io/football/leagues/281.png',
  'soccer_greece_super_league': 'https://media.api-sports.io/football/leagues/197.png',
  'soccer_usa_mls': 'https://media.api-sports.io/football/leagues/253.png',
  'soccer_saudi_professional_league': 'https://media.api-sports.io/football/leagues/307.png',
  'soccer_uefa_europa_conference_league': 'https://media.api-sports.io/football/leagues/848.png',
  'soccer_afc_champions_league': 'https://media.api-sports.io/football/leagues/17.png'
};

require('dotenv').config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateSupabase() {
  for (const [providerKey, logo] of Object.entries(logoMap)) {
    const { data, error } = await supabase
      .from('league') // Postgres table name
      .update({ logo })
      .eq('providerKey', providerKey);
    if (error) {
      console.error(`Error updating ${providerKey}:`, error.message);
    } else {
      console.log(`Updated Supabase: ${providerKey}`);
    }
  }
}

updateSupabase();
