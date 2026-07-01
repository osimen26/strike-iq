"use client";
import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import './HowItWorksSection.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

function HowItWorksSection() {
  const sectionRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 75%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
      },
      defaults: { ease: 'power3.out' }
    });

    // 1. Header Elements
    tl.fromTo('.step-header-el',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.15 }
    )

    // 2. The Giant Numbers "Stamp" Effect
    .fromTo('.step-number',
      { scale: 1.2, opacity: 0, y: 20 },
      { scale: 1, opacity: 1, y: 0, duration: 1, stagger: 0.2 }, 
      "-=0.4"
    )

    // 3. Step Content (Title, Paragraph, and Dividers) sliding up
    .fromTo('.step-content',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.2 },
      "-=0.8" 
    );
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="hiw-section" id="how-it-works">
      <div className="hiw-container">
        
        {/* Header */}
        <div className="hiw-header">
          <div className="hiw-pill step-header-el">
            <p>HOW IT WORKS</p>
          </div>
          <h2 className="hiw-heading step-header-el">
            Three steps from data to decision.
          </h2>
        </div>

        {/* Steps Grid */}
        <div className="hiw-grid">
          
          {/* Step 1 */}
          <div className="hiw-step">
            <div className="hiw-step-header">
              <div className="hiw-watermark step-number">1</div>
              <h3 className="hiw-step-title step-content">SCAN</h3>
            </div>
            <p className="hiw-step-desc step-content">
              Our models ingest live odds, form tables, and team news across every covered league — refreshed every 4 hours.
            </p>
          </div>

          <div className="hiw-divider step-content">
            <svg xmlns="http://www.w3.org/2000/svg" width="1" height="200" viewBox="0 0 1 200" fill="none" style={{ overflow: 'visible' }}>
              <path d="M0.5 0L0.499991 200" stroke="#2C2F2B" strokeWidth="1px" />
            </svg>
          </div>

          {/* Step 2 */}
          <div className="hiw-step">
            <div className="hiw-step-header">
              <div className="hiw-watermark step-number">2</div>
              <h3 className="hiw-step-title step-content">SCORE</h3>
            </div>
            <p className="hiw-step-desc step-content">
              Each fixture gets a prediction with a confidence rating and the reasoning behind it, so you understand the edge, not just the pick.
            </p>
          </div>

          <div className="hiw-divider step-content">
            <svg xmlns="http://www.w3.org/2000/svg" width="1" height="200" viewBox="0 0 1 200" fill="none" style={{ overflow: 'visible' }}>
              <path d="M0.5 0L0.499991 200" stroke="#2C2F2B" strokeWidth="1px" />
            </svg>
          </div>

          {/* Step 3 */}
          <div className="hiw-step">
            <div className="hiw-step-header">
              <div className="hiw-watermark step-number">3</div>
              <h3 className="hiw-step-title step-content">STRIKE</h3>
            </div>
            <p className="hiw-step-desc step-content">
              You get the day's highest-value picks before kickoff — on web or WhatsApp. Decide faster. Stake smarter.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
