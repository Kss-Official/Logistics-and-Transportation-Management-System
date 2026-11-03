import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ArrowDown,
  Navigation,
  ShieldCheck,
  Radio,
  Clock,
  Truck,
  MapPin,
  Users,
  Leaf
} from 'lucide-react';
import type { PublicStatistics } from '../../services/publicService';

// High quality cinematic realistic logistics imagery
import imgHighway from '../../assets/hero_real_highway_truck.jpg';
import imgPort from '../../assets/hero_real_port_terminal.jpg';
import imgWarehouse from '../../assets/cargo_warehouse_terminal.jpg';
import imgFleet from '../../assets/corporate_road_freight.jpg';

interface HeroEditorialProps {
  stats?: PublicStatistics | null;
  loadingStats?: boolean;
}

const HERO_SCENES = [
  {
    id: '01',
    name: 'HIGHWAY',
    subtitle: 'Truck Transportation & Linehaul Corridor',
    image: imgHighway,
    badge: 'CORRIDOR LINEHAUL',
    overlayWord: 'PRIME',
    activeShipment: 'BENGALURU → KOLKATA',
    eta: '06 OCT • 4:30 PM',
  },
  {
    id: '02',
    name: 'PORT',
    subtitle: 'Container Logistics & Intermodal Terminals',
    image: imgPort,
    badge: 'INTERMODAL GATEWAY',
    overlayWord: 'ROUTE',
    activeShipment: 'MUMBAI PORT → CHENNAI',
    eta: '07 OCT • 11:00 AM',
  },
  {
    id: '03',
    name: 'WAREHOUSE',
    subtitle: 'High-Bay Fulfillment & Staging Hubs',
    image: imgWarehouse,
    badge: 'DISTRIBUTION HUB',
    overlayWord: 'LOGISTICS',
    activeShipment: 'HYDERABAD DC → PUNE',
    eta: '06 OCT • 8:15 PM',
  },
  {
    id: '04',
    name: 'FLEET',
    subtitle: 'Commercial Fleet & Real-Time Telematics',
    image: imgFleet,
    badge: 'CONNECTED FLEET',
    overlayWord: 'SYSTEMS',
    activeShipment: 'DELHI HUB → JAIPUR',
    eta: 'TODAY • 02:45 PM',
  },
];

export default function HeroEditorial({ stats, loadingStats }: HeroEditorialProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const SLIDE_DURATION = 5000; // 5s per scene
  const STEP_INTERVAL = 50;

  const resetTimers = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    setProgress(0);

    const startTime = Date.now();
    progressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / SLIDE_DURATION) * 100);
      setProgress(pct);
    }, STEP_INTERVAL);

    timerRef.current = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % HERO_SCENES.length);
      resetTimers();
    }, SLIDE_DURATION);
  }, []);

  useEffect(() => {
    resetTimers();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [resetTimers]);

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % HERO_SCENES.length);
    resetTimers();
  };

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev - 1 + HERO_SCENES.length) % HERO_SCENES.length);
    resetTimers();
  };

  const activeScene = HERO_SCENES[currentIdx];

  // Dynamic metrics from DB with fallback
  const activeCount = stats?.inTransitShipments ? `${stats.inTransitShipments}` : '1,248';
  const deliveredCount = stats?.deliveredShipments ? `${stats.deliveredShipments}` : '8,940';

  return (
    <>
      <section className="editorial-hero" aria-label="PrimeRoute Logistics Hero Showcase">
        {/* 1. Full Bleed Photography Carousel */}
        <div className="editorial-hero-slides">
          {HERO_SCENES.map((scene, idx) => (
            <div
              key={scene.id}
              className={`editorial-hero-slide ${idx === currentIdx ? 'active' : ''}`}
              style={{ backgroundImage: `url(${scene.image})` }}
            />
          ))}
        </div>

        {/* 2. Cinematic Gradients */}
        <div className="editorial-hero-overlay" />
        <div className="editorial-hero-overlay-radial" />

        {/* 3. Oversized Asymmetric Typography Overlapping Image */}
        <div className="editorial-hero-backdrop-word" aria-hidden="true">
          {activeScene.overlayWord}
        </div>

        {/* 4. Vertical Scroll Indicator (Right Margin) */}
        <div className="editorial-scroll-indicator" aria-hidden="true">
          <span className="editorial-scroll-text">SCROLL TO EXPLORE</span>
          <ArrowDown size={14} className="editorial-scroll-arrow" />
        </div>

        {/* 5. Main Hero Container (Asymmetric Lower-Left Anchored) */}
        <div className="editorial-hero-container">
          <div className="editorial-hero-content-grid">
            {/* Lower-Left Content */}
            <div className="editorial-hero-anchor">
              <div className="editorial-hero-tag">
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38bdf8', display: 'inline-block' }} />
                <span>SMART LOGISTICS • STRONGER TOMORROWS</span>
              </div>

              <h1 className="editorial-hero-headline">
                MOVE SMARTER.<br />
                <span className="highlight">DELIVER FASTER.</span>
              </h1>

              <p className="editorial-hero-sub">
                Technology-driven transportation infrastructure for modern supply chains.
                Unifying fleet execution, multi-hub warehousing, and real-time tracking.
              </p>

              <div className="editorial-hero-actions">
                <Link to="/register" className="editorial-btn-hero-primary">
                  <span>GET STARTED</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/tracking" className="editorial-btn-hero-glass">
                  <span>TRACK SHIPMENT</span>
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>

            {/* Floating Logistics Overlays (Editorial Badges) */}
            <div className="editorial-hero-floating-column">
              {/* Live Transit Badge */}
              <div className="editorial-telemetry-badge">
                <div className="editorial-badge-label">
                  <span>IN TRANSIT</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4ade80' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                    LIVE
                  </span>
                </div>
                <div className="editorial-badge-value">
                  {activeScene.activeShipment}
                </div>
                <div className="editorial-badge-detail">
                  ETA: {activeScene.eta} • Express Highway Corridor
                </div>
              </div>

              {/* Performance KPI Badge */}
              <div className="editorial-telemetry-badge">
                <div className="editorial-badge-label">
                  <span>OPERATIONAL SLA</span>
                  <ShieldCheck size={13} color="#38bdf8" />
                </div>
                <div className="editorial-badge-value">
                  98.6% <span style={{ fontSize: '14px', color: '#94a3b8', fontFamily: 'var(--pr-font-body)' }}>ON-TIME</span>
                </div>
                <div className="editorial-badge-detail">
                  {activeCount} active consignments tracked in real time
                </div>
              </div>
            </div>
          </div>

          {/* 6. Slide System (01 / 04 with horizontal progress bar) */}
          <div className="editorial-slider-bar">
            <div className="editorial-slide-counter">
              <span className="current">{activeScene.id}</span>
              <span className="total">/ 04</span>
            </div>

            <div className="editorial-slide-progress-track">
              <div
                className="editorial-slide-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="editorial-slide-title">
              {activeScene.name} — {activeScene.subtitle}
            </div>

            <div className="editorial-slider-arrows">
              <button
                onClick={handlePrev}
                className="editorial-slide-arrow-btn"
                aria-label="Previous scene"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNext}
                className="editorial-slide-arrow-btn"
                aria-label="Next scene"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4 COMPACT BENEFIT ITEMS WITH CIRCULAR BADGES ── */}
      <div className="editorial-hero-feature-strip-wrapper">
        <div className="editorial-container">
          <div className="editorial-hero-feature-strip">
            {/* Item 1 */}
            <div className="editorial-feature-item">
              <div className="editorial-feature-icon">
                <MapPin size={22} />
              </div>
              <div className="editorial-feature-text">
                Real-Time<br />Tracking
              </div>
            </div>

            <div className="editorial-feature-divider" />

            {/* Item 2 */}
            <div className="editorial-feature-item">
              <div className="editorial-feature-icon">
                <ShieldCheck size={22} />
              </div>
              <div className="editorial-feature-text">
                Secure &<br />Reliable
              </div>
            </div>

            <div className="editorial-feature-divider" />

            {/* Item 3 */}
            <div className="editorial-feature-item">
              <div className="editorial-feature-icon">
                <Users size={22} />
              </div>
              <div className="editorial-feature-text">
                Pan-India<br />Network
              </div>
            </div>

            <div className="editorial-feature-divider" />

            {/* Item 4 */}
            <div className="editorial-feature-item">
              <div className="editorial-feature-icon">
                <Leaf size={22} />
              </div>
              <div className="editorial-feature-text">
                Sustainable<br />Logistics
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
