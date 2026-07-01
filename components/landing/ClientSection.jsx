"use client";
import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import './ClientSection.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const testimonials = [
  {
    id: 1,
    name: "Tunde K., Lagos",
    metadata: "PRO · 3 months",
    quote: `"The confidence scores changed how I stake. I stopped chasing and started selecting."`
  },
  {
    id: 2,
    name: "Jonah Elvis., UK",
    metadata: "PRO · 8 months",
    quote: `"StrikeIQ's AI predictions helped me secure a consistent win rate. Finally, a real edge over the bookies."`
  },
  {
    id: 3,
    name: "Leon M., Munich",
    metadata: "PRO · 2 months",
    quote: `"I used to rely on gut feeling, but the data points they provide for top European leagues are unmatched."`
  },
  {
    id: 4,
    name: "Thomas Dupont., Ghent",
    metadata: "PRO · 4 months",
    quote: `"The Premier League analysis is incredibly deep. It’s exactly like having a team of analysts in your pocket."`
  },
  {
    id: 5,
    name: "Arthur Lambert., USA",
    metadata: "PRO · 8 months",
    quote: `"Basketball predictions can be tricky, but StrikeIQ's model consistently finds value where others completely miss it."`
  },
  {
    id: 6,
    name: "Samuel O., Abuja",
    metadata: "PRO · 5 months",
    quote: `"I've completely eliminated emotional betting. If the StrikeIQ AI model doesn't back it, I simply don't stake it."`
  }
];

function ClientSection() {
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

    // Animate Header
    tl.fromTo('.client-header-el',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.15 }
    )
    
    // Animate Grid Cards
    .fromTo('.client-card',
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1 },
      "-=0.4"
    );
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="client-section" id="clients">
      <div className="client-container">
        
        {/* Header Block */}
        <div className="client-header">
          <p className="client-kicker client-header-el">From the Client</p>
          <h2 className="client-heading client-header-el">Bettors who stopped guessing.</h2>
        </div>

        {/* Testimonials Grid */}
        <div className="client-grid">
          {testimonials.map((t) => (
            <div key={t.id} className="client-card">
              <div className="client-card-top">
                <h3 className="client-name">{t.name}</h3>
                <p className="client-meta">{t.metadata}</p>
              </div>
              <p className="client-quote">{t.quote}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default ClientSection;
