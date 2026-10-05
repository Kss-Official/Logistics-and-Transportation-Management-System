import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  ShieldCheck,
  ShieldAlert,
  Clock,
  AlertCircle,
  KeyRound,
  Edit3,
  CheckCircle2,
  Lock,
  UserCheck,
  Package,
  Truck,
  Calendar,
  Eye,
  EyeOff,
  Save,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import Modal from '../../components/common/Modal';
import { profileService } from '../../services/profileService';
import type {
  CustomerProfile,
  ProfileUpdateRequest,
  ChangePasswordRequest,
} from '../../services/profileService';
import { formatDisplayName } from '../../services/authService';
import {
  validateFullName,
  validateIndianPhone,
  validateEmail,
  validatePassword,
} from '../../utils/validation';

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function CustomerProfilePage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [editForm, setEditForm] = useState<ProfileUpdateRequest>({
    fullName: '',
    phone: '',
    companyName: '',
    businessType: '',
    businessEmail: '',
    businessPhone: '',
    registrationNumber: '',
    gstin: '',
    businessAddress: '',
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Edit Personal Contact Modal State
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});
  const [contactForm, setContactForm] = useState({
    fullName: '',
    phone: '',
  });
  const [updatingContact, setUpdatingContact] = useState(false);

  // Change Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile();
      setProfile(data);
      setEditForm({
        fullName: data.fullName || '',
        phone: data.phone || '',
        companyName: data.companyName || '',
        businessType: data.businessType || 'Private Limited',
        businessEmail: data.businessEmail || '',
        businessPhone: data.businessPhone || '',
        registrationNumber: data.registrationNumber || '',
        gstin: data.gstin || '',
        businessAddress: data.businessAddress || '',
      });
    } catch (err: any) {
      showToast('error', 'Error', 'Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleOpenEditModal = () => {
    if (profile) {
      setEditForm({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        companyName: profile.companyName || '',
        businessType: profile.businessType || 'Private Limited',
        businessEmail: profile.businessEmail || '',
        businessPhone: profile.businessPhone || '',
        registrationNumber: profile.registrationNumber || '',
        gstin: profile.gstin || '',
        businessAddress: profile.businessAddress || '',
      });
    }
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const nameRes = validateFullName(editForm.fullName || '');
    if (!nameRes.isValid) errors.fullName = nameRes.error!;

    if (editForm.phone?.trim()) {
      const phoneRes = validateIndianPhone(editForm.phone);
      if (!phoneRes.isValid) errors.phone = phoneRes.error!;
    }

    if (editForm.businessPhone?.trim()) {
      const bPhoneRes = validateIndianPhone(editForm.businessPhone);
      if (!bPhoneRes.isValid) errors.businessPhone = bPhoneRes.error!;
    }

    if (editForm.businessEmail?.trim()) {
      const emailRes = validateEmail(editForm.businessEmail);
      if (!emailRes.isValid) errors.businessEmail = emailRes.error!;
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      showToast('error', 'Validation Error', 'Please correct the highlighted fields.');
      return;
    }
    setEditErrors({});

    try {
      setUpdatingProfile(true);
      const updated = await profileService.updateProfile(editForm);
      setProfile(updated);
      setIsEditModalOpen(false);
      showToast('success', 'Profile Updated', 'Your profile information has been saved.');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update profile.';
      showToast('error', 'Update Failed', msg);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleOpenContactModal = () => {
    if (profile) {
      setContactForm({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
      });
      setContactErrors({});
    }
    setIsContactModalOpen(true);
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const nameRes = validateFullName(contactForm.fullName || '');
    if (!nameRes.isValid) errors.fullName = nameRes.error!;

    if (contactForm.phone?.trim()) {
      const phoneRes = validateIndianPhone(contactForm.phone);
      if (!phoneRes.isValid) errors.phone = phoneRes.error!;
    }

    if (Object.keys(errors).length > 0) {
      setContactErrors(errors);
      showToast('error', 'Validation Error', 'Please correct the highlighted fields.');
      return;
    }
    setContactErrors({});

    try {
      setUpdatingContact(true);
      const updated = await profileService.updateProfile({
        fullName: contactForm.fullName.trim(),
        phone: contactForm.phone?.trim() || '',
        companyName: profile?.companyName || undefined,
        businessType: profile?.businessType || undefined,
        businessEmail: profile?.businessEmail || undefined,
        businessPhone: profile?.businessPhone || undefined,
        registrationNumber: profile?.registrationNumber || undefined,
        gstin: profile?.gstin || undefined,
        businessAddress: profile?.businessAddress || undefined,
      });
      setProfile(updated);
      setIsContactModalOpen(false);
      showToast('success', 'Contact Updated', 'Primary account contact details saved successfully.');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update contact details.';
      showToast('error', 'Update Failed', msg);
    } finally {
      setUpdatingContact(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!passwordForm.currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    const pwdRes = validatePassword(passwordForm.newPassword);
    if (!pwdRes.isValid) {
      setPasswordError(pwdRes.error!);
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      setUpdatingPassword(true);
      await profileService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setIsPasswordModalOpen(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('success', 'Security Updated', 'Your account password was changed successfully.');
      fetchProfile();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Current password was incorrect or invalid.';
      setPasswordError(msg);
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Derive initials
  const displayName = profile?.fullName || formatDisplayName(user?.name, user?.email);
  const companyTitle = profile?.companyName || displayName;
  const initials = (companyTitle || 'PR')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Verification Badge Renderer
  const renderVerificationBadge = (status?: string) => {
    const s = (status || 'VERIFIED').toUpperCase();
    if (s === 'VERIFIED') {
      return (
        <span
          className="badge badge-green"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 6,
          }}
          id="profile-verification-badge"
        >
          <CheckCircle2 size={13} />
          Verified Business
        </span>
      );
    }
    if (s === 'PENDING') {
      return (
        <span
          className="badge badge-amber"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 6,
          }}
          id="profile-verification-badge"
        >
          <Clock size={13} />
          Verification Pending
        </span>
      );
    }
    return (
      <span
        className="badge badge-red"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 10px',
          fontSize: 12,
          fontWeight: 600,
          borderRadius: 6,
        }}
        id="profile-verification-badge"
      >
        <AlertCircle size={13} />
        Verification Required
      </span>
    );
  };

  if (loading && !profile) {
    return (
      <div style={{ maxWidth: 900, margin: '24px auto', padding: 24, textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading profile information...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', paddingBottom: 40 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Account Profile & Security
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Manage verified company credentials, primary dispatch contacts, and security credentials.
          </p>
        </div>
      </div>

      {/* 1. TOP IDENTITY BANNER */}
      <div
        className="card"
        style={{
          marginTop: 8,
          marginBottom: 24,
          padding: '24px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.04) 0%, rgba(255, 255, 255, 1) 100%)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
              color: '#ffffff',
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 8px 16px rgba(37, 99, 235, 0.18)',
            }}
          >
            {initials}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: 0,
                  letterSpacing: '-0.01em',
                }}
                id="profile-display-company"
              >
                {profile?.companyName || displayName}
              </h2>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginTop: 6,
                fontSize: 13,
                color: 'var(--text-secondary, #64748b)',
                flexWrap: 'wrap',
              }}
            >
              <span>{profile?.businessType || 'Commercial B2B Account'}</span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={13} style={{ opacity: 0.7 }} />
                Member since {formatDate(profile?.createdAt)}
              </span>
              {profile?.businessAddress && (
                <>
                  <span>•</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={13} style={{ opacity: 0.7 }} />
                    {profile.businessAddress.split(',').slice(-2).join(', ').trim() || 'Verified Location'}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <button
          className="btn btn-outline btn-sm"
          onClick={handleOpenEditModal}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontWeight: 600 }}
          id="btn-edit-profile"
        >
          <Edit3 size={14} /> Edit Profile
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* 2. BUSINESS INFORMATION CARD (With embedded verification status) */}
        <div className="card" style={{ borderRadius: 12, border: '1px solid var(--border)' }}>
          <div
            className="card-header"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 24px',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Building2 size={18} style={{ color: 'var(--primary)' }} />
              <h3 className="card-title" style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                Business Information
              </h3>
            </div>
            {renderVerificationBadge(profile?.verificationStatus)}
          </div>

          <div className="card-body" style={{ padding: 24 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '20px 24px',
              }}
            >
              <div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>
                  Company Legal Entity
                </p>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {profile?.companyName || 'Not Set'}
                </p>
              </div>

              <div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>
                  Business Entity Type
                </p>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {profile?.businessType || 'Not Set'}
                </p>
              </div>

              <div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>
                  Registration Number (CIN / UEN)
                </p>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                  {profile?.registrationNumber || 'Not Set'}
                </p>
              </div>

              <div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>
                  GSTIN / Tax Identification
                </p>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                  {profile?.gstin || 'Not Set'}
                </p>
              </div>

              <div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>
                  Official Business Email
                </p>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {profile?.businessEmail || 'Not Set'}
                </p>
              </div>

              <div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>
                  Official Business Phone
                </p>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {profile?.businessPhone || 'Not Set'}
                </p>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>
                  Registered Business Address
                </p>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {profile?.businessAddress || 'Not Set'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. PRIMARY ACCOUNT CONTACT CARD */}
        <div className="card" style={{ borderRadius: 12, border: '1px solid var(--border)' }}>
          <div
            className="card-header"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 24px',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <UserCheck size={18} style={{ color: 'var(--primary)' }} />
              <h3 className="card-title" style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                Primary Account Contact
              </h3>
            </div>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleOpenContactModal}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 12, padding: '6px 14px' }}
              id="btn-edit-contact"
            >
              <Edit3 size={13} /> Edit Contact
            </button>
          </div>

          <div className="card-body" style={{ padding: 24 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '20px 24px',
              }}
            >
              <div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>
                  Primary Contact Person
                </p>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {profile?.fullName || displayName}
                </p>
              </div>

              <div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>
                  Account Login Email
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    {profile?.email}
                  </p>
                  <span title="Primary login email" style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <Lock size={12} style={{ color: 'var(--text-muted)' }} />
                  </span>
                </div>
              </div>

              <div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>
                  Contact Mobile Number
                </p>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {profile?.phone || 'Not Set'}
                </p>
              </div>

              <div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>
                  Portal Role & Permissions
                </p>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: 'rgba(37, 99, 235, 0.08)',
                    color: 'var(--primary)',
                    display: 'inline-block',
                  }}
                >
                  {profile?.role === 'CUSTOMER' ? 'Customer Portal (Full Access)' : profile?.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. SECURITY & AUTHENTICATION CARD */}
        <div className="card" style={{ borderRadius: 12, border: '1px solid var(--border)' }}>
          <div
            className="card-header"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 24px',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <KeyRound size={18} style={{ color: 'var(--primary)' }} />
              <h3 className="card-title" style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                Security & Authentication
              </h3>
            </div>
          </div>

          <div className="card-body" style={{ padding: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Password row */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: 16,
                  borderBottom: '1px solid var(--border-light, #f1f5f9)',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                    Account Password
                  </h4>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>
                    {profile?.lastPasswordChange
                      ? `Last changed on ${formatDate(profile.lastPasswordChange)}`
                      : 'Default security credentials in use'}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    setPasswordError(null);
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setIsPasswordModalOpen(true);
                  }}
                  id="btn-open-password-modal"
                >
                  <KeyRound size={14} /> Change Password
                </button>
              </div>

              {/* Two-Factor row */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                    Two-Factor Authentication (2FA)
                  </h4>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>
                    Add an extra layer of security when accessing your B2B logistics dashboard
                  </p>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: 6,
                    background: profile?.twoFactorEnabled ? 'rgba(5, 150, 105, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                    color: profile?.twoFactorEnabled ? '#059669' : '#64748b',
                  }}
                >
                  {profile?.twoFactorEnabled ? 'Enabled' : 'Disabled (Optional)'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. RECENT ACCOUNT ACTIVITY CARD */}
        <div className="card" style={{ borderRadius: 12, border: '1px solid var(--border)' }}>
          <div
            className="card-header"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 24px',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Clock size={18} style={{ color: 'var(--primary)' }} />
              <h3 className="card-title" style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                Recent Account Milestones
              </h3>
            </div>
          </div>

          <div className="card-body" style={{ padding: 24 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 16,
              }}
            >
              <div
                style={{
                  padding: 16,
                  borderRadius: 8,
                  background: 'var(--page-bg, #f8fafc)',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)' }}>
                  <Package size={16} />
                  <span style={{ fontSize: 12, fontWeight: 600 }}>Total Orders</span>
                </div>
                <p style={{ fontSize: 22, fontWeight: 700, margin: '8px 0 0', color: 'var(--text-primary)' }}>
                  {profile?.totalOrders ?? 0}
                </p>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Confirmed bookings</span>
              </div>

              <div
                style={{
                  padding: 16,
                  borderRadius: 8,
                  background: 'var(--page-bg, #f8fafc)',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#059669' }}>
                  <Truck size={16} />
                  <span style={{ fontSize: 12, fontWeight: 600 }}>Active Shipments</span>
                </div>
                <p style={{ fontSize: 22, fontWeight: 700, margin: '8px 0 0', color: 'var(--text-primary)' }}>
                  {profile?.activeShipments ?? 0}
                </p>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>In-transit telemetry</span>
              </div>

              <div
                style={{
                  padding: 16,
                  borderRadius: 8,
                  background: 'var(--page-bg, #f8fafc)',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6366f1' }}>
                  <Calendar size={16} />
                  <span style={{ fontSize: 12, fontWeight: 600 }}>Account Created</span>
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, margin: '12px 0 0', color: 'var(--text-primary)' }}>
                  {formatDate(profile?.createdAt)}
                </p>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>PrimeRoute Commercial</span>
              </div>

              <div
                style={{
                  padding: 16,
                  borderRadius: 8,
                  background: 'var(--page-bg, #f8fafc)',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#d97706' }}>
                  <ShieldCheck size={16} />
                  <span style={{ fontSize: 12, fontWeight: 600 }}>Compliance Status</span>
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, margin: '12px 0 0', color: 'var(--text-primary)' }}>
                  {profile?.verificationStatus === 'VERIFIED' ? 'Full B2B Verified' : 'Standard Compliance'}
                </p>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>KYC & GST Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* EDIT PROFILE MODAL */}
      {/* ========================================================= */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Business Profile"
        size="lg"
      >
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label form-label-required">Contact Person Full Name</label>
              <input
                type="text"
                className={`form-input ${editErrors.fullName ? 'error' : ''}`}
                value={editForm.fullName}
                onChange={(e) => {
                  setEditForm({ ...editForm, fullName: e.target.value });
                  if (editErrors.fullName) setEditErrors((prev) => ({ ...prev, fullName: '' }));
                }}
                placeholder="e.g. John Doe"
              />
              {editErrors.fullName && <p className="form-error" style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{editErrors.fullName}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Contact Personal Phone</label>
              <input
                type="text"
                className={`form-input ${editErrors.phone ? 'error' : ''}`}
                value={editForm.phone || ''}
                onChange={(e) => {
                  setEditForm({ ...editForm, phone: e.target.value });
                  if (editErrors.phone) setEditErrors((prev) => ({ ...prev, phone: '' }));
                }}
                placeholder="e.g. +91 98765 43210"
              />
              {editErrors.phone && <p className="form-error" style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{editErrors.phone}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Company Legal Name</label>
              <input
                type="text"
                className="form-input"
                value={editForm.companyName || ''}
                onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                placeholder="e.g. Apex Logistics Solutions Ltd."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Business Entity Type</label>
              <select
                className="form-input"
                value={editForm.businessType || 'Private Limited'}
                onChange={(e) => setEditForm({ ...editForm, businessType: e.target.value })}
              >
                <option value="Private Limited">Private Limited Company (Pvt Ltd)</option>
                <option value="Public Limited">Public Limited Company (Ltd)</option>
                <option value="Partnership">Partnership Firm</option>
                <option value="Sole Proprietorship">Sole Proprietorship</option>
                <option value="Limited Liability Partnership">Limited Liability Partnership (LLP)</option>
                <option value="Enterprise / MNC">Enterprise / Multinational</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Official Business Email</label>
              <input
                type="email"
                className={`form-input ${editErrors.businessEmail ? 'error' : ''}`}
                value={editForm.businessEmail || ''}
                onChange={(e) => {
                  setEditForm({ ...editForm, businessEmail: e.target.value });
                  if (editErrors.businessEmail) setEditErrors((prev) => ({ ...prev, businessEmail: '' }));
                }}
                placeholder="e.g. corporate@company.com"
              />
              {editErrors.businessEmail && <p className="form-error" style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{editErrors.businessEmail}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Official Business Phone</label>
              <input
                type="text"
                className={`form-input ${editErrors.businessPhone ? 'error' : ''}`}
                value={editForm.businessPhone || ''}
                onChange={(e) => {
                  setEditForm({ ...editForm, businessPhone: e.target.value });
                  if (editErrors.businessPhone) setEditErrors((prev) => ({ ...prev, businessPhone: '' }));
                }}
                placeholder="e.g. +91 98765 43210"
              />
              {editErrors.businessPhone && <p className="form-error" style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{editErrors.businessPhone}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Registration Number (CIN / UEN)</label>
              <input
                type="text"
                className="form-input"
                value={editForm.registrationNumber || ''}
                onChange={(e) => setEditForm({ ...editForm, registrationNumber: e.target.value })}
                placeholder="e.g. U63090MH2021PTC362145"
              />
            </div>

            <div className="form-group">
              <label className="form-label">GSTIN / Tax ID</label>
              <input
                type="text"
                className="form-input"
                value={editForm.gstin || ''}
                onChange={(e) => setEditForm({ ...editForm, gstin: e.target.value })}
                placeholder="e.g. 27AABCA1234F1Z8"
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Registered Business Address</label>
              <textarea
                className="form-input"
                rows={3}
                value={editForm.businessAddress || ''}
                onChange={(e) => setEditForm({ ...editForm, businessAddress: e.target.value })}
                placeholder="Enter complete registered office / headquarters address"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsEditModalOpen(false)}
              disabled={updatingProfile}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={updatingProfile}>
              {updatingProfile ? 'Saving Changes...' : 'Save Profile Details'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* EDIT PRIMARY ACCOUNT CONTACT MODAL */}
      {/* ========================================================= */}
      <Modal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        title="Edit Primary Account Contact"
        size="md"
      >
        <form onSubmit={handleSaveContact} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label form-label-required">Primary Contact Full Name</label>
            <input
              type="text"
              className={`form-input ${contactErrors.fullName ? 'error' : ''}`}
              value={contactForm.fullName}
              onChange={(e) => {
                setContactForm({ ...contactForm, fullName: e.target.value });
                if (contactErrors.fullName) setContactErrors((prev) => ({ ...prev, fullName: '' }));
              }}
              placeholder="e.g. Shrutisanjana Sahoo"
            />
            {contactErrors.fullName && <p className="form-error" style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{contactErrors.fullName}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Contact Mobile Number</label>
            <input
              type="text"
              className={`form-input ${contactErrors.phone ? 'error' : ''}`}
              value={contactForm.phone}
              onChange={(e) => {
                setContactForm({ ...contactForm, phone: e.target.value });
                if (contactErrors.phone) setContactErrors((prev) => ({ ...prev, phone: '' }));
              }}
              placeholder="e.g. +91 98765 43210"
            />
            {contactErrors.phone && <p className="form-error" style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{contactErrors.phone}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Account Login Email</label>
            <input
              type="email"
              className="form-input"
              disabled
              value={profile?.email || ''}
              style={{ backgroundColor: 'var(--page-bg, #f8fafc)', opacity: 0.8, cursor: 'not-allowed' }}
            />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
              Account login email is permanent and cannot be modified here.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsContactModalOpen(false)}
              disabled={updatingContact}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={updatingContact}>
              {updatingContact ? 'Saving Changes...' : 'Save Contact'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* CHANGE PASSWORD MODAL */}
      {/* ========================================================= */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Change Account Password"
        size="sm"
      >
        <form onSubmit={handleChangePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {passwordError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 8,
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#dc2626',
                fontSize: 13,
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{passwordError}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label form-label-required">Current Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                className="form-input"
                required
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                placeholder="Enter your current password"
                style={{ paddingRight: 38 }}
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
                  color: 'var(--text-muted)',
                }}
              >
                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label form-label-required">New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showNewPassword ? 'text' : 'password'}
                className="form-input"
                required
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="Minimum 6 characters"
                style={{ paddingRight: 38 }}
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
                  color: 'var(--text-muted)',
                }}
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label form-label-required">Confirm New Password</label>
            <input
              type="password"
              className="form-input"
              required
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              placeholder="Re-enter your new password"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsPasswordModalOpen(false)}
              disabled={updatingPassword}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={updatingPassword}>
              {updatingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
