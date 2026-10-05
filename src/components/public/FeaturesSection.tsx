import React from 'react';
import {
  Navigation, Package, Truck, Users, Warehouse, Route,
  ReceiptText, BarChart3, UserCheck, Shield, Bell, Headphones,
  Sparkles
} from 'lucide-react';

const features = [
  {
    icon: Navigation,
    title: 'Real-Time Visibility',
    desc: 'Continuous GPS tracking, geofence checkpoints, and automated delay notifications.',
  },
  {
    icon: Package,
    title: 'Order Management',
    desc: 'Centralized intake for B2B orders with automatic weight, volume, and priority rating.',
  },
  {
    icon: Truck,
    title: 'Fleet Management',
    desc: 'Track vehicle maintenance odometers, fuel metrics, insurance renewals, and availability.',
  },
  {
    icon: Users,
    title: 'Driver Telematics',
    desc: 'Assign drivers by license class, monitor driving hours, and verify trip performance.',
  },
  {
    icon: Warehouse,
    title: 'Warehouse Hubs',
    desc: 'Multi-location inventory tracking, binning workflows, and automated safety stock alerts.',
  },
  {
    icon: Route,
    title: 'Route Optimization',
    desc: 'Plan regional multi-stop highway corridors with distance and toll calculations.',
  },
  {
    icon: ReceiptText,
    title: 'Automated Invoicing',
    desc: 'Generate GST-compliant tax invoices, track payment status, and export PDF billing statements.',
  },
  {
    icon: BarChart3,
    title: 'Operational Analytics',
    desc: 'Track on-time delivery percentages, revenue by corridor, and fleet utilization rates.',
  },
  {
    icon: UserCheck,
    title: 'Customer Portal',
    desc: 'Dedicated self-service portal for enterprise clients to place orders and track cargo.',
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    desc: 'Granular permissions separating admin dispatchers, warehouse operators, and customers.',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    desc: 'Real-time alert toasts, status change emails, and driver milestone triggers.',
  },
  {
    icon: Headphones,
    title: 'Support Desk',
    desc: 'Integrated ticketing system to resolve dispatch issues, damages, and delivery inquiries.',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" style={{ padding: '96px 0', backgroundColor: '#ffffff' }}>
      <div className="pr-container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 64px' }}>
          <div className="pr-section-tag">
            <Sparkles size={14} />
            <span>Platform Capabilities</span>
          </div>
          <h2 className="pr-section-title">
            Built for Modern Logistics Teams.
          </h2>
          <p className="pr-section-subtitle" style={{ margin: '0 auto' }}>
            A complete suite of operational tools designed to replace fragmented spreadsheets and legacy dispatch tools.
          </p>
        </div>

        {/* 12 Feature Cards Grid */}
        <div className="pr-feature-grid">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="pr-feature-card">
                <div className="pr-feature-icon">
                  <Icon size={24} />
                </div>
                <h4 className="pr-feature-title">{feat.title}</h4>
                <p className="pr-feature-desc">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
