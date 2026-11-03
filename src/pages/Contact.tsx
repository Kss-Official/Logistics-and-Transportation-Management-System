import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicHeader from '../components/public/PublicHeader';
import PublicFooter from '../components/public/PublicFooter';
import publicService, { type PublicContactInfo, type PublicFreightInquiryResponse } from '../services/publicService';
import { useToast } from '../components/common/Toast';
import {
  Phone, Mail, MapPin, ArrowRight,
  CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import {
  validateCompanyName,
  validateContactName,
  validateEmail,
  validatePhone,
  validateOrigin,
  validateDestination,
  validateMessage,
  type PublicFormErrors,
} from '../utils/publicValidation';

import contactHeroImg from '../assets/contact_support_desk.jpg';

export default function Contact() {
  const { showToast } = useToast();
  const [contact, setContact] = useState<PublicContactInfo | null>(null);
  const [, setLoadingContact] = useState(true);

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

  const [errors, setErrors] = useState<PublicFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<PublicFreightInquiryResponse | null>(null);
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

  const validateField = (field: string, val: string): string | undefined => {
    switch (field) {
      case 'companyName':
        return validateCompanyName(val);
      case 'fullName':
        return validateContactName(val);
      case 'email':
        return validateEmail(val);
      case 'phone':
        return validatePhone(val);
      case 'origin':
        return validateOrigin(val);
      case 'destination':
        return validateDestination(val);
      case 'message':
        return validateMessage(val);
      default:
        return undefined;
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errorMsg = validateField(field, (formData as Record<string, string>)[field] || '');
    setErrors((prev) => ({ ...prev, [field]: errorMsg }));
  };

  const handleChange = (field: string, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (formError) setFormError('');
    if (touched[field]) {
      const errorMsg = validateField(field, val);
      setErrors((prev) => ({ ...prev, [field]: errorMsg }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const newErrors: PublicFormErrors = {
      companyName: validateCompanyName(formData.companyName),
      contactName: validateContactName(formData.fullName),
      email: validateEmail(formData.email),
      phone: validatePhone(formData.phone),
      origin: validateOrigin(formData.origin),
      destination: validateDestination(formData.destination),
      message: validateMessage(formData.message),
    };

    setTouched({
      companyName: true,
      fullName: true,
      email: true,
      phone: true,
      origin: true,
      destination: true,
      message: true,
    });

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((err) => Boolean(err));
    if (hasErrors) {
      return;
    }

    setFormSubmitting(true);

    try {
      const payload = {
        companyName: formData.companyName.trim(),
        contactName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        origin: formData.origin.trim(),
        destination: formData.destination.trim(),
        serviceType: formData.serviceRequired,
        message: formData.message ? formData.message.trim() : undefined,
        inquiryType: 'CONSULTATION' as const,
      };

      const result = await publicService.submitFreightInquiry(payload);
      setSubmissionResult(result);
      setFormSuccess(true);
      showToast('success', 'Inquiry Submitted', `Reference ${result.inquiryNumber} logged.`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; errors?: Record<string, string> } } };
      if (axiosErr?.response?.data?.errors) {
        setErrors((prev) => ({ ...prev, ...axiosErr.response?.data?.errors }));
        setFormError('Please correct the highlighted fields and try again.');
      } else if (axiosErr?.response?.data?.message) {
        setFormError(axiosErr.response.data.message);
      } else {
        setFormError('Failed to submit inquiry. Please check your network connection.');
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="editorial-root">
      <PublicHeader />
      <main>
        {/* ── 1. EDITORIAL HERO (FULL-WIDTH BRIGHT LOGISTICS HERO) ── */}
        <section className="editorial-page-hero">
          <div className="editorial-page-hero-media">
            <img
              src={contactHeroImg}
              alt="PrimeRoute Logistics Express Highway Terminal"
              className="editorial-page-hero-img"
            />
          </div>
          <div className="editorial-page-hero-overlay" />

          <div className="editorial-page-hero-container">
            <div className="editorial-page-hero-content">
              <div className="editorial-page-hero-label">
                CONTACT PRIMEROUTE
              </div>

              <h1 className="editorial-page-hero-title">
                CONNECT WITH OUR<br />
                <span className="blue-highlight">FREIGHT DESK.</span>
              </h1>

              <p className="editorial-page-hero-desc">
                Need to book commercial freight, inquire about cross-dock warehousing, or discuss enterprise transportation contracts? Our central dispatch control team is available 24/7.
              </p>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <a
                  href="#contact-form"
                  className="editorial-btn-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <span>SEND INQUIRY</span>
                  <ArrowRight size={15} />
                </a>
                <a href={`tel:${phone.replace(/\s+/g, '')}`} className="editorial-btn-outline-light">
                  <Phone size={14} />
                  <span>CALL HOTLINE</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. CONTACT CARDS & INTERACTIVE FORM GRID ── */}
        <section id="contact-form" style={{ padding: '80px 0', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
          <div className="editorial-container">
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

                {formSuccess && submissionResult ? (
                  <div style={{ padding: '32px', textAlign: 'center', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <CheckCircle2 size={48} color="#16a34a" style={{ margin: '0 auto 16px' }} />
                    <div style={{ display: 'inline-block', background: '#dcfce7', color: '#166534', fontSize: '12px', fontWeight: 800, padding: '4px 14px', borderRadius: '20px', letterSpacing: '0.06em', marginBottom: '14px', border: '1px solid #86efac' }}>
                      REFERENCE: {submissionResult.inquiryNumber}
                    </div>
                    <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#166534', margin: '0 0 8px' }}>
                      {submissionResult.message || 'Inquiry Submitted Successfully'}
                    </h4>
                    <p style={{ fontSize: '14.5px', color: '#15803d', lineHeight: 1.6, margin: '0 0 20px' }}>
                      Thank you for contacting PrimeRoute Logistics, <strong>{submissionResult.contactName}</strong> ({submissionResult.companyName}). Your freight consultation for <strong>{submissionResult.origin} → {submissionResult.destination}</strong> has been logged and routed to our regional operations team.
                    </p>
                    <button
                      onClick={() => {
                        setFormSuccess(false);
                        setSubmissionResult(null);
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
                        setErrors({});
                        setTouched({});
                        setFormError('');
                      }}
                      className="editorial-btn-primary"
                      style={{ padding: '10px 24px', fontSize: '13px', margin: '0 auto' }}
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {formError && (
                      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: '6px', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertCircle size={16} style={{ flexShrink: 0 }} />
                        <span>{formError}</span>
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      {/* Company Name */}
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                          Company Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.companyName}
                          onChange={(e) => handleChange('companyName', e.target.value)}
                          onBlur={() => handleBlur('companyName')}
                          placeholder="e.g. PrimeRoute Logistics Pvt. Ltd."
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '6px',
                            border: errors.companyName && touched.companyName ? '1px solid #ef4444' : '1px solid #cbd5e1',
                            fontSize: '14px',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                        {errors.companyName && touched.companyName && (
                          <span style={{ display: 'block', fontSize: '11.5px', color: '#dc2626', marginTop: '4px', fontWeight: 500 }}>
                            {errors.companyName}
                          </span>
                        )}
                      </div>

                      {/* Contact Person */}
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                          Contact Person *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.fullName}
                          onChange={(e) => handleChange('fullName', e.target.value)}
                          onBlur={() => handleBlur('fullName')}
                          placeholder="e.g. Shruti Sanjana Sahoo"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '6px',
                            border: (errors.contactName || errors.fullName) && (touched.fullName || touched.contactName) ? '1px solid #ef4444' : '1px solid #cbd5e1',
                            fontSize: '14px',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                        {(errors.contactName || errors.fullName) && (touched.fullName || touched.contactName) && (
                          <span style={{ display: 'block', fontSize: '11.5px', color: '#dc2626', marginTop: '4px', fontWeight: 500 }}>
                            {errors.contactName || errors.fullName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      {/* Work Email */}
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                          Work Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          onBlur={() => handleBlur('email')}
                          placeholder="e.g. operations@primeroute.com"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '6px',
                            border: errors.email && touched.email ? '1px solid #ef4444' : '1px solid #cbd5e1',
                            fontSize: '14px',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                        {errors.email && touched.email && (
                          <span style={{ display: 'block', fontSize: '11.5px', color: '#dc2626', marginTop: '4px', fontWeight: 500 }}>
                            {errors.email}
                          </span>
                        )}
                      </div>

                      {/* Phone */}
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                          onBlur={() => handleBlur('phone')}
                          placeholder="e.g. 9876543210"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '6px',
                            border: errors.phone && touched.phone ? '1px solid #ef4444' : '1px solid #cbd5e1',
                            fontSize: '14px',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                        {errors.phone && touched.phone && (
                          <span style={{ display: 'block', fontSize: '11.5px', color: '#dc2626', marginTop: '4px', fontWeight: 500 }}>
                            {errors.phone}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      {/* Corridor Origin */}
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                          Corridor Origin *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.origin}
                          onChange={(e) => handleChange('origin', e.target.value)}
                          onBlur={() => handleBlur('origin')}
                          placeholder="e.g. Bengaluru Hub"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '6px',
                            border: errors.origin && touched.origin ? '1px solid #ef4444' : '1px solid #cbd5e1',
                            fontSize: '14px',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                        {errors.origin && touched.origin && (
                          <span style={{ display: 'block', fontSize: '11.5px', color: '#dc2626', marginTop: '4px', fontWeight: 500 }}>
                            {errors.origin}
                          </span>
                        )}
                      </div>

                      {/* Corridor Destination */}
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                          Corridor Destination *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.destination}
                          onChange={(e) => handleChange('destination', e.target.value)}
                          onBlur={() => handleBlur('destination')}
                          placeholder="e.g. Mumbai DC"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '6px',
                            border: errors.destination && touched.destination ? '1px solid #ef4444' : '1px solid #cbd5e1',
                            fontSize: '14px',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                        {errors.destination && touched.destination && (
                          <span style={{ display: 'block', fontSize: '11.5px', color: '#dc2626', marginTop: '4px', fontWeight: 500 }}>
                            {errors.destination}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Service Interest */}
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Service Interest
                      </label>
                      <select
                        value={formData.serviceRequired}
                        onChange={(e) => handleChange('serviceRequired', e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#ffffff', boxSizing: 'border-box' }}
                      >
                        <option value="Road Freight (FTL)">Road Freight (FTL)</option>
                        <option value="Part Load (LTL)">Part Load (LTL)</option>
                        <option value="Express Priority Linehaul">Express Priority Linehaul</option>
                        <option value="Warehousing & Cross-Docking">Warehousing & Cross-Docking</option>
                        <option value="Last-Mile Delivery">Last-Mile Delivery</option>
                        <option value="Cold Chain Freight">Cold Chain Freight</option>
                        <option value="Intermodal Rail-Road">Intermodal Rail-Road</option>
                      </select>
                    </div>

                    {/* Requirements / Cargo Details */}
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Requirements / Cargo Details
                      </label>
                      <textarea
                        rows={3}
                        value={formData.message}
                        onChange={(e) => handleChange('message', e.target.value)}
                        onBlur={() => handleBlur('message')}
                        placeholder="Expected freight tonnage, monthly frequency, or specific handling notes..."
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          border: errors.message && touched.message ? '1px solid #ef4444' : '1px solid #cbd5e1',
                          fontSize: '14px',
                          outline: 'none',
                          resize: 'vertical',
                          boxSizing: 'border-box'
                        }}
                      />
                      {errors.message && touched.message && (
                        <span style={{ display: 'block', fontSize: '11.5px', color: '#dc2626', marginTop: '4px', fontWeight: 500 }}>
                          {errors.message}
                        </span>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="editorial-btn-primary"
                      style={{ padding: '13px 24px', fontSize: '14px', justifyContent: 'center', marginTop: '6px', width: '100%', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      {formSubmitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>SUBMITTING INQUIRY...</span>
                        </>
                      ) : (
                        <>
                          <span>SUBMIT FREIGHT INQUIRY</span>
                          <ArrowRight size={15} />
                        </>
                      )}
                    </button>
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
