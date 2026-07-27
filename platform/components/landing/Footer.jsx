"use client";
import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import './Footer.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

function Footer() {
  const footerRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: footerRef.current,
        start: 'top 90%', // Triggers just as the top of the footer enters the viewport
        toggleActions: 'play none none reverse',
      },
      defaults: { ease: 'power2.out' }
    });

    // 1. Staggered reveal for the navigation pills
    tl.fromTo('.footer-pill',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 }
    )
    
    // 2. Soft fade for the disclaimer and bottom credits
    .fromTo('.footer-fade',
      { opacity: 0 },
      { opacity: 1, duration: 0.8 },
      "-=0.2" // Slight overlap so the text fades in while the last pill settles
    );

  }, { scope: footerRef });

  return (
    <footer ref={footerRef} className="footer-section">
      <div className="footer-texture"></div>
      
      <div className="footer-container">
        
        {/* Navigation */}
        <nav className="footer-nav">
          {['ABOUT US', 'HOW IT WORKS', 'ACCURACY', 'PRICING'].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase().replace(/ /g, '-')}`}
              className="footer-pill"
            >
              {item}
            </a>
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
  );
}

export default Footer;
