import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, Truck, Users, Wallet, ChevronRight,
  AlertOctagon, Clock, ShieldAlert, Building2, UserCheck, Wrench, AlertTriangle,
  RotateCw, AlertCircle, Headphones, CheckCircle2,
  ExternalLink, MapPin
} from 'lucide-react';
import KpiCard from '../../components/common/KpiCard';
import StatusBadge from '../../components/common/StatusBadge';
import ShipmentOverviewChart from '../../components/dashboard/ShipmentOverviewChart';
import OrdersStatusDonut from '../../components/dashboard/OrdersStatusDonut';
import RevenueChart from '../../components/dashboard/RevenueChart';
import DeliveryPerformanceChart from '../../components/dashboard/DeliveryPerformanceChart';
import adminDashboardService from '../../services/adminDashboardService';
import type { AdminDashboardSummary, ShipmentTrendPoint } from '../../types/adminDashboard';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [trends, setTrends] = useState<ShipmentTrendPoint[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(7);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTrendsLoading, setIsTrendsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchSummaryData = useCallback(async () => {
    try {
      setErrorMessage(null);
      const data = await adminDashboardService.getSummary();
      setSummary(data);
    } catch (err: any) {
      console.error('Failed to fetch admin dashboard summary:', err);
      setErrorMessage(
        err?.response?.data?.message ||
        'Unable to load dashboard telemetry. Please ensure the backend service is operational.'
      );
    }
  }, []);

  const fetchTrendData = useCallback(async (days: number) => {
    try {
      setIsTrendsLoading(true);
      const trendData = await adminDashboardService.getShipmentTrends(days);
      setTrends(trendData);
    } catch (err: any) {
      console.error('Failed to fetch shipment trends:', err);
    } finally {
      setIsTrendsLoading(false);
    }
  }, []);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchSummaryData(), fetchTrendData(selectedPeriod)]);
    setIsLoading(false);
  }, [fetchSummaryData, fetchTrendData, selectedPeriod]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchSummaryData(), fetchTrendData(selectedPeriod)]);
    setIsRefreshing(false);
  };

  const handlePeriodChange = (days: number) => {
    setSelectedPeriod(days);
    fetchTrendData(days);
  };

  return (
    <div>
      {/* Operations Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Enterprise Operations Dashboard
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Real-time multi-modal logistics monitoring, fleet telemetry, and commercial billing metrics.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            title="Refresh dashboard metrics"
          >
            <RotateCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 16px',
            marginBottom: 20,
            borderRadius: 8,
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: 'var(--danger)',
            fontSize: 13,
          }}
        >
          <AlertCircle size={18} />
          <span style={{ flex: 1 }}>{errorMessage}</span>
          <button
            className="btn btn-danger btn-sm"
            onClick={handleRefresh}
            style={{ padding: '4px 10px', fontSize: 12 }}
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Top 4 Primary Operational KPI Cards */}
      <div className="kpi-grid" style={{ marginBottom: 20 }}>
        <KpiCard
          label="Total Orders"
          value={isLoading ? '...' : (summary?.totalOrders ?? 0)}
          subtitle="Customer freight bookings"
          icon={<Package size={20} />}
          color="blue"
        />
        <KpiCard
          label="Active Shipments"
          value={isLoading ? '...' : (summary?.totalShipments ?? 0)}
          subtitle="Consignments in network"
          icon={<Truck size={20} />}
          color="indigo"
        />
        <KpiCard
          label="Operational Hubs"
          value={isLoading ? '...' : (summary?.activeWarehouses ?? 0)}
          subtitle="Active fulfillment centers"
          icon={<Building2 size={20} />}
          color="purple"
        />
        <KpiCard
          label="Available Fleet"
          value={isLoading ? '...' : `${summary?.availableVehicles ?? 0} Units`}
          subtitle={`${summary?.availableDrivers ?? 0} drivers on standby`}
          icon={<UserCheck size={20} />}
          color="green"
        />
      </div>

      {/* Dynamic Needs Attention Section */}
      {summary?.needsAttention && summary.needsAttention.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Requires Attention ({summary.needsAttention.reduce((acc, item) => acc + item.count, 0)})
              </h3>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
            {summary.needsAttention.map((item) => {
              const isCrit = item.severity === 'CRITICAL';
              const isWarn = item.severity === 'WARNING';
              const borderColor = isCrit ? '#fecaca' : isWarn ? '#fde68a' : '#bfdbfe';
              const bgColor = isCrit ? '#fef2f2' : isWarn ? '#fffbeb' : '#eff6ff';
              const badgeBg = isCrit ? '#dc2626' : isWarn ? '#d97706' : '#2563eb';

              return (
                <div
                  key={item.key}
                  className="card"
                  style={{
                    padding: '12px 14px',
                    margin: 0,
                    border: `1px solid ${borderColor}`,
                    backgroundColor: bgColor,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    borderRadius: 8,
                  }}
                  onClick={() => navigate(item.link)}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{item.title}</span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: 10,
                          color: '#fff',
                          backgroundColor: badgeBg,
                        }}
                      >
                        {item.count}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: '#475569', margin: 0, lineHeight: 1.35 }}>
                      {item.description}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: 8, fontSize: 11.5, fontWeight: 600, color: '#2563eb' }}>
                    <span>Resolve Action →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18, marginBottom: 20 }}>
        <ShipmentOverviewChart
          data={trends}
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
          isLoading={isTrendsLoading}
        />
        <OrdersStatusDonut
          total={summary?.totalOrders ?? 0}
          ordersByStatus={summary?.ordersByStatus ?? {}}
          isLoading={isLoading}
        />
      </div>

      {/* Operational Highlights Split (Real Orders & Real Shipments) */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Recent Orders Table */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Recent Orders</h3>
              <p className="card-subtitle">Real-time customer freight requests</p>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/admin/orders')}
              style={{ color: 'var(--primary)', fontWeight: 600 }}
            >
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container table-scroll" style={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
              <table className="data-table" style={{ minWidth: 540 }}>
                <thead>
                  <tr style={{ whiteSpace: 'nowrap' }}>
                    <th style={{ whiteSpace: 'nowrap' }}>Order Number</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Customer</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Date</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Status</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Amount</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                        Loading real orders from database...
                      </td>
                    </tr>
                  ) : !summary?.recentOrders || summary.recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: 28, color: 'var(--text-muted)' }}>
                        No orders recorded in the system yet.
                      </td>
                    </tr>
                  ) : (
                    summary.recentOrders.map((order) => {
                      const formattedDate = order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })
                        : '—';
                      return (
                        <tr key={order.id} className="hover:bg-slate-50">
                          <td className="td-mono font-semibold text-primary">{order.orderNumber}</td>
                          <td className="td-primary">
                            <div>
                              <div style={{ fontWeight: 600 }}>{order.customerName}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{order.destination}</div>
                            </div>
                          </td>
                          <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{formattedDate}</td>
                          <td><StatusBadge status={order.status} /></td>
                          <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            ₹{Number(order.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td>
                            <button
                              className="btn btn-ghost btn-xs"
                              title="Go to Orders Management"
                              onClick={() => navigate('/admin/orders')}
                              style={{ color: 'var(--primary)', padding: '2px 6px' }}
                            >
                              <ExternalLink size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Shipments Table */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Recent Shipments</h3>
              <p className="card-subtitle">Active transit linehauls</p>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/admin/shipments')}
              style={{ color: 'var(--primary)', fontWeight: 600 }}
            >
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container table-scroll" style={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
              <table className="data-table" style={{ minWidth: 440 }}>
                <thead>
                  <tr style={{ whiteSpace: 'nowrap' }}>
                    <th style={{ whiteSpace: 'nowrap' }}>Tracking No.</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Route</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Current Hub</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                        Loading real shipments from database...
                      </td>
                    </tr>
                  ) : !summary?.recentShipments || summary.recentShipments.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: 28, color: 'var(--text-muted)' }}>
                        No shipments created in the system yet.
                      </td>
                    </tr>
                  ) : (
                    summary.recentShipments.map((shipment) => (
                      <tr key={shipment.id} className="hover:bg-slate-50">
                        <td className="td-mono font-semibold text-primary">{shipment.trackingNumber}</td>
                        <td className="td-primary">{shipment.route}</td>
                        <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <MapPin size={12} color="var(--primary)" />
                            {shipment.currentLocation}
                          </span>
                        </td>
                        <td><StatusBadge status={shipment.status} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom 4 Genuine Telemetry Panels */}
      <div className="grid-4">
        {/* Dynamic Top Routes */}
        <div className="card">
          <div className="card-header" style={{ paddingBottom: 12 }}>
            <h4 className="card-title">Top Routes</h4>
          </div>
          <div className="card-body" style={{ paddingTop: 0 }}>
            {isLoading ? (
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Loading routes...</p>
            ) : !summary?.topRoutes || summary.topRoutes.length === 0 ? (
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No routes recorded yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {summary.topRoutes.map((r) => (
                  <div key={r.route} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 170 }} title={r.route}>
                      {r.route}
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {r.shipments} {r.shipments === 1 ? 'dispatch' : 'dispatches'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Top Customers */}
        <div className="card">
          <div className="card-header" style={{ paddingBottom: 12 }}>
            <h4 className="card-title">Top Customers</h4>
          </div>
          <div className="card-body" style={{ paddingTop: 0 }}>
            {isLoading ? (
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Loading customers...</p>
            ) : !summary?.topCustomers || summary.topCustomers.length === 0 ? (
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No customers with bookings yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {summary.topCustomers.map((c) => (
                  <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }} title={c.name}>
                      {c.name}
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {c.orders} {c.orders === 1 ? 'order' : 'orders'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Support Tickets Overview */}
        <div className="card">
          <div className="card-header" style={{ paddingBottom: 12 }}>
            <h4 className="card-title">Customer Support</h4>
          </div>
          <div className="card-body" style={{ paddingTop: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>Total Inquiries</p>
                <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: '2px 0' }}>
                  {isLoading ? '...' : (summary?.totalTickets ?? 0)}
                </p>
                <p style={{ fontSize: 11, color: (summary?.openTickets ?? 0) > 0 ? 'var(--warning)' : 'var(--success)', marginTop: 4, fontWeight: 500 }}>
                  ● {summary?.openTickets ?? 0} Awaiting Resolution
                </p>
              </div>
              <div
                style={{
                  width: 50,
                  height: 50,
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                onClick={() => navigate('/admin/support')}
                title="View Support Desk"
              >
                <Headphones size={24} color="#dc2626" />
              </div>
            </div>
          </div>
        </div>

        {/* Fleet & Linehaul Telemetry */}
        <div className="card">
          <div className="card-header" style={{ paddingBottom: 12 }}>
            <h4 className="card-title">Fleet & Network</h4>
          </div>
          <div className="card-body" style={{ paddingTop: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>Active Shipments</p>
                <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: '2px 0' }}>
                  {isLoading ? '...' : (summary?.totalShipments ?? 0)}
                </p>
                <p style={{ fontSize: 11, color: 'var(--primary)', marginTop: 4, fontWeight: 500 }}>
                  ● Real-time Transit Telemetry
                </p>
              </div>
              <div
                style={{
                  width: 50,
                  height: 50,
                  background: 'var(--primary-light)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                onClick={() => navigate('/admin/shipments')}
                title="View Shipments"
              >
                <Truck size={24} color="var(--primary)" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
