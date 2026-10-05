import React from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Truck, Receipt, MapPin, CheckCircle2,
  Clock, ArrowRight, ShieldCheck, UserCheck, Plus
} from 'lucide-react';

export default function CustomerPlatformPreview() {
  const customerShipments = [
    { id: 'TRK-2026-000124', route: 'Mumbai → Pune', eta: '06 Sep 2026', status: 'In Transit', color: '#2563eb', bg: '#eff6ff' },
    { id: 'TRK-2026-000119', route: 'Mumbai → Andheri', eta: 'Delivered', status: 'Delivered', color: '#16a34a', bg: '#f0fdf4' },
    { id: 'TRK-2026-000117', route: 'Bengaluru → Noida', eta: 'Processing', status: 'Processing', color: '#d97706', bg: '#fffbeb' },
  ];

  return (
    <section style={{ padding: '96px 0', backgroundColor: '#f8fafc' }}>
      <div className="pr-container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 60px' }}>
          <div className="pr-section-tag">
            <UserCheck size={14} />
            <span>Customer Self-Service</span>
          </div>
          <h2 className="pr-section-title">
            Give Customers Complete Visibility.
          </h2>
          <p className="pr-section-subtitle" style={{ margin: '0 auto 24px' }}>
            A branded, intuitive self-service portal where enterprise clients can create freight bookings, track active consignments, download tax invoices, and manage addresses.
          </p>
          <div>
            <Link to="/signin/customer" className="pr-btn-primary" style={{ padding: '12px 28px' }}>
              <span>Explore Customer Portal</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Browser Mockup of the Customer Portal */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '16px',
            boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.15)',
            overflow: 'hidden',
          }}
        >
          {/* Top Window Chrome */}
          <div
            style={{
              background: '#f1f5f9',
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', gap: '7px' }}>
              <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#ef4444' }}></div>
              <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#f59e0b' }}></div>
              <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#10b981' }}></div>
            </div>
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '4px 20px',
                fontSize: '12px',
                color: '#475569',
                fontFamily: 'monospace',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <ShieldCheck size={12} color="#2563eb" />
              <span>https://app.primeroute.com/customer/dashboard</span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
              Customer Portal
            </div>
          </div>

          {/* Body: Sidebar + Main Content */}
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '480px' }}>
            {/* Sidebar Mock */}
            <div
              style={{
                background: '#ffffff',
                borderRight: '1px solid #e2e8f0',
                padding: '20px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div style={{ padding: '0 8px 16px', borderBottom: '1px solid #f1f5f9', marginBottom: '10px' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>PrimeRoute</div>
                <div style={{ fontSize: '10.5px', color: '#64748b' }}>Customer Portal</div>
              </div>

              <div style={{ background: '#2563eb', color: '#ffffff', borderRadius: '8px', padding: '8px 12px', fontSize: '12.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={15} />
                <span>My Dashboard</span>
              </div>
              <div style={{ color: '#475569', padding: '8px 12px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={15} />
                <span>Book New Order</span>
              </div>
              <div style={{ color: '#475569', padding: '8px 12px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={15} />
                <span>Track Shipments</span>
              </div>
              <div style={{ color: '#475569', padding: '8px 12px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Receipt size={15} />
                <span>Invoices & GST</span>
              </div>
              <div style={{ color: '#475569', padding: '8px 12px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={15} />
                <span>Saved Locations</span>
              </div>
            </div>

            {/* Workspace Canvas */}
            <div style={{ background: '#f8fafc', padding: '24px' }}>
              {/* Customer Greeting */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Welcome back, Acme Corporation
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0' }}>
                    Account ID: <strong style={{ color: '#0f172a' }}>CUST-1042</strong> • Active Contract: Tier 1 Enterprise
                  </p>
                </div>
                <button
                  style={{
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Plus size={14} /> + New Booking
                </button>
              </div>

              {/* 4 Customer KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>Active Shipments</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>8</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>In transit now</div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>Delivered</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>42</div>
                  <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '2px' }}>100% on time</div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>Pending Pickup</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>3</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Awaiting dispatch</div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>Invoices</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>12</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>All settled</div>
                </div>
              </div>

              {/* Recent Shipments List */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ padding: '12px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Recent Shipments</span>
                  <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600 }}>Track All →</span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: '11px' }}>
                      <th style={{ padding: '8px 18px', textAlign: 'left' }}>Tracking #</th>
                      <th style={{ padding: '8px 18px', textAlign: 'left' }}>Route</th>
                      <th style={{ padding: '8px 18px', textAlign: 'left' }}>ETA / Status Date</th>
                      <th style={{ padding: '8px 18px', textAlign: 'left' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerShipments.map((cs) => (
                      <tr key={cs.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                        <td style={{ padding: '10px 18px', fontWeight: 700, fontFamily: 'monospace', color: '#0f172a' }}>{cs.id}</td>
                        <td style={{ padding: '10px 18px', color: '#334155' }}>{cs.route}</td>
                        <td style={{ padding: '10px 18px', color: '#64748b' }}>{cs.eta}</td>
                        <td style={{ padding: '10px 18px' }}>
                          <span style={{ fontSize: '10.5px', background: cs.bg, color: cs.color, padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                            ● {cs.status}
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
