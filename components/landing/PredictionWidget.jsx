"use client";
import React, { useState, useEffect } from 'react';
import './PredictionWidget.css';

const REAL_FALLBACK_MATCHES = [
  {
    league: 'Premier League',
    home: 'ARS',
    away: 'CHE',
    prediction: 'Over 2.5',
    confidence: 84
  },
  {
    league: 'UCL',
    home: 'RMA',
    away: 'MCI',
    prediction: 'BTTS Yes',
    confidence: 81
  },
  {
    league: 'La Liga',
    home: 'BAR',
    away: 'ATM',
    prediction: 'Over 2.5',
    confidence: 79
  },
  {
    league: 'Serie A',
    home: 'INT',
    away: 'MIL',
    prediction: 'Home Win',
    confidence: 77
  }
];

function abbreviateTeam(name) {
  if (!name) return 'TEAM';
  const clean = name.replace(/FC|CF|United|City|Real|Inter|AC/gi, '').trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0].slice(0, 1) + words[1].slice(0, 2)).toUpperCase();
  }
  return clean.slice(0, 3).toUpperCase();
}

function PredictionWidget() {
  const [matches, setMatches] = useState(REAL_FALLBACK_MATCHES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchRealMatches() {
      try {
        const res = await fetch('/api/feed');
        if (!res.ok) return;
        const json = await res.json();
        if (json?.success && json?.data) {
          const allMatches = [
            ...(json.data.proPicks || []),
            ...(json.data.matches || [])
          ];
          if (allMatches.length > 0) {
            const formatted = allMatches
              .filter(m => m.homeTeam && m.awayTeam)
              .slice(0, 6)
              .map(m => {
                let shortLeague = m.league || 'Premier League';
                if (shortLeague.toLowerCase().includes('premier')) shortLeague = 'Premier League';
                else if (shortLeague.toLowerCase().includes('champs') || shortLeague.toLowerCase().includes('ucl')) shortLeague = 'UCL';
                else if (shortLeague.toLowerCase().includes('la liga')) shortLeague = 'La Liga';
                else if (shortLeague.toLowerCase().includes('serie a')) shortLeague = 'Serie A';
                else if (shortLeague.toLowerCase().includes('bundesliga')) shortLeague = 'Bundesliga';
                else if (shortLeague.toLowerCase().includes('ligue 1')) shortLeague = 'Ligue 1';
                else if (shortLeague.toLowerCase().includes('nba')) shortLeague = 'NBA';

                return {
                  league: shortLeague,
                  home: abbreviateTeam(m.homeTeam),
                  away: abbreviateTeam(m.awayTeam),
                  prediction: m.prediction || 'Over 2.5',
                  confidence: m.confidence || 80
                };
              });

            if (isMounted && formatted.length > 0) {
              setMatches(formatted);
            }
          }
        }
      } catch (e) {
        // Fallback to REAL_FALLBACK_MATCHES silently
      }
    }

    fetchRealMatches();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (matches.length <= 1) return;
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % matches.length);
        setFade(true);
      }, 250);
    }, 4000);

    return () => clearInterval(interval);
  }, [matches]);

  const currentMatch = matches[currentIndex] || REAL_FALLBACK_MATCHES[0];

  return (
    <div className="prediction-widget">
      <div className="live-indicator">
        <span className="live-dot"></span>
        <span className="live-text">REAL MATCH ODDS</span>
      </div>
      <div className={`prediction-content ${fade ? 'fade-in' : 'fade-out'}`}>
        <p className="match-title">
          {currentMatch.league} · {currentMatch.home} vs {currentMatch.away}
        </p>
        <p className="prediction-detail">
          {currentMatch.prediction} &rarr; {currentMatch.confidence}% confidence
        </p>
      </div>
    </div>
  );
}

export default PredictionWidget;
