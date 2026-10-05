import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PublicHeader from '../components/public/PublicHeader';
import PublicFooter from '../components/public/PublicFooter';
import AdminPlatformPreview from '../components/public/AdminPlatformPreview';
import CustomerPlatformPreview from '../components/public/CustomerPlatformPreview';
import {
  Shield, UserCheck, Check, ArrowRight,
  Package, Truck, Warehouse, Route, Receipt, BarChart3,
  Headphones, Users, FileText, Send, User, ChevronRight, Lock,
  CheckCircle2, Layers, Sparkles, Navigation, DoorOpen, History, ShieldAlert
} from 'lucide-react';

export default function Portals() {
  const [activeTab, setActiveTab] = useState<'admin' | 'customer' | 'warehouse' | 'driver'>('admin');

  const adminCapabilities = [
    { title: 'Order Management', desc: 'Process, verify, and route incoming freight bookings with automated rate checks.', icon: Package },
    { title: 'Shipment Management', desc: 'Issue barcode labels, generate digital manifests, and track linehaul milestones.', icon: Send },
    { title: 'Customer Management', desc: 'Maintain enterprise client directories, credit terms, and contact records.', icon: Users },
    { title: 'Fleet Management', desc: 'Monitor commercial fleet telematics, payload limits, and preventative maintenance.', icon: Truck },
    { title: 'Driver Management', desc: 'Track driver licenses, duty rosters, HOS compliance, and performance ratings.', icon: User },
    { title: 'Warehouse Management', desc: 'Track SKU inventory, bin locations, low-stock triggers, and dock staging bays.', icon: Warehouse },
    { title: 'Route Management', desc: 'Configure inter-city highway corridors, toll estimations, and waypoint stops.', icon: Route },
    { title: 'Billing & Invoicing', desc: 'Auto-generate GST tax invoices, track payment status, and export statements.', icon: Receipt },
    { title: 'Reports & Analytics', desc: 'Analyze on-time delivery rates, revenue per route, and fleet utilization.', icon: BarChart3 },
    { title: 'Support Desk', desc: 'Resolve incident escalations, damage claims, and customer dispatch queries.', icon: Headphones },
  ];

  const customerCapabilities = [
    { title: 'Create Orders', desc: 'Book new freight consignments with weight, dimension, and priority tier selection.', icon: Package },
    { title: 'Track Shipments', desc: 'Live GPS tracking, checkpoint milestones, driver details, and predictive ETAs.', icon: Send },
    { title: 'View Delivery Status', desc: 'Real-time status updates with Electronic Proof of Delivery (ePOD) verification.', icon: FileText },
    { title: 'View Invoices', desc: 'Access transparent GST invoices, payment receipts, and billing summaries.', icon: Receipt },
    { title: 'Manage Addresses', desc: 'Store recurring pickup/delivery addresses, billing details, and company profiles.', icon: User },
    { title: 'Raise Support Tickets', desc: 'Submit inquiries, report delivery exceptions, and track resolution status.', icon: Headphones },
  ];

  const warehouseCapabilities = [
    { title: 'Real-Time SKU Inventory', desc: 'Track stock counts, available vs reserved allocations, and quarantine damaged goods.', icon: Package },
    { title: 'Inbound Stock Intake', desc: 'Receive vendor stock deliveries, generate PO lot records, and update catalog counts.', icon: Layers },
    { title: 'Staging & Load Preparation', desc: 'Stage picked orders into designated dock bays and verify cargo packing lists.', icon: DoorOpen },
    { title: 'Driver & Vehicle Assignment', desc: 'Assign verified facility drivers and operational heavy transport vehicles.', icon: Truck },
    { title: 'Gate Dispatch Authorization', desc: 'Conduct pre-flight departure checklists and authorize immediate carrier release.', icon: Send },
    { title: 'Live Fleet Telemetry', desc: 'Geospatial Leaflet map tracking hub bounds, active radial routes, and fleet location.', icon: Navigation },
    { title: 'Inventory Audit Log', desc: 'Immutable ledger of every stock intake, shipment reservation, and adjustment.', icon: History },
    { title: 'Dock & Facility Controls', desc: 'Manage bay capacity, dock doors, operating shift hours, and safety escalations.', icon: Warehouse },
  ];

  const driverCapabilities = [
    { title: 'Assigned Consignments', desc: 'Review active shipment details, cargo packaging, quantities, and customer specs.', icon: Send },
    { title: 'Dock Pickup Clearance', desc: 'Verify cargo intake checklists, dock bay directions, and departure approvals.', icon: DoorOpen },
    { title: 'Turn-by-Turn Waypoints', desc: 'Optimized highway routing, destination navigation, and live travel time predictions.', icon: Route },
    { title: 'Electronic Proof of Delivery', desc: 'Capture customer recipient digital signatures and photo delivery verification.', icon: FileText },
    { title: 'Live Fleet Telemetry', desc: 'Background GPS coordinates synchronized with central dispatch and terminal hubs.', icon: Navigation },
    { title: 'Pre-Trip Vehicle Safety', desc: 'Daily safety readiness checklist for brakes, tires, lights, fluid levels, and docs.', icon: Truck },
    { title: '24/7 Dispatch Hotline', desc: 'Direct one-tap driver emergency line and operational support ticket logging.', icon: Headphones },
  ];

  return (
    <div className="pr-public-site">
      <PublicHeader />
      <main>
        {/* ========================================================
            1. PORTALS HERO SECTION (LIGHT ENTERPRISE THEME)
            ======================================================== */}
        <section
          style={{
            padding: '48px 0 64px',
            background: 'linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%)',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <div className="pr-container">
            <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
              <div className="pr-hero-badge-corporate" style={{ margin: '0 auto 16px' }}>
                <span className="pr-live-dot"></span>
                <span>ENTERPRISE PORTAL ECOSYSTEM</span>
              </div>

              <h1 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, lineHeight: 1.18, letterSpacing: '-0.02em', margin: '0 0 16px', color: '#0f172a' }}>
                One Unified Platform. Specialized Operational Portals.
              </h1>

              <p style={{ fontSize: '16.5px', color: '#475569', lineHeight: 1.6, margin: '0 auto 32px', maxWidth: '640px' }}>
                Dedicated operating environments for central dispatch, multi-modal hub warehouse managers, corporate freight clients, and linehaul delivery drivers.
              </p>

              {/* ── 4 Quick Access Portal Selection Cards ── */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '16px',
                  maxWidth: '1100px',
                  margin: '0 auto 40px',
                  textAlign: 'left',
                }}
              >
                {/* Admin Portal Card */}
                <div
                  style={{
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '12px',
                    padding: '24px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.2)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Shield size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', margin: '0 0 6px' }}>Admin Portal</h3>
                    <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                      Central dispatch command, global fleet, client billing and system governance.
                    </p>
                  </div>
                  <Link
                    to="/signin/admin"
                    className="pr-btn-primary"
                    style={{ marginTop: 'auto', padding: '10px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <span>Access Admin Portal</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>

                {/* Warehouse Portal Card */}
                <div
                  style={{
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    borderRadius: '12px',
                    padding: '24px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(5, 150, 105, 0.2)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Warehouse size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', margin: '0 0 6px' }}>Warehouse Portal</h3>
                    <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                      Manage hub inventory, inbound receipts, dock bays, and outgoing dispatches.
                    </p>
                  </div>
                  <Link
                    to="/signin/warehouse"
                    className="pr-btn-primary"
                    style={{ marginTop: 'auto', padding: '10px 16px', fontSize: '13px', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <span>Access Warehouse Portal</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>

                {/* Driver Portal Card */}
                <div
                  style={{
                    background: 'rgba(30, 41, 59, 0.85)',
                    border: '2px solid #3b82f6',
                    borderRadius: '12px',
                    padding: '24px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    backdropFilter: 'blur(8px)',
                    position: 'relative',
                    boxShadow: '0 8px 24px rgba(37, 99, 235, 0.25)',
                  }}
                >
                  <div style={{ position: 'absolute', top: '-10px', right: '14px', background: '#2563eb', color: '#ffffff', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                    FLEET FIELD APP
                  </div>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.25)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Truck size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', margin: '0 0 6px' }}>Driver Portal</h3>
                    <p style={{ fontSize: '13px', color: '#93c5fd', margin: 0, lineHeight: 1.4 }}>
                      Manage assigned deliveries, routes and delivery operations.
                    </p>
                  </div>
                  <Link
                    to="/signin/driver"
                    id="btn-access-driver-portal"
                    className="pr-btn-primary"
                    style={{ marginTop: 'auto', padding: '10px 16px', fontSize: '13px', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <span>Access Driver Portal</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>

                {/* Customer Portal Card */}
                <div
                  style={{
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(22, 163, 74, 0.3)',
                    borderRadius: '12px',
                    padding: '24px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(22, 163, 74, 0.2)', color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserCheck size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', margin: '0 0 6px' }}>Customer Portal</h3>
                    <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                      Book consignments, live shipment milestone tracking, and ePOD receipt downloads.
                    </p>
                  </div>
                  <Link
                    to="/signin/customer"
                    className="pr-btn-primary"
                    style={{ marginTop: 'auto', padding: '10px 16px', fontSize: '13px', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <span>Access Customer Portal</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              {/* 4-Way Tab Selector */}
              <div style={{ display: 'inline-flex', background: '#1e293b', padding: '5px', borderRadius: '8px', gap: '6px', border: '1px solid #334155', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  onClick={() => setActiveTab('admin')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    borderRadius: '6px',
                    border: 'none',
                    background: activeTab === 'admin' ? '#2563eb' : 'transparent',
                    color: activeTab === 'admin' ? '#ffffff' : '#94a3b8',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Shield size={16} />
                  <span>Admin Portal</span>
                </button>

                <button
                  onClick={() => setActiveTab('warehouse')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    borderRadius: '6px',
                    border: 'none',
                    background: activeTab === 'warehouse' ? '#059669' : 'transparent',
                    color: activeTab === 'warehouse' ? '#ffffff' : '#94a3b8',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Warehouse size={16} />
                  <span>Warehouse Portal</span>
                </button>

                <button
                  onClick={() => setActiveTab('customer')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    borderRadius: '6px',
                    border: 'none',
                    background: activeTab === 'customer' ? '#16a34a' : 'transparent',
                    color: activeTab === 'customer' ? '#ffffff' : '#94a3b8',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <UserCheck size={16} />
                  <span>Customer Portal</span>
                </button>

                <button
                  onClick={() => setActiveTab('driver')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    borderRadius: '6px',
                    border: 'none',
                    background: activeTab === 'driver' ? '#2563eb' : 'transparent',
                    color: activeTab === 'driver' ? '#ffffff' : '#94a3b8',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Truck size={16} />
                  <span>Driver Portal</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            2. ADMIN PORTAL SECTION (OPERATIONS COMMAND)
            ======================================================== */}
        <section
          style={{
            padding: '80px 0',
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: activeTab === 'admin' ? 'block' : 'none',
          }}
        >
          <div className="pr-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '44px' }}>
              <div style={{ maxWidth: '640px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2563eb', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px' }}>
                  <Shield size={16} /> For Controllers & Central Dispatch Teams
                </div>
                <h2 style={{ fontSize: '30px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 10px' }}>
                  Power Your Logistics Operations
                </h2>
                <p style={{ fontSize: '15.5px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>
                  A unified operations workstation designed for central dispatch teams to manage customers, fleet assets, terminal warehouses, billing ledgers, and live shipments.
                </p>
              </div>

              <Link to="/signin/admin" className="pr-btn-primary" style={{ padding: '12px 28px', fontSize: '15px' }}>
                <span>Access Admin Portal</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* 10 Admin Capabilities Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '52px' }}>
              {adminCapabilities.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '20px',
                    }}
                  >
                    <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <Icon size={18} />
                    </div>
                    <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                      {item.title}
                    </h4>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Interactive Admin Dashboard Preview */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '14px' }}>
                Live Admin Workspace Interface Preview
              </div>
              <AdminPlatformPreview />
            </div>
          </div>
        </section>

        {/* ========================================================
            3. WAREHOUSE MANAGER PORTAL SECTION
            ======================================================== */}
        <section
          style={{
            padding: '80px 0',
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: activeTab === 'warehouse' ? 'block' : 'none',
          }}
        >
          <div className="pr-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '44px' }}>
              <div style={{ maxWidth: '640px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#4f46e5', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px' }}>
                  <Warehouse size={16} /> For Terminal Hub Supervisors & Inventory Officers
                </div>
                <h2 style={{ fontSize: '30px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 10px' }}>
                  Warehouse & Terminal Hub Operations
                </h2>
                <p style={{ fontSize: '15.5px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>
                  Direct facility scoping with live stock intake, automated order reservation, pre-flight dispatch checklists, driver fleet assignments, and geospatial tracking.
                </p>
              </div>

              <Link to="/signin/warehouse" className="pr-btn-primary" style={{ padding: '12px 28px', fontSize: '15px', background: '#4f46e5' }}>
                <span>Access Warehouse Portal</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Warehouse Capabilities Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '18px', marginBottom: '40px' }}>
              {warehouseCapabilities.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '20px',
                    }}
                  >
                    <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <Icon size={18} />
                    </div>
                    <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                      {item.title}
                    </h4>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================
            4. CUSTOMER PORTAL SECTION (CLIENT SELF-SERVICE)
            ======================================================== */}
        <section
          style={{
            padding: '80px 0',
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: activeTab === 'customer' ? 'block' : 'none',
          }}
        >
          <div className="pr-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '44px' }}>
              <div style={{ maxWidth: '640px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px' }}>
                  <UserCheck size={16} /> For Business Shippers & Corporate Customers
                </div>
                <h2 style={{ fontSize: '30px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 10px' }}>
                  Give Customers Complete Visibility
                </h2>
                <p style={{ fontSize: '15.5px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>
                  Provide clients with a modern, self-service freight portal to book consignments, track real-time milestones, download tax invoices, and manage company address books.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link to="/signin/customer" className="pr-btn-primary" style={{ padding: '12px 26px', fontSize: '15px', background: '#16a34a' }}>
                  <span>Access Customer Portal</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/register" className="pr-btn-secondary" style={{ padding: '12px 22px', fontSize: '15px', textDecoration: 'none' }}>
                  <span>Register Account</span>
                </Link>
              </div>
            </div>

            {/* 6 Customer Capabilities Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '52px' }}>
              {customerCapabilities.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '22px',
                    }}
                  >
                    <div style={{ width: '38px', height: '38px', borderRadius: '6px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <Icon size={18} />
                    </div>
                    <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                      {item.title}
                    </h4>
                    <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Interactive Customer Dashboard Preview */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '14px' }}>
                Live Customer Portal Interface Preview
              </div>
              <CustomerPlatformPreview />
            </div>
          </div>
        </section>

        {/* ========================================================
            4. DRIVER PORTAL SECTION (FLEET & DELIVERY OPS)
            ======================================================== */}
        <section
          style={{
            padding: '80px 0',
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: activeTab === 'driver' ? 'block' : 'none',
          }}
        >
          <div className="pr-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '44px' }}>
              <div style={{ maxWidth: '640px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2563eb', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px' }}>
                  <Truck size={16} /> For Commercial Delivery & Linehaul Drivers
                </div>
                <h2 style={{ fontSize: '30px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 10px' }}>
                  Mobile Operations at the Driver Wheel
                </h2>
                <p style={{ fontSize: '15.5px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>
                  A specialized, responsive console designed for heavy vehicle and delivery drivers to review assigned loads, conduct pre-trip inspections, follow waypoints, and obtain recipient sign-offs.
                </p>
              </div>

              <Link to="/signin/driver" className="pr-btn-primary" style={{ padding: '12px 28px', fontSize: '15px', background: '#2563eb' }}>
                <span>Access Driver Portal</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* 7 Driver Capabilities Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '32px' }}>
              {driverCapabilities.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    style={{
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      borderRadius: '10px',
                      padding: '24px 20px',
                    }}
                  >
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.12)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                      <Icon size={20} />
                    </div>
                    <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                      {item.title}
                    </h4>
                    <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================
            5. PROFESSIONAL PORTAL COMPARISON SECTION
            ======================================================== */}
        <section style={{ padding: '76px 0', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div className="pr-container">
            <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
              <div className="pr-section-tag" style={{ margin: '0 auto 10px' }}>
                <span>Role-Based Access Control</span>
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>
                Portal Architecture Comparison
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
              {/* Admin Card */}
              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563eb', fontWeight: 800, fontSize: '13px', textTransform: 'uppercase', marginBottom: '12px' }}>
                  <Shield size={18} /> ADMIN PORTAL
                </div>
                <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 14px' }}>
                  Enterprise Command
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#334155' }}>
                  <div>✓ System-wide Fleet & Roster Control</div>
                  <div>✓ Multi-Location Warehouse Network</div>
                  <div>✓ Master Order Intake & Rate Setting</div>
                  <div>✓ Customer Ledger & GST Invoicing</div>
                  <div>✓ Executive Profitability Analytics</div>
                </div>
                <div style={{ marginTop: '24px' }}>
                  <Link to="/signin/admin" className="pr-btn-primary" style={{ display: 'inline-flex', padding: '10px 18px', fontSize: '13px' }}>
                    <span>Sign In as Admin</span>
                  </Link>
                </div>
              </div>

              {/* Warehouse Card */}
              <div style={{ background: '#ffffff', border: '2px solid #10b981', borderRadius: '10px', padding: '28px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-10px', right: '16px', background: '#059669', color: 'white', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                  HUB OPERATIONS
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: 800, fontSize: '13px', textTransform: 'uppercase', marginBottom: '12px' }}>
                  <Warehouse size={18} /> WAREHOUSE PORTAL
                </div>
                <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 14px' }}>
                  Hub & Staging Control
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#334155' }}>
                  <div>✓ Scoped to Assigned Terminal Facility</div>
                  <div>✓ Real-Time SKU Stock & Quarantine</div>
                  <div>✓ Staging & Dock Bay Dispatch Gate</div>
                  <div>✓ Local Driver & Vehicle Assignments</div>
                  <div>✓ Outbound Load Clearance SOPs</div>
                </div>
                <div style={{ marginTop: '24px' }}>
                  <Link to="/signin/warehouse" className="pr-btn-primary" style={{ display: 'inline-flex', padding: '10px 18px', fontSize: '13px', background: '#059669' }}>
                    <span>Sign In as Manager</span>
                  </Link>
                </div>
              </div>

              {/* Driver Card */}
              <div style={{ background: '#ffffff', border: '2px solid #3b82f6', borderRadius: '10px', padding: '28px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-10px', right: '16px', background: '#2563eb', color: 'white', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                  FLEET APP
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563eb', fontWeight: 800, fontSize: '13px', textTransform: 'uppercase', marginBottom: '12px' }}>
                  <Truck size={18} /> DRIVER PORTAL
                </div>
                <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 14px' }}>
                  Field Delivery Operations
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#334155' }}>
                  <div>✓ Assigned Consignments & Bay Handovers</div>
                  <div>✓ Turn-by-Turn Waypoints & Route ETAs</div>
                  <div>✓ Pre-Trip Safety & Tire Inspections</div>
                  <div>✓ Digital ePOD Signatures & Photo Proof</div>
                  <div>✓ 24/7 Breakdown & Dispatch Hotline</div>
                </div>
                <div style={{ marginTop: '24px' }}>
                  <Link to="/signin/driver" className="pr-btn-primary" style={{ display: 'inline-flex', padding: '10px 18px', fontSize: '13px', background: '#2563eb' }}>
                    <span>Sign In as Driver</span>
                  </Link>
                </div>
              </div>

              {/* Customer Card */}
              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontWeight: 800, fontSize: '13px', textTransform: 'uppercase', marginBottom: '12px' }}>
                  <UserCheck size={18} /> CUSTOMER PORTAL
                </div>
                <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 14px' }}>
                  Self-Service Visibility
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#334155' }}>
                  <div>✓ Instant Freight Consignment Booking</div>
                  <div>✓ Live Milestone & GPS Tracking</div>
                  <div>✓ Digital Proof-of-Delivery (ePOD)</div>
                  <div>✓ Tax Invoice & Payment Status</div>
                  <div>✓ Company Address Book & Support Desk</div>
                </div>
                <div style={{ marginTop: '24px' }}>
                  <Link to="/signin/customer" className="pr-btn-primary" style={{ display: 'inline-flex', padding: '10px 18px', fontSize: '13px', background: '#16a34a' }}>
                    <span>Sign In as Customer</span>
                  </Link>
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
