import React from 'react';

interface LogisticsPageVisualProps {
  imageSrc: string;
  alt: string;
  badge?: string;
  title?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
}

export default function LogisticsPageVisual({
  imageSrc,
  alt,
  badge,
  title,
  width = 270,
  height = 98,
  className = '',
}: LogisticsPageVisualProps) {
  return (
    <div
      className={`logistics-page-visual ${className}`}
      style={{
        position: 'relative',
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid var(--border, #e2e8f0)',
        boxShadow: '0 2px 10px rgba(15, 23, 42, 0.07)',
        background: '#0f172a',
        flexShrink: 0,
      }}
    >
      <img
        src={imageSrc}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          transition: 'transform 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.04)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      />

      {/* Subtle enterprise overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.12) 0%, rgba(15, 23, 42, 0.65) 100%)',
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '8px 12px',
        }}
      >
        {badge && (
          <div style={{ alignSelf: 'flex-start' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: 'rgba(15, 23, 42, 0.72)',
                backdropFilter: 'blur(6px)',
                color: '#93c5fd',
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: '0.02em',
                padding: '3px 8px',
                borderRadius: 20,
                border: '1px solid rgba(147, 197, 253, 0.25)',
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  backgroundColor: '#38bdf8',
                  boxShadow: '0 0 6px #38bdf8',
                }}
              />
              {badge}
            </span>
          </div>
        )}

        {title && (
          <div style={{ alignSelf: 'flex-start' }}>
            <span
              style={{
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 700,
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.6)',
                letterSpacing: '-0.01em',
              }}
            >
              {title}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
