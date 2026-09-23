import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-pill">
          <span className="status-dot-pulse"></span>
          <span>Sri Lanka Enterprise Edition • Real-Time Cloud Ledger</span>
        </div>

        <h1 className="hero-title">
          Transform Business Operations into <br />
          <span className="text-gradient">Real-Time Financial Clarity</span>
        </h1>

        <p className="hero-description">
          A lightweight, high-performance platform engineered for Sri Lankan retail, wholesale, and service enterprises. 
          Automate Cost of Goods Sold (COGS), eliminate stockouts, track real net profits in Sri Lankan Rupees (LKR), 
          and leverage collaborative multi-agent AI for demand forecasting and inventory auditing.
        </p>

        <div className="hero-cta-group">
          <Link to="/dashboard" className="btn btn-primary" style={{ padding: '0.75rem 1.6rem', fontSize: '1rem' }}>
            Open Live Dashboard
          </Link>
          <Link to="/agent-workflows" className="btn btn-secondary" style={{ padding: '0.75rem 1.6rem', fontSize: '1rem' }}>
            Explore AI Workflows
          </Link>
          <Link to="/inventory" className="btn btn-outline" style={{ padding: '0.75rem 1.6rem', fontSize: '1rem' }}>
            Manage Inventory
          </Link>
        </div>

        {/* Hero Stats Ribbon */}
        <div className="hero-stats-ribbon">
          <div className="ribbon-item">
            <span className="ribbon-val" style={{ color: 'var(--color-primary)' }}>LKR Real-Time</span>
            <span className="ribbon-label">Automated COGS & Profits</span>
          </div>
          <div className="ribbon-item">
            <span className="ribbon-val" style={{ color: 'var(--color-purple)' }}>4 Agents</span>
            <span className="ribbon-label">Collaborative AI Subsystem</span>
          </div>
          <div className="ribbon-item">
            <span className="ribbon-val" style={{ color: 'var(--color-warning)' }}>LKR 15,000</span>
            <span className="ribbon-label">Governance Approval Gate</span>
          </div>
          <div className="ribbon-item">
            <span className="ribbon-val" style={{ color: 'var(--color-success)' }}>3 Roles</span>
            <span className="ribbon-label">Granular RBAC Security</span>
          </div>
        </div>
      </section>

      {/* Multi-Agent Architecture Showcase */}
      <section className="showcase-card">
        <div className="showcase-header">
          <div>
            <span className="badge badge-info" style={{ marginBottom: '0.5rem' }}>Group Assignment Architecture</span>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 700, margin: '0.25rem 0' }}>
              4-Agent Collaborative AI Pipeline
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              Powered by Google Gemini 3.6 Flash and Allow-listed PostgreSQL Tools
            </p>
          </div>
          <Link to="/agent-workflows" className="btn btn-outline btn-sm">
            View Live Workflow Trace →
          </Link>
        </div>

        <div className="showcase-grid">
          <div className="agent-preview-box">
            <span className="agent-box-step">1</span>
            <span className="agent-box-student">Student 1 • Inventory</span>
            <h4 className="agent-box-title">Inventory Auditor</h4>
            <p className="agent-box-desc">
              Executes allow-listed DB queries to identify low-stock items and calculate exact replenishment deficits.
            </p>
          </div>

          <div className="agent-preview-box">
            <span className="agent-box-step">2</span>
            <span className="agent-box-student">Student 2 • Sales (Gemini)</span>
            <h4 className="agent-box-title">Sales Demand Agent</h4>
            <p className="agent-box-desc">
              Leverages Gemini 3.6 Flash to analyze sales velocity, purchase frequency, and identify sudden demand surges.
            </p>
          </div>

          <div className="agent-preview-box">
            <span className="agent-box-step">3</span>
            <span className="agent-box-student">Student 3 • Finance (Gemini)</span>
            <h4 className="agent-box-title">Procurement Cost Agent</h4>
            <p className="agent-box-desc">
              Computes structured purchase order lines in LKR, factoring in unit supplier costs and budget impact.
            </p>
          </div>

          <div className="agent-preview-box">
            <span className="agent-box-step">4</span>
            <span className="agent-box-student">Student 4 • Governance</span>
            <h4 className="agent-box-title">Governance Guardian</h4>
            <p className="agent-box-desc">
              Enforces the strict LKR 15,000 threshold. Orders requiring high capital pause for Admin sign-off.
            </p>
          </div>
        </div>
      </section>

      {/* Core Platform Capabilities */}
      <section style={{ marginTop: '3.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span className="badge badge-info" style={{ marginBottom: '0.5rem' }}>Core Modules</span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Comprehensive Enterprise Capabilities</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Everything required to operate a transparent Sri Lankan MSME</p>
        </div>

        <div className="features-list-grid">
          <div className="feature-box">
            <div className="module-card-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </div>
            <h3>Executive Dashboard</h3>
            <p>
              Monitor real-time Revenue, Cost of Goods Sold, Gross Margin, and Net Profit with flexible date range filters and transaction summaries.
            </p>
            <Link to="/dashboard" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none', display: 'inline-block', marginTop: '0.75rem' }}>
              View Dashboard →
            </Link>
          </div>

          <div className="feature-box">
            <div className="module-card-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <h3>Inventory Management</h3>
            <p>
              Complete SKU tracking with automatic low-stock alerts, cost price valuations, margin estimates, and seamless stock adjustments.
            </p>
            <Link to="/inventory" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none', display: 'inline-block', marginTop: '0.75rem' }}>
              Manage Stock →
            </Link>
          </div>

          <div className="feature-box">
            <div className="module-card-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <h3>Sales & POS Checkout</h3>
            <p>
              Rapid cart building, instant COGS subtraction, customer receipt tracking, and multi-channel payment logging (Cash, Card, Bank).
            </p>
            <Link to="/sales" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none', display: 'inline-block', marginTop: '0.75rem' }}>
              Open POS →
            </Link>
          </div>

          <div className="feature-box">
            <div className="module-card-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </div>
            <h3>Operating Expenses</h3>
            <p>
              Log utilities, store rent, logistics, and payroll overheads. Automatically deducted to provide true net profit figures in Sri Lankan Rupees.
            </p>
            <Link to="/expenses" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none', display: 'inline-block', marginTop: '0.75rem' }}>
              View Expenses →
            </Link>
          </div>
        </div>
      </section>

      {/* Role-Based Security Matrix */}
      <section style={{ marginTop: '3.5rem', marginBottom: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span className="badge badge-info" style={{ marginBottom: '0.5rem' }}>Security & RBAC</span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Role-Based Access Architecture</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Engineered with strict ASP.NET Core authorization policies</p>
        </div>

        <div className="problem-solution-grid">
          <div className="feature-box" style={{ borderTop: '4px solid var(--color-primary)' }}>
            <span className="badge badge-info" style={{ marginBottom: '0.75rem' }}>Full System Access</span>
            <h3>Administrator</h3>
            <p>
              Complete access to high-level financials, executive governance decisions, human-in-the-loop AI replenishment sign-offs, and user auditing.
            </p>
          </div>

          <div className="feature-box" style={{ borderTop: '4px solid var(--color-warning)' }}>
            <span className="badge badge-warning" style={{ marginBottom: '0.75rem' }}>Catalog & Warehousing</span>
            <h3>Inventory Manager</h3>
            <p>
              Authorized to create and edit products, configure reorder levels, adjust physical counts, and review the Inventory Auditor agent reports.
            </p>
          </div>

          <div className="feature-box" style={{ borderTop: '4px solid var(--color-success)' }}>
            <span className="badge badge-success" style={{ marginBottom: '0.75rem' }}>Front-Counter Checkout</span>
            <h3>Cashier</h3>
            <p>
              Streamlined for point-of-sale efficiency. Can record sales transactions, generate receipts, and review the Sales Demand agent velocity feed.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
