import React from 'react';
import {
  Package, Navigation, Warehouse, Truck, Users, ReceiptText, ArrowUpRight
} from 'lucide-react';

const capabilities = [
  {
    icon: Package,
    title: 'Order Management',
    desc: 'Automated intake, multi-item consolidation, priority routing.',
    badge: 'End-to-End',
  },
  {
    icon: Navigation,
    title: 'Shipment Tracking',
    desc: 'Live milestones, predictive ETA, customer self-service visibility.',
    badge: 'Real-time',
  },
  {
    icon: Warehouse,
    title: 'Warehouse Operations',
    desc: 'Bin level tracking, inventory thresholds, fast dispatch bays.',
    badge: 'Multi-Hub',
  },
  {
    icon: Truck,
    title: 'Fleet Management',
    desc: 'Live telematics, fuel telemetry, preventative maintenance logs.',
    badge: 'Telematics',
  },
  {
    icon: Users,
    title: 'Driver Management',
    desc: 'Route optimization, mobile proof-of-delivery, shift rosters.',
    badge: 'Mobile Ready',
  },
  {
    icon: ReceiptText,
    title: 'Billing & Invoicing',
    desc: 'Automated rate calculation, tax breakdowns, instant PDF invoices.',
    badge: 'Automated',
  },
];

export default function CapabilityStrip() {
  return (
    <section id="capabilities" className="pr-capability-strip">
      <div className="pr-container">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="pr-section-tag">
            <span>Operational Coverage</span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
            One Platform. Every Logistics Operation.
          </h2>
        </div>

        <div className="pr-capability-grid">
          {capabilities.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <div key={idx} className="pr-capability-item">
                <div className="pr-capability-icon">
                  <Icon size={22} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span className="pr-capability-title">{cap.title}</span>
                </div>
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: '0 0 10px', lineHeight: 1.45 }}>
                  {cap.desc}
                </p>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#2563eb',
                    background: '#eff6ff',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  {cap.badge}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
