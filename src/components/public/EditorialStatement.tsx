import React from 'react';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EditorialStatement() {
  return (
    <section className="editorial-statement-section" aria-label="PrimeRoute Mission Statement">
      <div className="editorial-container">
        <div className="editorial-statement-grid">
          {/* Left: Huge Editorial Statement */}
          <div>
            <div className="editorial-section-tag">
              <Sparkles size={13} />
              <span>THE PRIMEROUTE STANDARD</span>
            </div>
            <h2 className="editorial-huge-statement">
              LOGISTICS<br />
              SHOULDN’T FEEL<br />
              <span className="blue-highlight">COMPLICATED.</span>
            </h2>
          </div>

          {/* Right: Narrative with Generous Whitespace */}
          <div className="editorial-statement-right">
            <p className="editorial-statement-paragraph">
              PrimeRoute connects customers, warehouses, drivers, and enterprise consignments
              through one unified, connected operational platform.
            </p>
            <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.6, margin: '0 0 32px' }}>
              We eliminate disjointed spreadsheets, opaque freight brokers, and lost telemetry.
              From first-mile manifest generation to automated GST invoicing, every leg is precision-engineered.
            </p>

            <Link to="/platform" className="editorial-btn-primary">
              <span>EXPLORE PLATFORM ARCHITECTURE</span>
              <ArrowRight size={14} className="btn-arrow" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
