import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowDownToLine,
  Building2,
  Package,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  Truck,
  ArrowRight,
  Clock
} from 'lucide-react';
import { driverPortalService } from '../../services/driverPortalService';
import type { DeliveryAssignment } from '../../types/driverPortal';

export default function DriverPickup() {
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState<DeliveryAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Verification Checklist State
  const [checklist, setChecklist] = useState({
    vehicleDocked: false,
    documentsVerified: false,
    packageCountVerified: false,
    cargoIntact: false,
    cargoSecured: false,
  });

  const [verifiedSkus, setVerifiedSkus] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    driverPortalService.getCurrentDelivery().then((data) => {
      if (isMounted) {
        setDelivery(data);
        if (data?.cargoItems) {
          const skuMap: Record<string, boolean> = {};
          data.cargoItems.forEach(item => {
            skuMap[item.sku] = false;
          });
          setVerifiedSkus(skuMap);
        }
        setLoading(false);
      }
    }).catch(err => {
      console.error(err);
      if (isMounted) setLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  const handleToggleChecklist = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleToggleSku = (sku: string) => {
    setVerifiedSkus(prev => ({ ...prev, [sku]: !prev[sku] }));
  };

  const allChecklistCompleted = Object.values(checklist).every(Boolean);
  const allSkusVerified = Object.values(verifiedSkus).every(Boolean);
  const canConfirm = allChecklistCompleted && allSkusVerified;

  const handleConfirmPickup = async () => {
    if (!delivery) return;
    if (!canConfirm) {
      setErrorMessage('Please complete all verification checklist items and verify all cargo SKUs before proceeding.');
      return;
    }

    setSubmitting(true);
    try {
      await driverPortalService.completePickup(delivery.id, notes);
      navigate('/driver/current-delivery');
    } catch (err) {
      console.error('Failed to complete pickup:', err);
      setErrorMessage('Failed to submit pickup confirmation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="driver-page-container" style={{ alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div style={{ color: '#2563eb', fontWeight: 600 }}>Loading pickup details...</div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="driver-page-container">
        <div className="driver-card" style={{ textAlign: 'center', padding: 40 }}>
          <CheckCircle2 size={40} style={{ color: '#16a34a', margin: '0 auto 12px' }} />
          <h3>No Pending Consignment Awaiting Pickup</h3>
          <p style={{ color: '#64748b' }}>There are currently no assigned consignments waiting for origin pickup.</p>
          <button onClick={() => navigate('/driver/deliveries')} className="driver-btn-primary" style={{ marginTop: 14 }}>
            View All Deliveries
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="driver-page-container">
      {/* ── Header ── */}
      <div className="driver-card">
        <div className="driver-card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span className="driver-badge driver-badge-blue">ORIGIN DOCK OPERATIONS</span>
              <span style={{ fontSize: 13, color: '#64748b' }}>Waybill #{delivery.trackingNumber}</span>
            </div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
              Cargo Verification & Loading Confirmation
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#64748b' }}>
              Status: <strong style={{ color: '#2563eb' }}>{delivery.status.replace(/_/g, ' ')}</strong>
            </span>
          </div>
        </div>

        {/* Origin Facility Snapshot */}
        <div
          style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 10,
            padding: 16,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>Pickup Facility</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{delivery.pickupLocation.facilityName}</div>
            <div style={{ fontSize: 12.5, color: '#475569' }}>{delivery.pickupLocation.address}, {delivery.pickupLocation.city}</div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>Assigned Dock Bay</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#2563eb', marginTop: 2 }}>{delivery.pickupLocation.dockBay}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Bay Officer: {delivery.pickupLocation.contactPerson} ({delivery.pickupLocation.contactPhone})</div>
          </div>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {errorMessage && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, color: '#b91c1c', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={16} />
          {errorMessage}
        </div>
      )}

      {/* ── Cargo SKU Physical Verification ── */}
      <div className="driver-card">
        <div className="driver-card-header">
          <h3 className="driver-card-title">
            <Package size={18} style={{ color: '#2563eb' }} />
            Item-Level Cargo Verification ({delivery.cargoItems.length} items)
          </h3>
          <span style={{ fontSize: 12, fontWeight: 600, color: allSkusVerified ? '#16a34a' : '#d97706' }}>
            {Object.values(verifiedSkus).filter(Boolean).length} of {delivery.cargoItems.length} SKUs Verified
          </span>
        </div>

        <div className="driver-table-wrapper">
          <table className="driver-table">
            <thead>
              <tr>
                <th style={{ width: '15%' }}>Verify</th>
                <th style={{ width: '25%' }}>SKU Code</th>
                <th style={{ width: '40%' }}>Description</th>
                <th style={{ width: '20%' }}>Quantity / Weight</th>
              </tr>
            </thead>
            <tbody>
              {delivery.cargoItems.map((item) => {
                const verified = verifiedSkus[item.sku] || false;
                return (
                  <tr key={item.sku} style={{ backgroundColor: verified ? '#f0fdf4' : undefined }}>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggleSku(item.sku)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '6px 10px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 700,
                          border: verified ? '1px solid #86efac' : '1px solid #cbd5e1',
                          backgroundColor: verified ? '#dcfce7' : '#ffffff',
                          color: verified ? '#15803d' : '#475569',
                          cursor: 'pointer',
                        }}
                      >
                        {verified ? <CheckCircle2 size={14} /> : <div style={{ width: 14, height: 14, border: '2px solid #94a3b8', borderRadius: 3 }} />}
                        {verified ? 'Verified' : 'Verify'}
                      </button>
                    </td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{item.sku}</td>
                    <td>{item.description}</td>
                    <td style={{ fontWeight: 600 }}>{item.quantity} pkgs &bull; {item.weightKg} kg</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Pre-Departure Safety Checklist ── */}
      <div className="driver-card">
        <h3 className="driver-card-title">
          <ShieldCheck size={18} style={{ color: '#2563eb' }} />
          Driver Loading & Safety Pre-Departure Protocol
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
          {[
            { key: 'vehicleDocked', label: 'Vehicle safely parked and handbrake engaged at designated dock bay' },
            { key: 'documentsVerified', label: 'Waybill shipping orders & bill of lading documents inspected and matched' },
            { key: 'packageCountVerified', label: `Total package count (${delivery.totalPackages} units) physically counted and confirmed` },
            { key: 'cargoIntact', label: 'All cargo boxes, pallets, and shrink-wraps inspected for damage or leaks' },
            { key: 'cargoSecured', label: 'Cargo weight evenly distributed and secured with ratchet straps/cargo netting' },
          ].map((item) => {
            const checked = checklist[item.key as keyof typeof checklist];
            return (
              <label
                key={item.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 8,
                  backgroundColor: checked ? '#eff6ff' : '#f8fafc',
                  border: checked ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: checked ? 600 : 500,
                  color: checked ? '#1e3a8a' : '#334155',
                  transition: 'all 0.15s ease',
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleToggleChecklist(item.key as keyof typeof checklist)}
                  style={{ width: 18, height: 18, accentColor: '#2563eb', cursor: 'pointer' }}
                />
                <span>{item.label}</span>
              </label>
            );
          })}
        </div>

        {/* Driver Notes */}
        <div style={{ marginTop: 18 }}>
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
            Driver Loading Notes / Gate Remarks (Optional)
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Bay 4 cargo loaded successfully. Ratchet straps verified by bay lead Suresh..."
            style={{
              width: '100%',
              padding: 10,
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              fontSize: 13,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Confirmation Button */}
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            onClick={() => navigate('/driver/current-delivery')}
            className="driver-btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmPickup}
            disabled={!canConfirm || submitting}
            className="driver-btn-primary"
            style={{ padding: '12px 24px', fontSize: 14 }}
          >
            {submitting ? 'Confirming Cargo Pickup...' : 'Confirm Pickup & Depart Origin'}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
