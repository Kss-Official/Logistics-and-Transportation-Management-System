import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicHeader from '../components/public/PublicHeader';
import PublicFooter from '../components/public/PublicFooter';
import HeroSection from '../components/public/HeroSection';
import publicService from '../services/publicService';
import type { PublicStatistics } from '../services/publicService';
import {
  Package, Truck, Warehouse, Route, ArrowRight, ShieldCheck,
  Search, CheckCircle2, Clock, MapPin, Send, Sparkles, ChevronRight,
  BarChart3, Activity, Users, Shield, Radio, Check, FileText, Quote,
  Phone, Mail, Calendar, CheckCircle, Zap, Globe, LifeBuoy, CreditCard
} from 'lucide-react';

import roadFreightImg from '../assets/corporate_road_freight.jpg';
import cargoWarehouseImg from '../assets/cargo_warehouse_terminal.jpg';
import heroTruckImg from '../assets/hero_3d_truck.jpg';
import warehouseHubImg from '../assets/warehouse_3d_hub.jpg';
import lastmileDeliveryImg from '../assets/lastmile_3d_delivery.jpg';
import controlTowerImg from '../assets/control_tower_3d_network.jpg';

const serviceCards = [
  {
    image: roadFreightImg,
    category: 'Transportation',
    title: 'Road Freight',
    desc: 'Full-truckload (FTL) and less-than-truckload (LTL) scheduled long-haul linehaul across major industrial corridors.',
    link: '/solutions',
  },
  {
    image: heroTruckImg,
    category: 'Operations',
    title: 'Shipment Management',
    desc: 'Automated barcode consignment labeling, digital Bill of Lading manifests, and real-time waypoint milestone logging.',
    link: '/solutions',
  },
  {
    image: cargoWarehouseImg,
    category: 'Fulfillment',
    title: 'Warehouse Operations',
    desc: 'Multi-hub inventory tracking, dynamic bin allocation, safety stock reorder thresholds, and dock staging bays.',
    link: '/solutions',
  },
  {
    image: warehouseHubImg,
    category: 'Asset Command',
    title: 'Fleet Management',
    desc: 'Commercial vehicle telemetry rosters, preventative maintenance tracking, fuel metrics, and driver HOS compliance.',
    link: '/solutions',
  },
  {
    image: controlTowerImg,
    category: 'Corridors',
    title: 'Route Planning',
    desc: 'Inter-city highway corridor planning with toll estimations, driver rest waypoints, and transit benchmarking.',
    link: '/solutions',
  },
  {
    image: lastmileDeliveryImg,
    category: 'Delivery',
    title: 'Last-Mile Delivery',
    desc: 'Doorstep urban distribution, recipient SMS alerts, Electronic Proof of Delivery (ePOD), and instant billing sync.',
    link: '/solutions',
  },
];

const liveControlShipments = [
  { id: 'TRK-PR-ORD-71673158', customer: 'Industrial Client', route: 'Cuttack → Bengaluru', status: 'In Transit', color: '#2563eb', bg: '#eff6ff', eta: 'Scheduled Transit' },
  { id: 'TRK-PR-YHUAKNVP', customer: 'Enterprise Freight', route: 'Hyderabad Corridor Hub', status: 'In Transit', color: '#2563eb', bg: '#eff6ff', eta: 'Express Linehaul' },
  { id: 'TRK-PR-FESYQXAW', customer: 'Commercial Retailer', route: 'Cuttack Distribution Depot', status: 'In Transit', color: '#2563eb', bg: '#eff6ff', eta: 'Active Dispatch' },
];

export default function Home() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<PublicStatistics | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    publicService.getPublicStatistics()
      .then((data) => {
        setStats(data);
        setLoadingStats(false);
      })
      .catch(() => {
        setLoadingStats(false);
      });
  }, []);

  // Request a Quote Form State
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
        {/* 1. CORPORATE HERO SECTION WITH PHOTO & TRACKING BOX */}
        <HeroSection stats={stats} loadingStats={loadingStats} />

        {/* 2. SERVICES SECTION (RECTANGULAR IMAGE-BASED SERVICE CARDS) */}
        <section style={{ padding: '80px 0 72px', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
          <div className="pr-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px', marginBottom: '44px' }}>
              <div style={{ maxWidth: '640px' }}>
                <div className="pr-section-tag" style={{ marginBottom: '10px' }}>
                  <span>Core Capabilities</span>
                </div>
                <h2 style={{ fontSize: '30px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 10px' }}>
                  Complete Logistics Solutions
                </h2>
                <p style={{ fontSize: '15.5px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  Comprehensive transportation, freight, and supply chain management for modern commercial enterprises.
                </p>
              </div>

              <Link to="/solutions" className="pr-btn-secondary" style={{ padding: '10px 20px', fontSize: '14px', textDecoration: 'none' }}>
                <span>View All Services</span>
                <ChevronRight size={16} />
              </Link>
            </div>

            {/* 6 Rectangular Image-Based Service Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {serviceCards.map((service, idx) => (
                <div key={idx} className="pr-service-image-card">
                  <div className="pr-service-image-wrapper">
                    <img src={service.image} alt={service.title} />
                  </div>

                  <div className="pr-service-card-body">
                    <span className="pr-service-card-tag">{service.category}</span>
                    <h3 className="pr-service-card-title">{service.title}</h3>
                    <p className="pr-service-card-desc">{service.desc}</p>
                    <Link to={service.link} className="pr-service-card-link">
                      <span>Learn More</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW PRIMEROUTE WORKS SECTION — LIGHT THEME */}
        <section className="pr-process-section" id="how-primeroute-works">
          <div className="pr-process-container">
            {/* Section Header */}
            <div className="pr-process-header">
              <div className="pr-process-tag">
                <Sparkles size={13} />
                <span>End-to-End Operational Workflow</span>
              </div>
              <h2 className="pr-process-title">
                How PrimeRoute Works
              </h2>
              <p className="pr-process-subtitle">
                From instant dispatch booking to verified delivery, our connected technology keeps every shipment seamless, secure, and fully tracked in real time.
              </p>
            </div>

            {/* Desktop Visual Connector Banner */}
            <div className="pr-process-flow-banner">
              <div className="pr-process-flow-step active">
                <Package size={14} />
                <span>01 Book</span>
              </div>
              <div className="pr-process-flow-arrow">
                <ArrowRight size={14} />
              </div>
              <div className="pr-process-flow-step active">
                <Truck size={14} />
                <span>02 Pick & Transport</span>
              </div>
              <div className="pr-process-flow-arrow">
                <ArrowRight size={14} />
              </div>
              <div className="pr-process-flow-step active">
                <Route size={14} />
                <span>03 Track</span>
              </div>
              <div className="pr-process-flow-arrow">
                <ArrowRight size={14} />
              </div>
              <div className="pr-process-flow-step green">
                <ShieldCheck size={14} />
                <span>04 Deliver</span>
              </div>
            </div>

            {/* 4 Process Cards arranged horizontally on desktop */}
            <div className="pr-process-grid-wrapper">
              <div className="pr-process-grid">
                {/* Step 01 */}
                <div className="pr-process-card" id="process-card-01">
                  <div className="pr-process-card-top">
                    <span className="pr-process-step-badge">01</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Step 01
                    </span>
                  </div>

                  {/* 3D-style dimensional icon */}
                  <div className="pr-process-3d-icon">
                    <Package size={26} strokeWidth={2.2} />
                  </div>

                  <h3 className="pr-process-card-title">
                    Book Your Shipment
                  </h3>
                  <p className="pr-process-card-desc">
                    Select saved addresses, enter cargo specifications, and receive instantaneous dynamic pricing with automated corridor capacity allocation.
                  </p>

                  <div className="pr-process-card-footer">
                    <span style={{ color: '#2563eb' }}>• Instant Rate Calculation</span>
                    <span>Consignment</span>
                  </div>

                  {/* Desktop connector arrow */}
                  <div className="pr-process-card-arrow" aria-hidden="true">
                    <ArrowRight size={14} />
                  </div>
                </div>

                {/* Step 02 */}
                <div className="pr-process-card" id="process-card-02">
                  <div className="pr-process-card-top">
                    <span className="pr-process-step-badge">02</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Step 02
                    </span>
                  </div>

                  {/* 3D-style dimensional icon */}
                  <div className="pr-process-3d-icon">
                    <Truck size={26} strokeWidth={2.2} />
                  </div>

                  <h3 className="pr-process-card-title">
                    We Pick & Transport
                  </h3>
                  <p className="pr-process-card-desc">
                    Coordinated driver dispatch collects cargo with digital manifest logging, security verification checks, and dock staging preparation.
                  </p>

                  <div className="pr-process-card-footer">
                    <span style={{ color: '#2563eb' }}>• Digital Manifest & Gate Scan</span>
                    <span>Linehaul</span>
                  </div>

                  {/* Desktop connector arrow */}
                  <div className="pr-process-card-arrow" aria-hidden="true">
                    <ArrowRight size={14} />
                  </div>
                </div>

                {/* Step 03 */}
                <div className="pr-process-card" id="process-card-03">
                  <div className="pr-process-card-top">
                    <span className="pr-process-step-badge">03</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Step 03
                    </span>
                  </div>

                  {/* 3D-style dimensional icon */}
                  <div className="pr-process-3d-icon">
                    <Route size={26} strokeWidth={2.2} />
                  </div>

                  <h3 className="pr-process-card-title">
                    Track in Real Time
                  </h3>
                  <p className="pr-process-card-desc">
                    Continuous highway corridor progress, hub waypoints, Leaflet telematics, and expected arrival timestamps across your dashboard.
                  </p>

                  <div className="pr-process-card-footer">
                    <span style={{ color: '#2563eb' }}>• Real-time GPS Telematics</span>
                    <span>Waypoints</span>
                  </div>

                  {/* Desktop connector arrow */}
                  <div className="pr-process-card-arrow" aria-hidden="true">
                    <ArrowRight size={14} />
                  </div>
                </div>

                {/* Step 04 */}
                <div className="pr-process-card green-accent" id="process-card-04">
                  <div className="pr-process-card-top">
                    <span className="pr-process-step-badge">04</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Step 04
                    </span>
                  </div>

                  {/* 3D-style dimensional icon with subtle green accent */}
                  <div className="pr-process-3d-icon">
                    <ShieldCheck size={26} strokeWidth={2.2} />
                  </div>

                  <h3 className="pr-process-card-title">
                    Delivered Safely
                  </h3>
                  <p className="pr-process-card-desc">
                    Verified doorstep delivery with Electronic Proof of Delivery (ePOD), customer digital signature, and automatic GST invoice synchronization.
                  </p>

                  <div className="pr-process-card-footer">
                    <span style={{ color: '#059669' }}>• Verified ePOD & Auto-Invoice</span>
                    <span>Complete</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION (8 PROFESSIONAL CARDS) */}
        <section style={{ padding: '80px 0', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div className="pr-container">
            <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
              <div className="pr-section-tag" style={{ margin: '0 auto 10px' }}>
                <span>Platform Capabilities</span>
              </div>
              <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 12px' }}>
                Enterprise Freight Features
              </h2>
              <p style={{ fontSize: '15.5px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                Everything your business needs to streamline logistics, optimize costs, and accelerate deliveries.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '24px' }}>
              {/* Feature 1 */}
              <div className="card" style={{ padding: '24px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <MapPin size={20} />
                </div>
                <h3 style={{ fontSize: '16.5px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
                  Real-Time Tracking
                </h3>
                <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  Track every parcel and full truckload consignment live across national highway corridors.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="card" style={{ padding: '24px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <Zap size={20} />
                </div>
                <h3 style={{ fontSize: '16.5px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
                  Fast Delivery
                </h3>
                <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  Express transit lanes and priority scheduling designed to meet tight enterprise SLAs.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="card" style={{ padding: '24px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <ShieldCheck size={20} />
                </div>
                <h3 style={{ fontSize: '16.5px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
                  Secure Logistics
                </h3>
                <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  Tamper-evident seals, electronic chain of custody, and optional comprehensive transit coverage.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="card" style={{ padding: '24px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#f0f9ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <Globe size={20} />
                </div>
                <h3 style={{ fontSize: '16.5px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
                  Wide Network
                </h3>
                <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  Connected distribution centers, cross-dock terminals, and linehaul routes spanning major cities.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="card" style={{ padding: '24px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <CreditCard size={20} />
                </div>
                <h3 style={{ fontSize: '16.5px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
                  Transparent Pricing
                </h3>
                <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  Real-time rate calculation based on weight, distance, and service type without hidden surcharges.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="card" style={{ padding: '24px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#fdf4ff', color: '#c026d3', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <LifeBuoy size={20} />
                </div>
                <h3 style={{ fontSize: '16.5px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
                  Dedicated Support
                </h3>
                <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  24/7 dedicated logistics operations desk, dynamic email compose, and priority ticket resolution.
                </p>
              </div>

              {/* Feature 7 */}
              <div className="card" style={{ padding: '24px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <Truck size={20} />
                </div>
                <h3 style={{ fontSize: '16.5px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
                  Fleet Management
                </h3>
                <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  Carrier assignment, driver compliance, route benchmarking, and automated truck telemetry.
                </p>
              </div>

              {/* Feature 8 */}
              <div className="card" style={{ padding: '24px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <FileText size={20} />
                </div>
                <h3 style={{ fontSize: '16.5px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
                  Digital Invoicing
                </h3>
                <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  Automated GST-compliant invoices, itemized freight charges, and instant download receipts.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. COMPANY INTRODUCTION SECTION (REAL PHOTOGRAPHY + CORPORATE CHECKLIST) */}
        <section style={{ padding: '80px 0', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
          <div className="pr-container">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                gap: '48px',
                alignItems: 'center',
              }}
            >
              {/* Left: Real Logistics Photograph */}
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: '1px solid #cbd5e1',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
                  }}
                >
                  <img
                    src={cargoWarehouseImg}
                    alt="PrimeRoute Enterprise Logistics Operations"
                    style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
                  />
                </div>

                {/* Subtle Operational Floating Card */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '20px',
                    right: '20px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px 18px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#16a34a' }}></div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                    Established Transportation Network
                  </div>
                </div>
              </div>

              {/* Right: Corporate Narrative & Checkmarks */}
              <div>
                <div className="pr-section-tag" style={{ marginBottom: '10px' }}>
                  <span>About PrimeRoute</span>
                </div>
                <h2 style={{ fontSize: '30px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 16px' }}>
                  Technology Built Around Real Logistics
                </h2>
                <p style={{ fontSize: '15.5px', color: '#475569', lineHeight: 1.6, margin: '0 0 24px' }}>
                  PrimeRoute Logistics is a connected transportation management platform designed to help businesses manage orders, shipments, fleet operations, warehouses and deliveries from one central operational workspace.
                </p>

                {/* 4 Corporate Checkmarks */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#1e293b', fontWeight: 600 }}>
                    <CheckCircle2 size={18} color="#16a34a" /> Centralized shipment management & dispatch
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#1e293b', fontWeight: 600 }}>
                    <CheckCircle2 size={18} color="#16a34a" /> Fleet and driver telematics visibility
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#1e293b', fontWeight: 600 }}>
                    <CheckCircle2 size={18} color="#16a34a" /> Real-time corridor shipment tracking
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#1e293b', fontWeight: 600 }}>
                    <CheckCircle2 size={18} color="#16a34a" /> Operational reporting & GST billing integration
                  </div>
                </div>

                <Link to="/platform" className="pr-btn-primary" style={{ padding: '12px 24px', fontSize: '14px' }}>
                  <span>Discover PrimeRoute</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </section>



        {/* 5. PLATFORM / CONTROL TOWER PREVIEW */}
        <section style={{ padding: '80px 0', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div className="pr-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px', marginBottom: '40px' }}>
              <div style={{ maxWidth: '640px' }}>
                <div className="pr-section-tag" style={{ marginBottom: '10px' }}>
                  <span>Central Platform</span>
                </div>
                <h2 style={{ fontSize: '30px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 10px' }}>
                  Complete Visibility Across Your Logistics Operation
                </h2>
                <p style={{ fontSize: '15.5px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  A unified control tower synchronizing dispatchers, warehouse hubs, road haulers, and corporate clients.
                </p>
              </div>

              <Link to="/platform" className="pr-btn-primary" style={{ padding: '11px 22px', fontSize: '14px' }}>
                <span>Explore Platform</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* Realistic TMS Interface Frame */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
              }}
            >
              {/* Top Header */}
              <div
                style={{
                  padding: '14px 20px',
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
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                    Control Tower Live Feed — Highway Corridors
                  </span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, background: '#f0fdf4', color: '#16a34a', padding: '3px 8px', borderRadius: '4px' }}>
                  All Systems Operational
                </span>
              </div>

              {/* 4 KPI Strip */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '1px',
                  background: '#e2e8f0',
                  borderBottom: '1px solid #e2e8f0',
                }}
              >
                <div style={{ background: '#ffffff', padding: '16px 20px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Shipments Managed</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{stats ? stats.shipmentsManaged : '11'}</div>
                </div>
                <div style={{ background: '#ffffff', padding: '16px 20px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>In Transit</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#2563eb', marginTop: '2px' }}>{stats ? `${stats.inTransitShipments} Active` : '3 Active'}</div>
                </div>
                <div style={{ background: '#ffffff', padding: '16px 20px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Delivered</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#16a34a', marginTop: '2px' }}>{stats ? stats.deliveredShipments : '1'}</div>
                </div>
                <div style={{ background: '#ffffff', padding: '16px 20px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Active Clients</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{stats ? stats.activeCustomers : '15'}</div>
                </div>
              </div>

              {/* Live Consignments Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <th style={{ padding: '12px 18px' }}>Tracking ID</th>
                      <th style={{ padding: '12px 18px' }}>Customer</th>
                      <th style={{ padding: '12px 18px' }}>Corridor Route</th>
                      <th style={{ padding: '12px 18px' }}>Status</th>
                      <th style={{ padding: '12px 18px' }}>ETA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveControlShipments.map((ship) => (
                      <tr key={ship.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
                          {ship.id}
                        </td>
                        <td style={{ padding: '14px 18px', color: '#334155', fontWeight: 600 }}>
                          {ship.customer}
                        </td>
                        <td style={{ padding: '14px 18px', color: '#64748b' }}>
                          {ship.route}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span
                            style={{
                              fontSize: '11.5px',
                              fontWeight: 600,
                              padding: '3px 8px',
                              borderRadius: '4px',
                              color: ship.color,
                              background: ship.bg,
                            }}
                          >
                            ● {ship.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px', color: '#0f172a', fontWeight: 600 }}>
                          {ship.eta}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* 6. TRACKING SECTION (DEDICATED PREVIEW) */}
        <section style={{ padding: '80px 0', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
          <div className="pr-container">
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                padding: '36px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '36px', alignItems: 'center' }}>
                {/* Left: Shipment Info */}
                <div>
                  <div className="pr-section-tag" style={{ marginBottom: '10px' }}>
                    <span>Consignment Tracking</span>
                  </div>
                  <h3 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>
                    Track Every Shipment From Pickup to Delivery
                  </h3>
                  <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.6, margin: '0 0 24px' }}>
                    Full milestone timestamps, driver contact, and GPS telematics across every transit leg.
                  </p>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 800, fontFamily: 'monospace', color: '#0f172a' }}>
                        TRK-PR-ORD-71673158
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '4px' }}>
                        SCHEDULED TRANSIT
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#475569' }}>
                      Cuttack Logistics Center → Bengaluru Tech Park
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      Standard Linehaul Delivery Route
                    </div>
                  </div>

                  <Link to="/tracking" className="pr-btn-primary" style={{ padding: '11px 22px', fontSize: '14px' }}>
                    <span>Track Your Shipment</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>

                {/* Right: Map & Progress Timeline */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '24px' }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '16px' }}>
                    Shipment Progress Timeline
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#16a34a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                        ✓
                      </div>
                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}>
                        Order Created — Consignment Label Issued
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#16a34a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                        ✓
                      </div>
                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}>
                        Picked Up — Origin Feeder Handover
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#16a34a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                        ✓
                      </div>
                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}>
                        At Warehouse — Staged at Hub WH-03
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#16a34a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                        ✓
                      </div>
                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}>
                        Dispatched — Gate Out Verified
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                        ●
                      </div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#2563eb' }}>
                        In Transit — Pune Highway Corridor (Live)
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: '2px solid #cbd5e1', background: '#ffffff' }}></div>
                      <div style={{ fontSize: '13.5px', color: '#94a3b8' }}>
                        Out for Delivery — Mumbai Terminal
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: '2px solid #cbd5e1', background: '#ffffff' }}></div>
                      <div style={{ fontSize: '13.5px', color: '#94a3b8' }}>
                        Delivered — Electronic Proof of Delivery
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. PROFESSIONAL TESTIMONIALS SECTION */}
        <section style={{ padding: '72px 0', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div className="pr-container">
            <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
              <div className="pr-section-tag" style={{ marginBottom: '10px' }}>
                <span>Client Trust</span>
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>
                Trusted by Enterprise Operations Teams
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <Quote size={28} color="#2563eb" style={{ marginBottom: '12px', opacity: 0.6 }} />
                <p style={{ fontSize: '14.5px', color: '#334155', lineHeight: 1.6, fontStyle: 'italic', margin: '0 0 18px' }}>
                  "PrimeRoute gives our operations team a single view of orders, vehicles and deliveries. We spend less time switching between systems and more time managing exceptions."
                </p>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Operations Manager</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Industrial Manufacturing Client</div>
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <Quote size={28} color="#2563eb" style={{ marginBottom: '12px', opacity: 0.6 }} />
                <p style={{ fontSize: '14.5px', color: '#334155', lineHeight: 1.6, fontStyle: 'italic', margin: '0 0 18px' }}>
                  "The warehouse bin tracking and automated dispatch manifests have reduced our dock loading turnaround times by nearly 30 percent."
                </p>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Logistics Director</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Commercial Retail Supply Chain</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. REQUEST A QUOTE EXPERIENCE (B2B ENQUIRY FORM) */}
        <section id="quote" style={{ padding: '80px 0', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
          <div className="pr-container">
            <div style={{ maxWidth: '820px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                <div className="pr-section-tag" style={{ margin: '0 auto 10px' }}>
                  <span>Get Started Today</span>
                </div>
                <h2 style={{ fontSize: '30px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>
                  Request a Freight & Logistics Quote
                </h2>
                <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
                  Tell us about your cargo volume and corridor requirements. Our logistics team will respond within 2 business hours.
                </p>
              </div>

              {quoteSubmitted ? (
                <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', padding: '36px', textAlign: 'center' }}>
                  <CheckCircle size={44} color="#16a34a" style={{ margin: '0 auto 14px' }} />
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
                    Quotation Request Received
                  </h3>
                  <p style={{ fontSize: '14.5px', color: '#475569', maxWidth: '520px', margin: '0 auto 20px' }}>
                    Thank you, <strong>{quoteData.contactName}</strong>. Our logistics operations team for the <strong>{quoteData.origin} → {quoteData.destination}</strong> corridor has received your inquiry.
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
                    style={{ padding: '10px 20px', fontSize: '13.5px' }}
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
                      <label className="pr-form-label">Origin City / Hub *</label>
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
                        placeholder="e.g. 2,500 kg"
                        className="pr-form-input"
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label className="pr-form-label">Additional Requirements or Dimensions</label>
                    <textarea
                      rows={3}
                      value={quoteData.message}
                      onChange={(e) => setQuoteData({ ...quoteData, message: e.target.value })}
                      placeholder="Special handling instructions, recurring schedule, pallet counts, temperature control..."
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
