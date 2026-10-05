import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Mail, Lock, Eye, EyeOff,
  ArrowRight, Navigation, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PortalLoginLayout from '../../components/auth/PortalLoginLayout';
import hero3dTruck from '../../assets/hero_3d_truck.jpg';

export default function SignInDriver() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState(() => (location.state as { email?: string })?.email || '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [redirectAction, setRedirectAction] = useState<{ label: string; onClick: () => void } | null>(null);

  useEffect(() => {
    const state = location.state as { errorMessage?: string; email?: string } | null;
    if (state?.errorMessage) {
      setErrorMessage(state.errorMessage);
    }
    if (state?.email) {
      setEmail(state.email);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setRedirectAction(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMessage('Please enter your driver work email or Driver ID.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(cleanEmail, password, rememberMe);

      if (!result.success || !result.user) {
        setErrorMessage(result.error || 'Invalid email or password.');
        setIsLoading(false);
        return;
      }

      if (result.user.role !== 'DRIVER') {
        const roleName =
          result.user.role === 'ADMIN'
            ? 'Admin'
            : result.user.role === 'CUSTOMER'
            ? 'Customer'
            : result.user.role === 'WAREHOUSE_MANAGER'
            ? 'Warehouse'
            : 'Designated';

        const roleRoute =
          result.user.role === 'ADMIN'
            ? '/signin/admin'
            : result.user.role === 'CUSTOMER'
            ? '/signin/customer'
            : result.user.role === 'WAREHOUSE_MANAGER'
            ? '/signin/warehouse'
            : '/signin/driver';

        setErrorMessage(
          `This account belongs to the ${roleName} Portal. Please use the ${roleName} Portal login.`
        );
        setRedirectAction({
          label: `Go to ${roleName} Sign In →`,
          onClick: () => navigate(roleRoute, { state: { email: cleanEmail } }),
        });
        setIsLoading(false);
        return;
      }

      navigate('/driver/dashboard');
    } catch {
      setErrorMessage('Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const visualFeatures = [
    {
      icon: <Navigation size={16} />,
      title: 'Smart Waypoints',
      subtitle: 'Turn-by-turn routing with geofenced delivery alerts',
      color: '#60a5fa',
    },
    {
      icon: <ShieldCheck size={16} />,
      title: 'Verified Hand-Off',
      subtitle: 'Instant digital proof-of-delivery & timestamp signoffs',
      color: '#34d399',
    },
  ];

  return (
    <PortalLoginLayout
      portal="driver"
      title="Driver Console Login"
      description="Enter your credentials to access active routes, schedules, and manifests."
      visualImage={hero3dTruck}
      visualBadge="PrimeRoute Driver Network"
      visualHeadline="Intelligent Navigation & Cargo Tracking"
      visualDescription="Access assigned line-hauls, update waypoint delivery logs, verify cargo handoffs with digital POD signatures, and communicate with dispatchers."
      visualFeatures={visualFeatures}
      errorMessage={errorMessage}
      redirectAction={redirectAction}
    >
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        {/* Email Field */}
        <div style={{ marginBottom: 12 }}>
          <label
            htmlFor="driver-email"
            style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              color: '#334155',
              marginBottom: 5,
            }}
          >
            Driver Work Email or ID
          </label>
          <div style={{ position: 'relative', width: '100%', height: 46 }}>
            <Mail
              size={18}
              style={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                pointerEvents: 'none',
              }}
            />
            <input
              id="driver-email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="driver@primeroute.com or Driver ID"
              autoComplete="username"
              disabled={isLoading}
              style={{
                width: '100%',
                height: 46,
                padding: '0 16px 0 46px',
                borderRadius: 9,
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#2563EB';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.15)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.04)';
              }}
            />
          </div>
        </div>

        {/* Password Field */}
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 5,
            }}
          >
            <label
              htmlFor="driver-password"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#334155',
                margin: 0,
              }}
            >
              Password
            </label>
            <Link
              to="/forgot-password"
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: '#2563eb',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              Forgot Password?
            </Link>
          </div>

          <div style={{ position: 'relative', width: '100%', height: 46 }}>
            <Lock
              size={18}
              style={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                pointerEvents: 'none',
              }}
            />
            <input
              id="driver-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="current-password"
              disabled={isLoading}
              style={{
                width: '100%',
                height: 46,
                padding: '0 46px 0 46px',
                borderRadius: 9,
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#2563eb';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.15)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.04)';
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <input
            id="driver-remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            style={{
              width: 16,
              height: 16,
              accentColor: '#2563eb',
              cursor: 'pointer',
              borderRadius: 4,
            }}
          />
          <label
            htmlFor="driver-remember-me"
            style={{
              fontSize: 13,
              color: '#475569',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            Keep me signed in on this console
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            height: 46,
            borderRadius: 9,
            border: 'none',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: '#ffffff',
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '0.01em',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.75 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 18px rgba(37, 99, 235, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(37, 99, 235, 0.3)';
          }}
        >
          {isLoading ? (
            <>
              <span
                style={{
                  width: 18,
                  height: 18,
                  border: '2px solid #ffffff',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <span>Enter Driver Console</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>
    </PortalLoginLayout>
  );
}
