import React, { useState } from 'react';
import {
  Package, Search, Filter, CheckCircle2, Clock,
  Truck, Warehouse, Users, ArrowRight, MapPin, AlertCircle,
  ShieldCheck, ArrowUpRight, BarChart2, Check
} from 'lucide-react';

export default function PlatformSection() {
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('ALL');

  const ordersList = [
    {
      id: 'ORD-10248',
      customer: 'Acme Retail Ltd',
      route: 'Mumbai → Pune',
      amount: '₹12,400',
      status: 'In Transit',
      priority: 'Express',
      color: '#2563eb',
      bg: '#eff6ff',
    },
    {
      id: 'ORD-10249',
      customer: 'Nova Commerce',
      route: 'Delhi → Jaipur',
      amount: '₹8,200',
      status: 'Processing',
      priority: 'Standard',
      color: '#d97706',
      bg: '#fffbeb',
    },
    {
      id: 'ORD-10250',
      customer: 'TechWorld Systems',
      route: 'Pune → Bangalore',
      amount: '₹18,600',
      status: 'Delivered',
      priority: 'Same Day',
      color: '#16a34a',
      bg: '#f0fdf4',
    },
  ];

  return (
    <section id="platform" style={{ padding: '96px 0', backgroundColor: '#f8fafc' }}>
      <div className="pr-container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 72px' }}>
          <div className="pr-section-tag">
            <span>Modular Core Platform</span>
          </div>
          <h2 className="pr-section-title">
            Everything Your Logistics Operation Needs.
          </h2>
          <p className="pr-section-subtitle" style={{ margin: '0 auto' }}>
            Purpose-built tools for enterprise dispatchers, fleet operators, warehouse managers, and B2B clients.
          </p>
        </div>

        {/* 1. ORDER MANAGEMENT SHOWCASE (Left: Text, Right: UI) */}
        <div className="pr-showcase-row">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2563eb', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', marginBottom: '8px' }}>
              <Package size={16} /> Order Management
            </div>
            <h3 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 16px' }}>
              From Order Creation to Dispatch.
            </h3>
            <p style={{ fontSize: '16px', color: '#475569', lineHeight: 1.65, margin: '0 0 24px' }}>
              Create, organize and monitor customer orders from a single operational workspace. Auto-calculate distance charges, assign priority tiers, and dispatch orders with instant digital manifests.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14.5px', color: '#1e293b', fontWeight: 500 }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={14} />
                </div>
                <span>Automated multi-carrier rate calculation & tax breakdown</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14.5px', color: '#1e293b', fontWeight: 500 }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={14} />
                </div>
                <span>Bulk CSV import and REST API order ingestion</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14.5px', color: '#1e293b', fontWeight: 500 }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={14} />
                </div>
                <span>Instant dispatch assignment to optimal warehouse hubs</span>
              </div>
            </div>
          </div>

          {/* Realistic Order Management UI Preview */}
          <div className="pr-showcase-card">
            {/* Top Toolbar */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', borderRadius: '8px', padding: '6px 12px', flex: 1 }}>
                <Search size={15} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Search Orders by ID, Customer..."
                  style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', width: '100%', color: '#0f172a' }}
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, background: '#2563eb', color: '#ffffff', padding: '6px 12px', borderRadius: '6px' }}>
                  All (1,284)
                </span>
                <span style={{ fontSize: '12px', fontWeight: 600, background: '#f1f5f9', color: '#64748b', padding: '6px 12px', borderRadius: '6px' }}>
                  Active
                </span>
              </div>
            </div>

            {/* Orders Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '12px 18px' }}>Order ID</th>
                    <th style={{ padding: '12px 18px' }}>Customer</th>
                    <th style={{ padding: '12px 18px' }}>Route</th>
                    <th style={{ padding: '12px 18px' }}>Amount</th>
                    <th style={{ padding: '12px 18px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersList.map((ord) => (
                    <tr key={ord.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
                        {ord.id}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 600, color: '#334155' }}>
                        {ord.customer}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#64748b' }}>
                        {ord.route}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a' }}>
                        {ord.amount}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: '4px',
                            color: ord.color,
                            background: ord.bg,
                          }}
                        >
                          ● {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ padding: '12px 20px', background: '#fafbfc', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
              <span>Showing 3 of 1,284 live bookings</span>
              <span style={{ color: '#2563eb', fontWeight: 600, cursor: 'pointer' }}>View All Orders →</span>
            </div>
          </div>
        </div>

        {/* 2. SHIPMENT MANAGEMENT SHOWCASE (Left: UI, Right: Text) */}
        <div className="pr-showcase-row">
          {/* Realistic Shipment UI Preview */}
          <div className="pr-showcase-card" style={{ order: 2 }}>
            <div style={{ padding: '20px', background: '#0f172a', color: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: '#60a5fa', fontWeight: 700, textTransform: 'uppercase' }}>
                  SHIPMENT DETAILS
                </span>
                <span style={{ fontSize: '12px', background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                  ● IN TRANSIT
                </span>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'monospace' }}>
                TRK-2026-00124
              </div>
              <div style={{ fontSize: '12.5px', color: '#94a3b8', marginTop: '4px' }}>
                Assigned Carrier: <strong style={{ color: '#ffffff' }}>PrimeRoute Express Logistics</strong>
              </div>
            </div>

            {/* Timeline Progress */}
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
                {/* Step 1 */}
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#16a34a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                      ✓
                    </div>
                    <div style={{ width: '2px', height: '36px', background: '#16a34a', margin: '4px 0' }}></div>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                      Mumbai Hub — Pickup Completed
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      05 Sep 2026, 08:30 AM • Scanned at Dock 12
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                      ●
                    </div>
                    <div style={{ width: '2px', height: '36px', background: '#e2e8f0', margin: '4px 0' }}></div>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#2563eb' }}>
                      Pune Distribution Center — In Transit
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      05 Sep 2026, 02:45 PM • Vehicle MH-12-AB-4521
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid #cbd5e1', background: '#ffffff' }}></div>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>
                      Bangalore Destination Hub — Delivery
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                      Expected Delivery: <strong>06 September 2026</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Driver and Vehicle Meta */}
              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Assigned Driver</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Rajesh Kumar</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Transport Vehicle</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>MH-12-AB-4521</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ order: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2563eb', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', marginBottom: '8px' }}>
              <Truck size={16} /> Shipment Visibility
            </div>
            <h3 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 16px' }}>
              Every Shipment. Visible.
            </h3>
            <p style={{ fontSize: '16px', color: '#475569', lineHeight: 1.65, margin: '0 0 24px' }}>
              Track shipment progress from pickup to final delivery. Get real-time status milestones, driver telematics, route delay alerts, and instant electronic proof-of-delivery (ePOD) confirmations.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14.5px', color: '#1e293b', fontWeight: 500 }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={14} />
                </div>
                <span>Granular milestone history with automated timestamps</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14.5px', color: '#1e293b', fontWeight: 500 }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={14} />
                </div>
                <span>Proactive delay alerts & automatic alternate routing</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14.5px', color: '#1e293b', fontWeight: 500 }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={14} />
                </div>
                <span>Digital customer signature and photo delivery verification</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. WAREHOUSE MANAGEMENT SHOWCASE (Left: Text, Right: UI) */}
        <div className="pr-showcase-row">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2563eb', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', marginBottom: '8px' }}>
              <Warehouse size={16} /> Warehouse Operations
            </div>
            <h3 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 16px' }}>
              Keep Warehouse Operations Moving.
            </h3>
            <p style={{ fontSize: '16px', color: '#475569', lineHeight: 1.65, margin: '0 0 24px' }}>
              Streamline multi-hub warehouse storage, SKU tracking, bin allocation, and staging docks. Avoid stockouts with automated threshold reorder triggers and fast dock turnaround.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14.5px', color: '#1e293b', fontWeight: 500 }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={14} />
                </div>
                <span>Live SKU inventory counts across all regional fulfillment centers</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14.5px', color: '#1e293b', fontWeight: 500 }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={14} />
                </div>
                <span>Low-stock alerts and predictive inventory turnover analytics</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14.5px', color: '#1e293b', fontWeight: 500 }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={14} />
                </div>
                <span>Inbound cross-docking and fast outbound parcel sorting</span>
              </div>
            </div>
          </div>

          {/* Warehouse UI Preview */}
          <div className="pr-showcase-card">
            <div style={{ padding: '18px 20px', borderBottom: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
                  FULFILLMENT HUB
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                  Mumbai Central Warehouse (WH-01)
                </div>
              </div>
              <span style={{ fontSize: '12px', background: '#ecfdf5', color: '#059669', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>
                ● 74% Utilized
              </span>
            </div>

            {/* Warehouse Mini KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: '#e2e8f0' }}>
              <div style={{ background: '#ffffff', padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Total Inventory</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>24,850</div>
              </div>
              <div style={{ background: '#ffffff', padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Available</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#16a34a', marginTop: '2px' }}>18,420</div>
              </div>
              <div style={{ background: '#ffffff', padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Reserved</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#2563eb', marginTop: '2px' }}>5,820</div>
              </div>
              <div style={{ background: '#ffffff', padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Low Stock</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#dc2626', marginTop: '2px' }}>610</div>
              </div>
            </div>

            {/* SKU inventory table */}
            <div style={{ padding: '0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 18px', textAlign: 'left' }}>SKU</th>
                    <th style={{ padding: '10px 18px', textAlign: 'left' }}>Product</th>
                    <th style={{ padding: '10px 18px', textAlign: 'left' }}>Stock</th>
                    <th style={{ padding: '10px 18px', textAlign: 'left' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 18px', fontWeight: 700, fontFamily: 'monospace' }}>SKU-8821</td>
                    <td style={{ padding: '12px 18px', color: '#334155' }}>Industrial Bearings 50mm</td>
                    <td style={{ padding: '12px 18px', fontWeight: 700 }}>4,200 units</td>
                    <td style={{ padding: '12px 18px' }}>
                      <span style={{ fontSize: '10.5px', background: '#ecfdf5', color: '#059669', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>In Stock</span>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 18px', fontWeight: 700, fontFamily: 'monospace' }}>SKU-4410</td>
                    <td style={{ padding: '12px 18px', color: '#334155' }}>Electronic Sensor Modules</td>
                    <td style={{ padding: '12px 18px', fontWeight: 700 }}>1,840 units</td>
                    <td style={{ padding: '12px 18px' }}>
                      <span style={{ fontSize: '10.5px', background: '#ecfdf5', color: '#059669', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>In Stock</span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px 18px', fontWeight: 700, fontFamily: 'monospace' }}>SKU-9904</td>
                    <td style={{ padding: '12px 18px', color: '#334155' }}>Hydraulic Seal Assemblies</td>
                    <td style={{ padding: '12px 18px', fontWeight: 700 }}>142 units</td>
                    <td style={{ padding: '12px 18px' }}>
                      <span style={{ fontSize: '10.5px', background: '#fef2f2', color: '#dc2626', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>Reorder Alert</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 4. FLEET & DRIVER MANAGEMENT SHOWCASE (Left: UI, Right: Text) */}
        <div className="pr-showcase-row" style={{ marginBottom: 0 }}>
          {/* Fleet UI Preview */}
          <div className="pr-showcase-card" style={{ order: 2 }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
                  TELEMATICS ROSTER
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                  Active Fleet & Telematics
                </div>
              </div>
              <span style={{ fontSize: '12px', background: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>
                142 Vehicles Live
              </span>
            </div>

            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Vehicle 1 */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>VEH-1024</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>MH-12-AB-4521</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                    Mumbai → Pune Corridor • Driver: Rajesh K.
                  </div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 600, background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: '4px' }}>
                  ● Active
                </span>
              </div>

              {/* Vehicle 2 */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>VEH-1048</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>MH-14-CD-7812</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                    Delhi → Jaipur Highway • Driver: Vikram S.
                  </div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 600, background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: '4px' }}>
                  ● Active
                </span>
              </div>

              {/* Vehicle 3 */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>VEH-1092</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>DL-08-EF-2190</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                    Brake Inspection & Filter Service
                  </div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 600, background: '#fffbeb', color: '#d97706', padding: '3px 8px', borderRadius: '4px' }}>
                  ● Maintenance
                </span>
              </div>
            </div>
          </div>

          <div style={{ order: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2563eb', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', marginBottom: '8px' }}>
              <Users size={16} /> Fleet & Driver Intelligence
            </div>
            <h3 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 16px' }}>
              Know Your Fleet. At Every Moment.
            </h3>
            <p style={{ fontSize: '16px', color: '#475569', lineHeight: 1.65, margin: '0 0 24px' }}>
              Gain complete visibility over your trucks, vans, and drivers. Schedule maintenance, track driver hours of service (HOS), and maintain vehicle safety compliance automatically.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14.5px', color: '#1e293b', fontWeight: 500 }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={14} />
                </div>
                <span>Vehicle assignment based on payload capacity & route restrictions</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14.5px', color: '#1e293b', fontWeight: 500 }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={14} />
                </div>
                <span>Automated maintenance odometer alerts and service logs</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14.5px', color: '#1e293b', fontWeight: 500 }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={14} />
                </div>
                <span>Driver safety scoring and on-time performance metrics</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
