import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PublicHeader from '../components/public/PublicHeader';
import PublicFooter from '../components/public/PublicFooter';
import publicService from '../services/publicService';
import type { TrackingResponse } from '../types/shipment';
import {
  Search, MapPin, CheckCircle2, Clock, Truck, ShieldCheck, ArrowRight,
  Package, AlertCircle, Calendar, Gauge, Navigation, FileText, Loader2
} from 'lucide-react';

function getStatusStyle(status?: string) {
  const norm = (status || '').toUpperCase();
  switch (norm) {
    case 'DELIVERED':
      return { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'DELIVERED' };
    case 'OUT_FOR_DELIVERY':
      return { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'OUT FOR DELIVERY' };
    case 'IN_TRANSIT':
      return { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', label: 'IN TRANSIT' };
    case 'PICKED_UP':
      return { color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', label: 'PICKED UP' };
    default:
      return { color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd', label: norm || 'PENDING' };
  }
}

function formatDate(dateStr?: string) {
  if (!dateStr) return 'Pending Schedule';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function Tracking() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get('id') || 'TRK-PR-ORD-71673158';

  const [searchInput, setSearchInput] = useState(initialId);
  const [shipment, setShipment] = useState<TrackingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchTracking = async (query: string) => {
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      setErrorMessage('Please enter a tracking or waybill number.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const data = await publicService.trackPublicShipment(cleanQuery);
      setShipment(data);
    } catch {
      setErrorMessage("We couldn't find a shipment with that tracking number.");
      setShipment(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      fetchTracking(initialId);
    }
  }, [initialId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim();
    if (!query) {
      setErrorMessage('Please enter a tracking or waybill number.');
      return;
    }
    setSearchParams({ id: query });
    fetchTracking(query);
  };

  const statusStyle = getStatusStyle(shipment?.status);

  return (
    <div className="pr-public-site">
      <PublicHeader />
      <main>
        {/* 1. TRACKING HERO SECTION (LIGHT ENTERPRISE THEME) */}
        <section
          style={{
            padding: '48px 0 64px',
            background: 'linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%)',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <div className="pr-container">
            <div style={{ textAlign: 'center', maxWidth: '740px', margin: '0 auto' }}>
              <div className="pr-hero-badge-corporate" style={{ margin: '0 auto 16px' }}>
                <span className="pr-live-dot"></span>
                <span>REAL-TIME TELEMATICS SYSTEM</span>
              </div>

              <h1 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, lineHeight: 1.18, letterSpacing: '-0.02em', margin: '0 0 16px', color: '#0f172a' }}>
                Track Every Shipment. Every Mile.
              </h1>

              <p style={{ fontSize: '16.5px', color: '#475569', lineHeight: 1.6, margin: '0 auto 32px', maxWidth: '640px' }}>
                Get real-time visibility from pickup to final delivery. Enter your consignment or tracking number to view live corridor status and delivery milestones.
              </p>

              {/* Tracking Input Search Box */}
              <div style={{ maxWidth: '640px', margin: '0 auto' }}>
                <form onSubmit={handleSearch} style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px', display: 'flex', gap: '8px', boxShadow: '0 12px 32px rgba(0,0,0,0.3)' }}>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '12px' }}>
                    <Search size={20} color="#64748b" />
                    <input
                      type="text"
                      value={searchInput}
                      onChange={(e) => {
                        setSearchInput(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      placeholder="Enter Tracking or Waybill Number..."
                      style={{
                        width: '100%',
                        border: 'none',
                        outline: 'none',
                        fontSize: '15px',
                        fontWeight: 700,
                        color: '#0f172a',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="pr-btn-primary"
                    style={{ padding: '12px 28px', fontSize: '14.5px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Tracking shipment...</span>
                      </>
                    ) : (
                      <>
                        <span>Track Shipment</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>

                {errorMessage && (
                  <div style={{ marginTop: '14px', color: '#fca5a5', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '10px 16px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 2. TRACKING RESULT DISPLAY */}
        {loading && (
          <section style={{ padding: '80px 0', background: '#f8fafc', textAlign: 'center' }}>
            <div className="pr-container">
              <Loader2 size={36} className="animate-spin" color="#2563eb" style={{ margin: '0 auto 16px' }} />
              <p style={{ fontSize: '16px', color: '#475569', fontWeight: 600 }}>Tracking shipment with live dispatch system...</p>
            </div>
          </section>
        )}

        {!loading && shipment && (
          <section style={{ padding: '64px 0 84px', background: '#f8fafc' }}>
            <div className="pr-container">
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 8px 30px rgba(15, 23, 42, 0.05)',
                }}
              >
                {/* Top Banner with Tracking ID, Status, Origin -> Destination */}
                <div
                  style={{
                    padding: '24px 28px',
                    background: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'monospace', color: '#0f172a' }}>
                        {shipment.trackingNumber}
                      </span>
                      <span
                        style={{
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          border: `1px solid ${statusStyle.border}`,
                          padding: '4px 12px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 800,
                        }}
                      >
                        ● {statusStyle.label}
                      </span>
                    </div>
                    <div style={{ fontSize: '14px', color: '#475569', marginTop: '6px' }}>
                      Origin: <strong style={{ color: '#0f172a' }}>{shipment.pickup?.city || 'Origin Terminal'}</strong> ➔ Destination: <strong style={{ color: '#0f172a' }}>{shipment.delivery?.city || 'Destination Terminal'}</strong>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11.5px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
                      Estimated Delivery
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#16a34a', marginTop: '2px' }}>
                      {formatDate(shipment.estimatedDeliveryDate)}
                    </div>
                  </div>
                </div>

                {/* LOGISTICS CORRIDOR ROUTE & WAYPOINTS */}
                <div style={{ padding: '32px 28px', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Corridor Transit Status
                    </span>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>
                      Current Waypoint: <strong style={{ color: '#2563eb' }}>{shipment.currentLocation?.locationName || 'In Transit'}</strong>
                    </span>
                  </div>

                  {/* Route Progress Stepper */}
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '36px 28px',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                      {/* Origin Node */}
                      <div style={{ textAlign: 'center', zIndex: 2 }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#16a34a', margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '11px' }}>
                          ✓
                        </div>
                        <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>{shipment.pickup?.city || 'Origin'}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Pickup Terminal</div>
                      </div>

                      {/* Line 1 */}
                      <div style={{ height: '3px', flex: 1, background: '#16a34a', margin: '0 10px' }}></div>

                      {/* Current Waypoint */}
                      <div style={{ textAlign: 'center', zIndex: 2 }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#2563eb', border: '3px solid #bfdbfe', margin: '0 auto 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px' }}>
                          ●
                        </div>
                        <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#2563eb' }}>{shipment.currentLocation?.locationName || 'Linehaul Hub'}</div>
                        <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: 700 }}>● Active Status</div>
                      </div>

                      {/* Line 2 */}
                      <div style={{ height: '3px', flex: 1, background: shipment.status === 'DELIVERED' ? '#16a34a' : '#cbd5e1', margin: '0 10px' }}></div>

                      {/* Destination Node */}
                      <div style={{ textAlign: 'center', zIndex: 2 }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: shipment.status === 'DELIVERED' ? 'none' : '2px solid #cbd5e1', background: shipment.status === 'DELIVERED' ? '#16a34a' : '#ffffff', color: '#ffffff', margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>
                          {shipment.status === 'DELIVERED' ? '✓' : ''}
                        </div>
                        <div style={{ fontSize: '13.5px', fontWeight: 700, color: shipment.status === 'DELIVERED' ? '#16a34a' : '#64748b' }}>{shipment.delivery?.city || 'Destination'}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>Delivery Address</div>
                      </div>
                    </div>

                    {/* Operational Telemetry Strip */}
                    <div
                      style={{
                        marginTop: '32px',
                        paddingTop: '18px',
                        borderTop: '1px solid #e2e8f0',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                        gap: '16px',
                        fontSize: '13px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Truck size={18} color="#2563eb" />
                        <div>
                          <span style={{ color: '#64748b', fontSize: '11px' }}>Service Tier:</span>{' '}
                          <strong style={{ color: '#0f172a' }}>{shipment.deliveryType || 'Standard Freight'}</strong>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Package size={18} color="#16a34a" />
                        <div>
                          <span style={{ color: '#64748b', fontSize: '11px' }}>Cargo Weight:</span>{' '}
                          <strong style={{ color: '#0f172a' }}>{shipment.packageDetails?.weight ? `${shipment.packageDetails.weight} kg` : 'Commercial Cargo'}</strong>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={18} color="#d97706" />
                        <div>
                          <span style={{ color: '#64748b', fontSize: '11px' }}>Dispatch Date:</span>{' '}
                          <strong style={{ color: '#0f172a' }}>{formatDate(shipment.createdAt)}</strong>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShieldCheck size={18} color="#16a34a" />
                        <div>
                          <span style={{ color: '#64748b', fontSize: '11px' }}>Security Status:</span>{' '}
                          <strong style={{ color: '#16a34a' }}>Manifest Verified</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* TIMELINE & DETAILED CONSIGNMENT INFO */}
                <div style={{ padding: '36px 28px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px' }}>
                  {/* Milestone Events Timeline */}
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 20px' }}>
                      Shipment Timeline
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                      {shipment.events && shipment.events.length > 0 ? (
                        shipment.events.map((evt, idx) => (
                          <div key={evt.id || idx} style={{ display: 'flex', gap: '14px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <div
                                style={{
                                  width: '22px',
                                  height: '22px',
                                  borderRadius: '50%',
                                  background: evt.completed ? '#16a34a' : evt.current ? '#2563eb' : '#ffffff',
                                  border: evt.completed ? 'none' : evt.current ? '2px solid #2563eb' : '2px solid #cbd5e1',
                                  color: '#ffffff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '11px',
                                  flexShrink: 0,
                                }}
                              >
                                {evt.completed && '✓'}
                                {evt.current && '●'}
                              </div>
                              {idx < (shipment.events?.length || 0) - 1 && (
                                <div style={{ width: '2px', flex: 1, background: evt.completed ? '#cbd5e1' : '#f1f5f9', margin: '4px 0' }}></div>
                              )}
                            </div>

                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '14px', fontWeight: 800, color: evt.current ? '#2563eb' : '#0f172a' }}>
                                  {evt.title} — {evt.locationName}
                                </span>
                                {evt.current && (
                                  <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '1px 6px', borderRadius: '4px' }}>
                                    CURRENT
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '13px', color: '#475569', marginTop: '3px' }}>
                                {evt.description}
                              </div>
                              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px', fontWeight: 600 }}>
                                {formatDate(evt.eventTime)}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p style={{ fontSize: '14px', color: '#64748b' }}>No milestone events logged yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Consignment Specs Panel */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '24px' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                        Shipment & Cargo Details
                      </h4>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                        <div>
                          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Tracking Number</div>
                          <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace', marginTop: '2px' }}>
                            {shipment.trackingNumber}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Order Reference</div>
                          <div style={{ fontSize: '14px', fontWeight: 800, color: '#2563eb', fontFamily: 'monospace', marginTop: '2px' }}>
                            {shipment.orderNumber}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                        <div>
                          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Cargo Description</div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                            {shipment.packageDetails?.description || 'Commercial Consignment'}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Weight / Quantity</div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                            {shipment.packageDetails?.weight ? `${shipment.packageDetails.weight} kg` : '—'} ({shipment.packageDetails?.quantity || 1} Pcs)
                          </div>
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Pickup Address</div>
                        <div style={{ fontSize: '13px', color: '#334155', fontWeight: 600, marginTop: '2px' }}>
                          {shipment.pickup?.addressText || `${shipment.pickup?.city}, ${shipment.pickup?.state}`}
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '12px' }}>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Delivery Destination</div>
                        <div style={{ fontSize: '13px', color: '#334155', fontWeight: 600, marginTop: '2px' }}>
                          {shipment.delivery?.addressText || `${shipment.delivery?.city}, ${shipment.delivery?.state}`}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 3. VISIBILITY STANDARDS */}
        <section style={{ padding: '72px 0', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
          <div className="pr-container">
            <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
              <div className="pr-section-tag" style={{ margin: '0 auto 10px' }}>
                <span>Visibility Standards</span>
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>
                Built for Commercial Accountability
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '24px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <Navigation size={20} />
                </div>
                <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                  Real-Time Tracking
                </h4>
                <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  Consignment waypoint logging across expressways, inter-state corridors, and staging hubs.
                </p>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '24px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <Clock size={20} />
                </div>
                <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                  Accurate Forecasts
                </h4>
                <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  System-benchmarked arrival estimates based on service priority tiers and transit distances.
                </p>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '24px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <CheckCircle2 size={20} />
                </div>
                <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                  Delivery Milestones
                </h4>
                <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  Verifiable checkpoint records at origin terminals, transit distribution cross-docks, and destinations.
                </p>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '24px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#fdf2f8', color: '#db2777', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <FileText size={20} />
                </div>
                <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                  Manifest Records
                </h4>
                <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  Instant digital proof-of-delivery receipts and audit-compliant consignment records.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
