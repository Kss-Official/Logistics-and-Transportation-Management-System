import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, Truck, CheckCircle2, Clock, Plus, Search,
  FileText, MapPin, ChevronRight, Eye, RefreshCw
} from 'lucide-react';
import KpiCard from '../../components/common/KpiCard';
import StatusBadge from '../../components/common/StatusBadge';
import OrdersStatusDonut from '../../components/dashboard/OrdersStatusDonut';
import OrderDetailDrawer from '../../components/orders/OrderDetailDrawer';
import { EmptyState } from '../../components/common/States';
import { useAuth } from '../../context/AuthContext';
import { formatDisplayName } from '../../services/authService';
import {
  getCustomerDashboardStats,
  getAllOrders,
  type CustomerDashboardData
} from '../../services/orderService';
import { shipmentService } from '../../services/shipmentService';
import type { Order } from '../../types/order';
import type { ShipmentSummary } from '../../types/shipment';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState<CustomerDashboardData | null>(null);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [shipments, setShipments] = useState<ShipmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackQuery, setTrackQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const displayName = formatDisplayName(user?.name, user?.email);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const [dashData, ordersData, shipmentsData] = await Promise.all([
        getCustomerDashboardStats(),
        getAllOrders().catch(() => []),
        shipmentService.getAllShipments().catch(() => []),
      ]);
      setStats(dashData);
      setAllOrders(ordersData);
      setShipments(shipmentsData);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackQuery.trim()) {
      navigate(`/customer/track?id=${encodeURIComponent(trackQuery.trim())}`);
    } else {
      navigate('/customer/track');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px 0' }}>
        {/* Welcome Skeleton */}
        <div style={{ height: 100, background: '#e2e8f0', borderRadius: 14, marginBottom: 24, animation: 'pulse 1.5s infinite' }} />
        {/* KPI Grid Skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ height: 110, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }} />
          ))}
        </div>
        {/* Quick Action Skeleton */}
        <div style={{ height: 180, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12 }} />
      </div>
    );
  }

  const safeOrders = Array.isArray(allOrders) ? allOrders : [];
  const safeShipments = Array.isArray(shipments) ? shipments : [];
  const safeRecent = Array.isArray(stats?.recentOrders) ? stats.recentOrders : safeOrders.slice(0, 5);

  const totalOrders = stats?.totalOrders ?? safeOrders.length;
  const pendingOrders = stats?.pendingOrders ?? safeOrders.filter(o => o && o.status === 'PENDING').length;
  const deliveredShipments = stats?.deliveredShipments ?? safeOrders.filter(o => o && o.status === 'DELIVERED').length;
  const recentOrders = safeRecent;

  // Derive distribution from backend stats map or authenticated customer's loaded orders
  const distribution: Record<string, number> = {};
  if (stats?.ordersByStatus && typeof stats.ordersByStatus === 'object') {
    Object.assign(distribution, stats.ordersByStatus);
  } else if (safeOrders.length > 0) {
    safeOrders.forEach((o) => {
      if (o && o.status) {
        const st = String(o.status).toUpperCase();
        distribution[st] = (distribution[st] || 0) + 1;
      }
    });
  }

  // Determine active shipments (status neither DELIVERED nor CANCELLED)
  const activeShipmentList = safeShipments.filter(
    (s) => s && s.status !== 'DELIVERED' && s.status !== 'CANCELLED'
  );
  const activeShipments = stats?.activeShipments ?? activeShipmentList.length;

  return (
    <div>
      {/* Enterprise Operational Welcome Banner */}
      <div
        className="welcome-banner"
        style={{
          background: 'linear-gradient(135deg, #0a0f1d 0%, #1e293b 50%, #0f172a 100%)',
          color: '#ffffff',
          padding: '16px 22px',
          borderRadius: 12,
          boxShadow: '0 6px 20px -4px rgba(10, 15, 29, 0.22)',
          marginBottom: 16,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 620 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 4px', color: '#ffffff', letterSpacing: '-0.02em' }}>
            Welcome back, <span style={{ color: '#60a5fa' }}>{displayName}</span> 👋
          </h2>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
            Overview of your logistics activity.
          </p>
        </div>
      </div>

      {/* Top 4 Dynamic KPI Cards */}
      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        <KpiCard
          label="Total Orders"
          value={totalOrders}
          icon={<Package size={20} />}
          color="blue"
        />
        <KpiCard
          label="Pending"
          value={pendingOrders}
          icon={<Clock size={20} />}
          color="amber"
        />
        <KpiCard
          label="In Transit"
          value={activeShipments}
          icon={<Truck size={20} />}
          color="indigo"
        />
        <KpiCard
          label="Delivered"
          value={deliveredShipments}
          icon={<CheckCircle2 size={20} />}
          color="green"
        />
      </div>

      {/* Quick Actions Grid */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h3 className="section-title" style={{ margin: 0 }}>Logistics Quick Actions</h3>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Fast track workflows</span>
      </div>

      <div className="quick-action-grid" style={{ marginBottom: 16 }}>
        <div className="quick-action-card blue" onClick={() => navigate('/customer/orders/create')}>
          <div className="quick-action-icon blue"><Plus size={20} /></div>
          <p className="quick-action-title">Create New Order</p>
          <p className="quick-action-desc">Book rapid freight or parcel linehaul</p>
        </div>

        <div className="quick-action-card amber" onClick={() => navigate('/customer/track')}>
          <div className="quick-action-icon amber"><Search size={20} /></div>
          <p className="quick-action-title">Track Shipment</p>
          <p className="quick-action-desc">Corridor waypoint milestones & telemetry</p>
        </div>

        <div className="quick-action-card green" onClick={() => navigate('/customer/orders/create')}>
          <div className="quick-action-icon green"><Truck size={20} /></div>
          <p className="quick-action-title">Get Shipping Quote</p>
          <p className="quick-action-desc">Instant dynamic rate calculations</p>
        </div>

        <div className="quick-action-card indigo" onClick={() => navigate('/customer/invoices')}>
          <div className="quick-action-icon indigo"><FileText size={20} /></div>
          <p className="quick-action-title">Download Invoices</p>
          <p className="quick-action-desc">Access GST billing & payment receipts</p>
        </div>
      </div>

      {/* Main Content Grid (Track Card + Recent Orders) */}
      <div className="grid-2" style={{ marginBottom: 16 }}>
        {/* Track Your Shipment Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Track Your Shipment</h3>
              <p className="card-subtitle">Enter your tracking code for real-time status updates</p>
            </div>
          </div>
          <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <form onSubmit={handleTrackSubmit} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input
                type="text"
                className="form-input font-mono"
                placeholder="e.g. PR-ORD-000123"
                value={trackQuery}
                onChange={(e) => setTrackQuery(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                Track
              </button>
            </form>

            <div className="map-placeholder" style={{ height: 115 }}>
              <div className="map-placeholder-dots" />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, zIndex: 1 }}>
                <MapPin size={20} color="var(--primary)" />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Live GPS Telemetry Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders List */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Recent Orders</h3>
              <p className="card-subtitle">Your booking history</p>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/customer/orders')}
              style={{ color: 'var(--primary)', fontWeight: 600 }}
            >
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {recentOrders.length === 0 ? (
              <EmptyState
                title="No orders yet"
                description="You haven't placed any consignment orders yet."
                action={
                  <button className="btn btn-primary btn-sm" onClick={() => navigate('/customer/orders/create')}>
                    <Plus size={14} /> Create Order
                  </button>
                }
              />
            ) : (
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Destination</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.slice(0, 5).map((order) => (
                      <tr key={order.id}>
                        <td className="td-mono">{order.orderNumber || order.id}</td>
                        <td className="truncate" style={{ maxWidth: 160 }}>{order.deliveryAddress || '—'}</td>
                        <td><StatusBadge status={order.status} /></td>
                        <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                              })
                            : (order.date || '—')}
                        </td>
                        <td>
                          <button
                            className="btn-icon"
                            title="View Order"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Shipment Status & Active Shipments Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)', gap: 16, marginBottom: 16 }}>
        <OrdersStatusDonut
          total={totalOrders}
          ordersByStatus={distribution}
          isLoading={loading}
        />

        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Active Shipments</h3>
              <p className="card-subtitle">Active dispatch progress</p>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/customer/shipments')}
              style={{ color: 'var(--primary)', fontWeight: 600 }}
            >
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="card-body" style={{ padding: (activeShipments === 0 && activeShipmentList.length === 0) ? '24px' : 0 }}>
            {activeShipments === 0 && activeShipmentList.length === 0 ? (
              <EmptyState
                title="No active shipments"
                description="There are currently no active shipments in transit for your account."
              />
            ) : (
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Tracking Number</th>
                      <th>Destination</th>
                      <th>Current Status</th>
                      <th>Expected Delivery</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeShipmentList.length > 0 ? (
                      activeShipmentList.map((s) => (
                        <tr key={s.id}>
                          <td className="td-mono">{s.trackingNumber || `TRK-${s.id}`}</td>
                          <td className="td-primary truncate" style={{ maxWidth: 180 }}>{s.destination || '—'}</td>
                          <td><StatusBadge status={s.status || 'PENDING'} /></td>
                          <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                            {s.estimatedDeliveryDate ? String(s.estimatedDeliveryDate) : '2-3 Business Days'}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              className="btn btn-primary btn-xs"
                              style={{ padding: '4px 10px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                              onClick={() => navigate(`/customer/track?id=${s.trackingNumber || s.orderNumber}`)}
                              title="Live Track"
                            >
                              Track
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      recentOrders.filter(o => o && o.status !== 'CANCELLED' && o.status !== 'DELIVERED').map((s) => (
                        <tr key={s.id}>
                          <td className="td-mono">{s.orderNumber || String(s.id)}</td>
                          <td className="td-primary truncate" style={{ maxWidth: 180 }}>{s.deliveryAddress || '—'}</td>
                          <td><StatusBadge status={s.status || 'PENDING'} /></td>
                          <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                            2-3 Business Days
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              className="btn btn-primary btn-xs"
                              style={{ padding: '4px 10px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                              onClick={() => navigate(`/customer/track?id=${s.orderNumber}`)}
                              title="Live Track"
                            >
                              Track
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Detail Drawer */}
      <OrderDetailDrawer
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}

