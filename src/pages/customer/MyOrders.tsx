import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { BackendOrder } from '../../types/order';

import {
  Search,
  Eye,
  XCircle,
  RefreshCw,
  Plus,
} from 'lucide-react';

import StatusBadge from '../../components/common/StatusBadge';
import OrderDetailDrawer from '../../components/orders/OrderDetailDrawer';
import Modal from '../../components/common/Modal';
import { EmptyState } from '../../components/common/States';
import { useToast } from '../../components/common/Toast';

import { getAllOrders, cancelOrder } from '../../services/orderService';

export default function MyOrders() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<BackendOrder | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<BackendOrder | null>(null);

  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<number | null>(null);

  /**
   * Load orders from Spring Boot backend
   */
  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
      showToast(
        'error',
        'Unable to Load Orders',
        'Something went wrong while loading your orders. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  /**
   * Search + status filtering
   */
  const filteredOrders = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return orders.filter((order) => {
      const matchSearch =
        (order.orderNumber ? order.orderNumber.toLowerCase().includes(searchText) : false) ||
        (order.deliveryAddress ? order.deliveryAddress.toLowerCase().includes(searchText) : false) ||
        (order.pickupAddress ? order.pickupAddress.toLowerCase().includes(searchText) : false) ||
        (order.packageDescription ? order.packageDescription.toLowerCase().includes(searchText) : false);

      const matchStatus =
        statusFilter === 'ALL' || order.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  /**
   * Cancel order
   */
  const handleCancelOrder = async (orderId: number) => {
    try {
      setCancelling(orderId);
      await cancelOrder(orderId);
      await loadOrders();
      setSelectedOrder(null);
      showToast(
        'info',
        'Order Cancelled',
        `Order ${orderId} was successfully cancelled.`
      );
    } catch (error) {
      console.error('Failed to cancel order:', error);
      showToast(
        'error',
        'Cancellation Failed',
        'Unable to cancel the order. Please try again.'
      );
    } finally {
      setCancelling(null);
    }
  };

  /**
   * Handle cancel from detail drawer
   */
  const handleDrawerStatusChange = async (
    orderId: string | number,
    newStatus: BackendOrder['status']
  ) => {
    if (newStatus === 'CANCELLED') {
      await handleCancelOrder(Number(orderId));
    }
  };

  /**
   * Format booking date
   */
  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  /**
   * Format delivery type
   */
  const formatDeliveryType = (type: BackendOrder['deliveryType']) => {
    switch (type) {
      case 'SAME_DAY':
        return 'Same Day';
      case 'EXPRESS':
        return 'Express';
      case 'STANDARD':
        return 'Standard';
      default:
        return type;
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            My Orders
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            View and manage your consignments.
          </p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={loadOrders}
          disabled={loading}
          title="Refresh Orders"
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
            placeholder="Search Order ID, Destination, Package..."
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
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PICKED_UP">Picked Up</option>
          <option value="IN_TRANSIT">In Transit</option>
          <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Orders Table Card */}
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
              Loading your orders...
            </span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            title={
              orders.length === 0 ? 'No orders yet' : 'No orders found'
            }
            description={
              orders.length === 0
                ? 'Create an order to start managing your shipments.'
                : 'No orders match your current search or status filter.'
            }
          />
        ) : (
          <div className="table-container" style={{ width: '100%', maxWidth: '100%' }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '25%' }}>Order Number</th>
                  <th style={{ width: '20%' }}>Delivery Type</th>
                  <th style={{ width: '18%' }}>Status</th>
                  <th style={{ width: '20%' }}>Booking Date</th>
                  <th style={{ width: '17%', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => {
                  const canCancel =
                    order.status === 'PENDING' || order.status === 'CONFIRMED';

                  return (
                    <tr key={order.id}>
                      {/* 1. Order Number */}
                      <td className="td-mono font-medium" style={{ color: '#0f172a' }}>
                        {order.orderNumber || order.id}
                      </td>

                      {/* 2. Delivery Type */}
                      <td>
                        <span
                          className="badge badge-slate"
                          style={{
                            fontWeight: 600,
                            fontSize: 11,
                            letterSpacing: '0.02em',
                            textTransform: 'uppercase',
                          }}
                        >
                          {formatDeliveryType(order.deliveryType)}
                        </span>
                      </td>

                      {/* 3. Status */}
                      <td>
                        <StatusBadge status={order.status} />
                      </td>

                      {/* 4. Booking Date */}
                      <td style={{ fontSize: 12, color: '#475569' }}>
                        {formatDate(order.createdAt || order.date || '')}
                      </td>

                      {/* 5. Actions */}
                      <td style={{ textAlign: 'center' }}>
                        <div
                          className="td-actions"
                          style={{ justifyContent: 'center', gap: 6, display: 'flex', alignItems: 'center' }}
                        >
                          <button
                            className="btn btn-outline btn-xs"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px' }}
                            onClick={() => setSelectedOrder(order)}
                            title="View Order Details"
                          >
                            <Eye size={13} />
                            <span>View</span>
                          </button>

                          {canCancel && (
                            <button
                              className="btn btn-outline btn-xs"
                              style={{ color: '#ef4444', borderColor: '#fecaca', display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px' }}
                              onClick={() => setOrderToCancel(order)}
                              disabled={cancelling === order.id}
                              title="Cancel Order"
                            >
                              <XCircle size={13} />
                              <span>Cancel</span>
                            </button>
                          )}
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

      {/* Order Detail Drawer */}
      <OrderDetailDrawer
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onStatusChange={handleDrawerStatusChange}
      />

      {/* Cancel Order Confirmation Modal */}
      <Modal
        isOpen={!!orderToCancel}
        onClose={() => !cancelling && setOrderToCancel(null)}
        title="Confirm Order Cancellation"
        size="sm"
      >
        <div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
            Are you sure you want to cancel Order <strong className="font-mono">{orderToCancel?.orderNumber}</strong>?
            This will update the order and linked shipment status to <strong>CANCELLED</strong> while maintaining your commercial audit history.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              disabled={!!cancelling}
              onClick={() => setOrderToCancel(null)}
            >
              Keep Order
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              disabled={!!cancelling}
              onClick={async () => {
                if (orderToCancel) {
                  await handleCancelOrder(Number(orderToCancel.id));
                  setOrderToCancel(null);
                }
              }}
            >
              {cancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}