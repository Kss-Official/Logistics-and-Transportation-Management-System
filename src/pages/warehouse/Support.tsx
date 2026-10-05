import React, { useEffect, useState, useMemo } from 'react';
import { 
  warehousePortalService 
} from '../../services/warehousePortalService';
import { 
  Headphones, 
  Phone, 
  Mail, 
  Clock, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Send, 
  FileQuestion, 
  RefreshCw,
  Plus,
  ArrowRight,
  User,
  Inbox,
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import Modal from '../../components/common/Modal';
import { useToast } from '../../components/common/Toast';

interface Ticket {
  id: number;
  ticketNumber: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  description: string;
  orderNumber?: string;
  trackingNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface TicketMessage {
  id: number;
  ticketId: number;
  senderName: string;
  senderRole: string;
  message: string;
  createdAt: string;
}

export const Support: React.FC = () => {
  const { showToast } = useToast();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState<boolean>(true);
  const [ticketError, setTicketError] = useState<string | null>(null);

  // Form State
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('EQUIPMENT');
  const [priority, setPriority] = useState('NORMAL');
  const [referenceType, setReferenceType] = useState<'TRACKING' | 'ORDER' | 'OTHER'>('TRACKING');
  const [referenceId, setReferenceId] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Ticket Detail Drawer
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // SOP Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    loadTickets();
  }, []);

  // Lock background body scroll when ticket modal is open
  useEffect(() => {
    if (selectedTicket) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [selectedTicket]);

  const loadTickets = async () => {
    try {
      setLoadingTickets(true);
      setTicketError(null);
      const data = await warehousePortalService.getTickets();
      setTickets(data || []);
    } catch (err: unknown) {
      console.error('Failed to load support tickets:', err);
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setTicketError(e.response?.data?.message || 'Unable to retrieve tickets.');
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !description.trim()) {
      showToast('error', 'Validation Error', 'Please complete the subject and description.');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        subject: subject.trim(),
        category,
        priority,
        description: description.trim(),
        trackingNumber: referenceType === 'TRACKING' ? referenceId.trim() : undefined,
        orderNumber: referenceType === 'ORDER' ? referenceId.trim() : undefined,
      };

      const created = await warehousePortalService.createTicket(payload);
      showToast('success', 'Ticket Submitted', `Support ticket ${created.ticketNumber || created.id} logged with Central Operations.`);

      setSubject('');
      setDescription('');
      setReferenceId('');
      await loadTickets();
    } catch (err: unknown) {
      console.error('Ticket submission error:', err);
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      showToast('error', 'Submission Failed', e.response?.data?.message || 'Unable to submit support ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenTicketDetails = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    try {
      setLoadingMessages(true);
      const msgs = await warehousePortalService.getTicketMessages(ticket.id);
      setMessages(msgs || []);
    } catch (err) {
      console.error('Failed to load ticket messages:', err);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    try {
      setSendingReply(true);
      const newMsg = await warehousePortalService.addTicketMessage(selectedTicket.id, replyText.trim());
      setMessages((prev) => [...prev, newMsg]);
      setReplyText('');
      showToast('success', 'Reply Sent', 'Message sent to support operations.');
    } catch (err: unknown) {
      console.error('Failed to add message:', err);
      showToast('error', 'Send Error', 'Unable to send message.');
    } finally {
      setSendingReply(false);
    }
  };

  const getPriorityBadge = (p: string) => {
    const val = (p || 'NORMAL').toUpperCase();
    if (val === 'URGENT' || val === 'HIGH') {
      return <span style={{ fontSize: 10.5, fontWeight: 800, padding: '2px 7px', borderRadius: 4, backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>{val}</span>;
    }
    if (val === 'LOW') {
      return <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 7px', borderRadius: 4, backgroundColor: '#f1f5f9', color: '#475569' }}>LOW</span>;
    }
    return <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 7px', borderRadius: 4, backgroundColor: '#eff6ff', color: '#1d4ed8' }}>NORMAL</span>;
  };

  const getStatusBadge = (s: string) => {
    const val = (s || 'OPEN').toUpperCase();
    if (val === 'RESOLVED' || val === 'CLOSED') {
      return <span style={{ fontSize: 10.5, fontWeight: 800, padding: '2px 7px', borderRadius: 4, backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>RESOLVED</span>;
    }
    if (val === 'IN_PROGRESS') {
      return <span style={{ fontSize: 10.5, fontWeight: 800, padding: '2px 7px', borderRadius: 4, backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>IN PROGRESS</span>;
    }
    return <span style={{ fontSize: 10.5, fontWeight: 800, padding: '2px 7px', borderRadius: 4, backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}>OPEN</span>;
  };

  const faqs = [
    {
      q: 'How to handle cargo weight discrepancies during intake?',
      a: 'If a manifested shipment exceeds ±3% gross tare tolerance on the calibrated weighbridge, flag the consignment as QUARANTINED in Staging/Intake Control and alert central dispatch before signing the driver manifest.'
    },
    {
      q: 'What is the standard procedure for damaged inventory intake?',
      a: 'Immediately use the "Receive Inbound Stock" action, inspect the packaging, and record damaged units in the Damaged Stock column. The system automatically isolates the units and records an inventory audit transaction.'
    },
    {
      q: 'How do I reassign an active driver or vehicle?',
      a: 'Navigate to Outgoing Shipments, select the target shipment, and click "Assign Fleet". You can re-select any verified driver and operational vehicle assigned to your warehouse hub.'
    },
    {
      q: 'When does a shipment transition to IN_TRANSIT?',
      a: 'A shipment reaches IN_TRANSIT when the Warehouse Manager verifies the driver checklist in the Dispatch Gate and executes "Authorize & Dispatch". This immediately updates Admin and Customer portals.'
    }
  ];

  return (
    <div style={{ maxWidth: 1160, margin: '0 auto', padding: '24px 32px 40px', boxSizing: 'border-box' }} className="space-y-6">
      {/* ── Page Header ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ padding: 6, borderRadius: 8, backgroundColor: '#ecfdf5', color: '#059669', display: 'flex' }}>
            <Headphones size={20} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Help & Support Center
          </h1>
        </div>
        <p style={{ fontSize: 13.5, color: '#64748b', margin: 0 }}>
          Get assistance with warehouse operations, equipment, shipments and platform issues.
        </p>
      </div>

      {/* ── 3 Support Option Cards (With tel: and mailto:) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        {/* Central Fleet Command */}
        <div className="card" style={{ padding: 20, background: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ padding: 8, borderRadius: 8, backgroundColor: '#ecfdf5', color: '#059669', display: 'flex' }}>
                <Phone size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Operations Support
                </h3>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Fleet & Route Escalations</span>
              </div>
            </div>
            <p style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.5, margin: '0 0 14px' }}>
              Direct hotline for active transit delays, carrier deviations, dispatch gate holds, or urgent consignee rerouting.
            </p>
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 11.5, color: '#059669', fontWeight: 700 }}>24/7 Priority Hotline</span>
            <a
              href="tel:+918041209901"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 10px',
                borderRadius: 6,
                backgroundColor: '#059669',
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 700,
                textDecoration: 'none',
                maxWidth: '100%',
                boxSizing: 'border-box',
              }}
            >
              <Phone size={13} style={{ flexShrink: 0 }} /> +91 (80) 4120-9901
            </a>
          </div>
        </div>

        {/* Dock & Yard Safety Desk */}
        <div className="card" style={{ padding: 20, background: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ padding: 8, borderRadius: 8, backgroundColor: '#fffbeb', color: '#d97706', display: 'flex' }}>
                <AlertTriangle size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Safety & Compliance
                </h3>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Dock & Yard Safety Desk</span>
              </div>
            </div>
            <p style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.5, margin: '0 0 14px' }}>
              Immediate escalation for hazardous material spills, forklift accidents, dock bay damage, or driver safety violations.
            </p>
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 11.5, color: '#d97706', fontWeight: 700 }}>Immediate Safety Protocol</span>
            <a
              href="tel:+918041209905"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 10px',
                borderRadius: 6,
                backgroundColor: '#d97706',
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 700,
                textDecoration: 'none',
                maxWidth: '100%',
                boxSizing: 'border-box',
              }}
            >
              <Phone size={13} style={{ flexShrink: 0 }} /> +91 (80) 4120-9905
            </a>
          </div>
        </div>

        {/* Systems IT Support */}
        <div className="card" style={{ padding: 20, background: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ padding: 8, borderRadius: 8, backgroundColor: '#eff6ff', color: '#4338ca', display: 'flex' }}>
                <Mail size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  IT & Platform Support
                </h3>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Scanners & Weighbridges</span>
              </div>
            </div>
            <p style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.5, margin: '0 0 14px' }}>
              Assistance with RFID scanner synchronization, barcode label printers, digital weighbridge integration, or login issues.
            </p>
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 11.5, color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} /> Response: ~15m
            </span>
            <a
              href="mailto:ops-it@primeroute.com?subject=PrimeRoute%20Warehouse%20IT%20%26%20Platform%20Support%20Request&body=Hello%20PrimeRoute%20IT%20Support%2C%0A%0AI%20require%20assistance%20with%20warehouse%20platform%20or%20hardware%20operations%3A%0A%0AHub%20Location%3A%20%0ADevice%20%2F%20Scanner%20ID%3A%20%0AIssue%20Summary%3A%20%0A%0AThank%20you%2C%0AWarehouse%20Operations"
              title="Click to email ops-it@primeroute.com"
              onClick={() => {
                if (navigator?.clipboard) {
                  navigator.clipboard.writeText('ops-it@primeroute.com').catch(() => {});
                }
                showToast('info', 'Email Copied', 'ops-it@primeroute.com copied to clipboard.');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 10px',
                borderRadius: 6,
                backgroundColor: '#eff6ff',
                color: '#4338ca',
                fontSize: 12,
                fontWeight: 700,
                textDecoration: 'none',
                border: '1px solid #c7d2fe',
                maxWidth: '100%',
                boxSizing: 'border-box',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e0e7ff';
                e.currentTarget.style.borderColor = '#818cf8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#eff6ff';
                e.currentTarget.style.borderColor = '#c7d2fe';
              }}
            >
              <Mail size={13} style={{ flexShrink: 0 }} /> ops-it@primeroute.com
            </a>
          </div>
        </div>
      </div>

      {/* ── Two-Column Layout: Ticket Form + SOP Guidelines ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 20 }}>
        {/* Create Support Ticket Form */}
        <div className="card" style={{ padding: 24, background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
            <MessageSquare size={18} color="#059669" />
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Log Operational Incident / Request Ticket
              </h3>
              <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                Submits a formal ticket record to HQ logistics dispatch and operations command.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmitTicket} className="space-y-4">
            <div className="form-group">
              <label className="form-label form-label-required" htmlFor="ticket-subject">
                Issue Summary *
              </label>
              <input
                id="ticket-subject"
                type="text"
                className="form-input"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Dock Bay #4 hydraulic lift sensor malfunction during intake"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label form-label-required">
                  Issue Category *
                </label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="EQUIPMENT">Dock & Equipment</option>
                  <option value="IT_SYSTEMS">IT & Scanner System</option>
                  <option value="FLEET_DRIVER">Driver / Vehicle Issue</option>
                  <option value="SAFETY">Safety & Yard Hazard</option>
                  <option value="GENERAL">General Operational</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">
                  Urgency Level *
                </label>
                <select
                  className="form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="LOW">Low (Routine maintenance)</option>
                  <option value="NORMAL">Normal (Standard response)</option>
                  <option value="HIGH">High (Impacts dispatch SLA)</option>
                  <option value="URGENT">Urgent (Operation blocking)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Reference</label>
                <select
                  className="form-select"
                  value={referenceType}
                  onChange={(e) => setReferenceType(e.target.value as any)}
                >
                  <option value="TRACKING">Tracking #</option>
                  <option value="ORDER">Order #</option>
                  <option value="OTHER">SKU / Asset</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Reference ID (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  placeholder="e.g. TRK-PR-JV685885 or WH-DOCK-04"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label form-label-required" htmlFor="ticket-description">
                Detailed Incident Description *
              </label>
              <textarea
                id="ticket-description"
                className="form-input"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what occurred, any impacted shipments or inventory SKUs, and immediate actions taken..."
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={submitting}
                className="wh-btn wh-btn-primary"
                style={{ gap: 6 }}
                id="submit-ticket-btn"
              >
                {submitting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Logging Incident...
                  </>
                ) : (
                  <>
                    <Send size={14} /> Submit Support Ticket
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Standard Operating Guidelines (SOP Accordion) */}
        <div className="card" style={{ padding: 24, background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
            <FileQuestion size={18} color="#059669" />
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Standard Operating Guidelines (SOP)
              </h3>
              <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                Essential protocols for warehouse intake, inventory quarantine, and dispatch releases.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;

              return (
                <div
                  key={idx}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    overflow: 'hidden',
                    backgroundColor: isOpen ? '#f8fafc' : '#ffffff',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                      {faq.q}
                    </span>
                    {isOpen ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
                  </button>

                  {isOpen && (
                    <div style={{ padding: '0 16px 14px', fontSize: 12.5, color: '#475569', lineHeight: 1.55, borderTop: '1px solid #f1f5f9' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── My Recent Support Tickets Table ── */}
      <div className="card" style={{ background: '#ffffff', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Inbox size={18} color="#059669" />
              My Warehouse Support Tickets
            </h3>
            <p style={{ fontSize: 12.5, color: '#64748b', margin: '2px 0 0' }}>
              Real-time ticket records logged by this facility authority in PostgreSQL.
            </p>
          </div>

          <button
            type="button"
            className="wh-btn wh-btn-outline"
            onClick={loadTickets}
            style={{ fontSize: 12, gap: 4, padding: '6px 12px' }}
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        {loadingTickets ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
            <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 8px', color: '#059669' }} />
            <p style={{ fontSize: 12.5 }}>Loading ticket records...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
            <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 10px' }} />
            <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
              No Active Support Tickets
            </h4>
            <p style={{ fontSize: 12.5, margin: 0 }}>
              Use the form above if you need to log hardware issues, route escalations, or yard incidents.
            </p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="data-table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Subject</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'center' }}>Priority</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th>Created Date</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 12, color: '#047857' }}>
                      {t.ticketNumber || `#${t.id}`}
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a', fontSize: 13.5 }}>{t.subject}</strong>
                      {(t.trackingNumber || t.orderNumber) && (
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                          Ref: {t.trackingNumber || t.orderNumber}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: 12, color: '#475569' }}>
                        {t.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {getPriorityBadge(t.priority)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {getStatusBadge(t.status)}
                    </td>
                    <td style={{ fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>
                      {t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="wh-btn wh-btn-outline"
                        onClick={() => handleOpenTicketDetails(t)}
                        style={{ fontSize: 11.5, padding: '4px 10px' }}
                      >
                        View Thread
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Ticket Detail & Conversation Modal ── */}
      {selectedTicket && (
        <Modal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title={`Support Ticket: ${selectedTicket.ticketNumber || selectedTicket.id}`}
          size="lg"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Ticket Info Card */}
            <div style={{ padding: 14, backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {selectedTicket.subject}
                </h4>
                <div style={{ display: 'flex', gap: 6 }}>
                  {getPriorityBadge(selectedTicket.priority)}
                  {getStatusBadge(selectedTicket.status)}
                </div>
              </div>

              <p style={{ color: '#475569', margin: '4px 0 8px', lineHeight: 1.5 }}>
                {selectedTicket.description}
              </p>

              {(selectedTicket.trackingNumber || selectedTicket.orderNumber) && (
                <div style={{ fontSize: 11.5, color: '#047857', fontWeight: 600 }}>
                  Reference: {selectedTicket.trackingNumber || selectedTicket.orderNumber}
                </div>
              )}
            </div>

            {/* Conversation Messages */}
            <div>
              <h5 style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.04em' }}>
                Conversation Updates ({messages.length})
              </h5>

              {loadingMessages ? (
                <div style={{ textAlign: 'center', padding: 20, color: '#64748b' }}>
                  <RefreshCw size={16} className="animate-spin" style={{ margin: '0 auto 4px', color: '#059669' }} />
                  <span style={{ fontSize: 12 }}>Loading messages...</span>
                </div>
              ) : messages.length === 0 ? (
                <div style={{ padding: 16, textAlign: 'center', color: '#94a3b8', fontSize: 12.5, backgroundColor: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: 8 }}>
                  No messages logged yet. The operations team will review your ticket shortly.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 240, overflowY: 'auto' }}>
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        backgroundColor: m.senderRole === 'ADMIN' ? '#eff6ff' : '#f8fafc',
                        border: `1px solid ${m.senderRole === 'ADMIN' ? '#bfdbfe' : '#e2e8f0'}`,
                        fontSize: 12.5,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <strong style={{ color: m.senderRole === 'ADMIN' ? '#1d4ed8' : '#0f172a' }}>
                          {m.senderName} ({m.senderRole})
                        </strong>
                        <span style={{ fontSize: 11, color: '#64748b' }}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{ margin: 0, color: '#334155', lineHeight: 1.45 }}>{m.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reply Form */}
            <form onSubmit={handleSendReply} style={{ borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type an update or reply for this ticket..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  type="submit"
                  disabled={sendingReply || !replyText.trim()}
                  className="wh-btn wh-btn-primary"
                  style={{ gap: 6, whiteSpace: 'nowrap' }}
                >
                  {sendingReply ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />} Send Update
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Support;
