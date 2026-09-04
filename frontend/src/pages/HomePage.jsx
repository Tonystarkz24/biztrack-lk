import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <span className="hero-pill">🇱🇰 Tailored for Sri Lankan MSMEs</span>
        <h1 className="hero-title">
          Modern Business Tracking for <span className="text-gradient">Sri Lankan Enterprises</span>
        </h1>
        <p className="hero-description">
          Empowering local retail shops, wholesale merchants, and service businesses to transition from tedious paper ledgers to transparent, real-time digital financial tracking.
        </p>

        <div className="hero-cta-group">
          <Link to="/dashboard" className="btn btn-primary">
            📊 Open Live Dashboard
          </Link>
          <Link to="/inventory" className="btn btn-secondary">
            📦 Manage Inventory
          </Link>
        </div>
      </section>

      {/* Problem & Solution Comparison */}
      <div className="problem-solution-grid">
        <div className="feature-box">
          <div className="feature-box-icon">⚠️</div>
          <h3>The Local Challenge</h3>
          <p>
            Many Sri Lankan small businesses still track sales, credits, and operational expenses in paper books. Price volatility and currency fluctuations make it difficult to calculate true profit margins and avoid stockouts.
          </p>
        </div>

        <div className="feature-box">
          <div className="feature-box-icon">💡</div>
          <h3>The BizTrack Solution</h3>
          <p>
            BizTrack LK provides a lightweight, unified system with online cloud synchronization, automated Cost of Goods Sold (COGS) computation, expense categorization, and instant gross/net profit reporting in Sri Lankan Rupees (LKR).
          </p>
        </div>
      </div>

      {/* Main Core Features */}
      <section style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, textAlign: 'center', marginBottom: '1rem' }}>
          Core Platform Capabilities
        </h2>
        <div className="features-list-grid">
          <div className="feature-box">
            <div className="feature-box-icon">📈</div>
            <h3>Executive Dashboard</h3>
            <p>Track real-time Revenue, Gross Profit, and Estimated Net Profit with one-click date filters.</p>
          </div>
          <div className="feature-box">
            <div className="feature-box-icon">📦</div>
            <h3>Inventory Management</h3>
            <p>Monitor unit costs, stock counts, and receive proactive low-stock threshold alerts.</p>
          </div>
          <div className="feature-box">
            <div className="feature-box-icon">🧾</div>
            <h3>Sales Records</h3>
            <p>Fast checkout transaction logging, automatic profit calculation, and invoice history.</p>
          </div>
          <div className="feature-box">
            <div className="feature-box-icon">💸</div>
            <h3>Expense Tracking</h3>
            <p>Log recurring utility bills, transport, rent, and operational overheads accurately.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
