import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ShieldCheck, ArrowRight, ArrowLeft, Lock, Mail,
  Eye, EyeOff, AlertCircle, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Form fields start EMPTY as required
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Status & Feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


  // Read any error messages passed in router state
  useEffect(() => {
    const state = location.state as { errorMessage?: string; from?: { pathname?: string } } | null;
    if (state?.errorMessage) {
      setErrorMessage(state.errorMessage);
    }
  }, [location.state]);

  const validateForm = (): boolean => {
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address format.');
      return false;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(email, password, rememberMe);

      if (!result.success || !result.user) {
        setErrorMessage(result.error || 'Invalid email or password.');
        setIsLoading(false);
        return;
      }

      // Role-based redirection:
      // ADMIN -> /admin/dashboard
      // WAREHOUSE_MANAGER -> /warehouse/dashboard
      // DRIVER -> /driver/dashboard
      // CUSTOMER -> /customer/dashboard
      const targetDashboard =
        result.user.role === 'ADMIN'
          ? '/admin/dashboard'
          : result.user.role === 'WAREHOUSE_MANAGER'
          ? '/warehouse/dashboard'
          : result.user.role === 'DRIVER'
          ? '/driver/dashboard'
          : '/customer/dashboard';
      const fromPath = (location.state as { from?: { pathname?: string } })?.from?.pathname;
      const rolePrefix =
        result.user.role === 'ADMIN'
          ? '/admin'
          : result.user.role === 'WAREHOUSE_MANAGER'
          ? '/warehouse'
          : result.user.role === 'DRIVER'
          ? '/driver'
          : '/customer';
      const destination =
        fromPath && fromPath.startsWith(rolePrefix)
          ? fromPath
          : targetDashboard;

      navigate(destination, { replace: true });
    } catch (err) {
      console.error('Sign in error:', err);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0b1220',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Ambient background glow */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(37, 99, 235, 0.25) 0%, transparent 70%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
        }}
      ></div>

      {/* Top Navigation Bar */}
      <header
        style={{
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          zIndex: 10,
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <Link to="/" className="pr-brand">
          <div className="pr-logo-mark">
            <span>PR</span>
          </div>
          <div className="pr-brand-text">
            <span className="pr-brand-name">PrimeRoute</span>
            <span className="pr-brand-tagline">Logistics</span>
          </div>
        </Link>

        <Link
          to="/"
          className="pr-btn-back-home"
        >
          <ArrowLeft size={15} strokeWidth={2.4} />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Sign In Form Container */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            boxShadow: '0 25px 60px -15px rgba(0,0,0,0.5)',
            width: '100%',
            maxWidth: '480px',
            padding: '40px 36px',
            color: '#0f172a',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)',
              }}
            >
              <ShieldCheck size={26} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
              Sign In to PrimeRoute
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
              Access your dedicated logistics workspace.
            </p>
          </div>

          {/* Inline Error Message */}
          {errorMessage && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '12px 14px',
                marginBottom: '20px',
                color: '#991b1b',
                fontSize: '13px',
                lineHeight: 1.4,
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px', color: '#dc2626' }} />
              <div style={{ flex: 1 }}>{errorMessage}</div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#991b1b',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Email Address */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '6px',
                }}
              >
                Email Address
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  transition: 'border-color 0.15s ease',
                }}
              >
                <Mail size={16} color="#94a3b8" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Enter your email address"
                  required
                  disabled={isLoading}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '14px',
                    width: '100%',
                    color: '#0f172a',
                    fontWeight: 500,
                  }}
                  id="signin-email-input"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '6px',
                }}
              >
                Password
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  transition: 'border-color 0.15s ease',
                }}
              >
                <Lock size={16} color="#94a3b8" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '14px',
                    width: '100%',
                    color: '#0f172a',
                    fontWeight: 500,
                  }}
                  id="signin-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '13px',
              }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#475569' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  style={{ accentColor: '#2563eb' }}
                />
                <span>Remember me</span>
              </label>

              <Link
                to="/forgot-password"
                style={{
                  color: '#2563eb',
                  fontWeight: 600,
                  fontSize: '13px',
                  textDecoration: 'none',
                }}
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="pr-btn-primary"
              style={{
                width: '100%',
                padding: '13px',
                fontSize: '15px',
                fontWeight: 700,
                marginTop: '6px',
                opacity: isLoading ? 0.75 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
              id="btn-signin-submit"
            >
              <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Create Account Section - Navigates directly to /register */}
          <div
            style={{
              marginTop: '28px',
              paddingTop: '20px',
              borderTop: '1px solid #e2e8f0',
              textAlign: 'center',
              fontSize: '13.5px',
              color: '#64748b',
            }}
          >
            <span>Don't have an account? </span>
            <Link
              to="/register"
              style={{
                color: '#2563eb',
                fontWeight: 700,
                textDecoration: 'none',
                fontSize: '13.5px',
              }}
              id="link-create-account"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>


    </div>
  );
}
