import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, UserCheck, Check, ArrowRight } from 'lucide-react';

export default function RoleBasedPlatform() {
  return (
    <section style={{ padding: '96px 0', backgroundColor: '#f8fafc' }}>
      <div className="pr-container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 64px' }}>
          <div className="pr-section-tag">
            <span>Dual Experience Architecture</span>
          </div>
          <h2 className="pr-section-title">
            One Platform. Two Powerful Experiences.
          </h2>
          <p className="pr-section-subtitle" style={{ margin: '0 auto' }}>
            Tailored interfaces engineered specifically for backend logistics operators and enterprise business customers.
          </p>
        </div>

        {/* 2 Large Panels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '32px' }}>
          {/* Admin Portal Card */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '16px',
              padding: '40px 36px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #2563eb, #4f46e5)' }}></div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={24} />
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>OPERATIONS & DISPATCH</span>
                <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Admin Platform</h3>
              </div>
            </div>

            <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.6, marginBottom: '28px' }}>
              Built for logistics controllers, fleet managers, and warehouse supervisors who need complete authority over active transport workflows.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '36px' }}>
              {[
                'Full Order Intake & Dispatch Control Tower',
                'Live Fleet Roster & Telematics Tracking',
                'Driver Rosters, HOS, & Compliance Verification',
                'Multi-Hub Warehouse Inventory & Bin Management',
                'Automated Billing, Invoicing, & GST Reports',
                'Comprehensive Financial & Operational Analytics',
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#1e293b' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={13} />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 'auto' }}>
              <Link
                to="/signin/admin"
                className="pr-btn-primary"
                style={{ width: '100%', boxSizing: 'border-box', textAlign: 'center' }}
              >
                <span>Access Admin Platform</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Customer Portal Card */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '16px',
              padding: '40px 36px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #10b981, #06b6d4)' }}></div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserCheck size={24} />
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>CLIENT VISIBILITY</span>
                <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Customer Portal</h3>
              </div>
            </div>

            <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.6, marginBottom: '28px' }}>
              Empowers enterprise clients, shippers, and recipients with frictionless self-service order booking, live tracking, and digital invoices.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '36px' }}>
              {[
                'Instant Freight Booking with Weight & Priority Tiers',
                'Live Tracking Milestones & Delivery Notifications',
                'Address Book Management for Frequent Destinations',
                'Downloadable Tax Invoices & Payment Receipts',
                'Electronic Proof of Delivery (ePOD) Verification',
                'Direct Customer Support & Damage Claim Requests',
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#1e293b' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={13} />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 'auto' }}>
              <Link
                to="/signin/customer"
                className="pr-btn-secondary"
                style={{ width: '100%', boxSizing: 'border-box', textAlign: 'center' }}
              >
                <span>Access Customer Portal</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
