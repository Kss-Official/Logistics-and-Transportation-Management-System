import React from 'react';
import { Link } from 'react-router-dom';
import PublicHeader from '../components/public/PublicHeader';
import PublicFooter from '../components/public/PublicFooter';
import {
  ArrowRight,
  Cpu,
  Radio,
  Navigation,
  Activity,
  Layers,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Clock,
  Sparkles,
  BarChart3,
  FileCheck,
  Truck
} from 'lucide-react';

// Cinematic technology & logistics images
import techHeroImg from '../assets/control_tower_3d_network.jpg';
import realTimeImg from '../assets/hero_real_intermodal_cargo.jpg';
import connectedImg from '../assets/hero_real_primeroute_hub.jpg';
import routingImg from '../assets/hero_real_express_bridge.jpg';
import analyticsImg from '../assets/corporate_road_freight.jpg';
import epodImg from '../assets/lastmile_3d_delivery.jpg';

const TECH_FEATURES = [
  {
    num: '01',
    title: 'REAL-TIME TRACKING',
    subtitle: 'High-Frequency Telematics',
    image: realTimeImg,
    desc: 'Continuous GPS telemetry stream transmitting speed, waypoint milestones, and geofence entries with sub-minute latency across all national highway corridors.',
    points: [
      'Sub-minute GPS waypoint coordinates & speed telemetry',
      'Geofence automated entry & exit gate triggers',
      'Predictive arrival ETA with weather & traffic models',
      'Instant customer SMS & web portal synchronization'
    ]
  },
  {
    num: '02',
    title: 'CONNECTED OPERATIONS',
    subtitle: 'Synchronized Operational Spine',
    image: connectedImg,
    desc: 'Unifies corporate consignors, terminal warehouse managers, commercial road haulers, and command center dispatchers into a single synchronized database.',
    points: [
      'Multi-tenant role-based permissions & audit trails',
      'Real-time inventory synchronization across multi-hubs',
      'Automated carrier assignment & load matching',
      'Zero communication friction between dock and linehaul'
    ]
  },
  {
    num: '03',
    title: 'INTELLIGENT ROUTING',
    subtitle: 'Corridor Optimization Engine',
    image: routingImg,
    desc: 'Dynamic route optimization calculating toll expenses, driver Hours of Service (HOS) rest waypoints, fuel efficiency profiles, and lane historical transit benchmarks.',
    points: [
      'National highway corridor historical benchmarking',
      'Toll & Fastag automated expenditure calculations',
      'Mandatory driver fatigue rest stop scheduling',
      'Turn-by-turn mobile driver companion integration'
    ]
  },
  {
    num: '04',
    title: 'OPERATIONAL ANALYTICS',
    subtitle: 'Predictive Business Intelligence',
    image: analyticsImg,
    desc: 'Comprehensive control tower analytics evaluating on-time delivery rates, asset utilization ratios, lane profitability, and exception root cause diagnostic logs.',
    points: [
      'Real-time SLA compliance & exception alerting',
      'Fleet asset utilization & maintenance forecasts',
      'Corridor turn-around time (TAT) heatmaps',
      'Instant exportable management audit reports'
    ]
  },
  {
    num: '05',
    title: 'DIGITAL PROOF OF DELIVERY',
    subtitle: 'Paperless Chain of Custody',
    image: epodImg,
    desc: 'Eliminates paper POD delays with instantaneous mobile biometric & digital signature capture, photo damage verification, and automated GST billing synchronization.',
    points: [
      'Touchscreen recipient signature capture & OTP verification',
      'High-resolution cargo photo inspection attachments',
      'Instant GST-compliant tax invoice generation',
      'Automated payment ledger sync upon successful handover'
    ]
  }
];

export default function Platform() {
  return (
    <div className="editorial-root">
      <PublicHeader />

      <main>
        {/* ── 1. EDITORIAL HERO ── */}
        <section className="editorial-page-hero">
          <div className="editorial-page-hero-media">
            <img
              src={techHeroImg}
              alt="PrimeRoute Logistics Control Center and GPS Telematics"
              className="editorial-page-hero-img"
            />
          </div>
          <div className="editorial-page-hero-overlay" />

          <div className="editorial-page-hero-container">
            <div className="editorial-page-hero-content">
              <div className="editorial-page-hero-label">
                OUR TECHNOLOGY
              </div>

              <h1 className="editorial-page-hero-title">
                REAL-TIME VISIBILITY.<br />
                <span className="blue-highlight">GREATER CONTROL.</span>
              </h1>

              <p className="editorial-page-hero-desc">
                Technology that connects customers, warehouses, drivers and shipments through one operational platform.
              </p>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <a
                  href="#live-flow"
                  className="editorial-btn-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('live-flow')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <span>EXPLORE TECHNOLOGY</span>
                  <ArrowRight size={15} />
                </a>
                <Link to="/register" className="editorial-btn-outline-light">
                  <span>LAUNCH PLATFORM</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. LIVE SYSTEM TELEMETRY VISUALIZER ── */}
        <section style={{ padding: '64px 0 32px', background: '#ffffff' }} id="live-flow">
          <div className="editorial-container">
            <div className="editorial-tech-route-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 0 4px rgba(74, 222, 128, 0.2)' }} />
                  <span style={{ fontFamily: 'var(--pr-font-display)', fontSize: '20px', letterSpacing: '0.04em', color: '#ffffff' }}>
                    LIVE CORRIDOR TELEMETRY • ACTIVE ROUTE SIMULATION
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '20px', fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  <span>STATUS: <strong style={{ color: '#38bdf8' }}>IN TRANSIT</strong></span>
                  <span>SPEED: <strong style={{ color: '#4ade80' }}>78 KM/H</strong></span>
                  <span>ETA: <strong style={{ color: '#ffffff' }}>06 OCT • 4:30 PM</strong></span>
                </div>
              </div>

              {/* Waypoint Flow */}
              <div className="editorial-tech-flow">
                <div className="editorial-tech-waypoint">
                  <span className="point-tag">01 ORIGIN</span>
                  <span className="point-name">BENGALURU</span>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>Consignment Dispatched</span>
                </div>

                <div style={{ color: '#38bdf8', fontSize: '18px' }}>→</div>

                <div className="editorial-tech-waypoint">
                  <span className="point-tag">02 HUB SORTING</span>
                  <span className="point-name">BENGALURU CENTRAL HUB</span>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>Gate-Out Verified</span>
                </div>

                <div style={{ color: '#38bdf8', fontSize: '18px' }}>→</div>

                <div className="editorial-tech-waypoint">
                  <span className="point-tag" style={{ color: '#4ade80' }}>● LIVE TELEMETRY</span>
                  <span className="point-name" style={{ color: '#38bdf8' }}>TRUCK IN TRANSIT (NH48)</span>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>Driver: Anand Verma • 24T Hauler</span>
                </div>

                <div style={{ color: '#38bdf8', fontSize: '18px' }}>→</div>

                <div className="editorial-tech-waypoint">
                  <span className="point-tag">04 DESTINATION</span>
                  <span className="point-name">KOLKATA DC</span>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>Scheduled Doorstep Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. TECHNOLOGY EDITORIAL FEATURES ── */}
        <div className="editorial-container">
          {TECH_FEATURES.map((tech, idx) => {
            const isEven = idx % 2 === 1;

            return (
              <section
                key={tech.num}
                className={`editorial-row-alternate ${isEven ? 'reverse' : ''}`}
              >
                {!isEven ? (
                  <>
                    <div className="editorial-row-img-col">
                      <img src={tech.image} alt={tech.title} className="editorial-row-img" />
                    </div>

                    <div>
                      <div className="editorial-giant-num">{tech.num}</div>
                      <div className="editorial-section-tag">
                        <Activity size={13} />
                        <span>{tech.subtitle}</span>
                      </div>
                      <h2 style={{ fontFamily: 'var(--pr-font-display)', fontSize: 'clamp(2.4rem, 4vw, 3.8rem)', color: '#070b14', textTransform: 'uppercase', margin: '0 0 16px', letterSpacing: '0.02em', lineHeight: 0.95 }}>
                        {tech.title}
                      </h2>
                      <p style={{ fontSize: '16px', color: '#475569', lineHeight: 1.6, margin: '0 0 20px' }}>
                        {tech.desc}
                      </p>

                      <div className="editorial-feature-checklist">
                        {tech.points.map((pt, pIdx) => (
                          <div key={pIdx} className="editorial-feature-check-item">
                            <CheckCircle2 size={18} color="#0284c7" />
                            <span>{pt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="editorial-giant-num">{tech.num}</div>
                      <div className="editorial-section-tag">
                        <Activity size={13} />
                        <span>{tech.subtitle}</span>
                      </div>
                      <h2 style={{ fontFamily: 'var(--pr-font-display)', fontSize: 'clamp(2.4rem, 4vw, 3.8rem)', color: '#070b14', textTransform: 'uppercase', margin: '0 0 16px', letterSpacing: '0.02em', lineHeight: 0.95 }}>
                        {tech.title}
                      </h2>
                      <p style={{ fontSize: '16px', color: '#475569', lineHeight: 1.6, margin: '0 0 20px' }}>
                        {tech.desc}
                      </p>

                      <div className="editorial-feature-checklist">
                        {tech.points.map((pt, pIdx) => (
                          <div key={pIdx} className="editorial-feature-check-item">
                            <CheckCircle2 size={18} color="#0284c7" />
                            <span>{pt}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="editorial-row-img-col">
                      <img src={tech.image} alt={tech.title} className="editorial-row-img" />
                    </div>
                  </>
                )}
              </section>
            );
          })}
        </div>

        {/* ── 4. TECHNOLOGY CTA ── */}
        <section className="editorial-final-cta">
          <img
            src={routingImg}
            alt="See Your Supply Chain in Motion"
            className="editorial-cta-backdrop"
          />
          <div className="editorial-cta-overlay" />

          <div className="editorial-cta-content">
            <div className="editorial-section-tag" style={{ color: '#38bdf8', borderColor: 'rgba(56,189,248,0.3)', margin: '0 auto 16px' }}>
              <Sparkles size={13} />
              <span>THE ENTERPRISE ADVANTAGE</span>
            </div>

            <h2 className="editorial-cta-headline">
              SEE YOUR SUPPLY CHAIN<br />IN MOTION.
            </h2>

            <p className="editorial-cta-sub">
              Experience end-to-end synchronized logistics software designed to scale with your enterprise volume.
            </p>

            <div className="editorial-cta-actions">
              <Link to="/register" className="editorial-btn-hero-primary">
                <span>EXPLORE THE PLATFORM</span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/signin" className="editorial-btn-hero-glass">
                <span>PORTAL SIGN IN</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
