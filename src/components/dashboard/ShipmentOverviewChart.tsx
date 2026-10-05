import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import type { ShipmentTrendPoint } from '../../types/adminDashboard';

interface ShipmentOverviewChartProps {
  data?: ShipmentTrendPoint[];
  selectedPeriod?: number;
  onPeriodChange?: (days: number) => void;
  isLoading?: boolean;
}

export default function ShipmentOverviewChart({
  data = [],
  selectedPeriod = 7,
  onPeriodChange,
  isLoading = false,
}: ShipmentOverviewChartProps) {
  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">Shipment Overview</h3>
          <p className="chart-subtitle">Daily dispatch & delivery activity trends</p>
        </div>
        <select
          className="filter-select"
          style={{ padding: '4px 24px 4px 8px', fontSize: 12 }}
          value={selectedPeriod}
          onChange={(e) => onPeriodChange?.(Number(e.target.value))}
          disabled={isLoading}
        >
          <option value={7}>Last 7 Days</option>
          <option value={30}>Last 30 Days</option>
          <option value={90}>Last 90 Days</option>
        </select>
      </div>

      <div style={{ width: '100%', height: 260, position: 'relative' }}>
        {isLoading ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div
              style={{
                width: 28,
                height: 28,
                border: '3px solid #e2e8f0',
                borderTopColor: '#2563eb',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
          </div>
        ) : data.length === 0 ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            No shipment trends available for this period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorInTransit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d97706" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  fontSize: 12
                }}
              />
              <Area type="monotone" dataKey="delivered" name="Delivered" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#colorDelivered)" />
              <Area type="monotone" dataKey="inTransit" name="In Transit" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorInTransit)" />
              <Area type="monotone" dataKey="pending" name="Pending" stroke="#d97706" strokeWidth={2} fillOpacity={1} fill="url(#colorPending)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#059669' }} />
          <span>Delivered</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#2563eb' }} />
          <span>In Transit</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#d97706' }} />
          <span>Pending</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#dc2626' }} />
          <span>Cancelled</span>
        </div>
      </div>
    </div>
  );
}
