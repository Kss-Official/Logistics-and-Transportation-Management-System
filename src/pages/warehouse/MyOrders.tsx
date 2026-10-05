import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, RefreshCw, Eye,
  MapPin, Box, ArrowRight,
  Package, Truck, User, Calendar, AlertCircle,
  Building2, ArrowUpRight, X, Phone, Mail, ShoppingCart, Clock
} from 'lucide-react';
import { warehousePortalService } from '../../services/warehousePortalService';
import type { WarehouseOrderItem } from '../../types/warehousePortal';
import { useAuth } from '../../context/AuthContext';

// Helper to format float weights cleanly
const formatWeight = (weight?: number | null): string => {
  if (weight == null || isNaN(weight)) return '—';
  const rounded = parseFloat(Number(weight).toFixed(2));
  return `${rounded} kg`;
};

export default function MyOrders() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [orders, setOrders] = useState<WarehouseOrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState('ALL');

  // Selected Order View Drawer
  const [selectedOrder, setSelectedOrder] = useState<WarehouseOrderItem | null>(null);

  // Warehouse info
  const [warehouseDetails, setWarehouseDetails] = useState<{
    warehouseName?: string;
    warehouseCode?: string;
    city?: string;
  }>({
    warehouseName: user?.warehouseName || '',
    warehouseCode: user?.warehouseCode || '',
    city: '',
  });

  const fetchOrders = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const [orderData, whData] = await Promise.all([
        warehousePortalService.getOrders(),
        warehousePortalService.getWarehouse().catch(() => null),
      ]);
      setOrders(Array.isArray(orderData) ? orderData : []);
      if (whData) {
        setWarehouseDetails({
          warehouseName: whData.warehouseName || user?.warehouseName,
          warehouseCode: whData.warehouseCode || user?.warehouseCode,
          city: whData.city || 'Regional Hub',
        });
      }
      if (selectedOrder) {
        const updated = orderData.find((o) => o.id === selectedOrder.id);
        if (updated) setSelectedOrder(updated);
      }
    } catch (err: any) {
      console.error('Failed to load warehouse orders:', err);
      setError(err?.response?.data?.message || 'Unable to load orders allocated to your warehouse.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedOrder, user]);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (selectedOrder) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [selectedOrder]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== 'ALL') {
        const orderStatus = (o.status || '').toUpperCase();
        if (orderStatus !== statusFilter) return false;
      }
      if (deliveryTypeFilter !== 'ALL') {
        const delType = (o.deliveryType || 'STANDARD').toUpperCase();
        if (delType !== deliveryTypeFilter) return false;
      }
      if (!search.trim()) return true;

      const q = search.toLowerCase();
      const numMatch = o.orderNumber?.toLowerCase().includes(q);
      const custMatch = o.customerName?.toLowerCase().includes(q) || o.customerEmail?.toLowerCase().includes(q);
      const pickupMatch = o.pickupCity?.toLowerCase().includes(q) || o.pickupAddress?.toLowerCase().includes(q);
      const delMatch = o.deliveryCity?.toLowerCase().includes(q) || o.deliveryAddress?.toLowerCase().includes(q);
      const pkgMatch = o.packageDescription?.toLowerCase().includes(q);

      return numMatch || custMatch || pickupMatch || delMatch || pkgMatch;
    });
  }, [orders, search, statusFilter, deliveryTypeFilter]);

  // Operational stage styling
  const getStageBadgeStyle = (stage?: string, status?: string) => {
    if (status === 'CANCELLED') {
      return { bg: '#fee2e2', color: '#b91c1c', label: 'Cancelled' };
    }
    if (status === 'DELIVERED') {
      return { bg: '#dcfce7', color: '#15803d', label: 'Delivered' };
    }

    const s = (stage || 'READY_FOR_PROCESSING').toUpperCase();
    switch (s) {
      case 'READY_FOR_PROCESSING':
      case 'READY_TO_PROCESS':
      case 'CONFIRMED':
        return { bg: '#f1f5f9', color: '#475569', label: 'Ready to Process' };
      case 'PICKING':
        return { bg: '#eff6ff', color: '#1d4ed8', label: 'Picking' };
      case 'PACKED':
        return { bg: '#fef3c7', color: '#92400e', label: 'Packed' };
      case 'READY_FOR_DISPATCH':
        return { bg: '#ecfdf5', color: '#065f46', label: 'Ready for Dispatch' };
      case 'DISPATCHED':
      case 'IN_TRANSIT':
        return { bg: '#e0e7ff', color: '#3730a3', label: 'In Transit' };
      case 'OUT_FOR_DELIVERY':
        return { bg: '#f3e8ff', color: '#6b21a8', label: 'Out for Delivery' };
      default:
        return { bg: '#f1f5f9', color: '#475569', label: s.replace(/_/g, ' ') };
    }
  };

  return (
    <div className="wh-page-container" style={{ padding: '24px 28px', maxWidth: 1400, margin: '0 auto' }}>
      {/* ── 1. Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              My Orders
            </h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                borderRadius: 20,
                backgroundColor: '#d1fae5',
                color: '#065f46',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              <Building2 size={13} />
              {warehouseDetails.warehouseName} ({warehouseDetails.warehouseCode})
            </span>
          </div>
          <p style={{ fontSize: 13.5, color: '#64748b', margin: '4px 0 0' }}>
            Allocated orders inbox for this warehouse. View order specifications, customer requirements, and delivery destinations.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => fetchOrders(true)}
            disabled={isRefreshing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: 13,
              fontWeight: 600,
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}
            title="Refresh order queue"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Orders'}</span>
          </button>

          <button
            onClick={() => navigate('/warehouse/outgoing')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 8,
              backgroundColor: '#059669',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(5,150,105,0.25)',
            }}
            title="Go to Outgoing Shipments operational workspace"
          >
            <ArrowUpRight size={15} /> Outgoing Shipments Operations
          </button>
        </div>
      </div>

      {/* ── 2. Filters & Search Toolbar ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16,
          flexWrap: 'wrap',
          backgroundColor: '#ffffff',
          padding: '12px 16px',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 280 }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
            />
            <input
              type="text"
              placeholder="Search by Order #, Customer, City, Item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 32px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              fontSize: 13,
              backgroundColor: '#ffffff',
              color: '#334155',
              outline: 'none',
              fontWeight: 500,
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PICKED_UP">Picked Up</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Delivery Type Filter */}
          <select
            value={deliveryTypeFilter}
            onChange={(e) => setDeliveryTypeFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              fontSize: 13,
              backgroundColor: '#ffffff',
              color: '#334155',
              outline: 'none',
              fontWeight: 500,
            }}
          >
            <option value="ALL">All Delivery Types</option>
            <option value="STANDARD">Standard</option>
            <option value="EXPRESS">Express</option>
            <option value="SAME_DAY">Same Day</option>
          </select>
        </div>

        <span style={{ fontSize: 12.5, color: '#64748b' }}>
          Showing <strong>{filteredOrders.length}</strong> of {orders.length} orders
        </span>
      </div>

      {/* ── 3. Orders Data Table (Read-Only Order Inbox) ── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 14,
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        {isLoading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px', color: '#059669' }} />
            <p style={{ margin: 0, fontSize: 13 }}>Loading origin-allocated order queue...</p>
          </div>
        ) : error ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#dc2626' }}>
            <AlertCircle size={28} style={{ margin: '0 auto 8px' }} />
            <p style={{ margin: 0, fontSize: 13 }}>{error}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>
            <Box size={42} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>No orders found</h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
              {search || statusFilter !== 'ALL' || deliveryTypeFilter !== 'ALL'
                ? 'No orders match your filter criteria.'
                : 'No orders are currently allocated to this warehouse.'}
            </p>
          </div>
        ) : (
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: 12 }}>
                  <th style={{ padding: '12px 14px', fontWeight: 700, width: '16%' }}>Order Number</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, width: '18%' }}>Customer</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, width: '18%' }}>Pickup Location</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, width: '20%' }}>Delivery Destination</th>
                  <th style={{ padding: '12px 10px', fontWeight: 700, width: '12%' }}>Delivery Type</th>
                  <th style={{ padding: '12px 10px', fontWeight: 700, width: '10%' }}>Status</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, width: '6%', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const stageBadge = getStageBadgeStyle(order.operationalStage, order.status);

                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      {/* 1. Order Number */}
                      <td style={{ padding: '12px 14px' }}>
                        <div
                          style={{
                            fontWeight: 700,
                            color: '#0f172a',
                            fontFamily: 'monospace',
                            cursor: 'pointer',
                          }}
                          onClick={() => setSelectedOrder(order)}
                          title="Click to view order details"
                        >
                          {order.orderNumber}
                        </div>
                        {order.trackingNumber && (
                          <div style={{ fontSize: 11, color: '#059669', fontFamily: 'monospace', marginTop: 2 }}>
                            {order.trackingNumber}
                          </div>
                        )}
                      </td>

                      {/* 2. Customer */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>
                          {order.customerName || 'Customer'}
                        </div>
                        {order.customerEmail && (
                          <div style={{ fontSize: 11, color: '#64748b' }}>
                            {order.customerEmail}
                          </div>
                        )}
                      </td>

                      {/* 3. Pickup Location */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                          <MapPin size={13} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
                          <div>
                            <span style={{ fontWeight: 600, color: '#334155' }}>
                              {order.pickupCity || 'Origin'}
                            </span>
                            {order.pickupState && <span style={{ color: '#64748b' }}>, {order.pickupState}</span>}
                            {order.pickupAddress && (
                              <div style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }} title={order.pickupAddress}>
                                {order.pickupAddress}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 4. Delivery Destination (Direct Address) */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                          <MapPin size={13} color="#2563eb" style={{ flexShrink: 0, marginTop: 2 }} />
                          <div>
                            <span style={{ fontWeight: 600, color: '#334155' }}>
                              {order.deliveryCity || 'Destination'}
                            </span>
                            {order.deliveryState && <span style={{ color: '#64748b' }}>, {order.deliveryState}</span>}
                            {order.deliveryAddress && (
                              <div style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }} title={order.deliveryAddress}>
                                {order.deliveryAddress}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 5. Delivery Type */}
                      <td style={{ padding: '12px 10px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 7px',
                            borderRadius: 6,
                            backgroundColor: order.deliveryType === 'EXPRESS' ? '#fef3c7' : '#f1f5f9',
                            color: order.deliveryType === 'EXPRESS' ? '#b45309' : '#475569',
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          {(order.deliveryType || 'STANDARD').replace('_', ' ')}
                        </span>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                          {formatWeight(order.packageWeight)} • {order.packageQuantity || 1} pkg
                        </div>
                      </td>

                      {/* 6. Status / Stage */}
                      <td style={{ padding: '12px 10px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '3px 8px',
                            borderRadius: 12,
                            backgroundColor: stageBadge.bg,
                            color: stageBadge.color,
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: stageBadge.color, flexShrink: 0 }} />
                          <span>{stageBadge.label}</span>
                        </span>
                      </td>

                      {/* 7. Action: VIEW ONLY */}
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '6px 10px',
                            borderRadius: 6,
                            border: '1px solid #cbd5e1',
                            backgroundColor: '#ffffff',
                            color: '#334155',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                          }}
                          title="View complete order specifications"
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 4. Order Detail Drawer (Read-Only Inspection) ── */}
      {selectedOrder && (
        <div
          className="wh-drawer-overlay"
          onClick={() => setSelectedOrder(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(3px)',
            zIndex: 999,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 580,
              height: '100%',
              backgroundColor: '#ffffff',
              boxShadow: '-6px 0 25px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f8fafc',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
                    {selectedOrder.orderNumber}
                  </span>
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      backgroundColor: '#e0f2fe',
                      color: '#0369a1',
                    }}
                  >
                    {(selectedOrder.deliveryType || 'STANDARD').replace('_', ' ')}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  Allocated Origin Facility: <strong>{selectedOrder.originWarehouseName || warehouseDetails.warehouseName}</strong>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: 6,
                  borderRadius: 6,
                }}
                title="Close drawer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body */}
            <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Order Overview Card */}
              <div style={{ backgroundColor: '#f8fafc', borderRadius: 10, padding: 16, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 12 }}>
                  Order Overview
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12.5 }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: 11 }}>Order Status</span>
                    <strong style={{ color: '#0f172a' }}>{selectedOrder.status || 'CONFIRMED'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: 11 }}>Operational Stage</span>
                    <strong style={{ color: '#047857' }}>
                      {(selectedOrder.operationalStage || 'READY_FOR_PROCESSING').replace(/_/g, ' ')}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: 11 }}>Tracking Number</span>
                    <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>
                      {selectedOrder.trackingNumber || 'Pending Generation'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: 11 }}>Order Created</span>
                    <span style={{ color: '#334155' }}>
                      {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct Delivery Route Card */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: 10, padding: 16, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Truck size={14} color="#059669" />
                  <span>Direct Delivery Route</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Origin */}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <MapPin size={16} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                        Origin Warehouse / Pickup Location
                      </span>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                        {selectedOrder.originWarehouseName || warehouseDetails.warehouseName}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        {selectedOrder.pickupAddress ? `${selectedOrder.pickupAddress}, ` : ''}{selectedOrder.pickupCity}, {selectedOrder.pickupState} {selectedOrder.pickupPostalCode}
                      </div>
                    </div>
                  </div>

                  {/* Customer Delivery Address */}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <MapPin size={16} color="#2563eb" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                        Customer Delivery Destination (Direct)
                      </span>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                        {selectedOrder.customerName}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        {selectedOrder.deliveryAddress ? `${selectedOrder.deliveryAddress}, ` : ''}{selectedOrder.deliveryCity}, {selectedOrder.deliveryState} {selectedOrder.deliveryPostalCode}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Contact Card */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: 10, padding: 16, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <User size={14} color="#64748b" />
                  <span>Customer Contact</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12.5 }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: 11 }}>Customer Name</span>
                    <strong style={{ color: '#0f172a' }}>{selectedOrder.customerName || '—'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: 11 }}>Phone</span>
                    <span style={{ color: '#0f172a' }}>{selectedOrder.customerPhone || '—'}</span>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: '#64748b', display: 'block', fontSize: 11 }}>Email</span>
                    <span style={{ color: '#0f172a' }}>{selectedOrder.customerEmail || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Package & Cargo Items Details */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: 10, padding: 16, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShoppingCart size={14} color="#64748b" />
                  <span>Cargo & Items Specification</span>
                </div>

                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selectedOrder.items.map((item, i) => (
                      <div
                        key={item.id || i}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 10px',
                          backgroundColor: '#f8fafc',
                          borderRadius: 6,
                          fontSize: 12,
                        }}
                      >
                        <div>
                          <strong style={{ color: '#0f172a' }}>{item.productName || item.sku || 'Item'}</strong>
                          <div style={{ color: '#64748b', fontSize: 11 }}>
                            SKU: {item.sku || '—'} • Qty: {item.quantity} • Weight: {item.unitWeight ? `${item.unitWeight} kg` : '—'}
                          </div>
                        </div>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>
                          ₹{(Number(item.unitPrice || 0) * (item.quantity || 1)).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 12.5, color: '#64748b' }}>
                    <div><strong>Description:</strong> {selectedOrder.packageDescription || 'Standard Cargo Package'}</div>
                    <div style={{ marginTop: 4 }}><strong>Total Weight:</strong> {formatWeight(selectedOrder.packageWeight)} ({selectedOrder.packageQuantity || 1} pkg)</div>
                  </div>
                )}

                <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <strong style={{ color: '#0f172a' }}>Order Total</strong>
                  <strong style={{ color: '#059669', fontSize: 15 }}>₹{(selectedOrder.totalAmount || 0).toLocaleString()}</strong>
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions (Read-Only Close) */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
              }}
            >
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  padding: '9px 18px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#334155',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
