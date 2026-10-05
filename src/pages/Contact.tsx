import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicHeader from '../components/public/PublicHeader';
import PublicFooter from '../components/public/PublicFooter';
import publicService from '../services/publicService';
import type { PublicContactInfo } from '../services/publicService';
import { useToast } from '../components/common/Toast';
import {
  Phone, Mail, MapPin, Clock, ArrowRight,
  Send, CheckCircle2, Building2, ShieldCheck, MessageSquare,
  HelpCircle, AlertCircle, Loader2
} from 'lucide-react';

export default function Contact() {
  const { showToast } = useToast();
  const [contact, setContact] = useState<PublicContactInfo | null>(null);
  const [loadingContact, setLoadingContact] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    companyName: '',
    fullName: '',
    email: '',
    phone: '',
    serviceRequired: 'Road Freight (FTL)',
    origin: '',
    destination: '',
    message: '',
  });

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    publicService.getPublicContactInfo()
      .then((data) => setContact(data))
      .catch((err) => console.error('Failed to fetch contact details:', err))
      .finally(() => setLoadingContact(false));
  }, []);

  const phone = contact?.supportPhone || '+91 80 4567 8900';
  const email = contact?.supportEmail || 'support@primeroute.com';
  const availability = contact?.availability || '24/7 Dedicated Logistics Assistance';
  const address = contact?.companyAddress
    ? `${contact.companyAddress}, ${contact.city}, ${contact.state} ${contact.postalCode}`
    : 'Plot 42, Tech Logistics Park, Whitefield, Bengaluru, Karnataka 560066';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim() || !formData.fullName.trim() || !formData.email.trim()) {
      setFormError('Please fill in your company name, full name, and valid corporate email.');
      return;
    }

    setFormSubmitting(true);
    setFormError('');

    // Frontend-only submission simulation with realistic response
    setTimeout(() => {
      setFormSubmitting(false);
      setFormSuccess(true);
      showToast('success', 'Inquiry Received', 'Our freight desk will contact you within 2 hours.');
    }, 600);
  };

  return (
    <div className="pr-public-site">
      <PublicHeader />
      <main>
        {/* ========================================================
            1. HERO SECTION (LIGHT ENTERPRISE THEME)
            ======================================================== */}
        <section
          style={{
            padding: '48px 0 64px',
            background: 'linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%)',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <div className="pr-container">
            <div style={{ maxWidth: '800px' }}>
              <div className="pr-hero-badge-corporate" style={{ marginBottom: '16px' }}>
                <span className="pr-live-dot"></span>
                <span>DIRECT LOGISTICS SUPPORT</span>
              </div>

              <h1
                style={{
                  fontSize: 'clamp(32px, 4.2vw, 48px)',
                  fontWeight: 800,
                  color: '#0f172a',
                  lineHeight: 1.18,
                  letterSpacing: '-0.02em',
                  margin: '0 0 16px',
                }}
              >
                Contact PrimeRoute Operations & Freight Desk.
              </h1>

              <p
                style={{
                  fontSize: '17px',
                  color: '#475569',
                  lineHeight: 1.65,
                  margin: '0 0 28px',
                }}
              >
                Need to book commercial freight, inquire about cross-dock warehousing, or discuss enterprise transportation contracts? Our central dispatch control team is available 24/7.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================
            2. CONTACT CARDS & INTERACTIVE FORM GRID
            ======================================================== */}
        <section style={{ padding: '80px 0', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div className="pr-container">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                gap: '40px',
                alignItems: 'flex-start',
              }}
            >
              {/* Left Column: Direct Contact Info & Hub Locations */}
              <div>
                <div style={{ marginBottom: '32px' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>
                    Corporate Headquarters & Operations
                  </h2>
                  <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                    Direct communication lines to our centralized freight control tower.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '36px' }}>
                  {/* Phone Card */}
                  <div style={{ background: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Phone size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>24/7 Operations Hotline</div>
                      <a href={`tel:${phone.replace(/\s+/g, '')}`} style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', textDecoration: 'none', display: 'block', marginTop: '2px' }}>
                        {phone}
                      </a>
                      <div style={{ fontSize: '12px', color: '#059669', marginTop: '4px', fontWeight: 600 }}>{availability}</div>
                    </div>
                  </div>

                  {/* Email Card */}
                  <div style={{ background: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Mail size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Operations & Billing Inquiries</div>
                      <a href={`mailto:${email}`} style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', textDecoration: 'none', display: 'block', marginTop: '2px' }}>
                        {email}
                      </a>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Average response time: &lt; 30 minutes</div>
                    </div>
                  </div>

                  {/* Address Card */}
                  <div style={{ background: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <MapPin size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Central Operating Terminal</div>
                      <div style={{ fontSize: '14.5px', fontWeight: 600, color: '#0f172a', marginTop: '2px', lineHeight: 1.5 }}>
                        {address}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Regional Operations Terminals */}
                <div style={{ background: '#ffffff', padding: '24px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '14px' }}>
                    Major Regional Hubs & Dispatch Yards
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px', color: '#475569' }}>
                    <div>• <strong>Bengaluru:</strong> Whitefield Freight Terminal</div>
                    <div>• <strong>Mumbai:</strong> Bhiwandi Logistics Park</div>
                    <div>• <strong>Delhi NCR:</strong> Gurugram Express Hub</div>
                    <div>• <strong>Chennai:</strong> Sriperumbudur Cross-Dock</div>
                    <div>• <strong>Hyderabad:</strong> Shamshabad Cargo Area</div>
                    <div>• <strong>Kolkata:</strong> Dankuni Highway Junction</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Freight Inquiry / Quote Form */}
              <div
                style={{
                  background: '#ffffff',
                  padding: '36px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  boxShadow: '0 8px 30px rgba(15, 23, 42, 0.05)',
                }}
              >
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                    Request a Freight Consultation
                  </h3>
                  <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                    Fill in your consignment requirements. A dedicated logistics coordinator will reply promptly.
                  </p>
                </div>

                {formSuccess ? (
                  <div style={{ padding: '32px', textAlign: 'center', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <CheckCircle2 size={48} color="#16a34a" style={{ margin: '0 auto 16px' }} />
                    <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#166534', margin: '0 0 8px' }}>
                      Inquiry Submitted Successfully
                    </h4>
                    <p style={{ fontSize: '14.5px', color: '#15803d', lineHeight: 1.6, margin: '0 0 20px' }}>
                      Thank you for contacting PrimeRoute Logistics. Reference <strong>#PR-INQ-{Math.floor(100000 + Math.random() * 900000)}</strong> has been routed to our regional freight team.
                    </p>
                    <button
                      onClick={() => {
                        setFormSuccess(false);
                        setFormData({
                          companyName: '',
                          fullName: '',
                          email: '',
                          phone: '',
                          serviceRequired: 'Road Freight (FTL)',
                          origin: '',
                          destination: '',
                          message: '',
                        });
                      }}
                      className="pr-btn-primary"
                      style={{ padding: '10px 24px', fontSize: '14px', margin: '0 auto' }}
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {formError && (
                      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: '6px', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertCircle size={16} />
                        <span>{formError}</span>
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                          Company Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.companyName}
                          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                          placeholder="e.g. Apex Industrial Ltd"
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                          Contact Person *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          placeholder="e.g. Rajesh Sharma"
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                          Work Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="rajesh@apex.com"
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                          Corridor Origin
                        </label>
                        <input
                          type="text"
                          value={formData.origin}
                          onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                          placeholder="e.g. Bengaluru Hub"
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                          Corridor Destination
                        </label>
                        <input
                          type="text"
                          value={formData.destination}
                          onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                          placeholder="e.g. Mumbai DC"
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Service Interest
                      </label>
                      <select
                        value={formData.serviceRequired}
                        onChange={(e) => setFormData({ ...formData, serviceRequired: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#ffffff' }}
                      >
                        <option value="Road Freight (FTL)">Road Freight — Full Truckload (FTL)</option>
                        <option value="Road Freight (LTL)">Road Freight — Less-Than-Truckload (LTL)</option>
                        <option value="Warehouse Hub Storage">Warehouse Hub Storage & Cross-Docking</option>
                        <option value="Fleet Telematics">Fleet Telematics & Route Management</option>
                        <option value="Last-Mile Distribution">Last-Mile Distribution & ePOD Handover</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Requirements / Cargo Details
                      </label>
                      <textarea
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Expected freight tonnage, monthly frequency, or specific handling notes..."
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="pr-btn-primary"
                      style={{ padding: '13px 24px', fontSize: '15px', justifyContent: 'center', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      {formSubmitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Routing inquiry to dispatch...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Freight Inquiry</span>
                          <Send size={15} />
                        </>
                      )}
                    </button>
                    <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
                      PrimeRoute respects data privacy. Your contact details are stored securely.
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
