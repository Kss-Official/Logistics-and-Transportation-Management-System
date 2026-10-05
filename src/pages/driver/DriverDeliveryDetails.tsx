import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  Navigation,
  Truck,
  Building2,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  PenTool,
  CheckCheck
} from 'lucide-react';
import { driverPortalService } from '../../services/driverPortalService';
import type { DeliveryAssignment } from '../../types/driverPortal';
import ProofOfDeliveryModal from '../../components/driver/ProofOfDelivery';

export default function DriverDeliveryDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState<DeliveryAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEpodOpen, setIsEpodOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (id) {
      setLoading(true);
      driverPortalService
        .getDeliveryById(id)
        .then((data) => {
          if (isMounted) {
            setDelivery(data || null);
            setLoading(false);
          }
        })
        .catch((err: any) => {
          console.error(err);
          if (isMounted) {
            const status = err?.response?.status;
            if (status === 403) {
              setError('Access denied. This consignment is not assigned to your driver account.');
            } else {
              setError('The requested delivery consignment record could not be found.');
            }
            setLoading(false);
          }
        });
    }
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleStartTrip = async () => {
    if (!delivery || actionLoading) return;
    setActionLoading(true);
    try {
      const updated = await driverPortalService.startTrip(delivery.id);
      if (updated) {
        setDelivery(updated);
        setStatusMessage('Trip started! Consignment is now IN TRANSIT');
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to start trip');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkOutForDelivery = async () => {
    if (!delivery || actionLoading) return;
    setActionLoading(true);
    try {
      const updated = await driverPortalService.markOutForDelivery(delivery.id);
      if (updated) {
        setDelivery(updated);
        setStatusMessage('Delivery status updated to OUT FOR DELIVERY');
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to update delivery status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeliveryCompleted = (completedDelivery: DeliveryAssignment) => {
    setDelivery(completedDelivery);
    setStatusMessage('Delivery completed successfully with verified electronic proof of delivery!');
    setTimeout(() => setStatusMessage(null), 6000);
  };

  if (loading) {
    return (
      <div className="driver-page-container" style={{ alignItems: 'center', justifyContent: 'center', minHeight: 320, display: 'flex' }}>
        <div style={{ color: '#2563eb', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 18, height: 18, border: '2px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
          <span>Loading consignment details...</span>
        </div>
      </div>
    );
  }

  if (error || !delivery) {
    return (
      <div className="driver-page-container">
        <div className="driver-card" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <AlertCircle size={44} style={{ color: '#dc2626', margin: '0 auto 12px' }} />
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
            {error || 'Delivery Assignment Not Found'}
          </h3>
          <p style={{ color: '#64748b', fontSize: 13, margin: '8px 0 20px' }}>
            {error ? 'You do not have authorization to access this consignment.' : 'The requested consignment record could not be found.'}
          </p>
          <button onClick={() => navigate('/driver/deliveries')} className="driver-btn-primary">
            Return to Deliveries
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="driver-page-container">
      {/* ── Breadcrumb & Top Controls ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <button
          onClick={() => navigate('/driver/deliveries')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            color: '#2563eb',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={16} /> Back to Deliveries List
        </button>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {delivery.recipientPhone && (
            <a
              href={`tel:${delivery.recipientPhone}`}
              className="driver-btn-secondary"
              style={{ padding: '8px 14px', fontSize: 13 }}
            >
              <Phone size={14} /> Call Recipient
            </a>
          )}
          {(delivery.status === 'DISPATCHED' || delivery.status === 'CONFIRMED' || delivery.status === 'ASSIGNED' || delivery.status === 'ACCEPTED' || delivery.status === 'PENDING') && (
            <button
              onClick={handleStartTrip}
              disabled={actionLoading}
              className="driver-btn-primary"
              style={{ padding: '8px 16px', fontSize: 13 }}
            >
              {actionLoading ? 'Starting...' : <><Navigation size={14} /> Start Trip</>}
            </button>
          )}
          {(delivery.status === 'IN_TRANSIT' || delivery.status === 'PICKED_UP' || delivery.status === 'ARRIVED_AT_DESTINATION') && (
            <button
              onClick={handleMarkOutForDelivery}
              disabled={actionLoading}
              className="driver-btn-primary"
              style={{ padding: '8px 16px', fontSize: 13 }}
            >
              {actionLoading ? 'Updating...' : <><Truck size={14} /> Mark Out for Delivery</>}
            </button>
          )}
          {delivery.status === 'OUT_FOR_DELIVERY' && (
            <button
              onClick={() => setIsEpodOpen(true)}
              className="driver-btn-primary"
              style={{ padding: '8px 16px', fontSize: 13, backgroundColor: '#16a34a', borderColor: '#15803d' }}
            >
              <PenTool size={14} /> Complete Delivery (ePOD)
            </button>
          )}
          {delivery.status !== 'DELIVERED' && (
            <button
              onClick={() => navigate('/driver/current-delivery')}
              className="driver-btn-secondary"
              style={{ padding: '8px 16px', fontSize: 13 }}
            >
              View Active Trip <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Status Message Alert ── */}
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

      {/* ── Overview Card ── */}
      <div className="driver-card">
        <div className="driver-card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span className={`driver-badge ${delivery.status === 'DELIVERED' ? 'driver-badge-green' : delivery.status === 'OUT_FOR_DELIVERY' ? 'driver-badge-amber' : 'driver-badge-blue'}`}>
                {delivery.status.replace(/_/g, ' ')}
              </span>
              <span style={{ fontSize: 12, color: '#64748b' }}>Assigned: {delivery.assignedDate}</span>
            </div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
              Consignment #{delivery.trackingNumber}
            </h2>
            <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>
              Order Reference: <strong>{delivery.customerOrderRef}</strong>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Delivery Priority</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#2563eb', marginTop: 2 }}>
              {delivery.priority}
            </div>
          </div>
        </div>

        {/* Waypoint comparison columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {/* Pickup Facility */}
          <div style={{ backgroundColor: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#2563eb', fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
              <Building2 size={16} /> ORIGIN WAREHOUSE
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
              {delivery.pickupLocation.facilityName}
            </div>
            <div style={{ fontSize: 12.5, color: '#64748b', margin: '4px 0' }}>
              {delivery.pickupLocation.address}, {delivery.pickupLocation.city}
            </div>
            <div style={{ fontSize: 12, color: '#334155', marginTop: 8 }}>
              <strong>Dock Bay:</strong> {delivery.pickupLocation.dockBay} &bull; <strong>Contact:</strong> {delivery.pickupLocation.contactPerson} ({delivery.pickupLocation.contactPhone})
            </div>
          </div>

          {/* Delivery Recipient */}
          <div style={{ backgroundColor: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16a34a', fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
              <MapPin size={16} /> CUSTOMER DELIVERY DESTINATION
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
              {delivery.recipientName}
            </div>
            <div style={{ fontSize: 12.5, color: '#64748b', margin: '4px 0' }}>
              {delivery.destination.address}, {delivery.destination.city} {delivery.destination.postalCode}
            </div>
            <div style={{ fontSize: 12, color: '#334155', marginTop: 8 }}>
              <strong>Phone:</strong> {delivery.recipientPhone || 'Not available'} &bull; <strong>Email:</strong> {delivery.recipientEmail || 'Not available'}
            </div>
            <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>
              <strong>Instructions:</strong> {delivery.deliveryLocation.specialInstructions || 'Direct doorstep delivery'}
            </div>
          </div>
        </div>
      </div>

      {/* ── Verified Proof of Delivery (ePOD) Card ── */}
      {delivery.proofOfDelivery && (
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

      {/* ── Tracking History Timeline ── */}
      {delivery.trackingEvents && delivery.trackingEvents.length > 0 && (
        <div className="driver-card">
          <h3 className="driver-card-title">
            <Clock size={18} style={{ color: '#2563eb' }} />
            Consignment Tracking Events ({delivery.trackingEvents.length})
          </h3>

          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
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

      {/* ── Cargo Manifest Items ── */}
      <div className="driver-card">
        <h3 className="driver-card-title">
          <Package size={18} style={{ color: '#2563eb' }} />
          Cargo Manifest Items ({delivery.cargoItems.length} items)
        </h3>

        <div className="driver-table-wrapper" style={{ marginTop: 14 }}>
          <table className="driver-table">
            <thead>
              <tr>
                <th style={{ width: '25%' }}>SKU Code</th>
                <th style={{ width: '40%' }}>Description</th>
                <th style={{ width: '15%' }}>Quantity</th>
                <th style={{ width: '20%' }}>Weight</th>
              </tr>
            </thead>
            <tbody>
              {delivery.cargoItems.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{item.sku}</td>
                  <td style={{ color: '#334155' }}>{item.description || item.name}</td>
                  <td style={{ fontWeight: 600 }}>{item.quantity} units</td>
                  <td>{item.weightKg} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cargo Totals Summary Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            backgroundColor: '#f1f5f9',
            borderRadius: 8,
            marginTop: 14,
            flexWrap: 'wrap',
            gap: 10,
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          <span>Total Packages: {delivery.totalPackages} units</span>
          <span>Gross Weight: {delivery.totalWeightKg} kg</span>
          <span>Volume: {delivery.volumeCbm} CBM</span>
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
