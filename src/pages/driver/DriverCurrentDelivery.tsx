import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Navigation,
  MapPin,
  Phone,
  ArrowRight,
  Package,
  AlertCircle,
  Truck,
  Building2,
  ShieldCheck,
  PenTool,
  CheckCheck,
  FileText,
  ImageIcon
} from 'lucide-react';
import { driverPortalService } from '../../services/driverPortalService';
import { useDriverGpsBroadcaster } from '../../hooks/useDriverGpsBroadcaster';
import type { DeliveryAssignment } from '../../types/driverPortal';
import ProofOfDeliveryModal from '../../components/driver/ProofOfDelivery';

const TIMELINE_STEPS = [
  { key: 'DISPATCHED', label: 'Dispatched', desc: 'Dispatched from origin warehouse' },
  { key: 'IN_TRANSIT', label: 'In Transit', desc: 'En route to customer delivery zone' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'Out for direct customer handover' },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Customer received delivery' },
];

export default function DriverCurrentDelivery() {
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState<DeliveryAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEpodOpen, setIsEpodOpen] = useState(false);

  const isGpsActive = Boolean(
    delivery &&
    (delivery.status === 'IN_TRANSIT' || delivery.status === 'OUT_FOR_DELIVERY')
  );

  const handleBroadcastSuccess = React.useCallback((updated: DeliveryAssignment) => {
    setDelivery(updated);
  }, []);

  // Background real GPS broadcaster for active delivery
  const gps = useDriverGpsBroadcaster(delivery, {
    enabled: isGpsActive,
    intervalMs: 15000,
    onBroadcastSuccess: handleBroadcastSuccess,
  });

  const fetchActiveDelivery = async () => {
    try {
      setLoading(true);
      const current = await driverPortalService.getCurrentDelivery();
      setDelivery(current);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Unable to load current delivery.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveDelivery();
  }, []);

  const getActiveStepIndex = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'DISPATCHED':
        return 0;
      case 'IN_TRANSIT':
      case 'PICKED_UP':
      case 'ARRIVED_AT_DESTINATION':
        return 1;
      case 'OUT_FOR_DELIVERY':
        return 2;
      case 'DELIVERED':
        return 3;
      default:
        return 1;
    }
  };

  const handleStartTrip = async () => {
    if (!delivery || !delivery.id || !delivery.id.trim() || actionLoading) {
      setErrorMessage('No active delivery assignment found to update.');
      return;
    }

    setActionLoading(true);
    setErrorMessage(null);
    try {
      const updated = await driverPortalService.startTrip(delivery.id);
      if (updated) {
        setDelivery(updated);
        setStatusMessage('Trip started! Shipment is now IN TRANSIT');
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (err: any) {
      console.error('Failed to start delivery trip:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to start delivery trip.';
      setErrorMessage(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkOutForDelivery = async () => {
    if (!delivery || !delivery.id || !delivery.id.trim() || actionLoading) {
      setErrorMessage('No active delivery assignment found to update.');
      return;
    }

    setActionLoading(true);
    setErrorMessage(null);
    try {
      const updated = await driverPortalService.markOutForDelivery(delivery.id);
      if (updated) {
        setDelivery(updated);
        setStatusMessage('Shipment successfully marked as OUT FOR DELIVERY');
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (err: any) {
      console.error('Failed to update shipment status:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to update delivery status.';
      setErrorMessage(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeliveryCompleted = (completedDelivery: DeliveryAssignment) => {
    setDelivery(completedDelivery);
    setStatusMessage('Delivery successfully completed with electronic proof of delivery!');
    setTimeout(() => setStatusMessage(null), 6000);
  };

  if (loading) {
    return (
      <div className="driver-page-container" style={{ alignItems: 'center', justifyContent: 'center', minHeight: 320, display: 'flex' }}>
        <div style={{ color: '#2563eb', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 20, height: 20, border: '2px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
          <span>Loading active delivery consignment...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="driver-page-container">
        <div className="driver-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <AlertCircle size={40} style={{ color: '#dc2626', margin: '0 auto 12px' }} />
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>{error}</h3>
          <button onClick={() => fetchActiveDelivery()} className="driver-btn-primary" style={{ marginTop: 14 }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="driver-page-container">
        <div className="driver-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <CheckCircle2 size={48} style={{ color: '#16a34a', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>No active delivery assigned</h2>
          <p style={{ color: '#64748b', fontSize: 13.5, margin: '8px 0 20px' }}>
            There are currently no in-flight delivery consignments assigned to your driver account.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
            <Link to="/driver/deliveries" className="driver-btn-primary">
              View All Deliveries
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentStepIdx = getActiveStepIndex(delivery.status);

  return (
    <div className="driver-page-container">
      {/* ── Status Feedback Alerts ── */}
      {statusMessage && (
        <div
          style={{
            padding: '12px 18px',
            backgroundColor: '#dcfce7',
            border: '1px solid #86efac',
            borderRadius: 8,
            color: '#15803d',
            fontSize: 13,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <CheckCircle2 size={16} />
          {statusMessage}
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            padding: '12px 18px',
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: 8,
            color: '#b91c1c',
            fontSize: 13,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <AlertCircle size={16} />
          {errorMessage}
        </div>
      )}

      {/* Real-time GPS Telemetry Broadcasting Pill */}
      {(delivery.status === 'IN_TRANSIT' || delivery.status === 'OUT_FOR_DELIVERY') && (
        <div
          style={{
            padding: '10px 16px',
            borderRadius: 10,
            backgroundColor: gps.isWatching ? '#eff6ff' : '#f8fafc',
            border: `1px solid ${gps.isWatching ? '#bfdbfe' : '#e2e8f0'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 12.5,
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: gps.isWatching ? '#22c55e' : '#94a3b8' }} className={gps.isWatching ? 'animate-pulse' : ''} />
            <strong style={{ color: '#1d4ed8' }}>Real-Time GPS Telemetry Broadcasting</strong>
            {gps.latitude && (
              <span style={{ color: '#64748b', fontFamily: 'monospace' }}>
                ({gps.latitude.toFixed(4)}° N, {gps.longitude?.toFixed(4)}° E)
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: '#64748b' }}>
              {gps.lastBroadcastTime ? `Last sent: ${gps.lastBroadcastTime.toLocaleTimeString()}` : 'Connecting satellite...'}
            </span>
            <Link to="/driver/live-location" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'underline' }}>
              View Live Map
            </Link>
          </div>
        </div>
      )}

      {/* ── Active Mission Hero Banner ── */}
      <div
        className="driver-card"
        style={{
          borderTop: `5px solid ${delivery.status === 'DELIVERED' ? '#16a34a' : '#2563eb'}`,
          boxShadow: '0 4px 14px rgba(37, 99, 235, 0.08)',
        }}
      >
        <div className="driver-card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span className={`driver-badge ${delivery.status === 'DELIVERED' ? 'driver-badge-green' : delivery.status === 'OUT_FOR_DELIVERY' ? 'driver-badge-amber' : 'driver-badge-blue'}`}>
                {delivery.status.replace(/_/g, ' ')}
              </span>
              <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Tracking #{delivery.trackingNumber}</span>
              <span style={{ fontSize: 13, color: '#64748b' }}>&bull; Order #{delivery.orderNumber}</span>
            </div>
            <h2 style={{ margin: '6px 0 2px', fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
              {delivery.recipientName}
            </h2>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              Destination: <strong>{delivery.destination.address}</strong>, {delivery.destination.city} {delivery.destination.postalCode}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {delivery.recipientPhone && (
              <a
                href={`tel:${delivery.recipientPhone}`}
                className="driver-btn-secondary"
                style={{ padding: '8px 14px' }}
              >
                <Phone size={14} /> Call Recipient
              </a>
            )}
            <button
              onClick={() => navigate('/driver/route')}
              className="driver-btn-secondary"
              style={{ padding: '8px 14px' }}
            >
              <Navigation size={14} /> View Route
            </button>
          </div>
        </div>

        {/* ── Lifecycle Stepper Progress Bar ── */}
        <div style={{ margin: '22px 0 12px', overflowX: 'auto', paddingBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', minWidth: 600 }}>
            {TIMELINE_STEPS.map((step, idx) => {
              const isPassed = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <React.Fragment key={step.key}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 90, textAlign: 'center' }}>
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        backgroundColor: isPassed ? '#16a34a' : isCurrent ? '#2563eb' : '#f1f5f9',
                        color: isPassed || isCurrent ? '#ffffff' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 12,
                        boxShadow: isCurrent ? '0 0 0 4px #dbeafe' : 'none',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {isPassed ? <CheckCircle2 size={18} /> : idx + 1}
                    </div>
                    <div
                      style={{
                        fontSize: 11.5,
                        fontWeight: isCurrent ? 800 : isPassed ? 700 : 500,
                        color: isCurrent ? '#2563eb' : isPassed ? '#16a34a' : '#94a3b8',
                      }}
                    >
                      {step.label}
                    </div>
                  </div>

                  {idx < TIMELINE_STEPS.length - 1 && (
                    <div
                      style={{
                        flex: 1,
                        height: 3,
                        backgroundColor: isPassed ? '#16a34a' : '#e2e8f0',
                        margin: '0 6px 18px',
                        borderRadius: 2,
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* ── Contextual Action Box ── */}
        <div
          style={{
            backgroundColor: delivery.status === 'DELIVERED' ? '#f0fdf4' : delivery.status === 'OUT_FOR_DELIVERY' ? '#fefce8' : '#eff6ff',
            border: `1px solid ${delivery.status === 'DELIVERED' ? '#bbf7d0' : delivery.status === 'OUT_FOR_DELIVERY' ? '#fef08a' : '#bfdbfe'}`,
            borderRadius: 12,
            padding: '18px 20px',
            marginTop: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                color: delivery.status === 'DELIVERED' ? '#166534' : delivery.status === 'OUT_FOR_DELIVERY' ? '#854d0e' : '#1d4ed8',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Current Status: {delivery.status.replace(/_/g, ' ')}
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
              {delivery.status === 'DELIVERED'
                ? 'Delivery completed! Electronic proof of delivery is verified on server.'
                : delivery.status === 'OUT_FOR_DELIVERY'
                ? 'Consignment is out for delivery. Capture customer signature & photo to complete.'
                : delivery.status === 'IN_TRANSIT'
                ? 'Shipment is in transit. When arriving at customer location, mark out for delivery.'
                : 'Consignment is dispatched from origin dock. Ready to begin transit trip.'}
            </div>
          </div>

          <div>
            {(delivery.status === 'DISPATCHED' || delivery.status === 'CONFIRMED' || delivery.status === 'ASSIGNED' || delivery.status === 'ACCEPTED' || delivery.status === 'PENDING') && (
              <button
                onClick={handleStartTrip}
                disabled={actionLoading}
                className="driver-btn-primary"
                style={{ padding: '12px 24px', fontSize: 14, opacity: actionLoading ? 0.7 : 1 }}
              >
                {actionLoading ? (
                  <>
                    <span style={{ width: 14, height: 14, border: '2px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                    Starting Trip...
                  </>
                ) : (
                  <>
                    <Navigation size={16} /> Start Trip <ArrowRight size={16} />
                  </>
                )}
              </button>
            )}

            {(delivery.status === 'IN_TRANSIT' || delivery.status === 'PICKED_UP' || delivery.status === 'ARRIVED_AT_DESTINATION') && (
              <button
                onClick={handleMarkOutForDelivery}
                disabled={actionLoading}
                className="driver-btn-primary"
                style={{ padding: '12px 24px', fontSize: 14, opacity: actionLoading ? 0.7 : 1 }}
              >
                {actionLoading ? (
                  <>
                    <span style={{ width: 14, height: 14, border: '2px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                    Updating Status...
                  </>
                ) : (
                  <>
                    <Truck size={16} /> Mark Out for Delivery <ArrowRight size={16} />
                  </>
                )}
              </button>
            )}

            {delivery.status === 'OUT_FOR_DELIVERY' && (
              <button
                onClick={() => setIsEpodOpen(true)}
                className="driver-btn-primary"
                style={{
                  padding: '12px 24px',
                  fontSize: 14,
                  fontWeight: 800,
                  backgroundColor: '#16a34a',
                  borderColor: '#15803d',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <PenTool size={16} /> Complete Delivery (ePOD) <ArrowRight size={16} />
              </button>
            )}

            {delivery.status === 'DELIVERED' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16a34a', fontWeight: 800, fontSize: 14 }}>
                <CheckCheck size={20} />
                <span>Delivery Completed & Verified</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Verified Proof of Delivery Card (When Delivered) ── */}
      {delivery.status === 'DELIVERED' && delivery.proofOfDelivery && (
        <div
          className="driver-card"
          style={{
            borderLeft: '5px solid #16a34a',
            backgroundColor: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
            <h3 className="driver-card-title" style={{ color: '#16a34a', margin: 0 }}>
              <ShieldCheck size={20} />
              Electronic Proof of Delivery (ePOD) Verified
            </h3>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>
              Delivered At: {delivery.proofOfDelivery.deliveredAt || 'Recently'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {/* Recipient info & Notes */}
            <div style={{ backgroundColor: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>RECEIVED BY</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                {delivery.proofOfDelivery.recipientName || delivery.proofOfDelivery.receivedBy || delivery.recipientName}
              </div>

              {delivery.proofOfDelivery.notes && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>DELIVERY NOTES</div>
                  <div style={{ fontSize: 13, color: '#334155', marginTop: 2 }}>
                    {delivery.proofOfDelivery.notes}
                  </div>
                </div>
              )}
            </div>

            {/* Signature Preview */}
            {delivery.proofOfDelivery.signatureData && (
              <div style={{ backgroundColor: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, marginBottom: 6 }}>DIGITAL SIGNATURE</div>
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 8, padding: 6, textAlign: 'center' }}>
                  <img
                    src={delivery.proofOfDelivery.signatureData}
                    alt="Customer signature"
                    style={{ maxHeight: 70, maxWidth: '100%' }}
                  />
                </div>
              </div>
            )}

            {/* Delivery Photo Preview */}
            {delivery.proofOfDelivery.photoUrl && (
              <div style={{ backgroundColor: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, marginBottom: 6 }}>DELIVERY PHOTO</div>
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 8, padding: 6, textAlign: 'center' }}>
                  <img
                    src={delivery.proofOfDelivery.photoUrl}
                    alt="Delivery proof"
                    style={{ maxHeight: 90, maxWidth: '100%', borderRadius: 4 }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Waypoint & Customer Destination Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Origin Pickup */}
        <div className="driver-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#2563eb', fontWeight: 700, fontSize: 13, marginBottom: 12 }}>
            <Building2 size={16} /> ORIGIN WAREHOUSE
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
            {delivery.pickupLocation.facilityName}
          </div>
          <div style={{ fontSize: 13, color: '#64748b', margin: '4px 0 12px' }}>
            {delivery.pickupLocation.address}, {delivery.pickupLocation.city}
          </div>

          <div style={{ padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: 8, fontSize: 12.5 }}>
            <div><strong>Dock Bay:</strong> {delivery.pickupLocation.dockBay}</div>
            <div style={{ marginTop: 4 }}><strong>Contact:</strong> {delivery.pickupLocation.contactPerson} ({delivery.pickupLocation.contactPhone})</div>
          </div>
        </div>

        {/* Destination Dropoff */}
        <div className="driver-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16a34a', fontWeight: 700, fontSize: 13, marginBottom: 12 }}>
            <MapPin size={16} /> CUSTOMER DELIVERY ADDRESS
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
            {delivery.recipientName}
          </div>
          <div style={{ fontSize: 13, color: '#64748b', margin: '4px 0 12px' }}>
            {delivery.destination.address}, {delivery.destination.city} {delivery.destination.postalCode}
          </div>

          <div style={{ padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: 8, fontSize: 12.5 }}>
            <div><strong>Recipient Phone:</strong> {delivery.recipientPhone}</div>
            <div style={{ marginTop: 4 }}><strong>Delivery Notes:</strong> {delivery.deliveryLocation.specialInstructions || 'Direct doorstep delivery'}</div>
          </div>
        </div>
      </div>

      {/* ── Tracking History & Events Timeline ── */}
      {delivery.trackingEvents && delivery.trackingEvents.length > 0 && (
        <div className="driver-card">
          <h3 className="driver-card-title">
            <Navigation size={18} style={{ color: '#2563eb' }} />
            Shipment Tracking Events ({delivery.trackingEvents.length})
          </h3>

          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {delivery.trackingEvents.map((ev, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '10px 14px',
                  backgroundColor: idx === delivery.trackingEvents!.length - 1 ? '#eff6ff' : '#f8fafc',
                  border: `1px solid ${idx === delivery.trackingEvents!.length - 1 ? '#bfdbfe' : '#e2e8f0'}`,
                  borderRadius: 8,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: idx === delivery.trackingEvents!.length - 1 ? '#2563eb' : '#94a3b8',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                    marginTop: 2,
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                    <span style={{ fontWeight: 800, fontSize: 13.5, color: '#0f172a' }}>{ev.title}</span>
                    <span style={{ fontSize: 11.5, color: '#64748b' }}>{ev.timestamp}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: '#475569', marginTop: 2 }}>{ev.description}</div>
                  <div style={{ fontSize: 11.5, color: '#2563eb', fontWeight: 600, marginTop: 4 }}>
                    <MapPin size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                    {ev.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Consignment Cargo Details ── */}
      <div className="driver-card">
        <h3 className="driver-card-title">
          <Package size={18} style={{ color: '#2563eb' }} />
          Consignment Package Summary ({delivery.totalPackages} pkgs &bull; {delivery.totalWeightKg} kg)
        </h3>

        <div className="driver-table-wrapper" style={{ marginTop: 12 }}>
          <table className="driver-table">
            <thead>
              <tr>
                <th style={{ width: '25%' }}>SKU</th>
                <th style={{ width: '45%' }}>Item Description</th>
                <th style={{ width: '15%' }}>Quantity</th>
                <th style={{ width: '15%' }}>Weight</th>
              </tr>
            </thead>
            <tbody>
              {delivery.cargoItems.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700 }}>{item.sku}</td>
                  <td>{item.description}</td>
                  <td>{item.quantity} units</td>
                  <td>{item.weightKg} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Electronic Proof of Delivery Modal ── */}
      <ProofOfDeliveryModal
        delivery={delivery}
        isOpen={isEpodOpen}
        onClose={() => setIsEpodOpen(false)}
        onSuccess={handleDeliveryCompleted}
      />
    </div>
  );
}
