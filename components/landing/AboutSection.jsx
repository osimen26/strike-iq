"use client";
import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import './AboutSection.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

function AboutSection() {
  const sectionRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 75%',
        end: 'bottom 25%',
        toggleActions: 'play none none reverse',
      },
      defaults: { ease: 'power3.out' }
    });

    // 1. Header Elements
    tl.fromTo('.about-header-element',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.15 }
    )
    // 2. The Four Feature Cards Stagger
    .fromTo('.feature-card',
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 },
      "-=0.4"
    )
    // 3. Grid Heatmap illuminating (Random stagger)
    .fromTo('.heatmap-cell',
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.4, stagger: { each: 0.02, from: "random" } },
      "-=0.6"
    )
    // 4. Donut Chart Drawing
    .fromTo('.donut-fill',
      { strokeDashoffset: 251.2 },
      { strokeDashoffset: 55.26, duration: 1.5, ease: 'power2.out' },
      "-=0.5"
    )
    // 5. Bankroll Dots popping in
    .fromTo('.bankroll-point',
      { scale: 0 },
      { scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.7)' },
      "-=1.2"
    );
  }, { scope: sectionRef });

  const heatmapData = [
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 2, 2, 1, 0, 0],
    [0, 0, 2, 2, 2, 2, 0, 0],
    [0, 0, 0, 2, 2, 0, 0, 0]
  ];

  return (
    <section ref={sectionRef} className="about-section" id="about-us">
      <div className="about-container">
        
        {/* Header Area */}
        <div className="about-header">
          <div className="about-pill about-header-element">
            <p>ABOUT STRIKEIQ AI</p>
          </div>
          <p className="about-eyebrow about-header-element">Data over gut feeling. Every time.</p>
          <h2 className="about-heading about-header-element">
            Most bettors lose not because they're unlucky — they lose because they decide emotionally. StrikeIQ gives you the edge that comes from cold, structured analysis.
          </h2>
        </div>

        {/* Features Grid */}
        <div className="about-grid">
          
          {/* Card 1: AI Match Analysis */}
          <div className="feature-card">
            <div className="feature-text">
              <h3>AI Match Analysis</h3>
              <p>Every prediction backed by form, head-to-head, injuries, and momentum data — not gut feeling.</p>
            </div>
            <div className="feature-graphic graphic-network">
              <img src="/assets/network-graph.svg" alt="Network graph showing data connections" />
            </div>
          </div>

          {/* Card 2: Confidence Scores */}
          <div className="feature-card">
            <div className="feature-text">
              <h3>Confidence Scores</h3>
              <p>Know how strong each tip is before you stake. Every pick ships with a transparent confidence rating.</p>
            </div>
            <div className="feature-graphic graphic-donut">
              <div className="donut-wrapper">
                <svg viewBox="0 0 100 100" className="donut-svg">
                  <circle cx="50" cy="50" r="40" className="donut-bg" />
                  <circle cx="50" cy="50" r="40" className="donut-fill" />
                </svg>
                <div className="donut-text">78%</div>
              </div>
            </div>
          </div>

          {/* Card 3: Local League Depth */}
          <div className="feature-card">
            <div className="feature-text">
              <h3>Local League Depth</h3>
              <p>NPFL coverage no global tipster touches, alongside EPL, La Liga, and UCL.</p>
            </div>
            <div className="feature-graphic graphic-heatmap">
              <div className="heatmap-grid">
                {heatmapData.map((row, rowIndex) => (
                  <div key={rowIndex} className="heatmap-row">
                    {row.map((val, colIndex) => {
                      let cellClass = "heatmap-cell";
                      if (val === 1) cellClass += " cell-mid";
                      if (val === 2) cellClass += " cell-bright";
                      return <div key={`${rowIndex}-${colIndex}`} className={cellClass}></div>;
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 4: Bankroll Discipline */}
          <div className="feature-card">
            <div className="feature-text">
              <h3>Bankroll Discipline</h3>
              <p>Stake suggestions sized to your bankroll, so one bad day never ends your season.</p>
            </div>
            <div className="feature-graphic graphic-bankroll">
              <div className="bankroll-wrapper">
                <img src="/assets/bankroll-gradient.svg" alt="" className="bankroll-gradient" />
                <img src="/assets/bankroll-line.svg" alt="" className="bankroll-line" />
                
                {/* Points on the line */}
                <div className="bankroll-point point-1"></div>
                <div className="bankroll-point point-2"></div>
                <div className="bankroll-point point-3"></div>
                <div className="bankroll-point point-4"></div>
                <div className="bankroll-point point-5"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default AboutSection;
