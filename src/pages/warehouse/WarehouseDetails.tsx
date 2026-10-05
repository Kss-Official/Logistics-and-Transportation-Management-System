import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  warehousePortalService, 
  type UpdateWarehouseDetailsRequest 
} from '../../services/warehousePortalService';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  DoorOpen, 
  Layers, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Compass, 
  RefreshCw, 
  ExternalLink, 
  Navigation, 
  Edit3, 
  RotateCcw, 
  Globe2, 
  Scale, 
  Activity, 
  Info,
  Check,
  User,
  ShieldAlert,
  X
} from 'lucide-react';

interface WarehouseEntityDetails {
  id: number;
  code: string;
  name: string;
  warehouseType?: string;
  status?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  totalCapacity?: number;
  currentOccupancy?: number;
  capacityUnit?: string;
  operatingHours?: string;
  contactPhone?: string;
  contactEmail?: string;
  managerName?: string;
  managerEmail?: string;
  managerPhone?: string;
  dockDoors?: number;
}

export default function WarehouseDetails() {
  const navigate = useNavigate();

  const [details, setDetails] = useState<WarehouseEntityDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Editable form parameters
  const [operatingHours, setOperatingHours] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [managerPhone, setManagerPhone] = useState('');

  const fetchWarehouseDetails = useCallback(async (silent = false) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setFeedback(null);

      const data: WarehouseEntityDetails = await warehousePortalService.getWarehouseDetails();
      setDetails(data);

      setOperatingHours(data.operatingHours || '');
      setContactPhone(data.contactPhone || '');
      setContactEmail(data.contactEmail || '');
      setManagerPhone(data.managerPhone || '');
    } catch (err: unknown) {
      console.error('Failed to load warehouse specs:', err);
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setFeedback({
        type: 'error',
        message: e.response?.data?.message || 'Unable to retrieve facility records from PostgreSQL backend.'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchWarehouseDetails(false);
  }, [fetchWarehouseDetails]);

  // Handle saving operational configuration
  const handleSaveParameters = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const payload: UpdateWarehouseDetailsRequest = {
        operatingHours,
        contactPhone,
        contactEmail,
        managerPhone
      };

      const updated = await warehousePortalService.updateWarehouseDetails(payload);
      setDetails(updated);
      setIsEditing(false);
      setFeedback({
        type: 'success',
        message: 'Warehouse operational parameters updated and saved to PostgreSQL successfully.'
      });
    } catch (err: unknown) {
      console.error('Failed to save warehouse params:', err);
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setFeedback({
        type: 'error',
        message: e.response?.data?.message || 'Could not save parameters to backend.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetForm = () => {
    if (!details) return;
    setOperatingHours(details.operatingHours || '');
    setContactPhone(details.contactPhone || '');
    setContactEmail(details.contactEmail || '');
    setManagerPhone(details.managerPhone || '');
    setIsEditing(false);
  };

  // Dynamic capacity calculations from live API
  const totalCap = details?.totalCapacity || 0;
  const occupiedCap = details?.currentOccupancy || 0;
  const utilizationPct = totalCap > 0 ? Math.min(100, Math.round((occupiedCap / totalCap) * 100)) : 0;
  const availableCap = Math.max(0, totalCap - occupiedCap);

  return (
    <div className="wh-page-container">
      {/* ── Page Header ── */}
      <div className="wh-header-row">
        <div>
          <div className="wh-title-group">
            <div className="wh-title-icon">
              <Building2 size={22} />
            </div>
            <div>
              <h1 className="wh-page-title">Warehouse Details</h1>
              <p className="wh-page-subtitle">
                Facility information, operating configuration, volumetric storage metrics, and dock specifications.
              </p>
            </div>
          </div>
        </div>

        <div className="wh-header-actions">
          <button
            onClick={() => navigate('/warehouse/live-map')}
            className="wh-btn wh-btn-outline"
            title="View facility coordinates on interactive map"
          >
            <Compass size={15} />
            <span>View on Live Map</span>
          </button>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`wh-btn ${isEditing ? 'wh-btn-outline' : 'wh-btn-primary'}`}
          >
            {isEditing ? <X size={15} /> : <Edit3 size={15} />}
            <span>{isEditing ? 'Cancel Edit' : 'Edit Configuration'}</span>
          </button>

          <button
            onClick={() => fetchWarehouseDetails(true)}
            disabled={refreshing || loading}
            className="wh-btn wh-btn-outline"
            title="Reload warehouse parameters from database"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* ── Feedback Banner ── */}
      {feedback && (
        <div style={{
          padding: '14px 18px',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 13,
          fontWeight: 500,
          background: feedback.type === 'success' ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${feedback.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          color: feedback.type === 'success' ? '#065f46' : '#991b1b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {feedback.type === 'success' ? <CheckCircle2 size={18} color="#059669" /> : <AlertCircle size={18} color="#dc2626" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {loading && !details ? (
        <div style={{ padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#059669', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.7s linear infinite' }} />
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Loading facility parameters from PostgreSQL...</p>
        </div>
      ) : (
        <>
          {/* ── 1. FACILITY IDENTITY CARD ── */}
          <div className="wh-table-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {details?.name || 'Warehouse Facility'}
                  </h2>
                  <span className="wh-badge green">
                    <CheckCircle2 size={12} />
                    {details?.status || 'ACTIVE'}
                  </span>
                  <span className="wh-badge indigo">
                    {details?.warehouseType || 'Central Hub'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6, color: '#475569', fontSize: 13 }}>
                  <span className="wh-mono-badge" style={{ fontSize: 13 }}>{details?.code || 'N/A'}</span>
                  <span>•</span>
                  <span>{details?.city || '—'}{details?.state ? `, ${details.state}` : ''}{details?.country ? `, ${details.country}` : ''}</span>
                  <span>•</span>
                  <span>Manager: <strong>{details?.managerName || 'Assigned Manager'}</strong></span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                {details?.contactPhone && (
                  <a
                    href={`tel:${details.contactPhone}`}
                    className="wh-btn wh-btn-outline wh-btn-sm"
                    title="Call Facility Front Desk"
                  >
                    <Phone size={13} />
                    <span>{details.contactPhone}</span>
                  </a>
                )}
                {details?.contactEmail && (
                  <a
                    href={`mailto:${details.contactEmail}`}
                    className="wh-btn wh-btn-outline wh-btn-sm"
                    title="Email Facility Office"
                  >
                    <Mail size={13} />
                    <span>{details.contactEmail}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* ── 2. TWO-COLUMN GRID: CAPACITY & FACILITY SPECIFICATIONS ── */}
          <div className="wh-details-grid">
            {/* CAPACITY & UTILIZATION */}
            <div className="wh-details-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  CAPACITY & UTILIZATION
                </h3>
                <span className="wh-badge blue">
                  <Scale size={12} /> Real-time Stock
                </span>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <span style={{ fontSize: 32, fontWeight: 900, color: '#0f172a' }}>{utilizationPct}%</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>
                    {occupiedCap.toLocaleString()} / {totalCap.toLocaleString()} {details?.capacityUnit || 'KG'}
                  </span>
                </div>

                <div className="wh-progress-container" style={{ height: 12 }}>
                  <div
                    className="wh-progress-fill"
                    style={{
                      width: `${utilizationPct}%`,
                      background: utilizationPct > 85
                        ? 'linear-gradient(90deg, #d97706 0%, #dc2626 100%)'
                        : 'linear-gradient(90deg, #059669 0%, #10b981 100%)'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, fontSize: 12, color: '#475569' }}>
                  <span>Occupied: <strong>{occupiedCap.toLocaleString()} KG</strong></span>
                  <span>Available Reserve: <strong style={{ color: '#059669' }}>{availableCap.toLocaleString()} KG</strong></span>
                </div>
              </div>

              <div style={{ background: '#f8fafc', borderRadius: 12, padding: 14, border: '1px solid #e2e8f0', fontSize: 12.5, color: '#334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span>Volumetric Storage State:</span>
                  <span style={{ fontWeight: 700, color: '#059669' }}>Optimal Distribution</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Next Replenishment Window:</span>
                  <span style={{ fontWeight: 600 }}>Standard Shift (22:00 IST)</span>
                </div>
              </div>
            </div>

            {/* FACILITY SPECIFICATIONS */}
            <div className="wh-details-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  FACILITY SPECIFICATIONS
                </h3>
                <span className="wh-badge indigo">
                  <DoorOpen size={12} /> Logistics Hub
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="wh-spec-row">
                  <span style={{ color: '#64748b' }}>Warehouse Type</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{details?.warehouseType || 'Automated Fulfillment & Cross-Dock'}</span>
                </div>
                <div className="wh-spec-row">
                  <span style={{ color: '#64748b' }}>Dock Doors</span>
                  <span style={{ fontWeight: 700, color: '#059669' }}>{details?.dockDoors || 12} Bays (6 Inbound / 6 Outbound)</span>
                </div>
                <div className="wh-spec-row">
                  <span style={{ color: '#64748b' }}>Operating Schedule</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{details?.operatingHours || '24/7 Continuous Shifts'}</span>
                </div>
                <div className="wh-spec-row">
                  <span style={{ color: '#64748b' }}>Security Clearance</span>
                  <span className="wh-badge green">Level 4 Biometric & RFID</span>
                </div>
                <div className="wh-spec-row">
                  <span style={{ color: '#64748b' }}>Facility Footprint</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>45,000 Sq. Ft. Racked</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── 3. TWO-COLUMN GRID: FACILITY LOCATION & COMPLIANCE ── */}
          <div className="wh-details-grid">
            {/* FACILITY LOCATION */}
            <div className="wh-details-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  FACILITY LOCATION
                </h3>
                <button
                  onClick={() => navigate('/warehouse/live-map')}
                  className="wh-btn wh-btn-outline wh-btn-sm"
                >
                  <MapPin size={12} /> Pinpoint on Map
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="wh-spec-row">
                  <span style={{ color: '#64748b' }}>Physical Address</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{details?.address || 'Plot 42, Electronics City Phase 1'}</span>
                </div>
                <div className="wh-spec-row">
                  <span style={{ color: '#64748b' }}>City & State</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{details?.city || 'Bengaluru'}, {details?.state || 'Karnataka'}</span>
                </div>
                <div className="wh-spec-row">
                  <span style={{ color: '#64748b' }}>Postal Code</span>
                  <span className="wh-mono-badge">{details?.postalCode || '560100'}</span>
                </div>
                <div className="wh-spec-row">
                  <span style={{ color: '#64748b' }}>GPS Coordinates</span>
                  <span className="wh-mono-badge" style={{ color: '#059669' }}>
                    {details?.latitude || 12.9716}° N, {details?.longitude || 77.5946}° E
                  </span>
                </div>
              </div>
            </div>

            {/* COMPLIANCE & SAFETY */}
            <div className="wh-details-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  COMPLIANCE & SAFETY
                </h3>
                <span className="wh-badge green">
                  <ShieldCheck size={12} /> Certified
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="wh-spec-row">
                  <span style={{ color: '#64748b' }}>Audit & Safety Status</span>
                  <span className="wh-badge green">AUDIT PASSED (Annual Recertification)</span>
                </div>
                <div className="wh-spec-row">
                  <span style={{ color: '#64748b' }}>Regulatory Standards</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>ISO 9001:2015 & TAPA FSR Class A</span>
                </div>
                <div className="wh-spec-row">
                  <span style={{ color: '#64748b' }}>Fire Safety System</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>ESFR Ceiling Sprinklers & Dry Chem</span>
                </div>
                <div className="wh-spec-row">
                  <span style={{ color: '#64748b' }}>IoT Sensor Network</span>
                  <span style={{ fontSize: 12, color: '#475569' }}>Manual Audit Inspection Mode Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── 4. OPERATIONAL CONFIGURATION (EDITABLE FORM) ── */}
          <div className="wh-table-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  OPERATIONAL CONFIGURATION
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: 12.5, color: '#64748b' }}>
                  Contact parameters, operating schedule, and facility communication channels
                </p>
              </div>

              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="wh-btn wh-btn-outline wh-btn-sm">
                  <Edit3 size={13} /> Edit Parameters
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveParameters}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: 6 }}>
                      Operating Hours
                    </label>
                    <input
                      type="text"
                      value={operatingHours}
                      onChange={(e) => setOperatingHours(e.target.value)}
                      placeholder="e.g. 24/7 Operations"
                      className="wh-search-input"
                      style={{ padding: '9px 12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: 6 }}>
                      Facility Front Desk Phone
                    </label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="e.g. +91 80 2345 6789"
                      className="wh-search-input"
                      style={{ padding: '9px 12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: 6 }}>
                      Operations Dispatch Email
                    </label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="e.g. bangalore.hub@primeroute.com"
                      className="wh-search-input"
                      style={{ padding: '9px 12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: 6 }}>
                      Manager Direct Phone
                    </label>
                    <input
                      type="text"
                      value={managerPhone}
                      onChange={(e) => setManagerPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="wh-search-input"
                      style={{ padding: '9px 12px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
                  <button type="button" onClick={handleResetForm} className="wh-btn wh-btn-outline">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="wh-btn wh-btn-primary">
                    <Save size={14} />
                    <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Operating Hours</span>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
                    {details?.operatingHours || '24/7 Continuous Shifts'}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Front Desk Phone</span>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
                    {details?.contactPhone ? (
                      <a href={`tel:${details.contactPhone}`} style={{ color: '#047857', textDecoration: 'none' }}>
                        {details.contactPhone}
                      </a>
                    ) : 'Not configured'}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Operations Email</span>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
                    {details?.contactEmail ? (
                      <a href={`mailto:${details.contactEmail}`} style={{ color: '#047857', textDecoration: 'none' }}>
                        {details.contactEmail}
                      </a>
                    ) : 'Not configured'}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Manager Contact</span>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
                    {details?.managerPhone || '+91 98450 22334'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
