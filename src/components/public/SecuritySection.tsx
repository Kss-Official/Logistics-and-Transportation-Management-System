import React from 'react';
import { ShieldCheck, Lock, Database, FileCheck, Users, Eye } from 'lucide-react';

const trustItems = [
  {
    icon: Lock,
    title: 'Role-Based Access Control',
    desc: 'Strictly defined roles separating admin controllers, dispatch teams, warehouse personnel, and customers.',
  },
  {
    icon: Database,
    title: 'Centralized Data Architecture',
    desc: 'Unified operational data model ensuring synchronization across orders, manifests, and billing tables.',
  },
  {
    icon: Eye,
    title: 'Operational Visibility',
    desc: 'End-to-end audit trails for every shipment state change, driver assignment, and route alteration.',
  },
  {
    icon: FileCheck,
    title: 'Audit-Friendly Invoicing',
    desc: 'Automated invoice calculation with transparent base charges, weight tariffs, and GST breakdowns.',
  },
  {
    icon: Users,
    title: 'Client Data Isolation',
    desc: 'Secure customer boundaries ensuring shippers only view and access their own orders and invoices.',
  },
  {
    icon: ShieldCheck,
    title: 'Digital Proof of Delivery',
    desc: 'Tamper-evident electronic POD with receiver signature capture, timestamp verification, and recipient validation.',
  },
];

export default function SecuritySection() {
  return (
    <section style={{ padding: '96px 0', backgroundColor: '#ffffff' }}>
      <div className="pr-container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 60px' }}>
          <div className="pr-section-tag">
            <ShieldCheck size={14} />
            <span>Reliability & Architecture</span>
          </div>
          <h2 className="pr-section-title">
            Built for Operational Confidence.
          </h2>
          <p className="pr-section-subtitle" style={{ margin: '0 auto' }}>
            Enterprise architecture engineered for high-throughput logistics data, strict permission separation, and auditable operational workflows.
          </p>
        </div>

        {/* 6 Trust Pillars Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {trustItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '28px',
                  display: 'flex',
                  gap: '18px',
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
                    {item.title}
                  </h4>
                  <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.55, margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
