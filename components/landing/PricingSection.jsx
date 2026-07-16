"use client";
import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useRegionalPricing } from '@/lib/pricing/useRegionalPricing';
import { ZapIcon, CheckCircleIcon } from '@/components/icons/Icons';
import './PricingSection.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

function PricingSection() {
  const sectionRef = useRef(null);
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const { config } = useRegionalPricing();

  const plans = [
    {
      id: 1,
      title: "Starter Plan",
      description: "Perfect for beginners taking their first steps into data-driven betting.",
      monthlyPrice: config.plans.free.formattedPrice,
      yearlyPrice: config.plans.free.formattedPrice,
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
      monthlyPrice: config.plans.pro_monthly.formattedPrice,
      yearlyPrice: billingCycle === 'yearly' ? config.plans.pro_yearly.formattedPrice : config.plans.pro_monthly.formattedPrice,
      period: billingCycle === 'monthly' ? config.plans.pro_monthly.periodLabel : config.plans.pro_yearly.periodLabel,
      subprice: billingCycle === 'yearly' ? config.plans.pro_yearly.subpriceLabel : undefined,
      features: [
        "ALL 6 LEAGUES & BASKETBALL",
        "PREMIUM HIGH-CONFIDENCE PICKS",
        "DEEP DATA & MATCH INSIGHTS",
        "PRIORITY ALERTS & LIVE UPDATES"
      ]
    }
  ];

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
    // Fade in Toggle
    .fromTo('.pricing-toggle-wrapper',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1 },
      "-=0.6"
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, gap: '16px' }}>
            <div className="flex items-center justify-center">
              <h2 className="pricing-subtitle !mb-0">SIMPLE PLANS FOR EVERY PLAYER</h2>
            </div>
            
            <div className="pricing-toggle-wrapper">
              <span className={`toggle-label ${billingCycle === 'monthly' ? 'active' : ''}`}>Monthly</span>
              <div className="toggle-switch" onClick={() => setBillingCycle(b => b === 'monthly' ? 'yearly' : 'monthly')}>
                <div className={`toggle-knob ${billingCycle}`}></div>
              </div>
              <span className={`toggle-label ${billingCycle === 'yearly' ? 'active' : ''}`}>
                Yearly
              </span>
            </div>
          </div>
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
                  <span className="pricing-price">
                    {billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                  </span>
                  <span className="pricing-period">{plan.period}</span>
                </div>
                
                <p className="pricing-subprice" style={{ 
                  color: 'var(--color-mint)', 
                  opacity: (billingCycle === 'yearly' && plan.subprice) ? 0.6 : 0, 
                  fontSize: '14px', 
                  marginTop: '-10px', 
                  marginBottom: '15px',
                  transition: 'opacity 0.3s ease',
                  userSelect: 'none'
                }}>
                  {plan.subprice || 'Spacer'}
                </p>

                <button 
                  onClick={() => router.push(plan.id === 1 ? '/register' : '/subscription')}
                  className="pricing-btn"
                >
                  <span>CHOOSE THIS PLAN</span>
                  <ZapIcon size={16} className="pricing-btn-icon text-amber-400" />
                </button>
              </div>

              <div className="pricing-divider"></div>

              <ul className="pricing-features">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="pricing-feature">
                    <CheckCircleIcon size={18} className="pricing-check-icon text-emerald-400 shrink-0" />
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
          <button onClick={() => window.location.href = 'mailto:syndicate@strikeiq.ai'} className="talk-btn">TALK TO US</button>
        </div>

      </div>
    </section>
  );
}

export default PricingSection;
