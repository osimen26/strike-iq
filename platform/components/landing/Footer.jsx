"use client";
import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import LegalModal from './LegalModal';
import './Footer.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

function Footer() {
  const footerRef = useRef(null);
  const [legalModalState, setLegalModalState] = useState({ isOpen: false, type: 'terms' });

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: footerRef.current,
        start: 'top 90%', 
        toggleActions: 'play none none reverse',
      },
      defaults: { ease: 'power2.out' }
    });

    tl.fromTo('.footer-pill',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 }
    )
    .fromTo('.footer-fade',
      { opacity: 0 },
      { opacity: 1, duration: 0.8 },
      "-=0.2"
    );

  }, { scope: footerRef });

  const openLegalModal = (type) => {
    setLegalModalState({ isOpen: true, type });
  };

  return (
    <>
      <footer ref={footerRef} className="footer-section">
        <div className="footer-texture"></div>
        
        <div className="footer-container">
          
          {/* Navigation */}
          <nav className="footer-nav">
            {['ABOUT US', 'HOW IT WORKS', 'ACCURACY', 'PRICING'].map((item) => (
              <a 
                key={item} 
                href={`/#${item.toLowerCase().replace(/ /g, '-')}`}
                className="footer-pill"
              >
                {item}
              </a>
            ))}
          </nav>
          
          {/* Legal Links (Modal Triggers) */}
          <nav className="footer-nav" style={{ marginTop: '1rem', opacity: 0.7 }}>
            {[
              { name: 'TERMS & CONDITIONS', type: 'terms' },
              { name: 'PRIVACY POLICY', type: 'privacy' },
              { name: 'COOKIE POLICY', type: 'cookies' }
            ].map((item) => (
              <button 
                key={item.name} 
                onClick={() => openLegalModal(item.type)}
                className="footer-pill"
                style={{ fontSize: '10px', background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                {item.name}
              </button>
            ))}
          </nav>
          
          {/* Disclaimer */}
          <div className="footer-disclaimer footer-fade">
            <p>18+ only. Bet responsibly. StrikeIQ provides analysis and data intelligence, not guarantees of profit —<br />never stake more than you can afford to lose.</p>
          </div>
          
          {/* Bottom Bar */}
          <div className="footer-bottom-bar footer-fade">
            <p>© 2026 StrikeIQ. Designed & shipped by osimen.</p>
            <p>Designed by Osimen</p>
          </div>

        </div>
      </footer>

      {/* The Legal Modal Overlay */}
      <LegalModal 
        isOpen={legalModalState.isOpen} 
        type={legalModalState.type} 
        onClose={() => setLegalModalState(prev => ({ ...prev, isOpen: false }))} 
      />
    </>
  );
}

export default Footer;
