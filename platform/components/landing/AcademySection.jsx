"use client";
import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import './AcademySection.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

function AcademySection() {
  const sectionRef = useRef(null);
  const bgRef = useRef(null);

  useGSAP(() => {
    // 1. The Parallax Background (Tied to scroll position)
    gsap.fromTo(bgRef.current,
      { 
        y: '-15%', 
        scale: 1.1 
      }, 
      {
        y: '15%', 
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom', 
          end: 'bottom top',   
          scrub: true,         
        }
      }
    );

    // 2. The Content Reveal (Plays independently of scroll speed once triggered)
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%', 
        toggleActions: 'play none none reverse',
      },
      defaults: { ease: 'power3.out', duration: 1 }
    });

    tl.fromTo('.academy-anim',
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.15 }
    );
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="academy-section" id="pro">
      
      {/* Parallax Background Container */}
      <div className="academy-bg-container">
        <div className="academy-bg" ref={bgRef}></div>
        <div className="academy-overlay"></div>
      </div>
      
      <div className="academy-container">
        
        <div className="academy-content">
          <h4 className="academy-kicker academy-anim">
            STRIKEIQ PRO
          </h4>
          
          <h2 className="academy-heading academy-anim">
            The picks the <br /> models trust most.
          </h2>
          
          <button className="academy-btn academy-anim">
            UPGRADE TO PRO
          </button>
        </div>

      </div>
    </section>
  );
}

export default AcademySection;
