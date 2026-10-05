import React from 'react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import type { Invoice, InvoiceLineItem } from '../../types/invoice';
import { Download, Printer, Truck, RefreshCw, Package, MapPin, DollarSign, CreditCard, User } from 'lucide-react';
import { useToast } from '../common/Toast';
import { formatPaymentMethod } from '../../utils/paymentUtils';

interface InvoiceModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkPaid?: (invoiceId: string) => void;
  onDownload?: (invoice: Invoice) => void;
  isDownloading?: boolean;
}

export default function InvoiceModal({
  invoice,
  isOpen,
  onClose,
  onMarkPaid,
  onDownload,
  isDownloading = false,
}: InvoiceModalProps) {
  const { showToast } = useToast();

  if (!invoice) return null;

  const invNumber = invoice.invoiceNumber || invoice.id;
  const orderRef = invoice.orderNumber || (invoice.orderId ? `PR-ORD-${invoice.orderId}` : 'Direct Billing');
  const issueDt = invoice.invoiceDate ? invoice.invoiceDate.slice(0, 10) : invoice.issueDate;
  const dueDt = invoice.dueDate ? invoice.dueDate.slice(0, 10) : '—';
  const subtotalVal = invoice.subtotal || 0;
  const shippingVal = invoice.shippingCharge || 0;
  const discountVal = invoice.discountAmount || invoice.discount || 0;
  const taxVal = invoice.taxAmount != null ? invoice.taxAmount : (invoice.tax || 0);
  const totalVal = invoice.totalAmount != null ? invoice.totalAmount : (invoice.total || (subtotalVal + shippingVal - discountVal + taxVal));
  const paidVal = invoice.amountPaid != null ? invoice.amountPaid : (invoice.paymentStatus === 'PAID' ? totalVal : 0);
  const balanceDueVal = invoice.balanceDue != null ? invoice.balanceDue : Math.max(0, totalVal - paidVal);

  const handleDownloadClick = () => {
    if (onDownload) {
      onDownload(invoice);
    } else {
      showToast('success', 'Invoice Downloaded', `Invoice ${invNumber} downloaded successfully.`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (val?: number | null) => {
    return '₹' + Math.round(val || 0).toLocaleString('en-IN');
  };

  // Derive line items from authoritative items collection or lineItems
  const rawItems = (invoice.items && invoice.items.length > 0)
    ? invoice.items
    : (invoice.lineItems && invoice.lineItems.length > 0 ? invoice.lineItems : []);

  const lineItems: InvoiceLineItem[] = rawItems.length > 0
    ? rawItems.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        sku: item.sku,
        description: item.productName || item.description || item.name || item.sku || 'Consignment Item',
        category: item.category,
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice != null ? item.unitPrice : 0,
        unitWeight: item.unitWeight,
        totalWeight: item.totalWeight,
        total: item.total != null ? item.total : (item.quantity || 1) * (item.unitPrice || 0),
      }))
    : [
        {
          description: invoice.packageDescription
            ? `${invoice.packageDescription}`
            : 'Consignment Freight Logistics Services',
          quantity: invoice.packageQuantity || 1,
          unitPrice: subtotalVal,
          total: subtotalVal,
        },
      ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Tax Invoice — ${invNumber}`}
      size="lg"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-outline btn-sm" onClick={handlePrint}>
              <Printer size={14} /> Print
            </button>

            {isDownloading ? (
              <button className="btn btn-primary btn-sm" disabled style={{ opacity: 0.8, cursor: 'wait' }}>
                <RefreshCw size={14} className="animate-spin" /> Downloading...
              </button>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={handleDownloadClick}>
                <Download size={14} /> Download PDF
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {invoice.paymentStatus !== 'PAID' && invoice.invoiceStatus !== 'CANCELLED' && onMarkPaid && (
              <button
                className="btn btn-success btn-sm"
                onClick={() => {
                  onMarkPaid(invoice.id);
                  showToast('success', 'Payment Updated', `Invoice ${invNumber} marked as PAID.`);
                  onClose();
                }}
              >
                Mark as Paid
              </button>
            )}
            <button className="btn btn-outline btn-sm" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      }
    >
      <div className="invoice-preview" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* 1. Invoice Header */}
        <div className="invoice-preview-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Truck size={18} color="#fff" />
              </div>
              <span className="invoice-company-name" style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
                PrimeRoute Logistics
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Enterprise Supply Chain & Freight Operations</p>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>
              Plot 42, Tech Logistics Park, Whitefield, Bengaluru, Karnataka 560066<br />
              GSTIN: 29AAAAA0000A1Z5 • support@primeroute.com
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p className="invoice-number" style={{ fontSize: 16, fontWeight: 800, color: '#2563eb', margin: 0, fontFamily: 'monospace' }}>
              {invNumber}
            </p>
            <div style={{ marginTop: 6 }}>
              <StatusBadge status={invoice.paymentStatus || invoice.invoiceStatus || invoice.status || 'ISSUED'} />
            </div>
            <div style={{ marginTop: 10, fontSize: 12, lineHeight: 1.5 }}>
              <p style={{ margin: 0 }}><span className="invoice-label" style={{ color: 'var(--text-muted)' }}>Issue Date:</span> <strong>{issueDt}</strong></p>
              <p style={{ margin: 0 }}><span className="invoice-label" style={{ color: 'var(--text-muted)' }}>Due Date:</span> <strong>{dueDt}</strong></p>
              <p style={{ margin: 0 }}><span className="invoice-label" style={{ color: 'var(--text-muted)' }}>Order Ref:</span> <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{orderRef}</span></p>
            </div>
          </div>
        </div>

        {/* 2. Billed To & Payment Information */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Billed To */}
          <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 8, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <User size={14} style={{ color: 'var(--primary)' }} />
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0, letterSpacing: '0.04em' }}>
                BILLED TO
              </p>
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px' }}>
              {invoice.customerName || invoice.customer || 'Commercial Shipper'}
            </p>
            {invoice.companyName && (
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 2px' }}>
                {invoice.companyName} {invoice.gstin ? `(GSTIN: ${invoice.gstin})` : ''}
              </p>
            )}
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 2px' }}>{invoice.customerEmail || 'billing@primeroute.com'}</p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 2px' }}>{invoice.customerPhone || 'N/A'}</p>
            {invoice.customerId && (
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '4px 0 0' }}>
                Customer ID: <strong style={{ fontFamily: 'monospace' }}>{invoice.customerId}</strong>
              </p>
            )}
          </div>

          {/* Payment Information */}
          <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 8, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <CreditCard size={14} style={{ color: 'var(--primary)' }} />
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0, letterSpacing: '0.04em' }}>
                PAYMENT INFORMATION
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '5px 10px', fontSize: 12, alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{formatPaymentMethod(invoice.paymentMethod)}</strong>

              <span style={{ color: 'var(--text-muted)' }}>Payment Status:</span>
              <div>
                <StatusBadge status={invoice.paymentStatus || invoice.status || 'UNPAID'} />
              </div>

              <span style={{ color: 'var(--text-muted)' }}>Currency:</span>
              <span style={{ fontWeight: 600 }}>{invoice.currency || 'INR (₹)'}</span>

              {invoice.paymentDate && (
                <>
                  <span style={{ color: 'var(--text-muted)' }}>Payment Date:</span>
                  <span style={{ fontWeight: 500 }}>{invoice.paymentDate}</span>
                </>
              )}

              {invoice.transactionId && (
                <>
                  <span style={{ color: 'var(--text-muted)' }}>Transaction ID:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>{invoice.transactionId}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 3. Consignment & Order Details */}
        {(invoice.orderId || invoice.orderNumber || invoice.packageDescription || invoice.pickupAddress || invoice.deliveryAddress || invoice.trackingNumber) && (
          <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 8, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Package size={14} style={{ color: 'var(--primary)' }} />
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0, letterSpacing: '0.04em' }}>
                CONSIGNMENT & ORDER DETAILS
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, fontSize: 12 }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: 11, display: 'block' }}>Order Reference</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-primary)' }}>{orderRef}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: 11, display: 'block' }}>Delivery Service</span>
                <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{(invoice.deliveryType || 'Standard').replace(/_/g, ' ')}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: 11, display: 'block' }}>Cargo Description</span>
                <span style={{ fontWeight: 600 }}>
                  {invoice.packageDescription || 'Commercial Cargo'}
                  {invoice.packageWeight ? ` (${invoice.packageWeight} kg)` : ''}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: 11, display: 'block' }}>Shipment Tracking</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>
                  {invoice.trackingNumber || 'Assigned upon dispatch'}
                </span>
              </div>
            </div>

            {(invoice.pickupAddress || invoice.deliveryAddress) && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed var(--border)', fontSize: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={12} style={{ color: '#16a34a' }} /> Pickup Location
                  </span>
                  <p style={{ margin: '2px 0 0', color: 'var(--text-secondary)' }}>{invoice.pickupAddress || 'Direct Warehouse'}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={12} style={{ color: '#dc2626' }} /> Delivery Destination
                  </span>
                  <p style={{ margin: '2px 0 0', color: 'var(--text-secondary)' }}>{invoice.deliveryAddress || 'Client Facility'}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. Item Details (Line Items Table) */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <DollarSign size={14} style={{ color: 'var(--primary)' }} />
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0, letterSpacing: '0.04em' }}>
              ITEM DETAILS
            </p>
          </div>
          <table className="invoice-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Item Description</th>
                <th style={{ textAlign: 'center', width: 70 }}>Qty</th>
                <th style={{ textAlign: 'right', width: 140 }}>Unit Price</th>
                <th style={{ textAlign: 'right', width: 140 }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.description}</div>
                    {(item.sku || item.unitWeight) && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {item.sku ? `SKU: ${item.sku}` : ''}
                        {item.sku && item.unitWeight ? ' • ' : ''}
                        {item.unitWeight ? `Unit Weight: ${item.unitWeight} kg` : ''}
                        {item.totalWeight ? ` (Total: ${item.totalWeight} kg)` : ''}
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(item.unitPrice)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="invoice-total-label" style={{ padding: '8px 12px' }}>Subtotal:</td>
                <td style={{ textAlign: 'right', padding: '8px 12px', fontWeight: 600 }}>{formatCurrency(subtotalVal)}</td>
              </tr>
              {shippingVal > 0 && (
                <tr>
                  <td colSpan={3} className="invoice-total-label" style={{ padding: '4px 12px' }}>Shipping / Handling:</td>
                  <td style={{ textAlign: 'right', padding: '4px 12px', fontWeight: 600 }}>{formatCurrency(shippingVal)}</td>
                </tr>
              )}
              {discountVal > 0 && (
                <tr style={{ color: '#16a34a' }}>
                  <td colSpan={3} className="invoice-total-label" style={{ padding: '4px 12px' }}>Discount:</td>
                  <td style={{ textAlign: 'right', padding: '4px 12px', fontWeight: 600 }}>-{formatCurrency(discountVal)}</td>
                </tr>
              )}
              <tr>
                <td colSpan={3} className="invoice-total-label" style={{ padding: '4px 12px' }}>GST ({invoice.taxRate || 18}%):</td>
                <td style={{ textAlign: 'right', padding: '4px 12px', fontWeight: 600 }}>{formatCurrency(taxVal)}</td>
              </tr>
              <tr className="invoice-total-row" style={{ borderTop: '2px solid var(--border)', background: '#f8fafc' }}>
                <td colSpan={3} className="invoice-total-label" style={{ padding: '10px 12px', fontSize: 14, fontWeight: 800 }}>Grand Total:</td>
                <td style={{ textAlign: 'right', color: 'var(--primary)', padding: '10px 12px', fontSize: 15, fontWeight: 800 }}>
                  {formatCurrency(totalVal)}
                </td>
              </tr>
              <tr>
                <td colSpan={3} className="invoice-total-label" style={{ padding: '6px 12px', color: '#16a34a' }}>Amount Paid:</td>
                <td style={{ textAlign: 'right', padding: '6px 12px', color: '#16a34a', fontWeight: 700 }}>
                  {formatCurrency(paidVal)}
                </td>
              </tr>
              <tr style={{ borderTop: '1px dashed var(--border)' }}>
                <td colSpan={3} className="invoice-total-label" style={{ padding: '8px 12px', fontWeight: 700 }}>Remaining Balance Due:</td>
                <td style={{ textAlign: 'right', padding: '8px 12px', fontWeight: 800, color: balanceDueVal > 0 ? '#dc2626' : '#16a34a' }}>
                  {formatCurrency(balanceDueVal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* 5. Notes */}
        {invoice.notes && (
          <div style={{ padding: '10px 14px', background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }}>
            <span style={{ fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Notes:</span>
            <span style={{ color: 'var(--text-secondary)' }}>{invoice.notes}</span>
          </div>
        )}

        <div style={{ padding: 10, background: 'var(--page-bg, #f8fafc)', borderRadius: 'var(--radius, 6px)', fontSize: 11, color: 'var(--text-muted)' }}>
          <p style={{ margin: 0 }}><strong>Note:</strong> This is an authoritative electronic tax invoice generated by PrimeRoute Logistics. For billing queries or reconciliation, contact support@primeroute.com.</p>
        </div>
      </div>
    </Modal>
  );
}

