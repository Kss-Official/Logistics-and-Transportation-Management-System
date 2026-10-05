import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  RefreshCw,
  Trash2,
  MoreVertical,
  Check,
  Package,
  Truck,
  CreditCard,
  LifeBuoy,
  Shield,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { notificationService, type NotificationItem } from '../../services/notificationService';
import { useToast } from '../../components/common/Toast';

type FilterCategory = 'ALL' | 'UNREAD' | 'ORDERS' | 'SHIPMENTS' | 'BILLING' | 'SUPPORT';

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
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function getGroupKey(dateStr?: string): 'Today' | 'Yesterday' | 'Earlier' {
  if (!dateStr) return 'Earlier';
  try {
    const date = new Date(dateStr);
    const now = new Date();
    
    // Check if same calendar day
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();
    if (isToday) return 'Today';

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();
    if (isYesterday) return 'Yesterday';

    return 'Earlier';
  } catch {
    return 'Earlier';
  }
}

function getNotificationCategory(item: NotificationItem): 'ORDERS' | 'SHIPMENTS' | 'BILLING' | 'SUPPORT' | 'SYSTEM' {
  const type = (item.type || '').toUpperCase();
  const title = (item.title || '').toUpperCase();

  if (type.includes('ORDER') || title.includes('ORDER')) {
    return 'ORDERS';
  }
  if (type.includes('SHIPMENT') || type.includes('DELIVERY') || type.includes('POD') || title.includes('SHIPMENT') || title.includes('DELIVERY')) {
    return 'SHIPMENTS';
  }
  if (type.includes('BILLING') || type.includes('INVOICE') || title.includes('INVOICE') || title.includes('BILLING')) {
    return 'BILLING';
  }
  if (type.includes('SUPPORT') || title.includes('TICKET') || title.includes('SUPPORT')) {
    return 'SUPPORT';
  }
  return 'SYSTEM';
}

function getCategoryIcon(category: string) {
  switch (category) {
    case 'ORDERS':
      return <Package size={18} style={{ color: '#2563eb' }} />;
    case 'SHIPMENTS':
      return <Truck size={18} style={{ color: '#0284c7' }} />;
    case 'BILLING':
      return <CreditCard size={18} style={{ color: '#d97706' }} />;
    case 'SUPPORT':
      return <LifeBuoy size={18} style={{ color: '#8b5cf6' }} />;
    default:
      return <Shield size={18} style={{ color: '#059669' }} />;
  }
}

function getCategoryBadgeStyle(category: string) {
  switch (category) {
    case 'ORDERS':
      return { background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' };
    case 'SHIPMENTS':
      return { background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd' };
    case 'BILLING':
      return { background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' };
    case 'SUPPORT':
      return { background: '#f5f3ff', color: '#6d28d9', border: '1px solid #ddd6fe' };
    default:
      return { background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' };
  }
}

function getDestinationRoute(item: NotificationItem): string | null {
  const category = getNotificationCategory(item);
  switch (category) {
    case 'ORDERS':
      return '/admin/orders';
    case 'SHIPMENTS':
      return '/admin/shipments';
    case 'BILLING':
      return '/admin/invoices';
    case 'SUPPORT':
      return '/admin/support';
    default:
      return null;
  }
}

export default function AdminNotifications() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('ALL');
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchNotifications = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const list = await notificationService.getNotifications('ADMIN');
      setNotifications(list);

      if (isManualRefresh) {
        showToast('success', 'Refreshed', 'Notifications are up to date.');
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      showToast('error', 'Unable to Load', 'Could not retrieve notifications. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchNotifications();

    const handleUpdate = () => {
      fetchNotifications();
    };
    window.addEventListener('notifications:updated', handleUpdate);

    return () => {
      window.removeEventListener('notifications:updated', handleUpdate);
    };
  }, [fetchNotifications]);

  // Close popup menu on click outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Filter calculations
  const counts = useMemo(() => {
    const all = notifications.length;
    const unread = notifications.filter(n => !n.read).length;
    const orders = notifications.filter(n => getNotificationCategory(n) === 'ORDERS').length;
    const shipments = notifications.filter(n => getNotificationCategory(n) === 'SHIPMENTS').length;
    const billing = notifications.filter(n => getNotificationCategory(n) === 'BILLING').length;
    const support = notifications.filter(n => getNotificationCategory(n) === 'SUPPORT').length;
    return { all, unread, orders, shipments, billing, support };
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter(item => {
      if (activeFilter === 'UNREAD') return !item.read;
      if (activeFilter === 'ORDERS') return getNotificationCategory(item) === 'ORDERS';
      if (activeFilter === 'SHIPMENTS') return getNotificationCategory(item) === 'SHIPMENTS';
      if (activeFilter === 'BILLING') return getNotificationCategory(item) === 'BILLING';
      if (activeFilter === 'SUPPORT') return getNotificationCategory(item) === 'SUPPORT';
      return true;
    });
  }, [notifications, activeFilter]);

  // Grouped by timeline
  const groupedNotifications = useMemo(() => {
    const groups: { [key in 'Today' | 'Yesterday' | 'Earlier']?: NotificationItem[] } = {};
    for (const item of filteredNotifications) {
      const key = getGroupKey(item.createdAt);
      if (!groups[key]) groups[key] = [];
      groups[key]!.push(item);
    }
    return groups;
  }, [filteredNotifications]);

  // Actions
  const handleMarkAsRead = async (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setProcessingId(id);
      await notificationService.markAsRead(id, 'ADMIN');
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      window.dispatchEvent(new CustomEvent('notifications:updated'));
      showToast('success', 'Marked as Read', 'Notification marked as read.');
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      showToast('error', 'Update Failed', 'Unable to mark notification as read.');
    } finally {
      setProcessingId(null);
      setActiveMenuId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (counts.unread === 0) return;
    try {
      setRefreshing(true);
      await notificationService.markAllAsRead('ADMIN');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      window.dispatchEvent(new CustomEvent('notifications:updated'));
      showToast('success', 'All Read', 'All notifications have been marked as read.');
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      showToast('error', 'Update Failed', 'Unable to mark all notifications as read.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setProcessingId(id);
      await notificationService.deleteNotification(id, 'ADMIN');
      setNotifications(prev => prev.filter(n => n.id !== id));
      window.dispatchEvent(new CustomEvent('notifications:updated'));
      showToast('success', 'Deleted', 'Notification removed successfully.');
    } catch (err) {
      console.error('Failed to delete notification:', err);
      showToast('error', 'Delete Failed', 'Unable to remove notification. Please try again.');
    } finally {
      setProcessingId(null);
      setActiveMenuId(null);
    }
  };

  const handleCardClick = async (item: NotificationItem) => {
    if (!item.read) {
      handleMarkAsRead(item.id);
    }
    const route = getDestinationRoute(item);
    if (route) {
      navigate(route);
    }
  };

  const filterTabs: { key: FilterCategory; label: string; count: number }[] = [
    { key: 'ALL', label: 'All', count: counts.all },
    { key: 'UNREAD', label: 'Unread', count: counts.unread },
    { key: 'ORDERS', label: 'Orders', count: counts.orders },
    { key: 'SHIPMENTS', label: 'Shipments', count: counts.shipments },
    { key: 'BILLING', label: 'Billing', count: counts.billing },
    { key: 'SUPPORT', label: 'Support', count: counts.support },
  ];

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: '32px 24px 64px' }}>
      {/* ── Page Header ── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.02em',
              margin: '0 0 6px',
            }}
          >
            Notifications
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: '#64748b', lineHeight: 1.5 }}>
            Stay up to date with orders, shipments, billing, support, and operational activity.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => fetchNotifications(true)}
            disabled={loading || refreshing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 15px',
              borderRadius: 8,
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              color: '#334155',
              fontSize: 13,
              fontWeight: 600,
              cursor: loading || refreshing ? 'not-allowed' : 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease',
            }}
            title="Refresh notifications"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleMarkAllAsRead}
            disabled={counts.unread === 0 || refreshing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 16px',
              borderRadius: 8,
              background: counts.unread === 0 ? '#f1f5f9' : '#2563eb',
              border: counts.unread === 0 ? '1px solid #e2e8f0' : '1px solid #1d4ed8',
              color: counts.unread === 0 ? '#94a3b8' : '#ffffff',
              fontSize: 13,
              fontWeight: 600,
              cursor: counts.unread === 0 || refreshing ? 'not-allowed' : 'pointer',
              boxShadow: counts.unread > 0 ? '0 2px 4px rgba(37, 99, 235, 0.2)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <CheckCheck size={16} />
            <span>Mark all as read</span>
          </button>
        </div>
      </div>

      {/* ── Category Filter Tabs ── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 8,
          marginBottom: 24,
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: 12,
        }}
      >
        {filterTabs.map(tab => {
          const isActive = activeFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 14px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#ffffff' : '#475569',
                background: isActive ? '#0f172a' : '#f8fafc',
                border: isActive ? '1px solid #0f172a' : '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: 10,
                  background: isActive ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                  color: isActive ? '#ffffff' : '#64748b',
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Main Content Area ── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3, 4].map(idx => (
            <div
              key={idx}
              style={{
                height: 84,
                borderRadius: 12,
                background: '#f1f5f9',
                animation: 'pulse 1.5s infinite',
              }}
            />
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        /* Empty State */
        <div
          style={{
            padding: '56px 24px',
            textAlign: 'center',
            background: '#ffffff',
            borderRadius: 16,
            border: '1px dashed #cbd5e1',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            {activeFilter === 'UNREAD' ? <CheckCircle2 size={28} style={{ color: '#059669' }} /> : <Bell size={28} />}
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
            {activeFilter === 'UNREAD' ? "You're all caught up" : 'No notifications'}
          </h3>
          <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
            {activeFilter === 'UNREAD'
              ? 'There are no unread notifications right now.'
              : `No notifications found under the ${activeFilter.toLowerCase()} category.`}
          </p>
        </div>
      ) : (
        /* Grouped Timeline Lists */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {(['Today', 'Yesterday', 'Earlier'] as const).map(groupName => {
            const items = groupedNotifications[groupName];
            if (!items || items.length === 0) return null;

            return (
              <div key={groupName}>
                {/* Timeline Header */}
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#94a3b8',
                    marginBottom: 12,
                    paddingLeft: 4,
                  }}
                >
                  {groupName}
                </div>

                {/* Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {items.map(item => {
                    const category = getNotificationCategory(item);
                    const icon = getCategoryIcon(category);
                    const badgeStyle = getCategoryBadgeStyle(category);
                    const hasDestination = !!getDestinationRoute(item);
                    const isMenuOpen = activeMenuId === item.id;
                    const isProcessing = processingId === item.id;

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleCardClick(item)}
                        style={{
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 16,
                          padding: '16px 20px',
                          borderRadius: 12,
                          background: item.read ? '#ffffff' : '#f8faff',
                          border: item.read ? '1px solid #e2e8f0' : '1px solid #bfdbfe',
                          boxShadow: item.read
                            ? '0 1px 3px rgba(0,0,0,0.02)'
                            : '0 2px 6px rgba(37, 99, 235, 0.06)',
                          cursor: hasDestination ? 'pointer' : 'default',
                          transition: 'all 0.15s ease',
                          opacity: isProcessing ? 0.6 : 1,
                        }}
                      >
                        {/* Unread indicator dot */}
                        <div style={{ paddingTop: 6, width: 8, flexShrink: 0 }}>
                          {!item.read && (
                            <div
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: '#2563eb',
                                boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.2)',
                              }}
                              title="Unread notification"
                            />
                          )}
                        </div>

                        {/* Icon */}
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 10,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            ...badgeStyle,
                          }}
                        >
                          {icon}
                        </div>

                        {/* Notification Details */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 12,
                              marginBottom: 4,
                            }}
                          >
                            <h4
                              style={{
                                margin: 0,
                                fontSize: 15,
                                fontWeight: item.read ? 600 : 700,
                                color: '#0f172a',
                              }}
                            >
                              {item.title}
                            </h4>

                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: 12,
                                color: '#64748b',
                                flexShrink: 0,
                              }}
                            >
                              <Clock size={13} />
                              <span>{formatRelativeTime(item.createdAt)}</span>
                            </div>
                          </div>

                          <p
                            style={{
                              margin: '0 0 8px',
                              fontSize: 13.5,
                              color: '#475569',
                              lineHeight: 1.5,
                              wordBreak: 'break-word',
                            }}
                          >
                            {item.message}
                          </p>

                          {hasDestination && (
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: 12,
                                fontWeight: 600,
                                color: '#2563eb',
                              }}
                            >
                              <span>View details</span>
                              <ArrowRight size={12} />
                            </div>
                          )}
                        </div>

                        {/* Three-dot action menu */}
                        <div
                          style={{ position: 'relative', flexShrink: 0 }}
                          onClick={e => e.stopPropagation()}
                        >
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setActiveMenuId(isMenuOpen ? null : item.id);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: 6,
                              borderRadius: 6,
                              color: '#94a3b8',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            title="More actions"
                          >
                            <MoreVertical size={16} />
                          </button>

                          {/* Dropdown Menu */}
                          {isMenuOpen && (
                            <div
                              style={{
                                position: 'absolute',
                                right: 0,
                                top: '100%',
                                marginTop: 4,
                                background: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: 8,
                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                padding: 4,
                                minWidth: 140,
                                zIndex: 30,
                              }}
                            >
                              {!item.read && (
                                <button
                                  onClick={e => handleMarkAsRead(item.id, e)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    width: '100%',
                                    padding: '8px 12px',
                                    background: 'none',
                                    border: 'none',
                                    borderRadius: 6,
                                    fontSize: 12.5,
                                    fontWeight: 500,
                                    color: '#334155',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                  }}
                                >
                                  <Check size={14} style={{ color: '#059669' }} />
                                  <span>Mark as read</span>
                                </button>
                              )}

                              <button
                                onClick={e => handleDelete(item.id, e)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  width: '100%',
                                  padding: '8px 12px',
                                  background: 'none',
                                  border: 'none',
                                  borderRadius: 6,
                                  fontSize: 12.5,
                                  fontWeight: 500,
                                  color: '#dc2626',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                }}
                              >
                                <Trash2 size={14} />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
