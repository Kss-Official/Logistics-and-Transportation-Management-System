import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, Boxes, Package, ArrowUpRight, Send,
  Users, Truck, MapPin, Warehouse, BarChart3,
  Bell, User, HelpCircle, LogOut, Building2, ChevronRight, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { warehousePortalService } from '../../services/warehousePortalService';
import { notificationService } from '../../services/notificationService';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'OPERATIONS',
    items: [
      { label: 'Dashboard', to: '/warehouse/dashboard', icon: <Home size={19} /> },
      { label: 'My Orders', to: '/warehouse/orders', icon: <Package size={19} /> },
      { label: 'Inventory', to: '/warehouse/inventory', icon: <Boxes size={19} /> },
      { label: 'Outgoing Shipments', to: '/warehouse/outgoing', icon: <ArrowUpRight size={19} /> },
      { label: 'Dispatch Console', to: '/warehouse/dispatch', icon: <Send size={19} /> },
    ],
  },
  {
    title: 'TRACKING',
    items: [
      { label: 'Driver Tracking', to: '/warehouse/driver-tracking', icon: <Users size={19} /> },
      { label: 'Vehicle Tracking', to: '/warehouse/vehicle-tracking', icon: <Truck size={19} /> },
      { label: 'Live Map', to: '/warehouse/live-map', icon: <MapPin size={19} /> },
    ],
  },
  {
    title: 'WAREHOUSE',
    items: [
      { label: 'Warehouse Details', to: '/warehouse/details', icon: <Building2 size={19} /> },
      { label: 'Analytics & Reports', to: '/warehouse/reports', icon: <BarChart3 size={19} /> },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      { label: 'Notifications', to: '/warehouse/notifications', icon: <Bell size={19} /> },
      { label: 'Manager Profile', to: '/warehouse/profile', icon: <User size={19} /> },
      { label: 'Help & Support', to: '/warehouse/support', icon: <HelpCircle size={19} /> },
    ],
  },
];

interface WarehouseSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function WarehouseSidebar({ isOpen, onClose }: WarehouseSidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [warehouseInfo, setWarehouseInfo] = useState({
    name: user?.warehouseName || '',
    code: user?.warehouseCode || '',
    managerName: user?.name || '',
  });

  useEffect(() => {
    let isMounted = true;
    const fetchWarehouse = () => {
      warehousePortalService.getWarehouse()
        .then((data) => {
          if (isMounted && data) {
            setWarehouseInfo({
              name: data.warehouseName || user?.warehouseName || '',
              code: data.warehouseCode || user?.warehouseCode || '',
              managerName: data.managerName || user?.name || '',
            });
          }
        })
        .catch(() => {});
    };
    fetchWarehouse();

    const fetchUnread = () => {
      notificationService.getUnreadCount('WAREHOUSE_MANAGER').then((c) => {
        if (isMounted) setUnreadCount(c);
      }).catch(() => {});
    };
    fetchUnread();

    window.addEventListener('storage', fetchWarehouse);
    window.addEventListener('warehouse-updated', fetchWarehouse);
    window.addEventListener('warehouse-notifications:updated', fetchUnread);
    window.addEventListener('notifications:updated', fetchUnread);
    return () => {
      isMounted = false;
      window.removeEventListener('storage', fetchWarehouse);
      window.removeEventListener('warehouse-updated', fetchWarehouse);
      window.removeEventListener('warehouse-notifications:updated', fetchUnread);
      window.removeEventListener('notifications:updated', fetchUnread);
    };
  }, [user]);

  const handleLogout = () => {
    onClose?.();
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');
    localStorage.removeItem('warehouse_filter');
    sessionStorage.removeItem('warehouse_filter');
    logout('/signin');
  };

  const isItemActive = (to: string) => {
    if (to === '/warehouse/dashboard') {
      return location.pathname === '/warehouse' || location.pathname === '/warehouse/dashboard';
    }
    return location.pathname === to || location.pathname.startsWith(to + '/');
  };

  return (
    <aside
      className={`sidebar warehouse-sidebar ${isOpen ? 'open' : ''}`}
      id="warehouse-sidebar"
      style={{
        width: '100%',
        height: '100vh',
        position: 'relative',
        backgroundColor: '#E8F8F3', // Light Mint
        borderRight: '1px solid #A7F3D0',
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
          borderBottom: '1px solid #A7F3D0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'transparent',
          flexShrink: 0,
        }}
      >
        <Link
          to="/warehouse/dashboard"
          onClick={onClose}
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}
          title="PrimeRoute Warehouse Portal"
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: '#10B981',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 3px 10px rgba(16, 185, 129, 0.28)',
              flexShrink: 0,
            }}
          >
            <Warehouse size={22} color="#ffffff" />
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
              Warehouse Portal
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
            className="warehouse-sidebar-close-btn"
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
        {NAV_GROUPS.map((section) => (
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
                      color: active ? '#10B981' : '#334155',
                      backgroundColor: active ? '#D1F4E7' : 'transparent',
                      textDecoration: 'none',
                      transition: 'all 0.15s ease',
                      overflow: 'hidden',
                      margin: '1px 0',
                    }}
                    className={`warehouse-nav-item ${active ? 'active' : ''}`}
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
                          backgroundColor: '#10B981',
                          borderRadius: '3px 0 0 3px',
                        }}
                      />
                    )}
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: active ? '#10B981' : '#64748b',
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </span>
                    <span style={{ fontSize: '13.5px', flex: 1 }}>{item.label}</span>
                    {item.to === '/warehouse/notifications' && unreadCount > 0 && (
                      <span
                        style={{
                          backgroundColor: '#10B981',
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

      {/* ── 3. Bottom Warehouse Info Card & Logout ── */}
      <div
        className="sidebar-bottom"
        style={{
          position: 'relative',
          marginTop: 'auto',
          padding: 14,
          borderTop: '1px solid #A7F3D0',
          background: 'transparent',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {/* Current Warehouse Card */}
        <div
          onClick={() => {
            onClose?.();
            navigate('/warehouse/details');
          }}
          style={{
            position: 'relative',
            zIndex: 2,
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            padding: '10px 14px',
            border: '1px solid #A7F3D0',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
            transition: 'background 0.15s ease',
          }}
        >
          {/* Top Row: Green Dot + Label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#10B981',
                display: 'inline-block',
              }}
            />
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                color: '#065F46',
                textTransform: 'uppercase',
              }}
            >
              CURRENT WAREHOUSE
            </span>
          </div>

          {/* Middle Row: Warehouse Name & Chevron */}
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
              {warehouseInfo.name}
            </span>
            <ChevronRight size={16} color="#475569" />
          </div>

          {/* Bottom Row: Manager Name */}
          <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: 2, fontWeight: 500 }}>
            Manager: {warehouseInfo.managerName}
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          id="warehouse-logout-btn"
          title="Sign out of Warehouse Console"
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
            border: '1px solid #A7F3D0',
            width: '100%',
            cursor: 'pointer',
            fontSize: '13.5px',
            fontWeight: 600,
            transition: 'all 0.15s ease',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          }}
          className="warehouse-logout-btn"
        >
          <LogOut size={18} color="#EF4444" />
          <span>Logout</span>
        </button>

        {/* Warehouse Hub Building Watermark Art at Bottom Right */}
        <svg
          width="150"
          height="120"
          viewBox="0 0 150 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: 'absolute',
            right: -5,
            bottom: -5,
            pointerEvents: 'none',
            zIndex: 0,
            opacity: 0.35,
          }}
        >
          <path d="M75 15L135 50V110H15V50L75 15Z" stroke="#6EE7B7" strokeWidth="10" fill="none" strokeLinejoin="round" />
          <rect x="60" y="70" width="30" height="40" fill="#A7F3D0" />
          <rect x="98" y="65" width="22" height="22" rx="3" fill="#A7F3D0" />
        </svg>
      </div>
    </aside>
  );
}
