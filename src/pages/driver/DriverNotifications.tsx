import React, { useEffect, useState, useCallback } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  CheckCheck,
  Truck,
  MessageSquare,
  RefreshCw,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { driverPortalService } from '../../services/driverPortalService';
import type { DriverNotificationItem } from '../../types/driverPortal';

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    if (diffMs < 0) return 'Just now';
    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) return 'Just now';
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function DriverNotifications() {
  const [notifications, setNotifications] = useState<DriverNotificationItem[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (isManual = false) => {
    if (isManual) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await driverPortalService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError('Unable to fetch notifications. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(false);

    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 15000);

    const handleUpdated = () => {
      fetchNotifications(true);
    };
    window.addEventListener('driver-notifications:updated', handleUpdated);
    window.addEventListener('notifications:updated', handleUpdated);
    return () => {
      clearInterval(interval);
      window.removeEventListener('driver-notifications:updated', handleUpdated);
      window.removeEventListener('notifications:updated', handleUpdated);
    };
  }, [fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    await driverPortalService.markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    window.dispatchEvent(new CustomEvent('driver-notifications:updated'));
    window.dispatchEvent(new CustomEvent('notifications:updated'));
  };

  const handleMarkAllRead = async () => {
    await driverPortalService.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    window.dispatchEvent(new CustomEvent('driver-notifications:updated'));
    window.dispatchEvent(new CustomEvent('notifications:updated'));
  };

  const handleDelete = async (id: string) => {
    await driverPortalService.deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    window.dispatchEvent(new CustomEvent('driver-notifications:updated'));
    window.dispatchEvent(new CustomEvent('notifications:updated'));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifs = filter === 'UNREAD' ? notifications.filter((n) => !n.read) : notifications;

  const getTypeIcon = (type: string) => {
    const upper = (type || '').toUpperCase();
    if (upper.includes('ALERT') || upper.includes('CRITICAL')) {
      return <AlertTriangle size={18} style={{ color: '#dc2626' }} />;
    }
    if (upper.includes('WARN') || upper.includes('DELAY')) {
      return <AlertTriangle size={18} style={{ color: '#d97706' }} />;
    }
    if (upper.includes('SUCCESS') || upper.includes('DELIVERED')) {
      return <CheckCircle2 size={18} style={{ color: '#16a34a' }} />;
    }
    if (upper.includes('DISPATCH') || upper.includes('TRIP') || upper.includes('SHIPMENT')) {
      return <Truck size={18} style={{ color: '#2563eb' }} />;
    }
    if (upper.includes('SUPPORT') || upper.includes('TICKET')) {
      return <MessageSquare size={18} style={{ color: '#8b5cf6' }} />;
    }
    return <Info size={18} style={{ color: '#2563eb' }} />;
  };

  return (
    <div className="driver-page-container">
      {/* ── Header ── */}
      <div className="driver-card">
        <div className="driver-card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span className="driver-badge driver-badge-blue">FLEET COMMUNICATIONS</span>
              <span style={{ fontSize: 13, color: '#64748b' }}>Control Tower Channel</span>
            </div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
              Operational Dispatch Notifications
            </h2>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                onClick={() => setFilter('ALL')}
                className={filter === 'ALL' ? 'driver-btn-primary' : 'driver-btn-secondary'}
                id="filter-all-btn"
                style={{ padding: '6px 12px', fontSize: 12 }}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('UNREAD')}
                className={filter === 'UNREAD' ? 'driver-btn-primary' : 'driver-btn-secondary'}
                id="filter-unread-btn"
                style={{ padding: '6px 12px', fontSize: 12 }}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="driver-btn-secondary"
                id="mark-all-read-btn"
                style={{ padding: '6px 12px', fontSize: 12 }}
              >
                <CheckCheck size={14} /> Mark All as Read
              </button>
            )}

            <button
              onClick={() => fetchNotifications(true)}
              disabled={refreshing}
              className="driver-btn-secondary"
              id="refresh-notifications-btn"
              title="Refresh notifications"
              style={{ padding: '6px 10px', fontSize: 12 }}
            >
              <RefreshCw size={14} className={refreshing ? 'driver-spin' : ''} />
            </button>
          </div>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, color: '#b91c1c', fontSize: 13, fontWeight: 600, marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Notification List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 36, color: '#2563eb', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <span style={{ width: 16, height: 16, border: '2px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
            <span>Loading notifications...</span>
          </div>
        ) : filteredNotifs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
            <Bell size={40} style={{ color: '#94a3b8', margin: '0 auto 10px', opacity: 0.5 }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>No new notifications</div>
            <p style={{ margin: '6px 0 0', fontSize: 12.5, color: '#64748b' }}>
              Operational dispatches, shipment status alerts, and control tower notices will appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
            {filteredNotifs.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                  padding: '14px 16px',
                  borderRadius: 10,
                  backgroundColor: item.read ? '#f8fafc' : '#eff6ff',
                  border: item.read ? '1px solid #e2e8f0' : '1px solid #bfdbfe',
                  transition: 'all 0.15s ease',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {getTypeIcon(item.type)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                    <div style={{ fontSize: 14, fontWeight: item.read ? 600 : 700, color: '#0f172a' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} /> {formatRelativeTime(item.timestamp || item.createdAt)}
                    </div>
                  </div>

                  <p style={{ margin: '4px 0 0', fontSize: 12.5, color: '#475569', lineHeight: 1.4 }}>
                    {item.message}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  {!item.read && (
                    <button
                      onClick={() => handleMarkRead(item.id)}
                      style={{
                        border: 'none',
                        background: 'none',
                        color: '#2563eb',
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: '4px 6px',
                      }}
                      title="Mark as read"
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title="Delete notification"
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
