import React from 'react';
import { Link } from 'react-router-dom';
import PublicHeader from '../components/public/PublicHeader';
import PublicFooter from '../components/public/PublicFooter';
import {
  ShieldCheck, CheckCircle2, ArrowRight,
  Building2, Users, Award, Globe, Truck, Warehouse,
  Clock, Navigation, Shield, Check, Phone, Mail
} from 'lucide-react';

import heroTruckImg from '../assets/hero_3d_truck.jpg';
import warehouseHubImg from '../assets/warehouse_3d_hub.jpg';
import controlTowerImg from '../assets/control_tower_3d_network.jpg';

export default function About() {
  return (
    <div className="pr-public-site">
      <PublicHeader />
      <main>
        {/* ========================================================
            1. HERO SECTION (LIGHT ENTERPRISE THEME)
            ======================================================== */}
        <section
          style={{
            padding: '48px 0 64px',
            background: 'linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%)',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <div className="pr-container">
            <div style={{ maxWidth: '800px' }}>
              <div className="pr-hero-badge-corporate" style={{ marginBottom: '16px' }}>
                <span className="pr-live-dot"></span>
                <span>ABOUT PRIMEROUTE LOGISTICS</span>
              </div>

              <h1
                style={{
                  fontSize: 'clamp(32px, 4.2vw, 48px)',
                  fontWeight: 800,
                  color: '#0f172a',
                  lineHeight: 1.18,
                  letterSpacing: '-0.02em',
                  margin: '0 0 16px',
                }}
              >
                Building India's Most Connected Freight & Logistics Network.
              </h1>

              <p
                style={{
                  fontSize: '17px',
                  color: '#475569',
                  lineHeight: 1.65,
                  margin: '0 0 28px',
                }}
              >
                PrimeRoute Logistics brings modern technology to commercial transportation. We connect industrial shippers, cross-dock terminal hubs, long-haul highway carriers, and last-mile dispatchers into one synchronized, high-velocity logistics operating system.
              </p>

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <Link to="/contact" className="pr-btn-primary" style={{ padding: '12px 26px', fontSize: '14.5px' }}>
                  <span>Partner With PrimeRoute</span>
                  <ArrowRight size={15} />
                </Link>
                <Link
                  to="/platform"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#1e293b',
                    fontWeight: 600,
                    fontSize: '14.5px',
                    textDecoration: 'none',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  <span>Explore Our Technology</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            2. KEY OPERATIONAL METRICS
            ======================================================== */}
        <section style={{ padding: '48px 0', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
          <div className="pr-container">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '24px',
              }}
            >
              <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#2563eb', margin: '0 0 4px' }}>42+</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>Regional Warehouse Hubs</div>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Strategic cross-dock terminals across major industrial belts.</p>
              </div>

              <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>18+</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>Express Highway Corridors</div>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Daily scheduled FTL and LTL linehaul dispatches.</p>
              </div>

              <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#059669', margin: '0 0 4px' }}>99.4%</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>On-Time SLA Delivery</div>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Live telematics tracking and dynamic waypoint rerouting.</p>
              </div>

              <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#7c3aed', margin: '0 0 4px' }}>100%</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>Digital ePOD & E-Way Bill</div>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Automated paperless GST tax billing and electronic signatures.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            3. COMPANY MISSION & CORE OPERATIONAL VALUES
            ======================================================== */}
        <section style={{ padding: '80px 0', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div className="pr-container">
            <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 52px' }}>
              <div className="pr-section-tag" style={{ margin: '0 auto 10px' }}>
                <span>Core Operating Principles</span>
              </div>
              <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 12px' }}>
                Engineered for Commercial Reliability
              </h2>
              <p style={{ fontSize: '16px', color: '#64748b', margin: 0 }}>
                Every consignment, vehicle, driver, and terminal runs under strict standard operating procedures backed by software automation.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '28px',
              }}
            >
              <div style={{ background: '#ffffff', padding: '32px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <Navigation size={24} />
                </div>
                <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>Complete Transit Transparency</h3>
                <p style={{ fontSize: '14.5px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                  Shippers and enterprise customers never wonder where their freight is. Real-time GPS pings, estimated arrival times, and milestone alerts ensure 100% transparency.
                </p>
              </div>

              <div style={{ background: '#ffffff', padding: '32px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <ShieldCheck size={24} />
                </div>
                <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>Cargo Integrity & Safety</h3>
                <p style={{ fontSize: '14.5px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                  Tamper-evident digital sealing, verified weighbridge records, trained commercial drivers, and round-the-clock control tower tracking safeguard high-value goods.
                </p>
              </div>

              <div style={{ background: '#ffffff', padding: '32px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <Clock size={24} />
                </div>
                <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>Predictable Corridor Velocity</h3>
                <p style={{ fontSize: '14.5px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                  Optimized highway routing, dedicated lane departures, and automated FASTag clearance prevent congestion delays and preserve strict customer SLAs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            4. CORRIDOR NETWORK & INFRASTRUCTURE
            ======================================================== */}
        <section style={{ padding: '80px 0', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
          <div className="pr-container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '48px', alignItems: 'center' }}>
              <div>
                <div className="pr-section-tag" style={{ marginBottom: '12px' }}>
                  <span>Infrastructure & Reach</span>
                </div>
                <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 16px' }}>
                  Nationwide Express Freight Corridors
                </h2>
                <p style={{ fontSize: '15.5px', color: '#475569', lineHeight: 1.65, margin: '0 0 24px' }}>
                  PrimeRoute operates heavy freight lanes interconnecting critical industrial corridors:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
                  <div style={{ padding: '14px 18px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14.5px' }}>Golden Quadrilateral & Western Corridor</div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Bengaluru – Pune – Mumbai – Ahmedabad – Delhi NCR</div>
                  </div>
                  <div style={{ padding: '14px 18px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14.5px' }}>Southern Industrial Triangle</div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Chennai – Bengaluru – Hyderabad – Coimbatore</div>
                  </div>
                  <div style={{ padding: '14px 18px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14.5px' }}>Eastern Mineral & Manufacturing Belt</div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Kolkata – Jamshedpur – Bhubaneswar – Visakhapatnam</div>
                  </div>
                </div>

                <Link to="/solutions" className="pr-btn-primary" style={{ display: 'inline-flex', padding: '11px 24px', fontSize: '14px' }}>
                  <span>Explore Solutions</span>
                  <ArrowRight size={15} />
                </Link>
              </div>

              <div>
                <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }}>
                  <img src={controlTowerImg} alt="Corridor Network" style={{ width: '100%', height: '380px', objectFit: 'cover', display: 'block' }} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
