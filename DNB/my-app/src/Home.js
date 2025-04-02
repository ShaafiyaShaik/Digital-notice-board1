import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Homepage1.css";

const Homepage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="universe">
      <div className="stars"></div>
      <div className="twinkling"></div>
      
      {/* Navigation Bar */}
      <nav className={`cosmic-navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="logo">
          <span className="logo-icon">📌</span>
          <span className="logo-text">Digital Notice Board</span>
        </div>
        <ul className="nav-links">
          <li><Link to="/login" className="cosmic-btn login-btn">Login</Link></li>
          <li><Link to="/register" className="cosmic-btn signup-btn">Sign Up</Link></li>
        </ul>
      </nav>

      {/* Hero Section */}
      <header className="cosmic-hero">
        <div className="floating-card hero-content">
          <h1 className="neon-title">Empowering Digital Communication</h1>
          <p className="cosmic-subtitle">A modern solution for managing notices efficiently.</p>
          <Link to="/register" className="cosmic-btn get-started-btn">Get Started</Link>
        </div>
      </header>

      {/* Features Section */}
      <section className="cosmic-features">
        <h2 className="section-heading">Why Choose Our Notice Board?</h2>
        <div className="feature-galaxy">
          <div className="feature-card">
            <div className="feature-icon">📢</div>
            <div className="feature-text">Instant Updates</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <div className="feature-text">Secure & Reliable</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔎</div>
            <div className="feature-text">Smart Filters</div>
          </div>
        </div>
      </section>

      {/* Additional Pages */}
      <section className="cosmic-extra-pages">
        <h2 className="section-heading">Explore More</h2>
        <div className="floating-links">
          <Link to="/notices" className="floating-card page-card">
            <span className="card-icon">📜</span>
            <span className="card-text">View Notices</span>
          </Link>
          <Link to="/contact" className="floating-card page-card">
            <span className="card-icon">📞</span>
            <span className="card-text">Contact Us</span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Homepage;