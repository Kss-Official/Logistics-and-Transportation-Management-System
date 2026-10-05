import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  RefreshCw,
  Eye,
} from 'lucide-react';

import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import { EmptyState, LoadingState, ErrorState } from '../../components/common/States';
import { useToast } from '../../components/common/Toast';
import ShipmentDetailDrawer from '../../components/shipments/ShipmentDetailDrawer';

import adminShipmentService from '../../services/adminShipmentService';
import type { AdminShipment } from '../../types/adminShipment';
import type { ShipmentStatus } from '../../types/shipment';

const LOGISTICS_STATUSES: { value: ShipmentStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PICKED_UP', label: 'Picked Up' },
  { value: 'IN_TRANSIT', label: 'In Transit' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function AdminShipments() {
  const { showToast } = useToast();

  // ── Server State ───────────────────────────────────────────────────────────
  const [shipments, setShipments] = useState<AdminShipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Filters & Search ───────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);

  // ── View Details Drawer (Visibility and selected data separated) ───────────
  const [selectedShipment, setSelectedShipment] = useState<AdminShipment | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // ===========================================================================
  // 1. FETCH SHIPMENTS FROM POSTGRESQL (STABLE DEPENDENCIES)
  // ===========================================================================
  const fetchShipments = useCallback(
    async (isManualRefresh = false) => {
      try {
        if (isManualRefresh) {
          setIsRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const data = await adminShipmentService.getAllShipments();
        setShipments(data);

        if (isManualRefresh) {
          showToast(
            'success',
            'Shipments Refreshed',
            `Synchronized ${data.length} shipments`
          );
        }
      } catch (err: any) {
        console.error('Failed to load admin shipments:', err);
        const status = err?.response?.status;
        const serverMsg = err?.response?.data?.message;
        const msg =
          serverMsg ||
          (status === 401 || status === 403
            ? 'Your login session has expired. Please sign in again to continue.'
            : 'Unable to load shipments from server. Please verify that the backend is active.');
        setError(msg);
        showToast('error', status === 401 || status === 403 ? 'Session Expired' : 'Failed to Load Shipments', msg);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  // ===========================================================================
  // 2. VIEW DETAILS (FAST & ZERO LAG)
  // ===========================================================================
  const handleOpenDrawer = useCallback((shipment: AdminShipment) => {
    setSelectedShipment(shipment);
    setIsDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  // ===========================================================================
  // 5. FILTERING & SEARCH LOGIC
  // ===========================================================================
  const filteredShipments = useMemo(() => {
    const q = search.trim().toLowerCase();

    return shipments.filter((s) => {
      const matchSearch =
        !q ||
        (s.trackingNumber && s.trackingNumber.toLowerCase().includes(q)) ||
        (s.orderNumber && s.orderNumber.toLowerCase().includes(q)) ||
        (s.customerName && s.customerName.toLowerCase().includes(q)) ||
        (s.customerEmail && s.customerEmail.toLowerCase().includes(q)) ||
        (s.origin && s.origin.toLowerCase().includes(q)) ||
        (s.destination && s.destination.toLowerCase().includes(q)) ||
        (s.pickupAddress && s.pickupAddress.toLowerCase().includes(q)) ||
        (s.deliveryAddress && s.deliveryAddress.toLowerCase().includes(q));

      const matchStatus =
        statusFilter === 'ALL' || s.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [shipments, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredShipments.length / pageSize));
  const safePage = Math.max(1, Math.min(page, totalPages));

  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [page, totalPages]);

  const paginatedShipments = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredShipments.slice(start, start + pageSize);
  }, [filteredShipments, safePage, pageSize]);

  const startCount = filteredShipments.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endCount = filteredShipments.length === 0 ? 0 : Math.min(safePage * pageSize, filteredShipments.length);

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setPage(1);
  };

  // ===========================================================================
  // 6. DATE FORMATTERS
  // ===========================================================================
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div>
      {/* ── PAGE HEADER ───────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Manage Shipments</h2>
          <p className="page-subtitle">
            Track shipments in real time, manage transit waypoints, and monitor dispatch lifecycle.
          </p>
        </div>

        <div className="page-actions">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => fetchShipments(true)}
            disabled={isRefreshing || loading}
            title="Reload latest shipments"
          >
            <RefreshCw
              size={14}
              className={isRefreshing ? 'animate-spin' : ''}
            />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* ── TOOLBAR & FILTERS ─────────────────────────────────────────────── */}
      <div className="toolbar">
        {/* Search */}
        <div className="search-box">
          <Search size={15} className="search-box-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search Tracking Number, Order, Customer, Origin, Destination..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Status Filter */}
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="ALL">All Statuses</option>
          {LOGISTICS_STATUSES.map((st) => (
            <option key={st.value} value={st.value}>
              {st.label}
            </option>
          ))}
        </select>

        <div className="toolbar-spacer" />

        <span className="text-xs text-muted">
          Showing {startCount}–{endCount} of {filteredShipments.length} shipments
          {shipments.length !== filteredShipments.length && ` (total ${shipments.length})`}
        </span>
      </div>

      {/* ── SHIPMENTS TABLE & STATES ──────────────────────────────────────── */}
      <div className="table-container table-wrapper">
        {loading ? (
          <LoadingState message="Loading shipments..." />
        ) : error ? (
          <ErrorState
            title={error.includes('expired') || error.includes('Session') ? 'Session Expired' : 'Unable to load shipments'}
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
                  onClick={() => fetchShipments()}
                >
                  Retry
                </button>
              )
            }
          />
        ) : filteredShipments.length === 0 ? (
          <EmptyState
            title="No shipments found"
            description={
              search || statusFilter !== 'ALL'
                ? 'No shipments match your search criteria. Try adjusting or clearing your filters.'
                : 'No shipments have been created yet. Shipments are automatically generated upon customer order fulfillment.'
            }
            action={
              search || statusFilter !== 'ALL' ? (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={resetFilters}
                >
                  Reset Filters
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="table-container" style={{ width: '100%', maxWidth: '100%' }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '20%' }}>Tracking Number</th>
                  <th style={{ width: '16%' }}>Order Number</th>
                  <th style={{ width: '22%' }}>Customer</th>
                  <th style={{ width: '18%' }}>Fulfillment Warehouse</th>
                  <th style={{ width: '12%' }}>Status</th>
                  <th style={{ width: '12%', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedShipments.map((s) => {
                  return (
                    <tr key={s.id}>
                      {/* 1. TRACKING NUMBER */}
                      <td className="td-mono font-medium" style={{ color: '#0f172a' }} title={s.trackingNumber}>
                        {s.trackingNumber}
                      </td>

                      {/* 2. ORDER NUMBER */}
                      <td className="td-mono text-xs" style={{ color: '#475569' }} title={s.orderNumber || ''}>
                        {s.orderNumber || '—'}
                      </td>

                      {/* 3. CUSTOMER */}
                      <td>
                        <div className="table-text-block" title={`${s.customerName || ''} (${s.customerEmail || ''})`}>
                          <span className="table-text-primary font-medium">{s.customerName || '—'}</span>
                          <span className="table-text-secondary text-xs" style={{ color: '#64748b' }}>{s.customerEmail || '—'}</span>
                        </div>
                      </td>

                      {/* 4. FULFILLMENT WAREHOUSE */}
                      <td>
                        <div className="table-text-block" title={`${s.warehouseName || ''} (${s.warehouseCode || ''})`}>
                          <span className="table-text-primary font-medium" style={{ color: s.warehouseName ? '#0f172a' : '#94a3b8' }}>
                            {s.warehouseName || 'Unassigned'}
                          </span>
                          {s.warehouseCode && (
                            <span className="badge badge-slate" style={{ fontSize: 10, padding: '1px 5px', width: 'fit-content' }}>
                              {s.warehouseCode}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 5. CURRENT STATUS */}
                      <td>
                        <StatusBadge status={s.status} />
                      </td>

                      {/* 6. ACTIONS */}
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
                          {/* View Details */}
                          <button
                            className="btn btn-outline btn-xs"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px' }}
                            title="View Shipment Details & Milestones"
                            onClick={() => handleOpenDrawer(s)}
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
        {!loading && !error && filteredShipments.length > pageSize && (
          <Pagination
            page={page}
            pageSize={pageSize}
            total={filteredShipments.length}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* ── DETAILS DRAWER (ISOLATED & HIGH-PERFORMANCE) ─────────────────── */}
      <ShipmentDetailDrawer
        shipment={selectedShipment}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onShipmentUpdated={(updatedShipment) => {
          setSelectedShipment(updatedShipment);
          fetchShipments();
        }}
      />
    </div>
  );
}
