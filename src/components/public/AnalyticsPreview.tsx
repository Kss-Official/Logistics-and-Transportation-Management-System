import React from 'react';
import {
  BarChart2, TrendingUp, CheckCircle2, Truck, Warehouse,
  ShieldCheck, ArrowUpRight, Award, Zap
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

const analyticsVolumeData = [
  { month: 'Jan', volume: 820, onTime: 760 },
  { month: 'Feb', volume: 940, onTime: 890 },
  { month: 'Mar', volume: 1100, onTime: 1040 },
  { month: 'Apr', volume: 1250, onTime: 1190 },
  { month: 'May', volume: 1380, onTime: 1310 },
  { month: 'Jun', volume: 1540, onTime: 1480 },
];

export default function AnalyticsPreview() {
  return (
    <section id="analytics" style={{ padding: '96px 0', backgroundColor: '#0b1220', color: '#ffffff' }}>
      <div className="pr-container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 64px' }}>
          <div className="pr-section-tag dark">
            <BarChart2 size={14} />
            <span>Operational Intelligence</span>
          </div>
          <h2 className="pr-section-title dark">
            Turn Logistics Data Into Better Decisions.
          </h2>
          <p className="pr-section-subtitle dark" style={{ margin: '0 auto' }}>
            Transform raw dispatch logs and sensor telematics into actionable business intelligence across every corridor and regional hub.
          </p>
        </div>

        {/* 4 Big Operational Metric Blocks */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            marginBottom: '40px',
          }}
        >
          {/* On-Time Delivery */}
          <div
            style={{
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8', fontSize: '13px' }}>
              <span>On-Time Delivery</span>
              <CheckCircle2 size={18} color="#10b981" />
            </div>
            <div style={{ fontSize: '38px', fontWeight: 800, color: '#10b981', margin: '8px 0 4px', letterSpacing: '-0.03em' }}>
              92.4%
            </div>
            <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
              Across 986 shipments this month
            </div>
          </div>

          {/* Fleet Utilization */}
          <div
            style={{
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8', fontSize: '13px' }}>
              <span>Fleet Utilization</span>
              <Truck size={18} color="#3b82f6" />
            </div>
            <div style={{ fontSize: '38px', fontWeight: 800, color: '#60a5fa', margin: '8px 0 4px', letterSpacing: '-0.03em' }}>
              78.0%
            </div>
            <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
              Active vs standby vehicles
            </div>
          </div>

          {/* Warehouse Capacity */}
          <div
            style={{
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8', fontSize: '13px' }}>
              <span>Warehouse Capacity</span>
              <Warehouse size={18} color="#f59e0b" />
            </div>
            <div style={{ fontSize: '38px', fontWeight: 800, color: '#f59e0b', margin: '8px 0 4px', letterSpacing: '-0.03em' }}>
              64.0%
            </div>
            <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
              Optimal staging threshold
            </div>
          </div>

          {/* Successful Deliveries */}
          <div
            style={{
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8', fontSize: '13px' }}>
              <span>Successful First-Attempt</span>
              <Award size={18} color="#818cf8" />
            </div>
            <div style={{ fontSize: '38px', fontWeight: 800, color: '#a5b4fc', margin: '8px 0 4px', letterSpacing: '-0.03em' }}>
              94.0%
            </div>
            <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
              First-touch ePOD verified
            </div>
          </div>
        </div>

        {/* Analytics Interactive Graph Visual */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '32px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#60a5fa', fontWeight: 700, textTransform: 'uppercase' }}>
                SHIPMENT VOLUME & SLA TREND
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', margin: '2px 0 0' }}>
                Monthly Consignment Growth vs On-Time Fulfillment
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#2563eb' }}></span> Total Volume
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#10b981' }}></span> On-Time
              </span>
            </div>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsVolumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="volume" fill="#2563eb" radius={[4, 4, 0, 0]} name="Total Shipments" />
                <Bar dataKey="onTime" fill="#10b981" radius={[4, 4, 0, 0]} name="On-Time Delivered" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
