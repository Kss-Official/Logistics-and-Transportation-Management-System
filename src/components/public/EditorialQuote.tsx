import React, { useState } from 'react';
import { ArrowRight, CheckCircle, Calculator, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import publicService, { type PublicFreightInquiryResponse } from '../../services/publicService';
import {
  validateCompanyName,
  validateContactName,
  validateEmail,
  validatePhone,
  validateOrigin,
  validateDestination,
  validateWeight,
  validateMessage,
  type PublicFormErrors,
} from '../../utils/publicValidation';

export default function EditorialQuote() {
  const [quoteData, setQuoteData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    origin: '',
    destination: '',
    cargoType: 'Industrial Freight',
    weight: '',
    serviceType: 'Road Freight (FTL)',
    message: '',
  });

  const [errors, setErrors] = useState<PublicFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<PublicFreightInquiryResponse | null>(null);
  const [serverError, setServerError] = useState('');

  const validateField = (field: string, val: string): string | undefined => {
    switch (field) {
      case 'companyName':
        return validateCompanyName(val);
      case 'contactName':
        return validateContactName(val);
      case 'email':
        return validateEmail(val);
      case 'phone':
        return validatePhone(val);
      case 'origin':
        return validateOrigin(val);
      case 'destination':
        return validateDestination(val);
      case 'weight':
        return validateWeight(val, false);
      case 'message':
        return validateMessage(val);
      default:
        return undefined;
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errorMsg = validateField(field, (quoteData as Record<string, string>)[field] || '');
    setErrors((prev) => ({ ...prev, [field]: errorMsg }));
  };

  const handleChange = (field: string, val: string) => {
    setQuoteData((prev) => ({ ...prev, [field]: val }));
    if (serverError) setServerError('');
    if (touched[field]) {
      const errorMsg = validateField(field, val);
      setErrors((prev) => ({ ...prev, [field]: errorMsg }));
    }
  };

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    // Full validation pass
    const newErrors: PublicFormErrors = {
      companyName: validateCompanyName(quoteData.companyName),
      contactName: validateContactName(quoteData.contactName),
      email: validateEmail(quoteData.email),
      phone: validatePhone(quoteData.phone),
      origin: validateOrigin(quoteData.origin),
      destination: validateDestination(quoteData.destination),
      weight: validateWeight(quoteData.weight, false),
      message: validateMessage(quoteData.message),
    };

    // Mark all as touched
    setTouched({
      companyName: true,
      contactName: true,
      email: true,
      phone: true,
      origin: true,
      destination: true,
      weight: true,
      message: true,
    });

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((err) => Boolean(err));
    if (hasErrors) {
      return;
    }

    setSubmitting(true);

    try {
      const cleanWeight = quoteData.weight
        ? parseFloat(quoteData.weight.replace(/,/g, '').replace(/kg/i, '').trim())
        : undefined;

      const payload = {
        companyName: quoteData.companyName.trim(),
        contactName: quoteData.contactName.trim(),
        email: quoteData.email.trim(),
        phone: quoteData.phone.trim(),
        origin: quoteData.origin.trim(),
        destination: quoteData.destination.trim(),
        cargoType: quoteData.cargoType,
        serviceType: quoteData.serviceType,
        weight: cleanWeight && !isNaN(cleanWeight) ? cleanWeight : undefined,
        message: quoteData.message ? quoteData.message.trim() : undefined,
        inquiryType: 'QUOTATION' as const,
      };

      const result = await publicService.submitFreightQuote(payload);
      setSubmissionResult(result);
      setQuoteSubmitted(true);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; errors?: Record<string, string> } } };
      if (axiosErr?.response?.data?.errors) {
        setErrors((prev) => ({ ...prev, ...axiosErr.response?.data?.errors }));
        setServerError('Please correct the highlighted fields and try again.');
      } else if (axiosErr?.response?.data?.message) {
        setServerError(axiosErr.response.data.message);
      } else {
        setServerError('Unable to submit quotation inquiry. Please check your network connection.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="quote" style={{ padding: '96px 0', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
      <div className="editorial-container">
        <div style={{ maxWidth: '840px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div className="editorial-section-tag" style={{ margin: '0 auto 10px' }}>
              <Calculator size={13} />
              <span>FREIGHT QUOTATION DESK</span>
            </div>
            <h2 style={{ fontFamily: 'var(--pr-font-display)', fontSize: 'clamp(2.5rem, 4.5vw, 4rem)', textTransform: 'uppercase', color: '#070b14', margin: '0 0 10px', letterSpacing: '0.02em', lineHeight: 0.95 }}>
              REQUEST A CORRIDOR QUOTE
            </h2>
            <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
              Specify your origin-destination corridor and freight specifications. Our logistics operations desk replies within 2 business hours.
            </p>
          </div>

          {quoteSubmitted && submissionResult ? (
            <div style={{ background: '#ffffff', border: '1px solid #86efac', borderRadius: '12px', padding: '48px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
              <CheckCircle size={48} color="#16a34a" style={{ margin: '0 auto 16px' }} />
              <div style={{ display: 'inline-block', background: '#ecfdf5', color: '#065f46', fontSize: '12px', fontWeight: 800, padding: '4px 14px', borderRadius: '20px', letterSpacing: '0.06em', marginBottom: '14px', border: '1px solid #a7f3d0' }}>
                REFERENCE: {submissionResult.inquiryNumber}
              </div>
              <h3 style={{ fontFamily: 'var(--pr-font-display)', fontSize: '28px', color: '#0f172a', margin: '0 0 8px', letterSpacing: '0.04em' }}>
                {submissionResult.message || 'QUOTATION REQUEST RECEIVED'}
              </h3>
              <p style={{ fontSize: '15px', color: '#475569', maxWidth: '580px', margin: '0 auto 24px', lineHeight: 1.6 }}>
                Thank you, <strong>{submissionResult.contactName}</strong> from <strong>{submissionResult.companyName}</strong>. Our logistics operations desk for the <strong>{submissionResult.origin} → {submissionResult.destination}</strong> corridor is preparing your commercial estimate. Confirmation has been logged for <strong>{submissionResult.email}</strong>.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuoteSubmitted(false);
                  setSubmissionResult(null);
                  setQuoteData({
                    companyName: '',
                    contactName: '',
                    email: '',
                    phone: '',
                    origin: '',
                    destination: '',
                    cargoType: 'Industrial Freight',
                    weight: '',
                    serviceType: 'Road Freight (FTL)',
                    message: '',
                  });
                  setErrors({});
                  setTouched({});
                  setServerError('');
                }}
                className="editorial-btn-ghost"
                style={{ border: '1px solid #cbd5e1' }}
              >
                SUBMIT ANOTHER REQUEST
              </button>
            </div>
          ) : (
            <form onSubmit={handleQuoteSubmit} noValidate style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '40px', boxShadow: '0 10px 30px rgba(7,11,20,0.05)' }}>
              {serverError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '13.5px' }}>
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span>{serverError}</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                {/* Company Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={quoteData.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    onBlur={() => handleBlur('companyName')}
                    placeholder="e.g. PrimeRoute Logistics Pvt. Ltd."
                    style={{
                      width: '100%',
                      height: '46px',
                      padding: '0 14px',
                      borderRadius: '6px',
                      border: errors.companyName && touched.companyName ? '1px solid #ef4444' : '1px solid #cbd5e1',
                      fontSize: '14px',
                      color: '#0f172a',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                  {errors.companyName && touched.companyName && (
                    <span style={{ display: 'block', fontSize: '11.5px', color: '#dc2626', marginTop: '4px', fontWeight: 500 }}>
                      {errors.companyName}
                    </span>
                  )}
                </div>

                {/* Contact Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={quoteData.contactName}
                    onChange={(e) => handleChange('contactName', e.target.value)}
                    onBlur={() => handleBlur('contactName')}
                    placeholder="e.g. Suresh Kumar"
                    style={{
                      width: '100%',
                      height: '46px',
                      padding: '0 14px',
                      borderRadius: '6px',
                      border: errors.contactName && touched.contactName ? '1px solid #ef4444' : '1px solid #cbd5e1',
                      fontSize: '14px',
                      color: '#0f172a',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                  {errors.contactName && touched.contactName && (
                    <span style={{ display: 'block', fontSize: '11.5px', color: '#dc2626', marginTop: '4px', fontWeight: 500 }}>
                      {errors.contactName}
                    </span>
                  )}
                </div>

                {/* Business Email */}
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                    Business Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={quoteData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    placeholder="e.g. operations@primeroute.com"
                    style={{
                      width: '100%',
                      height: '46px',
                      padding: '0 14px',
                      borderRadius: '6px',
                      border: errors.email && touched.email ? '1px solid #ef4444' : '1px solid #cbd5e1',
                      fontSize: '14px',
                      color: '#0f172a',
                      boxSizing: 'border-box',
                      outline: 'none',
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
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={quoteData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    onBlur={() => handleBlur('phone')}
                    placeholder="e.g. 9876543210"
                    style={{
                      width: '100%',
                      height: '46px',
                      padding: '0 14px',
                      borderRadius: '6px',
                      border: errors.phone && touched.phone ? '1px solid #ef4444' : '1px solid #cbd5e1',
                      fontSize: '14px',
                      color: '#0f172a',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                  {errors.phone && touched.phone && (
                    <span style={{ display: 'block', fontSize: '11.5px', color: '#dc2626', marginTop: '4px', fontWeight: 500 }}>
                      {errors.phone}
                    </span>
                  )}
                </div>

                {/* Origin */}
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                    Origin City / Hub *
                  </label>
                  <input
                    type="text"
                    required
                    value={quoteData.origin}
                    onChange={(e) => handleChange('origin', e.target.value)}
                    onBlur={() => handleBlur('origin')}
                    placeholder="e.g. Bengaluru Hub"
                    style={{
                      width: '100%',
                      height: '46px',
                      padding: '0 14px',
                      borderRadius: '6px',
                      border: errors.origin && touched.origin ? '1px solid #ef4444' : '1px solid #cbd5e1',
                      fontSize: '14px',
                      color: '#0f172a',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                  {errors.origin && touched.origin && (
                    <span style={{ display: 'block', fontSize: '11.5px', color: '#dc2626', marginTop: '4px', fontWeight: 500 }}>
                      {errors.origin}
                    </span>
                  )}
                </div>

                {/* Destination */}
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                    Destination City / Hub *
                  </label>
                  <input
                    type="text"
                    required
                    value={quoteData.destination}
                    onChange={(e) => handleChange('destination', e.target.value)}
                    onBlur={() => handleBlur('destination')}
                    placeholder="e.g. Mumbai DC"
                    style={{
                      width: '100%',
                      height: '46px',
                      padding: '0 14px',
                      borderRadius: '6px',
                      border: errors.destination && touched.destination ? '1px solid #ef4444' : '1px solid #cbd5e1',
                      fontSize: '14px',
                      color: '#0f172a',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                  {errors.destination && touched.destination && (
                    <span style={{ display: 'block', fontSize: '11.5px', color: '#dc2626', marginTop: '4px', fontWeight: 500 }}>
                      {errors.destination}
                    </span>
                  )}
                </div>

                {/* Service Mode */}
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                    Service Mode
                  </label>
                  <select
                    value={quoteData.serviceType}
                    onChange={(e) => handleChange('serviceType', e.target.value)}
                    style={{ width: '100%', height: '46px', padding: '0 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', color: '#0f172a', background: '#ffffff', boxSizing: 'border-box' }}
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

                {/* Weight */}
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                    Est. Weight (kg)
                  </label>
                  <input
                    type="text"
                    value={quoteData.weight}
                    onChange={(e) => handleChange('weight', e.target.value)}
                    onBlur={() => handleBlur('weight')}
                    placeholder="e.g. 3500"
                    style={{
                      width: '100%',
                      height: '46px',
                      padding: '0 14px',
                      borderRadius: '6px',
                      border: errors.weight && touched.weight ? '1px solid #ef4444' : '1px solid #cbd5e1',
                      fontSize: '14px',
                      color: '#0f172a',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                  {errors.weight && touched.weight && (
                    <span style={{ display: 'block', fontSize: '11.5px', color: '#dc2626', marginTop: '4px', fontWeight: 500 }}>
                      {errors.weight}
                    </span>
                  )}
                </div>
              </div>

              {/* Additional Specifications */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                  Additional Specifications
                </label>
                <textarea
                  rows={3}
                  value={quoteData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  onBlur={() => handleBlur('message')}
                  placeholder="Special handling, scheduled recurrence, pallet requirements, dock appointment constraints..."
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '6px',
                    border: errors.message && touched.message ? '1px solid #ef4444' : '1px solid #cbd5e1',
                    fontSize: '14px',
                    color: '#0f172a',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
                {errors.message && touched.message && (
                  <span style={{ display: 'block', fontSize: '11.5px', color: '#dc2626', marginTop: '4px', fontWeight: 500 }}>
                    {errors.message}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
                  <ShieldCheck size={16} color="#0284c7" />
                  <span>Enterprise NDA protected rates. No hidden surcharges.</span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="editorial-btn-primary"
                  style={{ padding: '14px 32px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>LOGGING REQUEST...</span>
                    </>
                  ) : (
                    <>
                      <span>REQUEST QUOTE</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
