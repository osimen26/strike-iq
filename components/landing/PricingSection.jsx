"use client";
import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import './PricingSection.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const plans = [
  {
    id: 1,
    title: "Starter Plan",
    description: "Perfect for beginners taking their first steps into data-driven betting.",
    price: "$0",
    period: "/ TIER",
    features: [
      "ACCESS TO BASIC AI PREDICTIONS",
      "DAILY MATCH CONFIDENCE SCORES",
      "TOP 2 LEAGUES COVERED",
      "7-DAY FREE TRIAL OF PRO MODEL"
    ]
  },
  {
    id: 2,
    title: "Pro Plan",
    description: "For serious bettors who want the ultimate edge over the bookmakers.",
    price: "$15",
    period: "/ MONTH",
    features: [
      "ALL 6 LEAGUES & BASKETBALL",
      "PREMIUM HIGH-CONFIDENCE PICKS",
      "DEEP DATA & MATCH INSIGHTS",
      "PRIORITY ALERTS & LIVE UPDATES"
    ]
  }
];

function PricingSection() {
  const sectionRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 75%',
        toggleActions: 'play none none reverse',
      },
      defaults: { ease: 'power3.out', duration: 0.8 }
    });

    // Fade in Title and Subtitle
    tl.fromTo('.pricing-title-bg',
      { opacity: 0, scale: 0.95 },
      { opacity: 0.2, scale: 1, duration: 1.2 }
    )
    .fromTo('.pricing-subtitle',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1 },
      "-=0.8"
    )
    // Slide up cards
    .fromTo('.pricing-card',
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.2 },
      "-=0.6"
    )
    // Stagger features in
    .fromTo('.pricing-feature',
      { x: -20, opacity: 0 },
      { x: 0, opacity: 1, stagger: 0.1 },
      "-=0.4"
    )
    // Banner container fade in
    .fromTo('.pricing-talk-banner',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6 },
      "-=0.2"
    )
    // Banner inner elements stagger
    .fromTo(['.talk-title', '.talk-desc', '.talk-btn'],
      { y: 15, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.5 },
      "-=0.3"
    );

  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="pricing-section" id="pricing">
      <div className="pricing-container">
        
        {/* Header Area with Watermark */}
        <div className="pricing-header">
          <div className="pricing-title-bg">PRICING</div>
          <h2 className="pricing-subtitle">SIMPLE PLANS FOR EVERY PLAYER</h2>
        </div>

        {/* Cards Grid */}
        <div className="pricing-grid">
          {plans.map((plan) => (
            <div key={plan.id} className="pricing-card">
              <div className="pricing-card-top">
                <div className="pricing-card-header">
                  <h3 className="pricing-card-title">{plan.title}</h3>
                  <p className="pricing-card-desc">{plan.description}</p>
                </div>

                <div className="pricing-price-wrapper">
                  <span className="pricing-price">{plan.price}</span>
                  <span className="pricing-period">{plan.period}</span>
                </div>

                <button className="pricing-btn">
                  <span>CHOOSE THIS PLAN</span>
                  <svg className="pricing-btn-icon" width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor"/>
                  </svg>
                </button>
              </div>

              <div className="pricing-divider"></div>

              <ul className="pricing-features">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="pricing-feature">
                    <svg className="pricing-check-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Talk to Us Banner */}
        <div className="pricing-talk-banner">
          <div className="talk-text">
            <h3 className="talk-title">Serious volume? Meet StrikeIQ Syndicate.</h3>
            <p className="talk-desc">Custom models, priority signals, and group bankroll strategy for syndicates and serious operators.</p>
          </div>
          <button className="talk-btn">TALK TO US</button>
        </div>

      </div>
    </section>
  );
}

export default PricingSection;
