import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search, Plus, Eye, Edit2, UserCheck, UserX,
  Building, Phone, Mail, MapPin, Package, RefreshCw,
  Calendar, AlertCircle, Clock, ShieldCheck, CheckCircle2
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import Drawer from '../../components/common/Drawer';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/States';
import { useToast } from '../../components/common/Toast';
import customerService from '../../services/customerService';
import type { Customer, CustomerDetail, CustomerStatus } from '../../types/customer';
import {
  validateFullName,
  validateEmail,
  validateIndianPhone,
  formatIndianPhone,
} from '../../utils/validation';

export default function AdminCustomers() {
  const { showToast } = useToast();

  // ── STATE ─────────────────────────────────────────────────────────────
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(6);

  // View Customer Drawer State
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<CustomerDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Add Customer Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submittingAdd, setSubmittingAdd] = useState(false);
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});
  const [newCustomer, setNewCustomer] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
  });

  // Edit Customer Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [editCustomer, setEditCustomer] = useState<{
    id: number | string;
    fullName: string;
    email: string;
    phone: string;
    companyName: string;
    status: CustomerStatus;
  } | null>(null);

  // Safe Deactivation / Reactivation Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    customer: Customer | null;
    actionType: 'DEACTIVATE' | 'ACTIVATE';
    submitting: boolean;
  }>({
    isOpen: false,
    customer: null,
    actionType: 'DEACTIVATE',
    submitting: false,
  });

  // ── DATA FETCHING ─────────────────────────────────────────────────────
  const loadCustomers = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const data = await customerService.getAllCustomers();
      setCustomers(data);
    } catch (err: any) {
      console.error('Failed to load customers:', err);
      setError('Unable to load customers. Please try again.');
      showToast('error', 'Data Error', 'Failed to retrieve customer accounts.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // Load detailed customer information for drawer
  const handleViewCustomer = async (customerId: number | string) => {
    setSelectedCustomerId(customerId);
    setSelectedDetail(null);
    setLoadingDetail(true);

    try {
      const detail = await customerService.getCustomerById(customerId);
      setSelectedDetail(detail);
    } catch (err: any) {
      console.error('Failed to fetch customer details:', err);
      showToast('error', 'Fetch Failed', 'Unable to load customer detailed profile.');
      setSelectedCustomerId(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  // ── FILTER & SEARCH ───────────────────────────────────────────────────
  const filteredCustomers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return customers.filter((c) => {
      const name = (c.fullName || c.name || '').toLowerCase();
      const email = (c.email || '').toLowerCase();
      const phone = (c.phone || '').toLowerCase();
      const company = (c.companyName || c.company || '').toLowerCase();

      const matchSearch =
        !q ||
        name.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        company.includes(q);

      const matchStatus =
        statusFilter === 'ALL' || c.status?.toUpperCase() === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [customers, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
  const safePage = Math.max(1, Math.min(page, totalPages));

  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [page, totalPages]);

  const paginatedCustomers = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, safePage, pageSize]);

  // ── ACTIONS ───────────────────────────────────────────────────────────

  // Add Customer Submit
  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const nameRes = validateFullName(newCustomer.fullName, 'Full Name');
    if (!nameRes.isValid) errors.fullName = nameRes.error!;

    const emailRes = validateEmail(newCustomer.email);
    if (!emailRes.isValid) {
      errors.email = emailRes.error!;
    } else if (customers.some((c) => c.email.toLowerCase() === newCustomer.email.trim().toLowerCase())) {
      errors.email = 'A customer account with this email address already exists.';
    }

    const phoneRes = validateIndianPhone(newCustomer.phone);
    if (!phoneRes.isValid) errors.phone = phoneRes.error!;

    if (Object.keys(errors).length > 0) {
      setAddErrors(errors);
      showToast('error', 'Validation Error', 'Please correct the highlighted fields.');
      return;
    }
    setAddErrors({});

    try {
      setSubmittingAdd(true);
      const formattedPhone = formatIndianPhone(newCustomer.phone);
      const created = await customerService.createCustomer({
        fullName: newCustomer.fullName.trim(),
        email: newCustomer.email.trim().toLowerCase(),
        phone: formattedPhone,
        companyName: newCustomer.companyName.trim() || undefined,
      });

      showToast('success', 'Customer Added', `${created.fullName || created.name} registered successfully.`);
      setIsAddOpen(false);
      setNewCustomer({ fullName: '', email: '', phone: '', companyName: '' });
      await loadCustomers(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create customer account.';
      showToast('error', 'Creation Error', msg);
    } finally {
      setSubmittingAdd(false);
    }
  };

  // Open Edit Customer Modal
  const handleOpenEdit = (c: Customer) => {
    setEditCustomer({
      id: c.id,
      fullName: c.fullName || c.name || '',
      email: c.email || '',
      phone: c.phone || '',
      companyName: c.companyName || c.company || '',
      status: c.status,
    });
    setEditErrors({});
    setIsEditOpen(true);
  };

  // Edit Customer Submit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCustomer) return;

    const errors: Record<string, string> = {};

    const nameRes = validateFullName(editCustomer.fullName, 'Full Name');
    if (!nameRes.isValid) errors.fullName = nameRes.error!;

    const emailRes = validateEmail(editCustomer.email);
    if (!emailRes.isValid) {
      errors.email = emailRes.error!;
    } else if (
      customers.some(
        (c) =>
          c.id !== editCustomer.id &&
          c.email.toLowerCase() === editCustomer.email.trim().toLowerCase()
      )
    ) {
      errors.email = 'This email address is already in use by another customer.';
    }

    const phoneRes = validateIndianPhone(editCustomer.phone);
    if (!phoneRes.isValid) errors.phone = phoneRes.error!;

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      showToast('error', 'Validation Error', 'Please check the entered customer details.');
      return;
    }
    setEditErrors({});

    try {
      setSubmittingEdit(true);
      const formattedPhone = formatIndianPhone(editCustomer.phone);
      const updated = await customerService.updateCustomer(editCustomer.id, {
        fullName: editCustomer.fullName.trim(),
        email: editCustomer.email.trim().toLowerCase(),
        phone: formattedPhone,
        companyName: editCustomer.companyName.trim() || undefined,
        status: editCustomer.status,
      });

      showToast('success', 'Customer Updated', `${updated.fullName || updated.name} updated successfully.`);
      setIsEditOpen(false);
      setEditCustomer(null);

      // Refresh data
      await loadCustomers(true);

      // If drawer is open for this customer, refresh it
      if (selectedCustomerId === editCustomer.id) {
        handleViewCustomer(editCustomer.id);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update customer details.';
      showToast('error', 'Update Error', msg);
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Open Deactivate / Reactivate Modal
  const handleOpenConfirmStatus = (c: Customer) => {
    const isCurrentlyActive = c.status === 'ACTIVE';
    setConfirmModal({
      isOpen: true,
      customer: c,
      actionType: isCurrentlyActive ? 'DEACTIVATE' : 'ACTIVATE',
      submitting: false,
    });
  };

  // Execute Deactivation / Reactivation
  const handleExecuteStatusChange = async () => {
    if (!confirmModal.customer) return;

    try {
      setConfirmModal((prev) => ({ ...prev, submitting: true }));
      const targetId = confirmModal.customer.id;

      if (confirmModal.actionType === 'DEACTIVATE') {
        await customerService.deactivateCustomer(targetId);
        showToast(
          'info',
          'Customer Deactivated',
          `${confirmModal.customer.fullName || confirmModal.customer.name} has been deactivated. Historical records remain preserved.`
        );
      } else {
        await customerService.toggleCustomerStatus(targetId);
        showToast(
          'success',
          'Customer Reactivated',
          `${confirmModal.customer.fullName || confirmModal.customer.name} has been reactivated.`
        );
      }

      setConfirmModal({ isOpen: false, customer: null, actionType: 'DEACTIVATE', submitting: false });
      await loadCustomers(true);

      if (selectedCustomerId === targetId) {
        handleViewCustomer(targetId);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update customer status.';
      showToast('error', 'Action Failed', msg);
      setConfirmModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  // Helpers
  const getInitials = (name?: string) => {
    if (!name) return 'CU';
    return (
      name
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'CU'
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 className="page-title" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
            Customers
          </h2>
          <p className="page-subtitle" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Real-time directory of verified business shippers, corporate clients, and individual accounts.
          </p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => loadCustomers(true)}
            disabled={loading || refreshing}
            title="Refresh Customer Directory"
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setIsAddOpen(true)}>
            <Plus size={14} /> Add Customer
          </button>
        </div>
      </div>

      {/* Toolbar: Search & Status Filter */}
      <div className="toolbar" style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="search-box" style={{ flex: 1, minWidth: 260, position: 'relative' }}>
          <Search size={16} className="search-box-icon" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="search-input"
            style={{ width: '100%', paddingLeft: 36, height: 38, borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
            placeholder="Search by customer name, email, phone, company..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <select
          className="filter-select"
          style={{ height: 38, borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '0 12px' }}
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as any);
            setPage(1);
          }}
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active Accounts</option>
          <option value="INACTIVE">Inactive / Deactivated</option>
        </select>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            borderRadius: 'var(--radius)',
            padding: '12px 16px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <AlertCircle size={18} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>{error}</span>
          <button
            onClick={() => loadCustomers()}
            style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#b91c1c', textDecoration: 'underline', cursor: 'pointer', fontSize: 12 }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Customers Table Wrapper */}
      <div className="table-container table-wrapper" style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        {loading ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px', display: 'block', color: 'var(--primary)' }} />
            <p style={{ fontWeight: 500, fontSize: 14 }}>Loading customer directory...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div style={{ padding: '40px 20px' }}>
            <EmptyState
              title="No customers found"
              description={search ? 'No registered customers match your search criteria.' : 'No customers are currently on file.'}
            />
          </div>
        ) : (
          <div className="table-container" style={{ width: '100%', maxWidth: '100%' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', width: '28%' }}>Customer</th>
                  <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', width: '24%' }}>Email</th>
                  <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center', width: '12%' }}>Orders</th>
                  <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center', width: '14%' }}>Active Shipments</th>
                  <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center', width: '10%' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center', width: '12%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCustomers.map((c) => {
                  const displayName = c.fullName || c.name || 'Customer';
                  const initials = getInitials(displayName);
                  const isInactive = c.status?.toUpperCase() === 'INACTIVE';

                  return (
                    <tr
                      key={c.id}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        opacity: isInactive ? 0.75 : 1,
                        transition: 'background-color 0.15s',
                      }}
                    >
                      {/* 1. Customer Name & Initials */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: isInactive ? '#e2e8f0' : 'rgba(37, 99, 235, 0.12)',
                              color: isInactive ? '#64748b' : '#2563eb',
                              fontWeight: 700,
                              fontSize: 11,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {initials}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, color: '#0f172a', fontSize: 13, margin: 0 }}>
                              {displayName}
                            </p>
                            {c.companyName && (
                              <span style={{ fontSize: 11, color: '#64748b' }}>
                                {c.companyName}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 2. Email */}
                      <td style={{ padding: '12px 16px', fontSize: 12, color: '#475569' }}>
                        <span className="table-text-mono">{c.email}</span>
                      </td>

                      {/* 3. Orders Count */}
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, fontSize: 13 }}>
                        <span className="badge badge-slate" style={{ fontSize: 11 }}>
                          {c.totalOrders || 0}
                        </span>
                      </td>

                      {/* 4. Active Shipments Count */}
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, fontSize: 13 }}>
                        <span className={`badge ${(c.totalShipments || 0) > 0 ? 'badge-blue' : 'badge-slate'}`} style={{ fontSize: 11 }}>
                          {c.totalShipments || 0} active
                        </span>
                      </td>

                      {/* 5. Status Badge */}
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <StatusBadge status={c.status || 'ACTIVE'} />
                      </td>

                      {/* 6. Actions */}
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          <button
                            className="btn btn-outline btn-xs"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px' }}
                            title="View Customer Profile & History"
                            onClick={() => handleViewCustomer(c.id)}
                          >
                            <Eye size={12} />
                            <span>View</span>
                          </button>

                          <button
                            className="btn-icon btn-xs"
                            title="Edit Customer"
                            onClick={() => handleOpenEdit(c)}
                          >
                            <Edit2 size={14} />
                          </button>

                          <button
                            className="btn-icon"
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 6,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '1px solid var(--border)',
                              background: '#fff',
                              color: isInactive ? '#16a34a' : '#dc2626',
                              cursor: 'pointer',
                            }}
                            title={isInactive ? 'Reactivate Customer' : 'Deactivate Customer'}
                            onClick={() => handleOpenConfirmStatus(c)}
                          >
                            {isInactive ? <UserCheck size={14} /> : <UserX size={14} />}
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

        {/* Pagination */}
        {filteredCustomers.length > pageSize && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
            <Pagination
              page={page}
              pageSize={pageSize}
              total={filteredCustomers.length}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* ── VIEW CUSTOMER DETAILS DRAWER ─────────────────────────────────── */}
      <Drawer
        isOpen={!!selectedCustomerId}
        onClose={() => {
          setSelectedCustomerId(null);
          setSelectedDetail(null);
        }}
        title={selectedDetail ? (selectedDetail.fullName || selectedDetail.name || 'Customer Details') : 'Customer Details'}
        subtitle={selectedDetail ? `Customer Account #${selectedDetail.id} • Joined ${formatDate(selectedDetail.createdAt)}` : 'Loading...'}
        size="lg"
      >
        {loadingDetail ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px', display: 'block', color: 'var(--primary)' }} />
            <p style={{ fontSize: 13 }}>Retrieving customer account details...</p>
          </div>
        ) : selectedDetail ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '4px 0' }}>
            {/* Business Overview KPI Grid */}
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 12 }}>
                Business Overview
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Package size={12} /> Total Orders
                  </p>
                  <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    {selectedDetail.totalOrders || 0}
                  </p>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} /> Active Shipments
                  </p>
                  <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)', margin: 0 }}>
                    {selectedDetail.activeShipments || 0}
                  </p>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={12} /> Delivered
                  </p>
                  <p style={{ fontSize: 20, fontWeight: 700, color: '#16a34a', margin: 0 }}>
                    {selectedDetail.deliveredShipments || 0}
                  </p>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                    Total Booking Value
                  </p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    ₹{(selectedDetail.totalSpent || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Information Details */}
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 12 }}>
                Customer Information
              </h4>
              <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Full Name</span>
                  <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>{selectedDetail.fullName || selectedDetail.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Email Address</span>
                  <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 }}>{selectedDetail.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Phone</span>
                  <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 }}>{selectedDetail.phone ? formatIndianPhone(selectedDetail.phone) : '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Company Organization</span>
                  <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>{selectedDetail.companyName || selectedDetail.company || 'Individual Shipper'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Account Status</span>
                  <StatusBadge status={selectedDetail.status || 'ACTIVE'} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Registration Date</span>
                  <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{formatDate(selectedDetail.createdAt)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Last Password Change</span>
                  <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>
                    {selectedDetail.lastPasswordChange ? formatDate(selectedDetail.lastPasswordChange) : 'Initial Registration'}
                  </span>
                </div>
              </div>
            </div>

            {/* Saved Addresses */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', margin: 0 }}>
                  Saved Addresses ({selectedDetail.addresses?.length || 0})
                </h4>
              </div>

              {!selectedDetail.addresses || selectedDetail.addresses.length === 0 ? (
                <div style={{ background: '#f8fafc', border: '1px dashed var(--border)', borderRadius: 8, padding: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                  <MapPin size={20} style={{ margin: '0 auto 6px', display: 'block', opacity: 0.5 }} />
                  No registered addresses saved for this customer yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {selectedDetail.addresses.map((addr) => (
                    <div
                      key={addr.id}
                      style={{
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        padding: 12,
                        background: addr.defaultAddress ? 'rgba(37, 99, 235, 0.04)' : '#fff',
                        position: 'relative',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', background: 'rgba(37, 99, 235, 0.1)', padding: '2px 6px', borderRadius: 4 }}>
                          {addr.addressType}
                        </span>
                        {addr.defaultAddress && (
                          <span style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 600 }}>Default Address</span>
                        )}
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-primary)', margin: '0 0 4px 0', lineHeight: 1.4 }}>
                        {addr.addressLine1} {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>
                        {addr.city}, {addr.state} — {addr.postalCode}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                        Contact: {addr.contactName} ({formatIndianPhone(addr.phone)})
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Orders */}
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 12 }}>
                Recent Orders ({selectedDetail.recentOrders?.length || 0})
              </h4>

              {!selectedDetail.recentOrders || selectedDetail.recentOrders.length === 0 ? (
                <div style={{ background: '#f8fafc', border: '1px dashed var(--border)', borderRadius: 8, padding: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                  <Package size={20} style={{ margin: '0 auto 6px', display: 'block', opacity: 0.5 }} />
                  No orders yet on file for this customer.
                </div>
              ) : (
                <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                        <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Order #</th>
                        <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Date</th>
                        <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Destination</th>
                        <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Amount</th>
                        <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDetail.recentOrders.map((ord) => (
                        <tr key={ord.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--primary)' }}>
                            {ord.orderNumber}
                          </td>
                          <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>
                            {formatDate(ord.createdAt)}
                          </td>
                          <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>
                            {ord.destinationCity || '—'}
                          </td>
                          <td style={{ padding: '8px 12px', fontWeight: 600 }}>
                            {ord.totalAmount != null ? `₹${ord.totalAmount.toLocaleString('en-IN')}` : '—'}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            <StatusBadge status={ord.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Drawer>

      {/* ── ADD CUSTOMER MODAL ───────────────────────────────────────────── */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => {
          if (!submittingAdd) {
            setIsAddOpen(false);
            setAddErrors({});
          }
        }}
        title="Add New Customer Account"
        size="md"
      >
        <form onSubmit={handleAddCustomer}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            Create a new verified customer account. The customer can log in to the Customer Portal using their email.
          </p>

          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label form-label-required" style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>
              Full Name
            </label>
            <input
              type="text"
              className={`form-input ${addErrors.fullName ? 'error' : ''}`}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius)',
                border: addErrors.fullName ? '1px solid #dc2626' : '1px solid var(--border)',
                fontSize: 13,
              }}
              value={newCustomer.fullName}
              onChange={(e) => {
                setNewCustomer({ ...newCustomer, fullName: e.target.value });
                if (addErrors.fullName) setAddErrors((prev) => ({ ...prev, fullName: '' }));
              }}
              placeholder="e.g. Vikramaditya Rout"
            />
            {addErrors.fullName && (
              <p style={{ color: '#dc2626', fontSize: 12, marginTop: 4, margin: 0 }}>{addErrors.fullName}</p>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label form-label-required" style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>
              Email Address
            </label>
            <input
              type="email"
              className={`form-input ${addErrors.email ? 'error' : ''}`}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius)',
                border: addErrors.email ? '1px solid #dc2626' : '1px solid var(--border)',
                fontSize: 13,
              }}
              value={newCustomer.email}
              onChange={(e) => {
                setNewCustomer({ ...newCustomer, email: e.target.value });
                if (addErrors.email) setAddErrors((prev) => ({ ...prev, email: '' }));
              }}
              placeholder="e.g. vikram.rout@enterprise.in"
            />
            {addErrors.email && (
              <p style={{ color: '#dc2626', fontSize: 12, marginTop: 4, margin: 0 }}>{addErrors.email}</p>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label form-label-required" style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>
              Phone Number (Indian 10-Digit Mobile)
            </label>
            <input
              type="text"
              className={`form-input ${addErrors.phone ? 'error' : ''}`}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius)',
                border: addErrors.phone ? '1px solid #dc2626' : '1px solid var(--border)',
                fontSize: 13,
              }}
              placeholder="+91 9876543210 or 9876543210"
              value={newCustomer.phone}
              onChange={(e) => {
                setNewCustomer({ ...newCustomer, phone: e.target.value });
                if (addErrors.phone) setAddErrors((prev) => ({ ...prev, phone: '' }));
              }}
            />
            {addErrors.phone && (
              <p style={{ color: '#dc2626', fontSize: 12, marginTop: 4, margin: 0 }}>{addErrors.phone}</p>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label" style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>
              Company / Business Organization (Optional)
            </label>
            <input
              type="text"
              className="form-input"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                fontSize: 13,
              }}
              value={newCustomer.companyName}
              onChange={(e) => setNewCustomer({ ...newCustomer, companyName: e.target.value })}
              placeholder="e.g. Prime Freight & Industrial Supplies Ltd."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setIsAddOpen(false)}
              disabled={submittingAdd}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={submittingAdd}
            >
              {submittingAdd ? 'Creating Customer...' : 'Save & Register Customer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── EDIT CUSTOMER MODAL ──────────────────────────────────────────── */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => {
          if (!submittingEdit) {
            setIsEditOpen(false);
            setEditCustomer(null);
            setEditErrors({});
          }
        }}
        title="Edit Customer Profile"
        size="md"
      >
        {editCustomer && (
          <form onSubmit={handleSaveEdit}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              Update verified information for customer #{editCustomer.id}. Passwords cannot be exposed or modified from this administrative form.
            </p>

            <div className="form-group" style={{ marginBottom: 14 }}>
              <label className="form-label form-label-required" style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>
                Full Name
              </label>
              <input
                type="text"
                className={`form-input ${editErrors.fullName ? 'error' : ''}`}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius)',
                  border: editErrors.fullName ? '1px solid #dc2626' : '1px solid var(--border)',
                  fontSize: 13,
                }}
                value={editCustomer.fullName}
                onChange={(e) => {
                  setEditCustomer({ ...editCustomer, fullName: e.target.value });
                  if (editErrors.fullName) setEditErrors((prev) => ({ ...prev, fullName: '' }));
                }}
              />
              {editErrors.fullName && (
                <p style={{ color: '#dc2626', fontSize: 12, marginTop: 4, margin: 0 }}>{editErrors.fullName}</p>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: 14 }}>
              <label className="form-label form-label-required" style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>
                Email Address
              </label>
              <input
                type="email"
                className={`form-input ${editErrors.email ? 'error' : ''}`}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius)',
                  border: editErrors.email ? '1px solid #dc2626' : '1px solid var(--border)',
                  fontSize: 13,
                }}
                value={editCustomer.email}
                onChange={(e) => {
                  setEditCustomer({ ...editCustomer, email: e.target.value });
                  if (editErrors.email) setEditErrors((prev) => ({ ...prev, email: '' }));
                }}
              />
              {editErrors.email && (
                <p style={{ color: '#dc2626', fontSize: 12, marginTop: 4, margin: 0 }}>{editErrors.email}</p>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: 14 }}>
              <label className="form-label form-label-required" style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>
                Phone Number
              </label>
              <input
                type="text"
                className={`form-input ${editErrors.phone ? 'error' : ''}`}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius)',
                  border: editErrors.phone ? '1px solid #dc2626' : '1px solid var(--border)',
                  fontSize: 13,
                }}
                value={editCustomer.phone}
                onChange={(e) => {
                  setEditCustomer({ ...editCustomer, phone: e.target.value });
                  if (editErrors.phone) setEditErrors((prev) => ({ ...prev, phone: '' }));
                }}
              />
              {editErrors.phone && (
                <p style={{ color: '#dc2626', fontSize: 12, marginTop: 4, margin: 0 }}>{editErrors.phone}</p>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: 14 }}>
              <label className="form-label" style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>
                Company Organization
              </label>
              <input
                type="text"
                className="form-input"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  fontSize: 13,
                }}
                value={editCustomer.companyName}
                onChange={(e) => setEditCustomer({ ...editCustomer, companyName: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label" style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>
                Account Status
              </label>
              <select
                className="form-select"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  fontSize: 13,
                }}
                value={editCustomer.status}
                onChange={(e) => setEditCustomer({ ...editCustomer, status: e.target.value as CustomerStatus })}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setIsEditOpen(false)}
                disabled={submittingEdit}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={submittingEdit}
              >
                {submittingEdit ? 'Saving Changes...' : 'Update Customer'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── SAFE DEACTIVATE / REACTIVATE CONFIRMATION MODAL ──────────────── */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => {
          if (!confirmModal.submitting) {
            setConfirmModal({ isOpen: false, customer: null, actionType: 'DEACTIVATE', submitting: false });
          }
        }}
        title={confirmModal.actionType === 'DEACTIVATE' ? 'Deactivate Customer Account?' : 'Reactivate Customer Account?'}
        size="sm"
      >
        <div style={{ padding: '6px 0' }}>
          {confirmModal.actionType === 'DEACTIVATE' ? (
            <div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>
                Are you sure you want to deactivate{' '}
                <strong style={{ color: 'var(--text-primary)' }}>
                  {confirmModal.customer?.fullName || confirmModal.customer?.name}
                </strong>
                ?
              </p>
              <div
                style={{
                  background: '#fffbeb',
                  border: '1px solid #fef3c7',
                  borderRadius: 6,
                  padding: '10px 12px',
                  marginBottom: 16,
                  fontSize: 12,
                  color: '#92400e',
                  lineHeight: 1.4,
                }}
              >
                This will prevent the customer from logging into the portal. Their historical orders, invoices, and shipment records will remain available for operational and reporting purposes.
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
              Reactivating{' '}
              <strong style={{ color: 'var(--text-primary)' }}>
                {confirmModal.customer?.fullName || confirmModal.customer?.name}
              </strong>{' '}
              will restore their Customer Portal login access immediately.
            </p>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setConfirmModal({ isOpen: false, customer: null, actionType: 'DEACTIVATE', submitting: false })}
              disabled={confirmModal.submitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className={confirmModal.actionType === 'DEACTIVATE' ? 'btn btn-danger btn-sm' : 'btn btn-primary btn-sm'}
              style={
                confirmModal.actionType === 'DEACTIVATE'
                  ? { background: '#dc2626', color: '#fff', border: 'none' }
                  : {}
              }
              onClick={handleExecuteStatusChange}
              disabled={confirmModal.submitting}
            >
              {confirmModal.submitting
                ? 'Processing...'
                : confirmModal.actionType === 'DEACTIVATE'
                ? 'Deactivate Customer'
                : 'Reactivate Customer'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
