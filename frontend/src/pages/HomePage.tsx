import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import HomeNavbar from '../components/home/HomeNavbar';
import WalletMateLogo from '../components/auth/WalletMateLogo';
import '../styles/homepage.css';

import {
  ArrowRight,
  ShieldCheck,
  FileText,
  PieChart,
  CheckCircle2,
  Lock,
  Database,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  UploadCloud,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // Interactive Category Filter State for Feature Demonstration
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeBankSample, setActiveBankSample] = useState<string>('HDFC');

  const handleDashboardClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Sample transactions for interactive category filter demo
  const sampleDemoTransactions = [
    { id: 1, merchant: 'Tech Corp India (Salary)', category: 'Income', amount: 85000, type: 'income', date: '22 Aug 2026' },
    { id: 2, merchant: 'Swiggy Food Delivery', category: 'Food', amount: 640, type: 'expense', date: '21 Aug 2026' },
    { id: 3, merchant: 'Amazon.in Electronics', category: 'Shopping', amount: 2499, type: 'expense', date: '20 Aug 2026' },
    { id: 4, merchant: 'Uber Premier Ride', category: 'Transport', amount: 480, type: 'expense', date: '19 Aug 2026' },
    { id: 5, merchant: 'Airtel Broadband & Fiber', category: 'Bills', amount: 1199, type: 'expense', date: '18 Aug 2026' },
    { id: 6, merchant: 'Nifty Index Fund SIP', category: 'Investment', amount: 10000, type: 'expense', date: '17 Aug 2026' },
  ];

  const filteredDemoTransactions = activeCategory === 'All'
    ? sampleDemoTransactions
    : sampleDemoTransactions.filter(t => t.category === activeCategory);

  return (
    <div className="homepage-wrapper">
      {/* Background ambient radial glow */}
      <div className="homepage-ambient-glow" />

      {/* Sticky Navigation Bar */}
      <HomeNavbar onScrollToSection={scrollToSection} />

      {/* =================================================================
          1. HERO SECTION
          ================================================================= */}
      <section className="wm-hero">
        <div className="wm-container">
          {/* Badge */}
          <div className="wm-badge">
            <span className="wm-badge-dot" />
            <span>Wallet-mate 2.0 • Intelligent Money Management</span>
          </div>

          {/* Editorial Headline */}
          <h1 className="wm-hero-title">
            Take control of your money with{' '}
            <span className="wm-hero-title-gradient">absolute clarity.</span>
          </h1>

          {/* Subtitle */}
          <p className="wm-hero-subtitle">
            Wallet-mate brings your bank statements, transactions, and financial health into
            one simple, intelligent dashboard with automated PDF extraction and zero guesswork.
          </p>

          {/* CTA Buttons */}
          <div className="wm-hero-actions">
            <button
              type="button"
              onClick={handleDashboardClick}
              className="wm-btn-primary wm-hero-btn-lg"
              id="btn-hero-primary"
            >
              <span>{isAuthenticated ? 'Open Your Dashboard' : 'View Dashboard'}</span>
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className="wm-btn-secondary wm-hero-btn-lg"
              id="btn-hero-explore"
            >
              <span>Explore Features</span>
            </button>
          </div>

          {/* =================================================================
              HERO PRODUCT SHOWCASE (INTERACTIVE MOCKUP)
              ================================================================= */}
          <div className="wm-hero-showcase">
            {/* Floating Pill Badge Left */}
            <div className="wm-floating-card left">
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>PDF Statement Extracted</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>128 transactions categorized</div>
              </div>
            </div>

            {/* Floating Pill Badge Right */}
            <div className="wm-floating-card right">
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f5f3ff', color: '#635bff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>Multi-Tenant Isolation</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Strict MongoDB User Ownership</div>
              </div>
            </div>

            {/* Main Mockup Container Frame */}
            <div className="wm-mockup-frame">
              {/* Mockup Window Controls */}
              <div className="wm-mockup-header">
                <div className="wm-mockup-dots">
                  <span className="wm-mockup-dot red" />
                  <span className="wm-mockup-dot yellow" />
                  <span className="wm-mockup-dot green" />
                </div>
                <span className="wm-mockup-url">app.walletmate.io/dashboard</span>
                <span style={{ fontSize: '0.75rem', color: '#635bff', fontWeight: 600 }}>● Live Demo</span>
              </div>

              {/* Mockup Dashboard Content */}
              <div className="wm-mockup-body">
                {/* Left Side: Stats and Spending Chart */}
                <div>
                  {/* Top 3 Stat Cards */}
                  <div className="wm-mini-stats-grid">
                    <div className="wm-mini-stat">
                      <div className="wm-mini-stat-label">Total Balance</div>
                      <div className="wm-mini-stat-value">₹2,74,302</div>
                      <div className="wm-mini-stat-sub wm-text-success">↑ +14.2% this month</div>
                    </div>

                    <div className="wm-mini-stat">
                      <div className="wm-mini-stat-label">Monthly Inflow</div>
                      <div className="wm-mini-stat-value">₹3,00,000</div>
                      <div className="wm-mini-stat-sub wm-text-success">Salary & Freelance</div>
                    </div>

                    <div className="wm-mini-stat">
                      <div className="wm-mini-stat-label">Monthly Expenses</div>
                      <div className="wm-mini-stat-value">₹20,075</div>
                      <div className="wm-mini-stat-sub wm-text-danger">7% of income</div>
                    </div>
                  </div>

                  {/* Spending Analytics Chart Preview */}
                  <div className="wm-mockup-chart-card">
                    <div className="wm-mockup-chart-header">
                      <div className="wm-mockup-chart-title">Inflow vs. Outflow Analytics</div>
                      <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem', fontWeight: 600 }}>
                        <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ width: 8, height: 8, borderRadius: 2, background: '#10b981' }} /> Inflow
                        </span>
                        <span style={{ color: '#635bff', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ width: 8, height: 8, borderRadius: 2, background: '#635bff' }} /> Outflow
                        </span>
                      </div>
                    </div>

                    {/* Visual CSS Bars */}
                    <div className="wm-chart-bars">
                      {[
                        { month: 'Apr', inH: 60, outH: 25 },
                        { month: 'May', inH: 75, outH: 30 },
                        { month: 'Jun', inH: 85, outH: 20 },
                        { month: 'Jul', inH: 70, outH: 35 },
                        { month: 'Aug', inH: 95, outH: 22 },
                      ].map((item, idx) => (
                        <div key={idx} className="wm-bar-group">
                          <div className="wm-bar-pair">
                            <div className="wm-bar-fill income" style={{ height: `${item.inH}%` }} />
                            <div className="wm-bar-fill expense" style={{ height: `${item.outH}%` }} />
                          </div>
                          <span className="wm-bar-label">{item.month}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Side: Financial Health & Recent Transactions */}
                <div className="wm-mockup-sidebar">
                  {/* Financial Health Badge */}
                  <div className="wm-health-badge-card">
                    <div className="wm-health-score-title">Financial Health Score</div>
                    <div className="wm-health-score-num">82<span style={{ fontSize: '1.2rem', opacity: 0.8 }}>/100</span></div>
                    <div className="wm-health-verdict">Grade A • Excellent Stability</div>
                  </div>

                  {/* Recent Transactions List */}
                  <div className="wm-mockup-tx-list">
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, marginBottom: 10, color: '#0f172a' }}>
                      Recent Activity
                    </div>

                    <div className="wm-mockup-tx-item">
                      <div className="wm-tx-meta">
                        <div className="wm-tx-icon-pill" style={{ background: '#ecfdf5', color: '#10b981' }}>
                          <ArrowDownRight size={16} />
                        </div>
                        <div>
                          <div className="wm-tx-name">Tech Corp Salary</div>
                          <div className="wm-tx-time">Direct Deposit</div>
                        </div>
                      </div>
                      <div className="wm-tx-amount wm-text-success">+₹85,000</div>
                    </div>

                    <div className="wm-mockup-tx-item">
                      <div className="wm-tx-meta">
                        <div className="wm-tx-icon-pill" style={{ background: '#fef2f2', color: '#ef4444' }}>
                          <ArrowUpRight size={16} />
                        </div>
                        <div>
                          <div className="wm-tx-name">Swiggy Order</div>
                          <div className="wm-tx-time">UPI • Food</div>
                        </div>
                      </div>
                      <div className="wm-tx-amount wm-text-danger">-₹640</div>
                    </div>

                    <div className="wm-mockup-tx-item">
                      <div className="wm-tx-meta">
                        <div className="wm-tx-icon-pill" style={{ background: '#fef2f2', color: '#ef4444' }}>
                          <ArrowUpRight size={16} />
                        </div>
                        <div>
                          <div className="wm-tx-name">Amazon.in</div>
                          <div className="wm-tx-time">Card • Shopping</div>
                        </div>
                      </div>
                      <div className="wm-tx-amount wm-text-danger">-₹2,499</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================
          2. VALUE PROPOSITION STRIP
          ================================================================= */}
      <section className="wm-value-strip">
        <div className="wm-container">
          <div className="wm-value-grid">
            <div className="wm-value-item">
              <div className="wm-value-icon">
                <PieChart size={20} />
              </div>
              <h3 className="wm-value-title">One Unified Dashboard</h3>
              <p className="wm-value-desc">
                Organize your income, expenditures, and net liquidity in one intuitive view.
              </p>
            </div>

            <div className="wm-value-item">
              <div className="wm-value-icon">
                <FileText size={20} />
              </div>
              <h3 className="wm-value-title">PDF Bank Extraction</h3>
              <p className="wm-value-desc">
                Drop your bank PDF statement to automatically extract and categorize transactions.
              </p>
            </div>

            <div className="wm-value-item">
              <div className="wm-value-icon">
                <TrendingUp size={20} />
              </div>
              <h3 className="wm-value-title">0-100 Health Score</h3>
              <p className="wm-value-desc">
                Multi-pillar financial score analyzing your savings rate, debt ratio, and stability.
              </p>
            </div>

            <div className="wm-value-item">
              <div className="wm-value-icon">
                <ShieldCheck size={20} />
              </div>
              <h3 className="wm-value-title">Strict Data Isolation</h3>
              <p className="wm-value-desc">
                MongoDB multi-tenant security ensures your financial records remain completely private.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================
          3. FEATURE SHOWCASES (STORYTELLING)
          ================================================================= */}
      <section className="wm-feature-section" id="features">
        <div className="wm-container">
          {/* Section Header */}
          <div className="wm-section-header">
            <span className="wm-section-tag">Core Capabilities</span>
            <h2 className="wm-section-title">Everything you need to master your money.</h2>
            <p className="wm-section-subtitle">
              Wallet-mate replaces scattered bank messages and confusing PDFs with a clean,
              structured ledger that turns raw data into actionable insights.
            </p>
          </div>

          {/* STORY 1: PDF Statement Extraction */}
          <div className="wm-story-row" id="statement-extract">
            <div className="wm-story-content">
              <span className="wm-section-tag">Bank Statement Parser</span>
              <h3 className="wm-story-title">Turn PDF bank statements into structured records in seconds.</h3>
              <p className="wm-story-desc">
                No need to type each transaction manually. Simply upload your bank statement PDF from any major
                bank (HDFC, SBI, ICICI, Axis, Kotak) to parse, deduplicate, and store transactions instantly.
              </p>

              <ul className="wm-story-list">
                <li className="wm-story-list-item">
                  <CheckCircle2 size={18} />
                  <span>Automated debit/credit normalization into income and expenses</span>
                </li>
                <li className="wm-story-list-item">
                  <CheckCircle2 size={18} />
                  <span>Deterministic SHA-256 deduplication to prevent duplicate rows</span>
                </li>
                <li className="wm-story-list-item">
                  <CheckCircle2 size={18} />
                  <span>Rule-based Indian merchant & UPI identifier extraction</span>
                </li>
              </ul>
            </div>

            <div className="wm-story-visual">
              {/* Interactive Bank Selection Simulator */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                {['HDFC Bank', 'SBI Bank', 'ICICI Bank', 'Generic PDF'].map((bName) => (
                  <button
                    key={bName}
                    type="button"
                    onClick={() => setActiveBankSample(bName)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      borderRadius: 6,
                      border: '1px solid var(--wm-border)',
                      background: activeBankSample === bName ? '#635bff' : '#ffffff',
                      color: activeBankSample === bName ? '#ffffff' : '#64748b',
                      cursor: 'pointer',
                    }}
                  >
                    {bName}
                  </button>
                ))}
              </div>

              <div className="wm-pdf-sim-box">
                <div className="wm-pdf-sim-icon">
                  <UploadCloud size={24} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                  {activeBankSample}_Statement_August_2026.pdf
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 4 }}>
                  Ready to parse • 128 transaction rows detected
                </div>
                <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ecfdf5', color: '#10b981', padding: '6px 12px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600 }}>
                  <CheckCircle2 size={14} />
                  <span>100% Parsed & Deduplicated into MongoDB</span>
                </div>
              </div>
            </div>
          </div>

          {/* STORY 2: Financial Health Engine */}
          <div className="wm-story-row reverse" id="financial-health">
            <div className="wm-story-content">
              <span className="wm-section-tag">Intelligent Scoring</span>
              <h3 className="wm-story-title">A 0-100 score that reveals the true health of your finances.</h3>
              <p className="wm-story-desc">
                Wallet-mate doesn’t just show numbers—it grades your overall financial posture across
                four key pillars: savings discipline, expense ratio, debt load, and liquidity buffer.
              </p>

              <ul className="wm-story-list">
                <li className="wm-story-list-item">
                  <CheckCircle2 size={18} />
                  <span>Savings Discipline Pillar (40% weighting)</span>
                </li>
                <li className="wm-story-list-item">
                  <CheckCircle2 size={18} />
                  <span>Expense Ratio & Outflow Control (25% weighting)</span>
                </li>
                <li className="wm-story-list-item">
                  <CheckCircle2 size={18} />
                  <span>Liquidity Buffer & Emergency Preparedness (20% weighting)</span>
                </li>
              </ul>
            </div>

            <div className="wm-story-visual">
              <div style={{ background: '#ffffff', border: '1px solid var(--wm-border)', borderRadius: 14, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Overall Health Index</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>82 <span style={{ fontSize: '1rem', color: '#10b981' }}>Grade A</span></div>
                  </div>
                  <div style={{ padding: '6px 12px', borderRadius: 8, background: '#ecfdf5', color: '#10b981', fontSize: '0.8rem', fontWeight: 700 }}>
                    Excellent
                  </div>
                </div>

                {/* 4 Pillars Progress Bars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4, fontWeight: 500 }}>
                      <span>Savings Rate (85%)</span>
                      <span style={{ color: '#10b981', fontWeight: 700 }}>34/40 pts</span>
                    </div>
                    <div style={{ width: '100%', height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: '85%', height: '100%', background: '#10b981', borderRadius: 3 }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4, fontWeight: 500 }}>
                      <span>Expense Control</span>
                      <span style={{ color: '#635bff', fontWeight: 700 }}>22/25 pts</span>
                    </div>
                    <div style={{ width: '100%', height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: '88%', height: '100%', background: '#635bff', borderRadius: 3 }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4, fontWeight: 500 }}>
                      <span>Liquidity Runway (6+ months)</span>
                      <span style={{ color: '#8b5cf6', fontWeight: 700 }}>18/20 pts</span>
                    </div>
                    <div style={{ width: '100%', height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: '90%', height: '100%', background: '#8b5cf6', borderRadius: 3 }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STORY 3: Interactive Ledger & Categories */}
          <div className="wm-story-row">
            <div className="wm-story-content">
              <span className="wm-section-tag">Smart Ledger</span>
              <h3 className="wm-story-title">Filter, categorize, and inspect every rupee spent.</h3>
              <p className="wm-story-desc">
                Interactive category tagging gives you a laser-focused breakdown of your expenditures.
                Filter effortlessly across Food, Shopping, Transport, Utilities, and Salary deposits.
              </p>

              <div className="wm-category-pills">
                {['All', 'Food', 'Shopping', 'Transport', 'Bills', 'Income', 'Investment'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`wm-cat-pill ${activeCategory === cat ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="wm-story-visual">
              <div style={{ background: '#ffffff', border: '1px solid var(--wm-border)', borderRadius: 14, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                  <span>Showing: {activeCategory} ({filteredDemoTransactions.length})</span>
                  <span style={{ color: '#635bff' }}>Interactive Preview</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {filteredDemoTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: '#f8fafc',
                        borderRadius: 8,
                        border: '1px solid #f1f5f9',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{tx.merchant}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{tx.date} • {tx.category}</div>
                      </div>
                      <div
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          color: tx.type === 'income' ? '#10b981' : '#ef4444',
                        }}
                      >
                        {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================
          4. HOW IT WORKS (3-STEP TIMELINE)
          ================================================================= */}
      <section className="wm-how-it-works" id="how-it-works">
        <div className="wm-container">
          <div className="wm-section-header">
            <span className="wm-section-tag">Simple & Fast</span>
            <h2 className="wm-section-title">Get started in three easy steps.</h2>
            <p className="wm-section-subtitle">
              From account creation to full financial visibility in under two minutes.
            </p>
          </div>

          <div className="wm-steps-grid">
            <div className="wm-step-card">
              <div className="wm-step-num">01</div>
              <h3 className="wm-step-title">Create Your Account</h3>
              <p className="wm-step-desc">
                Sign up in seconds using your phone number with instant OTP verification or email authentication.
              </p>
            </div>

            <div className="wm-step-card">
              <div className="wm-step-num">02</div>
              <h3 className="wm-step-title">Upload Bank Statement</h3>
              <p className="wm-step-desc">
                Drag and drop your bank PDF statement. Our parser automatically extracts and deduplicates every transaction.
              </p>
            </div>

            <div className="wm-step-card">
              <div className="wm-step-num">03</div>
              <h3 className="wm-step-title">Gain Instant Financial Clarity</h3>
              <p className="wm-step-desc">
                View your dynamic balance, categorized spending charts, and your personalized 0-100 financial health score.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================
          5. SECURITY & TRUST ARCHITECTURE
          ================================================================= */}
      <section className="wm-security-section" id="security">
        <div className="wm-container">
          <div className="wm-section-header">
            <span className="wm-section-tag">Security & Privacy</span>
            <h2 className="wm-section-title">Built with strict financial privacy.</h2>
            <p className="wm-section-subtitle">
              We design every layer of Wallet-mate to protect your data with strict tenant isolation.
            </p>
          </div>

          <div className="wm-security-grid">
            <div className="wm-security-card">
              <div className="wm-sec-icon">
                <Database size={20} />
              </div>
              <h3 className="wm-sec-title">Multi-Tenant MongoDB Isolation</h3>
              <p className="wm-sec-desc">
                Every transaction document is strictly stamped with your authenticated <code style={{ fontSize: '0.8rem', background: '#f1f5f9', padding: '2px 4px', borderRadius: 4 }}>userId</code>. Cross-tenant access is impossible.
              </p>
            </div>

            <div className="wm-security-card">
              <div className="wm-sec-icon">
                <Lock size={20} />
              </div>
              <h3 className="wm-sec-title">Bcrypt Hashing & JWT Auth</h3>
              <p className="wm-sec-desc">
                Passwords are salted and hashed with bcrypt. Stateless JSON Web Tokens securely authorize all API requests.
              </p>
            </div>

            <div className="wm-security-card">
              <div className="wm-sec-icon">
                <ShieldCheck size={20} />
              </div>
              <h3 className="wm-sec-title">Zero Plaintext Data Storage</h3>
              <p className="wm-sec-desc">
                Sensitive identifiers and temporary statement files are sanitized in-memory and never exposed publicly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================
          6. FULL-WIDTH CALL TO ACTION
          ================================================================= */}
      <section className="wm-cta-section">
        <div className="wm-container">
          <div className="wm-cta-card">
            <div className="wm-cta-glow" />
            <h2 className="wm-cta-title">Your money deserves a clearer view.</h2>
            <p className="wm-cta-desc">
              Join thousands who organize their personal finances, analyze bank statements,
              and build better money habits with Wallet-mate.
            </p>

            <div className="wm-cta-actions">
              <Link to="/signup" className="wm-btn-cta-white" id="btn-cta-signup">
                <span>Create Free Account</span>
                <ArrowRight size={18} />
              </Link>
              <button
                type="button"
                onClick={handleDashboardClick}
                className="wm-btn-cta-outline"
                id="btn-cta-dashboard"
              >
                <span>View Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================
          7. FOOTER
          ================================================================= */}
      <footer className="wm-footer">
        <div className="wm-container">
          <div className="wm-footer-grid">
            <div className="wm-footer-brand-col">
              <Link to="/" className="wm-nav-brand">
                <WalletMateLogo size="md" showText={false} />
                <span>Wallet-mate</span>
              </Link>
              <p className="wm-footer-desc">
                Modern personal finance and money management platform designed for complete financial visibility and peace of mind.
              </p>
            </div>

            <div>
              <div className="wm-footer-col-title">Product</div>
              <ul className="wm-footer-links">
                <li><button type="button" onClick={() => scrollToSection('features')} className="wm-footer-link" style={{ background: 'none', border: 'none', padding: 0 }}>Features</button></li>
                <li><button type="button" onClick={() => scrollToSection('statement-extract')} className="wm-footer-link" style={{ background: 'none', border: 'none', padding: 0 }}>PDF Extraction</button></li>
                <li><button type="button" onClick={() => scrollToSection('financial-health')} className="wm-footer-link" style={{ background: 'none', border: 'none', padding: 0 }}>Health Engine</button></li>
                <li><Link to="/dashboard" className="wm-footer-link">Dashboard</Link></li>
                <li><Link to="/transactions" className="wm-footer-link">Transactions Ledger</Link></li>
              </ul>
            </div>

            <div>
              <div className="wm-footer-col-title">Security & Tech</div>
              <ul className="wm-footer-links">
                <li><button type="button" onClick={() => scrollToSection('security')} className="wm-footer-link" style={{ background: 'none', border: 'none', padding: 0 }}>Privacy & Data Isolation</button></li>
                <li><span className="wm-footer-link">MongoDB Multi-Tenant</span></li>
                <li><span className="wm-footer-link">JWT Bearer Authorization</span></li>
                <li><span className="wm-footer-link">FastAPI AI Mentor</span></li>
              </ul>
            </div>

            <div>
              <div className="wm-footer-col-title">Account</div>
              <ul className="wm-footer-links">
                <li><Link to="/login" className="wm-footer-link">Sign In</Link></li>
                <li><Link to="/signup" className="wm-footer-link">Create Account</Link></li>
                <li><Link to="/forgot-password" className="wm-footer-link">Reset Password</Link></li>
                <li><Link to="/dashboard" className="wm-footer-link">Open Dashboard</Link></li>
              </ul>
            </div>
          </div>

          <div className="wm-footer-bottom">
            <div>© 2026 Wallet-mate. All rights reserved.</div>
            <div style={{ display: 'flex', gap: 20 }}>
              <span style={{ color: '#94a3b8' }}>Built for financial clarity</span>
              <span style={{ color: '#94a3b8' }}>Version 2.0.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
