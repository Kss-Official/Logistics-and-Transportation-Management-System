import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, ChevronDown, User, Settings, LogOut, Check, CheckCheck, Package, Shield, AlertCircle, Info, Trash2, MoreVertical } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';
import type { NotificationItem } from '../../services/notificationService';
import { driverPortalService } from '../../services/driverPortalService';
import { useToast } from '../common/Toast';

interface HeaderProps {
  title?: string;
  breadcrumb?: string;
  onMenuClick: () => void;
  userName?: string;
  userRole?: string;
  userInitials?: string;
  notificationCount?: number;
  showUserProfile?: boolean;
}

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    if (diffMs < 0) return 'Just now';
    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) return 'Just now';
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

function getNotificationIcon(type: string) {
  const upper = (type || '').toUpperCase();
  if (upper.includes('ORDER')) {
    return <Package size={14} style={{ color: 'var(--primary, #2563eb)', flexShrink: 0 }} />;
  }
  if (upper.includes('SHIPMENT') || upper.includes('DELIVERY')) {
    return <Package size={14} style={{ color: '#0284c7', flexShrink: 0 }} />;
  }
  if (upper.includes('SECURITY')) {
    return <Shield size={14} style={{ color: '#059669', flexShrink: 0 }} />;
  }
  if (upper.includes('BILLING') || upper.includes('INVOICE')) {
    return <AlertCircle size={14} style={{ color: '#d97706', flexShrink: 0 }} />;
  }
  if (upper.includes('SUPPORT')) {
    return <Info size={14} style={{ color: '#8b5cf6', flexShrink: 0 }} />;
  }
  return <Info size={14} style={{ color: 'var(--primary, #2563eb)', flexShrink: 0 }} />;
}

function getNotificationDestination(item: NotificationItem, rawRole?: string): string | null {
  const role = (rawRole || '').toUpperCase().replace(/^ROLE_/, '').trim();
  const type = (item.type || '').toUpperCase();
  const title = (item.title || '').toLowerCase();

  if (role === 'DRIVER') {
    if (type.includes('DISPATCH') || type.includes('SHIPMENT') || type.includes('DELIVERY') || title.includes('shipment') || title.includes('delivery') || title.includes('dispatch') || title.includes('trip')) {
      return '/driver/deliveries';
    }
    if (type.includes('VEHICLE') || title.includes('vehicle') || title.includes('inspection')) {
      return '/driver/vehicle';
    }
    if (type.includes('SUPPORT') || title.includes('ticket') || title.includes('support')) {
      return '/driver/support';
    }
    return '/driver/notifications';
  }

  if (role === 'WAREHOUSE_MANAGER') {
    if (type.includes('INVENTORY') || title.includes('stock') || type.includes('STOCK')) {
      return '/warehouse/inventory';
    }
    if (type.includes('DISPATCH') || title.includes('dispatch')) {
      return '/warehouse/dispatch';
    }
    if (type.includes('ORDER') || title.includes('order') || type.includes('SHIPMENT') || title.includes('shipment')) {
      return '/warehouse/orders';
    }
    if (type.includes('DRIVER') || type.includes('VEHICLE') || title.includes('driver') || title.includes('vehicle')) {
      return '/warehouse/driver-tracking';
    }
    return '/warehouse/notifications';
  }

  const isAdmin = role === 'ADMIN';

  if (type.includes('ORDER') || title.includes('order')) {
    return isAdmin ? '/admin/orders' : '/customer/orders';
  }
  if (type.includes('SHIPMENT') || type.includes('DELIVERY') || title.includes('shipment') || title.includes('delivery')) {
    return isAdmin ? '/admin/shipments' : '/customer/shipments';
  }
  if (type.includes('INVOICE') || type.includes('BILLING') || title.includes('invoice') || title.includes('bill')) {
    return isAdmin ? '/admin/invoices' : '/customer/invoices';
  }
  if (type.includes('SUPPORT') || title.includes('ticket') || title.includes('support')) {
    return isAdmin ? '/admin/support' : '/customer/support';
  }
  if (type.includes('ROUTE') || title.includes('route')) {
    return isAdmin ? '/admin/routes' : null;
  }
  if (type.includes('SECURITY') || title.includes('security') || title.includes('profile')) {
    return isAdmin ? '/admin/settings' : '/customer/profile';
  }
  return isAdmin ? '/admin/dashboard' : '/customer/dashboard';
}

export default function Header({
  title,
  breadcrumb,
  onMenuClick,
  userName,
  userRole,
  userInitials,
  showUserProfile = false,
}: HeaderProps) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [userOpen, setUserOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const { showToast } = useToast();
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const userRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const hasNotifications = Boolean(user);

  const fetchNotifications = useCallback(async () => {
    if (!hasNotifications) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      setLoadingNotifs(true);
      setErrorMessage(null);
      const role = user?.role;
      const [list, count] = await Promise.all([
        notificationService.getNotifications(role),
        notificationService.getUnreadCount(role),
      ]);
      setNotifications(list);
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setErrorMessage('Unable to load notifications');
    } finally {
      setLoadingNotifs(false);
    }
  }, [hasNotifications, user?.role]);

  useEffect(() => {
    if (!hasNotifications) return;

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // 15s auto-refresh for reactive updates

    const handleNotifsUpdated = () => {
      fetchNotifications();
    };
    window.addEventListener('notifications:updated', handleNotifsUpdated);
    window.addEventListener('driver-notifications:updated', handleNotifsUpdated);
    window.addEventListener('warehouse-notifications:updated', handleNotifsUpdated);

    return () => {
      clearInterval(interval);
      window.removeEventListener('notifications:updated', handleNotifsUpdated);
      window.removeEventListener('driver-notifications:updated', handleNotifsUpdated);
      window.removeEventListener('warehouse-notifications:updated', handleNotifsUpdated);
    };
  }, [fetchNotifications, hasNotifications]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleToggleNotif = () => {
    if (!notifOpen) {
      fetchNotifications();
    } else {
      setActiveMenuId(null);
    }
    setNotifOpen(!notifOpen);
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead(user?.role);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      window.dispatchEvent(new CustomEvent('notifications:updated'));
      window.dispatchEvent(new CustomEvent('driver-notifications:updated'));
      window.dispatchEvent(new CustomEvent('warehouse-notifications:updated'));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleDeleteNotification = async (item: NotificationItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(item.id, user?.role);
      setNotifications(prev => prev.filter(n => n.id !== item.id));
      if (!item.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setActiveMenuId(null);
      window.dispatchEvent(new CustomEvent('notifications:updated'));
      window.dispatchEvent(new CustomEvent('driver-notifications:updated'));
      window.dispatchEvent(new CustomEvent('warehouse-notifications:updated'));
    } catch (err) {
      console.error('Failed to delete notification', err);
      showToast('error', 'Unable to delete notification. Please try again.');
    }
  };

  const handleItemClick = async (item: NotificationItem) => {
    if (!item.read) {
      try {
        await notificationService.markAsRead(item.id, user?.role);
        setNotifications(prev =>
          prev.map(n => (n.id === item.id ? { ...n, read: true } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        window.dispatchEvent(new CustomEvent('notifications:updated'));
        window.dispatchEvent(new CustomEvent('driver-notifications:updated'));
        window.dispatchEvent(new CustomEvent('warehouse-notifications:updated'));
      } catch (err) {
        console.error('Failed to mark notification read', err);
      }
    }
    const dest = getNotificationDestination(item, user?.role);
    if (dest) {
      setNotifOpen(false);
      navigate(dest);
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="header-menu-btn" onClick={onMenuClick} aria-label="Toggle sidebar">
          <Menu size={20} />
        </button>

        {breadcrumb ? (
          <div style={{ fontSize: '13.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
            {breadcrumb.split('>').map((part, index, arr) => (
              <React.Fragment key={index}>
                <span
                  style={{
                    color: index === arr.length - 1 ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontWeight: index === arr.length - 1 ? 600 : 500,
                    fontSize: '13.5px',
                  }}
                >
                  {part.trim()}
                </span>
                {index < arr.length - 1 && <span style={{ color: 'var(--text-muted)', opacity: 0.5, fontSize: '13px' }}>/</span>}
              </React.Fragment>
            ))}
          </div>
        ) : title ? (
          <h1 className="header-title" style={{ fontSize: '15px', fontWeight: 700 }}>{title}</h1>
        ) : null}
      </div>

      <div className="header-right">
        {/* Dynamic Notifications */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            className="header-icon-btn"
            onClick={handleToggleNotif}
            id="notification-btn"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="notification-count" id="header-unread-count">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              className="dropdown-menu"
              style={{
                width: 360,
                maxWidth: 'calc(100vw - 32px)',
                right: 0,
                maxHeight: 460,
                overflowY: 'auto',
                boxShadow: '0 12px 32px rgba(15, 23, 42, 0.16)',
                borderRadius: 12,
                border: '1px solid var(--border)',
                zIndex: 1050,
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'var(--card-bg, #fff)',
                  position: 'sticky',
                  top: 0,
                  zIndex: 2,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: 10,
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                      }}
                    >
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{
                      border: 'none',
                      background: 'none',
                      fontSize: 11,
                      color: 'var(--primary, #2563eb)',
                      cursor: 'pointer',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: 0,
                    }}
                  >
                    <CheckCheck size={13} />
                    Mark all read
                  </button>
                )}
              </div>

              {errorMessage ? (
                <div style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <AlertCircle size={24} style={{ margin: '0 auto 8px', color: '#ef4444', opacity: 0.8 }} />
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    Unable to load notifications
                  </p>
                  <button
                    onClick={fetchNotifications}
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: 10, fontSize: 11, padding: '4px 10px' }}
                  >
                    Retry
                  </button>
                </div>
              ) : notifications.length === 0 ? (
                <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Bell size={28} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                  <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>No new notifications</p>
                  <p style={{ fontSize: 11, marginTop: 4, color: 'var(--text-muted)' }}>
                    Operational updates and activity alerts will appear here
                  </p>
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    style={{
                      display: 'flex',
                      gap: 12,
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--border-light, #f1f5f9)',
                      background: n.read ? 'transparent' : 'rgba(37, 99, 235, 0.05)',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                      position: 'relative',
                    }}
                  >
                    <div style={{ marginTop: 2 }}>{getNotificationIcon(n.type)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6, marginBottom: 3 }}>
                        <p
                          style={{
                            fontSize: 12,
                            fontWeight: n.read ? 600 : 700,
                            color: 'var(--text-primary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            margin: 0,
                          }}
                        >
                          {n.title}
                        </p>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>
                          {formatRelativeTime(n.createdAt)}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: 11.5,
                          color: 'var(--text-secondary, #64748b)',
                          lineHeight: 1.4,
                          margin: 0,
                        }}
                      >
                        {n.message}
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                      {!n.read ? (
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: 'var(--primary, #2563eb)',
                            marginTop: 4,
                          }}
                        />
                      ) : (
                        <span style={{ width: 6, height: 6 }} />
                      )}

                      <div style={{ position: 'relative' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(prev => (prev === n.id ? null : n.id));
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-muted, #94a3b8)',
                            padding: '4px',
                            borderRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'color 0.15s ease, background 0.15s ease',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.color = 'var(--text-primary)';
                            e.currentTarget.style.background = 'rgba(0,0,0,0.06)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.color = 'var(--text-muted, #94a3b8)';
                            e.currentTarget.style.background = 'transparent';
                          }}
                          title="Options"
                          aria-label="Notification options"
                        >
                          <MoreVertical size={14} />
                        </button>

                        {activeMenuId === n.id && (
                          <div
                            style={{
                              position: 'absolute',
                              right: 0,
                              top: '100%',
                              marginTop: 2,
                              background: 'var(--card-bg, #ffffff)',
                              border: '1px solid var(--border, #e2e8f0)',
                              borderRadius: 6,
                              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
                              zIndex: 20,
                              minWidth: 95,
                              overflow: 'hidden',
                            }}
                            onClick={e => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={(e) => handleDeleteNotification(n, e)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                width: '100%',
                                padding: '8px 10px',
                                background: 'transparent',
                                border: 'none',
                                fontSize: 12,
                                fontWeight: 500,
                                color: '#ef4444',
                                cursor: 'pointer',
                                textAlign: 'left',
                              }}
                              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                              <Trash2 size={13} style={{ color: '#ef4444' }} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Bottom Footer Bar */}
              <div
                style={{
                  padding: '10px 16px',
                  borderTop: '1px solid var(--border, #e2e8f0)',
                  background: 'var(--card-bg, #fff)',
                  position: 'sticky',
                  bottom: 0,
                  zIndex: 2,
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setNotifOpen(false);
                    const role = (user?.role || '').toUpperCase().replace(/^ROLE_/, '').trim();
                    if (role === 'DRIVER') navigate('/driver/notifications');
                    else if (role === 'WAREHOUSE_MANAGER') navigate('/warehouse/notifications');
                    else if (role === 'ADMIN') navigate('/admin/notifications');
                    else navigate('/customer/notifications');
                  }}
                  id="header-view-all-notifs-btn"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--primary, #2563eb)',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 10px',
                    borderRadius: 6,
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(37, 99, 235, 0.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span>View Full Notification Center</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Optional User Menu (Only for portals with showUserProfile = true, e.g. Admin) */}
        {showUserProfile && (
          <>
            <div className="header-divider" />
            <div style={{ position: 'relative' }} ref={userRef}>
              <button className="header-user" onClick={() => setUserOpen(!userOpen)} id="user-menu-btn">
                <div className="header-user-avatar">{userInitials}</div>
                <div style={{ textAlign: 'left' }}>
                  <p className="header-user-name">{userName}</p>
                  {userRole ? <p className="header-user-role">{userRole}</p> : null}
                </div>
                <ChevronDown size={14} style={{ color: 'var(--text-muted)', marginLeft: 4 }} />
              </button>
              {userOpen && (
                <div className="dropdown-menu">
                  <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{userName}</p>
                    {userRole ? (
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{userRole}</p>
                    ) : (
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>PrimeRoute Operations</p>
                    )}
                  </div>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setUserOpen(false);
                      navigate(user?.role === 'ADMIN' ? '/admin/settings' : '/customer/profile');
                    }}
                  >
                    <User size={15} />Profile
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setUserOpen(false);
                      navigate(user?.role === 'ADMIN' ? '/admin/settings' : '/customer/profile');
                    }}
                  >
                    <Settings size={15} />Settings
                  </button>
                  <div className="dropdown-divider" />
                  <button
                    className="dropdown-item danger"
                    onClick={() => {
                      setUserOpen(false);
                      logout();
                    }}
                    id="header-signout-btn"
                  >
                    <LogOut size={15} />Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
