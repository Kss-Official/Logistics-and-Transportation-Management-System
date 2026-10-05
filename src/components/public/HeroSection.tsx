import React, { useState, useEffect, useCallback } from 'react';
import {
  Truck,
  MapPin,
  ShieldCheck,
  Users,
  Leaf,
  Package,
  Headphones,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import img1HighwayTruck from '../../assets/hero_real_highway_truck.jpg';
import img2PrimeRouteHub from '../../assets/hero_real_primeroute_hub.jpg';
import img3IntermodalCargo from '../../assets/hero_real_intermodal_cargo.jpg';
import img4ExpressBridge from '../../assets/hero_real_express_bridge.jpg';
import type { PublicStatistics } from '../../services/publicService';

// The 4 user-selected realistic logistics images for the automatic hero carousel
const CAROUSEL_SLIDES = [
  {
    id: 1,
    image: img1HighwayTruck,
    alt: 'PrimeRoute Logistics highway freight transportation and container port at sunset',
    badge: 'HIGHWAY FREIGHT',
  },
  {
    id: 2,
    image: img2PrimeRouteHub,
    alt: 'PrimeRoute Logistics multimodal operations hub, truck fleet, and air freight cargo',
    badge: 'MULTIMODAL HUB',
  },
  {
    id: 3,
    image: img3IntermodalCargo,
    alt: 'PrimeRoute Logistics warehouse fulfillment, cargo aviation, and logistics vessel',
    badge: 'INTERMODAL CARGO',
  },
  {
    id: 4,
    image: img4ExpressBridge,
    alt: 'PrimeRoute Logistics container truck on elevated express bridge with warehouse hub and city skyline',
    badge: 'EXPRESS CORRIDOR',
  },
];

interface HeroSectionProps {
  stats?: PublicStatistics | null;
  loadingStats?: boolean;
}

// Centralized fallback statistics values for development & resilient rendering
const FALLBACK_STATS = {
  activeCustomers: '17+',
  shipmentsManaged: '29+',
  deliveredShipments: '7+',
  supportAvailability: '24/7',
};

export default function HeroSection({ stats, loadingStats }: HeroSectionProps) {
  // Automatic slideshow state for 4 provided logistics images
  const [currentSlide, setCurrentSlide] = useState(0);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  // Automatic slideshow: resets and starts a clean 4-second (4000ms) interval
  const resetAndStartTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 4000);
  }, []);

  // Initialize 4-second continuous rotation on mount & clean up interval on unmount
  useEffect(() => {
    resetAndStartTimer();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [resetAndStartTimer]);

  // Handlers for manual arrow/dot interactions that smoothly advance and restart the 4s timer
  const handleNextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    resetAndStartTimer();
  }, [resetAndStartTimer]);

  const handlePrevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
    resetAndStartTimer();
  }, [resetAndStartTimer]);

  const handleSelectSlide = useCallback((index: number) => {
    setCurrentSlide(index);
    resetAndStartTimer();
  }, [resetAndStartTimer]);

  // Safe formatting for metrics with centralized fallbacks
  const activeCustomersDisplay = loadingStats
    ? '...'
    : stats?.activeCustomers != null
    ? `${stats.activeCustomers}+`
    : FALLBACK_STATS.activeCustomers;

  const shipmentsManagedDisplay = loadingStats
    ? '...'
    : stats?.shipmentsManaged != null
    ? `${stats.shipmentsManaged}+`
    : FALLBACK_STATS.shipmentsManaged;

  const deliveredShipmentsDisplay = loadingStats
    ? '...'
    : stats?.deliveredShipments != null
    ? `${stats.deliveredShipments}+`
    : FALLBACK_STATS.deliveredShipments;

  const supportDisplay = '24/7';

  return (
    <>
      {/* ── 1. REFINED HERO BANNER WITH PROTECTED TEXT SAFE ZONE ── */}
      <section
        className="pr-hero-banner"
        role="region"
        aria-roledescription="carousel"
        aria-label="PrimeRoute Logistics Global Operations Showcase"
      >
        {/* Subtle Logistics Telemetry & Route Network Background (Text Safe Zone) */}
        <div className="pr-hero-decorations" aria-hidden="true">
          <div className="pr-hero-dot-grid" />
          <svg
            className="pr-hero-routes-svg"
            viewBox="0 0 640 480"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            {/* Primary Waypoint Route Line */}
            <path
              d="M -20,280 C 120,260 210,360 340,320 S 480,180 660,200"
              stroke="#93C5FD"
              strokeWidth="1.5"
              strokeDasharray="4 6"
            />
            {/* Secondary Arterial Network Path */}
            <path
              d="M 40,80 C 180,60 260,170 390,130 S 520,70 650,90"
              stroke="#CBD5E1"
              strokeWidth="1.2"
              strokeDasharray="3 5"
            />
            {/* Subtle Diagonal Freight Corridor */}
            <path
              d="M 120,440 L 320,220 L 580,240"
              stroke="#BFDBFE"
              strokeWidth="1"
              strokeDasharray="2 4"
            />
            {/* Connected Logistics Nodes / Waypoints with Soft Halos */}
            <circle cx="210" cy="360" r="3.5" fill="#2563EB" />
            <circle cx="210" cy="360" r="8" stroke="#93C5FD" strokeWidth="1" />

            <circle cx="340" cy="320" r="4" fill="#1D4ED8" />
            <circle cx="340" cy="320" r="10" stroke="#BFDBFE" strokeWidth="1" />

            <circle cx="390" cy="130" r="3" fill="#3B82F6" />
            <circle cx="390" cy="130" r="7" stroke="#CBD5E1" strokeWidth="1" />

            <circle cx="480" cy="180" r="3.5" fill="#2563EB" />
            <circle cx="480" cy="180" r="9" stroke="#93C5FD" strokeWidth="1" />
          </svg>
        </div>

        {/* Visual Carousel Area (Right on Desktop, Below Text on Mobile) */}
        <div className="pr-hero-banner-visual">
          {/* Background Carousel Slides (Smooth 4s crossfade) */}
          <div className="pr-hero-banner-slides">
            {CAROUSEL_SLIDES.map((slide, index) => {
              const isActive = index === currentSlide;
              return (
                <div
                  key={slide.id}
                  className={`pr-hero-banner-slide ${isActive ? 'active' : ''}`}
                  aria-hidden={!isActive}
                >
                  <img
                    src={slide.image}
                    alt={slide.alt}
                    className="pr-hero-banner-image"
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                </div>
              );
            })}
          </div>

          {/* Soft Left Gradient Overlay for Crystal-Clear Text Legibility */}
          <div className="pr-hero-banner-gradient" aria-hidden="true" />

          {/* Top-Right Badge: GLOBAL REACH / LOCAL COMMITMENT */}
          <div className="pr-hero-banner-topright">
            <div className="pr-hero-banner-topright-text">
              GLOBAL REACH<br />LOCAL COMMITMENT
            </div>
          </div>

          {/* Circular Navigation Buttons: ‹ and › */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrevSlide();
            }}
            className="pr-hero-banner-nav-btn pr-hero-banner-prev"
            aria-label="Previous slide"
            title="Previous slide"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNextSlide();
            }}
            className="pr-hero-banner-nav-btn pr-hero-banner-next"
            aria-label="Next slide"
            title="Next slide"
          >
            <ChevronRight size={22} />
          </button>

          {/* 4 Horizontal Pill/Bar Pagination Indicators */}
          <div
            className="pr-hero-banner-indicators"
            role="tablist"
            aria-label="Hero image carousel pagination"
          >
            {CAROUSEL_SLIDES.map((slide, idx) => {
              const isActive = idx === currentSlide;
              return (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Go to slide ${idx + 1}: ${slide.badge}`}
                  onClick={() => handleSelectSlide(idx)}
                  className={`pr-hero-banner-bar ${isActive ? 'active' : ''}`}
                />
              );
            })}
          </div>
        </div>

        {/* Hero Left Content Container (Dedicated Text Safe Zone) */}
        <div className="pr-container pr-hero-banner-content-wrap">
          <div className="pr-hero-banner-left">
            {/* Eyebrow Label with Accent Dash */}
            <div className="pr-hero-eyebrow">
              <span className="pr-hero-eyebrow-dash" aria-hidden="true" />
              <span>SMART LOGISTICS. STRONGER TOMORROWS.</span>
            </div>

            {/* Large Bold Headline */}
            <h1 className="pr-hero-headline">
              <span className="pr-hero-headline-navy">Moving Businesses </span>
              <br />
              <span className="pr-hero-headline-blue">Forward</span>
              <span className="pr-hero-headline-navy">, Together</span>
            </h1>

            {/* Professional Description */}
            <p className="pr-hero-description">
              Technology-driven, reliable, and efficient freight transportation.
              We connect supply chains, warehouses, and nationwide fleets with
              real-time visibility and complete transparency.
            </p>

            {/* 4 Compact Benefit Items with Circular Badges */}
            <div className="pr-hero-benefits">
              <div className="pr-hero-benefit-item">
                <div className="pr-hero-benefit-icon">
                  <MapPin size={18} />
                </div>
                <div className="pr-hero-benefit-text">
                  Real-Time<br />Tracking
                </div>
              </div>

              <div className="pr-hero-benefit-item">
                <div className="pr-hero-benefit-icon">
                  <ShieldCheck size={18} />
                </div>
                <div className="pr-hero-benefit-text">
                  Secure &<br />Reliable
                </div>
              </div>

              <div className="pr-hero-benefit-item">
                <div className="pr-hero-benefit-icon">
                  <Users size={18} />
                </div>
                <div className="pr-hero-benefit-text">
                  Pan-India<br />Network
                </div>
              </div>

              <div className="pr-hero-benefit-item">
                <div className="pr-hero-benefit-icon">
                  <Leaf size={18} />
                </div>
                <div className="pr-hero-benefit-text">
                  Sustainable<br />Logistics
                </div>
              </div>
            </div>

            {/* ── SUBTLE LOGISTICS NETWORK ROUTE FLOW (TRANSITION TO STATS) ── */}
            <div className="pr-hero-network-strip" aria-hidden="true">
              <svg
                className="pr-hero-route-svg"
                viewBox="0 0 520 44"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Thin curved primary route line */}
                <path
                  d="M 24,24 C 80,12 140,34 200,20 C 260,4 320,36 380,18 C 430,6 470,22 496,20"
                  stroke="#BFDBFE"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />
                {/* Faint secondary arterial trajectory */}
                <path
                  d="M 60,30 C 130,34 210,14 290,26 C 370,38 430,26 480,22"
                  stroke="#DBEAFE"
                  strokeWidth="1"
                  strokeDasharray="2 4"
                />

                {/* Waypoint 1: Shipment */}
                <circle cx="34" cy="22" r="3.5" fill="#2563EB" />
                <circle cx="34" cy="22" r="7.5" stroke="#93C5FD" strokeWidth="1" />

                {/* Waypoint 2: Hub */}
                <circle cx="152" cy="19" r="3.5" fill="#3B82F6" />
                <circle cx="152" cy="19" r="7" stroke="#BFDBFE" strokeWidth="1" />

                {/* Waypoint 3: Warehouse (Pulsing central waypoint) */}
                <circle cx="266" cy="18" r="4.5" fill="#2563EB" />
                <circle cx="266" cy="18" r="10" stroke="#93C5FD" strokeWidth="1.2" className="pr-pulse-ring" />

                {/* Waypoint 4: Driver */}
                <circle cx="384" cy="20" r="3.5" fill="#3B82F6" />
                <circle cx="384" cy="20" r="7" stroke="#BFDBFE" strokeWidth="1" />

                {/* Waypoint 5: Delivery */}
                <circle cx="486" cy="21" r="4" fill="#1D4ED8" />
                <circle cx="486" cy="21" r="9" stroke="#93C5FD" strokeWidth="1" />
              </svg>

              {/* Waypoint Flow Nodes: SHIPMENT → HUB → WAREHOUSE → DRIVER → DELIVERY */}
              <div className="pr-hero-route-nodes">
                <div className="pr-route-node-pill">
                  <span className="pr-route-node-dot" />
                  <span>Shipment</span>
                </div>
                <span className="pr-route-arrow">→</span>
                <div className="pr-route-node-pill">
                  <span className="pr-route-node-dot" />
                  <span>Hub</span>
                </div>
                <span className="pr-route-arrow">→</span>
                <div className="pr-route-node-pill pr-route-node-active">
                  <span className="pr-route-node-dot pr-pulse" />
                  <span>Warehouse</span>
                </div>
                <span className="pr-route-arrow">→</span>
                <div className="pr-route-node-pill">
                  <span className="pr-route-node-dot" />
                  <span>Driver</span>
                </div>
                <span className="pr-route-arrow">→</span>
                <div className="pr-route-node-pill">
                  <span className="pr-route-node-dot" />
                  <span>Delivery</span>
                </div>
              </div>

              {/* 3 Micro Floating Logistics Badges */}
              <div className="pr-floating-marker pr-float-pack">
                <Package size={11} color="#2563EB" />
              </div>
              <div className="pr-floating-marker pr-float-truck">
                <Truck size={11} color="#3B82F6" />
              </div>
              <div className="pr-floating-marker pr-float-pin">
                <MapPin size={11} color="#2563EB" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. STATISTICS SECTION (Curved White Container matching Picture 5) ── */}
      <div className="pr-stats-section">
        <div className="pr-container">
          <div className="pr-hero-stats-card">
            {/* Stat 1: Active Customers */}
            <div className="pr-hero-stat-item">
              <div className="pr-hero-stat-icon">
                <Users size={24} color="#2563EB" />
              </div>
              <div>
                <div className="pr-hero-stat-number">{activeCustomersDisplay}</div>
                <div className="pr-hero-stat-label">Active Customers</div>
              </div>
            </div>

            {/* Stat 2: Shipments Managed */}
            <div className="pr-hero-stat-item">
              <div className="pr-hero-stat-icon">
                <Package size={24} color="#2563EB" />
              </div>
              <div>
                <div className="pr-hero-stat-number">{shipmentsManagedDisplay}</div>
                <div className="pr-hero-stat-label">Shipments Managed</div>
              </div>
            </div>

            {/* Stat 3: Delivered Shipments */}
            <div className="pr-hero-stat-item">
              <div className="pr-hero-stat-icon">
                <Truck size={24} color="#2563EB" />
              </div>
              <div>
                <div className="pr-hero-stat-number">{deliveredShipmentsDisplay}</div>
                <div className="pr-hero-stat-label">Delivered Shipments</div>
              </div>
            </div>

            {/* Stat 4: Customer Support */}
            <div className="pr-hero-stat-item">
              <div className="pr-hero-stat-icon">
                <Headphones size={24} color="#2563EB" />
              </div>
              <div>
                <div className="pr-hero-stat-number">{supportDisplay}</div>
                <div className="pr-hero-stat-label">Customer Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

