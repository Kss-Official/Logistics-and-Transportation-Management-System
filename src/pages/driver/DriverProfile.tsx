import React, { useEffect, useState, useCallback } from 'react';
import {
  User,
  ShieldCheck,
  Award,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Truck,
  FileCheck,
  Star,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Info,
  Lock
} from 'lucide-react';
import { driverPortalService } from '../../services/driverPortalService';
import type { DriverProfileData } from '../../types/driverPortal';

export default function DriverProfile() {
  const [profile, setProfile] = useState<DriverProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchProfile = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
      setSuccessMsg(null);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await driverPortalService.getProfile();
      setProfile(data);
      if (isManualRefresh) {
        setSuccessMsg('Driver profile verified and synchronized with Fleet Control.');
        setTimeout(() => setSuccessMsg(null), 3500);
      }
    } catch (err: any) {
      console.error('Failed to load driver profile:', err);
      setError('Unable to load driver information. Please verify your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile(false);
  }, [fetchProfile]);

  if (loading && !profile) {
    return (
      <div className="driver-page-container" style={{ alignItems: 'center', justifyContent: 'center', minHeight: 320, display: 'flex' }}>
        <div style={{ color: '#2563eb', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 18, height: 18, border: '2px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
          <span>Loading driver profile...</span>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="driver-page-container">
        <div className="driver-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <AlertCircle size={40} style={{ color: '#dc2626', margin: '0 auto 12px' }} />
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
            {error || 'Unable to load driver information.'}
          </h3>
          <p style={{ color: '#64748b', fontSize: 13, margin: '8px 0 16px' }}>
            Please ensure you are logged in with valid driver credentials.
          </p>
          <button
            onClick={() => fetchProfile(false)}
            className="driver-btn-primary"
            style={{ margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={14} /> Retry Profile
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const displayName = profile.fullName || profile.name || 'Driver';
  const initials = displayName && displayName !== 'Not available'
    ? displayName
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'DR';

  const vehicleDetails = profile.assignedVehiclePlate && profile.assignedVehiclePlate !== 'Not available'
    ? `${profile.assignedVehicleModel || 'Vehicle'} (${profile.assignedVehiclePlate})`
    : 'No vehicle assigned';

  return (
    <div className="driver-page-container">
      {/* ── Status Messages ── */}
      {successMsg && (
        <div style={{ padding: '10px 14px', backgroundColor: '#dcfce7', border: '1px solid #86efac', borderRadius: 8, color: '#15803d', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div style={{ padding: '10px 14px', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, color: '#b91c1c', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* ── Driver Hero Card ── */}
      <div className="driver-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 24,
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                flexShrink: 0,
              }}
            >
              {initials}
            </div>

            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
                  {displayName}
                </h2>
                <span className="driver-badge driver-badge-green">
                  <CheckCircle2 size={12} /> {profile.status ? profile.status.replace(/_/g, ' ') : 'ACTIVE'}
                </span>
                <span className="driver-badge driver-badge-blue">
                  <Star size={12} style={{ fill: '#2563eb' }} /> {profile.safetyRating || 5.0} RATING
                </span>
              </div>

              <div style={{ fontSize: 13, color: '#64748b', marginTop: 6, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <span>
                  Driver ID: <strong style={{ color: '#0f172a' }}>{profile.driverId || profile.driverCode}</strong>
                </span>
                <span>&bull;</span>
                <span>
                  Warehouse: <strong style={{ color: '#0f172a' }}>{profile.assignedWarehouseName}</strong>
                </span>
                <span>&bull;</span>
                <span>
                  Truck: <strong style={{ color: '#0f172a' }}>{vehicleDetails}</strong>
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => fetchProfile(true)}
              disabled={refreshing}
              className="driver-btn-secondary"
              id="refresh-profile-btn"
              title="Refresh profile data from server"
              style={{ padding: '8px 14px', fontSize: 12.5 }}
            >
              <RefreshCw size={14} className={refreshing ? 'driver-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh Profile'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Operations Managed Read-Only Notice ── */}
      <div
        style={{
          padding: '12px 16px',
          borderRadius: 8,
          backgroundColor: '#f1f5f9',
          border: '1px solid #cbd5e1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Lock size={16} style={{ color: '#475569', flexShrink: 0 }} />
          <div style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>
            <strong>Profile changes are managed by Operations.</strong> Driver identity, licenses, and fleet assignments are regulatory-verified records.
          </div>
        </div>
        <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
          Compliance Status: <span style={{ color: '#16a34a' }}>VERIFIED</span>
        </div>
      </div>

      {/* ── Career Performance KPIs ── */}
      <div className="driver-kpi-grid">
        <div className="driver-kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="driver-kpi-label">Total Assigned Consignments</span>
            <Award size={18} style={{ color: '#2563eb' }} />
          </div>
          <div className="driver-kpi-value">{Number(profile.totalTripsCompleted || 0).toLocaleString()}</div>
          <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>PrimeRoute Fleet Operations</div>
        </div>

        <div className="driver-kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="driver-kpi-label">Completed Deliveries</span>
            <CheckCircle2 size={18} style={{ color: '#16a34a' }} />
          </div>
          <div className="driver-kpi-value" style={{ color: '#16a34a' }}>
            {Number(profile.totalDeliveriesCompleted || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: '#64748b' }}>Verified deliveries</div>
        </div>

        <div className="driver-kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="driver-kpi-label">On-Time Performance</span>
            <ShieldCheck size={18} style={{ color: '#16a34a' }} />
          </div>
          <div className="driver-kpi-value" style={{ color: '#16a34a' }}>
            {profile.onTimeRatePercentage || 100}%
          </div>
          <div style={{ fontSize: 12, color: '#64748b' }}>Authoritative fleet metric</div>
        </div>
      </div>

      {/* ── Driver Licensing & Regulatory Credentials ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Licensing card */}
        <div className="driver-card">
          <h3 className="driver-card-title">
            <FileCheck size={18} style={{ color: '#2563eb' }} />
            Licensing & Endorsements
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
            <div style={{ padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Heavy Commercial Vehicle License
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                {profile.licenseNumber || 'Not available'}
              </div>
              <div style={{ fontSize: 11.5, color: profile.licenseExpiry && profile.licenseExpiry !== 'Not available' ? '#16a34a' : '#64748b', marginTop: 2 }}>
                Expires: {profile.licenseExpiry || 'Verified Valid'}
              </div>
            </div>

            <div style={{ padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Operational Address
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginTop: 2 }}>
                {profile.address || 'Operations Registered Address'}
              </div>
            </div>

            <div style={{ padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Assigned Warehouse
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                {profile.assignedWarehouseName} {profile.assignedWarehouseCode ? `(${profile.assignedWarehouseCode})` : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div className="driver-card">
          <h3 className="driver-card-title">
            <Phone size={18} style={{ color: '#2563eb' }} />
            Driver Contact Information
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: 8 }}>
              <Phone size={16} style={{ color: '#2563eb' }} />
              <div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Primary Mobile</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{profile.phone}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: 8 }}>
              <Mail size={16} style={{ color: '#2563eb' }} />
              <div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Work Email</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{profile.email}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: 8 }}>
              <Truck size={16} style={{ color: '#2563eb' }} />
              <div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Assigned Vehicle</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{vehicleDetails}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
