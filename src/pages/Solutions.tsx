import React from 'react';
import { Link } from 'react-router-dom';
import PublicHeader from '../components/public/PublicHeader';
import PublicFooter from '../components/public/PublicFooter';
import {
  ArrowRight,
  Truck,
  Warehouse,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Compass,
  Radio,
  Layers,
  Sparkles
} from 'lucide-react';

import roadFreightImg from '../assets/corporate_road_freight.jpg';
import cargoWarehouseImg from '../assets/cargo_warehouse_terminal.jpg';
import fleetImg from '../assets/hero_real_highway_truck.jpg';
import trackingImg from '../assets/hero_real_intermodal_cargo.jpg';
import heroBannerImg from '../assets/hero_real_primeroute_hub.jpg';

export default function Solutions() {
  return (
    <div className="editorial-root">
      <PublicHeader />

      <main>
        {/* ── 1. EDITORIAL HERO ── */}
        <section className="editorial-page-hero">
          <div className="editorial-page-hero-media">
            <img
              src={roadFreightImg}
              alt="PrimeRoute Logistics Moving Freight Truck"
              className="editorial-page-hero-img"
            />
          </div>
          <div className="editorial-page-hero-overlay" />

          <div className="editorial-page-hero-container">
            <div className="editorial-page-hero-content">
              <div className="editorial-page-hero-label">
                OUR SOLUTIONS
              </div>

              <h1 className="editorial-page-hero-title">
                BUILT FOR<br />
                <span className="blue-highlight">EVERY MOVE.</span>
              </h1>

              <p className="editorial-page-hero-desc">
                End-to-end logistics solutions designed to keep your supply chain moving with complete visibility and control.
              </p>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <a
                  href="#transportation"
                  className="editorial-btn-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('transportation')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <span>EXPLORE SOLUTIONS</span>
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

        {/* ── 2. SOLUTIONS CONTENT (ALTERNATING EDITORIAL SECTIONS) ── */}
        <div className="editorial-container">
          {/* SECTION 01: TRANSPORTATION MANAGEMENT (Image Left, Text Right) */}
          <section className="editorial-row-alternate" id="transportation">
            <div className="editorial-row-img-col">
              <img
                src={roadFreightImg}
                alt="Transportation Management"
                className="editorial-row-img"
              />
            </div>

            <div>
              <div className="editorial-giant-num">01</div>
              <div className="editorial-section-tag">
                <Truck size={13} />
                <span>LINEHAUL CORRIDORS</span>
              </div>
              <h2 style={{ fontFamily: 'var(--pr-font-display)', fontSize: 'clamp(2.4rem, 4vw, 3.8rem)', color: '#070b14', textTransform: 'uppercase', margin: '0 0 16px', letterSpacing: '0.02em', lineHeight: 0.95 }}>
                TRANSPORTATION<br />MANAGEMENT
              </h2>
              <p style={{ fontSize: '16px', color: '#475569', lineHeight: 1.6, margin: '0 0 20px' }}>
                Plan, execute and optimize your freight movement with complete operational visibility. Full-truckload (FTL) and scheduled linehaul line coordination across national commercial corridors.
              </p>

              <div className="editorial-feature-checklist">
                <div className="editorial-feature-check-item">
                  <CheckCircle2 size={18} color="#0284c7" />
                  <span>Dynamic highway route planning & toll estimation</span>
                </div>
                <div className="editorial-feature-check-item">
                  <CheckCircle2 size={18} color="#0284c7" />
                  <span>Automated digital Bill of Lading & consignment manifests</span>
                </div>
                <div className="editorial-feature-check-item">
                  <CheckCircle2 size={18} color="#0284c7" />
                  <span>Real-time GPS telematics & speed monitoring</span>
                </div>
                <div className="editorial-feature-check-item">
                  <CheckCircle2 size={18} color="#0284c7" />
                  <span>Continuous milestone logging & exception alerts</span>
                </div>
              </div>

              <Link to="/contact" className="editorial-btn-primary">
                <span>EXPLORE TRANSPORTATION</span>
                <ArrowRight size={14} className="btn-arrow" />
              </Link>
            </div>
          </section>

          {/* SECTION 02: WAREHOUSE OPERATIONS (Text Left, Image Right) */}
          <section className="editorial-row-alternate reverse" id="warehouse">
            <div>
              <div className="editorial-giant-num">02</div>
              <div className="editorial-section-tag">
                <Warehouse size={13} />
                <span>HUB FULFILLMENT</span>
              </div>
              <h2 style={{ fontFamily: 'var(--pr-font-display)', fontSize: 'clamp(2.4rem, 4vw, 3.8rem)', color: '#070b14', textTransform: 'uppercase', margin: '0 0 16px', letterSpacing: '0.02em', lineHeight: 0.95 }}>
                WAREHOUSE<br />OPERATIONS
              </h2>
              <p style={{ fontSize: '16px', color: '#475569', lineHeight: 1.6, margin: '0 0 20px' }}>
                Manage inventory, receiving, processing and dispatch through one connected workflow. Eliminate bottlenecks at dock staging bays and maintain total inventory accuracy.
              </p>

              <div className="editorial-feature-checklist">
                <div className="editorial-feature-check-item">
                  <CheckCircle2 size={18} color="#0284c7" />
                  <span>Multi-location bin tracking & dynamic slotting</span>
                </div>
                <div className="editorial-feature-check-item">
                  <CheckCircle2 size={18} color="#0284c7" />
                  <span>Automated inbound receiving & barcode verification</span>
                </div>
                <div className="editorial-feature-check-item">
                  <CheckCircle2 size={18} color="#0284c7" />
                  <span>Safety stock threshold alerts & replenishment schedules</span>
                </div>
                <div className="editorial-feature-check-item">
                  <CheckCircle2 size={18} color="#0284c7" />
                  <span>Cross-dock staging & gate-out dispatch manifest generation</span>
                </div>
              </div>

              <Link to="/signin/warehouse" className="editorial-btn-primary">
                <span>EXPLORE WAREHOUSE</span>
                <ArrowRight size={14} className="btn-arrow" />
              </Link>
            </div>

            <div className="editorial-row-img-col">
              <img
                src={cargoWarehouseImg}
                alt="Warehouse Operations"
                className="editorial-row-img"
              />
            </div>
          </section>

          {/* SECTION 03: FLEET MANAGEMENT (Image Left, Text Right) */}
          <section className="editorial-row-alternate" id="fleet">
            <div className="editorial-row-img-col">
              <img
                src={fleetImg}
                alt="Fleet Management"
                className="editorial-row-img"
              />
            </div>

            <div>
              <div className="editorial-giant-num">03</div>
              <div className="editorial-section-tag">
                <Navigation size={13} />
                <span>ASSET COMMAND</span>
              </div>
              <h2 style={{ fontFamily: 'var(--pr-font-display)', fontSize: 'clamp(2.4rem, 4vw, 3.8rem)', color: '#070b14', textTransform: 'uppercase', margin: '0 0 16px', letterSpacing: '0.02em', lineHeight: 0.95 }}>
                FLEET<br />MANAGEMENT
              </h2>
              <p style={{ fontSize: '16px', color: '#475569', lineHeight: 1.6, margin: '0 0 20px' }}>
                Manage vehicles, drivers and delivery performance from a connected fleet platform. Increase asset utilization, lower fuel overhead, and ensure driver safety compliance.
              </p>

              <div className="editorial-feature-checklist">
                <div className="editorial-feature-check-item">
                  <CheckCircle2 size={18} color="#0284c7" />
                  <span>Commercial vehicle rosters & preventative maintenance logs</span>
                </div>
                <div className="editorial-feature-check-item">
                  <CheckCircle2 size={18} color="#0284c7" />
                  <span>Driver assignment & Hours of Service (HOS) monitoring</span>
                </div>
                <div className="editorial-feature-check-item">
                  <CheckCircle2 size={18} color="#0284c7" />
                  <span>Fuel consumption benchmarking & telemetry telemetry</span>
                </div>
                <div className="editorial-feature-check-item">
                  <CheckCircle2 size={18} color="#0284c7" />
                  <span>Instant driver dispatch & turn-by-turn mobile app sync</span>
                </div>
              </div>

              <Link to="/signin/driver" className="editorial-btn-primary">
                <span>EXPLORE FLEET</span>
                <ArrowRight size={14} className="btn-arrow" />
              </Link>
            </div>
          </section>

          {/* SECTION 04: SHIPMENT TRACKING (Text Left, Image Right, Light/White Layout) */}
          <section className="editorial-row-alternate reverse" id="tracking-solution">
            <div>
              <div className="editorial-giant-num">04</div>
              <div className="editorial-section-tag">
                <Radio size={13} />
                <span>REAL-TIME TELEMETRICS</span>
              </div>
              <h2 style={{ fontFamily: 'var(--pr-font-display)', fontSize: 'clamp(2.4rem, 4vw, 3.8rem)', color: '#070b14', textTransform: 'uppercase', margin: '0 0 16px', letterSpacing: '0.02em', lineHeight: 0.95 }}>
                SHIPMENT<br />TRACKING
              </h2>
              <p style={{ fontSize: '16px', color: '#475569', lineHeight: 1.6, margin: '0 0 20px' }}>
                Give customers and control tower dispatchers end-to-end real-time visibility from initial warehouse pickup to final verified doorstep delivery.
              </p>

              <div className="editorial-feature-checklist">
                <div className="editorial-feature-check-item">
                  <CheckCircle2 size={18} color="#0284c7" />
                  <span>Live GPS waypoint checkpoints & interactive routing</span>
                </div>
                <div className="editorial-feature-check-item">
                  <CheckCircle2 size={18} color="#0284c7" />
                  <span>Predictive arrival estimates (ETA) with traffic compensation</span>
                </div>
                <div className="editorial-feature-check-item">
                  <CheckCircle2 size={18} color="#0284c7" />
                  <span>Instant electronic Proof of Delivery (ePOD) with customer signatures</span>
                </div>
                <div className="editorial-feature-check-item">
                  <CheckCircle2 size={18} color="#0284c7" />
                  <span>Automated customer SMS & email status updates</span>
                </div>
              </div>

              <Link to="/tracking" className="editorial-btn-primary">
                <span>TRACK A SHIPMENT</span>
                <ArrowRight size={14} className="btn-arrow" />
              </Link>
            </div>

            <div className="editorial-row-img-col">
              <img
                src={trackingImg}
                alt="Shipment Tracking Telematics"
                className="editorial-row-img"
              />
            </div>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
