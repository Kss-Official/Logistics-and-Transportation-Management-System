import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PublicHeader from '../components/public/PublicHeader';
import PublicFooter from '../components/public/PublicFooter';
import {
  Package, Truck, Warehouse, Route, ShieldCheck, CheckCircle2,
  ArrowRight, Users, Send, Clock, Navigation, MapPin,
  ChevronRight, Building2, Check, ArrowDown, Radio, Activity,
  ReceiptText, BarChart3, Shield, CheckCircle, FileText, Phone, Mail,
  Calendar, Layers, Sparkles, Gauge, Fuel, Thermometer
} from 'lucide-react';

import roadFreightImg from '../assets/corporate_road_freight.jpg';
import cargoWarehouseImg from '../assets/cargo_warehouse_terminal.jpg';
import heroTruckImg from '../assets/hero_3d_truck.jpg';
import warehouseHubImg from '../assets/warehouse_3d_hub.jpg';
import lastmileDeliveryImg from '../assets/lastmile_3d_delivery.jpg';
import controlTowerImg from '../assets/control_tower_3d_network.jpg';

const workflowNodes = [
  {
    id: 1,
    name: 'ORDER',
    title: '01. Order Booking & Verification',
    desc: 'Customer books consignment with volumetric rating, tax computation, and digital invoice booking.',
    icon: Package,
    meta: 'ORD-58241 • Rate locked • System verified',
  },
  {
    id: 2,
    name: 'PICKUP',
    title: '02. Origin Feeder Pickup',
    desc: 'First-mile carrier collects cargo from manufacturer dock with digital barcode handover verification.',
    icon: Truck,
    meta: 'Pilot Assigned • Feeder Van KA-01-MJ-9921',
  },
  {
    id: 3,
    name: 'WAREHOUSE',
    title: '03. Hub Staging & Sorting',
    desc: 'Consignment staged at regional terminal (WH-BLR-01 Bay 4A) for linehaul consolidation.',
    icon: Warehouse,
    meta: 'Dock Staged • 24 Pallets Verified • Weighbridge OK',
  },
  {
    id: 4,
    name: 'DISPATCH',
    title: '04. Gate-Out Verification',
    desc: 'Electronic seal checked, digital Bill of Lading (BOL) issued, and driver clears security toll gate.',
    icon: Clock,
    meta: 'Seal #PR-98421 • Fastag Toll cleared',
  },
  {
    id: 5,
    name: 'TRANSIT',
    title: '05. Highway Linehaul Transit',
    desc: 'Long-haul freight moves along national expressways with active GPS waypoint and speed telemetry.',
    icon: Navigation,
    meta: 'Corridor NH48 • Speed 62 km/h • GPS Active',
  },
  {
    id: 6,
    name: 'DELIVERY',
    title: '06. Doorstep Handover & ePOD',
    desc: 'Final destination delivery with customer OTP verification, digital signature, and automated billing sync.',
    icon: CheckCircle2,
    meta: 'Delivered • ePOD Synced • Invoice Cleared',
  },
];

export default function Solutions() {
  const [selectedWorkflowStep, setSelectedWorkflowStep] = useState(workflowNodes[0]);

  // Request Quote Form State
  const [quoteData, setQuoteData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    origin: '',
    destination: '',
    cargoType: 'Industrial Freight',
    weight: '',
    serviceType: 'Road Freight (FTL)',
    message: '',
  });
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quoteData.companyName && quoteData.email && quoteData.origin && quoteData.destination) {
      setQuoteSubmitted(true);
    }
  };

  return (
    <div className="pr-public-site">
      <PublicHeader />
      <main>
        {/* ========================================================
            1. SOLUTIONS HERO SECTION (REALISTIC LOGISTICS PHOTOGRAPHY)
            ======================================================== */}
        <section
          className="pr-corporate-hero"
          style={{
            backgroundImage: `url(${cargoWarehouseImg})`,
            padding: '76px 0 88px',
          }}
        >
          <div className="pr-corporate-hero-overlay"></div>

          <div className="pr-container">
            <div className="pr-corporate-hero-content" style={{ maxWidth: '720px' }}>
              <div className="pr-hero-badge-corporate">
                <span className="pr-live-dot"></span>
                <span>LOGISTICS SOLUTIONS</span>
              </div>

              <h1 className="pr-corporate-hero-title">
                Everything You Need to Move Goods Efficiently.
              </h1>

              <p className="pr-corporate-hero-lead">
                From order creation to final delivery, PrimeRoute helps businesses coordinate every stage of their transportation operations through reliable linehaul, warehouse orchestration, and real-time telematics.
              </p>

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '24px' }}>
                <a
                  href="#services"
                  className="pr-btn-primary"
                  style={{ padding: '13px 28px', fontSize: '15px' }}
                >
                  <span>Explore Our Solutions</span>
                  <ArrowRight size={16} />
                </a>

                <a
                  href="#quote"
                  className="pr-btn-dark-secondary"
                  style={{ padding: '13px 24px', fontSize: '15px' }}
                >
                  <span>Request a Quote</span>
                </a>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  fontSize: '13px',
                  color: '#cbd5e1',
                  flexWrap: 'wrap',
                  borderTop: '1px solid rgba(255,255,255,0.15)',
                  paddingTop: '16px',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} color="#10b981" /> Full Truckload (FTL) & Part Load (LTL)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} color="#60a5fa" /> Insured Highway Corridors
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} color="#10b981" /> 24/7 Dispatch Control
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            2. EDITORIAL COMPLETE LOGISTICS SOLUTIONS (VARIED LAYOUTS)
            ======================================================== */}
        <section id="services" style={{ padding: '84px 0', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
          <div className="pr-container">
            <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 60px' }}>
              <div className="pr-section-tag" style={{ margin: '0 auto 10px' }}>
                <span>Enterprise Service Capabilities</span>
              </div>
              <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 12px' }}>
                Complete Logistics Solutions
              </h2>
              <p style={{ fontSize: '16px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>
                Modular, high-performance transportation capabilities engineered for freight forwarders, manufacturers, and nationwide commercial distributors.
              </p>
            </div>

            {/* ── ROW 1: Large Image + Order Management Dashboard Preview ── */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                gap: '40px',
                alignItems: 'center',
                padding: '40px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                marginBottom: '48px',
              }}
            >
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2563eb', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px' }}>
                  <Package size={16} /> Commercial Intake & Rating
                </div>
                <h3 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: '0 0 14px' }}>
                  Order Management
                </h3>
                <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6, margin: '0 0 20px' }}>
                  Streamline the journey from client purchase order to verified shipment consignment. Calculate volumetric weight, assign priority SLA tiers, and issue automated Bill of Lading (BOL) documents with zero manual errors.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#1e293b', fontWeight: 600 }}>
                    <CheckCircle2 size={16} color="#16a34a" /> Automated GST tax and rate breakdown calculation
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#1e293b', fontWeight: 600 }}>
                    <CheckCircle2 size={16} color="#16a34a" /> Single-click consignment barcode label printing
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#1e293b', fontWeight: 600 }}>
                    <CheckCircle2 size={16} color="#16a34a" /> Multi-parcel consolidation and weight threshold matching
                  </div>
                </div>

                <a href="#quote" className="pr-btn-primary" style={{ padding: '10px 22px', fontSize: '14px', textDecoration: 'none', display: 'inline-flex' }}>
                  <span>Book Freight Order</span>
                  <ArrowRight size={15} />
                </a>
              </div>

              {/* Realistic Order Management UI Preview */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
                }}
              >
                <div style={{ padding: '14px 18px', background: '#0f172a', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Package size={16} color="#60a5fa" />
                    <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'monospace' }}>ORD-58241</span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, background: '#16a34a', color: '#ffffff', padding: '2px 8px', borderRadius: '4px' }}>
                    CONFIRMED
                  </span>
                </div>

                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Customer</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>ABC Manufacturing Ltd</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Service Tier</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#2563eb', marginTop: '2px' }}>Express Linehaul (FTL)</div>
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                      <span>Origin: Bengaluru Terminal Hub</span>
                      <span>➔</span>
                      <span>Dest: Mumbai Port DC</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      <span>Weight: 3,450 kg (24 Pallets)</span>
                      <span>Scheduled: 05 Sep 2026</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '12px', fontSize: '12.5px' }}>
                    <span style={{ color: '#64748b' }}>Consignment Barcode: <strong>BC-78921-IN</strong></span>
                    <span style={{ color: '#16a34a', fontWeight: 700 }}>Verified & Staged</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── ROW 2: Shipment Management (Split Content + Live Route Visual) ── */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                gap: '40px',
                alignItems: 'center',
                padding: '40px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
                marginBottom: '48px',
              }}
            >
              {/* Left: Shipment Visual Map Panel */}
              <div
                style={{
                  background: '#0f172a',
                  color: '#ffffff',
                  borderRadius: '10px',
                  padding: '24px',
                  border: '1px solid #1e293b',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Send size={16} color="#60a5fa" />
                    <span style={{ fontSize: '14px', fontWeight: 800, fontFamily: 'monospace' }}>TRK-2026-00126</span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#93c5fd', background: 'rgba(37, 99, 235, 0.3)', padding: '2px 8px', borderRadius: '4px' }}>
                    IN TRANSIT
                  </span>
                </div>

                <div style={{ background: '#1e293b', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#cbd5e1', marginBottom: '8px' }}>
                    <span>Bengaluru Hub (WH-03)</span>
                    <span>Mumbai Port Terminal</span>
                  </div>
                  <div style={{ height: '6px', background: '#334155', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '68%', background: '#2563eb', borderRadius: '3px' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#94a3b8', marginTop: '6px' }}>
                    <span>Passed: Pune Toll Relay</span>
                    <span style={{ color: '#60a5fa', fontWeight: 700 }}>ETA: 05 Sep 2026, 16:30</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center', fontSize: '12px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '6px' }}>
                    <div style={{ color: '#94a3b8', fontSize: '10.5px' }}>Pilot</div>
                    <div style={{ fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>Anand Verma</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '6px' }}>
                    <div style={{ color: '#94a3b8', fontSize: '10.5px' }}>Vehicle</div>
                    <div style={{ fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>PR-VH-1042</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '6px' }}>
                    <div style={{ color: '#94a3b8', fontSize: '10.5px' }}>Speed</div>
                    <div style={{ fontWeight: 700, color: '#10b981', marginTop: '2px' }}>62 km/h</div>
                  </div>
                </div>
              </div>

              {/* Right: Content */}
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2563eb', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px' }}>
                  <Truck size={16} /> Linehaul Execution & Milestones
                </div>
                <h3 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: '0 0 14px' }}>
                  Shipment Management
                </h3>
                <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6, margin: '0 0 20px' }}>
                  Gain end-to-end operational visibility with instant tracking ID generation, digital waypoint logging, and proactive delay mitigation across state border crossings.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#1e293b', fontWeight: 600 }}>
                    <CheckCircle2 size={16} color="#16a34a" /> Live GPS telematics and automatic geofence alerts
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#1e293b', fontWeight: 600 }}>
                    <CheckCircle2 size={16} color="#16a34a" /> Timestamped milestone proof from dispatch to dock delivery
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#1e293b', fontWeight: 600 }}>
                    <CheckCircle2 size={16} color="#16a34a" /> Direct driver telematics link and SOS exception resolution
                  </div>
                </div>

                <Link to="/tracking" className="pr-btn-secondary" style={{ padding: '10px 22px', fontSize: '14px', textDecoration: 'none', display: 'inline-flex' }}>
                  <span>Open Tracking Console</span>
                  <ChevronRight size={15} />
                </Link>
              </div>
            </div>

            {/* ── ROW 3: Fleet Management + Warehouse Operations (Side-by-Side Asymmetric) ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px', marginBottom: '48px' }}>
              {/* Fleet Management */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Truck size={20} />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Commercial Assets</span>
                      <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Fleet Management</h4>
                    </div>
                  </div>

                  <p style={{ fontSize: '14.5px', color: '#475569', lineHeight: 1.5, margin: '0 0 20px' }}>
                    Real-time monitoring of commercial multi-axle trucks, container haulers, and urban delivery vans with maintenance and fuel telemetry.
                  </p>

                  {/* Fleet Operational KPI Box */}
                  <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', marginBottom: '18px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', textAlign: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>86</div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Total Fleet</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: '#16a34a' }}>74</div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Available</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: '#2563eb' }}>12</div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>On Route</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>PR-VH-1042 (20T Multi-Axle)</span>
                        <span style={{ color: '#2563eb', fontWeight: 600 }}>Bengaluru → Mumbai</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>PR-VH-1048 (12T Container)</span>
                        <span style={{ color: '#16a34a', fontWeight: 600 }}>Delhi → Jaipur (Ready)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Link to="/platform" style={{ color: '#2563eb', fontWeight: 700, fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>View Fleet Telematics System</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              {/* Warehouse Operations */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Warehouse size={20} />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Terminal Fulfillment</span>
                      <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Warehouse Management</h4>
                    </div>
                  </div>

                  <p style={{ fontSize: '14.5px', color: '#475569', lineHeight: 1.5, margin: '0 0 20px' }}>
                    Regional distribution center management with SKU inventory bin tracking, dock bay scheduling, and automated safety stock reorders.
                  </p>

                  {/* Warehouse Operational KPI Box */}
                  <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', marginBottom: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>WH-BLR-01 (Bengaluru Central)</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', padding: '2px 8px', borderRadius: '4px' }}>82% Capacity</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #e2e8f0', fontSize: '12.5px' }}>
                      <div>
                        <div style={{ color: '#64748b', fontSize: '11px' }}>Inbound Staging</div>
                        <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>34 Consignments</div>
                      </div>
                      <div>
                        <div style={{ color: '#64748b', fontSize: '11px' }}>Outbound Dispatch</div>
                        <div style={{ fontWeight: 700, color: '#2563eb', marginTop: '2px' }}>47 Linehauls</div>
                      </div>
                    </div>
                  </div>
                </div>

                <Link to="/platform" style={{ color: '#16a34a', fontWeight: 700, fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Explore Terminal Hub Architecture</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* ── ROW 4: Route Planning & Last-Mile Delivery (Split Showcase) ── */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                gap: '28px',
              }}
            >
              {/* Route Planning */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '30px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <Route size={20} />
                </div>
                <h4 style={{ fontSize: '19px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>
                  Route Planning & Corridor Optimization
                </h4>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, margin: '0 0 16px' }}>
                  Plan long-distance highway linehauls with toll fee predictions, mandatory driver relay stops, and traffic detour benchmarking across major national corridors (e.g. NH48).
                </p>
                <div style={{ fontSize: '12.5px', color: '#2563eb', fontWeight: 600 }}>
                  ✓ Lower linehaul fuel expenses & strict HOS compliance
                </div>
              </div>

              {/* Last-Mile Delivery */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '30px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <CheckCircle2 size={20} />
                </div>
                <h4 style={{ fontSize: '19px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>
                  Last-Mile Delivery & Digital ePOD
                </h4>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, margin: '0 0 16px' }}>
                  Execute doorstep business deliveries with recipient SMS ETA alerts, electronic OTP handovers, digital signature capture, and instantaneous invoice ledger clearing.
                </p>
                <div style={{ fontSize: '12.5px', color: '#16a34a', fontWeight: 600 }}>
                  ✓ Zero paper handover loss & instant invoice generation
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            3. HOW IT WORKS (CONNECTED 6-STAGE OPERATIONAL LIFECYCLE)
            ======================================================== */}
        <section style={{ padding: '80px 0', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div className="pr-container">
            <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 48px' }}>
              <div className="pr-section-tag" style={{ margin: '0 auto 10px' }}>
                <span>Operations Lifecycle</span>
              </div>
              <h2 style={{ fontSize: '30px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 10px' }}>
                How PrimeRoute Works
              </h2>
              <p style={{ fontSize: '15.5px', color: '#64748b', margin: 0 }}>
                From initial order booking to final recipient doorstep handover, explore the synchronized physical and digital workflow.
              </p>
            </div>

            {/* 6 Connected Steps Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '12px',
                marginBottom: '28px',
                background: '#ffffff',
                padding: '16px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
              }}
            >
              {workflowNodes.map((node) => {
                const isSelected = selectedWorkflowStep.id === node.id;
                const Icon = node.icon;
                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedWorkflowStep(node)}
                    style={{
                      background: isSelected ? '#eff6ff' : 'transparent',
                      border: isSelected ? '1px solid #2563eb' : '1px solid transparent',
                      borderRadius: '8px',
                      padding: '14px 8px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        background: isSelected ? '#2563eb' : '#f1f5f9',
                        color: isSelected ? '#ffffff' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={18} />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: isSelected ? '#2563eb' : '#0f172a' }}>
                      {node.name}
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Step 0{node.id}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Workflow Detail Card */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                padding: '32px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '28px',
                alignItems: 'center',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '18px' }}>
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '10px',
                    background: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <selectedWorkflowStep.icon size={26} />
                </div>
                <div>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                    LIFECYCLE STEP 0{selectedWorkflowStep.id} OF 06
                  </div>
                  <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                    {selectedWorkflowStep.title}
                  </h3>
                  <p style={{ fontSize: '14.5px', color: '#475569', margin: 0, lineHeight: 1.6 }}>
                    {selectedWorkflowStep.desc}
                  </p>
                </div>
              </div>

              {/* Event output */}
              <div style={{ background: '#0f172a', borderRadius: '8px', padding: '18px 20px', border: '1px solid #1e293b' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                  OPERATIONAL TELEMETRY EVENT
                </div>
                <div style={{ fontSize: '14px', fontFamily: 'monospace', color: '#10b981', fontWeight: 700 }}>
                  ➔ {selectedWorkflowStep.meta}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            4. REQUEST A QUOTE (B2B FREIGHT ENQUIRY FORM)
            ======================================================== */}
        <section id="quote" style={{ padding: '84px 0', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
          <div className="pr-container">
            <div style={{ maxWidth: '820px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                <div className="pr-section-tag" style={{ margin: '0 auto 10px' }}>
                  <span>Direct Freight Enquiry</span>
                </div>
                <h2 style={{ fontSize: '30px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>
                  Request a Freight & Logistics Quote
                </h2>
                <p style={{ fontSize: '15.5px', color: '#64748b', margin: 0 }}>
                  Specify your origin, destination, and cargo parameters. Our transportation planning desk will return a customized quotation within 2 business hours.
                </p>
              </div>

              {quoteSubmitted ? (
                <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', padding: '36px', textAlign: 'center' }}>
                  <CheckCircle size={48} color="#16a34a" style={{ margin: '0 auto 14px' }} />
                  <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
                    Quotation Request Received
                  </h3>
                  <p style={{ fontSize: '15px', color: '#475569', maxWidth: '520px', margin: '0 auto 20px' }}>
                    Thank you, <strong>{quoteData.contactName}</strong>. Our logistics operations desk for the <strong>{quoteData.origin} → {quoteData.destination}</strong> corridor has received your inquiry.
                  </p>
                  <button
                    onClick={() => {
                      setQuoteSubmitted(false);
                      setQuoteData({
                        companyName: '',
                        contactName: '',
                        email: '',
                        phone: '',
                        origin: '',
                        destination: '',
                        cargoType: 'Industrial Freight',
                        weight: '',
                        serviceType: 'Road Freight (FTL)',
                        message: '',
                      });
                    }}
                    className="pr-btn-secondary"
                    style={{ padding: '10px 20px', fontSize: '14px' }}
                  >
                    Submit Another Quote
                  </button>
                </div>
              ) : (
                <form onSubmit={handleQuoteSubmit} className="pr-quote-container">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '18px' }}>
                    <div>
                      <label className="pr-form-label">Company Name *</label>
                      <input
                        type="text"
                        required
                        value={quoteData.companyName}
                        onChange={(e) => setQuoteData({ ...quoteData, companyName: e.target.value })}
                        placeholder="e.g. Apex Industrial Solutions"
                        className="pr-form-input"
                      />
                    </div>

                    <div>
                      <label className="pr-form-label">Contact Name *</label>
                      <input
                        type="text"
                        required
                        value={quoteData.contactName}
                        onChange={(e) => setQuoteData({ ...quoteData, contactName: e.target.value })}
                        placeholder="e.g. Suresh Kumar"
                        className="pr-form-input"
                      />
                    </div>

                    <div>
                      <label className="pr-form-label">Business Email *</label>
                      <input
                        type="email"
                        required
                        value={quoteData.email}
                        onChange={(e) => setQuoteData({ ...quoteData, email: e.target.value })}
                        placeholder="e.g. logistics@company.com"
                        className="pr-form-input"
                      />
                    </div>

                    <div>
                      <label className="pr-form-label">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={quoteData.phone}
                        onChange={(e) => setQuoteData({ ...quoteData, phone: e.target.value })}
                        placeholder="+91 98XXX XXXXX"
                        className="pr-form-input"
                      />
                    </div>

                    <div>
                      <label className="pr-form-label">Origin City / Terminal *</label>
                      <input
                        type="text"
                        required
                        value={quoteData.origin}
                        onChange={(e) => setQuoteData({ ...quoteData, origin: e.target.value })}
                        placeholder="e.g. Bengaluru"
                        className="pr-form-input"
                      />
                    </div>

                    <div>
                      <label className="pr-form-label">Destination City / Hub *</label>
                      <input
                        type="text"
                        required
                        value={quoteData.destination}
                        onChange={(e) => setQuoteData({ ...quoteData, destination: e.target.value })}
                        placeholder="e.g. Mumbai Port"
                        className="pr-form-input"
                      />
                    </div>

                    <div>
                      <label className="pr-form-label">Service Type</label>
                      <select
                        value={quoteData.serviceType}
                        onChange={(e) => setQuoteData({ ...quoteData, serviceType: e.target.value })}
                        className="pr-form-select"
                      >
                        <option>Road Freight (FTL)</option>
                        <option>Part Load (LTL)</option>
                        <option>Express Priority Linehaul</option>
                        <option>Warehousing & Cross-Docking</option>
                        <option>Last-Mile Delivery</option>
                      </select>
                    </div>

                    <div>
                      <label className="pr-form-label">Estimated Cargo Weight (kg)</label>
                      <input
                        type="text"
                        value={quoteData.weight}
                        onChange={(e) => setQuoteData({ ...quoteData, weight: e.target.value })}
                        placeholder="e.g. 3,500 kg"
                        className="pr-form-input"
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label className="pr-form-label">Additional Instructions / Cargo Dimensions</label>
                    <textarea
                      rows={3}
                      value={quoteData.message}
                      onChange={(e) => setQuoteData({ ...quoteData, message: e.target.value })}
                      placeholder="Pallet count, temperature control requirements, recurring scheduled runs..."
                      className="pr-form-textarea"
                    ></textarea>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      🔒 Your commercial details are protected under NDA compliance.
                    </div>

                    <button type="submit" className="pr-btn-primary" style={{ padding: '12px 32px', fontSize: '15px' }}>
                      <span>Request a Quote</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
