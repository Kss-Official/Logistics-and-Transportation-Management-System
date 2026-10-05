import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Eye,
  Download,
  RefreshCw,
  Truck,
  X,
  AlertTriangle,
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import InvoiceModal from '../../components/invoices/InvoiceModal';
import Pagination from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/States';
import { useToast } from '../../components/common/Toast';
import {
  invoiceService,
  downloadInvoice,
  triggerBlobDownload,
} from '../../services/invoiceService';
import type {
  Invoice,
} from '../../types/invoice';

export default function AdminInvoices() {
  const { showToast } = useToast();

  // Primary Data States
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // UI & Loading States
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search States
  const [search, setSearch] = useState<string>('');
  const [tabFilter, setTabFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('ALL');

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(8);

  // View Invoice Modal State (Identical to Customer Portal)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);

  // PDF Downloading State
  const [downloadingId, setDownloadingId] = useState<string | number | null>(null);

  // ─────────────────────────────────────────────────────────────
  // Initial Data Fetching
  // ─────────────────────────────────────────────────────────────
  const fetchData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);
      setError(null);

      const invoicesData = await invoiceService.getAll();
      setInvoices(invoicesData || []);
    } catch (err: any) {
      console.error('Failed to load invoices:', err);
      setError(err?.message || 'Unable to load invoice data. Please try again.');
      showToast('error', 'Error Loading Invoices', 'Could not sync invoice records from the server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─────────────────────────────────────────────────────────────
  // Segmented Counts & Filter Logic
  // ─────────────────────────────────────────────────────────────
  const tabCounts = useMemo(() => {
    const counts = {
      ALL: invoices.length,
      PAID: 0,
      UNPAID: 0,
      OVERDUE: 0,
      ISSUED: 0,
      CANCELLED: 0,
    };

    invoices.forEach((i) => {
      if (i.invoiceStatus === 'PAID') counts.PAID++;
      if (i.paymentStatus === 'UNPAID' || i.paymentStatus === 'PARTIALLY_PAID') counts.UNPAID++;
      if (i.invoiceStatus === 'OVERDUE') counts.OVERDUE++;
      if (i.invoiceStatus === 'ISSUED' || i.invoiceStatus === 'SENT' || i.invoiceStatus === 'DRAFT') counts.ISSUED++;
      if (i.invoiceStatus === 'CANCELLED') counts.CANCELLED++;
    });

    return counts;
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return invoices.filter((inv) => {
      // Tab Status Filter
      if (tabFilter === 'PAID' && inv.invoiceStatus !== 'PAID') return false;
      if (tabFilter === 'UNPAID' && inv.paymentStatus !== 'UNPAID' && inv.paymentStatus !== 'PARTIALLY_PAID') return false;
      if (tabFilter === 'OVERDUE' && inv.invoiceStatus !== 'OVERDUE') return false;
      if (tabFilter === 'ISSUED' && inv.invoiceStatus !== 'ISSUED' && inv.invoiceStatus !== 'SENT' && inv.invoiceStatus !== 'DRAFT') return false;
      if (tabFilter === 'CANCELLED' && inv.invoiceStatus !== 'CANCELLED') return false;

      // Payment Status Filter
      if (paymentFilter !== 'ALL' && inv.paymentStatus !== paymentFilter) return false;

      // Date Range Filter
      if (dateRangeFilter !== 'ALL' && inv.invoiceDate) {
        const invD = new Date(inv.invoiceDate);
        invD.setHours(0, 0, 0, 0);

        if (dateRangeFilter === 'TODAY') {
          if (invD.getTime() !== today.getTime()) return false;
        } else if (dateRangeFilter === 'THIS_WEEK') {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          if (invD < weekAgo || invD > today) return false;
        } else if (dateRangeFilter === 'THIS_MONTH') {
          if (invD.getMonth() !== today.getMonth() || invD.getFullYear() !== today.getFullYear()) return false;
        } else if (dateRangeFilter === 'LAST_MONTH') {
          const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          const endLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
          if (invD < lastMonth || invD > endLastMonth) return false;
        }
      }

      // Search Query Filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const num = (inv.invoiceNumber || '').toLowerCase();
        const custName = (inv.customerName || inv.customer || '').toLowerCase();
        const custEmail = (inv.customerEmail || '').toLowerCase();
        const orderNum = (inv.orderNumber || String(inv.orderId || '')).toLowerCase();
        const trkNum = (inv.trackingNumber || '').toLowerCase();

        if (
          !num.includes(q) &&
          !custName.includes(q) &&
          !custEmail.includes(q) &&
          !orderNum.includes(q) &&
          !trkNum.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [invoices, tabFilter, paymentFilter, dateRangeFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / pageSize));
  const safePage = Math.max(1, Math.min(page, totalPages));

  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [page, totalPages]);

  const paginatedInvoices = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredInvoices.slice(start, start + pageSize);
  }, [filteredInvoices, safePage, pageSize]);

  // ─────────────────────────────────────────────────────────────
  // Action Handlers (View, Download)
  // ─────────────────────────────────────────────────────────────
  const handleDownloadPdf = async (inv: Invoice) => {
    if (downloadingId === inv.id) return;
    try {
      setDownloadingId(inv.id);
      const filename = `PrimeRoute-${inv.invoiceNumber || inv.id}.pdf`;
      const blob = await downloadInvoice(inv.id);
      triggerBlobDownload(blob, filename);
      showToast('success', 'Download Complete', `${filename} downloaded successfully.`);
    } catch (err: any) {
      console.error('Download PDF error:', err);
      showToast('error', 'Download Failed', err?.response?.data?.message || 'Could not generate invoice PDF.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleViewDetails = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setIsDetailsOpen(true);
  };

  return (
    <div className="admin-invoices-page">
      {/* ── Executive Page Header ── */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h2 className="page-title" style={{ fontSize: 22, fontWeight: 800 }}>Invoice Management</h2>
          <p className="page-subtitle" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Authoritative commercial billing records, payment reconciliation, and audit telemetry.
          </p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => fetchData(true)}
            disabled={refreshing || loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* ── Executive Search & Filter Toolbar ── */}
      <div className="wh-toolbar-card" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 20 }}>
        {/* Top Status Tabs */}
        <div className="wh-status-tabs" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 14 }}>
          {[
            { key: 'ALL', label: 'All Invoices', count: tabCounts.ALL },
            { key: 'PAID', label: 'Paid', count: tabCounts.PAID },
            { key: 'UNPAID', label: 'Unpaid / Pending', count: tabCounts.UNPAID },
            { key: 'OVERDUE', label: 'Overdue', count: tabCounts.OVERDUE },
            { key: 'ISSUED', label: 'Issued / Draft', count: tabCounts.ISSUED },
            { key: 'CANCELLED', label: 'Cancelled', count: tabCounts.CANCELLED },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`wh-status-tab-btn ${tabFilter === tab.key ? 'active' : ''}`}
              onClick={() => {
                setTabFilter(tab.key);
                setPage(1);
              }}
              style={{
                border: 'none',
                background: tabFilter === tab.key ? 'var(--primary-light, #e0f2fe)' : 'transparent',
                color: tabFilter === tab.key ? 'var(--primary, #0284c7)' : 'var(--text-secondary)',
                fontWeight: tabFilter === tab.key ? 700 : 500,
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.15s ease',
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  background: tabFilter === tab.key ? 'var(--primary, #0284c7)' : 'rgba(0,0,0,0.06)',
                  color: tabFilter === tab.key ? '#ffffff' : 'var(--text-muted)',
                  fontSize: 10,
                  padding: '1px 6px',
                  borderRadius: 10,
                  fontWeight: 700,
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Lower Search & Filters Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 12, alignItems: 'center' }}>
          {/* Search Box */}
          <div className="search-box" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="search-input"
              placeholder="Search Invoice #, Customer, Email, Order #, Tracking #..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{ paddingLeft: 34, width: '100%', height: 38 }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{ position: 'absolute', right: 10, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Payment Status Dropdown */}
          <div>
            <select
              className="filter-select"
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setPage(1);
              }}
              style={{ width: '100%', height: 38 }}
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="UNPAID">Unpaid</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="PAID">Paid</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>

          {/* Date Range Dropdown */}
          <div>
            <select
              className="filter-select"
              value={dateRangeFilter}
              onChange={(e) => {
                setDateRangeFilter(e.target.value);
                setPage(1);
              }}
              style={{ width: '100%', height: 38 }}
            >
              <option value="ALL">All Dates</option>
              <option value="TODAY">Today</option>
              <option value="THIS_WEEK">Past 7 Days</option>
              <option value="THIS_MONTH">This Month</option>
              <option value="LAST_MONTH">Last Month</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {(search || tabFilter !== 'ALL' || paymentFilter !== 'ALL' || dateRangeFilter !== 'ALL') && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                setSearch('');
                setTabFilter('ALL');
                setPaymentFilter('ALL');
                setDateRangeFilter('ALL');
                setPage(1);
              }}
              style={{ height: 38, fontSize: 12 }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Main Invoices Table Card ── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <RefreshCw size={28} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Loading invoices...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <AlertTriangle size={32} style={{ color: 'var(--danger)', margin: '0 auto 10px' }} />
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              Unable to load invoice data
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>{error}</p>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => fetchData()}>
              Try Again
            </button>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <EmptyState
            title={invoices.length === 0 ? 'No invoices registered' : 'No invoices match your current filters'}
            description={
              invoices.length === 0
                ? 'Invoices will appear here automatically as customers place orders.'
                : 'Try adjusting your search criteria or resetting filters.'
            }
            action={
              (search || tabFilter !== 'ALL' || paymentFilter !== 'ALL' || dateRangeFilter !== 'ALL') ? (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    setSearch('');
                    setTabFilter('ALL');
                    setPaymentFilter('ALL');
                    setDateRangeFilter('ALL');
                  }}
                >
                  Clear All Filters
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="table-container" style={{ width: '100%', maxWidth: '100%' }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '22%' }}>Invoice #</th>
                  <th style={{ width: '26%' }}>Customer</th>
                  <th style={{ width: '22%' }}>Order / Shipment</th>
                  <th style={{ width: '14%', textAlign: 'center' }}>Status</th>
                  <th style={{ width: '16%' }}>Due Date</th>
                  <th style={{ textAlign: 'center', width: '16%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedInvoices.map((inv) => {
                  const isOverdue = inv.invoiceStatus === 'OVERDUE';
                  const isCancelled = inv.invoiceStatus === 'CANCELLED';

                  return (
                    <tr
                      key={inv.id}
                      style={{
                        opacity: isCancelled ? 0.65 : 1,
                        background: isOverdue ? '#fffbfb' : undefined,
                      }}
                    >
                      {/* 1. Invoice # */}
                      <td>
                        <div
                          style={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            fontSize: 13,
                            color: '#2563eb',
                            cursor: 'pointer',
                          }}
                          onClick={() => handleViewDetails(inv)}
                          title="View Invoice Details"
                        >
                          {inv.invoiceNumber || `INV-${inv.id}`}
                        </div>
                      </td>

                      {/* 2. Customer */}
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>
                          {inv.customerName || inv.customer || 'Commercial Client'}
                        </div>
                        {inv.customerEmail && (
                          <div style={{ fontSize: 11, color: '#64748b' }}>
                            {inv.customerEmail}
                          </div>
                        )}
                      </td>

                      {/* 3. Order / Shipment Reference */}
                      <td>
                        {inv.orderNumber || inv.orderId ? (
                          <div>
                            <div style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 12, color: '#0f172a' }}>
                              {inv.orderNumber || `ORD-#${inv.orderId}`}
                            </div>
                            {inv.trackingNumber && (
                              <div style={{ fontSize: 11, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                <Truck size={11} style={{ color: '#2563eb' }} />
                                <span>{inv.trackingNumber}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: '#94a3b8' }}>Direct Billing</span>
                        )}
                      </td>

                      {/* 4. Status */}
                      <td style={{ textAlign: 'center' }}>
                        <StatusBadge status={inv.paymentStatus || inv.invoiceStatus || 'ISSUED'} />
                      </td>

                      {/* 5. Due Date */}
                      <td>
                        <div style={{ fontSize: 13, color: isOverdue ? '#dc2626' : '#334155', fontWeight: isOverdue ? 600 : 500 }}>
                          {inv.dueDate
                            ? new Date(inv.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                            : inv.invoiceDate
                            ? new Date(inv.invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                            : '—'}
                        </div>
                      </td>

                      {/* 6. Actions */}
                      <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div className="td-actions" style={{ justifyContent: 'center', gap: 8, flexWrap: 'nowrap' }}>
                          {/* View Button */}
                          <button
                            type="button"
                            className="btn btn-outline btn-xs"
                            title="View Invoice Details"
                            onClick={() => handleViewDetails(inv)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 28, padding: '0 10px', fontSize: 12 }}
                          >
                            <Eye size={13} />
                            <span>View</span>
                          </button>

                          {/* Download PDF Button */}
                          <button
                            type="button"
                            className="btn-icon btn-xs"
                            title="Download PDF Invoice"
                            disabled={downloadingId === inv.id}
                            onClick={() => handleDownloadPdf(inv)}
                            style={{ height: 28, width: 28 }}
                          >
                            <Download size={13} className={downloadingId === inv.id ? 'animate-spin' : ''} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination Footer ── */}
        {!loading && filteredInvoices.length > pageSize && (
          <div style={{ borderTop: '1px solid var(--border)' }}>
            <Pagination
              page={page}
              pageSize={pageSize}
              total={filteredInvoices.length}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* ── Standardized Invoice View Modal (Identical to Customer Portal) ── */}
      <InvoiceModal
        invoice={selectedInvoice}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedInvoice(null);
        }}
        onDownload={handleDownloadPdf}
        isDownloading={downloadingId === selectedInvoice?.id}
      />
    </div>
  );
}
