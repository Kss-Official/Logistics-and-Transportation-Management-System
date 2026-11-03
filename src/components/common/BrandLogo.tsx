import React from 'react';
import { Link } from 'react-router-dom';

export interface BrandLogoProps {
  /** Size variant for the logo badge and text */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** 'dark' for dark text on light backgrounds, 'light' for white text on dark backgrounds */
  variant?: 'dark' | 'light';
  /** Whether to wrap the logo in a React Router <Link to="/"> */
  asLink?: boolean;
  /** Custom destination path if asLink is true */
  to?: string;
  /** Whether to display the "LOGISTICS" subtitle */
  showSubtitle?: boolean;
  /** Optional extra CSS className */
  className?: string;
  /** Optional inline styles for container */
  style?: React.CSSProperties;
}

const sizeConfig = {
  sm: {
    badgeSize: 32,
    badgeRadius: 7,
    badgeFontSize: 17,
    titleFontSize: 20,
    subtitleFontSize: 8,
    gap: 8,
    letterSpacing: '0.2em',
  },
  md: {
    badgeSize: 40,
    badgeRadius: 9,
    badgeFontSize: 22,
    titleFontSize: 26,
    subtitleFontSize: 9.5,
    gap: 11,
    letterSpacing: '0.22em',
  },
  lg: {
    badgeSize: 46,
    badgeRadius: 11,
    badgeFontSize: 26,
    titleFontSize: 30,
    subtitleFontSize: 11,
    gap: 13,
    letterSpacing: '0.24em',
  },
  xl: {
    badgeSize: 56,
    badgeRadius: 14,
    badgeFontSize: 32,
    titleFontSize: 38,
    subtitleFontSize: 13,
    gap: 16,
    letterSpacing: '0.26em',
  },
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  variant = 'dark',
  asLink = true,
  to = '/',
  showSubtitle = true,
  className = '',
  style = {},
}) => {
  const cfg = sizeConfig[size];
  const isLight = variant === 'light';

  const titleColor = isLight ? '#FFFFFF' : '#070B14';
  const subtitleColor = isLight ? '#38BDF8' : '#0284C7';

  const logoContent = (
    <div
      className={`primeroute-brand-logo ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${cfg.gap}px`,
        textDecoration: 'none',
        userSelect: 'none',
        ...style,
      }}
    >
      {/* ── 1. ICON BADGE: Rounded rectangle with blue gradient and bold condensed "PR" ── */}
      <div
        style={{
          width: `${cfg.badgeSize}px`,
          height: `${cfg.badgeSize}px`,
          borderRadius: `${cfg.badgeRadius}px`,
          background: 'linear-gradient(135deg, #0284c7 0%, #1d4ed8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          fontFamily: "'Bebas Neue', 'Plus Jakarta Sans', sans-serif",
          fontSize: `${cfg.badgeFontSize}px`,
          lineHeight: 1,
          letterSpacing: '0.04em',
          fontWeight: 700,
          boxShadow: isLight
            ? '0 4px 16px rgba(2, 132, 199, 0.45)'
            : '0 4px 14px rgba(2, 132, 199, 0.32)',
          flexShrink: 0,
        }}
      >
        PR
      </div>

      {/* ── 2. BRAND TYPOGRAPHY: Tall condensed "PRIMEROUTE" + Spaced "LOGISTICS" ── */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <span
          style={{
            fontFamily: "'Bebas Neue', 'Plus Jakarta Sans', sans-serif",
            fontSize: `${cfg.titleFontSize}px`,
            lineHeight: 0.95,
            letterSpacing: '0.04em',
            color: titleColor,
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          PRIMEROUTE
        </span>
        {showSubtitle && (
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              fontSize: `${cfg.subtitleFontSize}px`,
              fontWeight: 800,
              letterSpacing: cfg.letterSpacing,
              color: subtitleColor,
              textTransform: 'uppercase',
              lineHeight: 1,
              marginTop: '3px',
            }}
          >
            LOGISTICS
          </span>
        )}
      </div>
    </div>
  );

  if (asLink) {
    return (
      <Link to={to} style={{ textDecoration: 'none', display: 'inline-flex' }}>
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};

export default BrandLogo;
