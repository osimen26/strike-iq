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
              <Link href="/#about-us" className="nav-link" onClick={toggleMenu}>ABOUT US</Link>
            </div>
            <div className="nav-link-wrapper">
              <Link href="/#how-it-works" className="nav-link" onClick={toggleMenu}>HOW IT WORKS</Link>
            </div>
            <div className="nav-link-wrapper">
              <Link href="/#accuracy" className="nav-link" onClick={toggleMenu}>ACCURACY</Link>
            </div>
            <div className="nav-link-wrapper">
              <Link href="/#pricing" className="nav-link" onClick={toggleMenu}>PRICING</Link>
            </div>
          </div>
          
          <div className="navbar-login-wrapper">
            <Link href="/login" className="navbar-login text-center block">LOGIN</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
