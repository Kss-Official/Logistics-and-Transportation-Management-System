import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  warehousePortalService, 
  type WarehouseManagerProfile 
} from '../../services/warehousePortalService';
import { profileService } from '../../services/profileService';
import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  ShieldCheck, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Lock,
  BadgeCheck,
  RefreshCw,
  LogOut,
  MapPin,
  Clock,
  Layers,
  Calendar,
  Eye,
  EyeOff
} from 'lucide-react';
import Modal from '../../components/common/Modal';
import { useToast } from '../../components/common/Toast';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<WarehouseManagerProfile | null>(null);
  const [warehouseDetails, setWarehouseDetails] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Logout modal
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [profData, whData] = await Promise.all([
        warehousePortalService.getProfile(),
        warehousePortalService.getWarehouse().catch(() => null),
      ]);
      setProfile(profData);
      setWarehouseDetails(whData);
    } catch (err: unknown) {
      console.error('Failed to load manager profile:', err);
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e.response?.data?.message || 'Unable to load manager profile credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }
    if (newPassword.length < 8) {
      setFeedback({ type: 'error', message: 'New password must be at least 8 characters long.' });
      return;
    }

    try {
      setChangingPass(true);
      await profileService.changePassword({
        currentPassword,
        newPassword,
      });
      setFeedback({ type: 'success', message: 'Security credentials updated successfully.' });
      showToast('success', 'Password Updated', 'Your security password has been changed.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      console.error('Password change error:', err);
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = e.response?.data?.message || 'Failed to update password. Please check your current password.';
      setFeedback({ type: 'error', message: msg });
      showToast('error', 'Update Failed', msg);
    } finally {
      setChangingPass(false);
    }
  };

  const handleConfirmLogout = () => {
    setLogoutModalOpen(false);
    logout();
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
        <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 16px', color: '#059669' }} />
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
          Loading Personnel Credentials...
        </h3>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
          Retrieving authenticated warehouse assignment and facility scope.
        </p>
      </div>
    );
  }

  const managerInitials = profile?.fullName
    ? profile.fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'PS';

  return (
    <div style={{ maxWidth: 1140, margin: '0 auto', padding: '24px 32px 40px', boxSizing: 'border-box' }} className="space-y-6">
      {/* ── Page Header ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ padding: 6, borderRadius: 8, backgroundColor: '#ecfdf5', color: '#059669', display: 'flex' }}>
            <User size={20} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Manager Profile & Facility Authority
          </h1>
        </div>
        <p style={{ fontSize: 13.5, color: '#64748b', margin: 0 }}>
          Manage your account, warehouse assignment and security settings.
        </p>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', borderRadius: 8, backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* ── Profile Header Card ── */}
      <div className="card" style={{ padding: 24, background: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 16,
                backgroundColor: '#059669',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                fontWeight: 800,
                boxShadow: '0 4px 12px rgba(5,150,105,0.25)',
                flexShrink: 0,
              }}
            >
              {managerInitials}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {profile?.fullName || 'Warehouse Manager'}
                </h2>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, backgroundColor: '#ecfdf5', color: '#059669', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <BadgeCheck size={13} /> Active Personnel
                </span>
                <span className="badge badge-green" style={{ fontSize: 11, fontWeight: 700, backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}>
                  {profile?.role || 'WAREHOUSE_MANAGER'}
                </span>
              </div>

              <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
                Warehouse Operations Manager · PrimeRoute Logistics Supply Chain Network
              </p>

              <div style={{ display: 'flex', gap: 18, fontSize: 12.5, color: '#475569', marginTop: 8, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Mail size={13} color="#64748b" />
                  <span>{profile?.email || '—'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Phone size={13} color="#64748b" />
                  <span>{profile?.phone || '—'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Building2 size={13} color="#059669" />
                  <strong style={{ color: '#0f172a' }}>{profile?.warehouseName || 'Assigned Warehouse'}</strong>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="wh-btn wh-btn-outline"
            onClick={fetchProfileData}
            style={{ fontSize: 12.5, gap: 6, padding: '8px 14px' }}
          >
            <RefreshCw size={13} /> Refresh Details
          </button>
        </div>
      </div>

      {/* ── Two-Column Main Content Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 20 }}>
        {/* Left Column: Account Information */}
        <div className="card" style={{ padding: 22, background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
            <User size={18} color="#059669" />
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Account Information
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>
                Full Legal Name
              </label>
              <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0', color: '#0f172a', fontWeight: 600 }}>
                {profile?.fullName || '—'}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>
                Official Email Address
              </label>
              <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0', color: '#0f172a', fontFamily: 'monospace' }}>
                {profile?.email || '—'}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>
                Verified Phone Contact
              </label>
              <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0', color: '#0f172a', fontWeight: 600 }}>
                {profile?.phone || '—'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>
                  Role Designation
                </label>
                <div style={{ padding: '8px 12px', background: '#ecfdf5', borderRadius: 6, border: '1px solid #a7f3d0', color: '#065f46', fontWeight: 700, fontSize: 12 }}>
                  {profile?.role || 'WAREHOUSE_MANAGER'}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>
                  Security Clearance
                </label>
                <div style={{ padding: '8px 12px', background: '#ecfdf5', borderRadius: 6, border: '1px solid #a7f3d0', color: '#059669', fontWeight: 700, fontSize: 12 }}>
                  Level 3 (Facility Authority)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Assigned Facility Authority */}
        <div className="card" style={{ padding: 22, background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Building2 size={18} color="#059669" />
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Assigned Facility Authority
              </h3>
            </div>
            {profile?.warehouseCode && (
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', fontFamily: 'monospace' }}>
                {profile.warehouseCode}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
            <div style={{ padding: 12, backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                You are operational authority for:
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '3px 0' }}>
                {profile?.warehouseName || 'Assigned Warehouse'}
              </div>
              <div style={{ fontSize: 12, color: '#475569', display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 4 }}>
                <MapPin size={14} color="#64748b" style={{ marginTop: 2, flexShrink: 0 }} />
                <span>
                  {profile?.warehouseAddress || 'Facility Location'}{profile?.warehouseCity ? `, ${profile.warehouseCity}` : ''}{profile?.warehouseState ? `, ${profile.warehouseState}` : ''}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12.5 }}>
              <div style={{ padding: '8px 10px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 6 }}>
                <span style={{ color: '#64748b', display: 'block', fontSize: 11 }}>Total Capacity:</span>
                <strong style={{ color: '#0f172a' }}>{profile?.warehouseCapacity ? `${profile.warehouseCapacity.toLocaleString()} KG` : '—'}</strong>
              </div>

              <div style={{ padding: '8px 10px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 6 }}>
                <span style={{ color: '#64748b', display: 'block', fontSize: 11 }}>Dock Loading Bays:</span>
                <strong style={{ color: '#059669' }}>{warehouseDetails?.dockDoors ? `${warehouseDetails.dockDoors} Active Doors` : 'Operational'}</strong>
              </div>

              <div style={{ padding: '8px 10px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 6 }}>
                <span style={{ color: '#64748b', display: 'block', fontSize: 11 }}>Operating Schedule:</span>
                <strong style={{ color: '#0f172a' }}>{profile?.operatingHours || '24/7 Schedule'}</strong>
              </div>

              <div style={{ padding: '8px 10px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 6 }}>
                <span style={{ color: '#64748b', display: 'block', fontSize: 11 }}>Dispatch Hotline:</span>
                <strong style={{ color: '#047857' }}>{warehouseDetails?.contactPhone || '—'}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Security & Authentication Panel ── */}
      <div className="card" style={{ padding: 24, background: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
          <KeyRound size={18} color="#059669" />
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Security & Authentication Credentials
            </h3>
            <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
              Update your account password. Passwords must be at least 8 characters long.
            </p>
          </div>
        </div>

        {feedback && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 8,
              backgroundColor: feedback.type === 'success' ? '#ecfdf5' : '#fef2f2',
              border: `1px solid ${feedback.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
              color: feedback.type === 'success' ? '#065f46' : '#991b1b',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16,
            }}
          >
            {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} style={{ maxWidth: 640 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label form-label-required" htmlFor="current-password-input">
                Current Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="current-password-input"
                  type={showCurrentPass ? 'text' : 'password'}
                  className="form-input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  style={{ paddingRight: 36 }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  {showCurrentPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label form-label-required" htmlFor="new-password-input">
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="new-password-input"
                    type={showNewPass ? 'text' : 'password'}
                    className="form-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    required
                    style={{ paddingRight: 36 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer' }}
                  >
                    {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label form-label-required" htmlFor="confirm-password-input">
                  Confirm New Password
                </label>
                <input
                  id="confirm-password-input"
                  type="password"
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  required
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={changingPass || !currentPassword || !newPassword || !confirmPassword}
                className="wh-btn wh-btn-primary"
                style={{ gap: 6 }}
                id="update-password-btn"
              >
                {changingPass ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Updating Credentials...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={14} /> Update Security Password
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ── Active Session & Account Security ── */}
      <div className="card" style={{ padding: 22, background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Active Authenticated Session
          </h4>
          <p style={{ fontSize: 12.5, color: '#64748b', margin: '2px 0 0' }}>
            Logged in as <strong>{profile?.email}</strong> · Role: <span className="badge badge-blue" style={{ fontSize: 10 }}>{profile?.role}</span>
          </p>
        </div>

        <button
          type="button"
          className="btn btn-danger"
          onClick={() => setLogoutModalOpen(true)}
          style={{ gap: 6, fontSize: 12.5 }}
          id="sign-out-btn"
        >
          <LogOut size={14} /> Terminate Session / Sign Out
        </button>
      </div>

      {/* ── Sign Out Confirmation Modal ── */}
      <Modal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        title="Confirm Session Sign Out"
        size="sm"
      >
        <div style={{ padding: '8px 0' }}>
          <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.5, margin: '0 0 20px' }}>
            Are you sure you want to terminate your active Warehouse Manager session for <strong>{profile?.warehouseName || 'your assigned warehouse'}</strong>?
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setLogoutModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleConfirmLogout}
            >
              Sign Out Now
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
