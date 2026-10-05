import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Package,
  Clock,
  Download,
  CheckCircle2,
  Navigation,
  MapPin,
  Truck,
  History,
  Bell,
  User,
  HelpCircle,
  LogOut,
  X,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { driverPortalService } from '../../services/driverPortalService';
import { notificationService } from '../../services/notificationService';
import type { DriverProfileData } from '../../types/driverPortal';

export interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'MAIN',
    items: [
      { label: 'Dashboard', to: '/driver/dashboard', icon: <Home size={19} /> },
      { label: 'My Deliveries', to: '/driver/deliveries', icon: <Package size={19} /> },
      { label: 'Current Delivery', to: '/driver/current-delivery', icon: <Clock size={19} /> },
    ],
  },
  {
    title: 'TRACKING',
    items: [
      { label: 'Route', to: '/driver/route', icon: <Navigation size={19} /> },
      { label: 'Live Location', to: '/driver/live-location', icon: <MapPin size={19} /> },
    ],
  },
  {
    title: 'VEHICLE',
    items: [
      { label: 'My Vehicle', to: '/driver/vehicle', icon: <Truck size={19} /> },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      { label: 'Delivery History', to: '/driver/history', icon: <History size={19} /> },
      { label: 'Notifications', to: '/driver/notifications', icon: <Bell size={19} /> },
      { label: 'Driver Profile', to: '/driver/profile', icon: <User size={19} /> },
      { label: 'Help & Support', to: '/driver/support', icon: <HelpCircle size={19} /> },
    ],
  },
];

interface DriverSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  profile?: DriverProfileData | null;
}

export default function DriverSidebar({ isOpen, onClose, profile: profileProp }: DriverSidebarProps) {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [internalProfile, setInternalProfile] = useState<DriverProfileData | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = () => {
      driverPortalService.getProfile().then(data => {
        if (isMounted) setInternalProfile(data);
      }).catch(() => {});
    };
    fetchProfile();

    const fetchUnread = () => {
      notificationService.getUnreadCount('DRIVER').then((c) => {
        if (isMounted) setUnreadCount(c);
      }).catch(() => {});
    };
    fetchUnread();

    window.addEventListener('storage', fetchProfile);
    window.addEventListener('driver-status-changed', fetchProfile);
    window.addEventListener('driver-notifications:updated', fetchUnread);
    window.addEventListener('notifications:updated', fetchUnread);

    const interval = setInterval(fetchUnread, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('storage', fetchProfile);
      window.removeEventListener('driver-status-changed', fetchProfile);
      window.removeEventListener('driver-notifications:updated', fetchUnread);
      window.removeEventListener('notifications:updated', fetchUnread);
    };
  }, [location.pathname]);

  const profile = profileProp ?? internalProfile;

  const handleLogout = () => {
    onClose?.();
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    logout('/signin');
  };

  const isItemActive = (to: string) => {
    if (to === '/driver/dashboard') {
      return location.pathname === '/driver' || location.pathname === '/driver/dashboard';
    }
    if (to === '/driver/vehicle') {
      return location.pathname === '/driver/vehicle' || location.pathname === '/driver/vehicle-inspection';
    }
    return location.pathname === to || location.pathname.startsWith(`${to}/`);
  };

  const driverName = profile?.name || profile?.fullName || 'Driver';
  const driverId = profile?.driverId || 'Not available';
  const driverStatus = profile?.status || 'AVAILABLE';

  return (
    <aside
      className={`sidebar driver-sidebar ${isOpen ? 'open' : ''}`}
      id="driver-sidebar"
      style={{
        width: 280,
        height: '100vh',
        position: 'relative',
        backgroundColor: '#EAF4FF', // Light Blue
        borderRight: '1px solid #BFDBFE',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        overflow: 'hidden',
        boxSizing: 'border-box',
        transition: 'transform 0.25s ease',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* ── 1. Top Brand Header ── */}
      <div
        style={{
          padding: '20px 18px',
          borderBottom: '1px solid #BFDBFE',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'transparent',
          flexShrink: 0,
        }}
      >
        <Link
          to="/driver/dashboard"
          onClick={onClose}
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}
          title="PrimeRoute Driver Portal"
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 3px 10px rgba(37, 99, 235, 0.28)',
              flexShrink: 0,
            }}
          >
            <Truck size={22} color="#ffffff" />
          </div>
          <div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              PrimeRoute
            </div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#64748B',
                letterSpacing: '0.01em',
                marginTop: 2,
              }}
            >
              Driver Portal
            </div>
          </div>
        </Link>

        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 6,
              display: 'none',
            }}
            className="driver-sidebar-close-btn"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* ── 2. Navigation Sections ── */}
      <nav
        className="sidebar-nav"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} style={{ marginBottom: 6 }}>
            <p
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#475569',
                padding: '4px 12px',
                margin: '4px 0 6px 0',
              }}
            >
              {section.title}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {section.items.map((item) => {
                const active = isItemActive(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 12px',
                      borderRadius: 8,
                      fontSize: '13.5px',
                      fontWeight: active ? 600 : 500,
                      color: active ? '#2563EB' : '#334155',
                      backgroundColor: active ? '#DBEAFE' : 'transparent',
                      textDecoration: 'none',
                      transition: 'all 0.15s ease',
                      overflow: 'hidden',
                      margin: '1px 0',
                    }}
                    className={`driver-nav-item ${active ? 'active' : ''}`}
                  >
                    {/* Active Left Indicator Accent Bar */}
                    {active && (
                      <span
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: 3.5,
                          backgroundColor: '#2563EB',
                          borderRadius: '3px 0 0 3px',
                        }}
                      />
                    )}
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: active ? '#2563EB' : '#64748b',
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </span>
                    <span style={{ fontSize: '13.5px', flex: 1 }}>{item.label}</span>
                    {item.to === '/driver/notifications' && unreadCount > 0 && (
                      <span
                        style={{
                          backgroundColor: '#2563EB',
                          color: '#ffffff',
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: 10,
                          marginLeft: 'auto',
                        }}
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── 3. Bottom Driver Profile Card & Logout ── */}
      <div
        className="sidebar-bottom"
        style={{
          position: 'relative',
          marginTop: 'auto',
          padding: 14,
          borderTop: '1px solid #BFDBFE',
          background: 'transparent',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {/* Driver Profile Card */}
        <div
          onClick={() => {
            onClose?.();
            navigate('/driver/profile');
          }}
          style={{
            position: 'relative',
            zIndex: 2,
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            padding: '10px 14px',
            border: '1px solid #BFDBFE',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
            transition: 'background 0.15s ease',
          }}
        >
          {/* Top Row: Duty Status Dot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: driverStatus === 'OFF_DUTY' ? '#94A3B8' : driverStatus === 'ON_TRIP' ? '#2563EB' : '#10B981',
                display: 'inline-block',
              }}
            />
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                color: driverStatus === 'OFF_DUTY' ? '#64748B' : '#1D4ED8',
                textTransform: 'uppercase',
              }}
            >
              {driverStatus.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Middle Row: Driver Name & Chevron */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontSize: '13.5px',
                fontWeight: 700,
                color: '#0F172A',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {driverName}
            </span>
            <ChevronRight size={16} color="#475569" />
          </div>

          {/* Bottom Row: Driver ID */}
          <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: 2, fontWeight: 500 }}>
            Driver ID: {driverId}
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          id="driver-logout-btn"
          title="Sign out of Driver Console"
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 14px',
            borderRadius: 10,
            color: '#EF4444',
            backgroundColor: '#FFFFFF',
            border: '1px solid #BFDBFE',
            width: '100%',
            cursor: 'pointer',
            fontSize: '13.5px',
            fontWeight: 600,
            transition: 'all 0.15s ease',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          }}
          className="driver-logout-btn"
        >
          <LogOut size={18} color="#EF4444" />
          <span>Logout</span>
        </button>

        {/* Delivery Truck Watermark Art at Bottom Right */}
        <svg
          width="150"
          height="100"
          viewBox="0 0 160 110"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: 'absolute',
            right: -10,
            bottom: -5,
            pointerEvents: 'none',
            zIndex: 0,
            opacity: 0.35,
          }}
        >
          <rect x="50" y="20" width="105" height="60" rx="6" fill="#93C5FD" />
          <path d="M50 35H30L15 60V80H50V35Z" fill="#BFDBFE" />
          <rect x="25" y="42" width="18" height="16" rx="2" fill="#DBEAFE" />
          <circle cx="42" cy="84" r="14" fill="#93C5FD" />
          <circle cx="42" cy="84" r="6" fill="#EFF6FF" />
          <circle cx="125" cy="84" r="14" fill="#93C5FD" />
          <circle cx="125" cy="84" r="6" fill="#EFF6FF" />
        </svg>
      </div>
    </aside>
  );
}
