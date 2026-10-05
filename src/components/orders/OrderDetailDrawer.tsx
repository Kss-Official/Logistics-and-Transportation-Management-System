import React, { useState, useEffect } from 'react';
import Drawer from '../common/Drawer';
import StatusBadge from '../common/StatusBadge';
import type { OrderStatus, DeliveryType } from '../../types/order';
import {
  Package,
  MapPin,
  Calendar,
  Scale,
  Box,
  Truck,
  Receipt,
  User,
  CheckCircle2,
  AlertCircle,
  Building2,
  FileText,
  CreditCard,
} from 'lucide-react';
import { formatPaymentMethod } from '../../utils/paymentUtils';

interface OrderDetailDrawerProps {
  order: any | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (orderId: number | string, newStatus: OrderStatus) => Promise<void> | void;
  isAdmin?: boolean;
}

const AVAILABLE_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PICKED_UP', label: 'Picked Up' },
  { value: 'IN_TRANSIT', label: 'In Transit' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function OrderDetailDrawer({
  order,
  isOpen,
  onClose,
  onStatusChange,
  isAdmin = false,
}: OrderDetailDrawerProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('PENDING');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (order?.status) {
      setSelectedStatus(order.status);
      setStatusMessage(null);
    }
  }, [order]);

  if (!order) return null;

  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : (order.date || '—');

  const customerName = order.customerName || order.customer;
  const customerEmail = order.customerEmail;
  const customerPhone = order.customerPhone;

  const handleSaveStatus = async () => {
    if (!onStatusChange) return;
    try {
      setIsUpdatingStatus(true);
      setStatusMessage(null);
      await onStatusChange(order.id, selectedStatus);
      setStatusMessage({ type: 'success', text: `Status successfully updated to ${selectedStatus}` });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to update order status. Please try again.',
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Order Details — ${order.orderNumber || order.id}`}
      subtitle={`Created on ${formattedDate}`}
      size="lg"
      footer={
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <button className="btn btn-dark btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      }
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {/* Order Status & Key Identifiers Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            background: 'var(--page-bg)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <span
              style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              Order Number
            </span>
            <div
              style={{
                marginTop: 2,
                fontFamily: 'monospace',
                fontWeight: 600,
                fontSize: 14,
                color: 'var(--primary)',
              }}
            >
              {order.orderNumber}
            </div>
          </div>

          <div>
            <span
              style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              Current Status
            </span>
            <div style={{ marginTop: 2 }}>
              <StatusBadge status={order.status} />
            </div>
          </div>

          <div>
            <span
              style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              Delivery Type
            </span>
            <div style={{ marginTop: 2 }}>
              <StatusBadge
                status={order.deliveryType || 'STANDARD'}
                showDot={false}
              />
            </div>
          </div>
        </div>

        {/* Customer Information (if present) */}
        {(customerName || customerEmail) && (
          <div>
            <h4 className="section-title">
              <User size={16} color="var(--primary)" />
              Customer Details
            </h4>
            <div className="info-grid">
              <div className="info-item">
                <p className="info-item-label">Customer Name</p>
                <p className="info-item-value" style={{ fontWeight: 600 }}>
                  {customerName || '—'}
                </p>
              </div>
              <div className="info-item">
                <p className="info-item-label">Email Address</p>
                <p className="info-item-value font-mono text-xs">
                  {customerEmail || '—'}
                </p>
              </div>
              {customerPhone && (
                <div className="info-item">
                  <p className="info-item-label">Phone Contact</p>
                  <p className="info-item-value">{customerPhone}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Order Information */}
        <div>
          <h4 className="section-title">
            <Calendar size={16} color="var(--primary)" />
            Order Information
          </h4>

          <div className="info-grid">
            <div className="info-item">
              <p className="info-item-label">Order ID (DB Key)</p>
              <p className="info-item-value font-mono">{order.id}</p>
            </div>

            <div className="info-item">
              <p className="info-item-label">Created Date</p>
              <p className="info-item-value">{formattedDate}</p>
            </div>

            <div className="info-item">
              <p className="info-item-label">Last Updated</p>
              <p className="info-item-value">
                {order.updatedAt ? new Date(order.updatedAt).toLocaleString('en-IN') : '—'}
              </p>
            </div>

            <div className="info-item">
              <p className="info-item-label">Service Level</p>
              <p className="info-item-value">
                {(order.deliveryType || 'STANDARD').replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>

        <div className="section-divider" />

        {/* Route Details */}
        <div>
          <h4 className="section-title">
            <MapPin size={16} color="var(--primary)" />
            Route & Addresses
          </h4>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
            }}
          >
            {/* Pickup */}
            <div
              style={{
                background: 'var(--page-bg)',
                padding: 12,
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}
              >
                Pickup Address
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                  margin: '4px 0',
                  lineHeight: 1.45,
                }}
              >
                {order.pickupAddress || '—'}
              </p>
            </div>

            {/* Delivery */}
            <div
              style={{
                background: 'var(--page-bg)',
                padding: 12,
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}
              >
                Delivery Destination
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                  margin: '4px 0',
                  lineHeight: 1.45,
                }}
              >
                {order.deliveryAddress || '—'}
              </p>
            </div>
          </div>
        </div>

        <div className="section-divider" />

        {/* Package Information */}
        <div>
          <h4 className="section-title">
            <Package size={16} color="var(--primary)" />
            Consignment Specs
          </h4>

          <div className="info-grid">
            <div className="info-item">
              <p className="info-item-label">Description</p>
              <p className="info-item-value">{order.packageDescription || 'General Cargo'}</p>
            </div>

            <div className="info-item">
              <p className="info-item-label">Weight</p>
              <p className="info-item-value">
                <Scale
                  size={14}
                  style={{
                    display: 'inline',
                    marginRight: 5,
                    verticalAlign: 'middle',
                  }}
                />
                {order.packageWeight} kg
              </p>
            </div>

            <div className="info-item">
              <p className="info-item-label">Quantity</p>
              <p className="info-item-value">
                <Box
                  size={14}
                  style={{
                    display: 'inline',
                    marginRight: 5,
                    verticalAlign: 'middle',
                  }}
                />
                {order.packageQuantity} unit(s)
              </p>
            </div>

            <div className="info-item">
              <p className="info-item-label">Transit Tier</p>
              <p className="info-item-value">
                <Truck
                  size={14}
                  style={{
                    display: 'inline',
                    marginRight: 5,
                    verticalAlign: 'middle',
                  }}
                />
                {(order.deliveryType || 'STANDARD').replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>

        {/* Itemized Consignment Manifest (Multi-product order items) */}
        {order.items && order.items.length > 0 && (
          <div>
            <h4 className="section-title">
              <Box size={16} color="var(--primary)" />
              Itemized Manifest ({order.items.length} {order.items.length === 1 ? 'Product' : 'Products'})
            </h4>

            <div style={{ background: '#ffffff', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <table style={{ width: '100%', fontSize: 12.5, borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px 12px' }}>Product</th>
                    <th style={{ textAlign: 'center', padding: '8px 12px' }}>SKU</th>
                    <th style={{ textAlign: 'center', padding: '8px 12px' }}>Quantity</th>
                    <th style={{ textAlign: 'right', padding: '8px 12px' }}>Unit Weight</th>
                    <th style={{ textAlign: 'right', padding: '8px 12px' }}>Line Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item: any, idx: number) => (
                    <tr key={item.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 12px' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>
                          {item.productName || item.product?.name || `Product #${item.productId}`}
                        </strong>
                        {item.category && (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>
                            {item.category}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', fontFamily: 'monospace', fontSize: 11, color: 'var(--text-secondary)' }}>
                        <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>
                          {item.sku || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: 'var(--primary)' }}>
                        {item.quantity} units
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                        {item.unitWeight != null ? `${item.unitWeight} kg` : '—'}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {item.totalWeight != null
                          ? `${item.totalWeight} kg`
                          : item.unitWeight != null
                          ? `${(item.unitWeight * item.quantity).toFixed(2)} kg`
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Fulfillment Hub & Warehouse Assignment */}
        <div className="section-divider" />
        <div>
          <h4 className="section-title">
            <Building2 size={16} color="var(--primary)" />
            Fulfillment & Operations Hub
          </h4>
          <div className="info-grid">
            <div className="info-item">
              <p className="info-item-label">Assigned Hub</p>
              <p className="info-item-value" style={{ fontWeight: 600 }}>
                {order.warehouseName || (order.pickupCity ? `${order.pickupCity} Logistics Hub` : 'Central Logistics Hub')}
              </p>
            </div>
            <div className="info-item">
              <p className="info-item-label">Origin Location</p>
              <p className="info-item-value">
                {order.pickupCity ? `${order.pickupCity}${order.pickupState ? `, ${order.pickupState}` : ''}` : 'Regional Network'}
              </p>
            </div>
            <div className="info-item">
              <p className="info-item-label">Destination Node</p>
              <p className="info-item-value">
                {order.deliveryCity ? `${order.deliveryCity}${order.deliveryState ? `, ${order.deliveryState}` : ''}` : 'Direct Consignee'}
              </p>
            </div>
            <div className="info-item">
              <p className="info-item-label">Fulfillment Status</p>
              <p className="info-item-value">
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 12,
                    fontWeight: 600,
                    color: order.status === 'DELIVERED' ? '#16a34a' : order.status === 'CANCELLED' ? '#dc2626' : '#2563eb',
                  }}
                >
                  <CheckCircle2 size={13} />
                  {order.status === 'PENDING' ? 'Awaiting Dispatch' : order.status === 'CONFIRMED' ? 'Allocated' : order.status.replace('_', ' ')}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Commercial Breakdown (only if available from real backend) */}
        {order.totalAmount != null && (
          <>
            <div className="section-divider" />
            <div>
              <h4 className="section-title">
                <Receipt size={16} color="var(--primary)" />
                Commercial Breakdown & Invoicing
              </h4>
              <div
                style={{
                  background: 'var(--page-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
                  <span>Base Freight Fee:</span>
                  <span>₹{Number(order.baseFee || 250).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
                  <span>Consignment Weight Charge:</span>
                  <span>₹{Number(order.weightCharge || 0).toFixed(2)}</span>
                </div>
                {order.prioritySurcharge ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span>Priority Surcharge:</span>
                    <span>₹{Number(order.prioritySurcharge).toFixed(2)}</span>
                  </div>
                ) : null}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
                  <span>Subtotal:</span>
                  <span>₹{Number(order.subtotal || 0).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
                  <span>Applicable GST (18%):</span>
                  <span>₹{Number(order.taxAmount || 0).toFixed(2)}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 15,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    borderTop: '1px dashed var(--border)',
                    paddingTop: '8px',
                    marginTop: '4px',
                  }}
                >
                  <span>Total Payable:</span>
                  <span style={{ color: 'var(--primary)' }}>₹{Number(order.totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Authoritative Tax Invoice Information */}
              <div
                style={{
                  marginTop: 12,
                  background: 'var(--card-bg, #ffffff)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FileText size={15} color="var(--primary)" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                      Commercial Tax Invoice
                    </span>
                  </div>
                  {order.invoiceStatus ? (
                    <StatusBadge status={order.invoiceStatus} />
                  ) : order.paymentStatus ? (
                    <StatusBadge status={order.paymentStatus} />
                  ) : (
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Invoice unavailable</span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12, color: 'var(--text-secondary)' }}>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Invoice Number</span>
                    <strong style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                      {order.invoiceNumber || (order.id ? `INV-PR-2026-${String(order.id).padStart(6, '0')}` : 'Invoice unavailable')}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Invoice Amount</span>
                    <strong style={{ color: 'var(--text-primary)' }}>
                      ₹{Number(order.invoiceTotalAmount || order.totalAmount || 0).toFixed(2)}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Payment Method</span>
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {formatPaymentMethod(order.paymentMethod)}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Payment Status</span>
                    <div style={{ marginTop: 2 }}>
                      <StatusBadge status={order.paymentStatus || 'UNPAID'} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Drawer>
  );
}