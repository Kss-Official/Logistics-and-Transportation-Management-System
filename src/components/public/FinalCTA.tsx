import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section
      style={{
        padding: '100px 0',
        backgroundColor: '#0b1220',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
      }}
    >
      {/* Glow effect */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '700px',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(37, 99, 235, 0.25) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      ></div>

      <div className="pr-container" style={{ position: 'relative', zIndex: 2, maxWidth: '820px' }}>
        <div className="pr-section-tag dark" style={{ marginBottom: '20px' }}>
          <Sparkles size={14} />
          <span>PrimeRoute Logistics Platform</span>
        </div>

        <h2 style={{ fontSize: 'clamp(32px, 4.5vw, 54px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, margin: '0 0 20px' }}>
          Ready to Move Logistics Forward?
        </h2>

        <p style={{ fontSize: 'clamp(16px, 1.8vw, 20px)', color: '#94a3b8', lineHeight: 1.6, margin: '0 auto 40px', maxWidth: '640px' }}>
          Bring orders, shipments, warehouses and fleet operations together with PrimeRoute.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Link to="/signin/customer" className="pr-btn-primary" style={{ padding: '15px 36px', fontSize: '16px' }}>
            <span>Get Started</span>
            <ArrowRight size={17} />
          </Link>

          <Link
            to="/platform"
            className="pr-btn-dark-secondary"
            style={{ padding: '15px 32px', fontSize: '16px', textDecoration: 'none' }}
          >
            <span>Explore Platform</span>
            <ChevronRight size={17} />
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', marginTop: '48px', color: '#64748b', fontSize: '13px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color="#10b981" /> Production-Ready Architecture
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color="#10b981" /> Full Telematics & Dispatch
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color="#10b981" /> Instant Portal Onboarding
          </span>
        </div>
      </div>
    </section>
  );
}
