import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ShieldCheck, CheckCircle2, Globe, Clock } from 'lucide-react';
import publicService from '../../services/publicService';
import type { PublicContactInfo } from '../../services/publicService';
import { useToast } from '../common/Toast';
import SupportModal from './SupportModal';

export default function PublicFooter() {
  const { showToast } = useToast();
  const [contact, setContact] = useState<PublicContactInfo | null>(null);
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  useEffect(() => {
    publicService.getPublicContactInfo()
      .then((data) => setContact(data))
      .catch(() => {});
  }, []);

  const phone = contact?.supportPhone || '+91 80 4567 8900';
  const email = contact?.supportEmail || 'support@primeroute.com';
  const availability = contact?.availability || '24/7 Operations Hub Online';
  const address = contact?.companyAddress
    ? `${contact.companyAddress}, ${contact.city}, ${contact.state} ${contact.postalCode}`
    : 'Plot 42, Tech Logistics Park, Whitefield, Bengaluru, Karnataka 560066';

  const handleEmailClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(email).catch(() => {});
    }
    showToast('success', 'Email Copied to Clipboard', email);
    setSupportModalOpen(true);
  };

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(phone).catch(() => {});
    }
    showToast('info', 'Hotline Copied to Clipboard', phone);
    setSupportModalOpen(true);
  };

  return (
    <footer className="pr-footer" style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', color: '#475569' }}>
      <div className="pr-container">
        <div className="pr-footer-grid">
          {/* Brand Info */}
          <div>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', textDecoration: 'none' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '16px',
                  boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)',
                }}
              >
                <span>PR</span>
              </div>
              <div className="pr-brand-text">
                <span className="pr-brand-name" style={{ fontSize: '19px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  PrimeRoute
                </span>
                <span className="pr-brand-tagline" style={{ color: '#2563eb', fontWeight: 700, letterSpacing: '0.08em' }}>
                  Logistics
                </span>
              </div>
            </Link>

            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.62, maxWidth: '290px', margin: '0 0 16px' }}>
              Enterprise Transportation Management System & Connected Freight Operations.
            </p>

            {/* 24/7 Dedicated Logistics Assistance Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#047857',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                padding: '6px 12px',
                borderRadius: '6px',
                width: 'fit-content',
                boxShadow: '0 1px 2px rgba(5, 150, 105, 0.06)',
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#059669',
                  boxShadow: '0 0 0 3px rgba(5, 150, 105, 0.2)',
                  display: 'inline-block',
                }}
              />
              <span>24/7 Dedicated Logistics Assistance</span>
            </div>
            <div style={{ marginTop: '8px', fontSize: '11.5px', color: '#64748b' }}>
              <span>{availability}</span>
            </div>
          </div>

          {/* Column 1: Services */}
          <div>
            <div className="pr-footer-col-title">Services</div>
            <ul className="pr-footer-links">
              <li>
                <Link to="/services#road-freight" className="pr-footer-link">
                  Road Freight (FTL/LTL)
                </Link>
              </li>
              <li>
                <Link to="/services#warehouse" className="pr-footer-link">
                  Shipment Operations
                </Link>
              </li>
              <li>
                <Link to="/services#warehouse" className="pr-footer-link">
                  Warehouse Hubs
                </Link>
              </li>
              <li>
                <Link to="/services#telematics" className="pr-footer-link">
                  Fleet Management
                </Link>
              </li>
              <li>
                <Link to="/services#last-mile" className="pr-footer-link">
                  Last-Mile Delivery
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Platform */}
          <div>
            <div className="pr-footer-col-title">Platform</div>
            <ul className="pr-footer-links">
              <li>
                <Link to="/platform" className="pr-footer-link">
                  Control Tower
                </Link>
              </li>
              <li>
                <Link to="/tracking" className="pr-footer-link">
                  Shipment Tracking
                </Link>
              </li>
              <li>
                <Link to="/platform" className="pr-footer-link">
                  Route Corridor Planning
                </Link>
              </li>
              <li>
                <Link to="/platform" className="pr-footer-link">
                  Invoicing & GST Billing
                </Link>
              </li>
              <li>
                <Link to="/about" className="pr-footer-link">
                  About PrimeRoute
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Portals */}
          <div>
            <div className="pr-footer-col-title">Portals</div>
            <ul className="pr-footer-links">
              <li>
                <Link to="/portals" className="pr-footer-link">
                  Admin Platform
                </Link>
              </li>
              <li>
                <Link to="/portals" className="pr-footer-link">
                  Customer Portal
                </Link>
              </li>
              <li>
                <Link to="/signin/admin" className="pr-footer-link">
                  Admin Login
                </Link>
              </li>
              <li>
                <Link to="/signin/customer" className="pr-footer-link">
                  Customer Login
                </Link>
              </li>
              <li>
                <Link to="/faq" className="pr-footer-link">
                  FAQ & Support Desk
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Office */}
          <div>
            <div className="pr-footer-col-title">Contact & Office</div>
            <ul className="pr-footer-links">
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '9px', color: '#334155', fontSize: '13.5px' }}>
                <Phone size={16} color="#2563eb" style={{ marginTop: '2px', flexShrink: 0 }} />
                <a
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  onClick={handlePhoneClick}
                  style={{ color: '#1e293b', fontWeight: 600, textDecoration: 'none' }}
                  title="Click for Hotline Details & Call Options"
                >
                  {phone}
                </a>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '9px', color: '#334155', fontSize: '13.5px' }}>
                <Mail size={16} color="#2563eb" style={{ marginTop: '2px', flexShrink: 0 }} />
                <a
                  href={`mailto:${email}`}
                  onClick={handleEmailClick}
                  style={{ color: '#1e293b', fontWeight: 600, textDecoration: 'none' }}
                  title="Click to Email Support (Gmail, Outlook, Copy)"
                >
                  {email}
                </a>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '9px', color: '#475569', fontSize: '13.5px', lineHeight: 1.5 }}>
                <MapPin size={16} color="#2563eb" style={{ marginTop: '2px', flexShrink: 0 }} />
                <Link to="/contact" style={{ color: '#475569', textDecoration: 'none' }}>
                  {address}
                </Link>
              </li>
              <li style={{ marginTop: '4px' }}>
                <Link to="/contact" style={{ color: '#2563eb', fontWeight: 600, fontSize: '13px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span>Open Contact & Quote Page →</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pr-footer-bottom">
          <div style={{ color: '#64748b' }}>
            © 2026 PrimeRoute Logistics. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', color: '#475569', fontSize: '13px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <ShieldCheck size={14} color="#059669" />
              Enterprise Transportation Management
            </span>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <CheckCircle2 size={14} color="#2563eb" />
              SOC2 & GST Compliant
            </span>
          </div>
        </div>
      </div>

      {/* Support & Contact Dialog */}
      <SupportModal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
        contact={contact}
      />
    </footer>
  );
}
