import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  warehousePortalService, 
  type WarehouseNotificationDTO 
} from '../../services/warehousePortalService';
import { 
  Bell, 
  CheckCheck, 
  Clock, 
  AlertTriangle, 
  Package, 
  Truck, 
  RefreshCw, 
  CheckCircle2,
  Filter,
  Search,
  ArrowRight,
  ShieldAlert,
  Info,
  ExternalLink
} from 'lucide-react';
import { useToast } from '../../components/common/Toast';

export const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState<WarehouseNotificationDTO[]>([]);
  const [readIds, setReadIds] = useState<Set<string | number>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'STOCK' | 'SHIPMENT'>('ALL');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    fetchNotifications();

    const handleUpdated = () => {
      fetchNotifications();
    };
    window.addEventListener('warehouse-notifications:updated', handleUpdated);
    window.addEventListener('notifications:updated', handleUpdated);

    return () => {
      window.removeEventListener('warehouse-notifications:updated', handleUpdated);
      window.removeEventListener('notifications:updated', handleUpdated);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await warehousePortalService.getNotifications();
      setNotifications(data || []);
    } catch (err: unknown) {
      console.error('Failed to load notifications:', err);
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e.response?.data?.message || 'Unable to load operational notifications.');
    } finally {
      setLoading(false);
    }
  };

  const isNotificationRead = (item: WarehouseNotificationDTO): boolean => {
    return Boolean(item.read || item.isRead || readIds.has(item.id));
  };

  const markAsRead = async (id: string | number) => {
    setReadIds((prev) => new Set([...prev, id]));
    await warehousePortalService.markNotificationRead(id);
    window.dispatchEvent(new CustomEvent('warehouse-notifications:updated'));
    window.dispatchEvent(new CustomEvent('notifications:updated'));
    showToast('info', 'Notification Marked', 'Alert marked as acknowledged.');
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !isNotificationRead(n));
    if (unread.length === 0) return;

    const allIds = notifications.map((n) => n.id);
    setReadIds(new Set(allIds));
    try {
      await warehousePortalService.markAllNotificationsRead();
    } catch {
      await Promise.all(unread.map((n) => warehousePortalService.markNotificationRead(n.id)));
    }
    window.dispatchEvent(new CustomEvent('warehouse-notifications:updated'));
    window.dispatchEvent(new CustomEvent('notifications:updated'));
    showToast('success', 'All Acknowledged', 'All operational alerts marked as read.');
  };

  // Metrics Summary
  const summary = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter((n) => !isNotificationRead(n)).length;
    const stockAlerts = notifications.filter((n) => {
      const t = (n.type || '').toUpperCase();
      return t.includes('STOCK') || t.includes('WARNING') || t.includes('INVENTORY');
    }).length;
    const shipmentAlerts = notifications.filter((n) => {
      const t = (n.type || '').toUpperCase();
      return t.includes('SHIPMENT') || t.includes('DISPATCH') || t.includes('SUCCESS') || t.includes('INFO');
    }).length;

    return { total, unread, stockAlerts, shipmentAlerts };
  }, [notifications, readIds]);

  // Filtered and Searched list
  const filteredList = useMemo(() => {
    const term = search.toLowerCase().trim();

    return notifications.filter((item) => {
      const read = isNotificationRead(item);
      const type = (item.type || '').toUpperCase();

      if (filter === 'UNREAD' && read) return false;
      if (filter === 'STOCK' && !type.includes('STOCK') && !type.includes('WARNING') && !type.includes('INVENTORY')) return false;
      if (filter === 'SHIPMENT' && !type.includes('SHIPMENT') && !type.includes('DISPATCH') && !type.includes('SUCCESS') && !type.includes('INFO')) return false;

      if (term) {
        const titleMatch = (item.title || '').toLowerCase().includes(term);
        const msgMatch = (item.message || '').toLowerCase().includes(term);
        const idMatch = String(item.id || '').toLowerCase().includes(term);
        return titleMatch || msgMatch || idMatch;
      }

      return true;
    });
  }, [notifications, filter, search, readIds]);

  const getIconForNotification = (type: string) => {
    const t = (type || '').toUpperCase();
    if (t.includes('WARNING') || t.includes('STOCK') || t.includes('CRITICAL')) {
      return <AlertTriangle size={18} color="#d97706" />;
    }
    if (t.includes('SUCCESS') || t.includes('SHIPMENT') || t.includes('INBOUND')) {
      return <Truck size={18} color="#059669" />;
    }
    if (t.includes('DISPATCH')) {
      return <Package size={18} color="#059669" />;
    }
    return <Bell size={18} color="#059669" />;
  };

  const getSeverityBadge = (type: string) => {
    const t = (type || '').toUpperCase();
    if (t.includes('CRITICAL') || t === 'DANGER') {
      return <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 4, backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>CRITICAL</span>;
    }
    if (t.includes('WARNING') || t.includes('STOCK')) {
      return <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 4, backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}>WARNING</span>;
    }
    if (t.includes('SUCCESS') || t.includes('INBOUND')) {
      return <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 4, backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>INBOUND</span>;
    }
    return <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 4, backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>INFO</span>;
  };

  const formatNotificationTime = (createdAt?: string): string => {
    if (!createdAt) return 'Just now';
    try {
      const d = new Date(createdAt);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - d.getTime()) / (1000 * 60));

      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return createdAt;
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
        <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 16px', color: '#059669' }} />
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
          Loading Operational Alerts...
        </h3>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
          Querying stock reorder thresholds and live inbound freight intake.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1140, margin: '0 auto', padding: '24px 32px 40px', boxSizing: 'border-box' }} className="space-y-6">
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ padding: 6, borderRadius: 8, backgroundColor: '#ecfdf5', color: '#059669', display: 'flex' }}>
              <Bell size={20} />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              Operational Notifications
            </h1>
          </div>
          <p style={{ fontSize: 13.5, color: '#64748b', margin: 0 }}>
            Alerts and updates requiring warehouse attention.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {summary.unread > 0 && (
            <button
              type="button"
              className="wh-btn wh-btn-outline"
              onClick={markAllAsRead}
              style={{ fontSize: 13, gap: 6, padding: '8px 14px' }}
              id="mark-all-read-btn"
            >
              <CheckCheck size={15} /> Mark all as read ({summary.unread})
            </button>
          )}
          <button
            type="button"
            className="wh-btn wh-btn-primary"
            onClick={fetchNotifications}
            style={{ fontSize: 13, gap: 6, padding: '8px 14px' }}
            id="refresh-notifications-btn"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', borderRadius: 8, backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {/* ── Summary Chips ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <div
          onClick={() => setFilter('ALL')}
          style={{
            cursor: 'pointer',
            padding: '14px 18px',
            borderRadius: 10,
            backgroundColor: '#ffffff',
            border: `2px solid ${filter === 'ALL' ? '#059669' : '#e2e8f0'}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>
            Total Alerts
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
            {summary.total}
          </div>
          <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
            All active hub notifications
          </div>
        </div>

        <div
          onClick={() => setFilter('UNREAD')}
          style={{
            cursor: 'pointer',
            padding: '14px 18px',
            borderRadius: 10,
            backgroundColor: '#ffffff',
            border: `2px solid ${filter === 'UNREAD' ? '#059669' : '#e2e8f0'}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase', marginBottom: 4 }}>
            Unread Alerts
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#059669' }}>
            {summary.unread}
          </div>
          <div style={{ fontSize: 11.5, color: '#059669', marginTop: 2, fontWeight: 600 }}>
            Requiring review & signoff
          </div>
        </div>

        <div
          onClick={() => setFilter('STOCK')}
          style={{
            cursor: 'pointer',
            padding: '14px 18px',
            borderRadius: 10,
            backgroundColor: '#ffffff',
            border: `2px solid ${filter === 'STOCK' ? '#059669' : '#e2e8f0'}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: '#d97706', textTransform: 'uppercase', marginBottom: 4 }}>
            Stock Warnings
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#d97706' }}>
            {summary.stockAlerts}
          </div>
          <div style={{ fontSize: 11.5, color: '#b45309', marginTop: 2 }}>
            Below reorder threshold
          </div>
        </div>

        <div
          onClick={() => setFilter('SHIPMENT')}
          style={{
            cursor: 'pointer',
            padding: '14px 18px',
            borderRadius: 10,
            backgroundColor: '#ffffff',
            border: `2px solid ${filter === 'SHIPMENT' ? '#059669' : '#e2e8f0'}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase', marginBottom: 4 }}>
            Shipment Alerts
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#059669' }}>
            {summary.shipmentAlerts}
          </div>
          <div style={{ fontSize: 11.5, color: '#047857', marginTop: 2 }}>
            Outbound staging & dispatch
          </div>
        </div>
      </div>

      {/* ── Toolbar: Search & Filter Tabs ── */}
      <div
        className="card"
        style={{
          padding: '14px 18px',
          background: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 14,
        }}
      >
        <div style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Filter notifications by SKU, product, tracking #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 32, fontSize: 13 }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Filter size={14} color="#64748b" style={{ marginRight: 4 }} />
          {[
            { key: 'ALL', label: `All (${summary.total})` },
            { key: 'UNREAD', label: `Unread (${summary.unread})` },
            { key: 'STOCK', label: `Stock Alerts (${summary.stockAlerts})` },
            { key: 'SHIPMENT', label: `Shipments (${summary.shipmentAlerts})` },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key as any)}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid',
                borderColor: filter === tab.key ? '#059669' : '#cbd5e1',
                backgroundColor: filter === tab.key ? '#ecfdf5' : '#ffffff',
                color: filter === tab.key ? '#047857' : '#475569',
                fontSize: 12,
                fontWeight: filter === tab.key ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Notifications Feed ── */}
      <div className="space-y-3">
        {filteredList.length === 0 ? (
          <div className="card" style={{ padding: '60px 20px', textAlign: 'center', background: '#ffffff' }}>
            <CheckCircle2 size={40} color="#10b981" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
              All caught up
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
              No operational alerts require your attention matching current filter criteria.
            </p>
          </div>
        ) : (
          filteredList.map((item) => {
            const read = isNotificationRead(item);
            const isStock = (item.type || '').toUpperCase().includes('STOCK') || (item.type || '').toUpperCase().includes('WARNING');
            const isShipment = (item.type || '').toUpperCase().includes('SHIPMENT') || (item.type || '').toUpperCase().includes('INBOUND') || (item.type || '').toUpperCase().includes('SUCCESS');

            return (
              <div
                key={item.id}
                className="card"
                style={{
                  padding: '16px 20px',
                  backgroundColor: read ? '#ffffff' : '#f8fafc',
                  border: `1px solid ${read ? '#e2e8f0' : '#a7f3d0'}`,
                  boxShadow: read ? '0 1px 2px rgba(0,0,0,0.03)' : '0 2px 6px rgba(5,150,105,0.06)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 16,
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Icon Container */}
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    backgroundColor: read ? '#f1f5f9' : '#ecfdf5',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {getIconForNotification(item.type)}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {getSeverityBadge(item.type)}
                      <h4 style={{ fontSize: 14, fontWeight: read ? 600 : 700, color: '#0f172a', margin: 0 }}>
                        {item.title}
                      </h4>
                      {!read && (
                        <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#059669' }} title="Unread Alert" />
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: '#64748b' }}>
                      <Clock size={12} />
                      <span>{formatNotificationTime(item.createdAt)}</span>
                    </div>
                  </div>

                  <p style={{ fontSize: 13, color: read ? '#475569' : '#1e293b', margin: '4px 0 10px', lineHeight: 1.5 }}>
                    {item.message}
                  </p>

                  {/* Actions Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 8 }}>
                    <div style={{ display: 'flex', gap: 10 }}>
                      {isStock && (
                        <button
                          type="button"
                          onClick={() => navigate('/warehouse/inventory')}
                          style={{ border: 'none', background: 'none', color: '#059669', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer', padding: 0 }}
                        >
                          View Inventory <ArrowRight size={12} />
                        </button>
                      )}
                      {isShipment && (
                        <button
                          type="button"
                          onClick={() => navigate('/warehouse/orders')}
                          style={{ border: 'none', background: 'none', color: '#059669', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer', padding: 0 }}
                        >
                          View Allocated Orders <ArrowRight size={12} />
                        </button>
                      )}
                    </div>

                    {!read && (
                      <button
                        type="button"
                        onClick={() => markAsRead(item.id)}
                        style={{ border: 'none', background: 'none', color: '#64748b', fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Notifications;
