import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'indigo' | 'purple';
  subtitle?: string;
}

export default function KpiCard({
  label, value, change, changeLabel = 'from last month',
  icon, color = 'blue', subtitle,
}: KpiCardProps) {
  const isPositive = (change ?? 0) >= 0;
  return (
    <div className={`kpi-card ${color}`}>
      <div className="kpi-top">
        <div>
          <p className="kpi-label">{label}</p>
        </div>
        <div className={`kpi-icon ${color}`}>{icon}</div>
      </div>
      <p className="kpi-value">{value}</p>
      {change !== undefined && (
        <div className={`kpi-change ${isPositive ? 'up' : 'down'}`}>
          {isPositive
            ? <TrendingUp size={12} />
            : <TrendingDown size={12} />}
          {Math.abs(change)}%
          <span className="kpi-change-note">{changeLabel}</span>
        </div>
      )}
      {subtitle && !change && (
        <p className="text-xs text-muted mt-2">{subtitle}</p>
      )}
    </div>
  );
}
