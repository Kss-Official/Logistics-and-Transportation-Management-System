import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BarChart2,
  Download,
  Calendar,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  Truck,
  Package,
  Users,
  Clock,
  RefreshCw,
  AlertCircle,
  Warehouse as WarehouseIcon,
  Navigation,
  Award,
  DollarSign,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Percent,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { useToast } from '../../components/common/Toast';
import { reportService } from '../../services/reportService';
import type { ComprehensiveReport, ReportDateRange } from '../../types/report';

const STATUS_COLORS: Record<string, string> = {
  DELIVERED: '#16a34a',
  PAID: '#16a34a',
  IN_TRANSIT: '#2563eb',
  ACTIVE: '#2563eb',
  ASSIGNED: '#3b82f6',
  PICKED_UP: '#0284c7',
  OUT_FOR_DELIVERY: '#7c3aed',
  CONFIRMED: '#6366f1',
  PENDING: '#f59e0b',
  ISSUED: '#f59e0b',
  PARTIALLY_PAID: '#ea580c',
  OVERDUE: '#dc2626',
  CANCELLED: '#94a3b8',
  UNPAID: '#ef4444',
  AVAILABLE: '#10b981',
  ON_DUTY: '#2563eb',
  ON_DELIVERY: '#0284c7',
  ON_TRIP: '#7c3aed',
  OFF_DUTY: '#64748b',
  MAINTENANCE: '#f59e0b',
  INACTIVE: '#64748b',
};

const CHART_PALETTE = ['#2563eb', '#16a34a', '#f59e0b', '#7c3aed', '#06b6d4', '#ea580c', '#ec4899', '#64748b'];

export default function AdminReports() {
  const { showToast } = useToast();

  // State Management
  const [dateRange, setDateRange] = useState<ReportDateRange>('LAST_30_DAYS');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [activeTab, setActiveTab] = useState<
    'overview' | 'orders' | 'shipments' | 'fleet' | 'drivers' | 'routes' | 'warehouses' | 'customers' | 'financial'
  >('overview');

  const [reportData, setReportData] = useState<ComprehensiveReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  // Fetch Report Data
  const loadReports = useCallback(
    async (isSilent = false) => {
      try {
        if (!isSilent) setLoading(true);
        else setRefreshing(true);
        setError(null);

        const data = await reportService.getDashboardReport({
          range: dateRange,
          from: dateRange === 'CUSTOM' ? customFrom : undefined,
          to: dateRange === 'CUSTOM' ? customTo : undefined,
        });

        setReportData(data);
        setLastSyncedAt(new Date());
      } catch (err: any) {
        console.error('Failed to load logistics reports:', err);
        setError(err?.response?.data?.message || err?.message || 'Unable to retrieve logistics analytics from server.');
        showToast('error', 'Error Loading Reports', 'Could not sync analytics data.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [dateRange, customFrom, customTo, showToast]
  );

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Formatters
  const formatCurrency = (val?: number | null): string => {
    return `₹${Math.round(val || 0).toLocaleString('en-IN')}`;
  };

  const formatNumber = (val?: number | null): string => {
    return (val || 0).toLocaleString('en-IN');
  };

  // CSV Export Handler
  const handleExportCsv = () => {
    if (!reportData) return;

    let csvContent = '';
    let filename = `PrimeRoute_${activeTab.toUpperCase()}_Report_${reportData.dateRangeLabel.replace(/\s+/g, '_')}.csv`;

    if (activeTab === 'overview' && reportData.overview) {
      const rows = [
        ['Metric', 'Value'],
        ['Total Booking Orders', reportData.overview.totalOrders],
        ['Total Consignment Shipments', reportData.overview.totalShipments],
        ['Active In-Transit Shipments', reportData.overview.activeShipments],
        ['Delivered Consignments', reportData.overview.deliveredShipments],
        ['Pending Consignment Orders', reportData.overview.pendingOrders],
        ['Registered Commercial Customers', reportData.overview.totalCustomers],
        ['Active Drivers', reportData.overview.activeDrivers],
        ['Active Fleet Vehicles', reportData.overview.activeVehicles],
        ['Active Freight Routes', reportData.overview.activeRoutes],
        ['Warehouses Count', reportData.overview.warehouseCount],
        ['Total Invoiced Amount (INR)', reportData.overview.totalInvoiceValue],
        ['Total Paid Revenue (INR)', reportData.overview.totalPaidAmount],
        ['Outstanding Receivables (INR)', reportData.overview.outstandingAmount],
      ];
      csvContent = rows.map((r) => r.join(',')).join('\n');
    } else if (activeTab === 'orders' && reportData.orders) {
      const rows = [
        ['Date', 'Orders Count', 'Volume Amount (INR)'],
        ...(reportData.orders.trendSeries || []).map((t) => [t.date, t.orders, t.volume]),
      ];
      csvContent = rows.map((r) => r.join(',')).join('\n');
    } else if (activeTab === 'shipments' && reportData.shipments) {
      const rows = [
        ['Date', 'Delivered', 'In Transit', 'Pending', 'Cancelled', 'Total'],
        ...(reportData.shipments.trendSeries || []).map((t) => [
          t.date,
          t.delivered,
          t.inTransit,
          t.pending,
          t.cancelled,
          t.total,
        ]),
      ];
      csvContent = rows.map((r) => r.join(',')).join('\n');
    } else if (activeTab === 'fleet' && reportData.fleet) {
      const rows = [
        ['License Plate', 'Model', 'Type', 'Status', 'Capacity (Tons)', 'Assigned Driver', 'Assigned Route', 'Active Loads'],
        ...(reportData.fleet.vehicleRoster || []).map((v) => [
          `"${v.licensePlate}"`,
          `"${v.model}"`,
          v.type,
          v.status,
          v.capacityTons,
          `"${v.assignedDriver}"`,
          `"${v.assignedRoute}"`,
          v.activeLoads,
        ]),
      ];
      csvContent = rows.map((r) => r.join(',')).join('\n');
    } else if (activeTab === 'drivers' && reportData.drivers) {
      const rows = [
        ['Driver Name', 'License Number', 'Phone', 'Status', 'Assigned Vehicle', 'Assigned Route', 'Total Runs', 'On-Time Runs', 'SLA %', 'Rating'],
        ...(reportData.drivers.drivers || []).map((d) => [
          `"${d.name}"`,
          `"${d.licenseNumber}"`,
          `"${d.phone}"`,
          d.status,
          `"${d.assignedVehicle}"`,
          `"${d.assignedRoute}"`,
          d.totalRuns,
          d.onTimeRuns,
          `${d.onTimeRate}%`,
          d.rating,
        ]),
      ];
      csvContent = rows.map((r) => r.join(',')).join('\n');
    } else if (activeTab === 'routes' && reportData.routes) {
      const rows = [
        ['Route Name', 'Origin', 'Destination', 'Distance (km)', 'Est Hours', 'Assigned Driver', 'Assigned Vehicle', 'Active Loads', 'Total Shipments', 'Status'],
        ...(reportData.routes.routes || []).map((r) => [
          `"${r.routeName}"`,
          `"${r.origin}"`,
          `"${r.destination}"`,
          r.distanceKm,
          r.estimatedHours,
          `"${r.assignedDriver}"`,
          `"${r.assignedVehicle}"`,
          r.activeLoads,
          r.totalShipments,
          r.status,
        ]),
      ];
      csvContent = rows.map((r) => r.join(',')).join('\n');
    } else if (activeTab === 'warehouses' && reportData.warehouses) {
      const rows = [
        ['Code', 'Facility Name', 'Location', 'Facility Manager', 'Total Capacity (KG)', 'Used Capacity (KG)', 'Utilization %', 'Status', 'Type'],
        ...(reportData.warehouses.warehouses || []).map((w) => [
          `"${w.code}"`,
          `"${w.name}"`,
          `"${w.location}"`,
          `"${w.manager}"`,
          w.totalCapacity,
          w.usedCapacity,
          `${w.utilizationRate}%`,
          w.status,
          w.type,
        ]),
      ];
      csvContent = rows.map((r) => r.join(',')).join('\n');
    } else if (activeTab === 'customers' && reportData.customers) {
      const rows = [
        ['Customer Name', 'Company', 'Email', 'Order Count', 'Total Spent (INR)', 'Total Invoiced (INR)', 'Total Paid (INR)'],
        ...(reportData.customers.topCustomersByRevenue || []).map((c) => [
          `"${c.name}"`,
          `"${c.company}"`,
          `"${c.email}"`,
          c.orderCount,
          c.totalSpent,
          c.totalInvoiced,
          c.totalPaid,
        ]),
      ];
      csvContent = rows.map((r) => r.join(',')).join('\n');
    } else if (activeTab === 'financial' && reportData.financial) {
      const rows = [
        ['Month', 'Order Volume', 'Gross Revenue (INR)', 'Avg Per Order (INR)'],
        ...(reportData.financial.monthlyBreakdown || []).map((m) => [
          `"${m.month}"`,
          m.orders,
          m.revenue,
          m.avgPerOrder,
        ]),
      ];
      csvContent = rows.map((r) => r.join(',')).join('\n');
    }

    if (!csvContent) {
      showToast('warning', 'No Data', 'No records available to export for this section.');
      return;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('success', 'Export Complete', `${filename} generated successfully.`);
  };

  // Convert status map to array for Recharts
  const orderStatusChartData = useMemo(() => {
    if (!reportData?.orders?.statusDistribution) return [];
    return Object.entries(reportData.orders.statusDistribution)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({
        name: status.replace(/_/g, ' '),
        value: count,
        color: STATUS_COLORS[status] || '#64748b',
      }));
  }, [reportData]);

  const shipmentStatusChartData = useMemo(() => {
    if (!reportData?.shipments?.statusDistribution) return [];
    return Object.entries(reportData.shipments.statusDistribution)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({
        name: status.replace(/_/g, ' '),
        value: count,
        color: STATUS_COLORS[status] || '#64748b',
      }));
  }, [reportData]);

  const deliveryTypeChartData = useMemo(() => {
    if (!reportData?.orders?.deliveryTypeDistribution) return [];
    return Object.entries(reportData.orders.deliveryTypeDistribution).map(([type, count]) => ({
      name: type.replace(/_/g, ' '),
      count,
    }));
  }, [reportData]);

  const paymentMethodChartData = useMemo(() => {
    if (!reportData?.financial?.paymentMethodBreakdown) return [];
    return Object.entries(reportData.financial.paymentMethodBreakdown).map(([method, count]) => ({
      name: method.replace(/_/g, ' '),
      count,
    }));
  }, [reportData]);

  return (
    <div className="admin-reports-page space-y-6">
      {/* ── Executive Command Header Card ── */}
      <div
        className="card"
        style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          boxShadow: '0 4px 20px -4px rgba(15, 23, 42, 0.05)',
        }}
      >
        {/* Title, Subtitle & Action Toolbar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 20,
          }}
        >
          <div style={{ maxWidth: 640 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <h1
                style={{
                  fontSize: '26px',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  margin: 0,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.2,
                }}
              >
                Reports & Logistics Intelligence
              </h1>
              {refreshing && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '3px 10px',
                    borderRadius: 9999,
                    background: 'rgba(59, 130, 246, 0.1)',
                    color: 'var(--primary)',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                >
                  <RefreshCw size={11} className="animate-spin" /> Syncing...
                </span>
              )}
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Authoritative operational analytics, on-time SLA delivery metrics, fleet utilization, and revenue reconciliation across all enterprise systems.
            </p>
          </div>

          {/* Action Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            {/* Date Range Selector Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#ffffff',
                padding: '6px 12px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                height: 40,
              }}
            >
              <Calendar size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as ReportDateRange)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="TODAY">Today</option>
                <option value="YESTERDAY">Yesterday</option>
                <option value="LAST_7_DAYS">Last 7 Days</option>
                <option value="LAST_30_DAYS">Last 30 Days (Standard)</option>
                <option value="THIS_MONTH">This Month</option>
                <option value="LAST_MONTH">Last Month</option>
                <option value="THIS_YEAR">Year to Date (2026)</option>
                <option value="CUSTOM">Custom Date Range...</option>
              </select>
            </div>

            {dateRange === 'CUSTOM' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#ffffff',
                  padding: '4px 10px',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  height: 40,
                }}
              >
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  style={{ border: 'none', fontSize: '12px', outline: 'none', background: 'transparent' }}
                />
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>→</span>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  style={{ border: 'none', fontSize: '12px', outline: 'none', background: 'transparent' }}
                />
              </div>
            )}

            {/* Refresh Sync */}
            <button
              onClick={() => loadReports(true)}
              disabled={refreshing || loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                height: 40,
                padding: '0 14px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                background: '#ffffff',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: refreshing || loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                transition: 'all 0.15s ease',
              }}
              title="Refresh live telemetry"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} style={{ color: 'var(--primary)' }} />
              <span>Refresh</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={handleExportCsv}
              disabled={loading || !reportData}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                height: 40,
                padding: '0 16px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: loading || !reportData ? 'not-allowed' : 'pointer',
                boxShadow: '0 3px 10px rgba(37, 99, 235, 0.3)',
                transition: 'all 0.15s ease',
              }}
            >
              <FileSpreadsheet size={15} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Domain-Grouped Navigation Hub (No Scrollbars) ── */}
      <div
        className="card"
        style={{
          padding: '12px 16px',
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid var(--border)',
          boxShadow: '0 2px 10px -2px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          {/* Group 1: Operations */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                paddingRight: 4,
              }}
            >
              Operations
            </span>
            <button
              onClick={() => setActiveTab('overview')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: activeTab === 'overview' ? 600 : 500,
                color: activeTab === 'overview' ? '#ffffff' : 'var(--text-secondary)',
                background: activeTab === 'overview' ? 'var(--primary)' : '#f8fafc',
                border: activeTab === 'overview' ? '1px solid var(--primary)' : '1px solid var(--border)',
                boxShadow: activeTab === 'overview' ? '0 2px 8px rgba(37, 99, 235, 0.28)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Layers size={14} />
              <span>Operations Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: activeTab === 'orders' ? 600 : 500,
                color: activeTab === 'orders' ? '#ffffff' : 'var(--text-secondary)',
                background: activeTab === 'orders' ? 'var(--primary)' : '#f8fafc',
                border: activeTab === 'orders' ? '1px solid var(--primary)' : '1px solid var(--border)',
                boxShadow: activeTab === 'orders' ? '0 2px 8px rgba(37, 99, 235, 0.28)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Package size={14} />
              <span>Order Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('shipments')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: activeTab === 'shipments' ? 600 : 500,
                color: activeTab === 'shipments' ? '#ffffff' : 'var(--text-secondary)',
                background: activeTab === 'shipments' ? 'var(--primary)' : '#f8fafc',
                border: activeTab === 'shipments' ? '1px solid var(--primary)' : '1px solid var(--border)',
                boxShadow: activeTab === 'shipments' ? '0 2px 8px rgba(37, 99, 235, 0.28)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Clock size={14} />
              <span>Transit & SLA</span>
            </button>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 26, background: 'var(--border)', margin: '0 4px' }} />

          {/* Group 2: Fleet & Resources */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                paddingRight: 4,
              }}
            >
              Fleet & Resources
            </span>
            <button
              onClick={() => setActiveTab('fleet')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: activeTab === 'fleet' ? 600 : 500,
                color: activeTab === 'fleet' ? '#ffffff' : 'var(--text-secondary)',
                background: activeTab === 'fleet' ? 'var(--primary)' : '#f8fafc',
                border: activeTab === 'fleet' ? '1px solid var(--primary)' : '1px solid var(--border)',
                boxShadow: activeTab === 'fleet' ? '0 2px 8px rgba(37, 99, 235, 0.28)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Truck size={14} />
              <span>Fleet & Assets</span>
            </button>

            <button
              onClick={() => setActiveTab('drivers')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: activeTab === 'drivers' ? 600 : 500,
                color: activeTab === 'drivers' ? '#ffffff' : 'var(--text-secondary)',
                background: activeTab === 'drivers' ? 'var(--primary)' : '#f8fafc',
                border: activeTab === 'drivers' ? '1px solid var(--primary)' : '1px solid var(--border)',
                boxShadow: activeTab === 'drivers' ? '0 2px 8px rgba(37, 99, 235, 0.28)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Award size={14} />
              <span>Driver Performance</span>
            </button>

            <button
              onClick={() => setActiveTab('routes')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: activeTab === 'routes' ? 600 : 500,
                color: activeTab === 'routes' ? '#ffffff' : 'var(--text-secondary)',
                background: activeTab === 'routes' ? 'var(--primary)' : '#f8fafc',
                border: activeTab === 'routes' ? '1px solid var(--primary)' : '1px solid var(--border)',
                boxShadow: activeTab === 'routes' ? '0 2px 8px rgba(37, 99, 235, 0.28)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Navigation size={14} />
              <span>Route Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('warehouses')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: activeTab === 'warehouses' ? 600 : 500,
                color: activeTab === 'warehouses' ? '#ffffff' : 'var(--text-secondary)',
                background: activeTab === 'warehouses' ? 'var(--primary)' : '#f8fafc',
                border: activeTab === 'warehouses' ? '1px solid var(--primary)' : '1px solid var(--border)',
                boxShadow: activeTab === 'warehouses' ? '0 2px 8px rgba(37, 99, 235, 0.28)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <WarehouseIcon size={14} />
              <span>Warehouse Capacity</span>
            </button>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 26, background: 'var(--border)', margin: '0 4px' }} />

          {/* Group 3: Commercial & Finance */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                paddingRight: 4,
              }}
            >
              Commercial
            </span>
            <button
              onClick={() => setActiveTab('customers')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: activeTab === 'customers' ? 600 : 500,
                color: activeTab === 'customers' ? '#ffffff' : 'var(--text-secondary)',
                background: activeTab === 'customers' ? 'var(--primary)' : '#f8fafc',
                border: activeTab === 'customers' ? '1px solid var(--primary)' : '1px solid var(--border)',
                boxShadow: activeTab === 'customers' ? '0 2px 8px rgba(37, 99, 235, 0.28)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Users size={14} />
              <span>Customer Insights</span>
            </button>

            <button
              onClick={() => setActiveTab('financial')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: activeTab === 'financial' ? 600 : 500,
                color: activeTab === 'financial' ? '#ffffff' : 'var(--text-secondary)',
                background: activeTab === 'financial' ? 'var(--primary)' : '#f8fafc',
                border: activeTab === 'financial' ? '1px solid var(--primary)' : '1px solid var(--border)',
                boxShadow: activeTab === 'financial' ? '0 2px 8px rgba(37, 99, 235, 0.28)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <DollarSign size={14} />
              <span>Financial & Revenue</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Active Module Status Strip ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
          padding: '10px 18px',
          background: 'var(--surface, #f8fafc)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          fontSize: '13px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 500 }}>Active Analytics Suite:</span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            {activeTab === 'overview' && (
              <>
                <Layers size={14} style={{ color: 'var(--primary)' }} /> Operations Overview
              </>
            )}
            {activeTab === 'orders' && (
              <>
                <Package size={14} style={{ color: 'var(--primary)' }} /> Order Analytics & Lifecycle
              </>
            )}
            {activeTab === 'shipments' && (
              <>
                <Clock size={14} style={{ color: 'var(--primary)' }} /> Transit & Delivery SLA Performance
              </>
            )}
            {activeTab === 'fleet' && (
              <>
                <Truck size={14} style={{ color: 'var(--primary)' }} /> Fleet Health & Asset Utilization
              </>
            )}
            {activeTab === 'drivers' && (
              <>
                <Award size={14} style={{ color: 'var(--primary)' }} /> Driver Efficiency & Safety
              </>
            )}
            {activeTab === 'routes' && (
              <>
                <Navigation size={14} style={{ color: 'var(--primary)' }} /> Route Performance & Delay Corridors
              </>
            )}
            {activeTab === 'warehouses' && (
              <>
                <WarehouseIcon size={14} style={{ color: 'var(--primary)' }} /> Warehouse Occupancy & Capacity
              </>
            )}
            {activeTab === 'customers' && (
              <>
                <Users size={14} style={{ color: 'var(--primary)' }} /> Client Accounts & Volume Insights
              </>
            )}
            {activeTab === 'financial' && (
              <>
                <DollarSign size={14} style={{ color: 'var(--primary)' }} /> Financial Reconciliation & Revenue
              </>
            )}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-muted)', fontSize: '12px', flexWrap: 'wrap' }}>
          <span>
            Timeframe: <strong style={{ color: 'var(--primary)' }}>{reportData?.dateRangeLabel || dateRange.replace(/_/g, ' ')}</strong>
          </span>
          {lastSyncedAt && (
            <>
              <span>•</span>
              <span>
                Updated at{' '}
                <strong style={{ color: 'var(--text-secondary)' }}>
                  {lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </strong>
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── Error Notification ── */}
      {error && (
        <div
          className="card"
          style={{
            padding: '14px 18px',
            borderColor: 'var(--danger)',
            background: 'rgba(239, 68, 68, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertCircle size={18} style={{ color: 'var(--danger)' }} />
            <span style={{ fontSize: 14, color: 'var(--danger)', fontWeight: 600 }}>{error}</span>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => loadReports()}>
            Retry
          </button>
        </div>
      )}

      {/* ── Loading Skeleton ── */}
      {loading && !reportData && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card" style={{ height: 110, padding: 20 }}>
                <div style={{ height: 16, width: '60%', background: 'var(--border)', borderRadius: 4, marginBottom: 12 }} />
                <div style={{ height: 28, width: '40%', background: 'var(--border)', borderRadius: 4 }} />
              </div>
            ))}
          </div>
          <div className="card" style={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <RefreshCw size={28} className="animate-spin text-primary" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Calculating logistics telemetry...</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab Content ── */}
      {!loading && reportData && (
        <>
          {/* =========================================================================
              1. OPERATIONS OVERVIEW
              ========================================================================= */}
          {activeTab === 'overview' && reportData.overview && (
            <div className="space-y-6">
              {/* Executive Primary KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <div className="kpi-card blue">
                  <div className="kpi-top">
                    <p className="kpi-label">Total Booking Orders</p>
                    <div className="kpi-icon blue"><Package size={18} /></div>
                  </div>
                  <p className="kpi-value">{formatNumber(reportData.overview.totalOrders)}</p>
                  <p className="text-xs text-muted mt-2">{reportData.overview.pendingOrders} pending fulfillment</p>
                </div>

                <div className="kpi-card green">
                  <div className="kpi-top">
                    <p className="kpi-label">Active Shipments</p>
                    <div className="kpi-icon green"><Truck size={18} /></div>
                  </div>
                  <p className="kpi-value">{formatNumber(reportData.overview.activeShipments)}</p>
                  <p className="text-xs text-muted mt-2">{reportData.overview.inTransitShipments} currently in transit</p>
                </div>

                <div className="kpi-card purple">
                  <div className="kpi-top">
                    <p className="kpi-label">Delivered Shipments</p>
                    <div className="kpi-icon purple"><CheckCircle2 size={18} /></div>
                  </div>
                  <p className="kpi-value">{formatNumber(reportData.overview.deliveredShipments)}</p>
                  <p className="text-xs text-muted mt-2">Completed lifecycle</p>
                </div>

                <div className="kpi-card amber">
                  <div className="kpi-top">
                    <p className="kpi-label">Total Invoiced Volume</p>
                    <div className="kpi-icon amber"><DollarSign size={18} /></div>
                  </div>
                  <p className="kpi-value">{formatCurrency(reportData.overview.totalInvoiceValue)}</p>
                  <p className="text-xs text-muted mt-2">{formatCurrency(reportData.overview.outstandingAmount)} outstanding</p>
                </div>
              </div>

              {/* Secondary Fleet & Infrastructure Overview */}
              <div className="card" style={{ padding: 20 }}>
                <h3 className="card-title" style={{ fontSize: 15, marginBottom: 16 }}>
                  Active Operational Infrastructure & Resource Utilization
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
                  <div style={{ padding: '12px 14px', background: 'var(--surface-subtle)', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 12 }}>
                      <Users size={14} /> Commercial Clients
                    </div>
                    <p style={{ fontSize: 20, fontWeight: 800, margin: '6px 0 0 0' }}>{formatNumber(reportData.overview.totalCustomers)}</p>
                  </div>

                  <div style={{ padding: '12px 14px', background: 'var(--surface-subtle)', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 12 }}>
                      <Award size={14} /> Active Drivers
                    </div>
                    <p style={{ fontSize: 20, fontWeight: 800, margin: '6px 0 0 0', color: 'var(--success)' }}>
                      {formatNumber(reportData.overview.activeDrivers)}
                    </p>
                  </div>

                  <div style={{ padding: '12px 14px', background: 'var(--surface-subtle)', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 12 }}>
                      <Truck size={14} /> Active Fleet Vehicles
                    </div>
                    <p style={{ fontSize: 20, fontWeight: 800, margin: '6px 0 0 0', color: 'var(--primary)' }}>
                      {formatNumber(reportData.overview.activeVehicles)}
                    </p>
                  </div>

                  <div style={{ padding: '12px 14px', background: 'var(--surface-subtle)', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 12 }}>
                      <Navigation size={14} /> Active Freight Routes
                    </div>
                    <p style={{ fontSize: 20, fontWeight: 800, margin: '6px 0 0 0' }}>{formatNumber(reportData.overview.activeRoutes)}</p>
                  </div>

                  <div style={{ padding: '12px 14px', background: 'var(--surface-subtle)', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 12 }}>
                      <WarehouseIcon size={14} /> Warehouses & Hubs
                    </div>
                    <p style={{ fontSize: 20, fontWeight: 800, margin: '6px 0 0 0' }}>{formatNumber(reportData.overview.warehouseCount)}</p>
                  </div>
                </div>
              </div>

              {/* Two Column Visual Charts */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 20 }}>
                {/* Orders by Status Donut */}
                <div className="card" style={{ padding: 20 }}>
                  <h3 className="card-title" style={{ fontSize: 15, marginBottom: 12 }}>Consignment Order Status Distribution</h3>
                  {orderStatusChartData.length > 0 ? (
                    <div style={{ height: 260 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={orderStatusChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={85}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {orderStatusChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: any) => [`${value} Orders`, 'Count']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>No orders in selected date window.</p>
                  )}
                </div>

                {/* Financial Summary Progress */}
                <div className="card" style={{ padding: 20 }}>
                  <h3 className="card-title" style={{ fontSize: 15, marginBottom: 12 }}>Revenue Realization vs Outstanding</h3>
                  <div className="space-y-4" style={{ marginTop: 24 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                        <span style={{ fontWeight: 600 }}>Realized Cash Paid</span>
                        <span style={{ fontWeight: 700, color: 'var(--success)' }}>
                          {formatCurrency(reportData.overview.totalPaidAmount)}
                        </span>
                      </div>
                      <div style={{ height: 10, background: 'var(--surface-subtle)', borderRadius: 5, overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            background: 'var(--success)',
                            width: `${Math.min(
                              100,
                              Math.round(
                                (reportData.overview.totalPaidAmount / Math.max(1, reportData.overview.totalInvoiceValue)) * 100
                              )
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ marginTop: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                        <span style={{ fontWeight: 600 }}>Pending Receivables</span>
                        <span style={{ fontWeight: 700, color: 'var(--danger)' }}>
                          {formatCurrency(reportData.overview.outstandingAmount)}
                        </span>
                      </div>
                      <div style={{ height: 10, background: 'var(--surface-subtle)', borderRadius: 5, overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            background: 'var(--danger)',
                            width: `${Math.min(
                              100,
                              Math.round(
                                (reportData.overview.outstandingAmount / Math.max(1, reportData.overview.totalInvoiceValue)) * 100
                              )
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              2. ORDER ANALYTICS
              ========================================================================= */}
          {activeTab === 'orders' && reportData.orders && (
            <div className="space-y-6">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <div className="kpi-card blue">
                  <div className="kpi-top">
                    <p className="kpi-label">Orders in Period</p>
                    <div className="kpi-icon blue"><Package size={18} /></div>
                  </div>
                  <p className="kpi-value">{formatNumber(reportData.orders.totalOrders)}</p>
                  <p className="text-xs text-muted mt-2">{reportData.dateRangeLabel}</p>
                </div>

                <div className="kpi-card green">
                  <div className="kpi-top">
                    <p className="kpi-label">Total Booking Volume</p>
                    <div className="kpi-icon green"><DollarSign size={18} /></div>
                  </div>
                  <p className="kpi-value">{formatCurrency(reportData.orders.totalBookingVolume)}</p>
                  <p className="text-xs text-muted mt-2">Billed booking total</p>
                </div>

                <div className="kpi-card amber">
                  <div className="kpi-top">
                    <p className="kpi-label">Average Order Value</p>
                    <div className="kpi-icon amber"><TrendingUp size={18} /></div>
                  </div>
                  <p className="kpi-value">{formatCurrency(reportData.orders.averageOrderValue)}</p>
                  <p className="text-xs text-muted mt-2">Per consignment order</p>
                </div>

                <div className="kpi-card purple">
                  <div className="kpi-top">
                    <p className="kpi-label">Fulfillment Rate</p>
                    <div className="kpi-icon purple"><CheckCircle2 size={18} /></div>
                  </div>
                  <p className="kpi-value">{reportData.orders.fulfillmentRate}%</p>
                  <p className="text-xs text-muted mt-2">Non-cancelled ratio</p>
                </div>
              </div>

              {/* Order Booking Trends Chart */}
              <div className="card" style={{ padding: 20 }}>
                <div className="card-header" style={{ marginBottom: 16 }}>
                  <h3 className="card-title">Booking Velocity Trend over Time</h3>
                  <span className="badge badge-blue">{reportData.dateRangeLabel}</span>
                </div>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={reportData.orders.trendSeries}>
                      <defs>
                        <linearGradient id="orderVolumeGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
                      <YAxis stroke="var(--text-muted)" fontSize={12} />
                      <Tooltip formatter={(value: any) => [`${value}`, 'Bookings']} />
                      <Area type="monotone" dataKey="orders" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#orderVolumeGrad)" name="Orders" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Delivery Type Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
                <div className="card" style={{ padding: 20 }}>
                  <h3 className="card-title" style={{ fontSize: 15, marginBottom: 16 }}>Consignments by Delivery Service Level</h3>
                  <div style={{ height: 240 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={deliveryTypeChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                        <YAxis stroke="var(--text-muted)" fontSize={12} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Orders" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card" style={{ padding: 20 }}>
                  <h3 className="card-title" style={{ fontSize: 15, marginBottom: 16 }}>Order Lifecycle Status Summary</h3>
                  <div className="table-container table-scroll" style={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
                    <table className="data-table" style={{ minWidth: 400 }}>
                      <thead>
                        <tr style={{ whiteSpace: 'nowrap' }}>
                          <th style={{ whiteSpace: 'nowrap' }}>Status</th>
                          <th style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>Count</th>
                          <th style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>Share %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(reportData.orders.statusDistribution).map(([status, count]) => {
                          const pct = reportData.orders.totalOrders === 0 ? 0 : Math.round((count / reportData.orders.totalOrders) * 100);
                          return (
                            <tr key={status}>
                              <td>
                                <span className="badge" style={{ background: `${STATUS_COLORS[status] || '#64748b'}20`, color: STATUS_COLORS[status] || '#64748b' }}>
                                  {status.replace(/_/g, ' ')}
                                </span>
                              </td>
                              <td style={{ textAlign: 'right', fontWeight: 700 }}>{count}</td>
                              <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>{pct}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              3. SHIPMENT ANALYTICS & DELIVERY PERFORMANCE
              ========================================================================= */}
          {activeTab === 'shipments' && reportData.shipments && reportData.deliveryPerformance && (
            <div className="space-y-6">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <div className="kpi-card green">
                  <div className="kpi-top">
                    <p className="kpi-label">Delivery Success Rate</p>
                    <div className="kpi-icon green"><ShieldCheck size={18} /></div>
                  </div>
                  <p className="kpi-value">{reportData.deliveryPerformance.deliverySuccessRate}%</p>
                  <p className="text-xs text-muted mt-2">Zero cargo loss transit</p>
                </div>

                <div className="kpi-card blue">
                  <div className="kpi-top">
                    <p className="kpi-label">On-Time SLA Delivery</p>
                    <div className="kpi-icon blue"><Clock size={18} /></div>
                  </div>
                  <p className="kpi-value">{reportData.deliveryPerformance.onTimeDeliveryRate}%</p>
                  <p className="text-xs text-muted mt-2">Against customer ETA</p>
                </div>

                <div className="kpi-card purple">
                  <div className="kpi-top">
                    <p className="kpi-label">Avg Transit Duration</p>
                    <div className="kpi-icon purple"><Truck size={18} /></div>
                  </div>
                  <p className="kpi-value">{reportData.deliveryPerformance.averageTransitHours} hrs</p>
                  <p className="text-xs text-muted mt-2">Pickup to delivery</p>
                </div>

                <div className="kpi-card amber">
                  <div className="kpi-top">
                    <p className="kpi-label">Delayed Shipments</p>
                    <div className="kpi-icon amber"><AlertCircle size={18} /></div>
                  </div>
                  <p className="kpi-value">{reportData.deliveryPerformance.delayedShipments}</p>
                  <p className="text-xs text-muted mt-2">Past estimated delivery date</p>
                </div>
              </div>

              {/* Shipment Delivery Trends Chart */}
              <div className="card" style={{ padding: 20 }}>
                <div className="card-header" style={{ marginBottom: 16 }}>
                  <h3 className="card-title">Daily Consignment Shipment Activity</h3>
                  <span className="badge badge-blue">{reportData.dateRangeLabel}</span>
                </div>
                <div style={{ height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.shipments.trendSeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
                      <YAxis stroke="var(--text-muted)" fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="delivered" stackId="a" fill="#16a34a" name="Delivered" />
                      <Bar dataKey="inTransit" stackId="a" fill="#2563eb" name="In Transit" />
                      <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="Pending" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Delivery Throughput Counters */}
              <div className="card" style={{ padding: 20 }}>
                <h3 className="card-title" style={{ fontSize: 15, marginBottom: 16 }}>Delivery Milestones Realized</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                  <div style={{ padding: 16, background: 'var(--surface-subtle)', borderRadius: 8 }}>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Delivered Today</p>
                    <p style={{ fontSize: 24, fontWeight: 800, margin: '6px 0 0 0', color: 'var(--success)' }}>
                      {formatNumber(reportData.deliveryPerformance.deliveredToday)}
                    </p>
                  </div>
                  <div style={{ padding: 16, background: 'var(--surface-subtle)', borderRadius: 8 }}>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Delivered This Week</p>
                    <p style={{ fontSize: 24, fontWeight: 800, margin: '6px 0 0 0', color: 'var(--primary)' }}>
                      {formatNumber(reportData.deliveryPerformance.deliveredThisWeek)}
                    </p>
                  </div>
                  <div style={{ padding: 16, background: 'var(--surface-subtle)', borderRadius: 8 }}>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Delivered This Month</p>
                    <p style={{ fontSize: 24, fontWeight: 800, margin: '6px 0 0 0', color: 'var(--text)' }}>
                      {formatNumber(reportData.deliveryPerformance.deliveredThisMonth)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              4. FLEET ANALYTICS
              ========================================================================= */}
          {activeTab === 'fleet' && reportData.fleet && (
            <div className="space-y-6">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div className="kpi-card blue">
                  <div className="kpi-top">
                    <p className="kpi-label">Total Fleet Vehicles</p>
                    <div className="kpi-icon blue"><Truck size={18} /></div>
                  </div>
                  <p className="kpi-value">{reportData.fleet.totalVehicles}</p>
                  <p className="text-xs text-muted mt-2">Registered fleet units</p>
                </div>

                <div className="kpi-card green">
                  <div className="kpi-top">
                    <p className="kpi-label">Fleet Utilization</p>
                    <div className="kpi-icon green"><Percent size={18} /></div>
                  </div>
                  <p className="kpi-value">{reportData.fleet.utilizationRate}%</p>
                  <p className="text-xs text-muted mt-2">{reportData.fleet.assignedVehicles} active assignments</p>
                </div>

                <div className="kpi-card purple">
                  <div className="kpi-top">
                    <p className="kpi-label">Available Vehicles</p>
                    <div className="kpi-icon purple"><CheckCircle2 size={18} /></div>
                  </div>
                  <p className="kpi-value">{reportData.fleet.availableVehicles}</p>
                  <p className="text-xs text-muted mt-2">Ready for deployment</p>
                </div>

                <div className="kpi-card amber">
                  <div className="kpi-top">
                    <p className="kpi-label">Under Maintenance</p>
                    <div className="kpi-icon amber"><AlertCircle size={18} /></div>
                  </div>
                  <p className="kpi-value">{reportData.fleet.maintenanceVehicles}</p>
                  <p className="text-xs text-muted mt-2">Workshop inspection</p>
                </div>
              </div>

              {/* Vehicle Roster Table */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Live Commercial Vehicle Roster & Route Allocation</h3>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                  <div className="table-container table-scroll" style={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
                    <table className="data-table" style={{ minWidth: 800 }}>
                      <thead>
                        <tr style={{ whiteSpace: 'nowrap' }}>
                          <th style={{ whiteSpace: 'nowrap' }}>License Plate</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Model</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Type</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Capacity</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Assigned Driver</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Assigned Route</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Active Loads</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.fleet.vehicleRoster.map((v) => (
                          <tr key={v.id}>
                            <td className="td-mono td-primary" style={{ whiteSpace: 'nowrap' }}>{v.licensePlate}</td>
                            <td>{v.model}</td>
                            <td><span className="badge badge-gray">{v.type.replace(/_/g, ' ')}</span></td>
                            <td style={{ whiteSpace: 'nowrap' }}>{v.capacityTons} Tons</td>
                            <td style={{ whiteSpace: 'nowrap' }}>{v.assignedDriver}</td>
                            <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{v.assignedRoute}</td>
                            <td style={{ fontWeight: 700, color: v.activeLoads > 0 ? 'var(--primary)' : 'var(--text-muted)' }}>
                              {v.activeLoads}
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  v.status === 'AVAILABLE'
                                    ? 'badge-green'
                                    : v.status === 'IN_TRANSIT' || v.status === 'ASSIGNED'
                                    ? 'badge-blue'
                                    : v.status === 'MAINTENANCE'
                                    ? 'badge-amber'
                                    : 'badge-gray'
                                }`}
                              >
                                {v.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              5. DRIVER PERFORMANCE
              ========================================================================= */}
          {activeTab === 'drivers' && reportData.drivers && (
            <div className="space-y-6">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <div className="kpi-card blue">
                  <div className="kpi-top">
                    <p className="kpi-label">Total Commercial Drivers</p>
                    <div className="kpi-icon blue"><Users size={18} /></div>
                  </div>
                  <p className="kpi-value">{reportData.drivers.totalDrivers}</p>
                  <p className="text-xs text-muted mt-2">Roster headcount</p>
                </div>

                <div className="kpi-card green">
                  <div className="kpi-top">
                    <p className="kpi-label">Active / On Duty</p>
                    <div className="kpi-icon green"><CheckCircle2 size={18} /></div>
                  </div>
                  <p className="kpi-value">{reportData.drivers.activeDrivers}</p>
                  <p className="text-xs text-muted mt-2">{reportData.drivers.assignedDrivers} on active routes</p>
                </div>

                <div className="kpi-card purple">
                  <div className="kpi-top">
                    <p className="kpi-label">Available on Standby</p>
                    <div className="kpi-icon purple"><Award size={18} /></div>
                  </div>
                  <p className="kpi-value">{reportData.drivers.availableDrivers}</p>
                  <p className="text-xs text-muted mt-2">Ready for dispatch</p>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Driver On-Time SLA & Performance Index</h3>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                  <div className="table-container table-scroll" style={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
                    <table className="data-table" style={{ minWidth: 900 }}>
                      <thead>
                        <tr style={{ whiteSpace: 'nowrap' }}>
                          <th style={{ whiteSpace: 'nowrap' }}>Driver Name</th>
                          <th style={{ whiteSpace: 'nowrap' }}>License #</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Phone</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Assigned Vehicle</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Assigned Route</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Total Deliveries</th>
                          <th style={{ whiteSpace: 'nowrap' }}>On-Time Ratio</th>
                          <th style={{ whiteSpace: 'nowrap' }}>SLA Rate</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.drivers.drivers.map((d) => (
                          <tr key={d.id}>
                            <td className="td-primary" style={{ whiteSpace: 'nowrap' }}>{d.name}</td>
                            <td className="td-mono" style={{ whiteSpace: 'nowrap' }}>{d.licenseNumber}</td>
                            <td style={{ whiteSpace: 'nowrap' }}>{d.phone}</td>
                            <td style={{ whiteSpace: 'nowrap' }}>{d.assignedVehicle}</td>
                            <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{d.assignedRoute}</td>
                            <td>{d.totalRuns}</td>
                            <td style={{ fontWeight: 600, color: 'var(--success)' }}>{d.onTimeRuns}</td>
                            <td>
                              <span style={{ fontWeight: 700, color: d.onTimeRate >= 95 ? 'var(--success)' : 'var(--warning)' }}>
                                {d.onTimeRate}%
                              </span>
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  d.status === 'AVAILABLE'
                                    ? 'badge-green'
                                    : d.status === 'ON_DUTY' || d.status === 'ON_DELIVERY' || d.status === 'ON_TRIP'
                                    ? 'badge-blue'
                                    : 'badge-gray'
                                }`}
                              >
                                {d.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              6. ROUTE PERFORMANCE
              ========================================================================= */}
          {activeTab === 'routes' && reportData.routes && (
            <div className="space-y-6">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <div className="kpi-card blue">
                  <div className="kpi-top">
                    <p className="kpi-label">Freight Corridors</p>
                    <div className="kpi-icon blue"><Navigation size={18} /></div>
                  </div>
                  <p className="kpi-value">{reportData.routes.totalRoutes}</p>
                  <p className="text-xs text-muted mt-2">{reportData.routes.activeRoutes} active lines</p>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Top Active Freight Corridors & Transport Loads</h3>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                  <div className="table-container table-scroll" style={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
                    <table className="data-table" style={{ minWidth: 850 }}>
                      <thead>
                        <tr style={{ whiteSpace: 'nowrap' }}>
                          <th style={{ whiteSpace: 'nowrap' }}>Freight Route</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Distance (km)</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Est. Transit</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Assigned Driver</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Assigned Vehicle</th>
                          <th style={{ whiteSpace: 'nowrap' }}>In-Transit Loads</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Total Routed</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.routes.routes.map((r) => (
                          <tr key={r.id}>
                            <td className="td-primary" style={{ whiteSpace: 'nowrap' }}>{r.routeName}</td>
                            <td style={{ whiteSpace: 'nowrap' }}>{r.distanceKm} km</td>
                            <td style={{ whiteSpace: 'nowrap' }}>{r.estimatedHours} hrs</td>
                            <td style={{ whiteSpace: 'nowrap' }}>{r.assignedDriver}</td>
                            <td style={{ whiteSpace: 'nowrap' }}>{r.assignedVehicle}</td>
                            <td style={{ fontWeight: 700, color: r.activeLoads > 0 ? 'var(--primary)' : 'var(--text-muted)' }}>
                              {r.activeLoads}
                            </td>
                            <td style={{ fontWeight: 600 }}>{r.totalShipments}</td>
                            <td>
                              <span className={`badge ${r.status === 'ACTIVE' ? 'badge-green' : 'badge-gray'}`}>
                                {r.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              7. WAREHOUSE ANALYTICS
              ========================================================================= */}
          {activeTab === 'warehouses' && reportData.warehouses && (
            <div className="space-y-6">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <div className="kpi-card blue">
                  <div className="kpi-top">
                    <p className="kpi-label">Logistics Facilities</p>
                    <div className="kpi-icon blue"><WarehouseIcon size={18} /></div>
                  </div>
                  <p className="kpi-value">{reportData.warehouses.totalWarehouses}</p>
                  <p className="text-xs text-muted mt-2">{reportData.warehouses.activeWarehouses} active operational hubs</p>
                </div>

                <div className="kpi-card green">
                  <div className="kpi-top">
                    <p className="kpi-label">Overall Utilization</p>
                    <div className="kpi-icon green"><Percent size={18} /></div>
                  </div>
                  <p className="kpi-value">{reportData.warehouses.overallUtilizationRate}%</p>
                  <p className="text-xs text-muted mt-2">Across all logistics facilities</p>
                </div>

                <div className="kpi-card purple">
                  <div className="kpi-top">
                    <p className="kpi-label">Total Storage Capacity</p>
                    <div className="kpi-icon purple"><Layers size={18} /></div>
                  </div>
                  <p className="kpi-value">{formatNumber(reportData.warehouses.totalCapacity)} KG</p>
                  <p className="text-xs text-muted mt-2">{formatNumber(reportData.warehouses.occupiedCapacity)} KG occupied</p>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Warehouse Facility Telemetry & Capacity Allocation</h3>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                  <div className="table-container table-scroll" style={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
                    <table className="data-table" style={{ minWidth: 850 }}>
                      <thead>
                        <tr style={{ whiteSpace: 'nowrap' }}>
                          <th style={{ whiteSpace: 'nowrap' }}>Hub Code</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Facility Name</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Location</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Facility Head</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Total Capacity</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Occupied</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Utilization %</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.warehouses.warehouses.map((w) => (
                          <tr key={w.id}>
                            <td className="td-mono" style={{ whiteSpace: 'nowrap' }}>{w.code}</td>
                            <td className="td-primary" style={{ whiteSpace: 'nowrap' }}>{w.name}</td>
                            <td style={{ whiteSpace: 'nowrap' }}>{w.location}</td>
                            <td style={{ whiteSpace: 'nowrap' }}>{w.manager}</td>
                            <td style={{ whiteSpace: 'nowrap' }}>{formatNumber(w.totalCapacity)} KG</td>
                            <td style={{ whiteSpace: 'nowrap' }}>{formatNumber(w.usedCapacity)} KG</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 120 }}>
                                <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                                  <div
                                    style={{
                                      height: '100%',
                                      background: w.utilizationRate > 85 ? 'var(--danger)' : w.utilizationRate > 65 ? 'var(--warning)' : 'var(--success)',
                                      width: `${Math.min(100, w.utilizationRate)}%`,
                                    }}
                                  />
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 700 }}>{w.utilizationRate}%</span>
                              </div>
                            </td>
                            <td>
                              <span className={`badge ${w.status === 'ACTIVE' ? 'badge-green' : 'badge-amber'}`}>
                                {w.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              8. CUSTOMER ANALYTICS
              ========================================================================= */}
          {activeTab === 'customers' && reportData.customers && (
            <div className="space-y-6">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <div className="kpi-card blue">
                  <div className="kpi-top">
                    <p className="kpi-label">Commercial Customers</p>
                    <div className="kpi-icon blue"><Users size={18} /></div>
                  </div>
                  <p className="kpi-value">{reportData.customers.totalCustomers}</p>
                  <p className="text-xs text-muted mt-2">{reportData.customers.activeCustomers} active accounts</p>
                </div>

                <div className="kpi-card green">
                  <div className="kpi-top">
                    <p className="kpi-label">Customer Retention Rate</p>
                    <div className="kpi-icon green"><CheckCircle2 size={18} /></div>
                  </div>
                  <p className="kpi-value">{reportData.customers.customerRetentionRate}%</p>
                  <p className="text-xs text-muted mt-2">Active shippers with orders</p>
                </div>

                <div className="kpi-card purple">
                  <div className="kpi-top">
                    <p className="kpi-label">Avg Orders / Customer</p>
                    <div className="kpi-icon purple"><TrendingUp size={18} /></div>
                  </div>
                  <p className="kpi-value">{reportData.customers.ordersPerCustomerAvg}</p>
                  <p className="text-xs text-muted mt-2">Booking velocity index</p>
                </div>
              </div>

              {/* Top Customers Table */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Top Commercial Shippers by Lifetime Revenue & Booking Volume</h3>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                  <div className="table-container table-scroll" style={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
                    <table className="data-table" style={{ minWidth: 700 }}>
                      <thead>
                        <tr style={{ whiteSpace: 'nowrap' }}>
                          <th style={{ whiteSpace: 'nowrap' }}>Customer / Enterprise</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Company Name</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Email Contact</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Total Bookings</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Invoiced Value</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Paid Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.customers.topCustomersByRevenue.map((c) => (
                          <tr key={c.id}>
                            <td className="td-primary" style={{ whiteSpace: 'nowrap' }}>{c.name}</td>
                            <td style={{ whiteSpace: 'nowrap' }}>{c.company}</td>
                            <td style={{ whiteSpace: 'nowrap' }}>{c.email}</td>
                            <td style={{ fontWeight: 700 }}>{c.orderCount}</td>
                            <td style={{ fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap' }}>{formatCurrency(c.totalInvoiced)}</td>
                            <td style={{ fontWeight: 700, color: 'var(--success)', whiteSpace: 'nowrap' }}>{formatCurrency(c.totalPaid)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              9. FINANCIAL & REVENUE ANALYTICS
              ========================================================================= */}
          {activeTab === 'financial' && reportData.financial && (
            <div className="space-y-6">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <div className="kpi-card green">
                  <div className="kpi-top">
                    <p className="kpi-label">Gross Billed Invoices</p>
                    <div className="kpi-icon green"><DollarSign size={18} /></div>
                  </div>
                  <p className="kpi-value">{formatCurrency(reportData.financial.totalBilled)}</p>
                  <p className="text-xs text-muted mt-2">{reportData.financial.totalInvoices} total invoices</p>
                </div>

                <div className="kpi-card blue">
                  <div className="kpi-top">
                    <p className="kpi-label">Realized Cash Collections</p>
                    <div className="kpi-icon blue"><CheckCircle2 size={18} /></div>
                  </div>
                  <p className="kpi-value">{formatCurrency(reportData.financial.totalPaid)}</p>
                  <p className="text-xs text-muted mt-2">{reportData.financial.paidCount} fully paid</p>
                </div>

                <div className="kpi-card amber">
                  <div className="kpi-top">
                    <p className="kpi-label">Outstanding Receivables</p>
                    <div className="kpi-icon amber"><Clock size={18} /></div>
                  </div>
                  <p className="kpi-value">{formatCurrency(reportData.financial.outstandingAmount)}</p>
                  <p className="text-xs text-muted mt-2">{reportData.financial.unpaidCount} unpaid / pending</p>
                </div>

                <div className="kpi-card purple">
                  <div className="kpi-top">
                    <p className="kpi-label">Average Invoice Value</p>
                    <div className="kpi-icon purple"><TrendingUp size={18} /></div>
                  </div>
                  <p className="kpi-value">{formatCurrency(reportData.financial.averageInvoiceValue)}</p>
                  <p className="text-xs text-muted mt-2">Per commercial invoice</p>
                </div>
              </div>

              {/* Monthly Revenue Trend Bar Chart */}
              <div className="card" style={{ padding: 20 }}>
                <div className="card-header" style={{ marginBottom: 16 }}>
                  <h3 className="card-title">Past 6-Month Gross Logistics Revenue Performance</h3>
                </div>
                <div style={{ height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.financial.monthlyBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                      <YAxis stroke="var(--text-muted)" fontSize={12} />
                      <Tooltip formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']} />
                      <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Gross Revenue (INR)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Monthly Breakdown Table */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Monthly Financial Ledger Summary</h3>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                  <div className="table-container table-scroll" style={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
                    <table className="data-table" style={{ minWidth: 600 }}>
                      <thead>
                        <tr style={{ whiteSpace: 'nowrap' }}>
                          <th style={{ whiteSpace: 'nowrap' }}>Month Period</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Consignment Orders</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Gross Invoiced (INR)</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Average / Consignment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.financial.monthlyBreakdown.map((m) => (
                          <tr key={m.month}>
                            <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{m.month}</td>
                            <td>{m.orders}</td>
                            <td style={{ fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap' }}>{formatCurrency(m.revenue)}</td>
                            <td style={{ whiteSpace: 'nowrap' }}>{formatCurrency(m.avgPerOrder)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
