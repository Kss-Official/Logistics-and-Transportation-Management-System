import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Shield,
  Bell,
  Building,
  Headphones,
  Sliders,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  CheckCircle,
  AlertCircle,
  Info,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { LoadingState } from '../../components/common/States';
import {
  settingsService,
  type AdminProfile,
  type NotificationSettings,
  type CompanySettings,
  type SupportSettings,
  type SystemPreferences,
} from '../../services/settingsService';

export default function AdminSettings() {
  const navigate = useNavigate();
  const { logout, updateUser } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<
    'profile' | 'security' | 'notifications' | 'company' | 'support' | 'preferences'
  >('profile');

  // Loading States
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1. Profile State
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [profileForm, setProfileForm] = useState({ fullName: '', phone: '' });

  // 2. Security State
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 3. Notification Preferences State
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    orderUpdates: true,
    shipmentUpdates: true,
    deliveryUpdates: true,
    invoiceNotifications: true,
    supportTicketNotifications: true,
  });
  const [savedNotifications, setSavedNotifications] = useState<NotificationSettings | null>(null);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);
  const [notificationsSuccess, setNotificationsSuccess] = useState<boolean>(false);

  const hasUnsavedNotificationChanges = useMemo(() => {
    if (!savedNotifications) return false;
    return (
      notifications.emailNotifications !== savedNotifications.emailNotifications ||
      notifications.orderUpdates !== savedNotifications.orderUpdates ||
      notifications.shipmentUpdates !== savedNotifications.shipmentUpdates ||
      notifications.deliveryUpdates !== savedNotifications.deliveryUpdates ||
      notifications.invoiceNotifications !== savedNotifications.invoiceNotifications ||
      notifications.supportTicketNotifications !== savedNotifications.supportTicketNotifications
    );
  }, [notifications, savedNotifications]);

  // 4. Company Settings State
  const [company, setCompany] = useState<CompanySettings>({
    companyName: '',
    tagline: '',
    gstin: '',
    corporateEmail: '',
    corporatePhone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  // 5. Support & Contact Settings State
  const [support, setSupport] = useState<SupportSettings>({
    supportEmail: '',
    supportPhone: '',
    availability: '',
    description: '',
  });

  // 6. System Preferences State
  const [preferences, setPreferences] = useState<SystemPreferences>({
    defaultCurrency: 'INR (₹)',
    defaultDeliveryType: 'EXPRESS',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12-hour (hh:mm AM/PM)',
    timeZone: 'Asia/Kolkata (IST)',
  });

  // Fetch all system settings from backend
  const loadAllSettings = useCallback(async () => {
    try {
      setPageLoading(true);
      const [p, n, c, s, pref] = await Promise.all([
        settingsService.getProfile(),
        settingsService.getNotificationSettings(),
        settingsService.getCompanySettings(),
        settingsService.getSupportSettings(),
        settingsService.getSystemPreferences(),
      ]);

      setProfile(p);
      setProfileForm({
        fullName: p.fullName || '',
        phone: p.phone || '',
      });

      setNotifications(n);
      setSavedNotifications(n);
      setNotificationsError(null);
      setCompany(c);
      setSupport(s);
      setPreferences({
        defaultCurrency: pref.defaultCurrency || 'INR (₹)',
        defaultDeliveryType: pref.defaultDeliveryType || 'EXPRESS',
        dateFormat: pref.dateFormat || 'DD/MM/YYYY',
        timeFormat: pref.timeFormat || '12-hour (hh:mm AM/PM)',
        timeZone: pref.timeZone || 'Asia/Kolkata (IST)',
      });
    } catch (err) {
      console.error('Failed to load admin settings:', err);
      setNotificationsError('Could not retrieve notification settings from server.');
      showToast('error', 'Error Loading Settings', 'Could not retrieve configuration from server.');
    } finally {
      setPageLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadAllSettings();
  }, [loadAllSettings]);

  // Handlers
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.fullName.trim()) {
      showToast('error', 'Validation Error', 'Full Name is required.');
      return;
    }
    try {
      setSaving(true);
      const updated = await settingsService.updateProfile(profileForm);
      setProfile(updated);
      updateUser({ name: updated.fullName, phone: updated.phone });
      showToast('success', 'Profile Updated', 'Saved successfully');
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      const msg = err.response?.data?.message || 'Unable to save changes. Please try again.';
      showToast('error', 'Update Failed', msg);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!securityForm.currentPassword) {
      showToast('error', 'Validation Error', 'Current password is required.');
      return;
    }
    if (securityForm.newPassword.length < 6) {
      showToast('error', 'Validation Error', 'New password must be at least 6 characters long.');
      return;
    }
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      showToast('error', 'Validation Error', 'New password and confirm password do not match.');
      return;
    }

    try {
      setSaving(true);
      await settingsService.changePassword(securityForm);
      showToast(
        'success',
        'Password Changed Successfully',
        'Saved successfully. Please sign in again with your new credentials.'
      );
      setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });

      // Cleanly transition to sign-in with clear guidance per security policy
      setTimeout(() => {
        logout('/signin/admin');
      }, 1500);
    } catch (err: any) {
      console.error('Failed to change password:', err);
      const msg = err.response?.data?.message || 'Unable to save changes. Please try again.';
      showToast('error', 'Security Error', msg);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasUnsavedNotificationChanges) return;
    try {
      setSaving(true);
      setNotificationsSuccess(false);
      const updated = await settingsService.updateNotificationSettings(notifications);
      setNotifications(updated);
      setSavedNotifications(updated);
      setNotificationsSuccess(true);
      showToast('success', 'Preferences Saved', 'Saved successfully');
      setTimeout(() => setNotificationsSuccess(false), 4000);
    } catch (err: any) {
      console.error('Failed to save notification settings:', err);
      const msg = err.response?.data?.message || 'Unable to save changes. Please try again.';
      showToast('error', 'Save Failed', msg);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.companyName || !company.companyName.trim()) {
      showToast('error', 'Validation Error', 'Company Legal Name is required.');
      return;
    }

    // Validate GSTIN if provided (Indian 15-character GSTIN format)
    if (company.gstin && company.gstin.trim()) {
      const gstinPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
      if (!gstinPattern.test(company.gstin.trim())) {
        showToast('error', 'Validation Error', 'Please enter a valid 15-character GSTIN (e.g. 29AAAAA0000A1Z5).');
        return;
      }
    }

    // Validate Website URL if provided
    if (company.website && company.website.trim()) {
      try {
        const url = new URL(company.website.trim());
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          showToast('error', 'Validation Error', 'Website URL must begin with http:// or https://');
          return;
        }
      } catch {
        showToast('error', 'Validation Error', 'Please enter a valid website URL (e.g. https://primeroute.com).');
        return;
      }
    }

    // Validate Postal Code if provided
    if (company.postalCode && company.postalCode.trim()) {
      const pinPattern = /^[1-9][0-9]{5}$|^[0-9a-zA-Z -]{3,10}$/;
      if (!pinPattern.test(company.postalCode.trim())) {
        showToast('error', 'Validation Error', 'Please enter a valid postal / PIN code.');
        return;
      }
    }

    try {
      setSaving(true);
      const updated = await settingsService.updateCompanySettings(company);
      setCompany(updated);
      showToast('success', 'Company Profile Saved', 'Saved successfully');
      window.dispatchEvent(new CustomEvent('contact:updated'));
    } catch (err: any) {
      console.error('Failed to save company settings:', err);
      const msg = err.response?.data?.message || 'Unable to save changes. Please try again.';
      showToast('error', 'Save Failed', msg);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!support.supportEmail || !support.supportEmail.trim()) {
      showToast('error', 'Validation Error', 'Support Email is required.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(support.supportEmail.trim())) {
      showToast('error', 'Validation Error', 'Please enter a valid support email address.');
      return;
    }

    if (!support.supportPhone || !support.supportPhone.trim()) {
      showToast('error', 'Validation Error', 'Support Hotline Phone is required.');
      return;
    }

    if (support.supportPhone.trim().length < 7) {
      showToast('error', 'Validation Error', 'Please enter a valid phone number (minimum 7 characters).');
      return;
    }

    if (!support.availability || !support.availability.trim()) {
      showToast('error', 'Validation Error', 'Operating Availability / Hours is required.');
      return;
    }

    if (support.description && support.description.length > 500) {
      showToast('error', 'Validation Error', 'Helpdesk description cannot exceed 500 characters.');
      return;
    }

    try {
      setSaving(true);
      const updated = await settingsService.updateSupportSettings(support);
      setSupport(updated);
      showToast(
        'success',
        'Support Desk Updated',
        'Saved successfully'
      );
      window.dispatchEvent(new CustomEvent('contact:updated'));
    } catch (err: any) {
      console.error('Failed to save support settings:', err);
      const msg = err.response?.data?.message || 'Unable to save changes. Please try again.';
      showToast('error', 'Save Failed', msg);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await settingsService.updateSystemPreferences(preferences);
      setPreferences({
        defaultCurrency: updated.defaultCurrency || 'INR (₹)',
        defaultDeliveryType: updated.defaultDeliveryType || 'EXPRESS',
        dateFormat: updated.dateFormat || 'DD/MM/YYYY',
        timeFormat: updated.timeFormat || '12-hour (hh:mm AM/PM)',
        timeZone: updated.timeZone || 'Asia/Kolkata (IST)',
      });
      showToast('success', 'System Preferences Saved', 'Saved successfully');
    } catch (err: any) {
      console.error('Failed to save system preferences:', err);
      const msg = err.response?.data?.message || 'Unable to save changes. Please try again.';
      showToast('error', 'Save Failed', msg);
    } finally {
      setSaving(false);
    }
  };

  if (pageLoading) {
    return <LoadingState message="Loading system settings..." />;
  }

  const NAV_ITEMS = [
    {
      id: 'profile' as const,
      label: 'Admin Profile',
      desc: 'Master identity & contact info',
      icon: <User size={18} />,
    },
    {
      id: 'security' as const,
      label: 'Security & Password',
      desc: 'Authentication & master keys',
      icon: <Shield size={18} />,
    },
    {
      id: 'notifications' as const,
      label: 'Notifications',
      desc: 'Operational dispatch alerts',
      icon: <Bell size={18} />,
    },
    {
      id: 'company' as const,
      label: 'Company Profile',
      desc: 'Legal entity, GSTIN & address',
      icon: <Building size={18} />,
    },
    {
      id: 'support' as const,
      label: 'Support & Helpdesk',
      desc: 'Customer hotline & desk hours',
      icon: <Headphones size={18} />,
    },
    {
      id: 'preferences' as const,
      label: 'System Preferences',
      desc: 'Currency, timezone & formats',
      icon: <Sliders size={18} />,
    },
  ];

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', paddingBottom: 48 }}>
      <style>{`
        @media (max-width: 880px) {
          .settings-layout {
            flex-direction: column !important;
          }
          .settings-sidebar {
            width: 100% !important;
          }
          .settings-nav-list {
            display: grid !important;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)) !important;
            gap: 4px !important;
            padding: 8px !important;
          }
          .settings-nav-btn {
            border-left: none !important;
            border-bottom: 3px solid transparent !important;
            border-radius: 6px !important;
          }
          .settings-nav-btn.active-tab {
            border-bottom: 3px solid #2563eb !important;
          }
        }
      `}</style>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h2 className="page-title">System Settings</h2>
          <p className="page-subtitle">
            Manage your organization, administrator account, notifications, and operational preferences.
          </p>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={loadAllSettings}
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={14} className={saving ? 'spin' : ''} />
            <span>Refresh Settings</span>
          </button>
        </div>
      </div>

      {/* Professional Two-Column Enterprise Layout */}
      <div
        className="settings-layout"
        style={{
          display: 'flex',
          gap: 24,
          alignItems: 'flex-start',
        }}
      >
        {/* ==================================================== */}
        {/* LEFT NAVIGATION PANEL                                */}
        {/* ==================================================== */}
        <div
          className="settings-sidebar"
          style={{
            width: 280,
            flexShrink: 0,
            background: '#ffffff',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '16px 18px',
              borderBottom: '1px solid var(--border)',
              background: '#f8fafc',
            }}
          >
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', margin: 0 }}>
              Settings Navigation
            </p>
          </div>

          <nav className="settings-nav-list" style={{ padding: '8px 0' }}>
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`settings-nav-btn ${isActive ? 'active-tab' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    padding: '12px 18px',
                    border: 'none',
                    borderLeft: isActive ? '3px solid #2563eb' : '3px solid transparent',
                    background: isActive ? '#eff6ff' : 'transparent',
                    color: isActive ? '#1d4ed8' : 'var(--text-primary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = '#f8fafc';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div
                    style={{
                      color: isActive ? '#2563eb' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: isActive ? 700 : 600, lineHeight: 1.3 }}>
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: isActive ? '#3b82f6' : 'var(--text-muted)',
                        marginTop: 2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* ==================================================== */}
        {/* RIGHT CONTENT SECTION                                */}
        {/* ==================================================== */}
        <div className="settings-content" style={{ flex: 1, minWidth: 0 }}>
          {/* TAB 1: ADMIN PROFILE */}
          {activeTab === 'profile' && (
            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h3 className="card-title">Administrator Account Profile</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    Manage your administrator contact details and operational identity.
                  </p>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: 12,
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                  }}
                >
                  ROLE: {profile?.role || 'ADMIN'}
                </span>
              </div>

              <div className="card-body">
                <form onSubmit={handleSaveProfile}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, marginBottom: 20 }}>
                    {/* Full Name */}
                    <div className="form-group">
                      <label className="form-label form-label-required">Full Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={profileForm.fullName}
                        onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                        placeholder="e.g. PrimeRoute Operations Admin"
                        required
                      />
                    </div>

                    {/* Email (Read-only for security) */}
                    <div className="form-group">
                      <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Email Address</span>
                        <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>
                          <Lock size={11} style={{ display: 'inline', marginRight: 3 }} />
                          System Login ID
                        </span>
                      </label>
                      <input
                        type="email"
                        className="form-input"
                        value={profile?.email || ''}
                        disabled
                        style={{ background: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' }}
                      />
                    </div>

                    {/* Phone */}
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="text"
                        className="form-input"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        placeholder="e.g. +91 98765 00001"
                      />
                    </div>

                    {/* Account Status */}
                    <div className="form-group">
                      <label className="form-label">Account Status</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 38 }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            background: '#ecfdf5',
                            color: '#047857',
                            border: '1px solid #a7f3d0',
                            padding: '4px 12px',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          <CheckCircle size={14} />
                          <span>{profile?.status || 'ACTIVE'}</span>
                        </span>
                        {profile?.twoFactorEnabled && (
                          <span
                            style={{
                              background: '#f5f3ff',
                              color: '#6d28d9',
                              border: '1px solid #ddd6fe',
                              padding: '4px 10px',
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            2FA Enabled
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Read-only metadata */}
                  {profile?.createdAt && (
                    <div
                      style={{
                        display: 'flex',
                        gap: 24,
                        flexWrap: 'wrap',
                        padding: '14px 18px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        fontSize: 12,
                        color: '#64748b',
                        marginBottom: 24,
                      }}
                    >
                      <div>
                        <strong>Account Created:</strong>{' '}
                        {new Date(profile.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                      {profile.lastPasswordChange && (
                        <div>
                          <strong>Last Password Change:</strong>{' '}
                          {new Date(profile.lastPasswordChange).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                    <Save size={14} />
                    <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: SECURITY & PASSWORD */}
          {activeTab === 'security' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Security & Credential Management</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  Update your administrator account password to maintain system security.
                </p>
              </div>

              <div className="card-body">
                <form onSubmit={handleSaveSecurity} style={{ maxWidth: 540 }}>
                  {/* Current Password */}
                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label className="form-label form-label-required">Current Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        className="form-input"
                        value={securityForm.currentPassword}
                        onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                        placeholder="Enter current password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        style={{
                          position: 'absolute',
                          right: 10,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#64748b',
                        }}
                      >
                        {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label className="form-label form-label-required">New Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        className="form-input"
                        value={securityForm.newPassword}
                        onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                        placeholder="Minimum 6 characters"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={{
                          position: 'absolute',
                          right: 10,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#64748b',
                        }}
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="form-group" style={{ marginBottom: 20 }}>
                    <label className="form-label form-label-required">Confirm New Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="form-input"
                        value={securityForm.confirmPassword}
                        onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                        placeholder="Re-enter new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{
                          position: 'absolute',
                          right: 10,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#64748b',
                        }}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Guidance Box */}
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      padding: '14px 16px',
                      marginBottom: 24,
                      fontSize: 12,
                      color: '#475569',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, marginBottom: 6, color: '#0f172a' }}>
                      <Shield size={14} color="#2563eb" />
                      <span>Password Security Best Practices</span>
                    </div>
                    <ul style={{ margin: '4px 0 0 16px', padding: 0, lineHeight: 1.6 }}>
                      <li>Minimum 6 alphanumeric characters with symbols recommended</li>
                      <li>Passwords are secured using industry-standard cryptographic encryption</li>
                      <li>Passwords are never stored in plain text or exposed in logs</li>
                    </ul>
                  </div>

                  <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                    <Lock size={14} />
                    <span>{saving ? 'Updating Password...' : 'Update Password'}</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS (Renamed from Notification Triggers) */}
          {activeTab === 'notifications' && (
            <div className="card">
              <div
                className="card-header"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                <div>
                  <h3 className="card-title">System Notification Preferences</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    Configure event notifications and operational alerts across the platform.
                  </p>
                </div>
                {hasUnsavedNotificationChanges && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: 12,
                      background: '#fffbeb',
                      color: '#b45309',
                      border: '1px solid #fde68a',
                    }}
                  >
                    Unsaved Changes
                  </span>
                )}
              </div>

              <div className="card-body">
                {notificationsError && (
                  <div
                    style={{
                      padding: '12px 16px',
                      marginBottom: 16,
                      borderRadius: 8,
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#991b1b',
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 8,
                    }}
                  >
                    <span>{notificationsError}</span>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={loadAllSettings}
                      style={{ padding: '4px 10px', fontSize: 12 }}
                    >
                      <RefreshCw size={12} style={{ marginRight: 4 }} />
                      Retry
                    </button>
                  </div>
                )}

                <form onSubmit={handleSaveNotifications}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                    {[
                      {
                        key: 'emailNotifications' as const,
                        title: 'Master Email Notifications',
                        desc: 'Master switch to send administrative summaries, receipts, and system alerts via email.',
                      },
                      {
                        key: 'orderUpdates' as const,
                        title: 'Order Status Updates',
                        desc: 'Generate notifications when bookings are created, confirmed, or cancelled.',
                      },
                      {
                        key: 'shipmentUpdates' as const,
                        title: 'Shipment Transit Checkpoints',
                        desc: 'Notify operations and customers when cargo reaches hub milestones.',
                      },
                      {
                        key: 'deliveryUpdates' as const,
                        title: 'Delivery & Proof of Delivery (POD)',
                        desc: 'Dispatch alerts when final delivery is attempted, completed, or signed.',
                      },
                      {
                        key: 'invoiceNotifications' as const,
                        title: 'Invoice & Billing Alerts',
                        desc: 'Generate notices for newly issued freight invoices, payments, and overdue accounts.',
                      },
                      {
                        key: 'supportTicketNotifications' as const,
                        title: 'Support Ticket Inquiries & Replies',
                        desc: 'Trigger alerts immediately when a customer opens a ticket or submits a message.',
                      },
                    ].map((item) => {
                      const isChecked = notifications[item.key];
                      return (
                        <div
                          key={item.key}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '14px 18px',
                            border: isChecked ? '1px solid #bfdbfe' : '1px solid var(--border)',
                            background: isChecked ? '#f8faff' : '#ffffff',
                            borderRadius: 'var(--radius)',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ paddingRight: 16 }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                              {item.title}
                            </p>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>
                              {item.desc}
                            </p>
                          </div>

                          <label
                            style={{
                              position: 'relative',
                              display: 'inline-block',
                              width: 44,
                              height: 24,
                              flexShrink: 0,
                              cursor: 'pointer',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) =>
                                setNotifications({ ...notifications, [item.key]: e.target.checked })
                              }
                              style={{ opacity: 0, width: 0, height: 0 }}
                            />
                            <span
                              style={{
                                position: 'absolute',
                                cursor: 'pointer',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: isChecked ? '#2563eb' : '#cbd5e1',
                                transition: '0.2s',
                                borderRadius: 24,
                              }}
                            >
                              <span
                                style={{
                                  position: 'absolute',
                                  content: '""',
                                  height: 18,
                                  width: 18,
                                  left: isChecked ? 23 : 3,
                                  bottom: 3,
                                  backgroundColor: 'white',
                                  transition: '0.2s',
                                  borderRadius: '50%',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                }}
                              />
                            </span>
                          </label>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      disabled={saving || !hasUnsavedNotificationChanges}
                      style={{
                        opacity: saving || !hasUnsavedNotificationChanges ? 0.65 : 1,
                        cursor: saving || !hasUnsavedNotificationChanges ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <Save size={14} />
                      <span>{saving ? 'Saving...' : 'Save Notification Preferences'}</span>
                    </button>

                    {notificationsSuccess && (
                      <span
                        style={{
                          fontSize: 13,
                          color: '#16a34a',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <CheckCircle size={15} color="#16a34a" />
                        Saved successfully
                      </span>
                    )}

                    {!hasUnsavedNotificationChanges && !notificationsSuccess && savedNotifications && (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        All preferences saved
                      </span>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: COMPANY PROFILE */}
          {activeTab === 'company' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Company Profile</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  Official enterprise registration, tax identity, and headquarters address.
                </p>
              </div>

              <div className="card-body">
                <form onSubmit={handleSaveCompany}>
                  {/* SECTION 1: Corporate Identity */}
                  <div style={{ marginBottom: 16 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      Corporate Identity
                    </h4>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                      Official enterprise name, branding, and tax identification details.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 24 }}>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label form-label-required">Company Legal Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={company.companyName}
                        onChange={(e) => setCompany({ ...company, companyName: e.target.value })}
                        placeholder="e.g. PrimeRoute Logistics India Pvt. Ltd."
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Brand Tagline</label>
                      <input
                        type="text"
                        className="form-input"
                        value={company.tagline || ''}
                        onChange={(e) => setCompany({ ...company, tagline: e.target.value })}
                        placeholder="e.g. Smart Logistics. Reliable Delivery."
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">GSTIN</label>
                      <input
                        type="text"
                        className="form-input font-mono"
                        value={company.gstin || ''}
                        onChange={(e) => setCompany({ ...company, gstin: e.target.value })}
                        placeholder="e.g. 29AAAAA0000A1Z5"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Corporate Email</label>
                      <input
                        type="email"
                        className="form-input"
                        value={company.corporateEmail || ''}
                        onChange={(e) => setCompany({ ...company, corporateEmail: e.target.value })}
                        placeholder="e.g. corporate@primeroute.com"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Corporate Hotline / Phone</label>
                      <input
                        type="tel"
                        className="form-input font-mono"
                        value={company.corporatePhone || ''}
                        onChange={(e) => setCompany({ ...company, corporatePhone: e.target.value })}
                        placeholder="e.g. +91 (800) 774-6376"
                      />
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">Official Website URL</label>
                      <input
                        type="url"
                        className="form-input"
                        value={company.website || ''}
                        onChange={(e) => setCompany({ ...company, website: e.target.value })}
                        placeholder="e.g. https://primeroute.com"
                      />
                    </div>
                  </div>

                  {/* Section Divider */}
                  <div style={{ borderTop: '1px solid var(--border)', margin: '0 0 20px' }} />

                  {/* SECTION 2: Headquarters */}
                  <div style={{ marginBottom: 16 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      Headquarters
                    </h4>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                      Primary registered corporate facility and postal dispatch address.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 20 }}>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">Headquarters Address</label>
                      <textarea
                        className="form-textarea"
                        rows={2}
                        value={company.address || ''}
                        onChange={(e) => setCompany({ ...company, address: e.target.value })}
                        placeholder="e.g. Plot 42, Tech Logistics Park, Whitefield"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        className="form-input"
                        value={company.city || ''}
                        onChange={(e) => setCompany({ ...company, city: e.target.value })}
                        placeholder="e.g. Bengaluru"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">State / Province</label>
                      <input
                        type="text"
                        className="form-input"
                        value={company.state || ''}
                        onChange={(e) => setCompany({ ...company, state: e.target.value })}
                        placeholder="e.g. Karnataka"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Postal / PIN Code</label>
                      <input
                        type="text"
                        className="form-input font-mono"
                        value={company.postalCode || ''}
                        onChange={(e) => setCompany({ ...company, postalCode: e.target.value })}
                        placeholder="e.g. 560066"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Country</label>
                      <input
                        type="text"
                        className="form-input"
                        value={company.country || ''}
                        onChange={(e) => setCompany({ ...company, country: e.target.value })}
                        placeholder="e.g. India"
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                    <Save size={14} />
                    <span>{saving ? 'Saving...' : 'Save Company Profile'}</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 5: SUPPORT & HELPDESK */}
          {activeTab === 'support' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Support & Helpdesk</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  Configure the contact information and availability shown to customers.
                </p>
              </div>

              <div className="card-body">
                <form onSubmit={handleSaveSupport}>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 20 }}>
                    <div className="form-group">
                      <label className="form-label form-label-required">Support Email</label>
                      <div style={{ position: 'relative' }}>
                        <Mail size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                        <input
                          type="email"
                          className="form-input"
                          style={{ paddingLeft: 32 }}
                          value={support.supportEmail}
                          onChange={(e) => setSupport({ ...support, supportEmail: e.target.value })}
                          placeholder="e.g. support@primeroute.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label form-label-required">Support Hotline Phone</label>
                      <div style={{ position: 'relative' }}>
                        <Phone size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                        <input
                          type="text"
                          className="form-input"
                          style={{ paddingLeft: 32 }}
                          value={support.supportPhone}
                          onChange={(e) => setSupport({ ...support, supportPhone: e.target.value })}
                          placeholder="e.g. +91 98765 43210"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label form-label-required">Operating Availability / Hours</label>
                      <input
                        type="text"
                        className="form-input"
                        value={support.availability}
                        onChange={(e) => setSupport({ ...support, availability: e.target.value })}
                        placeholder="e.g. 24/7 Dedicated Logistics Assistance"
                        required
                      />
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">Helpdesk Scope & Escalation Description</label>
                      <textarea
                        className="form-textarea"
                        rows={3}
                        value={support.description || ''}
                        onChange={(e) => setSupport({ ...support, description: e.target.value })}
                        placeholder="e.g. Operations desk hotline for critical freight inquiries, transit delays, and cargo damage disputes."
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                    <Save size={14} />
                    <span>{saving ? 'Saving...' : 'Save Support Desk Settings'}</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 6: SYSTEM PREFERENCES */}
          {activeTab === 'preferences' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Operational System Preferences</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  Configure base currency, transit service tier, date format, time format, and timezone rules.
                </p>
              </div>

              <div className="card-body">
                <form onSubmit={handleSavePreferences}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18, marginBottom: 24 }}>
                    {/* Default Currency */}
                    <div className="form-group">
                      <label className="form-label">Default Operating Currency</label>
                      <select
                        className="form-select"
                        value={preferences.defaultCurrency}
                        onChange={(e) => setPreferences({ ...preferences, defaultCurrency: e.target.value })}
                      >
                        <option value="INR (₹)">INR (₹) — Indian Rupee</option>
                        <option value="USD ($)">USD ($) — US Dollar</option>
                        <option value="EUR (€)">EUR (€) — Euro</option>
                        <option value="GBP (£)">GBP (£) — British Pound</option>
                        <option value="AED (د.إ)">AED (د.إ) — UAE Dirham</option>
                      </select>
                    </div>

                    {/* Default Delivery Type */}
                    <div className="form-group">
                      <label className="form-label">Default Delivery Service</label>
                      <select
                        className="form-select"
                        value={preferences.defaultDeliveryType}
                        onChange={(e) => setPreferences({ ...preferences, defaultDeliveryType: e.target.value })}
                      >
                        <option value="STANDARD">STANDARD — Regular Road Freight</option>
                        <option value="EXPRESS">EXPRESS — Priority Transit Hub</option>
                        <option value="SAME_DAY">SAME_DAY — Intra-City Direct</option>
                        <option value="BULK_FREIGHT">BULK_FREIGHT — Full Truckload (FTL)</option>
                      </select>
                    </div>

                    {/* Date Format */}
                    <div className="form-group">
                      <label className="form-label">Date Display Format</label>
                      <select
                        className="form-select font-mono"
                        value={preferences.dateFormat}
                        onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 11/09/2026)</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD (ISO standard)</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY (US standard)</option>
                        <option value="DD MMM YYYY">DD MMM YYYY (e.g. 11 Sep 2026)</option>
                      </select>
                    </div>

                    {/* Time Format */}
                    <div className="form-group">
                      <label className="form-label">Time Display Format</label>
                      <select
                        className="form-select font-mono"
                        value={preferences.timeFormat || '12-hour (hh:mm AM/PM)'}
                        onChange={(e) => setPreferences({ ...preferences, timeFormat: e.target.value })}
                      >
                        <option value="12-hour (hh:mm AM/PM)">12-hour (hh:mm AM/PM)</option>
                        <option value="24-hour (HH:mm)">24-hour (HH:mm)</option>
                      </select>
                    </div>

                    {/* Time Zone */}
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">Operational Time Zone</label>
                      <select
                        className="form-select"
                        value={preferences.timeZone}
                        onChange={(e) => setPreferences({ ...preferences, timeZone: e.target.value })}
                      >
                        <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST, UTC+5:30)</option>
                        <option value="UTC">UTC (Coordinated Universal Time)</option>
                        <option value="America/New_York (EST)">America/New_York (EST/EDT, UTC-5)</option>
                        <option value="Europe/London (GMT)">Europe/London (GMT/BST, UTC+0)</option>
                        <option value="Asia/Dubai (GST)">Asia/Dubai (GST, UTC+4)</option>
                        <option value="Asia/Singapore (SGT)">Asia/Singapore (SGT, UTC+8)</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                    <Save size={14} />
                    <span>{saving ? 'Saving...' : 'Save System Preferences'}</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
