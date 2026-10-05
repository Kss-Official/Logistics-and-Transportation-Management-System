import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PublicHeader from '../components/public/PublicHeader';
import PublicFooter from '../components/public/PublicFooter';
import {
  Package, Truck, Warehouse, Route, ShieldCheck, CheckCircle2,
  ArrowRight, Users, Send, Clock, Navigation, MapPin,
  ChevronRight, Building2, Check, ArrowDown, Radio, Activity,
  ReceiptText, BarChart3, Shield, Bell, Headphones, Gauge, Cpu,
  Layers, AlertTriangle, TrendingUp, DollarSign
} from 'lucide-react';

const liveShipmentsList = [
  { id: 'TRK-2026-00126', customer: 'ABC Manufacturing Ltd', origin: 'Bengaluru WH-03', dest: 'Mumbai Port DC', status: 'In Transit', driver: 'Anand Verma', vehicle: 'PR-VH-1042', eta: '05 Sep 2026' },
  { id: 'TRK-2026-00125', customer: 'Heritage Crafts', origin: 'Delhi Terminal', dest: 'Jaipur Logistics Park', status: 'Out for Delivery', driver: 'Vikram Singh', vehicle: 'DL-01-CD-8832', eta: 'Today, 14:15' },
  { id: 'TRK-2026-00124', customer: 'TechWorld Systems', origin: 'Mumbai Central Hub', dest: 'Pune Distribution DC', status: 'Delivered', driver: 'Rajesh Kumar', vehicle: 'MH-12-AB-4521', eta: 'Completed' },
  { id: 'TRK-2026-00123', customer: 'Acme Retail Ltd', origin: 'Chennai Hub WH-02', dest: 'Hyderabad Gateway', status: 'In Transit', driver: 'K. Senthil', vehicle: 'TN-09-GH-3341', eta: '06 Sep 2026' },
];

const fleetRoster = [
  { id: 'PR-VH-1042', type: '20T Multi-Axle Hauler', driver: 'Anand Verma', route: 'NH48 (Pune Corridor)', status: 'On Route', speed: '62 km/h', fuel: '76%', color: '#2563eb', bg: '#eff6ff' },
  { id: 'PR-VH-1048', type: '12T Container Truck', driver: 'Vikram Singh', route: 'Delhi → Jaipur Express', status: 'On Route', speed: '48 km/h', fuel: '84%', color: '#2563eb', bg: '#eff6ff' },
  { id: 'PR-VH-1053', type: '32T Heavy Linehaul Hauler', driver: 'K. Senthil', route: 'Bengaluru Central Terminal', status: 'Available', speed: '0 km/h', fuel: '92%', color: '#16a34a', bg: '#f0fdf4' },
  { id: 'PR-VH-1031', type: '8T Urban Distribution Van', driver: 'Depot Team', route: 'Mumbai Maintenance Bay', status: 'Maintenance', speed: '0 km/h', fuel: '45%', color: '#d97706', bg: '#fffbeb' },
];

const tmsModules = [
  {
    id: 'orders',
    title: 'Order Management',
    desc: 'B2B order intake with automated volumetric weight rating, tax computation, and instant dispatch scheduling.',
    icon: Package,
  },
  {
    id: 'shipments',
    title: 'Shipment Management',
    desc: 'Automated barcode consignment labeling, digital Bill of Lading manifests, and live milestone tracking.',
    icon: Send,
  },
  {
    id: 'fleet',
    title: 'Fleet Management',
    desc: 'Commercial vehicle telemetry rosters, preventative maintenance logs, fuel metrics, and driver duty hours.',
    icon: Truck,
  },
  {
    id: 'warehouses',
    title: 'Warehouse Management',
    desc: 'Multi-location inventory counts, bin allocation, safety stock reorder thresholds, and outbound dock bays.',
    icon: Warehouse,
  },
  {
    id: 'routes',
    title: 'Route Management',
    desc: 'Inter-city highway corridor planning, toll estimations, driver relay waypoints, and transit benchmarking.',
    icon: Route,
  },
  {
    id: 'billing',
    title: 'Billing & Invoicing',
    desc: 'Automated GST tax invoices, payment ledger tracking, and instant electronic proof-of-delivery (ePOD) sync.',
    icon: ReceiptText,
  },
  {
    id: 'reports',
    title: 'Reports & Analytics',
    desc: 'On-time delivery rates, revenue per corridor, vehicle asset utilization, and exception alerts.',
    icon: BarChart3,
  },
];

export default function Platform() {
  return (
    <div className="pr-public-site">
      <PublicHeader />
      <main>
        {/* ========================================================
            1. PLATFORM HERO SECTION (SOFTWARE PRODUCT SHOWCASE - LIGHT ENTERPRISE)
            ======================================================== */}
        <section
          style={{
            padding: '48px 0 64px',
            background: 'linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%)',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <div className="pr-container">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                gap: '48px',
                alignItems: 'center',
              }}
            >
              {/* Left: Hero Copy */}
              <div>
                <div className="pr-hero-badge-corporate" style={{ marginBottom: '16px' }}>
                  <span className="pr-live-dot"></span>
                  <span>ENTERPRISE TMS ARCHITECTURE</span>
                </div>

                <h1 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, lineHeight: 1.18, letterSpacing: '-0.02em', margin: '0 0 18px', color: '#0f172a' }}>
                  One Platform. Complete Logistics Visibility.
                </h1>

                <p style={{ fontSize: '16.5px', color: '#475569', lineHeight: 1.6, margin: '0 0 28px' }}>
                  Connect orders, shipments, fleet, warehouses and delivery operations through one centralized platform designed for modern commercial transportation.
                </p>

                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                  <Link to="/signin/customer" className="pr-btn-primary" style={{ padding: '12px 28px', fontSize: '15px' }}>
                    <span>Explore PrimeRoute</span>
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    to="/portals"
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
                      fontSize: '15px',
                      textDecoration: 'none',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    }}
                  >
                    <span>View Portals</span>
                  </Link>
                </div>
              </div>

              {/* Right: Live Control Tower Mini Preview Card (Crisp Light Enterprise Theme) */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="pr-live-dot"></span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Control Tower Command</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700, background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '3px 8px', borderRadius: '4px' }}>
                    42 Hubs Online
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Active Shipments</div>
                    <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>1,248</div>
                  </div>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>In Transit</div>
                    <div style={{ fontSize: '26px', fontWeight: 800, color: '#2563eb', marginTop: '2px' }}>384 Live</div>
                  </div>
                </div>

                <div style={{ fontSize: '12.5px', color: '#475569', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '12px 14px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <span>On-Time SLA Delivery: <strong style={{ color: '#059669' }}>96.8%</strong></span>
                  <span>Commercial Fleet: <strong style={{ color: '#2563eb' }}>86 Units</strong></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            2. CONTROL TOWER PRODUCT SHOWCASE (ENTERPRISE TMS DASHBOARD)
            ======================================================== */}
        <section style={{ padding: '80px 0', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div className="pr-container">
            <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 52px' }}>
              <div className="pr-section-tag" style={{ margin: '0 auto 10px' }}>
                <span>Real-Time Command Center</span>
              </div>
              <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 12px' }}>
                Enterprise Control Tower
              </h2>
              <p style={{ fontSize: '16px', color: '#64748b', margin: 0 }}>
                Gain synchronized oversight across linehauls, terminal docks, driver assignments, and customer deliveries from a single dashboard.
              </p>
            </div>

            {/* Realistic TMS Interface Frame */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 8px 30px rgba(15, 23, 42, 0.06)',
              }}
            >
              {/* Dashboard Top Header Bar */}
              <div
                style={{
                  padding: '16px 24px',
                  background: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="pr-live-dot"></span>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                    PrimeRoute Control Tower — Live Logistics Telematics Feed
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#16a34a', background: '#f0fdf4', padding: '4px 12px', borderRadius: '4px', fontWeight: 700 }}>
                  <Radio size={14} />
                  <span>All Operational Systems Nominal</span>
                </div>
              </div>

              {/* 4 Large Operational KPI Cards Row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1px',
                  background: '#e2e8f0',
                  borderBottom: '1px solid #e2e8f0',
                }}
              >
                <div style={{ background: '#ffffff', padding: '22px 24px' }}>
                  <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Active Shipments</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>1,248</div>
                  <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '2px', fontWeight: 600 }}>↑ 12.4% vs previous cycle</div>
                </div>

                <div style={{ background: '#ffffff', padding: '22px 24px' }}>
                  <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>In Transit</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>384</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Live on interstate highways</div>
                </div>

                <div style={{ background: '#ffffff', padding: '22px 24px' }}>
                  <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Delivered Today</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>742</div>
                  <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '2px', fontWeight: 600 }}>ePOD Verified & Invoiced</div>
                </div>

                <div style={{ background: '#ffffff', padding: '22px 24px' }}>
                  <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>On-Time Delivery Rate</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>96.8%</div>
                  <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '2px', fontWeight: 600 }}>SLA Target: 95.0%</div>
                </div>
              </div>

              {/* Route Map Schematic Corridor Card */}
              <div style={{ padding: '24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Primary Corridor Network (NH48 Heavy Linehaul)
                  </span>
                  <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                    Corridor: <strong>Bengaluru → Hyderabad → Pune → Mumbai</strong>
                  </span>
                </div>

                {/* Clean Route Schematic */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#16a34a', margin: '0 auto 6px' }}></div>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>Bengaluru</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Origin Hub WH-03</div>
                  </div>

                  <div style={{ height: '3px', flex: 1, background: '#16a34a', margin: '0 12px' }}></div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#16a34a', margin: '0 auto 6px' }}></div>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>Hyderabad</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Gateway Relay</div>
                  </div>

                  <div style={{ height: '3px', flex: 1, background: '#2563eb', margin: '0 12px' }}></div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#2563eb', border: '3px solid #bfdbfe', margin: '0 auto 6px' }}></div>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#2563eb' }}>Pune DC</div>
                    <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: 700 }}>● Live (62 km/h)</div>
                  </div>

                  <div style={{ height: '3px', flex: 1, background: '#cbd5e1', margin: '0 12px' }}></div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#cbd5e1', margin: '0 auto 6px' }}></div>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#64748b' }}>Mumbai Port</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Destination Port</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            3. THREE DEDICATED VISUAL PRODUCT SHOWCASES
            ======================================================== */}
        <section style={{ padding: '84px 0', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
          <div className="pr-container">
            {/* ── SHOWCASE 1: Manage Every Shipment From One Place ── */}
            <div style={{ marginBottom: '72px' }}>
              <div style={{ maxWidth: '680px', marginBottom: '28px' }}>
                <div className="pr-section-tag" style={{ marginBottom: '8px' }}>
                  <span>Consignment Operations</span>
                </div>
                <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>
                  Manage Every Shipment From One Place
                </h3>
                <p style={{ fontSize: '15.5px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>
                  Monitor origin-to-destination consignments, active pilots, assigned vehicles, and delivery ETAs in real time.
                </p>
              </div>

              {/* Realistic Shipment Table */}
              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', overflowX: 'auto', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '14px 20px' }}>Shipment ID</th>
                      <th style={{ padding: '14px 20px' }}>Customer</th>
                      <th style={{ padding: '14px 20px' }}>Origin → Destination</th>
                      <th style={{ padding: '14px 20px' }}>Assigned Driver</th>
                      <th style={{ padding: '14px 20px' }}>Vehicle</th>
                      <th style={{ padding: '14px 20px' }}>Status</th>
                      <th style={{ padding: '14px 20px' }}>ETA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveShipmentsList.map((ship) => (
                      <tr key={ship.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '16px 20px', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
                          {ship.id}
                        </td>
                        <td style={{ padding: '16px 20px', color: '#1e293b', fontWeight: 600 }}>
                          {ship.customer}
                        </td>
                        <td style={{ padding: '16px 20px', color: '#64748b' }}>
                          {ship.origin} → {ship.dest}
                        </td>
                        <td style={{ padding: '16px 20px', color: '#0f172a' }}>
                          {ship.driver}
                        </td>
                        <td style={{ padding: '16px 20px', color: '#64748b', fontFamily: 'monospace' }}>
                          {ship.vehicle}
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span
                            style={{
                              fontSize: '11.5px',
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: '4px',
                              color: ship.status === 'In Transit' ? '#2563eb' : ship.status === 'Delivered' ? '#16a34a' : '#d97706',
                              background: ship.status === 'In Transit' ? '#eff6ff' : ship.status === 'Delivered' ? '#f0fdf4' : '#fffbeb',
                            }}
                          >
                            ● {ship.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', color: '#0f172a', fontWeight: 700 }}>
                          {ship.eta}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── SHOWCASE 2: Know Where Your Fleet Is ── */}
            <div style={{ marginBottom: '72px' }}>
              <div style={{ maxWidth: '680px', marginBottom: '28px' }}>
                <div className="pr-section-tag" style={{ marginBottom: '8px' }}>
                  <span>Commercial Fleet Telematics</span>
                </div>
                <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>
                  Know Where Your Fleet Is
                </h3>
                <p style={{ fontSize: '15.5px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>
                  Track heavy commercial vehicles across highway corridors with live speed telematics, fuel tank levels, and driver duty roster statuses.
                </p>
              </div>

              {/* Fleet Telematics Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {fleetRoster.map((veh) => (
                  <div
                    key={veh.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '22px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'monospace', color: '#0f172a' }}>
                        {veh.id}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: veh.color, background: veh.bg, padding: '2px 8px', borderRadius: '4px' }}>
                        ● {veh.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '13px', color: '#475569', marginBottom: '14px' }}>
                      {veh.type} • Driver: <strong style={{ color: '#0f172a' }}>{veh.driver}</strong>
                    </div>

                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 12px', fontSize: '12px', marginBottom: '14px' }}>
                      <div style={{ color: '#64748b' }}>Assigned Corridor:</div>
                      <div style={{ color: '#0f172a', fontWeight: 600, marginTop: '2px' }}>{veh.route}</div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                      <span>Speed: <strong style={{ color: '#0f172a' }}>{veh.speed}</strong></span>
                      <span>Fuel Level: <strong style={{ color: '#16a34a' }}>{veh.fuel}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── SHOWCASE 3: Turn Operational Data Into Better Decisions ── */}
            <div>
              <div style={{ maxWidth: '680px', marginBottom: '28px' }}>
                <div className="pr-section-tag" style={{ marginBottom: '8px' }}>
                  <span>Executive Analytics</span>
                </div>
                <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>
                  Turn Operational Data Into Better Decisions
                </h3>
                <p style={{ fontSize: '15.5px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>
                  Actionable logistics intelligence on transit turnaround times, corridor profitability, and SLA fulfillment rates.
                </p>
              </div>

              {/* Analytics Performance Display */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563eb', marginBottom: '8px' }}>
                    <TrendingUp size={18} />
                    <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>On-Time SLA</span>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a' }}>96.8%</div>
                  <div style={{ fontSize: '12.5px', color: '#16a34a', marginTop: '4px', fontWeight: 600 }}>↑ +2.1% over monthly benchmark</div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', marginBottom: '8px' }}>
                    <Truck size={18} />
                    <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Fleet Utilization</span>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a' }}>88.4%</div>
                  <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '4px' }}>74/86 commercial units deployed</div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d97706', marginBottom: '8px' }}>
                    <Package size={18} />
                    <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Monthly Tonnage</span>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a' }}>4,820 T</div>
                  <div style={{ fontSize: '12.5px', color: '#16a34a', marginTop: '4px', fontWeight: 600 }}>↑ 18.5% year-on-year growth</div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#7c3aed', marginBottom: '8px' }}>
                    <DollarSign size={18} />
                    <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Billing Accuracy</span>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a' }}>99.9%</div>
                  <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '4px' }}>Automated GST calculation</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            4. PLATFORM MODULES SUMMARY GRID
            ======================================================== */}
        <section style={{ padding: '80px 0', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div className="pr-container">
            <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 52px' }}>
              <div className="pr-section-tag" style={{ margin: '0 auto 10px' }}>
                <span>TMS Module Architecture</span>
              </div>
              <h2 style={{ fontSize: '30px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 10px' }}>
                Connected Modules in One Logistics Platform
              </h2>
              <p style={{ fontSize: '15.5px', color: '#64748b', margin: 0 }}>
                Every department—dispatch, warehouse, fleet, billing, and management—operates from the same synchronized data layer.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {tmsModules.map((mod) => {
                const Icon = mod.icon;
                return (
                  <div
                    key={mod.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '28px',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
                    }}
                  >
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '8px',
                        background: '#eff6ff',
                        color: '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '16px',
                      }}
                    >
                      <Icon size={22} />
                    </div>

                    <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
                      {mod.title}
                    </h4>

                    <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                      {mod.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
