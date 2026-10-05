import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Package,
  Warehouse,
  Truck,
  Shield,
  AlertCircle,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';

export type PortalType = 'customer' | 'warehouse' | 'driver' | 'admin';

export interface VisualFeature {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color?: string;
}

export interface PortalLoginLayoutProps {
  portal: PortalType;
  title: string;
  description: string;
  visualImage: string;
  visualBadge: string;
  visualHeadline: string;
  visualDescription: string;
  visualFeatures: VisualFeature[];
  errorMessage?: string | null;
  successMessage?: string | null;
  onAdminRedirect?: () => void;
  redirectAction?: { label: string; onClick: () => void } | null;
  extraFooter?: React.ReactNode;
  children: React.ReactNode;
}

const PORTALS = [
  {
    key: 'customer',
    label: 'Customer',
    route: '/signin/customer',
    color: '#F97316',
    shadow: 'rgba(249, 115, 22, 0.25)',
    icon: Package,
  },
  {
    key: 'warehouse',
    label: 'Warehouse',
    route: '/signin/warehouse',
    color: '#10B981',
    shadow: 'rgba(16, 185, 129, 0.25)',
    icon: Warehouse,
  },
  {
    key: 'driver',
    label: 'Driver',
    route: '/signin/driver',
    color: '#2563EB',
    shadow: 'rgba(37, 99, 235, 0.25)',
    icon: Truck,
  },
  {
    key: 'admin',
    label: 'Admin',
    route: '/signin/admin',
    color: '#6D3DF5',
    shadow: 'rgba(109, 61, 245, 0.25)',
    icon: Shield,
  },
] as const;

export default function PortalLoginLayout({
  portal,
  title,
  description,
  visualImage,
  visualBadge,
  visualHeadline,
  visualDescription,
  visualFeatures,
  errorMessage,
  successMessage,
  onAdminRedirect,
  redirectAction,
  extraFooter,
  children,
}: PortalLoginLayoutProps) {
  const navigate = useNavigate();

  // Define the footer links based on current portal
  const renderFooterPortalLinks = () => {
    switch (portal) {
      case 'customer':
        return (
          <>
            <span>
              Operations?{' '}
              <Link to="/signin/admin" style={{ color: '#6D3DF5', fontWeight: 700, textDecoration: 'none' }}>
                Admin Login
              </Link>
            </span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span>
              Terminal hub?{' '}
              <Link to="/signin/warehouse" style={{ color: '#10B981', fontWeight: 700, textDecoration: 'none' }}>
                Warehouse Login
              </Link>
            </span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span>
              Fleet driver?{' '}
              <Link to="/signin/driver" style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none' }}>
                Driver Login
              </Link>
            </span>
          </>
        );
      case 'warehouse':
        return (
          <>
            <span>
              Shipping client?{' '}
              <Link to="/signin/customer" style={{ color: '#F97316', fontWeight: 700, textDecoration: 'none' }}>
                Customer Login
              </Link>
            </span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span>
              Fleet driver?{' '}
              <Link to="/signin/driver" style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none' }}>
                Driver Login
              </Link>
            </span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span>
              Operations?{' '}
              <Link to="/signin/admin" style={{ color: '#6D3DF5', fontWeight: 700, textDecoration: 'none' }}>
                Admin Login
              </Link>
            </span>
          </>
        );
      case 'driver':
        return (
          <>
            <span>
              Shipping client?{' '}
              <Link to="/signin/customer" style={{ color: '#F97316', fontWeight: 700, textDecoration: 'none' }}>
                Customer Login
              </Link>
            </span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span>
              Terminal hub?{' '}
              <Link to="/signin/warehouse" style={{ color: '#10B981', fontWeight: 700, textDecoration: 'none' }}>
                Warehouse Login
              </Link>
            </span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span>
              Operations?{' '}
              <Link to="/signin/admin" style={{ color: '#6D3DF5', fontWeight: 700, textDecoration: 'none' }}>
                Admin Login
              </Link>
            </span>
          </>
        );
      case 'admin':
        return (
          <>
            <span>
              Client shipping?{' '}
              <Link to="/signin/customer" style={{ color: '#F97316', fontWeight: 700, textDecoration: 'none' }}>
                Customer Login
              </Link>
            </span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span>
              Fleet driver?{' '}
              <Link to="/signin/driver" style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none' }}>
                Driver Login
              </Link>
            </span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span>
              Terminal hub?{' '}
              <Link to="/signin/warehouse" style={{ color: '#10B981', fontWeight: 700, textDecoration: 'none' }}>
                Warehouse Login
              </Link>
            </span>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="portal-signin-page"
      style={{
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'stretch',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* ── LEFT SIDE: Logistics Visual Split ── */}
      <div
        className="login-visual-panel"
        style={{
          flex: '1 1 50%',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '32px 36px',
          overflow: 'hidden',
          background: `linear-gradient(180deg, rgba(15, 23, 42, 0.4) 0%, rgba(15, 23, 42, 0.75) 100%), url(${visualImage}) center/cover no-repeat`,
        }}
      >
        {/* Decorative glow */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '10%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, transparent 70%)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
          }}
        />

        {/* Top Branding */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
              }}
            >
              <Package size={20} strokeWidth={2.4} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                PrimeRoute
              </div>
              <div style={{ fontSize: 11, fontWeight: 500, color: '#94a3b8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Logistics OS
              </div>
            </div>
          </div>
        </div>

        {/* Center Visual Content */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 520, margin: 'auto 0' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 20,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: '#10b981',
                boxShadow: '0 0 8px #10b981',
              }}
            />
            {visualBadge}
          </div>

          <h1
            style={{
              fontSize: 34,
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              margin: '0 0 14px',
            }}
          >
            {visualHeadline}
          </h1>

          <p
            style={{
              fontSize: 15,
              color: '#cbd5e1',
              lineHeight: 1.6,
              margin: 0,
              fontWeight: 400,
            }}
          >
            {visualDescription}
          </p>

          {/* Value highlights */}
          {visualFeatures.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 16,
                marginTop: 32,
              }}
            >
              {visualFeatures.map((feat, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(15, 23, 42, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 12,
                    padding: '14px 16px',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      color: feat.color || '#fb923c',
                      marginBottom: 4,
                    }}
                  >
                    {feat.icon}
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
                      {feat.title}
                    </span>
                  </div>
                  <span style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.4, display: 'block' }}>
                    {feat.subtitle}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Tagline */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
            © {new Date().getFullYear()} PrimeRoute Logistics Systems Inc. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── RIGHT SIDE: Standardized Login Card Column ── */}
      <div
        className="portal-signin-right-col"
        style={{
          flex: '1 1 50%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f8fafc',
          position: 'relative',
        }}
      >
        {/* Top bar with Back to Home button */}
        <div className="portal-top-bar">
          <Link
            to="/"
            className="pr-btn-back-home"
          >
            <ArrowLeft size={15} strokeWidth={2.4} /> Back to Home
          </Link>
        </div>

        {/* Scrollable / Centered card container */}
        <div className="portal-card-scroll-wrap">
          <div
            className="portal-signin-card"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 16,
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02)',
              boxSizing: 'border-box',
            }}
          >
          {/* 1. Portal Selector: Standardized 42px height across all pages */}
          <div
            className="portal-selector-container"
            style={{
              width: '100%',
              height: 42,
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              padding: 3,
              gap: 4,
              backgroundColor: '#f1f5f9',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              marginBottom: 14,
              boxSizing: 'border-box',
              alignItems: 'stretch',
            }}
          >
            {PORTALS.map((tab) => {
              const isActive = tab.key === portal;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => !isActive && navigate(tab.route)}
                  style={{
                    height: '100%',
                    borderRadius: 6,
                    border: 'none',
                    backgroundColor: isActive ? tab.color : 'transparent',
                    color: isActive ? '#ffffff' : '#64748b',
                    fontSize: 12.5,
                    fontWeight: isActive ? 700 : 600,
                    cursor: isActive ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    boxShadow: isActive ? `0 2px 6px ${tab.shadow}` : 'none',
                    transition: 'all 0.15s ease',
                    padding: '0 4px',
                    boxSizing: 'border-box',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#0f172a';
                      e.currentTarget.style.backgroundColor = '#e2e8f0';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#64748b';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* 2. Heading Area: Standardized typography & spacing */}
          <div style={{ marginBottom: 14 }}>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 700,
                lineHeight: 1.2,
                color: '#0f172a',
                letterSpacing: '-0.02em',
                margin: '0 0 4px',
              }}
            >
              {title}
            </h2>
            <p
              style={{
                fontSize: 13.5,
                lineHeight: 1.4,
                color: '#64748b',
                margin: 0,
              }}
            >
              {description}
            </p>
          </div>

          {/* 3. Error Alert (if any) */}
          {errorMessage && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                padding: '12px 16px',
                borderRadius: 10,
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: 13,
                marginBottom: 20,
                lineHeight: 1.45,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <AlertCircle size={17} style={{ flexShrink: 0, marginTop: 2, color: '#dc2626' }} />
                <div style={{ flex: 1 }}>{errorMessage}</div>
              </div>
              {redirectAction ? (
                <button
                  type="button"
                  onClick={redirectAction.onClick}
                  style={{
                    alignSelf: 'flex-start',
                    background: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: 4,
                  }}
                >
                  {redirectAction.label}
                </button>
              ) : onAdminRedirect && errorMessage.includes('Admin Portal') ? (
                <button
                  type="button"
                  onClick={onAdminRedirect}
                  style={{
                    alignSelf: 'flex-start',
                    background: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: 4,
                  }}
                >
                  Go to Admin Sign In →
                </button>
              ) : null}
            </div>
          )}

          {/* Success Alert (if any) */}
          {successMessage && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderRadius: 10,
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#047857',
                fontSize: 13,
                marginBottom: 20,
                lineHeight: 1.45,
              }}
            >
              <CheckCircle2 size={17} style={{ flexShrink: 0, color: '#059669' }} />
              <div style={{ flex: 1 }}>{successMessage}</div>
            </div>
          )}

          {/* 4. Form Content (Passed as children) */}
          {children}

          {/* 5. Footer Area: Standardized links & typography */}
          <div
            style={{
              marginTop: 12,
              paddingTop: 10,
              borderTop: '1px solid #f1f5f9',
              textAlign: 'center',
            }}
          >
            {extraFooter && <div style={{ marginBottom: 6 }}>{extraFooter}</div>}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                fontSize: 12,
                color: '#64748b',
                flexWrap: 'wrap',
                lineHeight: 1.4,
              }}
            >
              {renderFooterPortalLinks()}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
