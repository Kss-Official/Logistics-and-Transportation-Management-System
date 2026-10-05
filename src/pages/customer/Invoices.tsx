import React, { useEffect, useState, useMemo } from 'react';
import {
  Search,
  Eye,
  Download,
  RefreshCw,
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import InvoiceModal from '../../components/invoices/InvoiceModal';
import { EmptyState } from '../../components/common/States';
import { useToast } from '../../components/common/Toast';
import { getCustomerInvoices, downloadCustomerInvoice, triggerBlobDownload } from '../../services/invoiceService';
import { useAuth } from '../../context/AuthContext';
import type { Invoice } from '../../types/invoice';

export default function CustomerInvoices() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [rawInvoices, setRawInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await getCustomerInvoices();
      setRawInvoices(data || []);
    } catch (error) {
      console.error('Failed to load invoices:', error);
      showToast(
        'error',
        'Unable to Load Invoices',
        'Something went wrong while loading your invoices. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle real authenticated backend PDF invoice download for Customer
   */
  const handleDownload = async (inv: Invoice) => {
    if (downloadingId === inv.id) return;
    try {
      setDownloadingId(inv.id);
      const filename = `PrimeRoute-Invoice-${inv.invoiceNumber || inv.id}.pdf`;
      const targetId = inv.invoiceNumber || inv.id || inv.orderNumber || inv.orderId;

      const blob = await downloadCustomerInvoice(targetId);
      triggerBlobDownload(blob, filename);

      showToast(
        'success',
        'Invoice Downloaded',
        'Invoice downloaded successfully.'
      );
    } catch (error) {
      console.error('Invoice download error:', error);
      showToast(
        'error',
        'Invoice Download Failed',
        'Unable to download this invoice. Please try again.'
      );
    } finally {
      setDownloadingId(null);
    }
  };

  // Convert real backend InvoiceDTO objects into Invoice view items dynamically
  const invoicesList: Invoice[] = useMemo(() => {
    return rawInvoices.map((dto: any) => {
      const invNum = dto.invoiceNumber || `INV-${dto.orderNumber || dto.orderId}`;
      const ordNum = dto.orderNumber || String(dto.orderId || '');
      const subtotal = dto.subtotal || 0;
      const tax = dto.taxAmount || 0;
      const total = dto.amount || (subtotal + tax);
      const pStatus = (dto.paymentStatus || dto.status || 'UNPAID').toUpperCase();

      const issueDateStr = dto.issueDate ? String(dto.issueDate).slice(0, 10) : new Date().toISOString().slice(0, 10);
      const dueDateStr = dto.dueDate ? String(dto.dueDate).slice(0, 10) : '';

      return {
        id: invNum,
        invoiceNumber: invNum,
        orderId: ordNum,
        orderNumber: ordNum,
        customerId: user?.id ? `CUST-${user.id}` : 'CUST-VALUED',
        customer: user?.name || dto.recipient || 'Valued Customer',
        customerName: user?.name || dto.recipient || 'Valued Customer',
        customerEmail: user?.email || 'billing@primeroute.com',
        customerPhone: user?.phone || '+91 98765 43210',
        items: dto.items || [],
        packageDescription: dto.packageDescription,
        packageQuantity: dto.packageQuantity,
        packageWeight: dto.packageWeight,
        lineItems: (dto.items && dto.items.length > 0)
          ? dto.items.map((it: any) => ({
              id: it.id,
              productId: it.productId,
              sku: it.sku,
              description: it.productName || it.name || it.sku || 'Consignment Item',
              category: it.category,
              quantity: it.quantity || 1,
              unitPrice: it.unitPrice || 0,
              unitWeight: it.unitWeight,
              totalWeight: it.totalWeight,
              total: it.total != null ? it.total : (it.quantity || 1) * (it.unitPrice || 0),
            }))
          : [
              {
                description: dto.packageDescription || 'Consignment Freight Logistics Services',
                quantity: dto.packageQuantity || 1,
                unitPrice: subtotal,
                total: subtotal,
              },
            ],
        subtotal,
        tax,
        taxRate: 18,
        discount: 0,
        total,
        totalAmount: total,
        status: pStatus,
        invoiceStatus: (pStatus === 'PAID' ? 'PAID' : (dto.status === 'CANCELLED' ? 'CANCELLED' : 'ISSUED')) as any,
        paymentStatus: pStatus as any,
        paymentMethod: dto.paymentMethod,
        transactionId: dto.transactionId,
        paymentDate: dto.paymentDate ? String(dto.paymentDate).slice(0, 10) : (pStatus === 'PAID' ? issueDateStr : undefined),
        amountPaid: dto.amountPaid != null ? dto.amountPaid : (pStatus === 'PAID' ? total : 0),
        balanceDue: dto.balanceDue != null ? dto.balanceDue : (pStatus === 'PAID' ? 0 : total),
        issueDate: issueDateStr,
        invoiceDate: issueDateStr,
        dueDate: dueDateStr,
        deliveryAddress: dto.destination,
      };
    });
  }, [rawInvoices, user]);

  const filteredInvoices = useMemo(() => {
    const searchText = search.toLowerCase().trim();
    return invoicesList.filter((inv) => {
      const matchSearch =
        inv.id.toLowerCase().includes(searchText) ||
        inv.orderId.toLowerCase().includes(searchText);

      const matchStatus =
        statusFilter === 'ALL' ||
        inv.status === statusFilter ||
        (statusFilter === 'UNPAID' && (inv.status === 'UNPAID' || inv.status === 'PENDING'));

      return matchSearch && matchStatus;
    });
  }, [invoicesList, search, statusFilter]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Invoices & Billing
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Review official GST tax invoices, payment statuses, and download signed receipts.
          </p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={loadInvoices}
          disabled={loading}
          style={{ height: 38, gap: 6, fontSize: 13 }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-box">
          <Search size={15} className="search-box-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search Invoice Number, Order ID..."
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
          <option value="PAID">Paid</option>
          <option value="UNPAID">Unpaid / Pending</option>
          <option value="OVERDUE">Overdue</option>
        </select>
      </div>

      {/* Table Wrapper */}
      <div className="table-wrapper">
        {loading ? (
          <div
            style={{
              minHeight: 250,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <RefreshCw size={22} className="animate-spin" />
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Loading invoices...
            </span>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <EmptyState
            title={
              invoicesList.length === 0
                ? 'No invoices yet'
                : 'No invoices found'
            }
            description={
              invoicesList.length === 0
                ? 'Your invoices will appear here once they are generated.'
                : 'No invoices match your current search or status filter.'
            }
          />
        ) : (
          <div className="table-scroll" style={{ overflowX: 'hidden' }}>
            <table className="data-table" style={{ width: '100%', tableLayout: 'fixed' }}>
              <thead>
                <tr>
                  <th style={{ width: '22%' }}>Invoice Number</th>
                  <th style={{ width: '18%' }}>Order Number</th>
                  <th style={{ width: '16%' }}>Amount</th>
                  <th style={{ width: '16%' }}>Payment Status</th>
                  <th style={{ width: '14%' }}>Date</th>
                  <th style={{ width: '14%', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => {
                  return (
                    <tr key={inv.id}>
                      <td className="td-mono" style={{ fontWeight: 600 }}>
                        {inv.id}
                      </td>
                      <td className="td-mono">{inv.orderId}</td>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        ₹{inv.total.toLocaleString('en-IN')}
                      </td>
                      <td>
                        <StatusBadge status={inv.status} />
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        {formatDate(inv.issueDate)}
                      </td>
                      <td>
                        <div className="td-actions" style={{ justifyContent: 'center', gap: 6 }}>
                          <button
                            className="btn btn-outline btn-xs"
                            onClick={() => setSelectedInvoice(inv)}
                            style={{ gap: 4, height: 26, padding: '0 8px', fontSize: 11 }}
                            title="View Invoice Details"
                          >
                            <Eye size={12} />
                            <span>View</span>
                          </button>

                          <button
                            className="btn-icon"
                            title="Download PDF"
                            disabled={downloadingId === inv.id}
                            style={{ width: 26, height: 26 }}
                            onClick={() => handleDownload(inv)}
                          >
                            {downloadingId === inv.id ? (
                              <RefreshCw size={12} className="animate-spin" />
                            ) : (
                              <Download size={13} />
                            )}
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
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        invoice={selectedInvoice}
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onDownload={handleDownload}
        isDownloading={downloadingId === selectedInvoice?.id}
      />
    </div>
  );
}


