"use client";
import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import './RecordsSection.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

function RecordsSection() {
  const sectionRef = useRef(null);

  // References to the numbers so we can update them in the GSAP ticker
  const num1Ref = useRef(null);
  const num2Ref = useRef(null);
  const num3Ref = useRef(null);
  const num4Ref = useRef(null);

  useGSAP(() => {
    // We create a proxy object that holds the values starting at 0
    const proxy = {
      val1: 0,
      val2: 0,
      val3: 0,
      val4: 0
    };

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 75%',
        toggleActions: 'play none none reverse',
      }
    });

    // Animate Header
    tl.fromTo('.records-header-el',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.15 }
    )
    
    // Animate Stats blocks fading in
    .fromTo('.record-item',
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.1 },
      "-=0.4"
    )
    
    // Animate the numbers counting up
    .to(proxy, {
      val1: 74,
      val2: 12,
      val3: 38,
      val4: 5,
      duration: 1.5,
      ease: 'power3.out',
      onUpdate: () => {
        if (num1Ref.current) num1Ref.current.innerText = Math.round(proxy.val1);
        if (num2Ref.current) num2Ref.current.innerText = Math.round(proxy.val2);
        if (num3Ref.current) num3Ref.current.innerText = Math.round(proxy.val3);
        if (num4Ref.current) num4Ref.current.innerText = Math.round(proxy.val4);
      }
    }, "-=0.6");

  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="records-section" id="accuracy">
      <div className="records-container">
        
        {/* Header Block */}
        <div className="records-header">
          <p className="records-kicker records-header-el">The Record</p>
          <h2 className="records-heading records-header-el">Numbers that tell the story.</h2>
        </div>

        {/* Stats Grid */}
        <div className="records-grid">
          
          <div className="record-item">
            <div className="record-number-wrapper">
              <span ref={num1Ref} className="record-number">0</span>
              <span className="record-suffix suffix-large">%</span>
            </div>
            <p className="record-subtitle">Hit rate on high-confidence picks last season</p>
          </div>

          <div className="record-item">
            <div className="record-number-wrapper">
              <span ref={num2Ref} className="record-number">0</span>
              <span className="record-suffix suffix-small">K+</span>
            </div>
            <p className="record-subtitle">Matches analyzed across 6 leagues</p>
          </div>

          <div className="record-item">
            <div className="record-number-wrapper">
              <span ref={num3Ref} className="record-number">0</span>
            </div>
            <p className="record-subtitle">Data points scored per fixture</p>
          </div>

          <div className="record-item">
            <div className="record-number-wrapper">
              <span ref={num4Ref} className="record-number">0</span>
              <span className="record-suffix suffix-small">K+</span>
            </div>
            <p className="record-subtitle">Bettors using the terminal weekly</p>
          </div>

        </div>

      </div>
    </section>
  );
}

export default RecordsSection;
