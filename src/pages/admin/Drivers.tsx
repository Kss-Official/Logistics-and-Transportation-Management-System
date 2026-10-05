import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  PlusCircle,
  Eye,
  Edit3,
  Trash2,
  RefreshCw,
  UserCheck,
  Truck,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  MapPin,
  AlertTriangle,
} from 'lucide-react';

import StatusBadge from '../../components/common/StatusBadge';
import Drawer from '../../components/common/Drawer';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import { EmptyState, LoadingState, ErrorState } from '../../components/common/States';
import { useToast } from '../../components/common/Toast';

import driverService from '../../services/driverService';
import vehicleService from '../../services/vehicleService';
import { warehouseService } from '../../services/warehouseService';
import type { Warehouse } from '../../types/warehouse';
import type { AdminDriver, DriverStatus } from '../../types/adminDriver';
import type { Vehicle } from '../../types/vehicle';
import {
  validateFullName,
  validateEmail,
  validateIndianPhone,
  validateFutureOrPresentDate,
  formatIndianPhone,
} from '../../utils/validation';

const DRIVER_STATUS_OPTIONS: { value: DriverStatus; label: string }[] = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'ON_DUTY', label: 'On Duty' },
  { value: 'ON_DELIVERY', label: 'On Delivery' },
  { value: 'OFF_DUTY', label: 'Off Duty' },
  { value: 'INACTIVE', label: 'Inactive' },
];

export default function AdminDrivers() {
  const { showToast } = useToast();

  // ── Server State ───────────────────────────────────────────────────────────
  const [drivers, setDrivers] = useState<AdminDriver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Filters & Search ───────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);

  // ── Modals & Drawer State ──────────────────────────────────────────────────
  const [selectedDriver, setSelectedDriver] = useState<AdminDriver | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<AdminDriver | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    licenseExpiryDate: '',
    address: '',
    status: 'AVAILABLE' as DriverStatus,
    warehouseId: undefined as number | undefined,
    vehicleId: undefined as number | undefined,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Delete / Deactivate Confirmation Modal
  const [driverToDelete, setDriverToDelete] = useState<AdminDriver | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ===========================================================================
  // 1. FETCH DRIVERS FROM POSTGRESQL (STABLE DEPENDENCIES)
  // ===========================================================================
  const fetchDrivers = useCallback(
    async (isManualRefresh = false) => {
      try {
        if (isManualRefresh) {
          setIsRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const [driversData, vehiclesData, warehousesData] = await Promise.all([
          driverService.getAllDrivers(),
          vehicleService.getAllVehicles().catch(() => []),
        warehouseService.getAllWarehouses().catch(() => []),
        ]);
        setDrivers(driversData);
        setVehicles(vehiclesData);
      setWarehouses(warehousesData);

        if (isManualRefresh) {
          showToast(
            'success',
            'Drivers Refreshed',
            `Synchronized ${driversData.length} drivers`
          );
        }
      } catch (err: any) {
        console.error('Failed to load admin drivers:', err);
        const status = err?.response?.status;
        const serverMsg = err?.response?.data?.message;
        const msg =
          serverMsg ||
          (status === 401 || status === 403
            ? 'Your login session has expired. Please sign in again to continue.'
            : 'Unable to load drivers from server. Please ensure the backend is active.');
        setError(msg);
        showToast('error', status === 401 || status === 403 ? 'Session Expired' : 'Failed to Load Drivers', msg);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  // ===========================================================================
  // 2. VIEW DETAILS
  // ===========================================================================
  const handleOpenDrawer = useCallback((driver: AdminDriver) => {
    setSelectedDriver(driver);
    setIsDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  // ===========================================================================
  // 3. CREATE & EDIT MODAL
  // ===========================================================================
  const handleOpenAddModal = () => {
    setEditingDriver(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      licenseNumber: '',
      licenseExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      address: '',
      status: 'AVAILABLE',
      warehouseId: undefined,
      vehicleId: undefined,
    });
    setFormError(null);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (driver: AdminDriver) => {
    setEditingDriver(driver);
    setFormData({
      fullName: driver.fullName,
      email: driver.email,
      phone: driver.phone,
      licenseNumber: driver.licenseNumber,
      licenseExpiryDate: driver.licenseExpiryDate,
      address: driver.address || '',
      status: driver.status,
      warehouseId: driver.warehouseId,
      vehicleId: driver.vehicleId,
    });
    setFormError(null);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleSaveDriver = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    const nameRes = validateFullName(formData.fullName);
    if (!nameRes.isValid) errors.fullName = nameRes.error!;

    const emailRes = validateEmail(formData.email);
    if (!emailRes.isValid) errors.email = emailRes.error!;

    const phoneRes = validateIndianPhone(formData.phone);
    if (!phoneRes.isValid) errors.phone = phoneRes.error!;

    if (!formData.licenseNumber.trim()) {
      errors.licenseNumber = 'License number is required.';
    }

    const expiryRes = validateFutureOrPresentDate(formData.licenseExpiryDate, 'License expiry date', true);
    if (!expiryRes.isValid) errors.licenseExpiryDate = expiryRes.error!;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError('Please correct the validation errors highlighted below.');
      return;
    }
    setFieldErrors({});
    setFormError(null);

    const formattedPhone = formatIndianPhone(formData.phone);

    try {
      setIsSaving(true);
      setFormError(null);

      if (editingDriver) {
        // Update existing driver
        const updated = await driverService.updateDriver(editingDriver.id, {
          fullName: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formattedPhone,
          licenseNumber: formData.licenseNumber.trim().toUpperCase(),
          licenseExpiryDate: formData.licenseExpiryDate,
          address: formData.address.trim() || undefined,
          warehouseId: formData.warehouseId,
          vehicleId: formData.vehicleId,
          status: formData.status,
        });

        // Refresh driver list from PostgreSQL
        const freshList = await driverService.getAllDrivers();
        setDrivers(freshList);

        if (selectedDriver && selectedDriver.id === updated.id) {
          setSelectedDriver(updated);
        }

        showToast(
          'success',
          'Driver updated successfully',
          `Information for ${updated.fullName} has been updated successfully.`
        );
      } else {
        // Create new driver
        const created = await driverService.createDriver({
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          licenseNumber: formData.licenseNumber.trim(),
          licenseExpiryDate: formData.licenseExpiryDate,
          address: formData.address.trim() || undefined,
          warehouseId: formData.warehouseId,
          vehicleId: formData.vehicleId,
          status: formData.status,
        });

        // Refresh driver list from PostgreSQL
        const freshList = await driverService.getAllDrivers();
        setDrivers(freshList);

        showToast(
          'success',
          'Driver created successfully',
          `${created.fullName} has been registered successfully.`
        );
      }

      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Save driver error:', err);
      const msg =
        err?.response?.data?.message ||
        'Failed to save driver. Please ensure email and license number are unique.';
      setFormError(msg);
      showToast('error', 'Save Failed', msg);
    } finally {
      setIsSaving(false);
    }
  };

  // ===========================================================================
  // 4. DELETE / DEACTIVATE DRIVER
  // ===========================================================================
  const handleConfirmDelete = async () => {
    if (!driverToDelete) return;

    try {
      setIsDeleting(true);
      await driverService.deleteDriver(driverToDelete.id);

      showToast(
        'success',
        'Driver deleted successfully',
        `${driverToDelete.fullName} has been removed successfully.`
      );

      setDriverToDelete(null);

      // Refresh list from PostgreSQL
      const updatedList = await driverService.getAllDrivers();
      setDrivers(updatedList);

      if (selectedDriver && selectedDriver.id === driverToDelete.id) {
        setSelectedDriver(null);
        setIsDrawerOpen(false);
      }
    } catch (err: any) {
      console.error('Delete driver error:', err);
      const msg =
        err?.response?.data?.message || 'Failed to delete driver. Please try again.';
      showToast('error', 'Cannot Delete Driver', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // ===========================================================================
  // 5. FILTER & SEARCH
  // ===========================================================================
  const filteredDrivers = useMemo(() => {
    const q = search.trim().toLowerCase();

    return drivers.filter((d) => {
      const matchSearch =
        !q ||
        d.fullName.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q) ||
        d.phone.toLowerCase().includes(q) ||
        d.licenseNumber.toLowerCase().includes(q) ||
        (d.address && d.address.toLowerCase().includes(q));

      const matchStatus = statusFilter === 'ALL' || d.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [drivers, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredDrivers.length / pageSize));
  const safePage = Math.max(1, Math.min(page, totalPages));

  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [page, totalPages]);

  const paginatedDrivers = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredDrivers.slice(start, start + pageSize);
  }, [filteredDrivers, safePage, pageSize]);

  const startCount = filteredDrivers.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endCount = filteredDrivers.length === 0 ? 0 : Math.min(safePage * pageSize, filteredDrivers.length);

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setPage(1);
  };

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div>
      {/* ── PAGE HEADER ───────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Drivers</h2>
          <p className="page-subtitle">
            Manage drivers, licenses, availability and delivery assignments.
          </p>
        </div>

        <div className="page-actions">
          <button
            className="btn btn-primary btn-sm"
            onClick={handleOpenAddModal}
            title="Register a new delivery driver"
          >
            <PlusCircle size={14} />
            <span>Add Driver</span>
          </button>

          <button
            className="btn btn-outline btn-sm"
            onClick={() => fetchDrivers(true)}
            disabled={isRefreshing || loading}
            title="Reload latest drivers"
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
            placeholder="Search Driver Name, Email, Phone, License..."
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
          {DRIVER_STATUS_OPTIONS.map((st) => (
            <option key={st.value} value={st.value}>
              {st.label}
            </option>
          ))}
        </select>

        <div className="toolbar-spacer" />

        <span className="text-xs text-muted">
          Showing {startCount}–{endCount} of {filteredDrivers.length} drivers
          {drivers.length !== filteredDrivers.length && ` (total ${drivers.length})`}
        </span>
      </div>

      {/* ── DRIVERS TABLE & STATES ────────────────────────────────────────── */}
      <div className="table-container table-wrapper">
        {loading ? (
          <LoadingState message="Loading drivers..." />
        ) : error ? (
          <ErrorState
            title={error.includes('expired') || error.includes('Session') ? 'Session Expired' : 'Unable to load drivers'}
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
                  onClick={() => fetchDrivers()}
                >
                  Retry
                </button>
              )
            }
          />
        ) : filteredDrivers.length === 0 ? (
          <EmptyState
            title="No drivers found"
            description={
              search || statusFilter !== 'ALL'
                ? 'No drivers match your filter criteria. Try clearing search or filters.'
                : 'No delivery drivers have been added to the database yet. Click "Add Driver" to register one.'
            }
            action={
              search || statusFilter !== 'ALL' ? (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={resetFilters}
                >
                  Reset Filters
                </button>
              ) : (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleOpenAddModal}
                >
                  <PlusCircle size={14} /> Add Driver
                </button>
              )
            }
          />
        ) : (
          <div className="table-container" style={{ width: '100%', maxWidth: '100%' }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '28%' }}>Driver</th>
                  <th style={{ width: '18%' }}>Status</th>
                  <th style={{ width: '22%' }}>Current Vehicle</th>
                  <th style={{ width: '16%' }}>Active Shipments</th>
                  <th style={{ width: '16%', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDrivers.map((d) => {
                  return (
                    <tr key={d.id}>
                      {/* 1. DRIVER */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: '50%',
                              background: '#eff6ff',
                              color: '#2563eb',
                              fontWeight: 700,
                              fontSize: 11,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {getInitials(d.fullName)}
                          </div>
                          <div className="table-text-block">
                            <span className="table-text-primary font-medium">{d.fullName}</span>
                            <span className="table-text-secondary text-xs" style={{ color: '#64748b' }}>
                              ID: #{d.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. STATUS */}
                      <td>
                        <StatusBadge status={d.status} />
                      </td>

                      {/* 4. CURRENT VEHICLE */}
                      <td>
                        {d.vehicleNumber ? (
                          <span className="badge badge-slate" style={{ fontSize: 11, fontFamily: 'monospace' }}>
                            {d.vehicleNumber}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: 12 }}>Not Assigned</span>
                        )}
                      </td>

                      {/* 5. ACTIVE SHIPMENTS */}
                      <td>
                        <span
                          className={`badge ${
                            (d.assignedShipmentsCount || 0) > 0
                              ? 'badge-blue'
                              : 'badge-slate'
                          }`}
                          style={{ fontWeight: 600, fontSize: 11 }}
                        >
                          {d.assignedShipmentsCount || 0} active
                        </span>
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
                          {/* 1. View Details */}
                          <button
                            className="btn btn-outline btn-xs"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px' }}
                            title="View Driver Details"
                            onClick={() => handleOpenDrawer(d)}
                          >
                            <Eye size={13} />
                            <span>View</span>
                          </button>

                          {/* 2. Edit Profile */}
                          <button
                            className="btn-icon btn-xs"
                            title="Edit Driver Profile"
                            onClick={() => handleOpenEditModal(d)}
                          >
                            <Edit3 size={13} />
                          </button>

                          {/* 3. Delete Driver */}
                          <button
                            className="btn-icon btn-xs"
                            title="Deactivate or Delete Driver"
                            style={{ color: '#ef4444' }}
                            onClick={() => setDriverToDelete(d)}
                          >
                            <Trash2 size={14} />
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
        {!loading && !error && filteredDrivers.length > pageSize && (
          <Pagination
            page={page}
            pageSize={pageSize}
            total={filteredDrivers.length}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* ── ADD / EDIT DRIVER MODAL ────────────────────────────────────────── */}
      {isModalOpen && (
        <Modal
          title={editingDriver ? `Edit Driver: ${editingDriver.fullName}` : 'Add New Driver'}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        >
          <form onSubmit={handleSaveDriver}>
            {formError && (
              <div
                style={{
                  background: 'var(--danger-light)',
                  border: '1px solid var(--danger-border)',
                  color: 'var(--danger-text)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius)',
                  fontSize: 13,
                  marginBottom: 16,
                }}
              >
                {formError}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {/* Full Name */}
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label form-label-required">Full Name</label>
                <input
                  type="text"
                  className={`form-input ${fieldErrors.fullName ? 'error' : ''}`}
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData({ ...formData, fullName: e.target.value });
                    if (fieldErrors.fullName) setFieldErrors((prev) => ({ ...prev, fullName: '' }));
                  }}
                />
                {fieldErrors.fullName && <p className="form-error" style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{fieldErrors.fullName}</p>}
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label form-label-required">Email Address</label>
                <input
                  type="email"
                  className={`form-input ${fieldErrors.email ? 'error' : ''}`}
                  placeholder="e.g. ramesh.kumar@primeroute.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: '' }));
                  }}
                />
                {fieldErrors.email && <p className="form-error" style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{fieldErrors.email}</p>}
              </div>

              {/* Phone */}
              <div className="form-group">
                <label className="form-label form-label-required">Phone Number</label>
                <input
                  type="tel"
                  className={`form-input ${fieldErrors.phone ? 'error' : ''}`}
                  placeholder="e.g. +91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: '' }));
                  }}
                />
                {fieldErrors.phone && <p className="form-error" style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{fieldErrors.phone}</p>}
              </div>

              {/* License Number */}
              <div className="form-group">
                <label className="form-label form-label-required">License Number</label>
                <input
                  type="text"
                  className={`form-input font-mono ${fieldErrors.licenseNumber ? 'error' : ''}`}
                  placeholder="e.g. DL-KA-2022-0098765"
                  value={formData.licenseNumber}
                  onChange={(e) => {
                    setFormData({ ...formData, licenseNumber: e.target.value });
                    if (fieldErrors.licenseNumber) setFieldErrors((prev) => ({ ...prev, licenseNumber: '' }));
                  }}
                />
                {fieldErrors.licenseNumber && <p className="form-error" style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{fieldErrors.licenseNumber}</p>}
              </div>

              {/* License Expiry Date */}
              <div className="form-group">
                <label className="form-label form-label-required">License Expiry Date</label>
                <input
                  type="date"
                  className={`form-input ${fieldErrors.licenseExpiryDate ? 'error' : ''}`}
                  value={formData.licenseExpiryDate}
                  onChange={(e) => {
                    setFormData({ ...formData, licenseExpiryDate: e.target.value });
                    if (fieldErrors.licenseExpiryDate) setFieldErrors((prev) => ({ ...prev, licenseExpiryDate: '' }));
                  }}
                />
                {fieldErrors.licenseExpiryDate && <p className="form-error" style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{fieldErrors.licenseExpiryDate}</p>}
              </div>

              {/* Address */}
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Address (Optional)</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="e.g. Sector 4, HSR Layout, Bengaluru, Karnataka"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
                marginTop: 20,
                paddingTop: 14,
                borderTop: '1px solid var(--border)',
              }}
            >
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSaving}
              >
                {isSaving
                  ? 'Saving...'
                  : editingDriver
                  ? 'Update Driver'
                  : 'Save Driver'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── VIEW DRIVER DETAILS DRAWER ────────────────────────────────────── */}
      <Drawer
        title="Driver Profile & Telemetry"
        subtitle={selectedDriver ? `ID: #${selectedDriver.id} • ${selectedDriver.fullName}` : ''}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        size="lg"
      >
        {selectedDriver && (() => {
          const linkedVehicle = selectedDriver.vehicleId
            ? vehicles.find((v) => v.id === selectedDriver.vehicleId) || {
                vehicleNumber: selectedDriver.vehicleNumber,
                model: '',
              }
            : vehicles.find(
                (v) =>
                  v.driverId === selectedDriver.id ||
                  (v.driverName && v.driverName.toLowerCase() === selectedDriver.fullName.toLowerCase())
              );
          const currentShipmentNumber =
            selectedDriver.assignedShipmentNumbers && selectedDriver.assignedShipmentNumbers.length > 0
              ? selectedDriver.assignedShipmentNumbers[0]
              : linkedVehicle && 'currentShipmentTrackingNumber' in linkedVehicle && linkedVehicle.currentShipmentTrackingNumber &&
                linkedVehicle.currentShipmentTrackingNumber !== 'No active shipment'
              ? (linkedVehicle as any).currentShipmentTrackingNumber
              : null;
          const assignedWarehouse =
            selectedDriver.warehouseName ||
            (selectedDriver.warehouseId ? warehouses.find((w) => w.id === selectedDriver.warehouseId)?.warehouseName : null) ||
            'Unassigned (Company Wide)';
          const isAvailable = selectedDriver.status === 'AVAILABLE';
          const isBusy = selectedDriver.status === 'ON_DELIVERY' || selectedDriver.status === 'ON_TRIP';
          const availabilityText = isAvailable
            ? 'Available for Assignment'
            : isBusy
            ? 'Active on Delivery'
            : selectedDriver.status === 'ON_DUTY'
            ? 'On Duty (Depot)'
            : selectedDriver.status === 'OFF_DUTY'
            ? 'Off Duty'
            : 'Inactive';

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 4 }}>
              {/* Header Identity Card */}
              <div
                style={{
                  background: 'var(--page-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: 18,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)',
                  }}
                >
                  {getInitials(selectedDriver.fullName)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{
                      margin: '0 0 4px',
                      fontSize: 17,
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {selectedDriver.fullName}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <StatusBadge status={selectedDriver.status} />
                    <span
                      className={`badge ${isAvailable ? 'badge-success' : isBusy ? 'badge-blue' : 'badge-slate'}`}
                      style={{ fontSize: 11 }}
                    >
                      {availabilityText}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      License: <strong className="font-mono">{selectedDriver.licenseNumber}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Operational Assignment Information (Read-Only) ── */}
              <div
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  background: 'var(--card-bg)',
                }}
              >
                <h4
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    margin: '0 0 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Truck size={14} color="var(--primary)" /> Assignment Information
                </h4>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 12,
                    fontSize: 13,
                  }}
                >
                  <div style={{ background: 'var(--page-bg)', padding: '10px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, display: 'block' }}>
                      Assigned Warehouse:
                    </span>
                    <strong style={{ color: 'var(--text-primary)', fontSize: 13 }}>{assignedWarehouse}</strong>
                  </div>

                  <div style={{ background: 'var(--page-bg)', padding: '10px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, display: 'block' }}>
                      Assigned Vehicle:
                    </span>
                    <strong className="font-mono" style={{ color: linkedVehicle ? 'var(--primary)' : 'var(--text-muted)', fontSize: 13 }}>
                      {linkedVehicle ? `${linkedVehicle.vehicleNumber} (${linkedVehicle.model})` : 'Not Assigned'}
                    </strong>
                  </div>

                  <div style={{ background: 'var(--page-bg)', padding: '10px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, display: 'block' }}>
                      Current Active Shipment:
                    </span>
                    {currentShipmentNumber ? (
                      <span className="badge badge-blue font-mono" style={{ fontWeight: 700, fontSize: 12 }}>
                        {currentShipmentNumber}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>No active shipment</span>
                    )}
                  </div>

                  <div style={{ background: 'var(--page-bg)', padding: '10px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, display: 'block' }}>
                      Driver Availability:
                    </span>
                    <span style={{ fontWeight: 600, color: isAvailable ? 'var(--success)' : 'var(--text-primary)' }}>
                      {availabilityText}
                    </span>
                  </div>
                </div>

                <p style={{ margin: '10px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>
                  ℹ️ Operational shipment assignment is performed by the Warehouse Manager at dispatch. Admin maintains company-wide driver master records.
                </p>
              </div>

              {/* Contact & Verification Info */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 14,
                }}
              >
                {/* Contact Information */}
                <div
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    background: 'var(--card-bg)',
                  }}
                >
                  <h4
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      margin: '0 0 10px',
                    }}
                  >
                    Contact Details
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Mail size={14} color="var(--primary)" />
                      <span className="font-mono" style={{ fontSize: 12 }}>
                        {selectedDriver.email}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Phone size={14} color="var(--success)" />
                      <span>{selectedDriver.phone}</span>
                    </div>
                    {selectedDriver.address && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 4 }}>
                        <MapPin size={14} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          {selectedDriver.address}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* License Information */}
                <div
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    background: 'var(--card-bg)',
                  }}
                >
                  <h4
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      margin: '0 0 10px',
                    }}
                  >
                    License & Timestamps
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>License No:</span>{' '}
                      <strong className="font-mono">{selectedDriver.licenseNumber}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Expiry Date:</span>{' '}
                      <strong>{formatDate(selectedDriver.licenseExpiryDate)}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Registered On:</span>{' '}
                      <span>{formatDateTime(selectedDriver.createdAt)}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Last Updated:</span>{' '}
                      <span>{formatDateTime(selectedDriver.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assigned Shipments */}
              <div
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  background: 'var(--card-bg)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h4
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <Truck size={16} color="var(--primary)" />
                    Assigned Deliveries ({selectedDriver.assignedShipmentsCount || 0})
                  </h4>
                </div>

                {selectedDriver.assignedShipmentNumbers && selectedDriver.assignedShipmentNumbers.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selectedDriver.assignedShipmentNumbers.map((trk) => (
                      <div
                        key={trk}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          background: 'var(--page-bg)',
                          borderRadius: 'var(--radius)',
                          border: '1px solid var(--border)',
                          fontSize: 13,
                        }}
                      >
                        <span className="font-mono" style={{ fontWeight: 700, color: 'var(--primary)' }}>
                          {trk}
                        </span>
                        <span className="badge badge-blue" style={{ fontSize: 11 }}>
                          Dispatched
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
                    No shipments are currently assigned to this driver. When this driver is assigned by a Warehouse Manager, linked deliveries will appear here automatically.
                  </p>
                )}
              </div>

              {/* Quick Actions */}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                  onClick={() => {
                    handleCloseDrawer();
                    handleOpenEditModal(selectedDriver);
                  }}
                >
                  <Edit3 size={14} /> Edit Driver Master Data
                </button>
                <button
                  className="btn btn-outline text-danger"
                  style={{ flex: 1 }}
                  onClick={() => {
                    handleCloseDrawer();
                    setDriverToDelete(selectedDriver);
                  }}
                >
                  <Trash2 size={14} /> Deactivate Driver
                </button>
              </div>
            </div>
          );
        })()}
      </Drawer>

      {/* ── DELETE DRIVER CONFIRMATION MODAL ────────────────────────────── */}
      {driverToDelete && (
        <Modal
          title="Delete Driver?"
          isOpen={!!driverToDelete}
          onClose={() => !isDeleting && setDriverToDelete(null)}
          size="sm"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  background: 'var(--danger-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--danger)',
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={22} />
              </div>
              <div>
                <p style={{ margin: '0 0 6px', fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>
                  Are you sure you want to remove this driver?
                </p>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  This action cannot be undone. If <strong>{driverToDelete.fullName}</strong> is currently assigned to an active delivery, deletion will be safely rejected.
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
                marginTop: 10,
                paddingTop: 14,
                borderTop: '1px solid var(--border)',
              }}
            >
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setDriverToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Driver'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
