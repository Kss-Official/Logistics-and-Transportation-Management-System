import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface OrdersStatusDonutProps {
  total?: number;
  ordersByStatus?: Record<string, number>;
  isLoading?: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pending', color: '#d97706' },
  CONFIRMED: { label: 'Confirmed', color: '#4f46e5' },
  PICKED_UP: { label: 'Picked Up', color: '#0891b2' },
  IN_TRANSIT: { label: 'In Transit', color: '#2563eb' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: '#7c3aed' },
  DELIVERED: { label: 'Delivered', color: '#059669' },
  CANCELLED: { label: 'Cancelled', color: '#dc2626' },
};

export default function OrdersStatusDonut({
  total = 0,
  ordersByStatus = {},
  isLoading = false,
}: OrdersStatusDonutProps) {
  if (isLoading) {
    return (
      <div className="chart-card">
        <div className="chart-header">
          <div>
            <h3 className="chart-title">Orders by Status</h3>
            <p className="chart-subtitle">Current distribution</p>
          </div>
        </div>
        <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner-border text-primary" style={{ width: 28, height: 28, border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      </div>
    );
  }

  // Normalize incoming ordersByStatus keys
  const normalizedEntries = Object.entries(ordersByStatus || {}).map(([key, val]) => [
    key.toUpperCase().trim(),
    Number(val) || 0
  ] as [string, number]);

  const items: Array<{ name: string; value: number; color: string; statusKey: string }> = [];
  const processedKeys = new Set<string>();

  // Process standard backend statuses in preferred display order
  for (const [key, config] of Object.entries(STATUS_CONFIG)) {
    const matched = normalizedEntries.find(([k]) => k === key);
    const count = matched ? matched[1] : 0;
    if (count > 0) {
      items.push({
        name: config.label,
        value: count,
        color: config.color,
        statusKey: key,
      });
      processedKeys.add(key);
    }
  }

  // Handle any unexpected or non-standard status keys safely
  for (const [key, val] of normalizedEntries) {
    if (!processedKeys.has(key) && val > 0) {
      console.warn(`[OrdersStatusDonut] Non-standard order status encountered: "${key}" (count: ${val})`);
      const formattedLabel = key
        .split('_')
        .map(w => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ''))
        .filter(Boolean)
        .join(' ');
      items.push({
        name: formattedLabel || 'Other',
        value: val,
        color: '#64748b',
        statusKey: key,
      });
    }
  }

  const calculatedSum = items.reduce((acc, item) => acc + item.value, 0);
  const displayTotal = total > 0 ? total : calculatedSum;

  // Safe fallback: If total > 0 but items is empty (e.g. status keys were unrecognized), do not show empty state
  if (displayTotal > 0 && items.length === 0) {
    items.push({
      name: 'Active Orders',
      value: displayTotal,
      color: '#4f46e5',
      statusKey: 'ACTIVE',
    });
  }

  // If no orders at all in system for this authenticated customer
  const hasOrders = displayTotal > 0 && items.length > 0;
  const chartData = hasOrders ? items : [{ name: 'No Orders', value: 1, color: '#e2e8f0', statusKey: 'NONE' }];

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">Orders by Status</h3>
          <p className="chart-subtitle">Current database distribution</p>
        </div>
      </div>

      <div style={{ position: 'relative', width: '100%', height: 210 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={hasOrders ? 3 : 0}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            {hasOrders && (
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: 12,
                }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
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
          <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
            {displayTotal}
          </p>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 2 }}>
            Total
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12, minHeight: 90 }}>
        {hasOrders ? (
          items.map((item) => {
            const pct = displayTotal > 0 ? Math.round((item.value / displayTotal) * 100) : 0;
            return (
              <div
                key={item.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: item.color }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</span>
                  <span style={{ color: 'var(--text-muted)', width: 36, textAlign: 'right' }}>
                    ({pct}%)
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: 12 }}>
            No order distribution data recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
