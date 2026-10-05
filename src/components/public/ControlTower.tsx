import React, { useState } from 'react';
import {
  ShoppingCart, PackageCheck, Send, Warehouse,
  Truck, ArrowRight, CheckCircle, Receipt, ArrowDown,
  Sparkles, CheckCircle2, MapPin, ShieldCheck
} from 'lucide-react';

const flowSteps = [
  {
    id: 1,
    title: 'Customer Order',
    sub: 'Direct API or Self-Service',
    icon: ShoppingCart,
    status: 'Booked',
    desc: 'Customer places booking online or via API. Auto-validates addresses, dimensions, priority, and generates instant tracking ID.',
    metric: 'Instant Booking',
    badgeColor: '#3b82f6',
  },
  {
    id: 2,
    title: 'Order Management',
    sub: 'Intake & Verification',
    icon: PackageCheck,
    status: 'Confirmed',
    desc: 'Dispatcher reviews line items, weight brackets, payment status, and schedules optimal dispatch window.',
    metric: 'Auto-Routing',
    badgeColor: '#6366f1',
  },
  {
    id: 3,
    title: 'Shipment Created',
    sub: 'Barcode & Manifest',
    icon: Send,
    status: 'Manifested',
    desc: 'Generates scannable shipping labels, consignment note, bill of lading, and locks assigned carrier route.',
    metric: 'TRK-2026 Issued',
    badgeColor: '#0ea5e9',
  },
  {
    id: 4,
    title: 'Warehouse Hub',
    sub: 'Binning & Staging',
    icon: Warehouse,
    status: 'Allocated',
    desc: 'Stock picked from warehouse bay, verified with handheld scanner, and moved to outbound staging dock.',
    metric: 'Bay 4A Staged',
    badgeColor: '#10b981',
  },
  {
    id: 5,
    title: 'Vehicle & Driver',
    sub: 'Telematics Assignment',
    icon: Truck,
    status: 'Assigned',
    desc: 'Driver allocated via mobile roster. Vehicle pre-trip inspection verified and route map loaded.',
    metric: 'MH-12 Assigned',
    badgeColor: '#f59e0b',
  },
  {
    id: 6,
    title: 'In Transit',
    sub: 'Live Hub Relays',
    icon: MapPin,
    status: 'Active Route',
    desc: 'Continuous GPS telemetry and geofence checkpoints update ETA in real-time across highway corridors.',
    metric: 'GPS Tracking',
    badgeColor: '#ec4899',
  },
  {
    id: 7,
    title: 'Out for Delivery',
    sub: 'Last-Mile Route',
    icon: ArrowRight,
    status: 'Last-Mile',
    desc: 'Driver arrives at receiver area, sends SMS notification, and navigates exact delivery address pin.',
    metric: 'ETA 25 mins',
    badgeColor: '#8b5cf6',
  },
  {
    id: 8,
    title: 'Delivered & Invoiced',
    sub: 'Digital ePOD & Billing',
    icon: Receipt,
    status: 'Completed',
    desc: 'Recipient signs digital proof-of-delivery (ePOD). System instantly marks order fulfilled and issues GST invoice.',
    metric: 'Paid & Closed',
    badgeColor: '#10b981',
  },
];

export default function ControlTower() {
  const [activeStep, setActiveStep] = useState(flowSteps[0]);

  return (
    <section
      id="control-tower"
      style={{
        padding: '96px 0',
        backgroundColor: '#0b1220',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient background glow */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          right: '5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.12) 0%, transparent 70%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
        }}
      ></div>

      <div className="pr-container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 56px' }}>
          <div className="pr-section-tag dark">
            <Sparkles size={14} />
            <span>End-to-End Orchestration</span>
          </div>
          <h2 className="pr-section-title dark">
            Your Entire Logistics Operation. One Control Tower.
          </h2>
          <p className="pr-section-subtitle dark" style={{ margin: '0 auto' }}>
            Connect orders, shipments, warehouses, vehicles, drivers and deliveries through one seamless operational platform.
          </p>
        </div>

        {/* Interactive Step Navigator */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '12px',
            marginBottom: '40px',
          }}
        >
          {flowSteps.map((step, idx) => {
            const Icon = step.icon;
            const isSelected = activeStep.id === step.id;
            return (
              <div
                key={step.id}
                onClick={() => setActiveStep(step)}
                style={{
                  background: isSelected ? 'rgba(37, 99, 235, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                  border: isSelected ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '16px 12px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: isSelected ? '#60a5fa' : '#64748b',
                    marginBottom: '6px',
                  }}
                >
                  STEP 0{step.id}
                </div>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    background: isSelected ? '#2563eb' : 'rgba(255,255,255,0.06)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 10px',
                  }}
                >
                  <Icon size={18} />
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', lineHeight: 1.2 }}>
                  {step.title}
                </div>
                <div style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '4px' }}>
                  {step.sub}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Stage Detail Showcase */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            padding: '32px',
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '32px',
            alignItems: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span
                style={{
                  background: activeStep.badgeColor,
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                }}
              >
                Stage {activeStep.id} of 8
              </span>
              <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>
                Status: <span style={{ color: '#ffffff' }}>{activeStep.status}</span>
              </span>
            </div>

            <h3 style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff', margin: '0 0 14px' }}>
              {activeStep.title} Workflow
            </h3>

            <p style={{ fontSize: '16px', color: '#cbd5e1', lineHeight: 1.6, margin: '0 0 24px' }}>
              {activeStep.desc}
            </p>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '12px 18px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Operational Output</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#60a5fa', marginTop: '2px' }}>
                  {activeStep.metric}
                </div>
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '12px 18px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Verification Level</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#10b981', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={16} /> Automated Audit
                </div>
              </div>
            </div>
          </div>

          {/* Realistic Visual Card for the selected step */}
          <div
            style={{
              background: '#0a0f1d',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="pr-live-dot"></span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>Control Tower Event</span>
              </div>
              <span style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>
                EVT-8829-0{activeStep.id}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#94a3b8' }}>Pipeline Phase:</span>
                <span style={{ color: '#ffffff', fontWeight: 600 }}>{activeStep.title}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#94a3b8' }}>Target Route:</span>
                <span style={{ color: '#60a5fa', fontWeight: 600 }}>Mumbai (BOM) → Bangalore (BLR)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#94a3b8' }}>System SLA:</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>On Track (99.4%)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#94a3b8' }}>Automated Check:</span>
                <span style={{ color: '#ffffff', fontWeight: 600 }}>Verified & Synced</span>
              </div>
            </div>

            <div
              style={{
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8' }}>
                <CheckCircle2 size={14} color="#10b981" />
                <span>Zero Manual Intervention</span>
              </div>
              <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 600 }}>
                Next: Step {activeStep.id < 8 ? activeStep.id + 1 : 1} →
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
