import React from 'react';
import { ArrowRight, PhoneCall, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import ctaBackdrop from '../../assets/hero_real_primeroute_hub.jpg';

export default function EditorialCTA() {
  return (
    <section className="editorial-final-cta" aria-label="Ready to Move Smarter Call to Action">
      <img
        src={ctaBackdrop}
        alt="PrimeRoute Global Freight Operations"
        className="editorial-cta-backdrop"
      />
      <div className="editorial-cta-overlay" />

      <div className="editorial-cta-content">
        <div className="editorial-section-tag" style={{ color: '#38bdf8', borderColor: 'rgba(56,189,248,0.3)', margin: '0 auto 16px' }}>
          <Sparkles size={13} />
          <span>JOIN THE MODERN FREIGHT NETWORK</span>
        </div>

        <h2 className="editorial-cta-headline">
          READY TO<br />MOVE SMARTER?
        </h2>

        <p className="editorial-cta-sub">
          Bring orders, warehouses, fleet telematics, and real-time shipment visibility together with PrimeRoute.
        </p>

        <div className="editorial-cta-actions">
          <Link to="/register" className="editorial-btn-hero-primary">
            <span>GET STARTED TODAY</span>
            <ArrowRight size={16} />
          </Link>
          <a href="#quote" className="editorial-btn-hero-glass">
            <span>CONTACT SALES</span>
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
