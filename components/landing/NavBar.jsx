"use client";
import { useState } from 'react';
import Link from 'next/link';
import './NavBar.css';

function NavBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <p>STRIKEIQ</p>
        </div>
        
        <div className="hamburger" onClick={toggleMenu}>
          <span className={`bar ${isMobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`bar ${isMobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`bar ${isMobileMenuOpen ? 'open' : ''}`}></span>
        </div>

        <div className={`navbar-right ${isMobileMenuOpen ? 'active' : ''}`}>
          <div className="navbar-links">
            <div className="nav-link-wrapper">
              <a href="#about-us" className="nav-link" onClick={toggleMenu}>ABOUT US</a>
            </div>
            <div className="nav-link-wrapper">
              <a href="#how-it-works" className="nav-link" onClick={toggleMenu}>HOW IT WORKS</a>
            </div>
            <div className="nav-link-wrapper">
              <a href="#accuracy" className="nav-link" onClick={toggleMenu}>ACCURACY</a>
            </div>
            <div className="nav-link-wrapper">
              <Link href="/predictions" className="nav-link text-emerald-400 font-bold" onClick={toggleMenu}>LIVE PREVIEW</Link>
            </div>
            <div className="nav-link-wrapper">
              <a href="#pricing" className="nav-link" onClick={toggleMenu}>PRICING</a>
            </div>
          </div>
          
          <div className="navbar-login-wrapper">
            <a href="/login" className="navbar-login text-center block">LOGIN</a>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
