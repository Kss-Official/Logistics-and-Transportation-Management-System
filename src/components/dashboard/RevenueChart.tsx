import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import type { MonthlyRevenueStat } from '../../types/adminDashboard';

interface RevenueChartProps {
  data?: MonthlyRevenueStat[];
  isLoading?: boolean;
}

export default function RevenueChart({ data = [], isLoading = false }: RevenueChartProps) {
  const formattedData = data.map((item) => ({
    ...item,
    revenueInLakhs: Number((item.revenue / 100000).toFixed(2)),
    rawRevenue: item.revenue,
  }));

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">Revenue Overview</h3>
          <p className="chart-subtitle">Monthly revenue trends from bookings</p>
        </div>
      </div>

      <div style={{ width: '100%', height: 230, position: 'relative' }}>
        {isLoading ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div
              style={{
                width: 28,
                height: 28,
                border: '3px solid #e2e8f0',
                borderTopColor: '#4f46e5',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
          </div>
        ) : formattedData.length === 0 ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            No revenue records recorded.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} unit="L" />
              <Tooltip
                formatter={(value: any, name: any, item: any) => [
                  `₹${Number(item?.payload?.rawRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} (₹${value}L)`,
                  'Revenue',
                ]}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: 12,
                }}
              />
              <Bar dataKey="revenueInLakhs" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={26} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
