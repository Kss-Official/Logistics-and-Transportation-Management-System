import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus,
  Phone,
  Mail,
  RefreshCw,
  AlertCircle,
  Clock,
  Package,
  FileText,
  HelpCircle,
  ExternalLink,
  Send,
  User,
  ShieldCheck,
  MessageSquare,
  Copy,
  Check,
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { EmptyState, LoadingState } from '../../components/common/States';
import { useToast } from '../../components/common/Toast';
import {
  supportService,
  type SupportTicket,
  type SupportContact,
  type SupportTicketMessage,
} from '../../services/supportService';
import { getAllOrders } from '../../services/orderService';
import { shipmentService } from '../../services/shipmentService';
import type { Order } from '../../types/order';
import type { ShipmentSummary } from '../../types/shipment';
import { validateRequired } from '../../utils/validation';
import { formatCategory, getCategoryBadgeStyle } from '../admin/Support';

const CATEGORY_OPTIONS = [
  { value: 'ORDER', label: 'Order Inquiry' },
  { value: 'SHIPMENT', label: 'Shipping & Freight' },
  { value: 'DELIVERY_DELAY', label: 'Delivery Delay' },
  { value: 'DAMAGED_FREIGHT', label: 'Damaged Freight' },
  { value: 'BILLING', label: 'Billing Inquiry' },
  { value: 'PAYMENT', label: 'Payment Query' },
  { value: 'ACCOUNT', label: 'Account & Profile' },
  { value: 'ADDRESS', label: 'Address Update' },
  { value: 'OTHER', label: 'General Assistance' },
];

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low - Standard inquiry' },
  { value: 'MEDIUM', label: 'Medium - Operational question' },
  { value: 'HIGH', label: 'High - In-transit delay / urgent' },
  { value: 'URGENT', label: 'Urgent - Damage, loss or critical disruption' },
];

export default function CustomerSupport() {
  const { showToast } = useToast();

  // Contact Info State
  const [contact, setContact] = useState<SupportContact | null>(null);
  const [contactLoading, setContactLoading] = useState(true);

  // Tickets State
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Customer Orders & Shipments for Selectors
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [customerShipments, setCustomerShipments] = useState<ShipmentSummary[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Modals & Forms State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Ticket Conversation State
  const [messages, setMessages] = useState<SupportTicketMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'DELIVERY_DELAY',
    priority: 'MEDIUM',
    orderNumber: '',
    trackingNumber: '',
    description: '',
  });

  // Load Contact Info
  const loadContact = useCallback(async () => {
    try {
      setContactLoading(true);
      const data = await supportService.getSupportContact();
      setContact(data);
    } catch (err) {
      console.error('Failed to load support contact info:', err);
    } finally {
      setContactLoading(false);
    }
  }, []);

  // Load Tickets
  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const data = await supportService.getTickets();
      setTickets(data);
    } catch (err) {
      console.error('Failed to load support tickets:', err);
      setLoadError('Unable to load support tickets.');
      showToast('error', 'Error', 'Unable to load support tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Load Customer Orders & Shipments for dropdown pickers
  const loadCustomerData = useCallback(async () => {
    try {
      setDataLoading(true);
      const [ordersData, shipmentsData] = await Promise.allSettled([
        getAllOrders(),
        shipmentService.getAllShipments(),
      ]);

      if (ordersData.status === 'fulfilled') {
        setCustomerOrders(ordersData.value || []);
      }
      if (shipmentsData.status === 'fulfilled') {
        setCustomerShipments(shipmentsData.value || []);
      }
    } catch (err) {
      console.error('Failed to load customer orders/shipments:', err);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContact();
    loadTickets();
    loadCustomerData();
  }, [loadContact, loadTickets, loadCustomerData]);

  // Load conversation messages when a ticket is opened
  const loadMessages = useCallback(async (ticketId: number) => {
    try {
      setMessagesLoading(true);
      const data = await supportService.getTicketMessages(ticketId);
      setMessages(data);
    } catch (err) {
      console.error('Failed to load messages for ticket:', err);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      loadMessages(selectedTicket.id);
      setReplyText('');
    } else {
      setMessages([]);
    }
  }, [selectedTicket, loadMessages]);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Real-time conversation polling while ticket modal is open (every 10s)
  useEffect(() => {
    if (!selectedTicket) return;
    const interval = setInterval(() => {
      supportService
        .getTicketMessages(selectedTicket.id)
        .then((latestMsgs) => {
          setMessages(latestMsgs);
        })
        .catch((err) => {
          console.debug('Background poll customer messages:', err);
        });
    }, 10000);

    return () => clearInterval(interval);
  }, [selectedTicket]);

  // Handle order selection change
  const handleOrderSelect = (orderNum: string) => {
    let matchedTracking = '';
    if (orderNum) {
      const foundShipment = customerShipments.find((s) => s.orderNumber === orderNum);
      if (foundShipment) {
        matchedTracking = foundShipment.trackingNumber;
      }
    }
    setNewTicket((prev) => ({
      ...prev,
      orderNumber: orderNum,
      trackingNumber: matchedTracking || prev.trackingNumber,
    }));
  };

  // Clean dialable phone number
  const dialablePhone = contact?.supportPhone
    ? contact.supportPhone.replace(/[^\d+]/g, '')
    : '';

  const emailSubject = 'PrimeRoute Logistics Support Request';
  const emailBody = 'Hello PrimeRoute Support Team,\n\nI need assistance with:\n\n[Customer can continue writing here]\n\nRegards,\nPrimeRoute Customer\n';

  // Dynamic Gmail Compose URL for Desktop Web
  const gmailComposeUrl = contact?.supportEmail
    ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contact.supportEmail)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
    : '#';

  // Mailto with pre-filled professional subject & body fallback
  const mailtoHref = contact?.supportEmail
    ? `mailto:${contact.supportEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
    : '#';

  const handleCopyEmail = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!contact?.supportEmail) return;
    navigator.clipboard.writeText(contact.supportEmail);
    setCopiedEmail(true);
    showToast('success', 'Email Copied', `${contact.supportEmail} copied to clipboard.`);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleCopyPhone = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!contact?.supportPhone) return;
    navigator.clipboard.writeText(contact.supportPhone);
    setCopiedPhone(true);
    showToast('success', 'Phone Copied', `${contact.supportPhone} copied to clipboard.`);
    setTimeout(() => setCopiedPhone(false), 2500);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    const subRes = validateRequired(newTicket.subject, 'Subject');
    if (!subRes.isValid) {
      errors.subject = subRes.error!;
    } else if (newTicket.subject.trim().length < 4) {
      errors.subject = 'Subject must be at least 4 characters.';
    }

    const descRes = validateRequired(newTicket.description, 'Description');
    if (!descRes.isValid) {
      errors.description = descRes.error!;
    } else if (newTicket.description.trim().length < 10) {
      errors.description = 'Please provide a detailed description (at least 10 characters).';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast('error', 'Validation Error', 'Please provide a subject and detailed description.');
      return;
    }
    setFormErrors({});

    try {
      setSubmitting(true);
      const created = await supportService.createTicket({
        subject: newTicket.subject.trim(),
        category: newTicket.category,
        priority: newTicket.priority,
        description: newTicket.description.trim(),
        orderNumber: newTicket.orderNumber.trim() || undefined,
        trackingNumber: newTicket.trackingNumber.trim() || undefined,
      });

      setTickets((prev) => [created, ...prev]);
      setIsCreateOpen(false);
      setNewTicket({
        subject: '',
        category: 'DELIVERY_DELAY',
        priority: 'MEDIUM',
        orderNumber: '',
        trackingNumber: '',
        description: '',
      });

      showToast(
        'success',
        'Support Ticket Created Successfully',
        `Your ticket number is: ${created.ticketNumber}`
      );
    } catch (err) {
      console.error('Failed to create ticket:', err);
      showToast('error', 'Submission Failed', 'Unable to create support ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim() || sendingReply) return;

    try {
      setSendingReply(true);
      const msg = await supportService.sendMessage(selectedTicket.id, replyText.trim());
      setMessages((prev) => [...prev, msg]);
      setReplyText('');
      showToast('success', 'Message Sent', 'Your response has been added to the ticket.');
      // Refresh tickets in background to get updated updatedAt
      loadTickets();
    } catch (err) {
      console.error('Failed to send message:', err);
      showToast('error', 'Error', 'Failed to send your message. Please try again.');
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', paddingBottom: 40 }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h2 className="page-title">Help & Customer Support Desk</h2>
          <p className="page-subtitle">
            Submit dispute claims, report transit delays, or reach out to your dedicated operations team.
          </p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-outline btn-sm"
            onClick={loadTickets}
            disabled={loading}
            title="Refresh tickets from server"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 24/7 Dedicated Logistics Assistance Card */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)',
          color: '#ffffff',
          padding: '24px 28px',
          marginBottom: 24,
          borderRadius: 14,
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        <div style={{ maxWidth: 520 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '3px 10px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: 8,
              backdropFilter: 'blur(4px)',
            }}
          >
            <Clock size={12} />
            <span>{contact?.supportHours ? `${contact.supportHours} Dedicated Logistics Assistance` : (contact?.availability || '24/7 Dedicated Logistics Assistance')}</span>
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 6px', color: '#ffffff' }}>
            {contact?.availability || '24/7 Dedicated Logistics Assistance'}
          </h3>
          <p style={{ fontSize: 13, opacity: 0.9, margin: 0, lineHeight: 1.5 }}>
            {contact?.description ||
              'Our logistics support team is available to help with orders, shipments, deliveries and account-related issues.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {contactLoading ? (
            <div style={{ fontSize: 13, opacity: 0.8 }}>Loading contact options...</div>
          ) : (
            <>
              {contact?.supportEmail && (
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(true)}
                  className="btn btn-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.16)',
                    color: '#ffffff',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '9px 16px',
                    borderRadius: 8,
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(6px)',
                    cursor: 'pointer',
                  }}
                  title={`Email Support (${contact.supportEmail})`}
                >
                  <Mail size={15} />
                  <span>Email Support</span>
                </button>
              )}

              {contact?.supportPhone && (
                <button
                  type="button"
                  onClick={() => setIsPhoneModalOpen(true)}
                  className="btn btn-sm"
                  style={{
                    background: '#ffffff',
                    color: '#0f172a',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '9px 16px',
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  title={`Call Support (${contact.supportPhone})`}
                >
                  <Phone size={15} color="#2563eb" />
                  <span>Call Support</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="btn btn-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  color: '#1e3a8a',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 16px',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Plus size={15} />
                <span>Create Support Ticket</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tickets Section */}
      <div className="card">
        <div
          className="card-header"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <div>
            <h3 className="card-title">My Support Tickets</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
              Track active inquiries, dispatch resolutions, and freight issue claims.
            </p>
          </div>
          {!loading && !loadError && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                background: '#f1f5f9',
                color: '#475569',
                padding: '3px 10px',
                borderRadius: 12,
              }}
            >
              {tickets.length} {tickets.length === 1 ? 'Ticket' : 'Tickets'}
            </span>
          )}
        </div>

        <div className="card-body">
          {loading ? (
            <LoadingState message="Loading support tickets from server..." />
          ) : loadError ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  background: '#fef2f2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <AlertCircle size={26} />
              </div>
              <h4 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px', color: '#0f172a' }}>
                Unable to load support tickets.
              </h4>
              <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px' }}>
                There was a problem reaching the PrimeRoute Helpdesk service.
              </p>
              <button className="btn btn-primary btn-sm" onClick={loadTickets}>
                Try Again
              </button>
            </div>
          ) : tickets.length === 0 ? (
            <EmptyState
              title="No support tickets yet"
              description="Everything is running smoothly. If you have an inquiry, delivery concern, or freight claim, create a support ticket."
              action={
                <button className="btn btn-primary btn-sm" onClick={() => setIsCreateOpen(true)}>
                  <Plus size={14} /> Create Support Ticket
                </button>
              }
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: '16px 20px',
                    background: '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#2563eb';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 99, 235, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 8,
                      flexWrap: 'wrap',
                      gap: 8,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: 12,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            color: '#1d4ed8',
                            background: '#eff6ff',
                            padding: '2px 8px',
                            borderRadius: 4,
                            border: '1px solid #bfdbfe',
                          }}
                        >
                          {t.ticketNumber}
                        </span>
                        <span style={getCategoryBadgeStyle(t.category)}>
                          {formatCategory(t.category)}
                        </span>
                      </div>
                      <h4
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          margin: '8px 0 0',
                        }}
                      >
                        {t.subject}
                      </h4>
                    </div>

                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <StatusBadge status={t.priority} />
                      <StatusBadge status={t.status} />
                    </div>
                  </div>

                  <p
                    style={{
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      background: '#f8fafc',
                      padding: '10px 14px',
                      borderRadius: 6,
                      margin: '10px 0',
                      border: '1px solid #f1f5f9',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {t.description}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: 12,
                      color: 'var(--text-muted)',
                      flexWrap: 'wrap',
                      gap: 10,
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={13} />
                      <span>
                        Opened:{' '}
                        {new Date(t.createdAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </span>

                    <div style={{ display: 'flex', gap: 14 }}>
                      {t.orderNumber && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <FileText size={13} />
                          <span>Order: <strong className="font-mono">{t.orderNumber}</strong></span>
                        </span>
                      )}
                      {t.trackingNumber && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Package size={13} />
                          <span>Tracking: <strong className="font-mono">{t.trackingNumber}</strong></span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Support Ticket Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => !submitting && setIsCreateOpen(false)}
        title="Open Support Ticket"
        size="md"
      >
        <form onSubmit={handleCreateTicket}>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label form-label-required">Subject / Summary</label>
            <input
              type="text"
              className={`form-input ${formErrors.subject ? 'error' : ''}`}
              placeholder="e.g. Delivery Delay for Order PR-ORD-..."
              value={newTicket.subject}
              disabled={submitting}
              onChange={(e) => {
                setNewTicket({ ...newTicket, subject: e.target.value });
                if (formErrors.subject) setFormErrors((prev) => ({ ...prev, subject: '' }));
              }}
            />
            {formErrors.subject && <p className="form-error" style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{formErrors.subject}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div className="form-group">
              <label className="form-label form-label-required">Category</label>
              <select
                className="form-select"
                value={newTicket.category}
                disabled={submitting}
                onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label form-label-required">Urgency / Priority</label>
              <select
                className="form-select"
                value={newTicket.priority}
                disabled={submitting}
                onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selectable Order and Tracking Dropdowns from backend */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div className="form-group">
              <label className="form-label">Related Order (Selectable)</label>
              <select
                className="form-select font-mono"
                value={newTicket.orderNumber}
                disabled={submitting}
                onChange={(e) => handleOrderSelect(e.target.value)}
              >
                <option value="">-- No specific order --</option>
                {customerOrders.map((o) => (
                  <option key={o.id} value={o.orderNumber}>
                    {o.orderNumber} ({o.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Shipment / Tracking # (Selectable)</label>
              {customerShipments.length > 0 ? (
                <select
                  className="form-select font-mono"
                  value={newTicket.trackingNumber}
                  disabled={submitting}
                  onChange={(e) => setNewTicket({ ...newTicket, trackingNumber: e.target.value })}
                >
                  <option value="">-- No specific shipment --</option>
                  {customerShipments.map((s) => (
                    <option key={s.id} value={s.trackingNumber}>
                      {s.trackingNumber} ({s.status})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  className="form-input font-mono"
                  placeholder="e.g. TRK-PR-..."
                  value={newTicket.trackingNumber}
                  disabled={submitting}
                  onChange={(e) => setNewTicket({ ...newTicket, trackingNumber: e.target.value })}
                />
              )}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 18 }}>
            <label className="form-label form-label-required">Detailed Description</label>
            <textarea
              className={`form-textarea ${formErrors.description ? 'error' : ''}`}
              rows={4}
              placeholder="Provide specific details regarding the incident, routing delay, damage, or discrepancy..."
              value={newTicket.description}
              disabled={submitting}
              onChange={(e) => {
                setNewTicket({ ...newTicket, description: e.target.value });
                if (formErrors.description) setFormErrors((prev) => ({ ...prev, description: '' }));
              }}
            />
            {formErrors.description && <p className="form-error" style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{formErrors.description}</p>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              disabled={submitting}
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Support Ticket'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Ticket Details & Real Conversation Modal */}
      {selectedTicket && (
        <Modal
          isOpen={Boolean(selectedTicket)}
          onClose={() => setSelectedTicket(null)}
          title={`Ticket Details — ${selectedTicket.ticketNumber}`}
          size="lg"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Header info */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                paddingBottom: 12,
                borderBottom: '1px solid #e2e8f0',
                gap: 10,
                flexWrap: 'wrap',
              }}
            >
              <div>
                <span style={getCategoryBadgeStyle(selectedTicket.category)}>
                  {formatCategory(selectedTicket.category)}
                </span>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '8px 0 0' }}>
                  {selectedTicket.subject}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <StatusBadge status={selectedTicket.priority} />
                <StatusBadge status={selectedTicket.status} />
              </div>
            </div>

            {/* Details Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 12,
                background: '#f8fafc',
                padding: '12px 16px',
                borderRadius: 8,
                fontSize: 12,
              }}
            >
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>
                  Ticket ID
                </span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                  {selectedTicket.ticketNumber}
                </span>
              </div>

              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>
                  Status
                </span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedTicket.status}</span>
              </div>

              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>
                  Opened
                </span>
                <span style={{ color: '#334155' }}>
                  {new Date(selectedTicket.createdAt).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {selectedTicket.orderNumber && (
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>
                    Order
                  </span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0f172a' }}>
                    {selectedTicket.orderNumber}
                  </span>
                </div>
              )}

              {selectedTicket.trackingNumber && (
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>
                    Tracking
                  </span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0f172a' }}>
                    {selectedTicket.trackingNumber}
                  </span>
                </div>
              )}
            </div>

            {/* Original Description */}
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 6 }}>
                Ticket Issue Description
              </h4>
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: '12px 14px',
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: '#1e293b',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {selectedTicket.description}
              </div>
            </div>

            {/* Conversation Thread */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MessageSquare size={14} />
                  <span>Conversation History ({messages.length})</span>
                </h4>
                <button
                  type="button"
                  className="btn btn-outline btn-xs"
                  title="Reload Messages"
                  onClick={() => loadMessages(selectedTicket.id)}
                  disabled={messagesLoading}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', fontSize: 12 }}
                >
                  <RefreshCw size={12} className={messagesLoading ? 'spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: '16px',
                  maxHeight: 280,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                {messagesLoading && messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 20, color: '#64748b', fontSize: 13 }}>
                    Loading conversation thread...
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 12px', color: '#64748b', fontSize: 13 }}>
                    No messages yet in this ticket thread. Our operations team is reviewing your ticket. You can also write a follow-up reply below.
                  </div>
                ) : (
                  messages.map((m) => {
                    const isCustomer = m.senderRole === 'CUSTOMER';
                    return (
                      <div
                        key={m.id}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isCustomer ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            marginBottom: 4,
                            fontSize: 11,
                            color: '#64748b',
                          }}
                        >
                          {isCustomer ? (
                            <>
                              <span style={{ fontWeight: 600, color: '#1e40af' }}>You ({m.senderName})</span>
                              <User size={12} />
                            </>
                          ) : (
                            <>
                              <ShieldCheck size={13} color="#059669" />
                              <span style={{ fontWeight: 700, color: '#047857' }}>
                                PrimeRoute Support ({m.senderName})
                              </span>
                            </>
                          )}
                          <span>•</span>
                          <span>
                            {new Date(m.createdAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div
                          style={{
                            maxWidth: '85%',
                            padding: '10px 14px',
                            borderRadius: 10,
                            fontSize: 13,
                            lineHeight: 1.5,
                            whiteSpace: 'pre-wrap',
                            background: isCustomer ? '#2563eb' : '#ffffff',
                            color: isCustomer ? '#ffffff' : '#0f172a',
                            border: isCustomer ? 'none' : '1px solid #cbd5e1',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                          }}
                        >
                          {m.message}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Reply Input Box */}
            {selectedTicket.status !== 'CLOSED' ? (
              <form onSubmit={handleSendReply} style={{ marginTop: 4 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Type your reply or additional details for the support team..."
                    value={replyText}
                    disabled={sendingReply}
                    onChange={(e) => setReplyText(e.target.value)}
                    style={{ resize: 'vertical', fontSize: 13 }}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={sendingReply || !replyText.trim()}
                    style={{
                      height: 42,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '0 16px',
                      flexShrink: 0,
                    }}
                  >
                    <Send size={14} />
                    <span>{sendingReply ? 'Sending...' : 'Send'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div
                style={{
                  background: '#f1f5f9',
                  padding: 10,
                  borderRadius: 6,
                  fontSize: 12,
                  color: '#64748b',
                  textAlign: 'center',
                }}
              >
                This ticket has been marked as <strong>CLOSED</strong>. No further responses can be sent.
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 10 }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setSelectedTicket(null)}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Email Support Action Modal */}
      <Modal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        title="Contact PrimeRoute Support"
        size="sm"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            Reach out to our operations team via email. Choose how you would like to compose your message:
          </p>

          <div
            style={{
              background: '#f8fafc',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '12px 14px',
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Support Email Recipient
            </span>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#1d4ed8', margin: '3px 0 0', fontFamily: 'monospace' }}>
              {contact?.supportEmail}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <a
              href={gmailComposeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                textDecoration: 'none',
                padding: '11px 16px',
                fontWeight: 600,
              }}
              onClick={() => setIsEmailModalOpen(false)}
            >
              <ExternalLink size={15} />
              <span>Open Gmail</span>
            </a>

            <a
              href={mailtoHref}
              className="btn btn-outline"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                textDecoration: 'none',
                padding: '11px 16px',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
              onClick={() => setIsEmailModalOpen(false)}
            >
              <Mail size={15} />
              <span>Use Email App</span>
            </a>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
            <button
              type="button"
              className="btn btn-link btn-sm"
              onClick={handleCopyEmail}
              style={{ padding: 0, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)' }}
            >
              {copiedEmail ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
              <span>{copiedEmail ? 'Copied' : 'Copy Email Address'}</span>
            </button>

            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setIsEmailModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Phone Support Contact Modal */}
      <Modal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        title="PrimeRoute Support"
        size="sm"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, fontWeight: 500 }}>
            Need immediate assistance?
          </p>

          <div
            style={{
              background: '#f8fafc',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Support Phone
              </span>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '4px 0 0', fontFamily: 'monospace' }}>
                {contact?.supportPhone}
              </p>
            </div>

            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Support Hours
              </span>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#2563eb', margin: '4px 0 0' }}>
                {contact?.supportHours || '24/7'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <a
              href={`tel:${dialablePhone}`}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                textDecoration: 'none',
                padding: '11px 16px',
                fontWeight: 600,
              }}
              onClick={() => setIsPhoneModalOpen(false)}
            >
              <Phone size={15} />
              <span>Call Support</span>
            </a>

            <button
              type="button"
              className="btn btn-outline"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '11px 16px',
                fontWeight: 600,
              }}
              onClick={() => {
                setIsPhoneModalOpen(false);
                setIsCreateOpen(true);
              }}
            >
              <Plus size={15} />
              <span>Create Support Ticket</span>
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
            <button
              type="button"
              className="btn btn-link btn-sm"
              onClick={handleCopyPhone}
              style={{ padding: 0, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)' }}
            >
              {copiedPhone ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
              <span>{copiedPhone ? 'Copied' : 'Copy Phone Number'}</span>
            </button>

            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setIsPhoneModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
