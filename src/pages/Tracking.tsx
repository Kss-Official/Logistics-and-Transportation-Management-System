import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PublicHeader from '../components/public/PublicHeader';
import PublicFooter from '../components/public/PublicFooter';
import EditorialCTA from '../components/public/EditorialCTA';
import publicService from '../services/publicService';
import type { TrackingResponse } from '../types/shipment';
import {
  Search,
  MapPin,
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  ArrowRight,
  Package,
  AlertCircle,
  Navigation,
  Loader2,
  Calendar,
  Phone,
  User
} from 'lucide-react';

import heroTrackingBg from '../assets/hero_real_highway_truck.jpg';

const SAMPLE_IDS = [
  'TRK-2026-00124',
  'TRK-PR-ORD-71673158',
  'TRK-2026-00125'
];

export default function Tracking() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('id') || searchParams.get('number') || '';

  const [inputVal, setInputVal] = useState(initialQuery);
  const [shipment, setShipment] = useState<TrackingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeStep, setActiveStep] = useState(1);

  const executeTrack = async (trackId: string) => {
    const cleanId = trackId.trim();
    if (!cleanId) return;

    setLoading(true);
    setErrorMessage('');

    try {
      const data = await publicService.trackPublicShipment(cleanId);
      if (data) {
        setShipment(data);
        const statusUpper = (data.status || '').toUpperCase();
        if (statusUpper.includes('DELIVERED')) setActiveStep(3);
        else if (statusUpper.includes('OUT')) setActiveStep(2);
        else if (statusUpper.includes('TRANSIT')) setActiveStep(1);
        else setActiveStep(0);
      } else {
        throw new Error('Not found');
      }
    } catch {
      // Fallback structured tracking for demo identifiers
      if (cleanId.toUpperCase() === 'TRK-2026-00124') {
        setShipment({
          trackingNumber: 'TRK-2026-00124',
          orderNumber: 'ORD-849201',
          status: 'IN_TRANSIT',
          pickup: {
            addressText: 'Mumbai Central Cargo Terminal',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400001',
            country: 'India',
            latitude: 19.076,
            longitude: 72.8777,
          },
          delivery: {
            addressText: 'Electronic City DC Phase 2',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560100',
            country: 'India',
            latitude: 12.9716,
            longitude: 77.5946,
          },
          currentLocation: {
            locationName: 'Pune Highway Corridor Hub (MH)',
            latitude: 18.5204,
            longitude: 73.8567,
            lastUpdatedAt: new Date().toISOString(),
          },
          estimatedDeliveryDate: '2026-10-06T17:00:00Z',
          driverName: 'Rajesh Kumar',
          driverPhone: '+91 98450 11234',
          vehicleNumber: 'MH-12-AB-4521 (24T Heavy Hauler)',
        } as unknown as TrackingResponse);
        setActiveStep(1);
      } else if (cleanId.toUpperCase() === 'TRK-2026-00125') {
        setShipment({
          trackingNumber: 'TRK-2026-00125',
          orderNumber: 'ORD-849202',
          status: 'OUT_FOR_DELIVERY',
          pickup: {
            addressText: 'Delhi Northern Freight Depot',
            city: 'Delhi',
            state: 'Delhi',
            postalCode: '110001',
            country: 'India',
            latitude: 28.7041,
            longitude: 77.1025,
          },
          delivery: {
            addressText: 'Jaipur Industrial Park DC',
            city: 'Jaipur',
            state: 'Rajasthan',
            postalCode: '302001',
            country: 'India',
            latitude: 26.9124,
            longitude: 75.7873,
          },
          currentLocation: {
            locationName: 'Jaipur Local Distribution Hub (RJ)',
            latitude: 26.9124,
            longitude: 75.7873,
            lastUpdatedAt: new Date().toISOString(),
          },
          estimatedDeliveryDate: '2026-10-06T14:15:00Z',
          driverName: 'Vikram Singh',
          driverPhone: '+91 97001 66778',
          vehicleNumber: 'DL-01-CD-8832 (Light Commercial)',
        } as unknown as TrackingResponse);
        setActiveStep(2);
      } else {
        setErrorMessage(`Shipment consignment "${cleanId}" not found in database. Please verify tracking code.`);
        setShipment(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      executeTrack(initialQuery);
    } else {
      executeTrack('TRK-2026-00124');
      setInputVal('TRK-2026-00124');
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setSearchParams({ id: inputVal.trim() });
      executeTrack(inputVal.trim());
    }
  };

  const handleSelectSample = (sampleId: string) => {
    setInputVal(sampleId);
    setSearchParams({ id: sampleId });
    executeTrack(sampleId);
  };

  return (
    <div className="editorial-root">
      <PublicHeader />

      <main>
        {/* ── 1. EDITORIAL HERO ── */}
        <section className="editorial-page-hero">
          <div className="editorial-page-hero-media">
            <img
              src={heroTrackingBg}
              alt="PrimeRoute Logistics Freight Truck"
              className="editorial-page-hero-img"
            />
          </div>
          <div className="editorial-page-hero-overlay" />

          <div className="editorial-page-hero-container">
            <div className="editorial-page-hero-content">
              <div className="editorial-page-hero-label">
                SHIPMENT TRACKING
              </div>

              <h1 className="editorial-page-hero-title">
                WHERE IS YOUR<br />
                <span className="blue-highlight">SHIPMENT?</span>
              </h1>

              <p className="editorial-page-hero-desc">
                Track your consignment in real time across warehouses, transshipment hubs, highway corridors, and verified delivery locations.
              </p>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <a
                  href="#tracking-tool"
                  className="editorial-btn-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('tracking-tool')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <span>TRACK A SHIPMENT</span>
                  <ArrowRight size={15} />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. TRACKING INTERFACE SECTION ── */}
        <section id="tracking-tool" style={{ padding: '64px 0 96px', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
          <div className="editorial-container">
            {/* Tracking Search Card */}
            <div className="editorial-tracking-card" style={{ maxWidth: '1000px', margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--pr-font-display)', fontSize: '28px', color: '#070b14', letterSpacing: '0.03em', margin: '0 0 6px', textTransform: 'uppercase' }}>
                    ENTER CONSIGNMENT OR BILL OF LADING
                  </h2>
                  <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                    Instant access to live GPS telematics, driver status, and expected arrival timestamps.
                  </p>
                </div>

                {/* Quick Samples */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                    SAMPLES:
                  </span>
                  {SAMPLE_IDS.map((sid) => (
                    <button
                      key={sid}
                      type="button"
                      onClick={() => handleSelectSample(sid)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '11px',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        background: inputVal === sid ? '#0284c7' : '#f1f5f9',
                        color: inputVal === sid ? '#ffffff' : '#334155',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {sid}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Bar */}
              <form onSubmit={handleSubmit} className="editorial-tracking-form-wrap" style={{ maxWidth: '100%' }}>
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Enter tracking number e.g. PR-TRK-123456"
                  className="editorial-tracking-input"
                />
                <button type="submit" className="editorial-tracking-submit-btn" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>TRACKING...</span>
                    </>
                  ) : (
                    <>
                      <span>TRACK</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              {errorMessage && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', gap: '10px', color: '#dc2626', marginTop: '20px', fontSize: '14px' }}>
                  <AlertCircle size={18} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* ── 3. SHIPMENT JOURNEY PROGRESSION BAR ── */}
              {shipment && (
                <>
                  <div className="editorial-status-progression" style={{ marginTop: '40px' }}>
                    <div className={`editorial-prog-step ${activeStep >= 0 ? (activeStep === 0 ? 'current' : 'completed') : ''}`}>
                      <div className="editorial-prog-step-bar" />
                      <div className="editorial-prog-step-label">01 PICKED UP</div>
                    </div>

                    <div className={`editorial-prog-step ${activeStep >= 1 ? (activeStep === 1 ? 'current' : 'completed') : ''}`}>
                      <div className="editorial-prog-step-bar" />
                      <div className="editorial-prog-step-label">02 IN TRANSIT</div>
                    </div>

                    <div className={`editorial-prog-step ${activeStep >= 2 ? (activeStep === 2 ? 'current' : 'completed') : ''}`}>
                      <div className="editorial-prog-step-bar" />
                      <div className="editorial-prog-step-label">03 OUT FOR DELIVERY</div>
                    </div>

                    <div className={`editorial-prog-step ${activeStep >= 3 ? 'completed' : ''}`}>
                      <div className="editorial-prog-step-bar" />
                      <div className="editorial-prog-step-label">04 DELIVERED</div>
                    </div>
                  </div>

                  {/* ── 4. MAP & TELEMETRY VISUALIZATION ── */}
                  <div className="editorial-tech-route-box" style={{ margin: '36px 0 28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 0 4px rgba(56, 189, 248, 0.25)' }} />
                        <span style={{ fontFamily: 'monospace', fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>
                          {shipment.trackingNumber}
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: 800, background: '#0284c7', color: '#ffffff', padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.08em' }}>
                          {shipment.status}
                        </span>
                      </div>

                      <div style={{ fontSize: '12.5px', color: '#cbd5e1' }}>
                        ESTIMATED ARRIVAL: <strong style={{ color: '#38bdf8' }}>{shipment.estimatedDeliveryDate ? new Date(shipment.estimatedDeliveryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '06 Oct 2026, 05:00 PM'}</strong>
                      </div>
                    </div>

                    <div className="editorial-tech-flow">
                      <div className="editorial-tech-waypoint">
                        <span className="point-tag">ORIGIN</span>
                        <span className="point-name">{shipment.pickup?.city || 'Origin'}</span>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>{shipment.pickup?.addressText || shipment.pickupAddress || 'Origin Terminal'}</span>
                      </div>

                      <div style={{ color: '#38bdf8', fontSize: '18px' }}>→</div>

                      <div className="editorial-tech-waypoint">
                        <span className="point-tag">WAREHOUSE HUB</span>
                        <span className="point-name">REGIONAL TERMINAL</span>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Gate-Out Verified</span>
                      </div>

                      <div style={{ color: '#38bdf8', fontSize: '18px' }}>→</div>

                      <div className="editorial-tech-waypoint">
                        <span className="point-tag" style={{ color: '#4ade80' }}>● CURRENT LOCATION</span>
                        <span className="point-name" style={{ color: '#38bdf8' }}>{shipment.currentLocation?.locationName || shipment.currentLocationName || 'In Transit'}</span>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Active Highway Corridor</span>
                      </div>

                      <div style={{ color: '#38bdf8', fontSize: '18px' }}>→</div>

                      <div className="editorial-tech-waypoint">
                        <span className="point-tag">DESTINATION</span>
                        <span className="point-name">{shipment.delivery?.city || 'Destination'}</span>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>{shipment.delivery?.addressText || shipment.deliveryAddress || 'Doorstep Delivery'}</span>
                      </div>
                    </div>
                  </div>

                  {/* ── 5. DETAILED INFORMATION CARD ── */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '24px' }}>
                    <h3 style={{ fontFamily: 'var(--pr-font-display)', fontSize: '20px', color: '#0f172a', letterSpacing: '0.04em', margin: '0 0 16px', textTransform: 'uppercase' }}>
                      CONSIGNMENT SPECIFICATIONS & DISPATCH TELEMETRY
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', fontSize: '13.5px' }}>
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Tracking Number</span>
                        <strong style={{ fontFamily: 'monospace', color: '#0f172a' }}>{shipment.trackingNumber}</strong>
                      </div>

                      <div>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Order Number</span>
                        <strong style={{ color: '#0f172a' }}>{shipment.orderNumber || 'ORD-98214'}</strong>
                      </div>

                      <div>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Assigned Driver</span>
                        <strong style={{ color: '#0f172a' }}>{shipment.driverName || 'Depot Logistics Pilot'}</strong>
                      </div>

                      <div>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Vehicle Registration</span>
                        <strong style={{ color: '#0f172a' }}>{shipment.vehicleNumber || shipment.vehicleReg || 'PR-LINEHAUL-24T'}</strong>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ── 6. FINAL CTA ── */}
        <EditorialCTA />
      </main>

      <PublicFooter />
    </div>
  );
}
