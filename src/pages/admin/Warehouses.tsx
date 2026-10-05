import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Warehouse as WarehouseIcon,
  MapPin,
  User,
  Mail,
  Phone,
  Plus,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Eye,
  Edit3,
  Power,
  Layers,
  BarChart3,
  ShieldCheck,
  TrendingUp,
  SlidersHorizontal,
  ChevronDown,
  Navigation,
  CheckCircle2,
  XCircle,
  Building2,
  Boxes,
  Truck,
  ArrowDownLeft,
  ArrowUpRight,
  Route as RouteIcon,
  Calendar
} from 'lucide-react';

import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import Drawer from '../../components/common/Drawer';
import { useToast } from '../../components/common/Toast';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/States';
import InteractiveWarehouseMap from '../../components/warehouses/InteractiveWarehouseMap';
import { warehouseService } from '../../services/warehouseService';
import type {
  Warehouse,
  WarehouseStatus,
  WarehouseType,
  CreateWarehousePayload,
  UpdateWarehousePayload,
} from '../../types/warehouse';
import {
  validateRequired,
  validateFullName,
  validateIndianPhone,
  validatePositiveNumber,
  formatIndianPhone,
} from '../../utils/validation';

// Coordinate & City Presets for fast Indian hub creation
const CITY_PRESETS: Record<string, { city: string; state: string; lat: number; lng: number; postalCode: string }> = {
  'Bengaluru': { city: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946, postalCode: '560066' },
  'Mumbai': { city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777, postalCode: '400093' },
  'Delhi NCR': { city: 'Gurugram', state: 'Haryana', lat: 28.4595, lng: 77.0266, postalCode: '122001' },
  'Chennai': { city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, postalCode: '600057' },
  'Hyderabad': { city: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867, postalCode: '500409' },
  'Kolkata': { city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, postalCode: '712311' },
  'Pune': { city: 'Pune', state: 'Maharashtra', lat: 18.7606, lng: 73.8643, postalCode: '410501' },
  'Ahmedabad': { city: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714, postalCode: '382443' },
};

function formatTypeLabel(type?: string) {
  if (!type) return 'Distribution Center';
  return type
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getManagerInitials(name?: string): string {
  if (!name) return 'WH';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function AdminWarehouses() {
  const { showToast } = useToast();

  // Primary Data State
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | WarehouseStatus>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | WarehouseType>('ALL');
  const [utilizationFilter, setUtilizationFilter] = useState<'ALL' | 'NORMAL' | 'HIGH' | 'NEAR_CAPACITY'>('ALL');

  // Map & Drawer States
  const [showMap, setShowMap] = useState<boolean>(true);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [deactivateModal, setDeactivateModal] = useState<{
    isOpen: boolean;
    warehouse: Warehouse | null;
    submitting: boolean;
  }>({
    isOpen: false,
    warehouse: null,
    submitting: false,
  });

  // Add / Edit Form States
  const [formData, setFormData] = useState<CreateWarehousePayload>({
    warehouseCode: '',
    warehouseName: '',
    warehouseType: 'DISTRIBUTION_CENTER',
    status: 'ACTIVE',
    managerName: '',
    managerPhone: '',
    managerEmail: '',
    addressLine1: '',
    addressLine2: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560066',
    country: 'India',
    latitude: 12.9716,
    longitude: 77.5946,
    totalCapacity: 5000,
    occupiedCapacity: 0,
    capacityUnit: 'KG',
    operatingHours: 'Mon–Sat, 06:00 AM – 10:00 PM',
    contactPhone: '+91 80 4455 6600',
    contactEmail: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submittingForm, setSubmittingForm] = useState(false);

  // 1. Fetch Warehouses
  const loadWarehouses = useCallback(async (isSilent = false) => {
    try {
      if (isSilent) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const data = await warehouseService.getAllWarehouses();
      setWarehouses(data);

      // Keep selected warehouse in sync if drawer is open
      if (selectedWarehouse) {
        const updated = data.find((w) => w.id === selectedWarehouse.id);
        if (updated) setSelectedWarehouse(updated);
      }
    } catch (err: any) {
      console.error('Failed to load warehouses:', err);
      setError('Unable to load warehouse data. Please check your network and try again.');
      showToast('error', 'Warehouse Error', 'Could not retrieve facility directory.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast, selectedWarehouse]);

  useEffect(() => {
    loadWarehouses();
  }, []);

  // 2. Summary KPI Metrics (Dynamically Calculated)
  const stats = useMemo(() => {
    const total = warehouses.length;
    const active = warehouses.filter((w) => w.status === 'ACTIVE').length;

    let totalCap = 0;
    let totalOcc = 0;
    let nearCapCount = 0;

    warehouses.forEach((w) => {
      const cap = Number(w.totalCapacity) || 0;
      const occ = Number(w.occupiedCapacity) || 0;
      totalCap += cap;
      totalOcc += occ;
      const util = w.utilizationRate ?? (cap > 0 ? (occ / cap) * 100 : 0);
      if (util >= 90) nearCapCount++;
    });

    const avgUtil = totalCap > 0 ? Math.round((totalOcc / totalCap) * 1000) / 10 : 0;

    return {
      total,
      active,
      totalCapacity: totalCap,
      avgUtilization: avgUtil,
      nearCapacity: nearCapCount,
    };
  }, [warehouses]);

  // 3. Filtered Warehouses
  const filteredWarehouses = useMemo(() => {
    return warehouses.filter((w) => {
      // Search
      const q = search.trim().toLowerCase();
      if (q) {
        const matchesName = (w.warehouseName || '').toLowerCase().includes(q);
        const matchesCode = (w.warehouseCode || '').toLowerCase().includes(q);
        const matchesCity = (w.city || '').toLowerCase().includes(q);
        const matchesState = (w.state || '').toLowerCase().includes(q);
        const matchesMgr = (w.managerName || '').toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesCity && !matchesState && !matchesMgr) {
          return false;
        }
      }

      // Status
      if (statusFilter !== 'ALL' && w.status !== statusFilter) {
        return false;
      }

      // Type
      if (typeFilter !== 'ALL' && w.warehouseType !== typeFilter) {
        return false;
      }

      // Utilization Filter
      const util = w.utilizationRate ?? 0;
      if (utilizationFilter === 'NORMAL' && util >= 70) return false;
      if (utilizationFilter === 'HIGH' && (util < 70 || util >= 90)) return false;
      if (utilizationFilter === 'NEAR_CAPACITY' && util < 90) return false;

      return true;
    });
  }, [warehouses, search, statusFilter, typeFilter, utilizationFilter]);

  // Handle Preset Selection in Add/Edit form
  const handleCityPresetChange = (cityName: string) => {
    const preset = CITY_PRESETS[cityName];
    if (preset) {
      setFormData((prev) => ({
        ...prev,
        city: preset.city,
        state: preset.state,
        postalCode: preset.postalCode,
        latitude: preset.lat,
        longitude: preset.lng,
      }));
    }
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    // Generate next sequential code
    const nextNum = String(warehouses.length + 1).padStart(3, '0');
    setFormData({
      warehouseCode: `WH-HUB-${nextNum}`,
      warehouseName: '',
      warehouseType: 'DISTRIBUTION_CENTER',
      status: 'ACTIVE',
      managerName: '',
      managerPhone: '+91 98000 11223',
      managerEmail: '',
      addressLine1: '',
      addressLine2: '',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560066',
      country: 'India',
      latitude: 12.9716,
      longitude: 77.5946,
      totalCapacity: 5000,
      occupiedCapacity: 0,
      capacityUnit: 'KG',
      operatingHours: 'Mon–Sat, 06:00 AM – 10:00 PM',
      contactPhone: '+91 80 4455 6600',
      contactEmail: '',
    });
    setFormErrors({});
    setIsAddOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (w: Warehouse) => {
    // If drawer is open, close it first
    setIsDetailsOpen(false);
    setEditingWarehouse(w);
    setFormData({
      warehouseCode: w.warehouseCode || String(w.id),
      warehouseName: w.warehouseName || w.name || '',
      warehouseType: w.warehouseType || 'DISTRIBUTION_CENTER',
      status: w.status,
      managerName: w.managerName || w.manager || '',
      managerPhone: w.managerPhone || '',
      managerEmail: w.managerEmail || '',
      addressLine1: w.addressLine1 || w.location || '',
      addressLine2: w.addressLine2 || '',
      city: w.city,
      state: w.state,
      postalCode: w.postalCode || '',
      country: w.country || 'India',
      latitude: w.latitude ?? 20.5937,
      longitude: w.longitude ?? 78.9629,
      totalCapacity: w.totalCapacity,
      occupiedCapacity: w.occupiedCapacity || 0,
      capacityUnit: w.capacityUnit || 'KG',
      operatingHours: w.operatingHours || 'Mon–Sat, 06:00 AM – 10:00 PM',
      contactPhone: w.contactPhone || '',
      contactEmail: w.contactEmail || '',
    });
    setFormErrors({});
    setIsEditOpen(true);
  };

  // Open View Details Drawer
  const handleViewDetails = (w: Warehouse) => {
    setSelectedWarehouse(w);
    setIsDetailsOpen(true);
  };

  // Form Validation
  const validateWarehouseForm = (): boolean => {
    const errors: Record<string, string> = {};

    const codeRes = validateRequired(formData.warehouseCode, 'Warehouse code');
    if (!codeRes.isValid) errors.warehouseCode = codeRes.error!;

    const nameRes = validateRequired(formData.warehouseName, 'Warehouse facility name');
    if (!nameRes.isValid) errors.warehouseName = nameRes.error!;

    const addrRes = validateRequired(formData.addressLine1, 'Address line 1');
    if (!addrRes.isValid) errors.addressLine1 = addrRes.error!;

    const cityRes = validateRequired(formData.city, 'City');
    if (!cityRes.isValid) errors.city = cityRes.error!;

    const stateRes = validateRequired(formData.state, 'State');
    if (!stateRes.isValid) errors.state = stateRes.error!;

    const pinRes = validateRequired(formData.postalCode, 'Postal code');
    if (!pinRes.isValid) errors.postalCode = pinRes.error!;

    const mgrRes = validateFullName(formData.managerName);
    if (!mgrRes.isValid) errors.managerName = mgrRes.error!;

    if (formData.managerPhone) {
      const phRes = validateIndianPhone(formData.managerPhone);
      if (!phRes.isValid) errors.managerPhone = phRes.error!;
    }

    const capRes = validatePositiveNumber(formData.totalCapacity, 'Total capacity', 1);
    if (!capRes.isValid) errors.totalCapacity = capRes.error!;

    if (formData.occupiedCapacity != null && formData.occupiedCapacity > formData.totalCapacity) {
      errors.occupiedCapacity = 'Occupied capacity cannot exceed total capacity.';
    }

    if (formData.latitude != null && (formData.latitude < -90 || formData.latitude > 90)) {
      errors.latitude = 'Latitude must be between -90 and 90.';
    }

    if (formData.longitude != null && (formData.longitude < -180 || formData.longitude > 180)) {
      errors.longitude = 'Longitude must be between -180 and 180.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Save (Add)
  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateWarehouseForm()) {
      showToast('error', 'Validation Error', 'Please check highlighted fields.');
      return;
    }

    try {
      setSubmittingForm(true);
      const payload: CreateWarehousePayload = {
        ...formData,
        warehouseCode: formData.warehouseCode.trim().toUpperCase(),
        warehouseName: formData.warehouseName.trim(),
        addressLine1: formData.addressLine1.trim(),
        addressLine2: formData.addressLine2 ? formData.addressLine2.trim() : undefined,
        city: formData.city.trim(),
        state: formData.state.trim(),
        postalCode: formData.postalCode.trim(),
        managerName: formData.managerName.trim(),
        managerPhone: formData.managerPhone ? formatIndianPhone(formData.managerPhone) : undefined,
        managerEmail: formData.managerEmail ? formData.managerEmail.trim() : undefined,
      };

      const created = await warehouseService.createWarehouse(payload);
      showToast('success', 'Facility Registered', `${created.warehouseName} (${created.warehouseCode}) added.`);
      setIsAddOpen(false);
      await loadWarehouses(true);
    } catch (err: any) {
      console.error('Failed to create warehouse:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to register warehouse facility.';
      showToast('error', 'Registration Failed', msg);
    } finally {
      setSubmittingForm(false);
    }
  };

  // Handle Save (Edit)
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWarehouse || !validateWarehouseForm()) {
      showToast('error', 'Validation Error', 'Please check highlighted fields.');
      return;
    }

    try {
      setSubmittingForm(true);
      const payload: UpdateWarehousePayload = {
        ...formData,
        warehouseCode: formData.warehouseCode.trim().toUpperCase(),
        warehouseName: formData.warehouseName.trim(),
        addressLine1: formData.addressLine1.trim(),
        addressLine2: formData.addressLine2 ? formData.addressLine2.trim() : undefined,
        city: formData.city.trim(),
        state: formData.state.trim(),
        postalCode: formData.postalCode.trim(),
        managerName: formData.managerName.trim(),
        managerPhone: formData.managerPhone ? formatIndianPhone(formData.managerPhone) : undefined,
        managerEmail: formData.managerEmail ? formData.managerEmail.trim() : undefined,
      };

      const updated = await warehouseService.updateWarehouse(editingWarehouse.id, payload);
      showToast('success', 'Facility Updated', `${updated.warehouseName} details saved.`);
      setIsEditOpen(false);
      setEditingWarehouse(null);
      await loadWarehouses(true);
    } catch (err: any) {
      console.error('Failed to update warehouse:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to update warehouse facility.';
      showToast('error', 'Update Failed', msg);
    } finally {
      setSubmittingForm(false);
    }
  };

  // Handle Safe Deactivation
  const handleConfirmDeactivate = async () => {
    const wh = deactivateModal.warehouse;
    if (!wh) return;

    if ((wh.activeShipmentCount || 0) > 0) {
      showToast('error', 'Operational Restriction', 'Cannot deactivate a facility with active shipment loads.');
      return;
    }

    try {
      setDeactivateModal((prev) => ({ ...prev, submitting: true }));
      await warehouseService.deactivateWarehouse(wh.id);
      showToast('success', 'Facility Deactivated', `${wh.warehouseName} is now inactive.`);
      setDeactivateModal({ isOpen: false, warehouse: null, submitting: false });
      await loadWarehouses(true);
    } catch (err: any) {
      console.error('Failed to deactivate warehouse:', err);
      const msg = err.response?.data?.message || err.message || 'Unable to complete deactivation.';
      showToast('error', 'Deactivation Failed', msg);
      setDeactivateModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  // Utilization Progress Bar Helper
  const renderUtilizationBar = (util: number) => {
    let barColor = 'green';
    let textColor = 'var(--success, #059669)';

    if (util >= 90) {
      barColor = 'red';
      textColor = 'var(--danger, #dc2626)';
    } else if (util >= 70) {
      barColor = 'amber';
      textColor = '#d97706';
    }

    return (
      <div style={{ minWidth: 120 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
          <span style={{ fontWeight: 700, color: textColor }}>{util}%</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>
            {util >= 90 ? 'Near Capacity' : util >= 70 ? 'High' : 'Normal'}
          </span>
        </div>
        <div className="progress-bar" style={{ height: 6, background: '#f1f5f9' }}>
          <div className={`progress-fill ${barColor}`} style={{ width: `${Math.min(util, 100)}%` }} />
        </div>
      </div>
    );
  };

  return (
    <div className="admin-warehouses-page" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ── Page Header ── */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h2 className="page-title">Warehouse Management</h2>
          <p className="page-subtitle">
            Manage storage facilities, distribution centers, capacity and warehouse operations.
          </p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => loadWarehouses(true)}
            disabled={loading || refreshing}
            title="Reload latest facilities"
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
            <Plus size={14} /> Add Warehouse
          </button>
        </div>
      </div>

      {/* ── Operational KPI Cards (Dynamically Calculated) ── */}
      <div className="grid-5" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <div className="card" style={{ padding: '16px 18px', background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Total Warehouses</span>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>{stats.total}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Registered storage facilities</div>
        </div>

        <div className="card" style={{ padding: '16px 18px', background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Active Facilities</span>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#16a34a' }}>{stats.active}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% operational readiness
          </div>
        </div>

        <div className="card" style={{ padding: '16px 18px', background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Total Storage Capacity</span>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Boxes size={16} />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>
            {stats.totalCapacity.toLocaleString()} <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>KG</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Network storage envelope</div>
        </div>

        <div className="card" style={{ padding: '16px 18px', background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Average Utilization</span>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 size={16} />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: stats.avgUtilization > 85 ? 'var(--danger)' : 'var(--text-primary)' }}>
            {stats.avgUtilization}%
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Live occupancy across bays</div>
        </div>

        <div className="card" style={{ padding: '16px 18px', background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Near Capacity</span>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: stats.nearCapacity > 0 ? '#fee2e2' : '#f1f5f9', color: stats.nearCapacity > 0 ? '#dc2626' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: stats.nearCapacity > 0 ? '#dc2626' : 'var(--text-primary)' }}>
            {stats.nearCapacity}
          </div>
          <div style={{ fontSize: 11, color: stats.nearCapacity > 0 ? '#dc2626' : 'var(--text-muted)', marginTop: 4 }}>
            {stats.nearCapacity > 0 ? 'Requires load rebalancing' : 'All bays within normal limits'}
          </div>
        </div>
      </div>

      {/* ── Interactive Map Section ── */}
      <div className="card" style={{ background: '#fff', overflow: 'hidden' }}>
        <div
          style={{
            padding: '12px 18px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={16} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Interactive Logistics Facilities Map
            </h3>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              ({warehouses.filter((w) => w.latitude && w.longitude).length} facilities plotted with live GPS coordinates)
            </span>
          </div>

          <button
            type="button"
            className="btn btn-outline btn-xs"
            onClick={() => setShowMap(!showMap)}
            style={{ fontSize: 12 }}
          >
            {showMap ? 'Hide Map' : 'Show Map'}
          </button>
        </div>

        {showMap && (
          <div style={{ padding: 12 }}>
            <InteractiveWarehouseMap
              warehouses={filteredWarehouses}
              selectedWarehouse={selectedWarehouse}
              onSelectWarehouse={(w) => setSelectedWarehouse(w)}
              onViewDetails={handleViewDetails}
              height={360}
            />
          </div>
        )}
      </div>

      {/* ── Executive Search & Filter Toolbar ── */}
      <div className="wh-toolbar-card">
        {/* Top Status Tabs */}
        <div className="wh-status-tabs">
          <button
            type="button"
            className={`wh-status-tab-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ALL')}
          >
            <span>All Facilities</span>
            <span className="wh-tab-count">{stats.total}</span>
          </button>
          <button
            type="button"
            className={`wh-status-tab-btn ${statusFilter === 'ACTIVE' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ACTIVE')}
          >
            <span>Active</span>
            <span className="wh-tab-count">{stats.active}</span>
          </button>
          <button
            type="button"
            className={`wh-status-tab-btn ${statusFilter === 'INACTIVE' ? 'active' : ''}`}
            onClick={() => setStatusFilter('INACTIVE')}
          >
            <span>Inactive</span>
            <span className="wh-tab-count">{warehouses.filter((w) => w.status === 'INACTIVE').length}</span>
          </button>
          <button
            type="button"
            className={`wh-status-tab-btn ${statusFilter === 'MAINTENANCE' ? 'active' : ''}`}
            onClick={() => setStatusFilter('MAINTENANCE')}
          >
            <span>Maintenance</span>
            <span className="wh-tab-count">{warehouses.filter((w) => w.status === 'MAINTENANCE').length}</span>
          </button>
        </div>

        {/* Filter Controls Row */}
        <div className="wh-filter-controls-row">
          {/* Search Box */}
          <div className="wh-search-input-wrapper">
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: 34, paddingRight: search ? 30 : 12, height: 38, fontSize: 13, borderRadius: 8 }}
              placeholder="Search warehouses, codes, cities, managers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: 4,
                  display: 'flex',
                }}
              >
                <XCircle size={14} />
              </button>
            )}
          </div>

          {/* Secondary Select Dropdowns */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <select
              className="wh-filter-select-pill"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
            >
              <option value="ALL">All Facility Types</option>
              <option value="DISTRIBUTION_CENTER">Distribution Center</option>
              <option value="FULFILLMENT_CENTER">Fulfillment Center</option>
              <option value="STORAGE_WAREHOUSE">Storage Warehouse</option>
              <option value="COLD_STORAGE">Cold Storage</option>
              <option value="CROSS_DOCK">Cross Dock</option>
              <option value="TRANSIT_HUB">Transit Hub</option>
            </select>

            <select
              className="wh-filter-select-pill"
              value={utilizationFilter}
              onChange={(e) => setUtilizationFilter(e.target.value as any)}
            >
              <option value="ALL">All Utilization Levels</option>
              <option value="NORMAL">Normal (0–69%)</option>
              <option value="HIGH">High (70–89%)</option>
              <option value="NEAR_CAPACITY">Near Capacity (90%+)</option>
            </select>

            {/* Clear Filters Reset Button */}
            {(search || statusFilter !== 'ALL' || typeFilter !== 'ALL' || utilizationFilter !== 'ALL') && (
              <button
                type="button"
                className="btn btn-outline btn-xs"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('ALL');
                  setTypeFilter('ALL');
                  setUtilizationFilter('ALL');
                }}
                style={{ color: '#64748b', height: 38, padding: '0 12px', borderRadius: 8 }}
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Enterprise Warehouse Table ── */}
      <div className="table-container wh-table-container" style={{ width: '100%', maxWidth: '100%' }}>
        {loading ? (
          <div style={{ padding: '48px 24px' }}>
            <LoadingState message="Loading storage facilities and distribution hubs..." />
          </div>
        ) : error ? (
          <div style={{ padding: '48px 24px' }}>
            <ErrorState
              title="Unable to load warehouses"
              message={error}
              action={
                <button type="button" className="btn btn-primary btn-sm" onClick={() => loadWarehouses()}>
                  Retry Connection
                </button>
              }
            />
          </div>
        ) : filteredWarehouses.length === 0 ? (
          <div style={{ padding: '48px 20px' }}>
            <EmptyState
              title="No warehouses match your criteria"
              description={
                search || statusFilter !== 'ALL' || typeFilter !== 'ALL' || utilizationFilter !== 'ALL'
                  ? 'Try broadening your search keywords or resetting your active filters.'
                  : 'Your warehouse network is currently empty. Click "+ Add Warehouse" to register your first facility.'
              }
              action={
                !search && statusFilter === 'ALL' && typeFilter === 'ALL' && utilizationFilter === 'ALL' ? (
                  <button type="button" className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
                    <Plus size={14} /> Add First Warehouse
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setSearch('');
                      setStatusFilter('ALL');
                      setTypeFilter('ALL');
                      setUtilizationFilter('ALL');
                    }}
                  >
                    Clear All Filters
                  </button>
                )
              }
            />
          </div>
        ) : (
          <div className="table-container" style={{ width: '100%', maxWidth: '100%' }}>
            <table className="wh-data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '22%' }}>Warehouse</th>
                  <th style={{ width: '16%' }}>Location</th>
                  <th style={{ width: '16%' }}>Manager</th>
                  <th style={{ width: '18%' }}>Occupancy</th>
                  <th style={{ width: '10%' }}>Active Loads</th>
                  <th style={{ width: '8%' }}>Status</th>
                  <th style={{ textAlign: 'center', width: '10%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWarehouses.map((w) => {
                  const util = w.utilizationRate ?? 0;
                  const isSelected = selectedWarehouse?.id === w.id;
                  const utilColor = util >= 90 ? '#ef4444' : util >= 70 ? '#f59e0b' : '#10b981';
                  const activeLoads = w.activeShipmentCount || 0;

                  return (
                    <tr
                      key={w.id}
                      style={{
                        backgroundColor: isSelected ? '#f0f9ff' : undefined,
                        cursor: 'pointer',
                      }}
                      onClick={() => setSelectedWarehouse(w)}
                    >
                      {/* 1. Warehouse Name & Code */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 13.5 }}>
                            {w.warehouseName || w.name}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span
                              style={{
                                fontFamily: 'ui-monospace, monospace',
                                fontSize: 11,
                                fontWeight: 700,
                                color: '#0284c7',
                                background: '#f0f9ff',
                                border: '1px solid #bae6fd',
                                padding: '1px 5px',
                                borderRadius: 4,
                              }}
                            >
                              {w.warehouseCode || `WH-${w.id}`}
                            </span>
                            <span className="wh-type-chip" style={{ fontSize: 10 }}>
                              {formatTypeLabel(w.warehouseType)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Location */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600, color: '#1e293b', fontSize: 13 }}>
                            {w.city}, {w.state}
                          </span>
                          <span style={{ fontSize: 11, color: '#64748b' }}>
                            {w.country || 'India'}
                          </span>
                        </div>
                      </td>

                      {/* 3. Manager */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="wh-manager-avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
                            {getManagerInitials(w.managerName || w.manager)}
                          </div>
                          <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 12.5 }}>
                            {w.managerName || w.manager || 'Unassigned'}
                          </span>
                        </div>
                      </td>

                      {/* 4. Occupancy */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 140 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
                            <span style={{ color: '#64748b' }}>Used</span>
                            <span style={{ fontWeight: 700, color: utilColor }}>{util}%</span>
                          </div>
                          <div style={{ width: '100%', height: 5, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(util, 100)}%`, height: '100%', background: utilColor, borderRadius: 3 }} />
                          </div>
                        </div>
                      </td>

                      {/* 5. Active Loads */}
                      <td>
                        {activeLoads > 0 ? (
                          <span className="load-count-badge" style={{ fontSize: 11 }}>
                            <Truck size={12} />
                            {activeLoads}
                          </span>
                        ) : (
                          <span className="load-count-badge zero" style={{ fontSize: 11 }}>
                            0
                          </span>
                        )}
                      </td>

                      {/* 6. Status */}
                      <td>
                        <StatusBadge status={w.status || 'ACTIVE'} />
                      </td>

                      {/* 7. Actions */}
                      <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                          <button
                            type="button"
                            className="btn btn-outline btn-xs"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px' }}
                            onClick={() => handleViewDetails(w)}
                            title="Inspect Facility Overview"
                          >
                            <Eye size={12} /> <span>View</span>
                          </button>
                          <button
                            type="button"
                            className="btn-icon btn-xs"
                            onClick={() => handleOpenEdit(w)}
                            title="Edit Facility"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            type="button"
                            className="btn-icon btn-xs"
                            onClick={() => setDeactivateModal({ isOpen: true, warehouse: w, submitting: false })}
                            title={w.status === 'INACTIVE' ? 'Facility Inactive' : 'Deactivate Facility'}
                          >
                            <Power size={13} />
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

        {/* Footer info */}
        {!loading && filteredWarehouses.length > 0 && (
          <div
            style={{
              padding: '12px 20px',
              borderTop: '1px solid #f1f5f9',
              background: '#f8fafc',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 12,
              color: '#64748b',
            }}
          >
            <span>
              Showing <strong>{filteredWarehouses.length}</strong> of <strong>{warehouses.length}</strong> facilities
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={13} style={{ color: '#16a34a' }} />
              Real-time operational synchronization active
            </span>
          </div>
        )}
      </div>

      {/* ── View Warehouse Details Drawer ── */}
      <Drawer
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title={selectedWarehouse ? (selectedWarehouse.warehouseName || selectedWarehouse.name || 'Warehouse Details') : 'Warehouse Details'}
        subtitle={selectedWarehouse ? `Code: ${selectedWarehouse.warehouseCode || selectedWarehouse.id} • ${formatTypeLabel(selectedWarehouse.warehouseType)}` : ''}
        size="lg"
      >
        {selectedWarehouse && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Top Status & Type Banner */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: 8,
                background: '#f8fafc',
                border: '1px solid var(--border)',
              }}
            >
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Facility Status</span>
                <div style={{ marginTop: 4 }}>
                  <StatusBadge status={selectedWarehouse.status} />
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Facility Type</span>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
                  {formatTypeLabel(selectedWarehouse.warehouseType)}
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Facility ID</span>
                <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-primary)', marginTop: 4 }}>
                  #{selectedWarehouse.id}
                </div>
              </div>
            </div>

            {/* Capacity Section */}
            <div className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Boxes size={16} style={{ color: 'var(--primary)' }} />
                <h4 style={{ fontSize: 13, fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                  Capacity & Space Utilization
                </h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 6 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total Capacity</span>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>
                    {selectedWarehouse.totalCapacity?.toLocaleString()} {selectedWarehouse.capacityUnit}
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 6 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Occupied Space</span>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>
                    {selectedWarehouse.occupiedCapacity?.toLocaleString()} {selectedWarehouse.capacityUnit}
                  </div>
                </div>
                <div style={{ background: '#f0fdf4', padding: 12, borderRadius: 6, border: '1px solid #dcfce7' }}>
                  <span style={{ fontSize: 11, color: '#166534' }}>Available Free Space</span>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#16a34a', marginTop: 2 }}>
                    {selectedWarehouse.availableCapacity?.toLocaleString()} {selectedWarehouse.capacityUnit}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Capacity Meter</span>
                  <span style={{ fontWeight: 800, color: (selectedWarehouse.utilizationRate ?? 0) >= 90 ? 'var(--danger)' : 'var(--text-primary)' }}>
                    {selectedWarehouse.utilizationRate}% Utilized
                  </span>
                </div>
                <div className="progress-bar" style={{ height: 10 }}>
                  <div
                    className={`progress-fill ${(selectedWarehouse.utilizationRate ?? 0) >= 90 ? 'red' : (selectedWarehouse.utilizationRate ?? 0) >= 70 ? 'amber' : 'green'}`}
                    style={{ width: `${Math.min(selectedWarehouse.utilizationRate ?? 0, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Operational Activity */}
            <div className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Truck size={16} style={{ color: 'var(--primary)' }} />
                <h4 style={{ fontSize: 13, fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                  Operational Activity & Cargo Loads
                </h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 6, textAlign: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Active Shipments</span>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#0284c7', marginTop: 4 }}>
                    {selectedWarehouse.activeShipmentCount || 0}
                  </div>
                </div>
                <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 6, textAlign: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Inbound Loads</span>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#16a34a', marginTop: 4 }}>
                    {selectedWarehouse.inboundLoadCount || 0}
                  </div>
                </div>
                <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 6, textAlign: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Outbound Loads</span>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#d97706', marginTop: 4 }}>
                    {selectedWarehouse.outboundLoadCount || 0}
                  </div>
                </div>
                <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 6, textAlign: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Connected Routes</span>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#7c3aed', marginTop: 4 }}>
                    {selectedWarehouse.activeRouteCount || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <MapPin size={16} style={{ color: 'var(--primary)' }} />
                <h4 style={{ fontSize: 13, fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                  Location & Facility Address
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: 11, display: 'block' }}>Address:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {selectedWarehouse.addressLine1}
                    {selectedWarehouse.addressLine2 ? `, ${selectedWarehouse.addressLine2}` : ''}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 4 }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: 11, display: 'block' }}>City & State:</span>
                    <span style={{ fontWeight: 600 }}>{selectedWarehouse.city}, {selectedWarehouse.state}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: 11, display: 'block' }}>Postal Code:</span>
                    <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{selectedWarehouse.postalCode}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: 11, display: 'block' }}>Country:</span>
                    <span style={{ fontWeight: 600 }}>{selectedWarehouse.country || 'India'}</span>
                  </div>
                </div>

                {selectedWarehouse.latitude && selectedWarehouse.longitude && (
                  <div style={{ marginTop: 8, padding: '8px 10px', background: '#f8fafc', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Navigation size={13} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                      GPS Coordinates: <strong>{selectedWarehouse.latitude}</strong>, <strong>{selectedWarehouse.longitude}</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Management & Facility Operations */}
            <div className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <User size={16} style={{ color: 'var(--primary)' }} />
                <h4 style={{ fontSize: 13, fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                  Management & Operations Contact
                </h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12 }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: 11, display: 'block' }}>Facility Manager:</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedWarehouse.managerName}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: 11, display: 'block' }}>Manager Phone:</span>
                  <span style={{ fontWeight: 600 }}>{selectedWarehouse.managerPhone || 'Not provided'}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: 11, display: 'block' }}>Manager Email:</span>
                  <span style={{ fontWeight: 600 }}>{selectedWarehouse.managerEmail || 'Not provided'}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: 11, display: 'block' }}>Operating Hours:</span>
                  <span style={{ fontWeight: 600 }}>{selectedWarehouse.operatingHours || 'Mon–Sat, 06:00 AM – 10:00 PM'}</span>
                </div>
              </div>
            </div>

            {/* Audit Timestamps */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', padding: '0 4px' }}>
              <span>Registered: {selectedWarehouse.createdAt ? new Date(selectedWarehouse.createdAt).toLocaleString() : 'N/A'}</span>
              <span>Updated: {selectedWarehouse.updatedAt ? new Date(selectedWarehouse.updatedAt).toLocaleString() : 'N/A'}</span>
            </div>

            {/* Drawer Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setIsDetailsOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => handleOpenEdit(selectedWarehouse)}
              >
                <Edit3 size={14} /> Edit Facility
              </button>
            </div>
          </div>
        )}
      </Drawer>

      {/* ── Add / Edit Warehouse Modal ── */}
      <Modal
        isOpen={isAddOpen || isEditOpen}
        onClose={() => {
          if (!submittingForm) {
            setIsAddOpen(false);
            setIsEditOpen(false);
            setEditingWarehouse(null);
          }
        }}
        title={isEditOpen ? `Edit Warehouse: ${formData.warehouseCode}` : 'Register Warehouse Facility'}
        size="lg"
      >
        <form onSubmit={isEditOpen ? handleSaveEdit : handleSaveAdd}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Section 1: Basic Information */}
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 10 }}>
                1. Basic Facility Information
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label form-label-required">Warehouse Code</label>
                  <input
                    type="text"
                    className={`form-input font-mono ${formErrors.warehouseCode ? 'error' : ''}`}
                    placeholder="e.g. WH-BLR-001"
                    value={formData.warehouseCode}
                    onChange={(e) => {
                      setFormData({ ...formData, warehouseCode: e.target.value.toUpperCase() });
                      if (formErrors.warehouseCode) setFormErrors({ ...formErrors, warehouseCode: '' });
                    }}
                  />
                  {formErrors.warehouseCode && <p className="form-error">{formErrors.warehouseCode}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label form-label-required">Warehouse Facility Name</label>
                  <input
                    type="text"
                    className={`form-input ${formErrors.warehouseName ? 'error' : ''}`}
                    placeholder="e.g. Bengaluru Central Hub"
                    value={formData.warehouseName}
                    onChange={(e) => {
                      setFormData({ ...formData, warehouseName: e.target.value });
                      if (formErrors.warehouseName) setFormErrors({ ...formErrors, warehouseName: '' });
                    }}
                  />
                  {formErrors.warehouseName && <p className="form-error">{formErrors.warehouseName}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label form-label-required">Warehouse Type</label>
                  <select
                    className="form-input"
                    value={formData.warehouseType}
                    onChange={(e) => setFormData({ ...formData, warehouseType: e.target.value as WarehouseType })}
                  >
                    <option value="DISTRIBUTION_CENTER">Distribution Center</option>
                    <option value="FULFILLMENT_CENTER">Fulfillment Center</option>
                    <option value="STORAGE_WAREHOUSE">Storage Warehouse</option>
                    <option value="COLD_STORAGE">Cold Storage</option>
                    <option value="CROSS_DOCK">Cross Dock</option>
                    <option value="TRANSIT_HUB">Transit Hub</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label form-label-required">Operational Status</label>
                  <select
                    className="form-input"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as WarehouseStatus })}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Management & Contacts */}
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 10 }}>
                2. Facility Management
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label form-label-required">Manager Name</label>
                  <input
                    type="text"
                    className={`form-input ${formErrors.managerName ? 'error' : ''}`}
                    placeholder="e.g. K. Suresh"
                    value={formData.managerName}
                    onChange={(e) => {
                      setFormData({ ...formData, managerName: e.target.value });
                      if (formErrors.managerName) setFormErrors({ ...formErrors, managerName: '' });
                    }}
                  />
                  {formErrors.managerName && <p className="form-error">{formErrors.managerName}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Manager Phone</label>
                  <input
                    type="text"
                    className={`form-input ${formErrors.managerPhone ? 'error' : ''}`}
                    placeholder="e.g. +91 98001 11001"
                    value={formData.managerPhone}
                    onChange={(e) => {
                      setFormData({ ...formData, managerPhone: e.target.value });
                      if (formErrors.managerPhone) setFormErrors({ ...formErrors, managerPhone: '' });
                    }}
                  />
                  {formErrors.managerPhone && <p className="form-error">{formErrors.managerPhone}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Manager Email</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. manager@primeroute.com"
                    value={formData.managerEmail}
                    onChange={(e) => setFormData({ ...formData, managerEmail: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Location Details */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', margin: 0 }}>
                  3. Location & GPS Coordinates
                </h4>
                {/* City Preset dropdown for quick fill */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Quick Hub Preset:</span>
                  <select
                    className="form-input"
                    style={{ height: 28, fontSize: 11, padding: '2px 8px' }}
                    onChange={(e) => handleCityPresetChange(e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>Select Indian City...</option>
                    {Object.keys(CITY_PRESETS).map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 12 }}>
                <div className="form-group">
                  <label className="form-label form-label-required">Address Line 1</label>
                  <input
                    type="text"
                    className={`form-input ${formErrors.addressLine1 ? 'error' : ''}`}
                    placeholder="Plot 42, Export Promotion Industrial Park"
                    value={formData.addressLine1}
                    onChange={(e) => {
                      setFormData({ ...formData, addressLine1: e.target.value });
                      if (formErrors.addressLine1) setFormErrors({ ...formErrors, addressLine1: '' });
                    }}
                  />
                  {formErrors.addressLine1 && <p className="form-error">{formErrors.addressLine1}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Phase 2 Industrial Corridor"
                    value={formData.addressLine2}
                    onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div className="form-group">
                  <label className="form-label form-label-required">City</label>
                  <input
                    type="text"
                    className={`form-input ${formErrors.city ? 'error' : ''}`}
                    value={formData.city}
                    onChange={(e) => {
                      setFormData({ ...formData, city: e.target.value });
                      if (formErrors.city) setFormErrors({ ...formErrors, city: '' });
                    }}
                  />
                  {formErrors.city && <p className="form-error">{formErrors.city}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label form-label-required">State</label>
                  <input
                    type="text"
                    className={`form-input ${formErrors.state ? 'error' : ''}`}
                    value={formData.state}
                    onChange={(e) => {
                      setFormData({ ...formData, state: e.target.value });
                      if (formErrors.state) setFormErrors({ ...formErrors, state: '' });
                    }}
                  />
                  {formErrors.state && <p className="form-error">{formErrors.state}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label form-label-required">Postal Code</label>
                  <input
                    type="text"
                    className={`form-input font-mono ${formErrors.postalCode ? 'error' : ''}`}
                    value={formData.postalCode}
                    onChange={(e) => {
                      setFormData({ ...formData, postalCode: e.target.value });
                      if (formErrors.postalCode) setFormErrors({ ...formErrors, postalCode: '' });
                    }}
                  />
                  {formErrors.postalCode && <p className="form-error">{formErrors.postalCode}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Latitude (-90 to 90)</label>
                  <input
                    type="number"
                    step="0.0001"
                    className={`form-input font-mono ${formErrors.latitude ? 'error' : ''}`}
                    placeholder="12.9716"
                    value={formData.latitude ?? ''}
                    onChange={(e) => {
                      setFormData({ ...formData, latitude: e.target.value ? parseFloat(e.target.value) : undefined });
                      if (formErrors.latitude) setFormErrors({ ...formErrors, latitude: '' });
                    }}
                  />
                  {formErrors.latitude && <p className="form-error">{formErrors.latitude}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Longitude (-180 to 180)</label>
                  <input
                    type="number"
                    step="0.0001"
                    className={`form-input font-mono ${formErrors.longitude ? 'error' : ''}`}
                    placeholder="77.5946"
                    value={formData.longitude ?? ''}
                    onChange={(e) => {
                      setFormData({ ...formData, longitude: e.target.value ? parseFloat(e.target.value) : undefined });
                      if (formErrors.longitude) setFormErrors({ ...formErrors, longitude: '' });
                    }}
                  />
                  {formErrors.longitude && <p className="form-error">{formErrors.longitude}</p>}
                </div>
              </div>
            </div>

            {/* Section 4: Capacity & Operations */}
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 10 }}>
                4. Capacity & Operations
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div className="form-group">
                  <label className="form-label form-label-required">Total Capacity</label>
                  <input
                    type="number"
                    className={`form-input ${formErrors.totalCapacity ? 'error' : ''}`}
                    placeholder="5000"
                    value={formData.totalCapacity}
                    onChange={(e) => {
                      setFormData({ ...formData, totalCapacity: parseFloat(e.target.value) || 0 });
                      if (formErrors.totalCapacity) setFormErrors({ ...formErrors, totalCapacity: '' });
                    }}
                  />
                  {formErrors.totalCapacity && <p className="form-error">{formErrors.totalCapacity}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Occupied Capacity</label>
                  <input
                    type="number"
                    className={`form-input ${formErrors.occupiedCapacity ? 'error' : ''}`}
                    placeholder="0"
                    value={formData.occupiedCapacity}
                    onChange={(e) => {
                      setFormData({ ...formData, occupiedCapacity: parseFloat(e.target.value) || 0 });
                      if (formErrors.occupiedCapacity) setFormErrors({ ...formErrors, occupiedCapacity: '' });
                    }}
                  />
                  {formErrors.occupiedCapacity && <p className="form-error">{formErrors.occupiedCapacity}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label form-label-required">Capacity Unit</label>
                  <select
                    className="form-input"
                    value={formData.capacityUnit}
                    onChange={(e) => setFormData({ ...formData, capacityUnit: e.target.value })}
                  >
                    <option value="KG">KG (Kilograms)</option>
                    <option value="TONS">TONS (Metric Tonnes)</option>
                    <option value="PALLETS">PALLETS</option>
                    <option value="SQ_FT">SQ_FT (Square Feet)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Operating Hours</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Mon–Sat, 06:00 AM – 10:00 PM or 24/7"
                    value={formData.operatingHours}
                    onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Facility Contact Phone</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. +91 80 4455 6600"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setIsAddOpen(false);
                  setIsEditOpen(false);
                  setEditingWarehouse(null);
                }}
                disabled={submittingForm}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={submittingForm}
              >
                {submittingForm ? 'Saving...' : isEditOpen ? 'Update Warehouse' : 'Register Facility'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ── Deactivate Warehouse Confirmation Modal ── */}
      <Modal
        isOpen={deactivateModal.isOpen}
        onClose={() => {
          if (!deactivateModal.submitting) {
            setDeactivateModal({ isOpen: false, warehouse: null, submitting: false });
          }
        }}
        title="Deactivate Warehouse?"
        size="sm"
      >
        {deactivateModal.warehouse && (
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>
              Are you sure you want to deactivate{' '}
              <strong style={{ color: 'var(--text-primary)' }}>
                {deactivateModal.warehouse.warehouseName} ({deactivateModal.warehouse.warehouseCode})
              </strong>?
            </p>

            {(deactivateModal.warehouse.activeShipmentCount || 0) > 0 ? (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fee2e2',
                  borderRadius: 6,
                  padding: '10px 12px',
                  marginBottom: 16,
                  fontSize: 12,
                  color: '#991b1b',
                  lineHeight: 1.4,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                }}
              >
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <strong>Operational Restriction:</strong> This warehouse currently has active operational assignments (
                  {deactivateModal.warehouse.activeShipmentCount} active load(s)). Complete or reassign these operations before deactivating the warehouse.
                </div>
              </div>
            ) : (
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
                Deactivating this warehouse will prevent it from being used for new operational assignments. Existing historical records will remain available for operational and reporting purposes.
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setDeactivateModal({ isOpen: false, warehouse: null, submitting: false })}
                disabled={deactivateModal.submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleConfirmDeactivate}
                disabled={deactivateModal.submitting || (deactivateModal.warehouse.activeShipmentCount || 0) > 0}
              >
                {deactivateModal.submitting ? 'Deactivating...' : 'Deactivate Warehouse'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
