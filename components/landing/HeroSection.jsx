"use client";
import React, { useState, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import './HeroSection.css';
import PredictionWidget from './PredictionWidget';

gsap.registerPlugin(useGSAP);

function HeroSection() {
  const heroRef = useRef(null);
  const [isHeroReady, setIsHeroReady] = useState(false);

  const imgRef = useRef(null);

  React.useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setIsHeroReady(true);
    }
  }, []);

  useGSAP(() => {
    if (!isHeroReady) return;

    const tl = gsap.timeline({ 
      defaults: { ease: 'power3.out', duration: 1 } 
    });

    // 1. Fade and scale the background image
    tl.fromTo('.hero-bg-img', 
      { scale: 1.05, opacity: 0 }, 
      { scale: 1, opacity: 1, duration: 2, ease: 'power2.out' }
    )
    // 2. Stagger the headline words sliding up
    .fromTo('.headline-line span', 
      { y: '100%' }, 
      { y: '0%', stagger: 0.15, duration: 1.2, ease: 'expo.out' }, 
      "-=1.2"
    )
    // 3. Fade up the subtitle
    .fromTo('.hero-subtitle',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1 },
      "-=0.8"
    )
    // 4. Stagger the CTA buttons
    .fromTo('.hero-cta-group a',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.8 },
      "-=0.8"
    )
    // 5. Slide in the prediction widget
    .fromTo('.prediction-widget',
      { x: 50, opacity: 0 },
      { x: 0, opacity: 1, duration: 1, ease: 'power3.out' },
      "-=0.6"
    );

  }, { 
    scope: heroRef, 
    dependencies: [isHeroReady] 
  });

  return (
    <section ref={heroRef} id="hero" aria-label="Hero Section" className="hero-section">
      {/* Background Image Container */}
      <div className="hero-bg absolute inset-0 z-0">
        <img 
          ref={imgRef}
          src="/banner-section.png"
          alt="Strike IQ AI Football and Basketball Betting Intelligence Dashboard"
          className="hero-bg-img"
          onLoad={() => setIsHeroReady(true)} 
        />
        <div className="hero-texture"></div>
        <div className="hero-overlay"></div>
      </div>
      
      <div className="hero-container">
        <div className="hero-content">
          {/* Headline wrapped for GSAP stagger */}
          <h1 className="hero-title">
            <div className="headline-line"><span>BET WITH</span></div>
            <div className="headline-line"><span>INTELLIGENCE,</span></div>
            <div className="headline-line"><span>NOT INSTINCT.</span></div>
          </h1>
          <p className="hero-subtitle">
            StrikeIQ analyzes thousands of quantitative data points across every game to deliver predictions you can trust — covering Europe's Top 5 Football Leagues (Premier League, La Liga, Serie A, Bundesliga, Ligue 1), UEFA Champions League (UCL), and NBA, all powered by AI.
          </p>
          <div className="hero-cta-group">
            <a href="/login" className="cta-primary text-center inline-block">GET FREE PREDICTION</a>
            <a href="#how-it-works" className="cta-secondary text-center inline-block">SEE HOW IT WORKS</a>
          </div>
        </div>
        
        <PredictionWidget />
      </div>
    </section>
  );
}

export default HeroSection;
