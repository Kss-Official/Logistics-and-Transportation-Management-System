import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import type { MonthlyRevenueStat } from '../../types/adminDashboard';

interface DeliveryPerformanceChartProps {
  data?: MonthlyRevenueStat[];
  isLoading?: boolean;
}

export default function DeliveryPerformanceChart({ data = [], isLoading = false }: DeliveryPerformanceChartProps) {
  const chartData = data.map((item) => {
    const delivered = item.delivered || 0;
    const inProgressOrDelayed = Math.max(0, (item.orders || 0) - delivered);
    return {
      month: item.month,
      delivered,
      inProgressOrDelayed,
      totalOrders: item.orders,
    };
  });

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">Delivery Performance</h3>
          <p className="chart-subtitle">Completed vs Active / In-progress dispatches</p>
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
                borderTopColor: '#059669',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
          </div>
        ) : chartData.length === 0 ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            No delivery records recorded.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
              <Bar dataKey="delivered" name="Delivered" fill="#059669" radius={[4, 4, 0, 0]} barSize={16} />
              <Bar dataKey="inProgressOrDelayed" name="Pending / Transit" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
