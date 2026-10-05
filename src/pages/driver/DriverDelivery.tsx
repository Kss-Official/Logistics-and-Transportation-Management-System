import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Camera,
  PenTool,
  RotateCcw,
  Upload,
  User,
  Phone,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Trash2
} from 'lucide-react';
import { driverPortalService } from '../../services/driverPortalService';
import type { DeliveryAssignment } from '../../types/driverPortal';

export default function DriverDelivery() {
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState<DeliveryAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form fields
  const [receivedBy, setReceivedBy] = useState('');
  const [recipientRelationship, setRecipientRelationship] = useState('Authorized Recipient');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [checklist, setChecklist] = useState({
    recipientVerified: false,
    goodsHandedOver: false,
    sealIntact: false,
  });

  // Signature Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Photo Upload
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    driverPortalService.getCurrentDelivery().then((data) => {
      if (isMounted) {
        setDelivery(data);
        if (data && data.recipientName) {
          setReceivedBy(data.recipientName);
        }
        setLoading(false);
      }
    }).catch(err => {
      console.error(err);
      if (isMounted) setLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  // Coordinate calculation relative to canvas bounding box with scale factor
  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  // Pointer drawing handlers (mouse, touch, stylus unified)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePointerIdRef.current !== null && activePointerIdRef.current !== e.pointerId) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    activePointerIdRef.current = e.pointerId;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // Fallback
    }

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';

    setIsDrawing(true);
    setHasSignature(true);
    setErrorMessage(null);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || activePointerIdRef.current !== e.pointerId) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    const canvas = canvasRef.current;
    if (canvas) {
      try {
        if (canvas.hasPointerCapture(e.pointerId)) {
          canvas.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Fallback
      }
    }
    activePointerIdRef.current = null;
    setIsDrawing(false);
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePointerIdRef.current === e.pointerId) {
      const canvas = canvasRef.current;
      if (canvas) {
        try {
          if (canvas.hasPointerCapture(e.pointerId)) {
            canvas.releasePointerCapture(e.pointerId);
          }
        } catch {
          // Fallback
        }
      }
      activePointerIdRef.current = null;
      setIsDrawing(false);
    }
  };

  const clearSignature = () => {
    activePointerIdRef.current = null;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // Photo handler
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleChecklist = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecklistCompleted = Object.values(checklist).every(Boolean);

  const handleSubmitEpod = async () => {
    if (!delivery) return;

    if (!receivedBy.trim()) {
      setErrorMessage('Please enter the recipient full name.');
      return;
    }

    if (!allChecklistCompleted) {
      setErrorMessage('Please confirm all delivery handover verification checks.');
      return;
    }

    if (!hasSignature) {
      setErrorMessage('Please collect the recipient digital signature before completing delivery.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const canvas = canvasRef.current;
      const signatureData = canvas ? canvas.toDataURL('image/png') : '';

      await driverPortalService.submitProofOfDelivery(delivery.id, {
        receivedBy: `${receivedBy.trim()} (${recipientRelationship})`,
        signatureData,
        photoUrl: photoPreview || undefined,
        notes: deliveryNotes,
        timestamp: new Date().toLocaleString(),
      });

      navigate('/driver/current-delivery');
    } catch (err) {
      console.error('Failed to submit ePOD:', err);
      setErrorMessage('Failed to submit Proof of Delivery. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="driver-page-container" style={{ alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div style={{ color: '#2563eb', fontWeight: 600 }}>Loading proof of delivery console...</div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="driver-page-container">
        <div className="driver-card" style={{ textAlign: 'center', padding: 40 }}>
          <CheckCircle2 size={40} style={{ color: '#16a34a', margin: '0 auto 12px' }} />
          <h3>No Pending Delivery Consignment</h3>
          <p style={{ color: '#64748b' }}>There is no consignment currently waiting for proof of delivery handover.</p>
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
              <span className="driver-badge driver-badge-green">FINAL MILE HANDOVER</span>
              <span style={{ fontSize: 13, color: '#64748b' }}>Waybill #{delivery.trackingNumber}</span>
            </div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
              Electronic Proof of Delivery (ePOD)
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#64748b' }}>
              Consignment: <strong>{delivery.totalPackages} pkgs &bull; {delivery.totalWeightKg} kg</strong>
            </span>
          </div>
        </div>

        {/* Recipient summary */}
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
            <div style={{ fontSize: 11, fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>Recipient & Destination</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{delivery.recipientName}</div>
            <div style={{ fontSize: 12.5, color: '#475569' }}>{delivery.deliveryLocation.address}, {delivery.deliveryLocation.city}</div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>Customer Contact</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#2563eb', marginTop: 2 }}>{delivery.recipientPhone}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Order Ref: {delivery.customerOrderRef}</div>
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

      {/* ── Handover Verification Checklist ── */}
      <div className="driver-card">
        <h3 className="driver-card-title">
          <ShieldCheck size={18} style={{ color: '#2563eb' }} />
          Recipient Handover Verification Checklist
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
          {[
            { key: 'recipientVerified', label: 'Authorized recipient identity or company representative credentials verified' },
            { key: 'goodsHandedOver', label: `All ${delivery.totalPackages} physical package parcels unloaded and handed over` },
            { key: 'sealIntact', label: 'Security seals, cartons, and packaging inspected in recipient presence' },
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
      </div>

      {/* ── Recipient Details & Digital Signature ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Recipient Details & Photos */}
        <div className="driver-card">
          <h3 className="driver-card-title">
            <User size={18} style={{ color: '#2563eb' }} />
            Receiving Party Details
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Full Name of Signatory *
              </label>
              <input
                type="text"
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
                placeholder="Enter recipient or receiver name..."
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

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Signatory Relationship
              </label>
              <select
                value={recipientRelationship}
                onChange={(e) => setRecipientRelationship(e.target.value)}
                style={{
                  width: '100%',
                  padding: 10,
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="Authorized Recipient">Authorized Recipient (Direct Customer)</option>
                <option value="Warehouse Receiving Lead">Warehouse Receiving Lead</option>
                <option value="Gate Security / Guard">Gate Security / Guard</option>
                <option value="Office Receptionist">Office Receptionist</option>
                <option value="Authorized Representative">Authorized Representative</option>
              </select>
            </div>

            {/* Delivery Photo Attachment */}
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Delivery Photo Proof (Cargo at Doorstep / Gate)
              </label>

              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={fileInputRef}
                onChange={handlePhotoSelect}
                style={{ display: 'none' }}
              />

              {photoPreview ? (
                <div style={{ position: 'relative', marginTop: 8 }}>
                  <img
                    src={photoPreview}
                    alt="Delivery proof preview"
                    style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 8, border: '1px solid #cbd5e1' }}
                  />
                  <button
                    type="button"
                    onClick={() => { setPhotoPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '4px 8px',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Trash2 size={13} /> Remove
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: '100%',
                    padding: '24px 16px',
                    border: '2px dashed #bfdbfe',
                    borderRadius: 8,
                    backgroundColor: '#eff6ff',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    color: '#2563eb',
                  }}
                >
                  <Camera size={24} />
                  <span style={{ fontSize: 13, fontWeight: 700 }}>Take Photo / Upload Image</span>
                  <span style={{ fontSize: 11.5, color: '#64748b' }}>Snap packages at recipient location</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Digital Signature Pad */}
        <div className="driver-card">
          <div className="driver-card-header">
            <h3 className="driver-card-title">
              <PenTool size={18} style={{ color: '#2563eb' }} />
              Customer Digital Signature *
            </h3>
            <button
              type="button"
              onClick={clearSignature}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 10px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#64748b',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={12} /> Clear
            </button>
          </div>

          <div style={{ marginTop: 8 }}>
            <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 8px' }}>
              Sign inside the box below with finger or stylus:
            </p>
            <div
              style={{
                border: '2px solid #cbd5e1',
                borderRadius: 8,
                backgroundColor: '#f8fafc',
                touchAction: 'none',
                overflow: 'hidden',
              }}
            >
              <canvas
                ref={canvasRef}
                width={400}
                height={160}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
                style={{ width: '100%', height: 160, display: 'block', cursor: 'crosshair', touchAction: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, fontSize: 11, color: '#94a3b8' }}>
              <span>X Sign above line</span>
              <span>{hasSignature ? '✓ Signature captured' : 'Signature required'}</span>
            </div>
          </div>

          {/* Delivery Notes */}
          <div style={{ marginTop: 16 }}>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
              Delivery Handover Remarks
            </label>
            <textarea
              rows={2}
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="e.g. Received in good order at dock 2. Inspected by security lead."
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
        </div>
      </div>

      {/* ── Submit Action Footer ── */}
      <div className="driver-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <button
          type="button"
          onClick={() => navigate('/driver/current-delivery')}
          className="driver-btn-secondary"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSubmitEpod}
          disabled={submitting || !hasSignature || !allChecklistCompleted}
          className="driver-btn-primary"
          style={{ padding: '12px 28px', fontSize: 14 }}
        >
          {submitting ? 'Submitting ePOD...' : 'Submit Electronic Proof of Delivery'}
          <CheckCircle2 size={16} />
        </button>
      </div>
    </div>
  );
}
