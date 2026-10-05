import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  Copy,
  Check,
  ExternalLink,
  Clock,
  Headphones,
  HelpCircle,
  X,
  Send,
  MessageSquare
} from 'lucide-react';
import { useToast } from '../common/Toast';
import type { PublicContactInfo } from '../../services/publicService';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: PublicContactInfo | null;
}

export default function SupportModal({ isOpen, onClose, contact }: SupportModalProps) {
  const { showToast } = useToast();
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  if (!isOpen) return null;

  const email = contact?.supportEmail || 'support@primeroute.com';
  const phone = contact?.supportPhone || '+91 80 4567 8900';
  const availability = contact?.availability || '24/7 Dedicated Logistics Assistance';
  const companyName = contact?.companyName || 'PrimeRoute Global Logistics India Pvt. Ltd.';
  const address = contact?.companyAddress
    ? `${contact.companyAddress}, ${contact.city}, ${contact.state} ${contact.postalCode}`
    : 'Plot 42, Tech Logistics Park, Whitefield, Bengaluru';

  const handleCopyEmail = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(email).catch(() => {});
    }
    setCopiedEmail(true);
    showToast('success', 'Email Copied to Clipboard', email);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleCopyPhone = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(phone).catch(() => {});
    }
    setCopiedPhone(true);
    showToast('info', 'Phone Number Copied', phone);
    setTimeout(() => setCopiedPhone(false), 2500);
  };

  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent('Logistics Support Inquiry - PrimeRoute')}`;
  const outlookUrl = `https://outlook.live.com/default.aspx?rru=action/compose&to=${encodeURIComponent(email)}&subject=${encodeURIComponent('Logistics Support Inquiry - PrimeRoute')}`;
  const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent('Logistics Support Inquiry - PrimeRoute')}`;

  return (
    <div
      className="modal-overlay"
      style={{
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal modal-md"
        style={{
          maxWidth: '540px',
          width: '100%',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
          animation: 'slideUp 0.2s ease-out'
        }}
      >
        {/* Header with Dark Logistics Theme */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #334155',
            color: '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid rgba(96, 165, 250, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Headphones size={20} color="#60a5fa" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#f8fafc' }}>
                PrimeRoute Logistics Support
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#94a3b8' }}>
                Direct Operations Desk & Freight Inquiries
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Email Channel Card */}
          <div
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px',
              background: '#f8fafc'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} color="#3b82f6" />
                <span>Customer Support Email</span>
              </span>
              <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span>
                <span>Active</span>
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                marginBottom: '12px'
              }}
            >
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', letterSpacing: '0.01em', wordBreak: 'break-all' }}>
                {email}
              </span>
              <button
                type="button"
                onClick={handleCopyEmail}
                title="Copy email to clipboard"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: copiedEmail ? '#ecfdf5' : '#f1f5f9',
                  border: `1px solid ${copiedEmail ? '#10b981' : '#cbd5e1'}`,
                  color: copiedEmail ? '#059669' : '#334155',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s ease'
                }}
              >
                {copiedEmail ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedEmail ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            {/* Email Send Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
              <a
                href={gmailUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '9px 12px',
                  background: '#2563eb',
                  color: '#ffffff',
                  borderRadius: '7px',
                  fontSize: '13px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  textAlign: 'center',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#1d4ed8')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#2563eb')}
              >
                <span>Compose in Gmail</span>
                <ExternalLink size={13} />
              </a>

              <a
                href={outlookUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '9px 12px',
                  background: '#0284c7',
                  color: '#ffffff',
                  borderRadius: '7px',
                  fontSize: '13px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  textAlign: 'center',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#0369a1')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#0284c7')}
              >
                <span>Outlook Web</span>
                <ExternalLink size={13} />
              </a>

              <a
                href={mailtoUrl}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '9px 12px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  borderRadius: '7px',
                  fontSize: '13px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  textAlign: 'center',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
              >
                <span>Default App</span>
                <Send size={13} />
              </a>
            </div>
          </div>

          {/* Hotline & Availability Card */}
          <div
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px',
              background: '#ffffff'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={14} color="#3b82f6" />
                <span>Operations & Dispatch Hotline</span>
              </span>
              <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Clock size={12} />
                <span>{availability}</span>
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
            >
              <a
                href={`tel:${phone.replace(/\s+/g, '')}`}
                style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', textDecoration: 'none' }}
                title="Click to dial"
              >
                {phone}
              </a>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleCopyPhone}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: copiedPhone ? '#ecfdf5' : '#ffffff',
                    border: `1px solid ${copiedPhone ? '#10b981' : '#cbd5e1'}`,
                    color: copiedPhone ? '#059669' : '#334155',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {copiedPhone ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedPhone ? 'Copied' : 'Copy'}</span>
                </button>
                <a
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: '#10b981',
                    color: '#ffffff',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  <Phone size={13} />
                  <span>Call</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Help Desk & Corporate Location */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              background: '#f1f5f9',
              borderRadius: '8px',
              fontSize: '12.5px',
              color: '#475569'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={15} color="#3b82f6" style={{ flexShrink: 0 }} />
              <span>{address}</span>
            </div>
            <Link
              to="/faq"
              onClick={onClose}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: '#2563eb',
                fontWeight: 600,
                textDecoration: 'none',
                flexShrink: 0
              }}
            >
              <HelpCircle size={14} />
              <span>View FAQs</span>
            </Link>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '14px 24px',
            background: '#fafafa',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            {companyName}
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              color: '#334155',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
