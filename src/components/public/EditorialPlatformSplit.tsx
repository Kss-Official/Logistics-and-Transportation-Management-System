import React from 'react';
import { ArrowRight, Layers, Box, Truck, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import splitImg from '../../assets/warehouse_3d_hub.jpg';

export default function EditorialPlatformSplit() {
  return (
    <section className="editorial-platform-split" id="platform-overview">
      <div className="editorial-container">
        <div style={{ marginBottom: '48px' }}>
          <div className="editorial-section-tag">
            <Layers size={13} />
            <span>OPERATIONAL BLUEPRINT</span>
          </div>
          <h2 style={{ fontFamily: 'var(--pr-font-display)', fontSize: 'clamp(2.5rem, 4.5vw, 4.2rem)', textTransform: 'uppercase', margin: 0, color: '#070b14', letterSpacing: '0.02em', lineHeight: 0.95 }}>
            SYNCHRONIZED OPERATIONS.<br />END-TO-END VELOCITY.
          </h2>
        </div>

        <div className="editorial-split-grid">
          {/* Left: Large Logistics Photograph with Zoom Effect */}
          <div className="editorial-split-image-col">
            <img
              src={splitImg}
              alt="PrimeRoute High-Bay Fulfillment Terminal"
              className="editorial-split-img"
            />
            <div className="editorial-split-overlay-pill">
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8' }} />
              <span>TERMINAL WH-04 • DOCK STAGING AUTOMATION</span>
            </div>
          </div>

          {/* Right: Numbered Editorial Blocks */}
          <div className="editorial-split-text-col">
            {/* Block 01 */}
            <div className="editorial-numbered-block">
              <div className="editorial-giant-num">01</div>
              <div>
                <h3 className="editorial-num-title">CUSTOMER ORDERS</h3>
                <p className="editorial-num-desc">
                  Create bulk or parcel consignments with automated corridor rate estimation, instant consignment barcode labels, and digital Bill of Lading generation.
                </p>
              </div>
            </div>

            {/* Block 02 */}
            <div className="editorial-numbered-block">
              <div className="editorial-giant-num">02</div>
              <div>
                <h3 className="editorial-num-title">WAREHOUSE OPERATIONS</h3>
                <p className="editorial-num-desc">
                  Process inward freight, dynamic bin staging, barcode scanning, cross-dock consolidation, and verified gate-out linehaul handovers.
                </p>
              </div>
            </div>

            {/* Block 03 */}
            <div className="editorial-numbered-block">
              <div className="editorial-giant-num">03</div>
              <div>
                <h3 className="editorial-num-title">FLEET EXECUTION</h3>
                <p className="editorial-num-desc">
                  Assign verified commercial haulers, monitor real-time corridor GPS waypoints, manage driver HOS rest-stops, and record instant electronic ePOD signatures.
                </p>
              </div>
            </div>

            <div>
              <Link to="/solutions" className="editorial-btn-primary">
                <span>EXPLORE ALL 4 OPERATIONAL TIERS</span>
                <ArrowRight size={14} className="btn-arrow" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
