import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Truck, Users, Wallet, Shield, CheckCircle2,
  ChevronRight, ArrowRight, LayoutDashboard, Navigation,
  Warehouse, ReceiptText, BarChart2, Headphones, Settings,
  ShieldCheck
} from 'lucide-react';
import publicService, { type PublicStatistics } from '../../services/publicService';

export default function AdminPlatformPreview() {
  const [stats, setStats] = useState<PublicStatistics | null>(null);

  useEffect(() => {
    publicService.getPublicStatistics()
      .then(data => setStats(data))
      .catch(() => {});
  }, []);

  const totalOrders = stats ? stats.shipmentsManaged + 4 : 15;
  const totalShipments = stats ? stats.shipmentsManaged : 11;
  const totalCustomers = stats ? stats.activeCustomers : 15;
  const inTransit = stats ? stats.inTransitShipments : 3;
  return (
    <section id="portals" style={{ padding: '96px 0', backgroundColor: '#ffffff' }}>
      <div className="pr-container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 60px' }}>
          <div className="pr-section-tag">
            <Shield size={14} />
            <span>Operations Command Center</span>
          </div>
          <h2 className="pr-section-title">
            One Command Center for Your Operations Team.
          </h2>
          <p className="pr-section-subtitle" style={{ margin: '0 auto 24px' }}>
            Manage orders, dispatch fleet, allocate warehouse space, track drivers, and review profitability from a centralized workspace.
          </p>
          <div>
            <Link to="/signin/admin" className="pr-btn-primary" style={{ padding: '12px 28px' }}>
              <span>Explore Admin Platform</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Browser Mockup of the Admin Portal */}
        <div
          style={{
            background: '#0f172a',
            border: '1px solid #cbd5e1',
            borderRadius: '16px',
            boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.25)',
            overflow: 'hidden',
          }}
        >
          {/* Top Window Chrome */}
          <div
            style={{
              background: '#1e293b',
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div style={{ display: 'flex', gap: '7px' }}>
              <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#ef4444' }}></div>
              <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#f59e0b' }}></div>
              <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#10b981' }}></div>
            </div>
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '6px',
                padding: '4px 20px',
                fontSize: '12px',
                color: '#94a3b8',
                fontFamily: 'monospace',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <ShieldCheck size={12} color="#10b981" />
              <span>https://app.primeroute.com/admin/dashboard</span>
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>
              Admin Portal
            </div>
          </div>

          {/* Body: Sidebar + Main Content */}
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '520px' }}>
            {/* Sidebar Mock */}
            <div
              style={{
                background: '#F7FAFF',
                borderRight: '1px solid #D7E5F5',
                padding: '20px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div style={{ padding: '0 8px 16px', borderBottom: '1px solid #D7E5F5', marginBottom: '10px' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#172033' }}>PrimeRoute</div>
                <div style={{ fontSize: '10.5px', color: '#64748B' }}>Operations Control</div>
              </div>

              <div style={{ background: '#EAF3FF', color: '#1D4ED8', border: '1px solid #D7E5F5', borderRadius: '8px', padding: '8px 12px', fontSize: '12.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LayoutDashboard size={15} />
                <span>Dashboard</span>
              </div>
              <div style={{ color: '#334155', padding: '8px 12px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={15} color="#64748B" />
                <span>Orders (1,284)</span>
              </div>
              <div style={{ color: '#334155', padding: '8px 12px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={15} color="#64748B" />
                <span>Shipments (986)</span>
              </div>
              <div style={{ color: '#334155', padding: '8px 12px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={15} color="#64748B" />
                <span>Customers</span>
              </div>
              <div style={{ color: '#334155', padding: '8px 12px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Navigation size={15} color="#64748B" />
                <span>Drivers & Fleet</span>
              </div>
              <div style={{ color: '#334155', padding: '8px 12px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Warehouse size={15} color="#64748B" />
                <span>Warehouses</span>
              </div>
              <div style={{ color: '#334155', padding: '8px 12px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ReceiptText size={15} color="#64748B" />
                <span>Invoices</span>
              </div>
              <div style={{ color: '#334155', padding: '8px 12px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart2 size={15} color="#64748B" />
                <span>Reports</span>
              </div>
            </div>

            {/* Dashboard Workspace */}
            <div style={{ background: '#f8fafc', padding: '24px', overflowY: 'auto' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Operations Overview
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>
                    Real-time operational health & dispatch metrics
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ fontSize: '11px', background: '#ecfdf5', color: '#059669', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>
                    ● System Normal
                  </span>
                </div>
              </div>

              {/* 4 Admin KPI Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '11px' }}>
                    <span>TOTAL ORDERS</span>
                    <Package size={14} color="#2563eb" />
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                    {totalOrders}
                  </div>
                  <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '2px' }}>
                    Active queue
                  </div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '11px' }}>
                    <span>TOTAL SHIPMENTS</span>
                    <Truck size={14} color="#4f46e5" />
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                    {totalShipments}
                  </div>
                  <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '2px' }}>
                    {inTransit} in transit
                  </div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '11px' }}>
                    <span>TOTAL CUSTOMERS</span>
                    <Users size={14} color="#7c3aed" />
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                    {totalCustomers}
                  </div>
                  <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '2px' }}>
                    Enterprise verified
                  </div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '11px' }}>
                    <span>AVAILABILITY</span>
                    <Wallet size={14} color="#16a34a" />
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                    24/7 Ops
                  </div>
                  <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '2px' }}>
                    Live dispatch
                  </div>
                </div>
              </div>

              {/* Table Preview */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ padding: '12px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Live Order Queue</span>
                  <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600 }}>Active Stream</span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: '11px' }}>
                      <th style={{ padding: '8px 18px', textAlign: 'left' }}>Order ID</th>
                      <th style={{ padding: '8px 18px', textAlign: 'left' }}>Customer</th>
                      <th style={{ padding: '8px 18px', textAlign: 'left' }}>Destination</th>
                      <th style={{ padding: '8px 18px', textAlign: 'left' }}>Delivery Type</th>
                      <th style={{ padding: '8px 18px', textAlign: 'left' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: 'PR-ORD-71673158', customer: 'Nexus Electronics Ltd', dest: 'Bengaluru, KA', type: 'EXPRESS', status: 'PENDING' },
                      { id: 'PR-ORD-48291054', customer: 'AeroTech Systems', dest: 'Hyderabad, TS', type: 'STANDARD', status: 'CONFIRMED' },
                      { id: 'PR-ORD-62910482', customer: 'Sigma Retail Logistics', dest: 'Mumbai, MH', type: 'PRIORITY', status: 'IN_TRANSIT' },
                    ].map((ord) => (
                      <tr key={ord.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                        <td style={{ padding: '10px 18px', fontWeight: 700, fontFamily: 'monospace' }}>{ord.id}</td>
                        <td style={{ padding: '10px 18px', color: '#334155' }}>{ord.customer}</td>
                        <td style={{ padding: '10px 18px', color: '#64748b' }}>{ord.dest}</td>
                        <td style={{ padding: '10px 18px', fontWeight: 600, color: '#4f46e5' }}>{ord.type}</td>
                        <td style={{ padding: '10px 18px' }}>
                          <span style={{ fontSize: '10.5px', background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                            {ord.status}
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
      </div>
    </section>
  );
}
