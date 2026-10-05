import React from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ArrowRight,
  ArrowLeft,
  Truck,
  Warehouse,
  BarChart3,
  Sparkles,
  MapPin
} from 'lucide-react';
import truckWatermark from '../assets/hero_real_highway_truck.jpg';
import warehouseWatermark from '../assets/cargo_warehouse_terminal.jpg';

export default function SignInPortal() {
  const portals = [
    {
      id: 'portal-card-customer',
      title: 'CUSTOMER PORTAL',
      route: '/signin/customer',
      category: 'Customer Workspace',
      badgeClass: 'customer',
      ctaText: 'Enter Customer Portal',
      accentColor: '#F97316',
      dotColor: '#F97316',
      icon: <Package size={26} strokeWidth={2.2} />,
      functions: [
        'Book shipments',
        'Track orders',
        'Manage deliveries'
      ]
    },
    {
      id: 'portal-card-admin',
      title: 'ADMIN PORTAL',
      route: '/signin/admin',
      category: 'Operations Control',
      badgeClass: 'admin',
      ctaText: 'Enter Admin Portal',
      accentColor: '#6D3DF5',
      dotColor: '#6D3DF5',
      icon: <BarChart3 size={26} strokeWidth={2.2} />,
      functions: [
        'Manage operations',
        'Fleet & Drivers',
        'Orders & Corridors'
      ]
    },
    {
      id: 'portal-card-warehouse',
      title: 'WAREHOUSE PORTAL',
      route: '/signin/warehouse',
      category: 'Hub Operations',
      badgeClass: 'warehouse',
      ctaText: 'Enter Warehouse Portal',
      accentColor: '#10B981',
      dotColor: '#10B981',
      icon: <Warehouse size={26} strokeWidth={2.2} />,
      functions: [
        'Inventory & Stock',
        'Inbound & Outbound',
        'Fleet Dispatch Console'
      ]
    },
    {
      id: 'portal-card-driver',
      title: 'DRIVER PORTAL',
      route: '/signin/driver',
      category: 'Fleet Delivery',
      badgeClass: 'driver',
      ctaText: 'Enter Driver Portal',
      accentColor: '#2563EB',
      dotColor: '#2563EB',
      icon: <Truck size={26} strokeWidth={2.2} />,
      functions: [
        'Assigned Deliveries',
        'Turn-by-Turn Route',
        'Proof of Delivery (ePOD)'
      ]
    }
  ];

  return (
    <div className="pr-portal-light-wrapper">
      {/* ── 1. ATMOSPHERIC LIGHTING & GLOWS ── */}
      <div className="pr-portal-light-glow-1" />
      <div className="pr-portal-light-glow-2" />

      {/* Central Card Readability Highlight (Ensures 100% Contrast) */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -20%)',
          width: 'min(1280px, 92vw)',
          height: '560px',
          background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.94) 0%, rgba(248, 250, 252, 0.8) 60%, transparent 100%)',
          filter: 'blur(30px)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* Enterprise Route & Logistics Map Mesh Overlay */}
      <div className="pr-portal-light-grid" />

      {/* ── 2. SUBTLE LOGISTICS-THEMED WATERMARK VISUALS LAYER ── */}
      <div className="pr-portal-bg-decorations" aria-hidden="true">
        {/* TOP-LEFT: High-Altitude Cargo Airliner Soaring Toward Center */}
        <div className="pr-portal-plane-watermark">
          <svg viewBox="0 0 380 220" fill="none" style={{ width: '100%', height: 'auto' }}>
            {/* Contrail / Flight Corridor Stream */}
            <path
              d="M 10 180 C 80 160, 160 120, 240 70"
              stroke="#bfdbfe"
              strokeWidth="2.5"
              strokeDasharray="6 8"
              opacity="0.8"
            />
            <path
              d="M 25 195 C 95 175, 175 135, 255 85"
              stroke="#dbeafe"
              strokeWidth="1.5"
              strokeDasharray="4 6"
              opacity="0.6"
            />
            {/* Cargo Aircraft Fuselage & Wings (Tilted at climbing flight angle) */}
            <g transform="translate(190, 30) rotate(-18) scale(0.9)">
              {/* Main Fuselage */}
              <path
                d="M 0 50 C 40 46, 120 40, 170 48 C 185 50, 195 55, 198 60 C 195 65, 185 68, 160 68 C 100 68, 40 64, 0 60 Z"
                fill="#cbd5e1"
                opacity="0.65"
              />
              {/* Swept Back Wings */}
              <path
                d="M 65 48 L 10 0 L 32 0 L 110 46 Z"
                fill="#94a3b8"
                opacity="0.55"
              />
              <path
                d="M 75 66 L 35 125 L 52 125 L 118 67 Z"
                fill="#94a3b8"
                opacity="0.55"
              />
              {/* Tail Fin */}
              <path
                d="M 5 48 L -30 10 L -12 10 L 25 49 Z"
                fill="#64748b"
                opacity="0.5"
              />
              {/* Engine Nacelles */}
              <ellipse cx="68" cy="30" rx="14" ry="4.5" fill="#64748b" opacity="0.6" />
              <ellipse cx="80" cy="85" rx="14" ry="4.5" fill="#64748b" opacity="0.6" />
              {/* Windshield Cockpit Glint */}
              <path d="M 180 51 Q 190 53 194 57 L 182 56 Z" fill="#2563eb" opacity="0.4" />
            </g>
          </svg>
        </div>

        {/* TOP-RIGHT: Global Dotted World Map Network with Location Pins */}
        <div className="pr-portal-worldmap-watermark">
          <svg viewBox="0 0 520 280" fill="none" style={{ width: '100%', height: 'auto' }}>
            {/* Dotted Global Grid Coordinates */}
            <g fill="#94a3b8" opacity="0.4">
              <circle cx="80" cy="90" r="1.5" /><circle cx="100" cy="90" r="1.5" /><circle cx="120" cy="90" r="1.5" />
              <circle cx="90" cy="110" r="1.5" /><circle cx="110" cy="110" r="1.5" /><circle cx="130" cy="110" r="1.5" />
              <circle cx="210" cy="70" r="1.5" /><circle cx="230" cy="70" r="1.5" /><circle cx="250" cy="70" r="1.5" />
              <circle cx="200" cy="90" r="1.5" /><circle cx="220" cy="90" r="1.5" /><circle cx="240" cy="90" r="1.5" /><circle cx="260" cy="90" r="1.5" />
              <circle cx="210" cy="110" r="1.5" /><circle cx="230" cy="110" r="1.5" /><circle cx="250" cy="110" r="1.5" /><circle cx="270" cy="110" r="1.5" />
              <circle cx="340" cy="80" r="1.5" /><circle cx="360" cy="80" r="1.5" /><circle cx="380" cy="80" r="1.5" /><circle cx="400" cy="80" r="1.5" />
              <circle cx="350" cy="100" r="1.5" /><circle cx="370" cy="100" r="1.5" /><circle cx="390" cy="100" r="1.5" /><circle cx="410" cy="100" r="1.5" />
              <circle cx="360" cy="120" r="1.5" /><circle cx="380" cy="120" r="1.5" /><circle cx="400" cy="120" r="1.5" /><circle cx="420" cy="120" r="1.5" />
              <circle cx="370" cy="140" r="1.5" /><circle cx="390" cy="140" r="1.5" /><circle cx="410" cy="140" r="1.5" />
            </g>

            {/* Intercontinental Curved Flight / Sea Routes */}
            <path
              d="M 120 100 Q 230 40 370 90"
              stroke="#60a5fa"
              strokeWidth="1.6"
              strokeDasharray="5 6"
              opacity="0.65"
            />
            <path
              d="M 240 100 Q 320 150 410 130"
              stroke="#38bdf8"
              strokeWidth="1.4"
              strokeDasharray="4 6"
              opacity="0.6"
            />
            <path
              d="M 370 90 Q 430 70 480 110"
              stroke="#93c5fd"
              strokeWidth="1.2"
              strokeDasharray="3 5"
              opacity="0.5"
            />

            {/* Hub Location Markers with Pulsing Radar Rings */}
            {/* Hub 1 */}
            <g transform="translate(120, 100)">
              <circle cx="0" cy="0" r="8" fill="#2563eb" opacity="0.15" />
              <circle cx="0" cy="0" r="3.5" fill="#2563eb" />
              <circle cx="0" cy="0" r="1.5" fill="#ffffff" />
            </g>
            {/* Hub 2 */}
            <g transform="translate(240, 95)">
              <circle cx="0" cy="0" r="10" fill="#2563eb" opacity="0.18" />
              <circle cx="0" cy="0" r="4" fill="#2563eb" />
              <circle cx="0" cy="0" r="1.8" fill="#ffffff" />
            </g>
            {/* Hub 3 */}
            <g transform="translate(370, 90)">
              <circle cx="0" cy="0" r="10" fill="#0284c7" opacity="0.18" />
              <circle cx="0" cy="0" r="4" fill="#0284c7" />
              <circle cx="0" cy="0" r="1.8" fill="#ffffff" />
            </g>
            {/* Hub 4 */}
            <g transform="translate(410, 130)">
              <circle cx="0" cy="0" r="8" fill="#059669" opacity="0.15" />
              <circle cx="0" cy="0" r="3.5" fill="#059669" />
              <circle cx="0" cy="0" r="1.5" fill="#ffffff" />
            </g>
          </svg>
        </div>

        {/* BOTTOM-LEFT: Highway Freight Truck Photo Watermark */}
        <img
          src={truckWatermark}
          alt=""
          className="pr-portal-truck-watermark"
        />

        {/* BOTTOM-RIGHT: Multimodal Warehouse Hub / Containers / Forklift Watermark */}
        <img
          src={warehouseWatermark}
          alt=""
          className="pr-portal-warehouse-watermark"
        />

        {/* Subtle Route Arcs Across Bottom */}
        <svg
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '240px',
            pointerEvents: 'none',
          }}
        >
          <path
            d="M -50 180 Q 400 60 850 150 T 1700 80"
            fill="none"
            stroke="#bfdbfe"
            strokeWidth="1.5"
            strokeDasharray="6 8"
            opacity="0.45"
          />
          <path
            d="M 100 220 Q 600 120 1100 180 T 1800 130"
            fill="none"
            stroke="#dbeafe"
            strokeWidth="1.2"
            strokeDasharray="4 6"
            opacity="0.35"
          />
        </svg>
      </div>

      {/* ── 3. ENTERPRISE WATERMARK STAMPS (Matching Reference Layout) ── */}
      <div className="pr-portal-stamp-left">
        <span style={{ display: 'block', width: '20px', height: '2px', background: '#2563eb', marginBottom: '8px' }} />
        MOVING<br />
        BUSINESSES<br />
        FORWARD
      </div>

      <div className="pr-portal-stamp-right">
        SAFE<br />
        RELIABLE<br />
        EFFICIENT<br />
        TOGETHER
        <span style={{ display: 'inline-block', width: '20px', height: '2px', background: '#2563eb', marginTop: '8px' }} />
      </div>

      {/* ── 4. TOP HEADER ── */}
      <header
        style={{
          padding: '24px 24px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          zIndex: 10,
          maxWidth: '1240px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* PrimeRoute Logo & Tagline */}
        <div>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '17px',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.28)',
              }}
            >
              <span>PR</span>
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                PrimeRoute
              </div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#2563eb', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                LOGISTICS
              </div>
            </div>
          </Link>
          <div style={{ marginTop: '6px', fontSize: '12px', color: '#64748b', fontWeight: 500, letterSpacing: '0.02em' }}>
            Connected Logistics. Smarter Tomorrow.
          </div>
        </div>

        {/* Right Header Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="pr-portal-tagline" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            <span>GLOBAL REACH</span>
            <span style={{ width: '16px', height: '1.5px', background: '#0284c7' }} />
            <span>LOCAL COMMITMENT</span>
          </div>

          <Link
            to="/"
            className="pr-btn-back-home"
          >
            <ArrowLeft size={15} strokeWidth={2.4} />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* ── 5. MAIN HERO & 4 PORTAL ENTRY CARDS ── */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px 24px 32px',
          position: 'relative',
          zIndex: 10,
          maxWidth: '1240px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* CENTER HERO */}
        <div style={{ textAlign: 'center', marginBottom: '32px', maxWidth: '820px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '9999px',
              padding: '5px 16px',
              fontSize: '12px',
              color: '#1d4ed8',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: '14px',
              boxShadow: '0 1px 2px rgba(37, 99, 235, 0.06)',
            }}
          >
            <Sparkles size={13} />
            <span>PRIMEROUTE ENTERPRISE PLATFORM</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(32px, 4.2vw, 48px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.18,
              color: '#0f172a',
              margin: '0 0 12px',
            }}
          >
            Welcome to <span style={{ color: '#2563eb' }}>PrimeRoute</span>
          </h1>

          <p
            style={{
              fontSize: '16px',
              color: '#475569',
              margin: 0,
              fontWeight: 400,
              lineHeight: 1.62,
              maxWidth: '700px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Select the portal you want to access and manage your logistics operations with real-time visibility, control, and efficiency.
          </p>
        </div>

        {/* 4 ENTERPRISE PORTAL CARDS */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '22px',
            width: '100%',
            maxWidth: '1220px',
            position: 'relative',
            zIndex: 10,
          }}
        >
          {portals.map((portal) => (
            <Link
              key={portal.id}
              to={portal.route}
              id={portal.id}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className={`pr-portal-entry-card ${portal.badgeClass}`}>
                {/* Dimensional Logistics Icon Badge */}
                <div className={`pr-portal-3d-badge ${portal.badgeClass}`}>
                  {portal.icon}
                </div>

                {/* Small Portal Category Label */}
                <div className={`pr-portal-cat-pill ${portal.badgeClass}`}>
                  {portal.category}
                </div>

                {/* Title & 3 Functions */}
                <div>
                  <h2
                    style={{
                      fontSize: '19px',
                      fontWeight: 800,
                      color: '#0f172a',
                      margin: '0 0 14px',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {portal.title}
                  </h2>

                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '9px',
                    }}
                  >
                    {portal.functions.map((fn, idx) => (
                      <li
                        key={idx}
                        style={{
                          fontSize: '13.8px',
                          color: '#334155',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '9px',
                          fontWeight: 500,
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: portal.dotColor,
                            flexShrink: 0,
                          }}
                        />
                        <span>{fn}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Clear CTA with Arrow Icon and Hover Animation */}
                <div className="pr-portal-cta-row" style={{ color: portal.accentColor }}>
                  <span>{portal.ctaText} →</span>
                  <ArrowRight size={17} strokeWidth={2.2} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── 6. ENTERPRISE DIVIDER BAR ── */}
        <div className="pr-portal-divider-bar">
          <span className="pr-portal-divider-line" />
          <span>PEOPLE • ROUTES • SHIPMENTS • OPPORTUNITIES</span>
          <span className="pr-portal-divider-line" />
        </div>

        {/* Footer Prompt */}
        <p
          style={{
            margin: '12px 0 0',
            fontSize: '13.5px',
            color: '#64748b',
            textAlign: 'center',
            position: 'relative',
            zIndex: 10,
          }}
        >
          New to PrimeRoute?{' '}
          <Link
            to="/signin/customer"
            style={{
              color: '#2563eb',
              textDecoration: 'none',
              fontWeight: 600,
              marginLeft: '4px',
            }}
          >
            Create a customer account
          </Link>
        </p>

        {/* ── 7. BOTTOM ACCENT WATERMARK TAGS ── */}
        <div className="pr-portal-bottom-tags">
          <div className="pr-portal-bottom-tag">
            <span style={{ width: '16px', height: '1.5px', background: '#2563eb' }} />
            <span>A MORE CONNECTED SUPPLY CHAIN</span>
          </div>
          <div className="pr-portal-bottom-tag">
            <span>DELIVERING A BRIGHTER TOMORROW</span>
            <span style={{ width: '16px', height: '1.5px', background: '#2563eb' }} />
          </div>
        </div>
      </main>
    </div>
  );
}
