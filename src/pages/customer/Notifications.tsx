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
      return '/customer/orders';
    case 'SHIPMENTS':
      return '/customer/shipments';
    case 'BILLING':
      return '/customer/invoices';
    case 'SUPPORT':
      return '/customer/support';
    default:
      return null;
  }
}

export default function CustomerNotifications() {
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

      const list = await notificationService.getNotifications('CUSTOMER');
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
      if (activeFilter === 'ALL') return true;
      if (activeFilter === 'UNREAD') return !item.read;
      return getNotificationCategory(item) === activeFilter;
    });
  }, [notifications, activeFilter]);

  // Group notifications chronologically
  const groupedNotifications = useMemo(() => {
    const groups: { [key in 'Today' | 'Yesterday' | 'Earlier']: NotificationItem[] } = {
      Today: [],
      Yesterday: [],
      Earlier: [],
    };

    filteredNotifications.forEach(item => {
      const groupKey = getGroupKey(item.createdAt);
      groups[groupKey].push(item);
    });

    return groups;
  }, [filteredNotifications]);

  // Mark single as read
  const handleMarkAsRead = async (item: NotificationItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (item.read) return;

    try {
      setProcessingId(item.id);
      await notificationService.markAsRead(item.id, 'CUSTOMER');
      setNotifications(prev =>
        prev.map(n => (n.id === item.id ? { ...n, read: true } : n))
      );
      window.dispatchEvent(new CustomEvent('notifications:updated'));
      showToast('success', 'Marked as Read', 'Notification marked as read.');
    } catch (err) {
      console.error('Failed to mark as read:', err);
      showToast('error', 'Error', 'Failed to update notification status.');
    } finally {
      setProcessingId(null);
      setActiveMenuId(null);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    if (counts.unread === 0) {
      showToast('info', 'All Caught Up', 'You have no unread notifications.');
      return;
    }

    try {
      setRefreshing(true);
      await notificationService.markAllAsRead('CUSTOMER');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      window.dispatchEvent(new CustomEvent('notifications:updated'));
      showToast('success', 'Marked All Read', 'All notifications have been marked as read.');
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      showToast('error', 'Error', 'Could not mark all notifications as read.');
    } finally {
      setRefreshing(false);
    }
  };

  // Delete notification
  const handleDelete = async (item: NotificationItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setProcessingId(item.id);
      await notificationService.deleteNotification(item.id, 'CUSTOMER');
      setNotifications(prev => prev.filter(n => n.id !== item.id));
      window.dispatchEvent(new CustomEvent('notifications:updated'));
      showToast('success', 'Deleted', 'Notification removed.');
    } catch (err) {
      console.error('Failed to delete notification:', err);
      showToast('error', 'Error', 'Could not delete notification.');
    } finally {
      setProcessingId(null);
      setActiveMenuId(null);
    }
  };

  // Handle card click navigation
  const handleItemClick = (item: NotificationItem) => {
    if (!item.read) {
      handleMarkAsRead(item);
    }
    const route = getDestinationRoute(item);
    if (route) {
      navigate(route);
    }
  };

  const filterTabs: { id: FilterCategory; label: string; count: number }[] = [
    { id: 'ALL', label: 'All', count: counts.all },
    { id: 'UNREAD', label: 'Unread', count: counts.unread },
    { id: 'ORDERS', label: 'Orders', count: counts.orders },
    { id: 'SHIPMENTS', label: 'Shipments', count: counts.shipments },
    { id: 'BILLING', label: 'Billing', count: counts.billing },
    { id: 'SUPPORT', label: 'Support', count: counts.support },
  ];

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '28px 20px 60px' }}>
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(14, 165, 233, 0.25)',
              }}
            >
              <Bell size={22} />
            </div>
            <div>
              <h1
                style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#0f172a',
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                Notifications
              </h1>
              <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                View updates about your orders, shipments, deliveries, invoices, and support requests.
              </p>
            </div>
          </div>
        </div>

        {/* Global Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => fetchNotifications(true)}
            disabled={refreshing || loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 15px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#334155',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Refresh notifications"
          >
            <RefreshCw size={15} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleMarkAllAsRead}
            disabled={counts.unread === 0 || refreshing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '8px',
              border: 'none',
              background: counts.unread === 0 ? '#f1f5f9' : '#0284c7',
              color: counts.unread === 0 ? '#94a3b8' : '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: counts.unread === 0 ? 'default' : 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: counts.unread > 0 ? '0 2px 8px rgba(2, 132, 199, 0.25)' : 'none',
            }}
          >
            <CheckCheck size={16} />
            <span>Mark all as read</span>
          </button>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '20px',
          scrollbarWidth: 'none',
        }}
      >
        {filterTabs.map(tab => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '24px',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 500,
                border: isActive ? '1.5px solid #0284c7' : '1px solid #e2e8f0',
                background: isActive ? '#f0f9ff' : '#ffffff',
                color: isActive ? '#0369a1' : '#475569',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '20px',
                  height: '20px',
                  padding: '0 6px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  background: isActive ? '#0284c7' : '#f1f5f9',
                  color: isActive ? '#ffffff' : '#64748b',
                  lineHeight: 1,
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Notification List ── */}
      {loading && notifications.length === 0 ? (
        // Loading Skeleton
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3, 4].map(idx => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '20px',
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: '#f1f5f9',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    width: '35%',
                    height: '14px',
                    borderRadius: '4px',
                    background: '#f1f5f9',
                    marginBottom: '8px',
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }}
                />
                <div
                  style={{
                    width: '65%',
                    height: '12px',
                    borderRadius: '4px',
                    background: '#f8fafc',
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        // Empty State
        <div
          style={{
            textAlign: 'center',
            padding: '64px 24px',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px dashed #cbd5e1',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '28px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              marginBottom: '16px',
            }}
          >
            <CheckCircle2 size={28} />
          </div>
          <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#1e293b', margin: '0 0 6px' }}>
            No notifications found
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '380px', margin: '0 auto 20px' }}>
            {activeFilter === 'ALL'
              ? 'You are all caught up! Updates regarding your orders and shipments will appear here.'
              : `There are currently no notifications matching the "${filterTabs.find(t => t.id === activeFilter)?.label}" filter.`}
          </p>
          {activeFilter !== 'ALL' && (
            <button
              onClick={() => setActiveFilter('ALL')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <Filter size={14} />
              <span>Show all notifications</span>
            </button>
          )}
        </div>
      ) : (
        // Grouped Notifications
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {(['Today', 'Yesterday', 'Earlier'] as const).map(group => {
            const items = groupedNotifications[group];
            if (!items || items.length === 0) return null;

            return (
              <div key={group}>
                {/* Timeline Group Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '12px',
                    paddingLeft: '4px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#64748b',
                    }}
                  >
                    {group}
                  </span>
                  <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {items.length} update{items.length > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Items in this timeline group */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  {items.map(item => {
                    const category = getNotificationCategory(item);
                    const isUnread = !item.read;
                    const destinationRoute = getDestinationRoute(item);
                    const isMenuOpen = activeMenuId === item.id;
                    const isBusy = processingId === item.id;

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        style={{
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '16px',
                          padding: '16px 20px',
                          borderRadius: '12px',
                          background: isUnread ? '#ffffff' : '#f8fafc',
                          border: isUnread ? '1px solid #bae6fd' : '1px solid #e2e8f0',
                          boxShadow: isUnread
                            ? '0 3px 12px rgba(2, 132, 199, 0.08)'
                            : '0 1px 3px rgba(0,0,0,0.02)',
                          cursor: destinationRoute ? 'pointer' : 'default',
                          transition: 'all 0.18s ease',
                          opacity: isBusy ? 0.6 : 1,
                        }}
                      >
                        {/* Unread dot indicator */}
                        <div
                          style={{
                            position: 'absolute',
                            left: '8px',
                            top: '24px',
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            backgroundColor: isUnread ? '#0284c7' : 'transparent',
                            boxShadow: isUnread ? '0 0 0 2px rgba(2, 132, 199, 0.2)' : 'none',
                          }}
                        />

                        {/* Category Icon */}
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            ...getCategoryBadgeStyle(category),
                          }}
                        >
                          {getCategoryIcon(category)}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0, paddingTop: '1px' }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '12px',
                              marginBottom: '4px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <h4
                                style={{
                                  fontSize: '14px',
                                  fontWeight: isUnread ? 700 : 600,
                                  color: isUnread ? '#0f172a' : '#334155',
                                  margin: 0,
                                }}
                              >
                                {item.title || 'System Notification'}
                              </h4>
                              <span
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  padding: '2px 7px',
                                  borderRadius: '6px',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.04em',
                                  ...getCategoryBadgeStyle(category),
                                }}
                              >
                                {category}
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '12px',
                                  color: '#64748b',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                <Clock size={12} />
                                {formatRelativeTime(item.createdAt)}
                              </span>

                              {/* Action Menu Trigger */}
                              <div style={{ position: 'relative' }}>
                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation();
                                    setActiveMenuId(isMenuOpen ? null : item.id);
                                  }}
                                  style={{
                                    border: 'none',
                                    background: 'transparent',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                  title="Options"
                                >
                                  <MoreVertical size={16} />
                                </button>

                                {/* Dropdown Menu */}
                                {isMenuOpen && (
                                  <div
                                    onClick={e => e.stopPropagation()}
                                    style={{
                                      position: 'absolute',
                                      right: 0,
                                      top: '26px',
                                      width: '160px',
                                      background: '#ffffff',
                                      borderRadius: '8px',
                                      boxShadow: '0 8px 24px rgba(15, 23, 42, 0.14)',
                                      border: '1px solid #e2e8f0',
                                      zIndex: 20,
                                      padding: '4px',
                                    }}
                                  >
                                    {isUnread && (
                                      <button
                                        type="button"
                                        onClick={e => handleMarkAsRead(item, e)}
                                        style={{
                                          width: '100%',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '8px',
                                          padding: '8px 12px',
                                          border: 'none',
                                          background: 'transparent',
                                          color: '#334155',
                                          fontSize: '12px',
                                          fontWeight: 500,
                                          borderRadius: '6px',
                                          cursor: 'pointer',
                                          textAlign: 'left',
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                      >
                                        <Check size={14} style={{ color: '#0284c7' }} />
                                        <span>Mark as read</span>
                                      </button>
                                    )}

                                    <button
                                      type="button"
                                      onClick={e => handleDelete(item, e)}
                                      style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '8px 12px',
                                        border: 'none',
                                        background: 'transparent',
                                        color: '#ef4444',
                                        fontSize: '12px',
                                        fontWeight: 500,
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                      }}
                                      onMouseEnter={e => (e.currentTarget.style.background = '#fee2e2')}
                                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                    >
                                      <Trash2 size={14} />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <p
                            style={{
                              margin: '0 0 8px',
                              fontSize: '13px',
                              color: isUnread ? '#334155' : '#64748b',
                              lineHeight: '1.5',
                              wordBreak: 'break-word',
                            }}
                          >
                            {item.message}
                          </p>

                          {/* Quick destination link */}
                          {destinationRoute && (
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '11px',
                                fontWeight: 600,
                                color: '#0284c7',
                              }}
                            >
                              <span>View details</span>
                              <ArrowRight size={11} />
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
