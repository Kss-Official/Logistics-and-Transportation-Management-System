import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Truck, Package, Users, FileText,
  Warehouse, MapPin, BarChart2, LifeBuoy, Settings, LogOut,
  Route, LayoutGrid, Home, PlusCircle, User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  portal: 'admin' | 'customer';
  onClose?: () => void;
  userName?: string;
  userRole?: string;
  userInitials?: string;
}

interface NavSection {
  sectionTitle?: string;
  items: NavItem[];
}

const ADMIN_SECTIONS: NavSection[] = [
  {
    sectionTitle: 'COMMAND CENTER',
    items: [
      { label: 'Dashboard', to: '/admin/dashboard', icon: <Home size={18} /> },
    ],
  },
  {
    sectionTitle: 'OPERATIONS',
    items: [
      { label: 'Orders', to: '/admin/orders', icon: <Package size={18} /> },
      { label: 'Shipments', to: '/admin/shipments', icon: <Truck size={18} /> },
    ],
  },
  {
    sectionTitle: 'NETWORK & FLEET',
    items: [
      { label: 'Warehouses', to: '/admin/warehouses', icon: <Warehouse size={18} /> },
      { label: 'Drivers', to: '/admin/drivers', icon: <User size={18} /> },
      { label: 'Vehicles', to: '/admin/vehicles', icon: <Truck size={18} /> },
      { label: 'Routes', to: '/admin/routes', icon: <Route size={18} /> },
    ],
  },
  {
    sectionTitle: 'CUSTOMERS',
    items: [
      { label: 'Customers', to: '/admin/customers', icon: <Users size={18} /> },
    ],
  },
  {
    sectionTitle: 'FINANCE',
    items: [
      { label: 'Invoices', to: '/admin/invoices', icon: <FileText size={18} /> },
    ],
  },
  {
    sectionTitle: 'ANALYTICS',
    items: [
      { label: 'Reports', to: '/admin/reports', icon: <BarChart2 size={18} /> },
    ],
  },
  {
    sectionTitle: 'COMMUNICATION',
    items: [
      { label: 'Support', to: '/admin/support', icon: <LifeBuoy size={18} /> },
    ],
  },
  {
    sectionTitle: 'SYSTEM',
    items: [
      { label: 'Settings', to: '/admin/settings', icon: <Settings size={18} /> },
    ],
  },
];

const CUSTOMER_NAV: NavItem[] = [
  { label: 'Dashboard',      to: '/customer/dashboard',     icon: <Home size={18} /> },
  { label: 'My Orders',      to: '/customer/orders',        icon: <Package size={18} /> },
  { label: 'Create Order',   to: '/customer/orders/create', icon: <PlusCircle size={18} /> },
  { label: 'Track Shipment', to: '/customer/track',         icon: <MapPin size={18} /> },
  { label: 'My Shipments',   to: '/customer/shipments',     icon: <Truck size={18} /> },
  { label: 'Invoices',       to: '/customer/invoices',      icon: <FileText size={18} /> },
  { label: 'Addresses',      to: '/customer/addresses',     icon: <MapPin size={18} /> },
  { label: 'Support',        to: '/customer/support',       icon: <LifeBuoy size={18} /> },
  { label: 'Profile',        to: '/customer/profile',       icon: <User size={18} /> },
];

export default function Sidebar({ portal, onClose }: SidebarProps) {
  const { logout } = useAuth();
  const location = useLocation();
  const isAdmin = portal === 'admin';

  const handleLogout = () => {
    onClose?.();
    logout();
  };

  const isItemActive = (itemTo: string) => {
    const currentPath = location.pathname;

    if (itemTo === '/customer/dashboard' || itemTo === '/admin/dashboard') {
      return currentPath === itemTo;
    }

    if (itemTo === '/customer/orders/create') {
      return currentPath === '/customer/orders/create';
    }

    if (itemTo === '/customer/orders') {
      return currentPath === '/customer/orders' || (currentPath.startsWith('/customer/orders/') && !currentPath.startsWith('/customer/orders/create'));
    }

    return currentPath === itemTo || currentPath.startsWith(itemTo + '/');
  };

  // Portal Theme Specs
  const theme = isAdmin
    ? {
        bg: '#F3EEFF', // Light Lavender
        border: '#E4D8FC',
        primary: '#6D3DF5', // Purple
        activeBg: '#EBE4FF',
        activeText: '#6D3DF5',
        subtitle: 'Command Center',
        sectionLabel: 'COMMAND CENTER',
        iconBg: '#6D3DF5',
        buttonBg: '#FAF7FF',
        buttonBorder: '#E4D8FC',
      }
    : {
        bg: '#FFF5E9', // Light Peach
        border: '#FED7AA',
        primary: '#F97316', // Orange
        activeBg: '#FFEBD6',
        activeText: '#F97316',
        subtitle: 'Customer Portal',
        sectionLabel: 'MY ACCOUNT',
        iconBg: '#F97316',
        buttonBg: '#FFF9F3',
        buttonBorder: '#FED7AA',
      };

  return (
    <aside
      className={`sidebar portal-sidebar-${portal}`}
      id="sidebar"
      style={{
        backgroundColor: theme.bg,
        borderRight: `1px solid ${theme.border}`,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Brand Header ── */}
      <Link
        to="/"
        className="sidebar-logo"
        style={{
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '18px 16px',
          background: 'transparent',
          borderBottom: `1px solid ${theme.border}`,
          flexShrink: 0,
        }}
        title="Go to PrimeRoute Landing Page"
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            backgroundColor: theme.iconBg,
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 3px 10px ${isAdmin ? 'rgba(109, 61, 245, 0.28)' : 'rgba(249, 115, 22, 0.28)'}`,
            flexShrink: 0,
          }}
        >
          {isAdmin ? <LayoutGrid size={20} color="#ffffff" /> : <User size={20} color="#ffffff" />}
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 17,
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
              fontSize: 12,
              fontWeight: 600,
              color: '#64748B',
              marginTop: 2,
              letterSpacing: '0.01em',
            }}
          >
            {theme.subtitle}
          </div>
        </div>
      </Link>

      {/* ── Navigation List ── */}
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
        {isAdmin ? (
          ADMIN_SECTIONS.map((sec, idx) => (
            <div key={sec.sectionTitle || idx} style={{ marginBottom: 6 }}>
              {sec.sectionTitle && (
                <p
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#7c3aed',
                    padding: '4px 12px 2px',
                    margin: '4px 0 2px',
                    opacity: 0.85,
                  }}
                >
                  {sec.sectionTitle}
                </p>
              )}
              {sec.items.map((item) => {
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
                      color: active ? theme.activeText : '#334155',
                      backgroundColor: active ? theme.activeBg : 'transparent',
                      textDecoration: 'none',
                      transition: 'all 0.15s ease',
                      overflow: 'hidden',
                      margin: '1px 0',
                    }}
                    className={`portal-nav-item ${active ? 'active' : ''}`}
                  >
                    {active && (
                      <span
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: 3.5,
                          backgroundColor: theme.primary,
                          borderRadius: '3px 0 0 3px',
                        }}
                      />
                    )}
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: active ? theme.activeText : '#64748b',
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </span>
                    <span style={{ fontSize: '13.5px' }}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))
        ) : (
          <div>
            <p
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#64748B',
                padding: '4px 12px',
                margin: '4px 0 6px 0',
              }}
            >
              {theme.sectionLabel}
            </p>
            {CUSTOMER_NAV.map((item) => {
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
                    color: active ? theme.activeText : '#334155',
                    backgroundColor: active ? theme.activeBg : 'transparent',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                    overflow: 'hidden',
                    margin: '1px 0',
                  }}
                  className={`portal-nav-item ${active ? 'active' : ''}`}
                >
                  {active && (
                    <span
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 3.5,
                        backgroundColor: theme.primary,
                        borderRadius: '3px 0 0 3px',
                      }}
                    />
                  )}
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: active ? theme.activeText : '#64748b',
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </span>
                  <span style={{ fontSize: '13.5px' }}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* ── Bottom Section: Logout Button & Decorative Watermark ── */}
      <div
        className="sidebar-bottom"
        style={{
          position: 'relative',
          marginTop: 'auto',
          padding: 14,
          borderTop: `1px solid ${theme.border}`,
          background: 'transparent',
          zIndex: 1,
        }}
      >
        <button
          onClick={handleLogout}
          id="sidebar-logout-btn"
          title="Sign out of PrimeRoute"
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 14px',
            borderRadius: 10,
            color: '#EF4444',
            backgroundColor: theme.buttonBg,
            border: `1px solid ${theme.buttonBorder}`,
            width: '100%',
            cursor: 'pointer',
            fontSize: '13.5px',
            fontWeight: 600,
            transition: 'all 0.15s ease',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          }}
          className="portal-logout-btn"
        >
          <LogOut size={18} color="#EF4444" />
          <span>Logout</span>
        </button>

        {/* Subtle Watermark Art at Bottom Right */}
        {isAdmin ? (
          /* Operations 3D Isometric Cube Watermark */
          <svg
            width="135"
            height="125"
            viewBox="0 0 140 130"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
              zIndex: 0,
              opacity: 0.35,
            }}
          >
            <path d="M70 15L125 45L70 75L15 45L70 15Z" fill="#DDD6FE" />
            <path d="M15 45L70 75V125L15 95V45Z" fill="#C4B5FD" />
            <path d="M70 75L125 45V95L70 125V75Z" fill="#A78BFA" />
          </svg>
        ) : (
          /* Customer Avatar Silhouette Watermark */
          <svg
            width="135"
            height="135"
            viewBox="0 0 140 140"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              position: 'absolute',
              right: -10,
              bottom: -15,
              pointerEvents: 'none',
              zIndex: 0,
              opacity: 0.38,
            }}
          >
            <circle cx="75" cy="48" r="24" fill="#FED7AA" />
            <path d="M25 125C25 95 48 84 75 84C102 84 125 95 125 125H25Z" fill="#FED7AA" />
          </svg>
        )}
      </div>
    </aside>
  );
}
