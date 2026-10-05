import React, { useEffect, useState, useCallback } from 'react';
import {
  HelpCircle,
  PhoneCall,
  AlertTriangle,
  Send,
  CheckCircle2,
  Clock,
  ShieldAlert,
  MessageSquare,
  Wrench,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { driverPortalService } from '../../services/driverPortalService';
import type { DriverSupportTicket, DriverSupportContact } from '../../types/driverPortal';

function formatTicketDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export default function DriverSupport() {
  const [tickets, setTickets] = useState<DriverSupportTicket[]>([]);
  const [supportContact, setSupportContact] = useState<DriverSupportContact | null>(null);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<string>('DELIVERY_DELAY');
  const [priority, setPriority] = useState<string>('HIGH');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchSupportData = useCallback(async (isManual = false) => {
    if (isManual) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setErrorMsg(null);
    try {
      const [ticketsList, contact] = await Promise.all([
        driverPortalService.getTickets(),
        driverPortalService.getSupportContact(),
      ]);
      setTickets(ticketsList);
      setSupportContact(contact);
    } catch (err) {
      console.error('Failed to load support data:', err);
      setErrorMsg('Unable to retrieve support tickets from server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSupportData(false);
  }, [fetchSupportData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const newTicket = await driverPortalService.createTicket({
        category,
        priority,
        subject: subject.trim(),
        description: description.trim(),
      });
      setTickets((prev) => [newTicket, ...prev]);
      setSuccessMsg(`Support ticket ${newTicket.ticketNumber || newTicket.ticketCode || '#' + newTicket.id} logged and dispatched to Fleet Operations.`);
      setSubject('');
      setDescription('');
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      console.error('Failed to create support ticket:', err);
      setErrorMsg('Failed to transmit support ticket. Please check connection or call dispatch.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'RESOLVED' || s === 'CLOSED') {
      return (
        <span className="driver-badge driver-badge-green">
          <CheckCircle2 size={12} /> Resolved
        </span>
      );
    }
    if (s === 'IN_PROGRESS') {
      return (
        <span className="driver-badge driver-badge-blue">
          <Clock size={12} /> In Progress
        </span>
      );
    }
    return <span className="driver-badge driver-badge-amber">Open Dispatch</span>;
  };

  const dispatchPhone = supportContact?.supportPhone || '+91 80 4567 8900';
  const cleanPhone = dispatchPhone.replace(/[^+\d]/g, '');

  return (
    <div className="driver-page-container">
      {/* ── 24/7 Emergency SOS Hotline Banner ── */}
      <div
        className="driver-card"
        style={{
          borderLeft: '5px solid #dc2626',
          backgroundColor: '#fff5f5',
          borderTopColor: '#fecaca',
          borderRightColor: '#fecaca',
          borderBottomColor: '#fecaca',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ShieldAlert size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#991b1b' }}>
                Emergency Fleet Assistance & 24/7 Dispatch Control
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: 13, color: '#b91c1c' }}>
                Accident, major vehicle breakdown, or road hazard emergency hotline: <strong>{dispatchPhone}</strong> ({supportContact?.supportHours || '24/7'})
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <a
              href={`tel:${cleanPhone}`}
              id="call-dispatch-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: '#dc2626',
                color: '#ffffff',
                padding: '10px 18px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <PhoneCall size={16} /> Call Dispatch Tower
            </a>
          </div>
        </div>
      </div>

      {/* ── Two Columns: Submit Incident & Recent Tickets ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Submit Ticket Form */}
        <div className="driver-card">
          <h3 className="driver-card-title">
            <MessageSquare size={18} style={{ color: '#2563eb' }} />
            Report Operational Delay or Roadside Incident
          </h3>

          {successMsg && (
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: '#dcfce7',
                border: '1px solid #86efac',
                borderRadius: 8,
                color: '#15803d',
                fontSize: 12.5,
                fontWeight: 700,
                marginTop: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: '#fee2e2',
                border: '1px solid #fca5a5',
                borderRadius: 8,
                color: '#b91c1c',
                fontSize: 12.5,
                fontWeight: 700,
                marginTop: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                Incident Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                id="ticket-category-select"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  fontSize: 13,
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="DELIVERY_DELAY">Delivery Delay / Gate Congestion</option>
                <option value="VEHICLE_BREAKDOWN">Vehicle Mechanical Breakdown</option>
                <option value="CARGO_ISSUE">Cargo Discrepancy / Damaged Goods</option>
                <option value="ROUTE_ASSISTANCE">Route Road Closure / Navigation</option>
                <option value="GENERAL">General Operational Support</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                id="ticket-priority-select"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  fontSize: 13,
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="CRITICAL">Critical (Immediate Roadside Stop)</option>
                <option value="HIGH">High (Delay Impending &gt; 30 mins)</option>
                <option value="MEDIUM">Medium (Minor Delay / Query)</option>
                <option value="LOW">Low (Information Only)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                Summary / Subject *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                id="ticket-subject-input"
                placeholder="e.g. Gate 3 at Whitefield Park closed for paving..."
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  fontSize: 13,
                  boxSizing: 'border-box',
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                Detailed Incident Description *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                id="ticket-description-input"
                placeholder="Explain the situation, current exact location, and required assistance..."
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  fontSize: 13,
                  boxSizing: 'border-box',
                }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              id="submit-ticket-btn"
              className="driver-btn-primary"
              style={{ marginTop: 4 }}
            >
              {submitting ? 'Transmitting to Dispatch...' : 'Dispatch Ticket to Fleet Control'}
              <Send size={15} />
            </button>
          </form>
        </div>

        {/* Support Tickets Log */}
        <div className="driver-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="driver-card-title" style={{ margin: 0 }}>
              <Clock size={18} style={{ color: '#2563eb' }} />
              My Operational Support Tickets ({tickets.length})
            </h3>
            <button
              onClick={() => fetchSupportData(true)}
              disabled={refreshing}
              className="driver-btn-secondary"
              id="refresh-tickets-btn"
              title="Refresh tickets list"
              style={{ padding: '6px 10px', fontSize: 12 }}
            >
              <RefreshCw size={14} className={refreshing ? 'driver-spin' : ''} />
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 36, color: '#2563eb', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 14 }}>
              <span style={{ width: 16, height: 16, border: '2px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
              <span>Loading tickets...</span>
            </div>
          ) : tickets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b', marginTop: 14 }}>
              <HelpCircle size={36} style={{ color: '#94a3b8', margin: '0 auto 8px', opacity: 0.5 }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>No active support tickets</div>
              <p style={{ margin: '4px 0 0', fontSize: 12.5, color: '#64748b' }}>
                Incident reports and control tower queries will appear here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
              {tickets.map((t) => (
                <div
                  key={t.id}
                  style={{
                    padding: 14,
                    borderRadius: 10,
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb' }}>
                      {t.ticketNumber || t.ticketCode || `Ticket #${t.id}`}
                    </span>
                    {getStatusBadge(t.status)}
                  </div>

                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', margin: '6px 0 2px' }}>
                    {t.subject}
                  </div>

                  <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>
                    {t.description}
                  </div>

                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
                    <span>Created: {formatTicketDate(t.createdAt)}</span>
                    <span>Priority: <strong>{t.priority}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
