import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search, Plus, Truck, Wrench, CheckCircle, Navigation,
  Eye, Edit2, UserCheck, UserX, AlertCircle, RefreshCw,
  Calendar, ShieldCheck, MapPin, Package, Clock, AlertTriangle
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import Drawer from '../../components/common/Drawer';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/States';
import { useToast } from '../../components/common/Toast';
import vehicleService from '../../services/vehicleService';
import driverService from '../../services/driverService';
import { warehouseService } from '../../services/warehouseService';
import type { Warehouse } from '../../types/warehouse';
import type { Vehicle, VehicleStatus, VehicleType } from '../../types/vehicle';
import type { AdminDriver } from '../../types/adminDriver';
import { validateRequired, validatePositiveNumber } from '../../utils/validation';

export default function AdminVehicles() {
  const { showToast } = useToast();

  // ── STATE ─────────────────────────────────────────────────────────────
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<AdminDriver[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(6);

  // View Vehicle Drawer
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Add Vehicle Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submittingAdd, setSubmittingAdd] = useState(false);
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});
  const [newVehicle, setNewVehicle] = useState({
    vehicleNumber: '',
    vehicleType: 'TRUCK' as VehicleType,
    manufacturer: 'Tata Motors',
    model: '',
    capacity: '15',
    capacityUnit: 'TONS',
    warehouseId: undefined as number | undefined,
    registrationNumber: '',
    registrationExpiry: '',
    insuranceExpiry: '',
    currentLocation: 'Bengaluru Central Logistics Hub',
    driverId: '',
  });

  // Edit Vehicle Modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [editVehicle, setEditVehicle] = useState<{
    id: number | string;
    vehicleNumber: string;
    vehicleType: VehicleType;
    manufacturer: string;
    model: string;
    capacity: string;
    capacityUnit: string;
    warehouseId?: number;
    driverId?: string;
    registrationNumber: string;
    registrationExpiry: string;
    insuranceExpiry: string;
    currentLocation: string;
    status: VehicleStatus;
  } | null>(null);

  // Assign Driver Modal
  const [assignModal, setAssignModal] = useState<{
    isOpen: boolean;
    vehicle: Vehicle | null;
    driverId: string;
    submitting: boolean;
  }>({
    isOpen: false,
    vehicle: null,
    driverId: '',
    submitting: false,
  });

  // Safe Deactivate / Status Modal
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    vehicle: Vehicle | null;
    targetStatus: VehicleStatus;
    submitting: boolean;
  }>({
    isOpen: false,
    vehicle: null,
    targetStatus: 'INACTIVE',
    submitting: false,
  });

  // ── DATA FETCHING ─────────────────────────────────────────────────────
  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const [vehicleList, driverList, warehouseList] = await Promise.all([
        vehicleService.getAllVehicles(),
        driverService.getAllDrivers().catch(() => []),
        warehouseService.getAllWarehouses().catch(() => []),
      ]);
      setVehicles(vehicleList);
      setDrivers(driverList);
      setWarehouses(warehouseList);

      setVehicles(vehicleList);
      setDrivers(driverList);
    } catch (err: any) {
      console.error('Failed to load fleet data:', err);
      setError('Unable to load fleet vehicles. Please try again.');
      showToast('error', 'Fleet Error', 'Failed to retrieve vehicle data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load single vehicle for Drawer
  const handleViewVehicle = async (id: number | string) => {
    setLoadingDetail(true);
    try {
      const v = await vehicleService.getVehicleById(id);
      setSelectedVehicle(v);
    } catch (err: any) {
      console.error('Failed to fetch vehicle details:', err);
      showToast('error', 'Fetch Error', 'Unable to retrieve vehicle details.');
    } finally {
      setLoadingDetail(false);
    }
  };

  // ── KPI SUMMARY CALCULATION ───────────────────────────────────────────
  const totalCount = vehicles.length;
  const availableCount = vehicles.filter((v) => v.status === 'AVAILABLE').length;
  const inTransitCount = vehicles.filter((v) => v.status === 'IN_TRANSIT').length;
  const maintenanceCount = vehicles.filter((v) => v.status === 'MAINTENANCE').length;

  // ── SEARCH & FILTER ───────────────────────────────────────────────────
  const filteredVehicles = useMemo(() => {
    const q = search.trim().toLowerCase();
    return vehicles.filter((v) => {
      const vNum = (v.vehicleNumber || '').toLowerCase();
      const reg = (v.registrationNumber || '').toLowerCase();
      const model = (v.model || '').toLowerCase();
      const make = (v.manufacturer || v.make || '').toLowerCase();
      const driver = (v.driverName || v.driver || '').toLowerCase();

      const matchSearch =
        !q ||
        vNum.includes(q) ||
        reg.includes(q) ||
        model.includes(q) ||
        make.includes(q) ||
        driver.includes(q);

      const matchStatus = statusFilter === 'ALL' || v.status === statusFilter;
      const matchType =
        typeFilter === 'ALL' ||
        v.vehicleType === typeFilter ||
        v.type === typeFilter;

      return matchSearch && matchStatus && matchType;
    });
  }, [vehicles, search, statusFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredVehicles.length / pageSize));
  const safePage = Math.max(1, Math.min(page, totalPages));

  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [page, totalPages]);

  const paginatedVehicles = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredVehicles.slice(start, start + pageSize);
  }, [filteredVehicles, safePage, pageSize]);

  // ── ACTIONS ───────────────────────────────────────────────────────────

  // Add Vehicle
  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const numRes = validateRequired(newVehicle.vehicleNumber, 'Vehicle Number');
    if (!numRes.isValid) {
      errors.vehicleNumber = numRes.error!;
    } else if (vehicles.some((v) => (v.vehicleNumber || '').toUpperCase() === newVehicle.vehicleNumber.trim().toUpperCase())) {
      errors.vehicleNumber = 'A vehicle with this identification number already exists.';
    }

    const regRes = validateRequired(newVehicle.registrationNumber, 'Registration Plate');
    if (!regRes.isValid) {
      errors.registrationNumber = regRes.error!;
    } else if (vehicles.some((v) => v.registrationNumber.toUpperCase() === newVehicle.registrationNumber.trim().toUpperCase())) {
      errors.registrationNumber = 'A vehicle with this registration plate already exists.';
    }

    const modelRes = validateRequired(newVehicle.model, 'Model');
    if (!modelRes.isValid) errors.model = modelRes.error!;

    const capRes = validatePositiveNumber(newVehicle.capacity, 'Cargo Capacity');
    if (!capRes.isValid) errors.capacity = capRes.error!;

    if (!newVehicle.registrationExpiry) {
      errors.registrationExpiry = 'Registration expiry date is required.';
    }

    if (!newVehicle.insuranceExpiry) {
      errors.insuranceExpiry = 'Insurance expiry date is required.';
    }

    if (Object.keys(errors).length > 0) {
      setAddErrors(errors);
      showToast('error', 'Validation Error', 'Please check highlighted vehicle fields.');
      return;
    }
    setAddErrors({});

    try {
      setSubmittingAdd(true);
      const created = await vehicleService.createVehicle({
        vehicleNumber: newVehicle.vehicleNumber.trim().toUpperCase(),
        vehicleType: newVehicle.vehicleType,
        manufacturer: newVehicle.manufacturer.trim(),
        model: newVehicle.model.trim(),
        capacity: parseFloat(newVehicle.capacity),
        capacityUnit: newVehicle.capacityUnit,
        registrationNumber: newVehicle.registrationNumber.trim().toUpperCase(),
        registrationExpiry: newVehicle.registrationExpiry,
        insuranceExpiry: newVehicle.insuranceExpiry,
        currentLocation: newVehicle.currentLocation.trim(),
        warehouseId: newVehicle.warehouseId ? Number(newVehicle.warehouseId) : null,
        driverId: newVehicle.driverId ? Number(newVehicle.driverId) : null,
      });

      showToast('success', 'Vehicle Registered', `${created.model} (${created.vehicleNumber}) added to fleet.`);
      setIsAddOpen(false);
      setNewVehicle({
        vehicleNumber: '',
        vehicleType: 'TRUCK',
        manufacturer: 'Tata Motors',
        model: '',
        capacity: '15',
        capacityUnit: 'TONS',
        warehouseId: undefined,
        registrationNumber: '',
        registrationExpiry: '',
        insuranceExpiry: '',
        currentLocation: 'Bengaluru Central Logistics Hub',
        driverId: '',
      });
      await loadData(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to register vehicle.';
      showToast('error', 'Registration Error', msg);
    } finally {
      setSubmittingAdd(false);
    }
  };

  // Open Edit
  const handleOpenEdit = (v: Vehicle) => {
    setEditVehicle({
      id: v.id,
      vehicleNumber: v.vehicleNumber || '',
      vehicleType: v.vehicleType || 'TRUCK',
      manufacturer: v.manufacturer || '',
      model: v.model || '',
      capacity: String(v.capacity || '10'),
      capacityUnit: v.capacityUnit || 'TONS',
      warehouseId: v.warehouseId,
      driverId: v.driverId ? String(v.driverId) : '',
      registrationNumber: v.registrationNumber || '',
      registrationExpiry: v.registrationExpiry ? String(v.registrationExpiry) : '',
      insuranceExpiry: v.insuranceExpiry ? String(v.insuranceExpiry) : '',
      currentLocation: v.currentLocation || '',
      status: v.status,
    });
    setEditErrors({});
    setIsEditOpen(true);
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editVehicle) return;

    const errors: Record<string, string> = {};

    const numRes = validateRequired(editVehicle.vehicleNumber, 'Vehicle Number');
    if (!numRes.isValid) errors.vehicleNumber = numRes.error!;

    const regRes = validateRequired(editVehicle.registrationNumber, 'Registration Plate');
    if (!regRes.isValid) errors.registrationNumber = regRes.error!;

    const modelRes = validateRequired(editVehicle.model, 'Model');
    if (!modelRes.isValid) errors.model = modelRes.error!;

    const capRes = validatePositiveNumber(editVehicle.capacity, 'Cargo Capacity');
    if (!capRes.isValid) errors.capacity = capRes.error!;

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      showToast('error', 'Validation Error', 'Please check highlighted fields.');
      return;
    }
    setEditErrors({});

    try {
      setSubmittingEdit(true);
      const updated = await vehicleService.updateVehicle(editVehicle.id, {
        vehicleNumber: editVehicle.vehicleNumber.trim().toUpperCase(),
        vehicleType: editVehicle.vehicleType,
        manufacturer: editVehicle.manufacturer.trim(),
        model: editVehicle.model.trim(),
        capacity: parseFloat(editVehicle.capacity),
        capacityUnit: editVehicle.capacityUnit,
        registrationNumber: editVehicle.registrationNumber.trim().toUpperCase(),
        registrationExpiry: editVehicle.registrationExpiry,
        insuranceExpiry: editVehicle.insuranceExpiry,
        currentLocation: editVehicle.currentLocation.trim(),
        warehouseId: editVehicle.warehouseId ? Number(editVehicle.warehouseId) : null,
        driverId: editVehicle.driverId ? Number(editVehicle.driverId) : null,
        status: editVehicle.status,
      });

      showToast('success', 'Vehicle Updated', `${updated.model} (${updated.vehicleNumber}) updated successfully.`);
      setIsEditOpen(false);
      setEditVehicle(null);
      await loadData(true);

      if (selectedVehicle?.id === updated.id) {
        handleViewVehicle(updated.id);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update vehicle.';
      showToast('error', 'Update Error', msg);
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Assign Driver Submit
  const handleSaveDriverAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModal.vehicle) return;

    try {
      setAssignModal((prev) => ({ ...prev, submitting: true }));
      const targetDriverId = assignModal.driverId ? Number(assignModal.driverId) : null;
      const updated = await vehicleService.assignDriver(assignModal.vehicle.id, targetDriverId);

      showToast(
        'success',
        'Driver Assignment Updated',
        targetDriverId
          ? `${updated.driverName} assigned to ${updated.vehicleNumber}.`
          : `Driver unassigned from ${updated.vehicleNumber}.`
      );

      setAssignModal({ isOpen: false, vehicle: null, driverId: '', submitting: false });
      await loadData(true);

      if (selectedVehicle?.id === updated.id) {
        handleViewVehicle(updated.id);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to assign driver.';
      showToast('error', 'Assignment Error', msg);
      setAssignModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  // Execute Status Transition
  const handleExecuteStatusChange = async () => {
    if (!statusModal.vehicle) return;

    try {
      setStatusModal((prev) => ({ ...prev, submitting: true }));
      const updated = await vehicleService.updateVehicleStatus(
        statusModal.vehicle.id,
        statusModal.targetStatus
      );

      showToast(
        'info',
        'Vehicle Status Changed',
        `${updated.vehicleNumber} status updated to ${updated.status}.`
      );

      setStatusModal({ isOpen: false, vehicle: null, targetStatus: 'AVAILABLE', submitting: false });
      await loadData(true);

      if (selectedVehicle?.id === updated.id) {
        handleViewVehicle(updated.id);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to change status.';
      showToast('error', 'Status Error', msg);
      setStatusModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  // Helpers
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
            Vehicles
          </h2>
          <p className="page-subtitle" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Manage your logistics fleet, vehicle availability, assignments and compliance.
          </p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => loadData(true)}
            disabled={loading || refreshing}
            title="Refresh Fleet Directory"
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setIsAddOpen(true)}>
            <Plus size={14} /> Add Vehicle
          </button>
        </div>
      </div>

      {/* Fleet KPI Summary Cards */}
      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        <div className="kpi-card blue" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
          <div className="kpi-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <p className="kpi-label" style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>Total Fleet</p>
            <div className="kpi-icon blue" style={{ color: 'var(--primary)' }}><Truck size={20} /></div>
          </div>
          <p className="kpi-value" style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{totalCount}</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Commercial vehicles on file</p>
        </div>

        <div className="kpi-card green" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
          <div className="kpi-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <p className="kpi-label" style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>Available</p>
            <div className="kpi-icon green" style={{ color: '#16a34a' }}><CheckCircle size={20} /></div>
          </div>
          <p className="kpi-value" style={{ fontSize: 24, fontWeight: 700, color: '#16a34a', margin: 0 }}>{availableCount}</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Ready for dispatch</p>
        </div>

        <div className="kpi-card amber" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
          <div className="kpi-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <p className="kpi-label" style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>In Transit</p>
            <div className="kpi-icon amber" style={{ color: '#d97706' }}><Navigation size={20} /></div>
          </div>
          <p className="kpi-value" style={{ fontSize: 24, fontWeight: 700, color: '#d97706', margin: 0 }}>{inTransitCount}</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Active shipments on route</p>
        </div>

        <div className="kpi-card red" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
          <div className="kpi-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <p className="kpi-label" style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>Maintenance</p>
            <div className="kpi-icon red" style={{ color: '#dc2626' }}><Wrench size={20} /></div>
          </div>
          <p className="kpi-value" style={{ fontSize: 24, fontWeight: 700, color: '#dc2626', margin: 0 }}>{maintenanceCount}</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>In service depot</p>
        </div>
      </div>

      {/* Toolbar: Search & Filters */}
      <div className="toolbar" style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="search-box" style={{ flex: 1, minWidth: 260, position: 'relative' }}>
          <Search size={16} className="search-box-icon" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="search-input"
            style={{ width: '100%', paddingLeft: 36, height: 38, borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
            placeholder="Search by Vehicle #, Plate, Model, Driver..."
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
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="ALL">All Statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_TRANSIT">In Transit</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="INACTIVE">Inactive</option>
        </select>

        <select
          className="filter-select"
          style={{ height: 38, borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '0 12px' }}
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="ALL">All Vehicle Types</option>
          <option value="CONTAINER_TRUCK">Container Truck</option>
          <option value="TRUCK">Truck</option>
          <option value="HEAVY_TRUCK">Heavy Truck</option>
          <option value="MINI_TRUCK">Mini Truck</option>
          <option value="VAN">Van</option>
          <option value="TEMPO">Tempo</option>
          <option value="REFRIGERATED_TRUCK">Refrigerated Truck</option>
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
            onClick={() => loadData()}
            style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#b91c1c', textDecoration: 'underline', cursor: 'pointer', fontSize: 12 }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Vehicle Table Wrapper */}
      <div className="table-container table-wrapper" style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        {loading ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px', display: 'block', color: 'var(--primary)' }} />
            <p style={{ fontWeight: 500, fontSize: 14 }}>Loading fleet vehicles...</p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div style={{ padding: '40px 20px' }}>
            <EmptyState
              title="No vehicles found"
              description={search || statusFilter !== 'ALL' || typeFilter !== 'ALL' ? 'No vehicles match your search or filter criteria.' : 'Your fleet directory is currently empty. Click "+ Add Vehicle" to register the first commercial vehicle.'}
              action={
                !search && statusFilter === 'ALL' && typeFilter === 'ALL' ? (
                  <button className="btn btn-primary btn-sm" onClick={() => setIsAddOpen(true)}>
                    <Plus size={14} /> Add Vehicle
                  </button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div className="table-container" style={{ width: '100%', maxWidth: '100%' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', width: '18%' }}>Vehicle</th>
                  <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', width: '18%' }}>Type / Model</th>
                  <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', width: '15%' }}>Warehouse</th>
                  <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', width: '15%' }}>Driver</th>
                  <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', width: '12%' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', width: '12%' }}>Current Shipment</th>
                  <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center', width: '10%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedVehicles.map((v) => {
                  const hasDriver = !!v.driverId || (v.driverName && v.driverName !== 'Not Assigned');
                  const hasShipment = !!v.currentShipmentId || (v.currentShipmentTrackingNumber && v.currentShipmentTrackingNumber !== 'No active shipment');
                  const isInactive = v.status === 'INACTIVE';
                  const isMaintenance = v.status === 'MAINTENANCE';

                  return (
                    <tr
                      key={v.id}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        opacity: isInactive ? 0.75 : 1,
                        transition: 'background-color 0.15s',
                      }}
                    >
                      {/* 1. Vehicle Number & Reg */}
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            color: '#2563eb',
                            background: 'rgba(37, 99, 235, 0.08)',
                            padding: '3px 8px',
                            borderRadius: 4,
                            fontSize: 12,
                            display: 'inline-block',
                          }}
                        >
                          {v.vehicleNumber}
                        </span>
                        {v.registrationNumber && (
                          <span style={{ display: 'block', fontSize: 11, color: '#64748b', marginTop: 2, fontFamily: 'monospace' }}>
                            {v.registrationNumber}
                          </span>
                        )}
                      </td>

                      {/* 2. Type / Model */}
                      <td style={{ padding: '12px 16px' }}>
                        <p style={{ fontWeight: 600, color: '#0f172a', fontSize: 13, margin: 0 }}>
                          {v.model || v.make || 'Prime Freight'}
                        </p>
                        <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0 0', textTransform: 'capitalize' }}>
                          {(v.vehicleType || v.type || '').replace(/_/g, ' ').toLowerCase()} • {v.capacity || v.capacityTons} {v.capacityUnit || 'TONS'}
                        </p>
                      </td>

                      {/* 3. Warehouse */}
                      <td style={{ padding: '12px 16px' }}>
                        {v.warehouseName ? (
                          <span className="badge badge-indigo" style={{ fontSize: 11 }}>
                            {v.warehouseName}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: 12 }}>Unassigned</span>
                        )}
                      </td>

                      {/* 4. Assigned Driver */}
                      <td style={{ padding: '12px 16px' }}>
                        {hasDriver ? (
                          <div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', display: 'block' }}>
                              {v.driverName || v.driver}
                            </span>
                            {v.driverPhone && (
                              <span style={{ fontSize: 11, color: '#64748b' }}>{v.driverPhone}</span>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>
                            Not Assigned
                          </span>
                        )}
                      </td>

                      {/* 5. Status */}
                      <td style={{ padding: '12px 16px' }}>
                        <StatusBadge status={v.status} />
                      </td>

                      {/* 6. Current Shipment */}
                      <td style={{ padding: '12px 16px' }}>
                        {hasShipment ? (
                          <div>
                            <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 600, color: '#2563eb', display: 'block' }}>
                              {v.currentShipmentTrackingNumber}
                            </span>
                            {v.currentShipmentDestination && (
                              <span style={{ fontSize: 11, color: '#64748b' }}>
                                To: {v.currentShipmentDestination}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>None</span>
                        )}
                      </td>

                      {/* 7. Actions */}
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          <button
                            className="btn btn-outline btn-xs"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px' }}
                            title="View Vehicle Details"
                            onClick={() => handleViewVehicle(v.id)}
                          >
                            <Eye size={13} />
                            <span>View</span>
                          </button>

                          <button
                            className="btn-icon btn-xs"
                            title="Edit Vehicle"
                            onClick={() => handleOpenEdit(v)}
                          >
                            <Edit2 size={13} />
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
                              color: isMaintenance ? '#16a34a' : isInactive ? '#2563eb' : '#dc2626',
                              cursor: 'pointer',
                            }}
                            title={
                              isMaintenance
                                ? 'Mark Available'
                                : isInactive
                                ? 'Reactivate Vehicle'
                                : 'Deactivate / Depot Service'
                            }
                            onClick={() => {
                              const target: VehicleStatus = isMaintenance
                                ? 'AVAILABLE'
                                : isInactive
                                ? 'AVAILABLE'
                                : 'INACTIVE';
                              setStatusModal({
                                isOpen: true,
                                vehicle: v,
                                targetStatus: target,
                                submitting: false,
                              });
                            }}
                          >
                            {isMaintenance ? <CheckCircle size={14} /> : isInactive ? <CheckCircle size={14} /> : <UserX size={14} />}
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
        {filteredVehicles.length > pageSize && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
            <Pagination
              page={page}
              pageSize={pageSize}
              total={filteredVehicles.length}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* ── VIEW VEHICLE DETAILS DRAWER ─────────────────────────────────── */}
      <Drawer
        isOpen={!!selectedVehicle}
        onClose={() => setSelectedVehicle(null)}
        title={selectedVehicle ? `${selectedVehicle.model} (${selectedVehicle.vehicleNumber})` : 'Vehicle Details'}
        subtitle={selectedVehicle ? `Registration Plate: ${selectedVehicle.registrationNumber}` : 'Loading...'}
        size="lg"
      >
        {loadingDetail ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px', display: 'block', color: 'var(--primary)' }} />
            <p style={{ fontSize: 13 }}>Fetching vehicle telemetry...</p>
          </div>
        ) : selectedVehicle ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '4px 0' }}>
            {/* VEHICLE DETAILS */}
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 12 }}>
                Vehicle Specifications
              </h4>
              <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Vehicle ID / Number</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--primary)', fontWeight: 700 }}>{selectedVehicle.vehicleNumber}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Vehicle Type</span>
                  <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600, textTransform: 'capitalize' }}>
                    {(selectedVehicle.vehicleType || selectedVehicle.type || '').replace(/_/g, ' ').toLowerCase()}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Manufacturer</span>
                  <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{selectedVehicle.manufacturer || selectedVehicle.make || 'Tata Motors'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Model</span>
                  <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>{selectedVehicle.model}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Payload Capacity</span>
                  <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>
                    {selectedVehicle.capacity || selectedVehicle.capacityTons} {selectedVehicle.capacityUnit || 'TONS'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Operational Status</span>
                  <StatusBadge status={selectedVehicle.status} />
                </div>
              </div>
            </div>

            {/* REGISTRATION & COMPLIANCE */}
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 12 }}>
                Registration & Compliance
              </h4>
              <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Registration Number</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-primary)', fontWeight: 700 }}>
                    {selectedVehicle.registrationNumber}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Registration Expiry</span>
                  <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{formatDate(selectedVehicle.registrationExpiry)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Insurance Validity Expiry</span>
                  <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{formatDate(selectedVehicle.insuranceExpiry)}</span>
                </div>
              </div>
            </div>

            {/* ASSIGNMENT & SHIPMENT */}
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 12 }}>
                Driver & Active Shipment
              </h4>
              <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Assigned Driver</span>
                  <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>
                    {selectedVehicle.driverName || selectedVehicle.driver || 'Not Assigned'}
                  </span>
                </div>
                {selectedVehicle.driverPhone && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Driver Contact</span>
                    <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{selectedVehicle.driverPhone}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Current Shipment</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 12, color: selectedVehicle.currentShipmentId ? 'var(--primary)' : 'var(--text-muted)', fontWeight: selectedVehicle.currentShipmentId ? 700 : 400 }}>
                    {selectedVehicle.currentShipmentTrackingNumber || 'No active shipment'}
                  </span>
                </div>
                {selectedVehicle.currentShipmentOrderNumber && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Order Number</span>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>
                      #{selectedVehicle.currentShipmentOrderNumber}
                    </span>
                  </div>
                )}
                {selectedVehicle.currentShipmentStatus && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Shipment Status</span>
                    <StatusBadge status={selectedVehicle.currentShipmentStatus} />
                  </div>
                )}
                {selectedVehicle.currentShipmentOrigin && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Origin Facility</span>
                    <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{selectedVehicle.currentShipmentOrigin}</span>
                  </div>
                )}
                {selectedVehicle.currentShipmentDestination && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Destination Facility</span>
                    <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>{selectedVehicle.currentShipmentDestination}</span>
                  </div>
                )}
              </div>
            </div>

            {/* LOCATION */}
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 12 }}>
                Assigned Warehouse & Depot Location
              </h4>
              <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 8, padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                <MapPin size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>Assigned Warehouse Depot:</span>
                  <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>
                    {selectedVehicle.currentLocation || 'Bengaluru Central Logistics Hub'}
                  </span>
                </div>
              </div>
            </div>

            {/* TIMELINE */}
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 12 }}>
                Fleet Lifecycle
              </h4>
              <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Registered to Fleet</span>
                  <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{formatDate(selectedVehicle.createdAt)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Last Updated</span>
                  <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{formatDate(selectedVehicle.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </Drawer>

      {/* ── ADD VEHICLE MODAL ───────────────────────────────────────────── */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => {
          if (!submittingAdd) {
            setIsAddOpen(false);
            setAddErrors({});
          }
        }}
        title="Register Vehicle to Fleet"
        size="md"
      >
        <form onSubmit={handleAddVehicle}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            Add a new commercial vehicle to the fleet. All records are saved in real-time.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div className="form-group">
              <label className="form-label form-label-required" style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>
                Vehicle Number (Internal ID)
              </label>
              <input
                type="text"
                className={`form-input font-mono ${addErrors.vehicleNumber ? 'error' : ''}`}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: addErrors.vehicleNumber ? '1px solid #dc2626' : '1px solid var(--border)', fontSize: 13 }}
                placeholder="e.g. VH-001 or PR-VH-101"
                value={newVehicle.vehicleNumber}
                onChange={(e) => {
                  setNewVehicle({ ...newVehicle, vehicleNumber: e.target.value });
                  if (addErrors.vehicleNumber) setAddErrors((prev) => ({ ...prev, vehicleNumber: '' }));
                }}
              />
              {addErrors.vehicleNumber && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 4, margin: 0 }}>{addErrors.vehicleNumber}</p>}
            </div>

            <div className="form-group">
              <label className="form-label form-label-required" style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>
                Registration Plate Number
              </label>
              <input
                type="text"
                className={`form-input font-mono ${addErrors.registrationNumber ? 'error' : ''}`}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: addErrors.registrationNumber ? '1px solid #dc2626' : '1px solid var(--border)', fontSize: 13 }}
                placeholder="e.g. KA-05-AB-9999"
                value={newVehicle.registrationNumber}
                onChange={(e) => {
                  setNewVehicle({ ...newVehicle, registrationNumber: e.target.value });
                  if (addErrors.registrationNumber) setAddErrors((prev) => ({ ...prev, registrationNumber: '' }));
                }}
              />
              {addErrors.registrationNumber && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 4, margin: 0 }}>{addErrors.registrationNumber}</p>}
            </div>

            <div className="form-group">
              <label className="form-label form-label-required" style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>
                Vehicle Type
              </label>
              <select
                className="form-select"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: 13 }}
                value={newVehicle.vehicleType}
                onChange={(e) => setNewVehicle({ ...newVehicle, vehicleType: e.target.value as VehicleType })}
              >
                <option value="CONTAINER_TRUCK">Container Truck</option>
                <option value="TRUCK">Truck</option>
                <option value="HEAVY_TRUCK">Heavy Truck</option>
                <option value="MINI_TRUCK">Mini Truck</option>
                <option value="VAN">Van</option>
                <option value="TEMPO">Tempo</option>
                <option value="REFRIGERATED_TRUCK">Refrigerated Truck</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>
                Manufacturer
              </label>
              <input
                type="text"
                className="form-input"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: 13 }}
                value={newVehicle.manufacturer}
                onChange={(e) => setNewVehicle({ ...newVehicle, manufacturer: e.target.value })}
                placeholder="e.g. Tata Motors"
              />
            </div>

            <div className="form-group">
              <label className="form-label form-label-required" style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>
                Model
              </label>
              <input
                type="text"
                className={`form-input ${addErrors.model ? 'error' : ''}`}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: addErrors.model ? '1px solid #dc2626' : '1px solid var(--border)', fontSize: 13 }}
                placeholder="e.g. Prima 5530.S"
                value={newVehicle.model}
                onChange={(e) => {
                  setNewVehicle({ ...newVehicle, model: e.target.value });
                  if (addErrors.model) setAddErrors((prev) => ({ ...prev, model: '' }));
                }}
              />
              {addErrors.model && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 4, margin: 0 }}>{addErrors.model}</p>}
            </div>

            <div className="form-group">
              <label className="form-label form-label-required" style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>
                Payload Capacity
              </label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="text"
                  className={`form-input ${addErrors.capacity ? 'error' : ''}`}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius)', border: addErrors.capacity ? '1px solid #dc2626' : '1px solid var(--border)', fontSize: 13 }}
                  placeholder="e.g. 15.0"
                  value={newVehicle.capacity}
                  onChange={(e) => {
                    setNewVehicle({ ...newVehicle, capacity: e.target.value });
                    if (addErrors.capacity) setAddErrors((prev) => ({ ...prev, capacity: '' }));
                  }}
                />
                <select
                  className="form-select"
                  style={{ width: 85, padding: '8px 8px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: 12 }}
                  value={newVehicle.capacityUnit}
                  onChange={(e) => setNewVehicle({ ...newVehicle, capacityUnit: e.target.value })}
                >
                  <option value="TONS">TONS</option>
                  <option value="KG">KG</option>
                </select>
              </div>
              {addErrors.capacity && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 4, margin: 0 }}>{addErrors.capacity}</p>}
            </div>

            <div className="form-group">
              <label className="form-label form-label-required" style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>
                Registration Expiry
              </label>
              <input
                type="date"
                className={`form-input ${addErrors.registrationExpiry ? 'error' : ''}`}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: addErrors.registrationExpiry ? '1px solid #dc2626' : '1px solid var(--border)', fontSize: 13 }}
                value={newVehicle.registrationExpiry}
                onChange={(e) => {
                  setNewVehicle({ ...newVehicle, registrationExpiry: e.target.value });
                  if (addErrors.registrationExpiry) setAddErrors((prev) => ({ ...prev, registrationExpiry: '' }));
                }}
              />
              {addErrors.registrationExpiry && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 4, margin: 0 }}>{addErrors.registrationExpiry}</p>}
            </div>

            <div className="form-group">
              <label className="form-label form-label-required" style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>
                Insurance Expiry
              </label>
              <input
                type="date"
                className={`form-input ${addErrors.insuranceExpiry ? 'error' : ''}`}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: addErrors.insuranceExpiry ? '1px solid #dc2626' : '1px solid var(--border)', fontSize: 13 }}
                value={newVehicle.insuranceExpiry}
                onChange={(e) => {
                  setNewVehicle({ ...newVehicle, insuranceExpiry: e.target.value });
                  if (addErrors.insuranceExpiry) setAddErrors((prev) => ({ ...prev, insuranceExpiry: '' }));
                }}
              />
              {addErrors.insuranceExpiry && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 4, margin: 0 }}>{addErrors.insuranceExpiry}</p>}
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>
                Depot / Current Location
              </label>
              <input
                type="text"
                className="form-input"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: 13 }}
                value={newVehicle.currentLocation}
                onChange={(e) => setNewVehicle({ ...newVehicle, currentLocation: e.target.value })}
                placeholder="e.g. Bengaluru Central Hub"
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>
                Assigned Warehouse
              </label>
              <select
                className="form-select"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: 13 }}
                value={newVehicle.warehouseId || ''}
                onChange={(e) => {
                  const wId = e.target.value ? Number(e.target.value) : undefined;
                  const selectedWh = warehouses.find((w) => w.id === wId);
                  setNewVehicle({
                    ...newVehicle,
                    warehouseId: wId,
                    currentLocation: selectedWh ? selectedWh.name : newVehicle.currentLocation,
                  });
                }}
              >
                <option value="">No Warehouse (Unassigned)</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.warehouseName || w.name} ({w.warehouseCode || `ID #${w.id}`})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>
                Assign Driver (Optional)
              </label>
              <select
                className="form-select"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: 13 }}
                value={newVehicle.driverId}
                onChange={(e) => setNewVehicle({ ...newVehicle, driverId: e.target.value })}
              >
                <option value="">No Driver (Leave Available for Assignment)</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName} ({d.phone}) — {d.status}
                  </option>
                ))}
              </select>
            </div>
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
              {submittingAdd ? 'Saving...' : 'Register Vehicle'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── EDIT VEHICLE MODAL ──────────────────────────────────────────── */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => {
          if (!submittingEdit) {
            setIsEditOpen(false);
            setEditVehicle(null);
            setEditErrors({});
          }
        }}
        title="Edit Vehicle Details"
        size="md"
      >
        {editVehicle && (
          <form onSubmit={handleSaveEdit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label form-label-required" style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>
                  Vehicle Identification #
                </label>
                <input
                  type="text"
                  className={`form-input font-mono ${editErrors.vehicleNumber ? 'error' : ''}`}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: editErrors.vehicleNumber ? '1px solid #dc2626' : '1px solid var(--border)', fontSize: 13 }}
                  value={editVehicle.vehicleNumber}
                  onChange={(e) => {
                    setEditVehicle({ ...editVehicle, vehicleNumber: e.target.value });
                    if (editErrors.vehicleNumber) setEditErrors((prev) => ({ ...prev, vehicleNumber: '' }));
                  }}
                />
                {editErrors.vehicleNumber && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 4, margin: 0 }}>{editErrors.vehicleNumber}</p>}
              </div>

              <div className="form-group">
                <label className="form-label form-label-required" style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>
                  Registration Plate
                </label>
                <input
                  type="text"
                  className={`form-input font-mono ${editErrors.registrationNumber ? 'error' : ''}`}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: editErrors.registrationNumber ? '1px solid #dc2626' : '1px solid var(--border)', fontSize: 13 }}
                  value={editVehicle.registrationNumber}
                  onChange={(e) => {
                    setEditVehicle({ ...editVehicle, registrationNumber: e.target.value });
                    if (editErrors.registrationNumber) setEditErrors((prev) => ({ ...prev, registrationNumber: '' }));
                  }}
                />
                {editErrors.registrationNumber && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 4, margin: 0 }}>{editErrors.registrationNumber}</p>}
              </div>

              <div className="form-group">
                <label className="form-label form-label-required" style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>
                  Vehicle Type
                </label>
                <select
                  className="form-select"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: 13 }}
                  value={editVehicle.vehicleType}
                  onChange={(e) => setEditVehicle({ ...editVehicle, vehicleType: e.target.value as VehicleType })}
                >
                  <option value="CONTAINER_TRUCK">Container Truck</option>
                  <option value="TRUCK">Truck</option>
                  <option value="HEAVY_TRUCK">Heavy Truck</option>
                  <option value="MINI_TRUCK">Mini Truck</option>
                  <option value="VAN">Van</option>
                  <option value="TEMPO">Tempo</option>
                  <option value="REFRIGERATED_TRUCK">Refrigerated Truck</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>
                  Manufacturer
                </label>
                <input
                  type="text"
                  className="form-input"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: 13 }}
                  value={editVehicle.manufacturer}
                  onChange={(e) => setEditVehicle({ ...editVehicle, manufacturer: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-required" style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>
                  Model
                </label>
                <input
                  type="text"
                  className={`form-input ${editErrors.model ? 'error' : ''}`}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: editErrors.model ? '1px solid #dc2626' : '1px solid var(--border)', fontSize: 13 }}
                  value={editVehicle.model}
                  onChange={(e) => {
                    setEditVehicle({ ...editVehicle, model: e.target.value });
                    if (editErrors.model) setEditErrors((prev) => ({ ...prev, model: '' }));
                  }}
                />
                {editErrors.model && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 4, margin: 0 }}>{editErrors.model}</p>}
              </div>

              <div className="form-group">
                <label className="form-label form-label-required" style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>
                  Capacity
                </label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    type="text"
                    className={`form-input ${editErrors.capacity ? 'error' : ''}`}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius)', border: editErrors.capacity ? '1px solid #dc2626' : '1px solid var(--border)', fontSize: 13 }}
                    value={editVehicle.capacity}
                    onChange={(e) => {
                      setEditVehicle({ ...editVehicle, capacity: e.target.value });
                      if (editErrors.capacity) setEditErrors((prev) => ({ ...prev, capacity: '' }));
                    }}
                  />
                  <select
                    className="form-select"
                    style={{ width: 85, padding: '8px 8px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: 12 }}
                    value={editVehicle.capacityUnit}
                    onChange={(e) => setEditVehicle({ ...editVehicle, capacityUnit: e.target.value })}
                  >
                    <option value="TONS">TONS</option>
                    <option value="KG">KG</option>
                  </select>
                </div>
                {editErrors.capacity && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 4, margin: 0 }}>{editErrors.capacity}</p>}
              </div>

              <div className="form-group">
                <label className="form-label form-label-required" style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>
                  Registration Expiry
                </label>
                <input
                  type="date"
                  className="form-input"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: 13 }}
                  value={editVehicle.registrationExpiry}
                  onChange={(e) => setEditVehicle({ ...editVehicle, registrationExpiry: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-required" style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>
                  Insurance Expiry
                </label>
                <input
                  type="date"
                  className="form-input"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: 13 }}
                  value={editVehicle.insuranceExpiry}
                  onChange={(e) => setEditVehicle({ ...editVehicle, insuranceExpiry: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>
                  Assigned Warehouse
                </label>
                <select
                  className="form-select"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: 13 }}
                  value={editVehicle.warehouseId || ''}
                  onChange={(e) => {
                    const wId = e.target.value ? Number(e.target.value) : undefined;
                    const selectedWh = warehouses.find((w) => w.id === wId);
                    setEditVehicle({
                      ...editVehicle,
                      warehouseId: wId,
                      currentLocation: selectedWh ? selectedWh.name : editVehicle.currentLocation,
                    });
                  }}
                >
                  <option value="">No Warehouse (Unassigned)</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.warehouseName || w.name} ({w.warehouseCode || `ID #${w.id}`})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>
                  Assigned Driver
                </label>
                <select
                  className="form-select"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: 13 }}
                  value={editVehicle.driverId || ''}
                  onChange={(e) => setEditVehicle({ ...editVehicle, driverId: e.target.value })}
                >
                  <option value="">No Driver (Leave Unassigned)</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullName} ({d.phone}) — {d.status}
                    </option>
                  ))}
                </select>
              </div>
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
                {submittingEdit ? 'Saving...' : 'Update Vehicle'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── ASSIGN DRIVER MODAL ─────────────────────────────────────────── */}
      <Modal
        isOpen={assignModal.isOpen}
        onClose={() => {
          if (!assignModal.submitting) {
            setAssignModal({ isOpen: false, vehicle: null, driverId: '', submitting: false });
          }
        }}
        title="Assign Driver to Vehicle"
        size="sm"
      >
        {assignModal.vehicle && (
          <form onSubmit={handleSaveDriverAssignment}>
            <div style={{ padding: '4px 0' }}>
              <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px', marginBottom: 16 }}>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 2px 0' }}>Vehicle</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  {assignModal.vehicle.model} ({assignModal.vehicle.vehicleNumber})
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Plate: {assignModal.vehicle.registrationNumber} • Status: {assignModal.vehicle.status}
                </p>
              </div>

              <div className="form-group" style={{ marginBottom: 18 }}>
                <label className="form-label" style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>
                  Select Commercial Driver
                </label>
                <select
                  className="form-select"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: 13 }}
                  value={assignModal.driverId}
                  onChange={(e) => setAssignModal({ ...assignModal, driverId: e.target.value })}
                >
                  <option value="">-- No Driver (Unassign) --</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullName} ({d.phone}) — {d.status}
                    </option>
                  ))}
                </select>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  Only drivers not assigned to another active vehicle should be selected.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setAssignModal({ isOpen: false, vehicle: null, driverId: '', submitting: false })}
                  disabled={assignModal.submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={assignModal.submitting}
                >
                  {assignModal.submitting ? 'Updating...' : 'Save Assignment'}
                </button>
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* ── SAFE STATUS CONFIRMATION MODAL ───────────────────────────────── */}
      <Modal
        isOpen={statusModal.isOpen}
        onClose={() => {
          if (!statusModal.submitting) {
            setStatusModal({ isOpen: false, vehicle: null, targetStatus: 'AVAILABLE', submitting: false });
          }
        }}
        title={statusModal.targetStatus === 'INACTIVE' ? 'Deactivate Fleet Vehicle?' : `Transition Vehicle to ${statusModal.targetStatus}?`}
        size="sm"
      >
        {statusModal.vehicle && (
          <div style={{ padding: '6px 0' }}>
            {statusModal.targetStatus === 'INACTIVE' ? (
              <div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>
                  Are you sure you want to deactivate vehicle{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>
                    {statusModal.vehicle.model} ({statusModal.vehicle.vehicleNumber})
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
                  This safely marks the vehicle as <strong>INACTIVE</strong>, preventing it from new dispatch assignments while <strong>preserving all past shipment tracking records and driver trip history</strong> for operational and reporting purposes.
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
                Transition vehicle{' '}
                <strong style={{ color: 'var(--text-primary)' }}>
                  {statusModal.vehicle.model} ({statusModal.vehicle.vehicleNumber})
                </strong>{' '}
                status to <strong>{statusModal.targetStatus}</strong>?
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setStatusModal({ isOpen: false, vehicle: null, targetStatus: 'AVAILABLE', submitting: false })}
                disabled={statusModal.submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className={statusModal.targetStatus === 'INACTIVE' ? 'btn btn-danger btn-sm' : 'btn btn-primary btn-sm'}
                style={
                  statusModal.targetStatus === 'INACTIVE'
                    ? { background: '#dc2626', color: '#fff', border: 'none' }
                    : {}
                }
                onClick={handleExecuteStatusChange}
                disabled={statusModal.submitting}
              >
                {statusModal.submitting
                  ? 'Updating...'
                  : statusModal.targetStatus === 'INACTIVE'
                  ? 'Deactivate Vehicle'
                  : 'Confirm Status Change'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
