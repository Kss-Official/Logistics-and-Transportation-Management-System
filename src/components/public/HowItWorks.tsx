import React from 'react';
import {
  FilePlus2, Barcode, Warehouse, Truck, Navigation, CheckCircle2,
  ArrowRight, Sparkles
} from 'lucide-react';

const steps = [
  {
    num: '01',
    title: 'Create Order',
    desc: 'Input freight details, pickup/delivery addresses, and service tiers. Instant automated quote and booking generation.',
    icon: FilePlus2,
  },
  {
    num: '02',
    title: 'Process Shipment',
    desc: 'Auto-generates unique barcode labels, bill of lading, and freight manifests for seamless transit handoffs.',
    icon: Barcode,
  },
  {
    num: '03',
    title: 'Assign Warehouse',
    desc: 'Inventory staged at strategic regional hubs. Verified with handheld bin scans and rapid dock allocation.',
    icon: Warehouse,
  },
  {
    num: '04',
    title: 'Assign Vehicle & Driver',
    desc: 'Smart dispatcher matches payload requirements with verified drivers and optimal heavy-duty vehicles.',
    icon: Truck,
  },
  {
    num: '05',
    title: 'Track in Real Time',
    desc: 'Continuous telematics and GPS geofences provide automated milestone updates to dispatchers and customers.',
    icon: Navigation,
  },
  {
    num: '06',
    title: 'Deliver & Confirm',
    desc: 'Recipient electronic signature (ePOD) confirms handover, closes the manifest, and issues the automated invoice.',
    icon: CheckCircle2,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding: '96px 0', backgroundColor: '#ffffff' }}>
      <div className="pr-container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 64px' }}>
          <div className="pr-section-tag">
            <Sparkles size={14} />
            <span>Execution Lifecycle</span>
          </div>
          <h2 className="pr-section-title">
            From Order to Delivery — Completely Connected.
          </h2>
          <p className="pr-section-subtitle" style={{ margin: '0 auto' }}>
            A streamlined 6-stage logistics pipeline designed for zero friction, complete transparency, and high on-time delivery rates.
          </p>
        </div>

        {/* 6 Step Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '28px',
          }}
        >
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '32px 28px',
                  position: 'relative',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#93c5fd';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(37, 99, 235, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Step Number Top Badge */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '20px',
                  }}
                >
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: '#eff6ff',
                      color: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <span
                    style={{
                      fontSize: '28px',
                      fontWeight: 800,
                      color: '#cbd5e1',
                      fontFamily: 'monospace',
                    }}
                  >
                    {step.num}
                  </span>
                </div>

                <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>
                  {step.title}
                </h4>

                <p style={{ fontSize: '14.5px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
