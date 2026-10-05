import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Eye,
  Download,
  RefreshCw,
} from 'lucide-react';

import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import OrderDetailDrawer from '../../components/orders/OrderDetailDrawer';
import { EmptyState, LoadingState, ErrorState } from '../../components/common/States';
import { useToast } from '../../components/common/Toast';

import adminOrderService from '../../services/adminOrderService';
import type { AdminOrder } from '../../types/adminOrder';

export default function AdminOrders() {
  const { showToast } = useToast();

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState('ALL');

  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);

  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  // ==============================
  // FETCH ORDERS FROM POSTGRESQL API
  // ==============================
  const fetchOrders = useCallback(
    async (isManualRefresh = false) => {
      try {
        if (isManualRefresh) {
          setIsRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const data = await adminOrderService.getAllOrders();
        setOrders(data);

        if (isManualRefresh) {
          showToast(
            'success',
            'Orders Refreshed',
            `Synchronized ${data.length} orders`
          );
        }
      } catch (err: any) {
        console.error('Failed to load admin orders:', err);
        const status = err?.response?.status;
        const serverMsg = err?.response?.data?.message;
        const msg =
          serverMsg ||
          (status === 401 || status === 403
            ? 'Your login session has expired. Please sign in again to continue.'
            : 'Failed to connect to backend orders service. Please ensure the server is active.');
        setError(msg);
        showToast('error', status === 401 || status === 403 ? 'Session Expired' : 'Error Fetching Orders', msg);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ==============================
  // EXPORT TO CSV
  // ==============================
  const handleExportCSV = () => {
    if (orders.length === 0) {
      showToast('info', 'Export Notice', 'No orders available to export.');
      return;
    }

    const headers = [
      'Order Number',
      'Customer Name',
      'Customer Email',
      'Customer Phone',
      'Booking Date',
      'Pickup City',
      'Pickup State',
      'Pickup Address',
      'Delivery City',
      'Delivery State',
      'Delivery Address',
      'Delivery Type',
      'Status',
      'Package Description',
      'Weight (kg)',
      'Subtotal (INR)',
      'Tax Amount (INR)',
      'Total Amount (INR)',
    ];

    const rows = filteredOrders.map((order) => [
      `"${order.orderNumber}"`,
      `"${order.customerName || ''}"`,
      `"${order.customerEmail || ''}"`,
      `"${order.customerPhone || ''}"`,
      `"${order.createdAt || ''}"`,
      `"${order.pickupCity || ''}"`,
      `"${order.pickupState || ''}"`,
      `"${(order.pickupAddress || '').replace(/"/g, '""')}"`,
      `"${order.deliveryCity || ''}"`,
      `"${order.deliveryState || ''}"`,
      `"${(order.deliveryAddress || '').replace(/"/g, '""')}"`,
      `"${order.deliveryType || ''}"`,
      `"${order.status}"`,
      `"${(order.packageDescription || '').replace(/"/g, '""')}"`,
      order.packageWeight ?? '',
      order.subtotal ?? '',
      order.taxAmount ?? '',
      order.totalAmount ?? '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `primeroute-orders-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(
      'success',
      'Export Complete',
      `Exported ${filteredOrders.length} orders to CSV`
    );
  };

  // ==============================
  // FILTERING LOGIC
  // ==============================
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const q = search.trim().toLowerCase();

      const matchSearch =
        !q ||
        (order.orderNumber && order.orderNumber.toLowerCase().includes(q)) ||
        (order.customerName &&
          order.customerName.toLowerCase().includes(q)) ||
        (order.customerEmail &&
          order.customerEmail.toLowerCase().includes(q)) ||
        (order.pickupAddress &&
          order.pickupAddress.toLowerCase().includes(q)) ||
        (order.deliveryAddress &&
          order.deliveryAddress.toLowerCase().includes(q)) ||
        (order.pickupCity && order.pickupCity.toLowerCase().includes(q)) ||
        (order.deliveryCity && order.deliveryCity.toLowerCase().includes(q)) ||
        (order.packageDescription &&
          order.packageDescription.toLowerCase().includes(q));

      const matchStatus =
        statusFilter === 'ALL' || order.status === statusFilter;

      const matchDeliveryType =
        deliveryTypeFilter === 'ALL' ||
        order.deliveryType === deliveryTypeFilter;

      return matchSearch && matchStatus && matchDeliveryType;
    });
  }, [orders, search, statusFilter, deliveryTypeFilter]);

  // ==============================
  // PAGINATION
  // ==============================
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const safePage = Math.max(1, Math.min(page, totalPages));

  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [page, totalPages]);

  const paginatedOrders = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, safePage, pageSize]);

  const startCount = filteredOrders.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endCount = filteredOrders.length === 0 ? 0 : Math.min(safePage * pageSize, filteredOrders.length);

  // ==============================
  // RESET FILTERS
  // ==============================
  const resetFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setDeliveryTypeFilter('ALL');
    setPage(1);
  };

  // ==============================
  // FORMATTERS
  // ==============================
  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (amount?: number | null) => {
    if (amount === undefined || amount === null) return '—';
    return `₹${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div>
      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Manage Orders</h2>
          <p className="page-subtitle">
            Track, filter, and manage all customer shipments and booking requests.
          </p>
        </div>

        <div className="page-actions">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => fetchOrders(true)}
            disabled={isRefreshing || loading}
            title="Reload latest orders"
          >
            <RefreshCw
              size={14}
              className={isRefreshing ? 'animate-spin' : ''}
            />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>

          <button
            className="btn btn-outline btn-sm"
            onClick={handleExportCSV}
            title="Export filtered orders list to CSV"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* TOOLBAR & FILTERS */}
      <div className="toolbar">
        <div className="search-box">
          <Search size={15} className="search-box-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search Order Number, Customer, City, Address..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Status Filter */}
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setPage(1);
          }}
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

        {/* Delivery Type Filter */}
        <select
          className="filter-select"
          value={deliveryTypeFilter}
          onChange={(event) => {
            setDeliveryTypeFilter(event.target.value);
            setPage(1);
          }}
        >
          <option value="ALL">All Delivery Types</option>
          <option value="STANDARD">Standard</option>
          <option value="EXPRESS">Express</option>
          <option value="SAME_DAY">Same Day</option>
        </select>

        <div className="toolbar-spacer" />

        <span className="text-xs text-muted">
          Showing {startCount}–{endCount} of {filteredOrders.length} orders
          {orders.length !== filteredOrders.length && ` (total ${orders.length})`}
        </span>
      </div>

      {/* ORDERS TABLE / STATES */}
      <div className="table-wrapper">
        {loading ? (
          <LoadingState message="Loading orders..." />
        ) : error ? (
          <ErrorState
            title={error.includes('expired') || error.includes('Session') ? 'Session Expired' : 'Failed to Load Orders'}
            message={error}
            action={
              error.includes('expired') || error.includes('Session') ? (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => (window.location.href = '/signin/admin')}
                >
                  Sign In Again
                </button>
              ) : (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => fetchOrders()}
                >
                  Retry
                </button>
              )
            }
          />
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            title="No orders found"
            description={
              search || statusFilter !== 'ALL' || deliveryTypeFilter !== 'ALL'
                ? 'No orders match your search criteria. Try adjusting or clearing your filters.'
                : 'No orders have been placed in the system yet.'
            }
            action={
              (search || statusFilter !== 'ALL' || deliveryTypeFilter !== 'ALL') && (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={resetFilters}
                >
                  Reset Filters
                </button>
              )
            }
          />
        ) : (
          <div className="table-container" style={{ width: '100%', maxWidth: '100%' }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '22%' }}>Order Number</th>
                  <th style={{ width: '30%' }}>Customer</th>
                  <th style={{ width: '18%' }}>Delivery Type</th>
                  <th style={{ width: '16%' }}>Status</th>
                  <th style={{ width: '14%', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedOrders.map((order) => {
                  const canCancel =
                    order.status !== 'CANCELLED' &&
                    order.status !== 'DELIVERED';

                  return (
                    <tr key={order.id}>
                      {/* 1. ORDER NUMBER */}
                      <td className="td-mono font-medium" style={{ color: '#0f172a' }} title={order.orderNumber}>
                        {order.orderNumber}
                      </td>

                      {/* 2. CUSTOMER */}
                      <td>
                        <div className="table-text-block" title={`${order.customerName || ''} (${order.customerEmail || ''})`}>
                          <span className="table-text-primary font-medium">
                            {order.customerName || '—'}
                          </span>
                          <span className="table-text-secondary text-xs" style={{ color: '#64748b' }}>
                            {order.customerEmail || '—'}
                          </span>
                        </div>
                      </td>

                      {/* 3. DELIVERY TYPE */}
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
                          {(order.deliveryType || 'STANDARD').replace('_', ' ')}
                        </span>
                      </td>

                      {/* 4. STATUS */}
                      <td>
                        <StatusBadge status={order.status} />
                      </td>

                      {/* 5. ACTIONS */}
                      <td style={{ textAlign: 'center' }}>
                        <div
                          className="td-actions"
                          style={{
                            justifyContent: 'center',
                            display: 'flex',
                            gap: 6,
                            alignItems: 'center',
                          }}
                        >
                          {/* VIEW DETAILS */}
                          <button
                            className="btn btn-outline btn-xs"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px' }}
                            title="View Order Details"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye size={13} />
                            <span>View</span>
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

        {/* PAGINATION */}
        {!loading && !error && filteredOrders.length > pageSize && (
          <Pagination
            page={page}
            pageSize={pageSize}
            total={filteredOrders.length}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* ORDER DETAIL DRAWER (ADMIN READ-ONLY MONITORING) */}
      <OrderDetailDrawer
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        isAdmin={true}
      />
    </div>
  );
}