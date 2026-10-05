import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { authService } from '../services/authService';
import forgotPasswordBg from '../assets/forgot_password_bg.jpg';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage('');
    setError('');

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const result = await authService.forgotPassword(trimmedEmail);

      if (result.success) {
        setMessage(result.message || 'Password reset link sent');
        setEmail('');
      } else {
        setError(
          result.error ||
          "We couldn't send the password reset email right now. Please try again."
        );
      }
    } catch {
      setError(
        "We couldn't send the password reset email right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F3F7FC',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        color: '#0f172a',
      }}
    >
      {/* ── 1. Fullscreen Illustrated Logistics Landscape Background ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${forgotPasswordBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          backgroundRepeat: 'no-repeat',
          zIndex: 0,
        }}
      />

      {/* ── 2. Soft Ambient Radial Light Overlay for Center Focus & Card Elevation ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 50%, rgba(255, 255, 255, 0.75) 0%, rgba(243, 247, 252, 0.4) 65%, rgba(243, 247, 252, 0.1) 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* ── 3. Header Bar ── */}
      <header
        style={{
          padding: '24px 44px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          zIndex: 10,
          maxWidth: '1440px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* PrimeRoute Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#1D4ED8',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '17px',
              letterSpacing: '0.02em',
              boxShadow: '0 4px 14px rgba(29, 78, 216, 0.3)',
            }}
          >
            PR
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: '20px',
                fontWeight: 800,
                color: '#0F172A',
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
              }}
            >
              PrimeRoute
            </span>
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: 700,
                color: '#1D4ED8',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
              }}
            >
              LOGISTICS
            </span>
          </div>
        </Link>

        {/* Back to Home Button */}
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#1D4ED8',
            color: '#ffffff',
            padding: '10px 22px',
            borderRadius: '12px',
            fontSize: '13.5px',
            fontWeight: 600,
            textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(29, 78, 216, 0.3)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1e40af';
            e.currentTarget.style.boxShadow = '0 6px 18px rgba(29, 78, 216, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#1D4ED8';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(29, 78, 216, 0.3)';
          }}
        >
          <ArrowLeft size={16} strokeWidth={2.4} />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* ── 4. Main Authentication Container ── */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px 16px 40px',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div
          style={{
            background: '#ffffff',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            borderRadius: '24px',
            boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.10), 0 2px 8px rgba(15, 23, 42, 0.04)',
            width: '100%',
            maxWidth: '480px',
            padding: '42px 38px',
            color: '#0f172a',
            boxSizing: 'border-box',
          }}
        >
          {/* Branded Icon + Recovery Badge + Heading */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: '26px',
            }}
          >
            {/* Branded Icon Container (Blue to Teal Gradient) */}
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #1E6BFF 0%, #00BFA5 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 10px 24px rgba(30, 107, 255, 0.28)',
              }}
            >
              <Mail size={26} strokeWidth={2.2} />
            </div>

            {/* Recovery Badge */}
            <div
              style={{
                display: 'inline-block',
                background: '#EBF3FE',
                border: '1px solid #D0E1FD',
                borderRadius: '8px',
                padding: '5px 14px',
                fontSize: '11px',
                fontWeight: 800,
                color: '#1D4ED8',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '14px',
              }}
            >
              ADMINISTRATOR PASSWORD RECOVERY
            </div>

            <h1
              style={{
                fontSize: '26px',
                fontWeight: 800,
                color: '#0F172A',
                margin: '0 0 8px',
                letterSpacing: '-0.02em',
              }}
            >
              Forgot Password?
            </h1>

            <p
              style={{
                fontSize: '14px',
                color: '#64748B',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {message
                ? 'We have sent password reset instructions to your email.'
                : 'Enter your administrator email address.'}
            </p>
          </div>

          {/* ── SUCCESS STATE ── */}
          {message ? (
            <div>
              <div
                style={{
                  textAlign: 'center',
                  padding: '10px 0 20px',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 18px',
                  }}
                >
                  <CheckCircle size={32} />
                </div>

                <h2
                  style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#0F172A',
                    margin: '0 0 10px',
                  }}
                >
                  Password reset link sent
                </h2>

                <p
                  style={{
                    color: '#64748B',
                    fontSize: '14px',
                    lineHeight: 1.6,
                    margin: '0 auto 24px',
                    maxWidth: '380px',
                  }}
                >
                  Please check your inbox and spam folder for instructions to reset your password.
                  <br /><br />
                  <span style={{ fontSize: '13px', color: '#94A3B8' }}>
                    Didn't receive the email? Check your spam folder or try again.
                  </span>
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link
                  to="/signin/admin"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '13px',
                    borderRadius: '12px',
                    background: 'linear-gradient(90deg, #1E6BFF 0%, #00BFA5 100%)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '14.5px',
                    textDecoration: 'none',
                    boxSizing: 'border-box',
                    boxShadow: '0 6px 18px rgba(30, 107, 255, 0.28)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>Return to Admin Sign In</span>
                  <ArrowRight size={16} />
                </Link>

                <Link
                  to="/signin/customer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    background: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    color: '#334155',
                    fontWeight: 600,
                    fontSize: '14px',
                    textDecoration: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Return to Customer Sign In
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* ── Error Message ── */}
              {error && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    marginBottom: '20px',
                    color: '#991B1B',
                    fontSize: '13px',
                    lineHeight: 1.4,
                  }}
                >
                  <AlertCircle
                    size={17}
                    style={{
                      flexShrink: 0,
                      marginTop: '1px',
                      color: '#DC2626',
                    }}
                  />
                  <div>{error}</div>
                </div>
              )}

              {/* ── Form ── */}
              <form
                onSubmit={handleSubmit}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                }}
              >
                <div>
                  <label
                    htmlFor="forgot-password-email"
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#0F172A',
                      marginBottom: '8px',
                    }}
                  >
                    Email Address
                  </label>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      background: '#FFFFFF',
                      border: isInputFocused ? '1px solid #1E6BFF' : '1px solid #CBD5E1',
                      boxShadow: isInputFocused
                        ? '0 0 0 3px rgba(30, 107, 255, 0.15)'
                        : '0 1px 2px rgba(15, 23, 42, 0.04)',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Mail
                      size={18}
                      color={isInputFocused ? '#1E6BFF' : '#94A3B8'}
                      style={{ flexShrink: 0, transition: 'color 0.15s ease' }}
                    />

                    <input
                      id="forgot-password-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) {
                          setError('');
                        }
                      }}
                      onFocus={() => setIsInputFocused(true)}
                      onBlur={() => setIsInputFocused(false)}
                      placeholder="Enter your administrator email address"
                      disabled={loading}
                      autoComplete="email"
                      style={{
                        border: 'none',
                        background: 'transparent',
                        outline: 'none',
                        fontSize: '14px',
                        width: '100%',
                        color: '#0F172A',
                        fontWeight: 500,
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '14px',
                    fontSize: '15px',
                    fontWeight: 700,
                    marginTop: '4px',
                    color: '#FFFFFF',
                    background: loading
                      ? '#94A3B8'
                      : 'linear-gradient(90deg, #1E6BFF 0%, #00BFA5 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: loading
                      ? 'none'
                      : '0 8px 22px rgba(30, 107, 255, 0.32)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.boxShadow = '0 10px 26px rgba(30, 107, 255, 0.42)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.boxShadow = '0 8px 22px rgba(30, 107, 255, 0.32)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <ArrowRight size={18} strokeWidth={2.4} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}