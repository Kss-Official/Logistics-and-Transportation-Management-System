import React, { useState } from 'react';
import {
  Package, Truck, CheckCircle2, Clock,
  ArrowUpRight, Activity, ShieldCheck, MapPin
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip
} from 'recharts';

const chartData = [
  { time: '06:00', shipments: 120, delivered: 85 },
  { time: '09:00', shipments: 340, delivered: 210 },
  { time: '12:00', shipments: 580, delivered: 420 },
  { time: '15:00', shipments: 790, delivered: 630 },
  { time: '18:00', shipments: 920, delivered: 780 },
  { time: '21:00', shipments: 986, delivered: 890 },
];

const liveShipments = [
  {
    id: 'TRK-2026-00124',
    origin: 'Mumbai Central Hub',
    destination: 'Pune Distribution Center',
    route: 'Mumbai → Pune',
    status: 'In Transit',
    driver: 'Rajesh Kumar',
    vehicle: 'MH-12-AB-4521',
    eta: 'Today, 16:45',
    progress: 68,
    statusColor: '#3b82f6',
    statusBg: 'rgba(59, 130, 246, 0.15)',
  },
  {
    id: 'TRK-2026-00125',
    origin: 'Delhi Northern Hub',
    destination: 'Jaipur Logistics Park',
    route: 'Delhi → Jaipur',
    status: 'Out for Delivery',
    driver: 'Vikram Singh',
    vehicle: 'DL-01-CD-8832',
    eta: 'Today, 14:15',
    progress: 92,
    statusColor: '#f59e0b',
    statusBg: 'rgba(245, 158, 11, 0.15)',
  },
  {
    id: 'TRK-2026-00126',
    origin: 'Pune Depot #4',
    destination: 'Bangalore South DC',
    route: 'Pune → Bangalore',
    status: 'Delivered',
    driver: 'Suresh Patil',
    vehicle: 'KA-05-EF-1902',
    eta: 'Delivered (11:20 AM)',
    progress: 100,
    statusColor: '#10b981',
    statusBg: 'rgba(16, 185, 129, 0.15)',
  },
];

export default function HeroDashboard() {
  const [activeTab, setActiveTab] = useState<'live' | 'performance'>('live');

  return (
    <div className="pr-hero-preview-wrapper">
      {/* Floating Status Notification Badges */}
      <div
        className="pr-floating-pill"
        style={{
          top: '-20px',
          left: '2%',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10b981',
          }}
        >
          <CheckCircle2 size={16} />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Shipment Delivered</div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>
            TRK-2026-00126 ✓
          </div>
        </div>
      </div>

      <div
        className="pr-floating-pill"
        style={{
          top: '30%',
          right: '-15px',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animationDelay: '1.5s',
        }}
      >
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'rgba(59, 130, 246, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#60a5fa',
          }}
        >
          <Truck size={16} />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Vehicle Assigned</div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>
            MH-12-AB-4521 🚚
          </div>
        </div>
      </div>

      <div
        className="pr-floating-pill"
        style={{
          bottom: '-15px',
          left: '10%',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animationDelay: '2.5s',
        }}
      >
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#a5b4fc',
          }}
        >
          <Activity size={16} />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Telematics</div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>
            Live Dispatch Active ⚡
          </div>
        </div>
      </div>

      {/* Main Browser / Frame Container */}
      <div className="pr-hero-dashboard-frame">
        {/* Browser Top Bar */}
        <div className="pr-browser-topbar">
          <div className="pr-browser-dots">
            <div className="pr-browser-dot red"></div>
            <div className="pr-browser-dot yellow"></div>
            <div className="pr-browser-dot green"></div>
          </div>
          <div className="pr-browser-address">
            <ShieldCheck size={12} color="#10b981" />
            <span>app.primeroute.com/control-tower</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '11px',
                color: '#10b981',
                background: 'rgba(16, 185, 129, 0.15)',
                padding: '2px 8px',
                borderRadius: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span className="pr-live-dot" style={{ width: '6px', height: '6px' }}></span>
              LIVE SYNC
            </span>
          </div>
        </div>

        {/* Dashboard Inner Canvas */}
        <div style={{ padding: '24px', background: '#0a0f1d' }}>
          {/* Dashboard Header Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#60a5fa',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                PRIMEROUTE CONTROL TOWER
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', margin: '2px 0 0' }}>
                Live Operations Center
              </h3>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setActiveTab('live')}
                style={{
                  background: activeTab === 'live' ? '#2563eb' : 'rgba(255,255,255,0.06)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Live Overview
              </button>
              <button
                onClick={() => setActiveTab('performance')}
                style={{
                  background: activeTab === 'performance' ? '#2563eb' : 'rgba(255,255,255,0.06)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Performance Chart
              </button>
            </div>
          </div>

          {/* 5 KPI Metric Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            {/* Orders */}
            <div
              style={{
                background: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8', fontSize: '12px' }}>
                <span>Orders</span>
                <Package size={14} color="#60a5fa" />
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
                1,284
              </div>
              <div style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '2px', marginTop: '4px' }}>
                <ArrowUpRight size={12} /> +12.4%
              </div>
            </div>

            {/* Shipments */}
            <div
              style={{
                background: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8', fontSize: '12px' }}>
                <span>Shipments</span>
                <Truck size={14} color="#818cf8" />
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
                986
              </div>
              <div style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '2px', marginTop: '4px' }}>
                <ArrowUpRight size={12} /> +8.2%
              </div>
            </div>

            {/* In Transit */}
            <div
              style={{
                background: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8', fontSize: '12px' }}>
                <span>In Transit</span>
                <Activity size={14} color="#38bdf8" />
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#38bdf8', marginTop: '6px' }}>
                312
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                Active fleet routes
              </div>
            </div>

            {/* Delivered */}
            <div
              style={{
                background: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8', fontSize: '12px' }}>
                <span>Delivered</span>
                <CheckCircle2 size={14} color="#10b981" />
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#10b981', marginTop: '6px' }}>
                674
              </div>
              <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px' }}>
                98.2% on-time
              </div>
            </div>

            {/* Delayed */}
            <div
              style={{
                background: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8', fontSize: '12px' }}>
                <span>Delayed</span>
                <Clock size={14} color="#f59e0b" />
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#f59e0b', marginTop: '6px' }}>
                18
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                Weather rerouted
              </div>
            </div>
          </div>

          {/* Chart / Live Shipments Split */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: activeTab === 'performance' ? '1fr' : '1fr 1.3fr',
              gap: '16px',
            }}
          >
            {/* Real Chart Visual */}
            <div
              style={{
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: '#60a5fa', fontWeight: 700, textTransform: 'uppercase' }}>
                    SHIPMENT PERFORMANCE
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>
                    Hourly Dispatch & Delivery
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Past 24 Hours</div>
              </div>

              <div style={{ width: '100%', height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="shipmentGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="deliveredGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '6px',
                        fontSize: '11px',
                        color: '#fff',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="shipments"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#shipmentGrad)"
                      name="In Transit"
                    />
                    <Area
                      type="monotone"
                      dataKey="delivered"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#deliveredGrad)"
                      name="Delivered"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Live Shipments Feed */}
            {activeTab === 'live' && (
              <div
                style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                  }}
                >
                  <div style={{ fontSize: '11px', color: '#60a5fa', fontWeight: 700, textTransform: 'uppercase' }}>
                    LIVE SHIPMENTS FEED
                  </div>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>Real-time Telematics</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {liveShipments.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc', fontFamily: 'monospace' }}>
                            {s.id}
                          </span>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 600,
                              color: s.statusColor,
                              background: s.statusBg,
                              padding: '2px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            ● {s.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={10} color="#60a5fa" />
                          <span>{s.route}</span>
                          <span style={{ color: '#64748b' }}>•</span>
                          <span>{s.vehicle}</span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', color: '#cbd5e1', fontWeight: 600 }}>
                          {s.eta}
                        </div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>
                          {s.driver}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
