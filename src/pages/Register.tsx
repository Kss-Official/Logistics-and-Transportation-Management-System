import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User, Building, Mail, Phone, Lock, Eye, EyeOff,
  CheckCircle2, ArrowRight, ArrowLeft, AlertCircle, Package, Truck, Warehouse
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  validateFullName,
  validateRequired,
  validateEmail,
  validateIndianPhone,
  validatePassword,
} from '../utils/validation';
import registerBgImg from '../assets/register_intermodal_bg.jpg';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  // Form fields
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Field-level inline validation state
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateSingleField(field);
  };

  const validateSingleField = (field: string) => {
    const errs = { ...fieldErrors };
    if (field === 'fullName') {
      const res = validateFullName(fullName, 'Full Name');
      if (!res.isValid) errs.fullName = res.error!;
      else delete errs.fullName;
    }
    if (field === 'companyName') {
      const res = validateRequired(companyName, 'Company Name');
      if (!res.isValid) errs.companyName = res.error!;
      else delete errs.companyName;
    }
    if (field === 'email') {
      const res = validateEmail(email);
      if (!res.isValid) errs.email = res.error!;
      else delete errs.email;
    }
    if (field === 'phone') {
      const res = validateIndianPhone(phone);
      if (!res.isValid) errs.phone = res.error!;
      else delete errs.phone;
    }
    if (field === 'password') {
      const res = validatePassword(password);
      if (!res.isValid) errs.password = res.error!;
      else delete errs.password;
    }
    if (field === 'confirmPassword') {
      if (!confirmPassword) {
        errs.confirmPassword = 'Confirm Password is required.';
      } else if (password !== confirmPassword) {
        errs.confirmPassword = 'Password and Confirm Password must match.';
      } else {
        delete errs.confirmPassword;
      }
    }
    setFieldErrors(errs);
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    const nameRes = validateFullName(fullName, 'Full Name');
    if (!nameRes.isValid) errs.fullName = nameRes.error!;

    const compRes = validateRequired(companyName, 'Company Name');
    if (!compRes.isValid) errs.companyName = compRes.error!;

    const emailRes = validateEmail(email);
    if (!emailRes.isValid) errs.email = emailRes.error!;

    const phoneRes = validateIndianPhone(phone);
    if (!phoneRes.isValid) errs.phone = phoneRes.error!;

    const passRes = validatePassword(password);
    if (!passRes.isValid) errs.password = passRes.error!;

    if (!confirmPassword) {
      errs.confirmPassword = 'Confirm Password is required.';
    } else if (password !== confirmPassword) {
      errs.confirmPassword = 'Password and Confirm Password must match.';
    }

    if (!agreeTerms) {
      errs.agreeTerms = 'You must agree to the Terms and Privacy Policy.';
    }

    setFieldErrors(errs);
    setTouched({
      fullName: true,
      companyName: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
      agreeTerms: true,
    });

    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const res = await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        companyName: companyName.trim(),
        phone: phone.trim(),
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Registration failed. Please try again.');
        setIsLoading(false);
        return;
      }

      // Success
      setIsSuccess(true);
    } catch (err) {
      console.error('Registration error:', err);
      setErrorMessage('An unexpected error occurred during account creation.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="pr-register-page"
      style={{
        minHeight: '100vh',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* ── Wide Photorealistic Background Image ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${registerBgImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          zIndex: 0,
        }}
      />

      {/* ── Soft Ambiance Gradient Overlay for High Contrast & Text Legibility ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, rgba(240, 246, 255, 0.96) 0%, rgba(240, 246, 255, 0.90) 36%, rgba(240, 246, 255, 0.40) 62%, rgba(240, 246, 255, 0.05) 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* ── Bottom-Left Curved Blue Wave Swoosh ── */}
      <svg
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '38vw',
          minWidth: '380px',
          maxWidth: '540px',
          height: 'auto',
          pointerEvents: 'none',
          zIndex: 2,
        }}
        viewBox="0 0 520 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 60 Q 160 170, 520 200 L 520 200 L 0 200 Z"
          fill="url(#blueWaveGrad)"
        />
        <defs>
          <linearGradient id="blueWaveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
        </defs>
      </svg>

      {/* ── Bottom-Left Global Logistics Partner Badge ── */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '36px',
          display: 'flex',
          alignItems: 'center',
          gap: '9px',
          zIndex: 5,
          pointerEvents: 'none',
        }}
      >
        <span style={{ width: 6, height: 6, backgroundColor: '#FFFFFF', borderRadius: 1 }} />
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.18em',
            color: 'rgba(255, 255, 255, 0.95)',
            textTransform: 'uppercase',
          }}
        >
          GLOBAL LOGISTICS PARTNER
        </span>
      </div>

      {/* ── Top Header Navigation Bar ── */}
      <header
        style={{
          padding: '24px 44px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          zIndex: 10,
          width: '100%',
          boxSizing: 'border-box',
          flexShrink: 0,
        }}
      >
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div className="pr-logo-mark">
            PR
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
              PrimeRoute
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#2563EB', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              LOGISTICS
            </span>
          </div>
        </Link>

        {/* Back to Home Button (Pill button with royal blue text and soft shadow) */}
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: '#FFFFFF',
            border: '1px solid rgba(219, 234, 254, 0.8)',
            borderRadius: 9999,
            padding: '9px 20px',
            fontSize: 13,
            fontWeight: 600,
            color: '#1D4ED8',
            textDecoration: 'none',
            boxShadow: '0 3px 12px rgba(15, 23, 42, 0.06)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#EFF6FF';
            e.currentTarget.style.borderColor = '#BFDBFE';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#FFFFFF';
            e.currentTarget.style.borderColor = 'rgba(219, 234, 254, 0.8)';
          }}
        >
          <ArrowLeft size={15} strokeWidth={2.4} />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* ── Main Content: Two Columns (Left Hero Text + Right Floating Card) ── */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 44px 28px',
          position: 'relative',
          zIndex: 10,
          width: '100%',
          boxSizing: 'border-box',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 1fr) minmax(360px, 520px)',
            gap: '40px',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            maxWidth: '1240px',
            margin: 'auto',
          }}
        >
          {/* ── LEFT HERO: Move Businesses Forward + 3 Feature Mini Cards ── */}
          <div style={{ maxWidth: '520px' }}>
            <h1
              style={{
                fontSize: 'clamp(36px, 4vw, 56px)',
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: '-0.03em',
                lineHeight: 1.08,
                margin: '0 0 16px',
              }}
            >
              Move<br />
              Businesses<br />
              <span style={{ color: '#2563EB' }}>Forward</span>
            </h1>

            <p
              style={{
                fontSize: '16px',
                color: '#475569',
                fontWeight: 500,
                lineHeight: 1.45,
                margin: '0 0 28px',
                maxWidth: '420px',
              }}
            >
              Smarter logistics for a connected world.
            </p>

            {/* 3 Benefit Feature Cards in a row */}
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              {/* Pickup */}
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: 14,
                  padding: '14px 18px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: 80,
                  transition: 'transform 0.15s ease',
                }}
              >
                <div style={{ color: '#2563EB', marginBottom: 6 }}>
                  <Truck size={22} strokeWidth={2.2} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#1E293B' }}>Pickup</span>
              </div>

              {/* Warehousing */}
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: 14,
                  padding: '14px 18px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: 80,
                  transition: 'transform 0.15s ease',
                }}
              >
                <div style={{ color: '#2563EB', marginBottom: 6 }}>
                  <Warehouse size={22} strokeWidth={2.2} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#1E293B' }}>Warehousing</span>
              </div>

              {/* Delivery */}
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: 14,
                  padding: '14px 18px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: 80,
                  transition: 'transform 0.15s ease',
                }}
              >
                <div style={{ color: '#2563EB', marginBottom: 6 }}>
                  <Package size={22} strokeWidth={2.2} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#1E293B' }}>Delivery</span>
              </div>
            </div>
          </div>

          {/* ── RIGHT HERO: Clean Floating White Registration Card ── */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 24,
              boxShadow: '0 25px 60px -12px rgba(15, 23, 42, 0.14), 0 4px 16px rgba(15, 23, 42, 0.04)',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              padding: '34px 38px',
              width: '100%',
              maxWidth: '520px',
              boxSizing: 'border-box',
            }}
          >
            {isSuccess ? (
              /* Success confirmation state */
              <div style={{ textAlign: 'center', padding: '24px 8px' }}>
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: '#ECFDF5',
                    color: '#10B981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 18px',
                    boxShadow: '0 8px 20px rgba(16, 185, 129, 0.2)',
                  }}
                >
                  <CheckCircle2 size={34} />
                </div>

                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>
                  Account Created Successfully!
                </h2>

                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.5, margin: '0 auto 24px', maxWidth: '360px' }}>
                  Your PrimeRoute customer account is ready. You can now sign in to start booking shipments.
                </p>

                <button
                  type="button"
                  onClick={() => navigate('/signin/customer')}
                  style={{
                    width: '100%',
                    padding: '13px 20px',
                    borderRadius: 10,
                    border: 'none',
                    background: '#1E60F2',
                    color: '#FFFFFF',
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 4px 14px rgba(30, 96, 242, 0.35)',
                  }}
                >
                  <span>Continue to Sign In</span>
                  <ArrowRight size={17} strokeWidth={2.4} />
                </button>
              </div>
            ) : (
              /* Active Form */
              <>
                <div style={{ textAlign: 'center', marginBottom: 22 }}>
                  <h2
                    style={{
                      fontSize: 26,
                      fontWeight: 800,
                      color: '#0F172A',
                      margin: '0 0 6px',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Create Account
                  </h2>
                  <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>
                    Get started with PrimeRoute
                  </p>
                </div>

                {/* General error message banner */}
                {errorMessage && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      borderRadius: 10,
                      padding: '10px 12px',
                      marginBottom: 14,
                      color: '#991B1B',
                      fontSize: 12.5,
                      lineHeight: 1.35,
                    }}
                  >
                    <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1, color: '#DC2626' }} />
                    <div style={{ flex: 1 }}>{errorMessage}</div>
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* Full Name */}
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        background: '#F8FAFC',
                        border: touched.fullName && fieldErrors.fullName ? '1px solid #EF4444' : '1px solid #E2E8F0',
                        borderRadius: 10,
                        padding: '11px 14px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <User size={18} color={touched.fullName && fieldErrors.fullName ? '#EF4444' : '#94A3B8'} />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (fieldErrors.fullName) {
                            setFieldErrors((prev) => {
                              const copy = { ...prev };
                              delete copy.fullName;
                              return copy;
                            });
                          }
                        }}
                        onBlur={() => handleBlur('fullName')}
                        placeholder="Full Name"
                        style={{
                          border: 'none',
                          background: 'transparent',
                          outline: 'none',
                          fontSize: 14,
                          width: '100%',
                          color: '#0F172A',
                        }}
                      />
                    </div>
                    {touched.fullName && fieldErrors.fullName && (
                      <span style={{ color: '#EF4444', fontSize: 11, marginTop: 2, display: 'block', paddingLeft: 4 }}>
                        {fieldErrors.fullName}
                      </span>
                    )}
                  </div>

                  {/* Company Name */}
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        background: '#F8FAFC',
                        border: touched.companyName && fieldErrors.companyName ? '1px solid #EF4444' : '1px solid #E2E8F0',
                        borderRadius: 10,
                        padding: '11px 14px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Building size={18} color={touched.companyName && fieldErrors.companyName ? '#EF4444' : '#94A3B8'} />
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => {
                          setCompanyName(e.target.value);
                          if (fieldErrors.companyName) {
                            setFieldErrors((prev) => {
                              const copy = { ...prev };
                              delete copy.companyName;
                              return copy;
                            });
                          }
                        }}
                        onBlur={() => handleBlur('companyName')}
                        placeholder="Company Name"
                        style={{
                          border: 'none',
                          background: 'transparent',
                          outline: 'none',
                          fontSize: 14,
                          width: '100%',
                          color: '#0F172A',
                        }}
                      />
                    </div>
                    {touched.companyName && fieldErrors.companyName && (
                      <span style={{ color: '#EF4444', fontSize: 11, marginTop: 2, display: 'block', paddingLeft: 4 }}>
                        {fieldErrors.companyName}
                      </span>
                    )}
                  </div>

                  {/* Email & Phone 2-Column Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {/* Email */}
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          background: '#F8FAFC',
                          border: touched.email && fieldErrors.email ? '1px solid #EF4444' : '1px solid #E2E8F0',
                          borderRadius: 10,
                          padding: '11px 14px',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Mail size={18} color={touched.email && fieldErrors.email ? '#EF4444' : '#94A3B8'} />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (fieldErrors.email) {
                              setFieldErrors((prev) => {
                                const copy = { ...prev };
                                delete copy.email;
                                return copy;
                              });
                            }
                          }}
                          onBlur={() => handleBlur('email')}
                          placeholder="Email Address"
                          style={{
                            border: 'none',
                            background: 'transparent',
                            outline: 'none',
                            fontSize: 14,
                            width: '100%',
                            color: '#0F172A',
                          }}
                        />
                      </div>
                      {touched.email && fieldErrors.email && (
                        <span style={{ color: '#EF4444', fontSize: 11, marginTop: 2, display: 'block', paddingLeft: 4 }}>
                          {fieldErrors.email}
                        </span>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          background: '#F8FAFC',
                          border: touched.phone && fieldErrors.phone ? '1px solid #EF4444' : '1px solid #E2E8F0',
                          borderRadius: 10,
                          padding: '11px 14px',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Phone size={18} color={touched.phone && fieldErrors.phone ? '#EF4444' : '#94A3B8'} />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            if (fieldErrors.phone) {
                              setFieldErrors((prev) => {
                                const copy = { ...prev };
                                delete copy.phone;
                                return copy;
                              });
                            }
                          }}
                          onBlur={() => handleBlur('phone')}
                          placeholder="Phone Number"
                          style={{
                            border: 'none',
                            background: 'transparent',
                            outline: 'none',
                            fontSize: 14,
                            width: '100%',
                            color: '#0F172A',
                          }}
                        />
                      </div>
                      {touched.phone && fieldErrors.phone && (
                        <span style={{ color: '#EF4444', fontSize: 11, marginTop: 2, display: 'block', paddingLeft: 4 }}>
                          {fieldErrors.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Password & Confirm Password 2-Column Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {/* Password */}
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          background: '#F8FAFC',
                          border: touched.password && fieldErrors.password ? '1px solid #EF4444' : '1px solid #E2E8F0',
                          borderRadius: 10,
                          padding: '11px 12px',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Lock size={18} color={touched.password && fieldErrors.password ? '#EF4444' : '#94A3B8'} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (fieldErrors.password) {
                              setFieldErrors((prev) => {
                                const copy = { ...prev };
                                delete copy.password;
                                return copy;
                              });
                            }
                          }}
                          onBlur={() => handleBlur('password')}
                          placeholder="Password"
                          style={{
                            border: 'none',
                            background: 'transparent',
                            outline: 'none',
                            fontSize: 14,
                            width: '100%',
                            color: '#0F172A',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0, display: 'flex', alignItems: 'center' }}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {touched.password && fieldErrors.password && (
                        <span style={{ color: '#EF4444', fontSize: 11, marginTop: 2, display: 'block', paddingLeft: 4 }}>
                          {fieldErrors.password}
                        </span>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          background: '#F8FAFC',
                          border: touched.confirmPassword && fieldErrors.confirmPassword ? '1px solid #EF4444' : '1px solid #E2E8F0',
                          borderRadius: 10,
                          padding: '11px 12px',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Lock size={18} color={touched.confirmPassword && fieldErrors.confirmPassword ? '#EF4444' : '#94A3B8'} />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (fieldErrors.confirmPassword) {
                              setFieldErrors((prev) => {
                                const copy = { ...prev };
                                delete copy.confirmPassword;
                                return copy;
                              });
                            }
                          }}
                          onBlur={() => handleBlur('confirmPassword')}
                          placeholder="Confirm Password"
                          style={{
                            border: 'none',
                            background: 'transparent',
                            outline: 'none',
                            fontSize: 14,
                            width: '100%',
                            color: '#0F172A',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          tabIndex={-1}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0, display: 'flex', alignItems: 'center' }}
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {touched.confirmPassword && fieldErrors.confirmPassword && (
                        <span style={{ color: '#EF4444', fontSize: 11, marginTop: 2, display: 'block', paddingLeft: 4 }}>
                          {fieldErrors.confirmPassword}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Terms & Privacy Checkbox */}
                  <div style={{ marginTop: 2 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: '#475569', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => {
                          setAgreeTerms(e.target.checked);
                          if (fieldErrors.agreeTerms) {
                            setFieldErrors((prev) => {
                              const copy = { ...prev };
                              delete copy.agreeTerms;
                              return copy;
                            });
                          }
                        }}
                        style={{ accentColor: '#1E60F2', width: 16, height: 16, borderRadius: 4, cursor: 'pointer' }}
                      />
                      <span>
                        I agree to the{' '}
                        <span style={{ color: '#1E60F2', fontWeight: 600 }}>Terms & Privacy Policy</span>
                      </span>
                    </label>
                    {touched.agreeTerms && fieldErrors.agreeTerms && (
                      <span style={{ color: '#EF4444', fontSize: 11, marginTop: 2, display: 'block', paddingLeft: 4 }}>
                        {fieldErrors.agreeTerms}
                      </span>
                    )}
                  </div>

                  {/* Primary Submit Button: Create Account -> */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      padding: '13px 24px',
                      borderRadius: 10,
                      border: 'none',
                      background: '#1E60F2',
                      color: '#FFFFFF',
                      fontSize: 15,
                      fontWeight: 600,
                      marginTop: 6,
                      opacity: isLoading ? 0.75 : 1,
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      boxShadow: '0 4px 14px rgba(30, 96, 242, 0.32)',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) e.currentTarget.style.backgroundColor = '#1950cf';
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) e.currentTarget.style.backgroundColor = '#1E60F2';
                    }}
                    id="btn-create-account"
                  >
                    <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
                    <ArrowRight size={17} strokeWidth={2.4} />
                  </button>
                </form>

                {/* Footer Link: Already have an account? Sign In */}
                <div
                  style={{
                    marginTop: 20,
                    textAlign: 'center',
                    fontSize: 13.5,
                    color: '#64748B',
                  }}
                >
                  <span>Already have an account? </span>
                  <Link
                    to="/signin/customer"
                    style={{
                      color: '#1E60F2',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                    onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                  >
                    Sign In
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
