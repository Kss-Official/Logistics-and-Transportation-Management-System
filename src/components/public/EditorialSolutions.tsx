import React from 'react';
import { ArrowRight, ChevronRight, Layers, Truck, Warehouse, Navigation, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

// Varied high-quality realistic logistics images
import imgTransportation from '../../assets/corporate_road_freight.jpg';
import imgWarehouse from '../../assets/cargo_warehouse_terminal.jpg';
import imgFleet from '../../assets/hero_real_highway_truck.jpg';
import imgTracking from '../../assets/hero_real_intermodal_cargo.jpg';

export default function EditorialSolutions() {
  return (
    <section className="editorial-solutions-section" id="solutions">
      <div className="editorial-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div className="editorial-section-tag">
              <Compass size={13} />
              <span>COMMERCIAL OFFERINGS</span>
            </div>
            <h2 style={{ fontFamily: 'var(--pr-font-display)', fontSize: 'clamp(2.6rem, 5vw, 4.4rem)', color: '#070b14', textTransform: 'uppercase', margin: 0, letterSpacing: '0.02em', lineHeight: 0.95 }}>
              CAPABILITIES IN MOTION
            </h2>
          </div>

          <Link to="/solutions" className="editorial-btn-primary" style={{ padding: '12px 24px' }}>
            <span>VIEW ALL SOLUTIONS</span>
            <ArrowRight size={14} className="btn-arrow" />
          </Link>
        </div>

        {/* Asymmetric Composition Grid */}
        <div className="editorial-solutions-asymmetric-grid">
          {/* 01 TRANSPORTATION MANAGEMENT (Large Visual) */}
          <Link to="/solutions" className="editorial-solution-card large">
            <img
              src={imgTransportation}
              alt="Transportation Management"
              className="editorial-solution-bg"
            />
            <div className="editorial-solution-gradient" />
            <div className="editorial-solution-body">
              <div className="editorial-solution-num">01</div>
              <h3 className="editorial-solution-title">TRANSPORTATION MANAGEMENT</h3>
              <p className="editorial-solution-desc">
                Full-truckload (FTL) and scheduled linehaul freight corridor movement across national highway networks with automated consignment billing.
              </p>
              <div className="editorial-solution-link-text">
                <span>EXPLORE ROAD FREIGHT</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </Link>

          {/* 02 WAREHOUSE OPERATIONS */}
          <Link to="/solutions" className="editorial-solution-card">
            <img
              src={imgWarehouse}
              alt="Warehouse Operations"
              className="editorial-solution-bg"
            />
            <div className="editorial-solution-gradient" />
            <div className="editorial-solution-body">
              <div className="editorial-solution-num">02</div>
              <h3 className="editorial-solution-title">WAREHOUSE OPERATIONS</h3>
              <p className="editorial-solution-desc">
                Multi-hub bin slotting, barcode scanning verification, safety thresholds, and cross-dock staging bays.
              </p>
              <div className="editorial-solution-link-text">
                <span>EXPLORE WAREHOUSING</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </Link>

          {/* 03 FLEET MANAGEMENT (Large Visual) */}
          <Link to="/solutions" className="editorial-solution-card large">
            <img
              src={imgFleet}
              alt="Fleet Management"
              className="editorial-solution-bg"
            />
            <div className="editorial-solution-gradient" />
            <div className="editorial-solution-body">
              <div className="editorial-solution-num">03</div>
              <h3 className="editorial-solution-title">FLEET MANAGEMENT</h3>
              <p className="editorial-solution-desc">
                Carrier telemetry rosters, preventative maintenance logs, driver HOS compliance, and real-time fuel efficiency optimization.
              </p>
              <div className="editorial-solution-link-text">
                <span>EXPLORE FLEET COMMAND</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </Link>

          {/* 04 SHIPMENT TRACKING */}
          <Link to="/tracking" className="editorial-solution-card">
            <img
              src={imgTracking}
              alt="Shipment Tracking"
              className="editorial-solution-bg"
            />
            <div className="editorial-solution-gradient" />
            <div className="editorial-solution-body">
              <div className="editorial-solution-num">04</div>
              <h3 className="editorial-solution-title">SHIPMENT TRACKING</h3>
              <p className="editorial-solution-desc">
                Predictive milestone timestamps, interactive Leaflet highway routing, telematics status, and instant ePOD signature downloads.
              </p>
              <div className="editorial-solution-link-text">
                <span>LAUNCH TRACKER</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
