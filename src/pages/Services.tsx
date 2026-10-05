import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PublicHeader from '../components/public/PublicHeader';
import PublicFooter from '../components/public/PublicFooter';
import {
  Truck, Warehouse, Radio, CheckCircle2, ArrowRight,
  ShieldCheck, Clock, Navigation, MapPin, Package, Layers,
  ReceiptText, BarChart3, ChevronRight, Phone, Shield, Check
} from 'lucide-react';

import roadFreightImg from '../assets/corporate_road_freight.jpg';
import cargoWarehouseImg from '../assets/cargo_warehouse_terminal.jpg';
import warehouseHubImg from '../assets/warehouse_3d_hub.jpg';
import lastmileDeliveryImg from '../assets/lastmile_3d_delivery.jpg';

export default function Services() {
  const location = useLocation();

  // Support smooth scrolling to anchor hash if present
  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

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
            <div style={{ maxWidth: '780px' }}>
              <div className="pr-hero-badge-corporate" style={{ marginBottom: '16px' }}>
                <span className="pr-live-dot"></span>
                <span>COMMERCIAL LOGISTICS PORTFOLIO</span>
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
                End-to-End Transportation & Freight Services.
              </h1>

              <p
                style={{
                  fontSize: '17px',
                  color: '#475569',
                  lineHeight: 1.65,
                  margin: '0 0 28px',
                }}
              >
                From nationwide full truckload linehauls and automated warehouse hubs to connected fleet telematics and precision last-mile delivery, PrimeRoute provides reliable, scalable logistics services tailored for high-growth enterprises.
              </p>

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <a
                  href="#road-freight"
                  className="pr-btn-primary"
                  style={{ padding: '12px 26px', fontSize: '14.5px' }}
                >
                  <span>Explore Road Freight</span>
                  <ArrowRight size={15} />
                </a>
                <Link
                  to="/contact"
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
                  <span>Request Custom Quote</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Anchor Jump Bar */}
        <section style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '14px 0' }}>
          <div className="pr-container">
            <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
              <a href="#road-freight" style={{ color: '#2563eb', fontWeight: 600, fontSize: '14px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                1. Road Freight & Linehaul
              </a>
              <span style={{ color: '#cbd5e1' }}>•</span>
              <a href="#warehouse" style={{ color: '#475569', fontWeight: 600, fontSize: '14px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                2. Warehouse Hub Operations
              </a>
              <span style={{ color: '#cbd5e1' }}>•</span>
              <a href="#telematics" style={{ color: '#475569', fontWeight: 600, fontSize: '14px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                3. Fleet & Driver Telematics
              </a>
              <span style={{ color: '#cbd5e1' }}>•</span>
              <a href="#last-mile" style={{ color: '#475569', fontWeight: 600, fontSize: '14px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                4. Last-Mile Delivery
              </a>
            </div>
          </div>
        </section>

        {/* ========================================================
            2. SERVICE 1: ROAD FREIGHT & LINEHAUL
            ======================================================== */}
        <section id="road-freight" style={{ padding: '80px 0', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div className="pr-container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '48px', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '4px 10px', borderRadius: '4px', textTransform: 'uppercase', marginBottom: '12px' }}>
                  <Truck size={14} />
                  <span>LINEHAUL CORRIDORS</span>
                </div>
                <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 16px' }}>
                  Road Freight (FTL & LTL Linehaul)
                </h2>
                <p style={{ fontSize: '15.5px', color: '#475569', lineHeight: 1.65, margin: '0 0 20px' }}>
                  Nationwide full truckload (FTL) and less-than-truckload (LTL) scheduled runs across high-density national highway corridors. Guaranteed departure windows, verified security seals, and continuous transit monitoring.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={18} color="#2563eb" />
                    <span style={{ fontSize: '14.5px', color: '#1e293b', fontWeight: 500 }}>High-Capacity Multi-Axle Trailers & Dry Vans (18T - 40T)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={18} color="#2563eb" />
                    <span style={{ fontSize: '14.5px', color: '#1e293b', fontWeight: 500 }}>Corridor Express Toll Sync & FASTag Automated Clearance</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={18} color="#2563eb" />
                    <span style={{ fontSize: '14.5px', color: '#1e293b', fontWeight: 500 }}>Real-time GPS Tracking & Speed Telematics Monitoring</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={18} color="#2563eb" />
                    <span style={{ fontSize: '14.5px', color: '#1e293b', fontWeight: 500 }}>GST E-Way Bill & Digital Bill of Lading Integration</span>
                  </div>
                </div>

                <Link to="/tracking" className="pr-btn-primary" style={{ display: 'inline-flex', padding: '11px 22px', fontSize: '14px' }}>
                  <span>Track Active Consignment</span>
                  <ArrowRight size={15} />
                </Link>
              </div>

              <div>
                <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)' }}>
                  <img src={roadFreightImg} alt="Road Freight" style={{ width: '100%', height: '360px', objectFit: 'cover', display: 'block' }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            3. SERVICE 2: WAREHOUSE OPERATIONS
            ======================================================== */}
        <section id="warehouse" style={{ padding: '80px 0', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
          <div className="pr-container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '48px', alignItems: 'center' }}>
              <div style={{ order: 2 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '4px 10px', borderRadius: '4px', textTransform: 'uppercase', marginBottom: '12px' }}>
                  <Warehouse size={14} />
                  <span>HUB LOGISTICS</span>
                </div>
                <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 16px' }}>
                  Warehouse & Terminal Hub Operations
                </h2>
                <p style={{ fontSize: '15.5px', color: '#475569', lineHeight: 1.65, margin: '0 0 20px' }}>
                  Strategic cross-docking facilities, staging bays, and automated inventory classification. Monitor pallet capacity, minimum safety thresholds, and incoming/outgoing dispatch schedules with zero paperwork friction.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={18} color="#059669" />
                    <span style={{ fontSize: '14.5px', color: '#1e293b', fontWeight: 500 }}>Multi-Hub Inventory Tracking & Zone Allocation (Bay 1A - 8F)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={18} color="#059669" />
                    <span style={{ fontSize: '14.5px', color: '#1e293b', fontWeight: 500 }}>Automated Low Stock & Buffer Capacity Alert Triggers</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={18} color="#059669" />
                    <span style={{ fontSize: '14.5px', color: '#1e293b', fontWeight: 500 }}>Cross-Dock Turnaround SLA Under 4 Hours</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={18} color="#059669" />
                    <span style={{ fontSize: '14.5px', color: '#1e293b', fontWeight: 500 }}>Dedicated Warehouse Manager Workstations & Role Portals</span>
                  </div>
                </div>

                <Link to="/portals" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 22px', borderRadius: '8px', background: '#059669', color: '#ffffff', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
                  <span>Explore Warehouse System</span>
                  <ArrowRight size={15} />
                </Link>
              </div>

              <div style={{ order: 1 }}>
                <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)' }}>
                  <img src={cargoWarehouseImg} alt="Warehouse Operations" style={{ width: '100%', height: '360px', objectFit: 'cover', display: 'block' }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            4. SERVICE 3: FLEET & DRIVER TELEMATICS
            ======================================================== */}
        <section id="telematics" style={{ padding: '80px 0', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div className="pr-container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '48px', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#7c3aed', background: '#f5f3ff', padding: '4px 10px', borderRadius: '4px', textTransform: 'uppercase', marginBottom: '12px' }}>
                  <Radio size={14} />
                  <span>CONNECTED ASSETS</span>
                </div>
                <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 16px' }}>
                  Fleet Management & Telematics
                </h2>
                <p style={{ fontSize: '15.5px', color: '#475569', lineHeight: 1.65, margin: '0 0 20px' }}>
                  Full lifecycle visibility across your commercial vehicular assets. Monitor driver duty logs (HOS), fuel efficiency benchmarks, speed thresholds, and proactive maintenance alerts from a synchronized command center.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={18} color="#7c3aed" />
                    <span style={{ fontSize: '14.5px', color: '#1e293b', fontWeight: 500 }}>Live Driver Status, Waypoint Telemetry & Idle Time Alerts</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={18} color="#7c3aed" />
                    <span style={{ fontSize: '14.5px', color: '#1e293b', fontWeight: 500 }}>Commercial Fleet Vehicle Health & Service Scheduling</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={18} color="#7c3aed" />
                    <span style={{ fontSize: '14.5px', color: '#1e293b', fontWeight: 500 }}>Driver Smartphone App with Turn-by-Turn GPS Navigation</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={18} color="#7c3aed" />
                    <span style={{ fontSize: '14.5px', color: '#1e293b', fontWeight: 500 }}>Odometer, Fuel Efficiency & Insurance Compliance Audit</span>
                  </div>
                </div>

                <Link to="/platform" className="pr-btn-primary" style={{ display: 'inline-flex', padding: '11px 22px', fontSize: '14px' }}>
                  <span>View Telematics Platform</span>
                  <ArrowRight size={15} />
                </Link>
              </div>

              <div>
                <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)' }}>
                  <img src={warehouseHubImg} alt="Fleet Telematics" style={{ width: '100%', height: '360px', objectFit: 'cover', display: 'block' }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            5. SERVICE 4: LAST-MILE DISTRIBUTION
            ======================================================== */}
        <section id="last-mile" style={{ padding: '80px 0', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
          <div className="pr-container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '48px', alignItems: 'center' }}>
              <div style={{ order: 2 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#d97706', background: '#fffbeb', padding: '4px 10px', borderRadius: '4px', textTransform: 'uppercase', marginBottom: '12px' }}>
                  <Package size={14} />
                  <span>PRECISION DELIVERY</span>
                </div>
                <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 16px' }}>
                  Last-Mile Distribution & ePOD Handover
                </h2>
                <p style={{ fontSize: '15.5px', color: '#475569', lineHeight: 1.65, margin: '0 0 20px' }}>
                  Guaranteed final destination delivery with recipient verification, electronic Proof of Delivery (ePOD), customer OTP validation, and immediate automated GST tax invoice settlement.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={18} color="#d97706" />
                    <span style={{ fontSize: '14.5px', color: '#1e293b', fontWeight: 500 }}>Secure Recipient Handover with 6-Digit Verification OTP</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={18} color="#d97706" />
                    <span style={{ fontSize: '14.5px', color: '#1e293b', fontWeight: 500 }}>Digital Signature Capture & Geotagged Proof-of-Delivery</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={18} color="#d97706" />
                    <span style={{ fontSize: '14.5px', color: '#1e293b', fontWeight: 500 }}>Instant PDF GST Invoice Generation & Email Dispatch</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={18} color="#d97706" />
                    <span style={{ fontSize: '14.5px', color: '#1e293b', fontWeight: 500 }}>99.2% First-Attempt Delivery Success SLA</span>
                  </div>
                </div>

                <Link to="/contact" className="pr-btn-primary" style={{ display: 'inline-flex', padding: '11px 22px', fontSize: '14px' }}>
                  <span>Book Consignment Service</span>
                  <ArrowRight size={15} />
                </Link>
              </div>

              <div style={{ order: 1 }}>
                <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)' }}>
                  <img src={lastmileDeliveryImg} alt="Last Mile Delivery" style={{ width: '100%', height: '360px', objectFit: 'cover', display: 'block' }} />
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
