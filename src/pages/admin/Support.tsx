import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Search,
  RefreshCw,
  Eye,
  Send,
  User,
  ShieldCheck,
  MessageSquare,
  Clock,
  Calendar,
  AlertCircle,
  FileText,
  Package,
  Phone,
  Mail,
  CheckCircle2,
  Activity,
  Layers,
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import Drawer from '../../components/common/Drawer';
import { EmptyState, LoadingState } from '../../components/common/States';
import { useToast } from '../../components/common/Toast';
import {
  adminSupportService,
  type AdminSupportTicket,
} from '../../services/adminSupportService';
import type { SupportTicketMessage } from '../../services/supportService';

export function formatDateTime(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return (
      d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ', ' +
      d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    );
  } catch {
    return dateStr;
  }
}

export const SUPPORT_CATEGORIES: Record<string, { label: string; color: string; bg: string; border: string }> = {
  ORDER: { label: 'Order Inquiry', color: '#1e40af', bg: '#eff6ff', border: '#bfdbfe' },
  SHIPMENT: { label: 'Shipping & Freight', color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd' },
  SHIPPING: { label: 'Shipping & Freight', color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd' },
  DELIVERY_DELAY: { label: 'Delivery Delay', color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  DAMAGED_FREIGHT: { label: 'Damaged Freight', color: '#b91c1c', bg: '#fef2f2', border: '#fecaca' },
  BILLING: { label: 'Billing & Invoicing', color: '#047857', bg: '#ecfdf5', border: '#a7f3d0' },
  INVOICE: { label: 'Invoice & Billing', color: '#047857', bg: '#ecfdf5', border: '#a7f3d0' },
  PAYMENT: { label: 'Payment Query', color: '#4338ca', bg: '#eef2ff', border: '#c7d2fe' },
  ACCOUNT: { label: 'Account & Profile', color: '#475569', bg: '#f8fafc', border: '#e2e8f0' },
  ADDRESS: { label: 'Address Update', color: '#6d28d9', bg: '#f5f3ff', border: '#ddd6fe' },
  OTHER: { label: 'General Assistance', color: '#334155', bg: '#f1f5f9', border: '#cbd5e1' },
};

export function formatCategory(cat?: string): string {
  if (!cat) return 'General Assistance';
  const upper = cat.trim().toUpperCase();
  return SUPPORT_CATEGORIES[upper]?.label || upper.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getCategoryBadgeStyle(cat?: string): React.CSSProperties {
  const upper = (cat || '').trim().toUpperCase();
  const cfg = SUPPORT_CATEGORIES[upper];
  if (cfg) {
    return {
      color: cfg.color,
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      fontSize: '11px',
      fontWeight: 600,
      padding: '2px 8px',
      borderRadius: '4px',
      display: 'inline-block',
      whiteSpace: 'nowrap',
    };
  }
  return {
    color: '#475569',
    background: '#f1f5f9',
    border: '1px solid #e2e8f0',
    fontSize: '11px',
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: '4px',
    display: 'inline-block',
    whiteSpace: 'nowrap',
  };
}

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export default function AdminSupport() {
  const { showToast } = useToast();

  const [tickets, setTickets] = useState<AdminSupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const [selectedTicket, setSelectedTicket] = useState<AdminSupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportTicketMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [priorityUpdating, setPriorityUpdating] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all tickets
  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminSupportService.getTickets();
      setTickets(data);
    } catch (err) {
      console.error('Failed to load tickets in admin:', err);
      setError('Unable to load support tickets from server.');
      showToast('error', 'Error', 'Failed to retrieve support tickets.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  // Fetch conversation messages when a ticket is selected
  const loadMessages = useCallback(async (ticketId: number) => {
    try {
      setMessagesLoading(true);
      const data = await adminSupportService.getTicketMessages(ticketId);
      setMessages(data);
    } catch (err) {
      console.error('Failed to load ticket messages in admin:', err);
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

  // Handle status update
  const handleStatusChange = async (newStatus: string) => {
    if (!selectedTicket || statusUpdating) return;
    try {
      setStatusUpdating(true);
      const updated = await adminSupportService.updateStatus(selectedTicket.id, newStatus);
      setSelectedTicket((prev) => (prev ? { ...prev, status: updated.status, updatedAt: updated.updatedAt } : null));
      setTickets((prev) =>
        prev.map((t) => (t.id === updated.id ? { ...t, status: updated.status, updatedAt: updated.updatedAt } : t))
      );
      showToast('success', 'Status Updated', `Ticket ${updated.ticketNumber} marked as ${updated.status}`);
    } catch (err) {
      console.error('Failed to update ticket status:', err);
      showToast('error', 'Update Failed', 'Could not update ticket status.');
    } finally {
      setStatusUpdating(false);
    }
  };

  // Handle priority update
  const handlePriorityChange = async (newPriority: string) => {
    if (!selectedTicket || priorityUpdating) return;
    try {
      setPriorityUpdating(true);
      const updated = await adminSupportService.updatePriority(selectedTicket.id, newPriority);
      setSelectedTicket((prev) => (prev ? { ...prev, priority: updated.priority, updatedAt: updated.updatedAt } : null));
      setTickets((prev) =>
        prev.map((t) => (t.id === updated.id ? { ...t, priority: updated.priority, updatedAt: updated.updatedAt } : t))
      );
      showToast('success', 'Priority Updated', `Ticket ${updated.ticketNumber} priority changed to ${updated.priority}`);
    } catch (err) {
      console.error('Failed to update ticket priority:', err);
      showToast('error', 'Update Failed', 'Could not update ticket priority.');
    } finally {
      setPriorityUpdating(false);
    }
  };

  // Handle sending reply
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim() || sendingReply) return;

    try {
      setSendingReply(true);
      const newMsg = await adminSupportService.sendMessage(selectedTicket.id, replyText.trim());
      setMessages((prev) => [...prev, newMsg]);
      setReplyText('');
      showToast('success', 'Reply Sent', 'Agent response saved and customer notified.');
      // Refresh tickets in background
      loadTickets();
    } catch (err) {
      console.error('Failed to send admin reply:', err);
      showToast('error', 'Reply Failed', 'Could not submit support reply.');
    } finally {
      setSendingReply(false);
    }
  };

  // Dynamic KPI Stats calculated from live tickets
  const kpis = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === 'OPEN').length;
    const inProgress = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
    const resolvedClosed = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
    const highUrgent = tickets.filter((t) => t.priority === 'HIGH' || t.priority === 'URGENT').length;
    return { total, open, inProgress, resolvedClosed, highUrgent };
  }, [tickets]);

  // Dynamic Status counts for segmented filter pills
  const statusCounts = useMemo(() => {
    return {
      ALL: tickets.length,
      OPEN: tickets.filter((t) => t.status === 'OPEN').length,
      IN_PROGRESS: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
      RESOLVED: tickets.filter((t) => t.status === 'RESOLVED').length,
      CLOSED: tickets.filter((t) => t.status === 'CLOSED').length,
    };
  }, [tickets]);

  // Real-time conversation polling while drawer is open (every 10s)
  useEffect(() => {
    if (!selectedTicket) return;
    const interval = setInterval(() => {
      adminSupportService
        .getTicketMessages(selectedTicket.id)
        .then((latest) => {
          setMessages(latest);
        })
        .catch((err) => {
          console.debug('Background poll ticket messages:', err);
        });
    }, 10000);

    return () => clearInterval(interval);
  }, [selectedTicket]);

  // Filter tickets
  const filteredTickets = tickets.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch =
      t.ticketNumber.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      (t.customerName && t.customerName.toLowerCase().includes(q)) ||
      (t.customerEmail && t.customerEmail.toLowerCase().includes(q)) ||
      (t.orderNumber && t.orderNumber.toLowerCase().includes(q)) ||
      (t.trackingNumber && t.trackingNumber.toLowerCase().includes(q));

    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;

    return matchSearch && matchStatus && matchPriority;
  });

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Customer Support & Inquiries</h2>
          <p className="page-subtitle">
            Manage customer complaints, transit delay inquiries, billing queries, and freight claims.
          </p>
        </div>
        <div className="page-actions">
          <button
            className="btn btn-outline btn-sm"
            onClick={loadTickets}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Segmented Filter Pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {[
          { id: 'ALL', label: 'All', count: statusCounts.ALL },
          { id: 'OPEN', label: 'Open', count: statusCounts.OPEN },
          { id: 'IN_PROGRESS', label: 'In Progress', count: statusCounts.IN_PROGRESS },
          { id: 'RESOLVED', label: 'Resolved', count: statusCounts.RESOLVED },
          { id: 'CLOSED', label: 'Closed', count: statusCounts.CLOSED },
        ].map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                border: isActive ? '1px solid #2563eb' : '1px solid #e2e8f0',
                background: isActive ? '#eff6ff' : '#ffffff',
                color: isActive ? '#1d4ed8' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '1px 7px',
                  borderRadius: 10,
                  background: isActive ? '#2563eb' : '#f1f5f9',
                  color: isActive ? '#ffffff' : '#64748b',
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-box">
          <Search size={15} className="search-box-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search Ticket #, Subject, Customer, Order #, Tracking #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, ' ')}
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="ALL">All Priorities</option>
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* Tickets Table */}
      <div className="table-wrapper">
        {loading ? (
          <LoadingState message="Loading support tickets..." />
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <AlertCircle size={28} color="#dc2626" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px', color: '#0f172a' }}>
              {error}
            </h4>
            <button className="btn btn-primary btn-sm" onClick={loadTickets}>
              Try Again
            </button>
          </div>
        ) : filteredTickets.length === 0 ? (
          <EmptyState
            title="No support tickets found"
            description={
              search || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
                ? 'No tickets match the selected filter criteria.'
                : 'No support inquiries have been opened by customers yet.'
            }
          />
        ) : (
          <div className="table-container" style={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ whiteSpace: 'nowrap', width: '15%' }}>Ticket ID</th>
                  <th style={{ whiteSpace: 'nowrap', width: '28%' }}>Customer</th>
                  <th style={{ whiteSpace: 'nowrap', width: '22%' }}>Category</th>
                  <th style={{ whiteSpace: 'nowrap', width: '15%' }}>Priority</th>
                  <th style={{ whiteSpace: 'nowrap', width: '12%' }}>Status</th>
                  <th style={{ textAlign: 'center', whiteSpace: 'nowrap', width: '8%' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((t) => (
                  <tr key={t.id}>
                    <td className="td-mono" style={{ fontWeight: 700, color: '#1d4ed8' }}>
                      {t.ticketNumber}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {t.customerName || 'Customer'}
                        </span>
                        {t.customerEmail && (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {t.customerEmail}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={getCategoryBadgeStyle(t.category)}>
                        {formatCategory(t.category)}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={t.priority} />
                    </td>
                    <td>
                      <StatusBadge status={t.status} />
                    </td>
                    <td>
                      <div className="td-actions" style={{ justifyContent: 'center' }}>
                        <button
                          className="btn-icon"
                          title="Open Ticket Details & Conversation"
                          onClick={() => setSelectedTicket(t)}
                        >
                          <Eye size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ticket Management Drawer */}
      <Drawer
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title={selectedTicket?.ticketNumber || 'Support Ticket'}
        subtitle={`Customer: ${selectedTicket?.customerName || 'N/A'}`}
        size="lg"
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {selectedTicket?.status !== 'RESOLVED' && selectedTicket?.status !== 'CLOSED' && (
                <button
                  className="btn btn-success btn-sm"
                  disabled={statusUpdating}
                  onClick={() => handleStatusChange('RESOLVED')}
                >
                  <CheckCircle2 size={14} />
                  <span>Mark Resolved</span>
                </button>
              )}
              {selectedTicket?.status === 'OPEN' && (
                <button
                  className="btn btn-outline btn-sm"
                  disabled={statusUpdating}
                  onClick={() => handleStatusChange('IN_PROGRESS')}
                >
                  Move to In Progress
                </button>
              )}
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => setSelectedTicket(null)}>
              Close
            </button>
          </div>
        }
      >
        {selectedTicket && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Customer Contact & Overview Card */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 12,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '14px 16px',
                borderRadius: 'var(--radius)',
              }}
            >
              <div>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Customer Name
                </span>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: '2px 0 0' }}>
                  {selectedTicket.customerName || 'Unknown Customer'}
                </p>
              </div>

              {selectedTicket.customerEmail && (
                <div>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Customer Email
                  </span>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Mail size={12} />
                    <span>{selectedTicket.customerEmail}</span>
                  </p>
                </div>
              )}

              {selectedTicket.customerPhone && (
                <div>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Customer Phone
                  </span>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Phone size={12} />
                    <span>{selectedTicket.customerPhone}</span>
                  </p>
                </div>
              )}

              <div>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Category
                </span>
                <div style={{ marginTop: 4 }}>
                  <span style={getCategoryBadgeStyle(selectedTicket.category)}>
                    {formatCategory(selectedTicket.category)}
                  </span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Created Date
                </span>
                <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Calendar size={13} color="var(--primary)" />
                  <span>{formatDateTime(selectedTicket.createdAt)}</span>
                </p>
              </div>

              <div>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Last Update Date
                </span>
                <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Clock size={13} color="#059669" />
                  <span>{formatDateTime(selectedTicket.updatedAt)}</span>
                </p>
              </div>
            </div>

            {/* Quick Status and Priority controls */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 14,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                padding: '14px 16px',
                borderRadius: 'var(--radius)',
              }}
            >
              <div className="form-group">
                <label className="form-label" style={{ fontSize: 11, fontWeight: 700 }}>
                  Ticket Status
                </label>
                <select
                  className="form-select"
                  value={selectedTicket.status}
                  disabled={statusUpdating}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: 11, fontWeight: 700 }}>
                  Priority Level
                </label>
                <select
                  className="form-select"
                  value={selectedTicket.priority}
                  disabled={priorityUpdating}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Subject & Description */}
            <div>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                {selectedTicket.subject}
              </h4>
              <div
                style={{
                  padding: 14,
                  background: '#f8fafc',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {selectedTicket.description}
              </div>
            </div>

            {/* Related Order / Tracking */}
            {(selectedTicket.orderNumber || selectedTicket.trackingNumber) && (
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {selectedTicket.orderNumber && (
                  <div className="detail-row" style={{ flex: 1, minWidth: 160 }}>
                    <span className="detail-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <FileText size={13} /> Associated Order:
                    </span>
                    <span className="detail-value font-mono">{selectedTicket.orderNumber}</span>
                  </div>
                )}
                {selectedTicket.trackingNumber && (
                  <div className="detail-row" style={{ flex: 1, minWidth: 160 }}>
                    <span className="detail-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Package size={13} /> Associated Tracking:
                    </span>
                    <span className="detail-value font-mono">{selectedTicket.trackingNumber}</span>
                  </div>
                )}
              </div>
            )}

            {/* Conversation History */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
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
                  maxHeight: 300,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                {messagesLoading && messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 20, color: '#64748b', fontSize: 13 }}>
                    Loading conversation messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 12px', color: '#64748b', fontSize: 13 }}>
                    No messages in this thread yet. Send a response below to assist the customer.
                  </div>
                ) : (
                  messages.map((m) => {
                    const isAdmin = m.senderRole === 'ADMIN';
                    return (
                      <div
                        key={m.id}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isAdmin ? 'flex-end' : 'flex-start',
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
                          {isAdmin ? (
                            <>
                              <ShieldCheck size={13} color="#059669" />
                              <span style={{ fontWeight: 700, color: '#047857' }}>
                                PrimeRoute Operations ({m.senderName})
                              </span>
                            </>
                          ) : (
                            <>
                              <User size={12} />
                              <span style={{ fontWeight: 600, color: '#1e40af' }}>
                                Customer ({m.senderName})
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
                            background: isAdmin ? '#0f172a' : '#ffffff',
                            color: isAdmin ? '#ffffff' : '#0f172a',
                            border: isAdmin ? 'none' : '1px solid #cbd5e1',
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

            {/* Admin Reply Box */}
            <form onSubmit={handleSendReply} style={{ marginTop: 4 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: 11, fontWeight: 700 }}>
                  Reply to Customer
                </label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Type official response from PrimeRoute Operations..."
                  value={replyText}
                  disabled={sendingReply}
                  onChange={(e) => setReplyText(e.target.value)}
                  style={{ fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={sendingReply || !replyText.trim()}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Send size={14} />
                  <span>{sendingReply ? 'Sending Reply...' : 'Send Reply'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </Drawer>
    </div>
  );
}
