import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, Send, Warehouse, RefreshCw,
  TrendingUp, PieChart as PieIcon, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { warehousePortalService } from '../../services/warehousePortalService';
import type { WarehouseDashboardData, WarehouseReportData } from '../../types/warehousePortal';

const STAGE_COLORS: Record<string, { label: string; color: string }> = {
  READY_FOR_PROCESSING: { label: 'Ready to Process', color: '#64748b' },
  PICKING: { label: 'Picking', color: '#2563eb' },
  PACKED: { label: 'Packed', color: '#d97706' },
  READY_FOR_DISPATCH: { label: 'Ready for Dispatch', color: '#059669' },
};

export default function Dashboard() {
  const [data, setData] = useState<WarehouseDashboardData | null>(null);
  const [reportData, setReportData] = useState<WarehouseReportData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('7D');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);
      const [dashRes, repRes] = await Promise.all([
        warehousePortalService.getDashboard(),
        warehousePortalService.getReports(selectedPeriod).catch(() => null),
      ]);
      setData(dashRes);
      setReportData(repRes);
    } catch (err: any) {
      console.error('Failed to load warehouse dashboard:', err);
      setError(err?.response?.data?.message || 'Failed to load warehouse dashboard. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    setIsLoading(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData();
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  if (isLoading) {
    return (
      <div className="wh-page-container">
        {/* Header Skeleton */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <div style={{ width: 220, height: 28, backgroundColor: '#e2e8f0', borderRadius: 6, marginBottom: 8 }} />
            <div style={{ width: 340, height: 16, backgroundColor: '#f1f5f9', borderRadius: 4 }} />
          </div>
        </div>
        {/* KPI Grid Skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ height: 110, backgroundColor: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 16 }} />
          ))}
        </div>
        {/* Charts Skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18, marginBottom: 24 }}>
          <div style={{ height: 320, backgroundColor: '#ffffff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 20 }} />
          <div style={{ height: 320, backgroundColor: '#ffffff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 20 }} />
        </div>
        {/* Utilization Skeleton */}
        <div style={{ height: 120, backgroundColor: '#ffffff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 20 }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="wh-page-container" style={{ textAlign: 'center' }}>
        <div style={{ maxWidth: 440, margin: '60px auto', padding: 32, backgroundColor: '#ffffff', borderRadius: 16, border: '1px solid #fee2e2' }}>
          <AlertTriangle size={42} color="#dc2626" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>Unable to load dashboard</h3>
          <p style={{ fontSize: 13.5, color: '#64748b', margin: '0 0 20px' }}>{error}</p>
          <button
            onClick={fetchDashboardData}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              backgroundColor: '#059669',
              color: '#ffffff',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const utilizationPercent = Math.min(100, Math.round(data.utilizationRate || 0));

  // Build Operational Stage Donut Data
  const readyCount = data.readyToProcessCount ?? 0;
  const pickCount = data.pickingCount ?? 0;
  const packCount = data.packedCount ?? 0;
  const dispatchCount = data.readyForDispatchCount ?? 0;
  const totalQueue = readyCount + pickCount + packCount + dispatchCount;

  const donutItems = [
    { name: 'Ready to Process', value: readyCount, color: '#64748b', key: 'READY_FOR_PROCESSING' },
    { name: 'Picking', value: pickCount, color: '#2563eb', key: 'PICKING' },
    { name: 'Packed', value: packCount, color: '#d97706', key: 'PACKED' },
    { name: 'Ready for Dispatch', value: dispatchCount, color: '#059669', key: 'READY_FOR_DISPATCH' },
  ].filter(item => item.value > 0);

  const chartDonutData = donutItems.length > 0
    ? donutItems
    : [{ name: 'No Active Queue', value: 1, color: '#e2e8f0', key: 'EMPTY' }];

  // Throughput Trend Data (from reports dailyDispatches or dynamically generated dates)
  const trendData = (reportData?.dailyDispatches && reportData.dailyDispatches.length > 0)
    ? reportData.dailyDispatches
    : Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
          day: d.toLocaleDateString('en-US', { weekday: 'short' }),
          dispatches: 0,
          received: 0,
        };
      });

  return (
    <div className="wh-page-container">
      {/* ── 1. Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              Operational Overview
            </h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 20,
                backgroundColor: data.status === 'ACTIVE' ? '#d1fae5' : '#fef3c7',
                color: data.status === 'ACTIVE' ? '#065f46' : '#92400e',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: data.status === 'ACTIVE' ? '#10b981' : '#f59e0b' }} />
              {data.status}
            </span>
          </div>
          <p style={{ fontSize: 13.5, color: '#64748b', margin: '4px 0 0' }}>
            Hub: <strong>{data.warehouseName}</strong> ({data.warehouseCode}) • {data.city}, {data.state}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: 13,
              fontWeight: 600,
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}
            title="Refresh dashboard telemetry"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>

          <Link
            to="/warehouse/dispatch"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 8,
              backgroundColor: '#059669',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(5,150,105,0.25)',
            }}
          >
            <Send size={15} /> Dispatch Console
          </Link>
        </div>
      </div>

      {/* ── 2. Top 4 Operational KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 22 }}>
        {/* 1. Ready to Process */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Ready to Process
          </span>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: '4px 0 2px' }}>
            {readyCount}
          </div>
          <span style={{ fontSize: 12, color: '#64748b' }}>Allocated & awaiting pick</span>
        </div>

        {/* 2. Picking in Progress */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Picking in Progress
          </span>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#2563eb', margin: '4px 0 2px' }}>
            {pickCount}
          </div>
          <span style={{ fontSize: 12, color: '#64748b' }}>Currently on pick line</span>
        </div>

        {/* 3. Packed Consignments */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Packed Consignments
          </span>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#d97706', margin: '4px 0 2px' }}>
            {packCount}
          </div>
          <span style={{ fontSize: 12, color: '#64748b' }}>Ready for dispatch staging</span>
        </div>

        {/* 4. Ready for Dispatch */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Ready for Dispatch
          </span>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#059669', margin: '4px 0 2px' }}>
            {dispatchCount}
          </div>
          <span style={{ fontSize: 12, color: '#64748b' }}>Packed & awaiting vehicle release</span>
        </div>
      </div>

      {/* ── 3. Visual Interactive Charts (2fr : 1fr) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.2fr)', gap: 18, marginBottom: 22 }}>
        {/* Chart 1: Outbound Dispatches & Inbound Flow Trends */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 14,
            padding: '20px 22px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={18} color="#059669" />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Fulfillment & Dispatch Throughput
                </h3>
              </div>
              <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                Daily outbound dispatches vs customer order fulfillment intake
              </p>
            </div>

            <div style={{ display: 'flex', gap: 4, backgroundColor: '#f1f5f9', padding: 3, borderRadius: 8 }}>
              {['7D', '30D'].map((period) => (
                <button
                  key={period}
                  onClick={() => handlePeriodChange(period)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: 'none',
                    backgroundColor: selectedPeriod === period ? '#ffffff' : 'transparent',
                    color: selectedPeriod === period ? '#0f172a' : '#64748b',
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: selectedPeriod === period ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  }}
                >
                  {period === '7D' ? 'Last 7 Days' : 'Last 30 Days'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ width: '100%', height: 230, position: 'relative', marginTop: 4 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDispatch" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                />
                <Area type="monotone" dataKey="dispatches" name="Outbound Dispatches" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDispatch)" />
                <Area type="monotone" dataKey="received" name="Order Intake" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorReceived)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 12, fontSize: 12, color: '#475569', fontWeight: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#059669' }} />
              <span>Outbound Dispatches</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#2563eb' }} />
              <span>Order Intake</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Operational Stage Distribution Donut */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 14,
            padding: '20px 22px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <PieIcon size={18} color="#2563eb" />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Queue Distribution
              </h3>
            </div>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
              {totalQueue} Active Total
            </span>
          </div>

          <div style={{ width: '100%', height: 160, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={chartDonutData.length > 1 ? 4 : 0}
                  dataKey="value"
                >
                  {chartDonutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Total Value */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                pointerEvents: 'none',
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{totalQueue}</div>
              <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em', marginTop: 2 }}>
                In Queue
              </div>
            </div>
          </div>

          {/* Donut Legend */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
            {[
              { label: 'Ready to Process', val: readyCount, color: '#64748b' },
              { label: 'Picking', val: pickCount, color: '#2563eb' },
              { label: 'Packed', val: packCount, color: '#d97706' },
              { label: 'Ready for Dispatch', val: dispatchCount, color: '#059669' },
            ].map((st) => (
              <div key={st.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11.5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: st.color, flexShrink: 0 }} />
                  <span style={{ color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{st.label}</span>
                </div>
                <span style={{ fontWeight: 700, color: '#0f172a', marginLeft: 4 }}>{st.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. Facility Utilization Card ── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 14,
          padding: '20px 24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#059669', marginBottom: 6 }}>
          <Warehouse size={18} />
          <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Facility Utilization
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 2 }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>{utilizationPercent}%</span>
          <span style={{ fontSize: 13.5, color: '#64748b', fontWeight: 500 }}>
            ({(data.occupiedCapacity || 0).toLocaleString()} / {(data.totalCapacity || 0).toLocaleString()} KG)
          </span>
        </div>
        {/* Progress bar */}
        <div style={{ width: '100%', height: 9, backgroundColor: '#f1f5f9', borderRadius: 5, overflow: 'hidden', marginTop: 12 }}>
          <div
            style={{
              width: `${utilizationPercent}%`,
              height: '100%',
              backgroundColor: utilizationPercent > 90 ? '#ef4444' : utilizationPercent > 70 ? '#f59e0b' : '#10b981',
              borderRadius: 5,
              transition: 'width 0.5s ease',
            }}
          />
        </div>
      </div>
    </div>
  );
}
