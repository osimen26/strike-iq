"use client";
import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Link from 'next/link';
import './CTASection.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

function CTASection() {
  const sectionRef = useRef(null);

  useGSAP(() => {
    // 1. Subtle Background Breathing (Tied to scroll)
    gsap.fromTo('.cta-bg-img',
      { scale: 1 },
      {
        scale: 1.05,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom', // Starts when the top of the section enters the bottom of the screen
          end: 'bottom top',   // Ends when the user scrolls past it entirely
          scrub: true,
        }
      }
    );

    // 2. The Text & Button Sequence
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 75%',
        toggleActions: 'play none none reverse',
      },
      defaults: { ease: 'power4.out', duration: 1.2 }
    });

    tl.fromTo('.cta-kicker',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8 }
    )
    
    // The Mask Reveal for the giant headline
    .fromTo('.headline-mask span',
      { y: '100%' },
      { y: '0%', stagger: 0.15 },
      "-=0.6" // Start while the overline is still fading in
    )
    
    // The tactile button pop
    .fromTo('.cta-button',
      { y: 20, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.5)' },
      "-=0.9" // Snap in tightly with the headline
    );

  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="cta-section">
      {/* Background Layer */}
      <div className="cta-bg absolute inset-0 z-0">
        <img 
          src="/index.png"
          alt="Football Pitch Background"
          className="cta-bg-img"
        />
        <div className="cta-texture"></div>
        {/* Figma specs usually include gradients for blending */}
        <div className="cta-overlay-top"></div>
        <div className="cta-overlay-bottom"></div>
      </div>
      
      {/* Content Container */}
      <div className="cta-container">
        <div className="cta-content">
          <p className="cta-kicker">DATA OVER GUT. EVERY STAKE, REASONED.</p>
          
          <h1 className="cta-title">
            <div className="headline-mask">
              <span>STOP GUESSING.</span>
            </div>
            <div className="headline-mask">
              <span>START STRIKING.</span>
            </div>
          </h1>
          
          <div className="cta-button-wrapper mt-4">
            <a href="/login" className="cta-button inline-block text-center">
              ACCESS PRO PREDICTIONS NOW
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
