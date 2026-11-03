import React from 'react';
import { ArrowRight, Globe, Navigation, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import journeyBg from '../../assets/hero_real_express_bridge.jpg';

export default function EditorialJourney() {
  return (
    <section
      className="editorial-full-width-banner"
      style={{ backgroundImage: `url(${journeyBg})` }}
      aria-label="PrimeRoute Connected Journey Campaign"
    >
      <div className="editorial-full-width-overlay" />

      <div className="editorial-full-width-content">
        <div className="editorial-section-tag" style={{ color: '#38bdf8', borderColor: 'rgba(56,189,248,0.3)', margin: '0 auto 16px' }}>
          <Globe size={13} />
          <span>NATIONAL LOGISTICS CORRIDORS</span>
        </div>

        <h2 className="editorial-full-width-headline">
          ONE CONNECTED<br />JOURNEY.
        </h2>

        <p className="editorial-full-width-sub">
          From initial order booking to final doorstep delivery, PrimeRoute keeps every movement, milestone, and manifest visible in real time.
        </p>

        {/* Telemetry Metrics Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '24px',
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(12px)',
            borderRadius: '50px',
            padding: '10px 24px',
            marginBottom: '32px',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80' }} />
            <span>CORRIDOR TELEMETRY: ACTIVE</span>
          </div>
          <span style={{ color: '#475569' }}>•</span>
          <div>
            AVG LINEHAUL SPEED: <span style={{ color: '#38bdf8' }}>78 KM/H</span>
          </div>
          <span style={{ color: '#475569' }}>•</span>
          <div>
            DISPATCH ACCURACY: <span style={{ color: '#4ade80' }}>99.8%</span>
          </div>
        </div>

        <div>
          <Link to="/tracking" className="editorial-btn-hero-primary" style={{ padding: '14px 28px' }}>
            <span>TRACK NATIONAL SHIPMENTS</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
