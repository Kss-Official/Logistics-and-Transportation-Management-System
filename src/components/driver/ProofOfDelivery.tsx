import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  PenTool,
  Camera,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  User,
  MapPin,
  RefreshCw,
  Eye,
  ArrowRight,
  ShieldCheck,
  ImageIcon
} from 'lucide-react';
import { driverPortalService } from '../../services/driverPortalService';
import type { DeliveryAssignment, ProofOfDeliveryData } from '../../types/driverPortal';

interface ProofOfDeliveryProps {
  delivery: DeliveryAssignment;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (completedDelivery: DeliveryAssignment) => void;
}

export default function ProofOfDeliveryModal({
  delivery,
  isOpen,
  onClose,
  onSuccess,
}: ProofOfDeliveryProps) {
  // Canvas refs and state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);

  // Form states
  const [recipientName, setRecipientName] = useState(delivery.recipientName || '');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [step, setStep] = useState<'CAPTURE' | 'REVIEW'>('CAPTURE');

  // Submitting states
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize canvas
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-DPI displays
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Clear canvas with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
  }, []);

  useEffect(() => {
    if (isOpen && step === 'CAPTURE') {
      const timer = setTimeout(initCanvas, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, step, initCanvas]);

  // Coordinate calculation relative to canvas bounding box
  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // Pointer event handlers (Mouse, Touch, Stylus unified)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Ignore secondary pointers (multi-touch protection)
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
      // Fallback if setPointerCapture is not supported
    }

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);

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
      setSignatureData(canvas.toDataURL('image/png'));
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
        if (hasSignature) {
          setSignatureData(canvas.toDataURL('image/png'));
        }
      }
      activePointerIdRef.current = null;
      setIsDrawing(false);
    }
  };

  const clearSignature = () => {
    activePointerIdRef.current = null;
    setIsDrawing(false);
    initCanvas();
    setHasSignature(false);
    setSignatureData(null);
    setErrorMessage(null);
  };

  // Photo handlers
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPG, PNG, WebP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Image file is too large (maximum 10MB allowed)');
      return;
    }

    setErrorMessage(null);
    setPhotoName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoData(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoData(null);
    setPhotoName(null);
  };

  // Validation
  const handleProceedToReview = () => {
    setErrorMessage(null);
    if (!hasSignature || !signatureData) {
      setErrorMessage('Customer digital signature is required to complete delivery.');
      return;
    }
    if (!recipientName.trim()) {
      setErrorMessage('Please enter the recipient or receiving person name.');
      return;
    }
    setStep('REVIEW');
  };

  // Submit delivery
  const handleConfirmDelivery = async () => {
    if (submitting) return;

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const payload: ProofOfDeliveryData = {
        recipientName: recipientName.trim(),
        receivedBy: recipientName.trim(),
        signatureBase64: signatureData || undefined,
        signatureData: signatureData || undefined,
        photoUrl: photoData || undefined,
        notes: deliveryNotes.trim() || 'Direct doorstep delivery verified',
        deliveredAt: new Date().toISOString(),
      };

      const completed = await driverPortalService.submitProofOfDelivery(delivery.id, payload);

      if (!completed) {
        throw new Error('Failed to complete delivery on server.');
      }

      onSuccess(completed);
      onClose();
    } catch (err: any) {
      console.error('ePOD submission error:', err);
      const msg = err?.response?.data?.message || err?.message || 'An unexpected error occurred while completing delivery.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 16,
          width: '100%',
          maxWidth: 620,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: '#2563eb',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                Electronic Proof of Delivery (ePOD)
              </h3>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                Tracking #{delivery.trackingNumber} &bull; Order #{delivery.orderNumber}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={submitting}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: 6,
              borderRadius: 6,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {errorMessage && (
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: '#fee2e2',
                border: '1px solid #fca5a5',
                borderRadius: 8,
                color: '#b91c1c',
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 16,
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {step === 'CAPTURE' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Recipient Field */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  <User size={14} style={{ color: '#2563eb' }} />
                  Received By / Recipient Full Name <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Enter recipient's full name"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 14,
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Digital Signature Canvas */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#334155' }}>
                    <PenTool size={14} style={{ color: '#2563eb' }} />
                    Customer Digital Signature <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  {hasSignature && (
                    <button
                      type="button"
                      onClick={clearSignature}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#dc2626',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <RefreshCw size={12} /> Clear Signature
                    </button>
                  )}
                </div>

                <div
                  style={{
                    border: hasSignature ? '2px solid #2563eb' : '2px dashed #94a3b8',
                    borderRadius: 10,
                    backgroundColor: '#ffffff',
                    position: 'relative',
                    touchAction: 'none',
                    overflow: 'hidden',
                  }}
                >
                  <canvas
                    ref={canvasRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerCancel}
                    style={{
                      width: '100%',
                      height: 160,
                      display: 'block',
                      cursor: 'crosshair',
                      touchAction: 'none',
                    }}
                  />
                  {!hasSignature && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none',
                        color: '#94a3b8',
                        fontSize: 13,
                        fontWeight: 500,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <PenTool size={20} />
                      <span>Draw recipient signature here</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Photo Attachment */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  <Camera size={14} style={{ color: '#2563eb' }} />
                  Delivery Proof Photo (Optional)
                </label>

                {photoData ? (
                  <div
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: 10,
                      padding: '12px',
                      backgroundColor: '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                    }}
                  >
                    <img
                      src={photoData}
                      alt="Delivery proof"
                      style={{
                        width: 72,
                        height: 72,
                        objectFit: 'cover',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{photoName || 'Delivery_Proof.jpg'}</div>
                      <div style={{ fontSize: 12, color: '#16a34a', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle2 size={13} /> Photo captured & verified
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removePhoto}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#fee2e2',
                        border: '1px solid #fecaca',
                        borderRadius: 6,
                        color: '#dc2626',
                        fontSize: 12,
                        fontWeight: 600,
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
                  <label
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '18px',
                      border: '2px dashed #cbd5e1',
                      borderRadius: 10,
                      backgroundColor: '#f8fafc',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s ease',
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoUpload}
                      style={{ display: 'none' }}
                    />
                    <Camera size={24} style={{ color: '#64748b', marginBottom: 6 }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#2563eb' }}>
                      Take photo or upload image
                    </span>
                    <span style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>
                      JPG, PNG, WebP up to 10MB
                    </span>
                  </label>
                )}
              </div>

              {/* Delivery Notes */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  <FileText size={14} style={{ color: '#2563eb' }} />
                  Delivery Handover Notes
                </label>
                <textarea
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="e.g. Package handed directly to customer at doorstep / reception."
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    color: '#0f172a',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                  {[
                    'Direct handover to recipient',
                    'Left at reception counter',
                    'Received by security guard',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDeliveryNotes(preset)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        borderRadius: 4,
                        fontSize: 11.5,
                        color: '#475569',
                        cursor: 'pointer',
                      }}
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ── Step 2: Review Screen ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div
                style={{
                  padding: '14px 18px',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <CheckCircle2 size={24} style={{ color: '#16a34a', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#15803d' }}>
                    Ready to Complete Delivery
                  </div>
                  <div style={{ fontSize: 12, color: '#166534' }}>
                    Please review the delivery proof below before submitting final confirmation.
                  </div>
                </div>
              </div>

              {/* Recipient & Destination Summary */}
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#64748b' }}>
                  <MapPin size={14} style={{ color: '#2563eb' }} /> DESTINATION HANDOVER
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                  {recipientName}
                </div>
                <div style={{ fontSize: 13, color: '#475569', marginTop: 2 }}>
                  {delivery.destination.address}, {delivery.destination.city} {delivery.destination.postalCode}
                </div>
                {deliveryNotes && (
                  <div style={{ fontSize: 12.5, color: '#334155', marginTop: 8, padding: '6px 10px', backgroundColor: '#ffffff', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                    <strong>Notes:</strong> {deliveryNotes}
                  </div>
                )}
              </div>

              {/* Signature Preview */}
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#64748b' }}>
                    <PenTool size={14} style={{ color: '#2563eb' }} /> VERIFIED SIGNATURE
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep('CAPTURE')}
                    style={{ background: 'transparent', border: 'none', color: '#2563eb', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Edit Signature
                  </button>
                </div>
                {signatureData && (
                  <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 8, padding: 8, textAlign: 'center' }}>
                    <img src={signatureData} alt="Signature Preview" style={{ maxHeight: 90, maxWidth: '100%' }} />
                  </div>
                )}
              </div>

              {/* Photo Preview if attached */}
              {photoData && (
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#64748b' }}>
                      <ImageIcon size={14} style={{ color: '#2563eb' }} /> DELIVERY PHOTO
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep('CAPTURE')}
                      style={{ background: 'transparent', border: 'none', color: '#2563eb', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                    >
                      Change Photo
                    </button>
                  </div>
                  <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 8, padding: 8, textAlign: 'center' }}>
                    <img src={photoData} alt="Photo Preview" style={{ maxHeight: 120, maxWidth: '100%', borderRadius: 6 }} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f8fafc',
          }}
        >
          {step === 'CAPTURE' ? (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="driver-btn-secondary"
                style={{ padding: '10px 18px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProceedToReview}
                disabled={!hasSignature || submitting}
                className="driver-btn-primary"
                style={{
                  padding: '10px 22px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  opacity: !hasSignature ? 0.6 : 1,
                }}
              >
                <Eye size={16} /> Review Proof <ArrowRight size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep('CAPTURE')}
                disabled={submitting}
                className="driver-btn-secondary"
                style={{ padding: '10px 18px' }}
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={handleConfirmDelivery}
                disabled={submitting}
                className="driver-btn-primary"
                style={{
                  padding: '12px 28px',
                  backgroundColor: '#16a34a',
                  borderColor: '#15803d',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 14,
                  fontWeight: 800,
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? (
                  <>
                    <span style={{ width: 16, height: 16, border: '2px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                    Submitting ePOD & Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} /> CONFIRM DELIVERY
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
