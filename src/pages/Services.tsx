import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PublicHeader from '../components/public/PublicHeader';
import PublicFooter from '../components/public/PublicFooter';
import {
  ArrowRight,
  Truck,
  Warehouse,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Globe,
  Sparkles,
  Zap,
  Package,
  Clock,
  Activity
} from 'lucide-react';

// Varied high-quality realistic logistics photography
import heroPortImg from '../assets/login_container_ship.jpg';
import ftlImg from '../assets/corporate_road_freight.jpg';
import ltlImg from '../assets/hero_real_highway_truck.jpg';
import whDistImg from '../assets/cargo_warehouse_terminal.jpg';
import lastMileImg from '../assets/lastmile_3d_delivery.jpg';
import specializedImg from '../assets/hero_real_intermodal_cargo.jpg';

const SERVICES_LIST = [
  {
    num: '01',
    title: 'FULL TRUCKLOAD (FTL)',
    subtitle: 'Dedicated National Linehaul',
    image: ftlImg,
    desc: 'Dedicated multi-axle vehicle capacity for large volume enterprise shipments with direct origin-to-destination corridor transit and expedited turnaround.',
    features: [
      'Point-to-point dedicated linehaul transport',
      'Tamper-evident digital electronic seals',
      'Predictive corridor transit benchmarks',
      'Priority dock booking & weighbridge sync'
    ],
    link: '/solutions#transportation',
  },
  {
    num: '02',
    title: 'LESS THAN TRUCKLOAD (LTL)',
    subtitle: 'Consolidated Commercial Freight',
    image: ltlImg,
    desc: 'Cost-effective consolidated freight transport with dynamic regional cross-dock sorting, barcode scanning, and multi-shipper capacity optimization.',
    features: [
      'Volumetric weight rate calculations',
      'Cross-dock transshipment staging hubs',
      'Scheduled departure linehaul corridors',
      'Full consignment milestone visibility'
    ],
    link: '/solutions#transportation',
  },
  {
    num: '03',
    title: 'WAREHOUSE & DISTRIBUTION',
    subtitle: 'Multi-Hub Staging & Fulfillment',
    image: whDistImg,
    desc: 'Scalable multi-hub warehousing infrastructure equipped with dynamic bin slotting, safety inventory thresholds, and automated dock dispatch manifests.',
    features: [
      'Real-time SKU & pallet count tracking',
      'Barcode inward receiving & QA inspection',
      'Safety stock automated reorder triggers',
      'Consolidation staging & outbound staging bays'
    ],
    link: '/solutions#warehouse',
  },
  {
    num: '04',
    title: 'LAST-MILE DELIVERY',
    subtitle: 'Urban & Doorstep Distribution',
    image: lastMileImg,
    desc: 'Precision doorstep delivery tailored for urban distribution, featuring recipient notification alerts, electronic Proof of Delivery (ePOD), and instant billing.',
    features: [
      'Turn-by-turn mobile driver route execution',
      'Recipient OTP & digital signature capture',
      'Automated customer SMS arrival alerts',
      'Instant GST invoice receipt downloads'
    ],
    link: '/solutions#fleet',
  },
  {
    num: '05',
    title: 'SPECIALIZED CARGO',
    subtitle: 'Secured & High-Value Transit',
    image: specializedImg,
    desc: 'Special handling protocols for sensitive, oversized, or high-value cargo with specialized tie-down equipment, escort telemetry, and insured protection.',
    features: [
      'Heavy machinery & oversized freight permits',
      'High-security GPS telemetry tracking',
      'Dedicated handling & fragile goods protocols',
      'Comprehensive transit protection coverage'
    ],
    link: '/contact',
  },
];

export default function Services() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <div className="editorial-root">
      <PublicHeader />

      <main>
        {/* ── 1. EDITORIAL HERO ── */}
        <section className="editorial-page-hero">
          <div className="editorial-page-hero-media">
            <img
              src={heroPortImg}
              alt="PrimeRoute Cargo Ship and Container Terminal"
              className="editorial-page-hero-img"
            />
          </div>
          <div className="editorial-page-hero-overlay" />

          <div className="editorial-page-hero-container">
            <div className="editorial-page-hero-content">
              <div className="editorial-page-hero-label">
                OUR SERVICES
              </div>

              <h1 className="editorial-page-hero-title">
                FLEXIBLE SERVICES<br />
                <span className="blue-highlight">FOR A CONNECTED WORLD.</span>
              </h1>

              <p className="editorial-page-hero-desc">
                From full truckload to last-mile delivery, we provide flexible and reliable logistics services tailored to your business needs.
              </p>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <a
                  href="#services-list"
                  className="editorial-btn-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('services-list')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <span>EXPLORE SERVICES</span>
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

        {/* ── 2. DARK NAVY STATISTICS STRIP ── */}
        <section className="editorial-dark-stats">
          <div className="editorial-container">
            <div className="editorial-stats-grid">
              <div>
                <div className="editorial-stat-num">98.6%</div>
                <div className="editorial-stat-label">ON-TIME DELIVERY</div>
              </div>
              <div>
                <div className="editorial-stat-num">24/7</div>
                <div className="editorial-stat-label">OPERATIONS SUPPORT</div>
              </div>
              <div>
                <div className="editorial-stat-num">1,248+</div>
                <div className="editorial-stat-label">ACTIVE SHIPMENTS</div>
              </div>
              <div>
                <div className="editorial-stat-num">PAN-INDIA</div>
                <div className="editorial-stat-label">CONNECTED NETWORK</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. SERVICES TIERS (PHOTOGRAPHY GRID) ── */}
        <section style={{ padding: '96px 0', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }} id="services-list">
          <div className="editorial-container">
            <div>
              <div className="editorial-section-tag">
                <Sparkles size={13} />
                <span>COMMERCIAL PORTFOLIO</span>
              </div>
              <h2 style={{ fontFamily: 'var(--pr-font-display)', fontSize: 'clamp(2.6rem, 5vw, 4.4rem)', color: '#070b14', textTransform: 'uppercase', margin: 0, letterSpacing: '0.02em', lineHeight: 0.95 }}>
                CORE FREIGHT CAPABILITIES
              </h2>
              <p style={{ fontSize: '16px', color: '#64748b', maxWidth: '640px', margin: '12px 0 0', lineHeight: 1.6 }}>
                Tailored commercial logistics services powered by real-time telematics, verified drivers, and automated digital paperwork.
              </p>
            </div>

            <div className="editorial-services-grid">
              {SERVICES_LIST.map((srv) => (
                <div key={srv.num} className="editorial-service-tile">
                  <div className="editorial-service-tile-img-wrap">
                    <img src={srv.image} alt={srv.title} className="editorial-service-tile-img" />
                    <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(7,11,20,0.85)', backdropFilter: 'blur(8px)', color: '#ffffff', padding: '4px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.12em' }}>
                      {srv.subtitle}
                    </div>
                  </div>

                  <div className="editorial-service-tile-body">
                    <div className="editorial-service-num">{srv.num}</div>
                    <h3 className="editorial-service-tile-title">{srv.title}</h3>
                    <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.55, margin: '0 0 16px', flex: 1 }}>
                      {srv.desc}
                    </p>

                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', marginBottom: '20px' }}>
                      {srv.features.map((feat, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#334155', fontWeight: 600, marginBottom: '6px' }}>
                          <CheckCircle2 size={14} color="#0284c7" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>

                    <Link to={srv.link} className="editorial-btn-primary" style={{ padding: '10px 18px', fontSize: '11.5px', justifyContent: 'center' }}>
                      <span>EXPLORE SERVICE</span>
                      <ArrowRight size={13} className="btn-arrow" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
