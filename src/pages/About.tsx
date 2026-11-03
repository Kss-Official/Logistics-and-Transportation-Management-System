import React from 'react';
import { Link } from 'react-router-dom';
import PublicHeader from '../components/public/PublicHeader';
import PublicFooter from '../components/public/PublicFooter';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Users,
  Award,
  Globe,
  Truck,
  Warehouse,
  Sparkles,
  Layers,
  Activity,
  Compass
} from 'lucide-react';

// Varied high-quality realistic logistics photography
import aboutHeroImg from '../assets/hero_real_primeroute_hub.jpg';
import storyImg from '../assets/cargo_warehouse_terminal.jpg';
import valuesImg from '../assets/corporate_road_freight.jpg';
import futureBannerImg from '../assets/hero_real_express_bridge.jpg';

const VALUES_LIST = [
  {
    num: '01',
    title: 'VISIBILITY',
    desc: 'Make every freight movement, hub scan, and gate-out verified and instantly visible to every participant in the supply chain.',
  },
  {
    num: '02',
    title: 'RELIABILITY',
    desc: 'Build dependable, SLA-backed linehaul operations engineered to deliver consistently on time across national expressways.',
  },
  {
    num: '03',
    title: 'EFFICIENCY',
    desc: 'Eliminate manual paperwork, redundant brokers, and transit blindspots through automated dispatch software.',
  },
  {
    num: '04',
    title: 'CONNECTION',
    desc: 'Seamlessly unite consignors, dock managers, commercial haulers, and dispatchers into one synchronized ecosystem.',
  },
];

export default function About() {
  return (
    <div className="editorial-root">
      <PublicHeader />

      <main>
        {/* ── 1. EDITORIAL HERO ── */}
        <section className="editorial-page-hero">
          <div className="editorial-page-hero-media">
            <img
              src={aboutHeroImg}
              alt="PrimeRoute Logistics Hub and Multimodal Facility"
              className="editorial-page-hero-img"
            />
          </div>
          <div className="editorial-page-hero-overlay" />

          <div className="editorial-page-hero-container">
            <div className="editorial-page-hero-content">
              <div className="editorial-page-hero-label">
                ABOUT PRIMEROUTE
              </div>

              <h1 className="editorial-page-hero-title">
                PEOPLE. ROUTES.<br />
                <span className="blue-highlight">OPPORTUNITIES.</span>
              </h1>

              <p className="editorial-page-hero-desc">
                At PrimeRoute, we believe logistics is more than movement — it is about people, businesses and opportunities.
              </p>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <a
                  href="#story"
                  className="editorial-btn-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <span>LEARN MORE</span>
                  <ArrowRight size={15} />
                </a>
                <Link to="/register" className="editorial-btn-outline-light">
                  <span>GET STARTED</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. COMPANY STATISTICS STRIP ── */}
        <section className="editorial-dark-stats">
          <div className="editorial-container">
            <div className="editorial-stats-grid">
              <div>
                <div className="editorial-stat-num">5,000+</div>
                <div className="editorial-stat-label">ACTIVE CUSTOMERS</div>
              </div>
              <div>
                <div className="editorial-stat-num">1.2M+</div>
                <div className="editorial-stat-label">SHIPMENTS MANAGED</div>
              </div>
              <div>
                <div className="editorial-stat-num">98.6%</div>
                <div className="editorial-stat-label">ON-TIME PERFORMANCE</div>
              </div>
              <div>
                <div className="editorial-stat-num">24/7</div>
                <div className="editorial-stat-label">OPERATIONS HOTLINE</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. ABOUT STORY SECTION (IMAGE & EDITORIAL TEXT) ── */}
        <section id="story" style={{ padding: '96px 0', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
          <div className="editorial-container">
            <div className="editorial-row-alternate">
              <div>
                <div className="editorial-section-tag">
                  <Building2 size={13} />
                  <span>OUR MISSION & FOUNDATION</span>
                </div>

                <h2 style={{ fontFamily: 'var(--pr-font-display)', fontSize: 'clamp(2.6rem, 5vw, 4.4rem)', color: '#070b14', textTransform: 'uppercase', margin: '0 0 20px', letterSpacing: '0.02em', lineHeight: 0.95 }}>
                  BUILDING A SMARTER<br />SUPPLY CHAIN.
                </h2>

                <p style={{ fontSize: '16.5px', color: '#334155', lineHeight: 1.65, margin: '0 0 20px', fontWeight: 500 }}>
                  PrimeRoute brings customers, warehouses, drivers, fleet operations, and shipment visibility together through one connected logistics platform.
                </p>

                <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.65, margin: '0 0 28px' }}>
                  Founded to address the systemic fragmentation in national freight transport, PrimeRoute replaces opaque intermediaries with real-time software. We empower enterprise enterprises with instant rate calculations, automated dock staging, high-frequency GPS tracking, and digital Proof of Delivery.
                </p>

                <div className="editorial-feature-checklist">
                  <div className="editorial-feature-check-item">
                    <CheckCircle2 size={18} color="#0284c7" />
                    <span>Synchronized multi-tier operational architecture</span>
                  </div>
                  <div className="editorial-feature-check-item">
                    <CheckCircle2 size={18} color="#0284c7" />
                    <span>End-to-end digital chain of custody and instant ePOD</span>
                  </div>
                  <div className="editorial-feature-check-item">
                    <CheckCircle2 size={18} color="#0284c7" />
                    <span>Nationwide multi-hub and linehaul corridor coverage</span>
                  </div>
                </div>
              </div>

              <div className="editorial-row-img-col">
                <img
                  src={storyImg}
                  alt="Building a Smarter Supply Chain"
                  className="editorial-row-img"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. COMPANY CORE VALUES ── */}
        <section style={{ padding: '96px 0', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div className="editorial-container">
            <div>
              <div className="editorial-section-tag">
                <Award size={13} />
                <span>GUIDING PRINCIPLES</span>
              </div>

              <h2 style={{ fontFamily: 'var(--pr-font-display)', fontSize: 'clamp(2.6rem, 5vw, 4.4rem)', color: '#070b14', textTransform: 'uppercase', margin: 0, letterSpacing: '0.02em', lineHeight: 0.95 }}>
                THE VALUES THAT DRIVE US
              </h2>

              <p style={{ fontSize: '16px', color: '#64748b', maxWidth: '640px', margin: '12px 0 0', lineHeight: 1.6 }}>
                Every tool, corridor route, and telematics integration we build is guided by four foundational pillars.
              </p>
            </div>

            <div className="editorial-values-grid">
              {VALUES_LIST.map((val) => (
                <div key={val.num} className="editorial-value-card">
                  <div className="editorial-giant-num" style={{ fontSize: '48px', marginBottom: '8px' }}>
                    {val.num}
                  </div>
                  <h3 style={{ fontFamily: 'var(--pr-font-display)', fontSize: '24px', color: '#070b14', letterSpacing: '0.04em', margin: '0 0 10px', textTransform: 'uppercase' }}>
                    {val.title}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                    {val.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. FINAL CAMPAIGN OVERLAY BANNER ── */}
        <section
          className="editorial-full-width-banner"
          style={{ backgroundImage: `url(${futureBannerImg})` }}
        >
          <div className="editorial-full-width-overlay" />

          <div className="editorial-full-width-content">
            <div className="editorial-section-tag" style={{ color: '#38bdf8', borderColor: 'rgba(56,189,248,0.3)', margin: '0 auto 16px' }}>
              <Sparkles size={13} />
              <span>THE FUTURE OF COMMERCE</span>
            </div>

            <h2 className="editorial-full-width-headline">
              THE FUTURE OF<br />LOGISTICS IS CONNECTED.
            </h2>

            <p className="editorial-full-width-sub">
              Join thousands of businesses managing nationwide freight operations with complete confidence.
            </p>

            <Link to="/register" className="editorial-btn-hero-primary" style={{ padding: '16px 36px' }}>
              <span>GET STARTED</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
