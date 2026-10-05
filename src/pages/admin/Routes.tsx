import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Route as RouteIcon,
  MapPin,
  Navigation,
  Clock,
  Truck,
  Plus,
  Search,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  User,
  Gauge,
  ExternalLink,
  Activity,
  Filter,
  X,
  Layers,
  Building2,
  Compass,
  FileText
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import Drawer from '../../components/common/Drawer';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/States';
import { useToast } from '../../components/common/Toast';
import InteractiveRouteMap from '../../components/routes/InteractiveRouteMap';
import routeService from '../../services/routeService';
import driverService from '../../services/driverService';
import vehicleService from '../../services/vehicleService';
import type {
  Route,
  RouteStatus,
  CreateRoutePayload,
  UpdateRoutePayload,
  RouteShipment
} from '../../types/route';
import type { AdminDriver } from '../../types/adminDriver';
import type { Vehicle } from '../../types/vehicle';
import { validateRequired, validatePositiveNumber } from '../../utils/validation';

export default function AdminRoutes() {
  const { showToast } = useToast();

  // ── SERVER STATE ──────────────────────────────────────────────────────
  const [routes, setRoutes] = useState<Route[]>([]);
  const [drivers, setDrivers] = useState<AdminDriver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── FILTERS & SEARCH ──────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [driverFilter, setDriverFilter] = useState<string>('ALL');
  const [vehicleFilter, setVehicleFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);

  // ── SELECTION & DRAWER ────────────────────────────────────────────────
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [drawerShipments, setDrawerShipments] = useState<RouteShipment[]>([]);
  const [loadingShipments, setLoadingShipments] = useState(false);

  // ── ADD ROUTE MODAL ───────────────────────────────────────────────────
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submittingAdd, setSubmittingAdd] = useState(false);
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});
  const [newRoute, setNewRoute] = useState<CreateRoutePayload>({
    routeCode: '',
    routeName: '',
    origin: '',
    originName: '',
    originCity: '',
    originState: '',
    destination: '',
    destinationName: '',
    destinationCity: '',
    destinationState: '',
    originAddress: '',
    destinationAddress: '',
    distanceKm: 250,
    estimatedTransitTimeHours: 5,
    status: 'ACTIVE',
    driverId: null,
    vehicleId: null,
    originLatitude: null,
    originLongitude: null,
    destinationLatitude: null,
    destinationLongitude: null,
  });

  // ── EDIT ROUTE MODAL ──────────────────────────────────────────────────
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [editFormData, setEditFormData] = useState<UpdateRoutePayload>({
    routeCode: '',
    routeName: '',
    origin: '',
    originName: '',
    originCity: '',
    originState: '',
    destination: '',
    destinationName: '',
    destinationCity: '',
    destinationState: '',
    originAddress: '',
    destinationAddress: '',
    distanceKm: 0,
    estimatedTransitTimeHours: 0,
    status: 'ACTIVE',
    driverId: null,
    vehicleId: null,
    originLatitude: null,
    originLongitude: null,
    destinationLatitude: null,
    destinationLongitude: null,
  });

  // ── DELETE ROUTE MODAL ────────────────────────────────────────────────
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState<Route | null>(null);
  const [submittingDelete, setSubmittingDelete] = useState(false);

  // ── DATA FETCHING ─────────────────────────────────────────────────────
  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const [routesData, driversData, vehiclesData] = await Promise.all([
        routeService.getAllRoutes(),
        driverService.getAllDrivers().catch(() => [] as AdminDriver[]),
        vehicleService.getAllVehicles().catch(() => [] as Vehicle[]),
      ]);

      setRoutes(routesData);
      setDrivers(driversData);
      setVehicles(vehiclesData);

      if (routesData.length > 0 && !selectedRoute) {
        setSelectedRoute(routesData[0]);
      }
    } catch (err: any) {
      console.error('Failed to load routes from backend:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to connect to routes API.';
      setError(msg);
      showToast('error', 'API Error', msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedRoute, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Fetch actual shipments when drawer opens for a route
  const handleOpenDrawer = async (route: Route) => {
    // When VIEW is clicked:
    // 1. Close Edit modal
    setIsEditOpen(false);
    // 2. Clear editingRoute
    setEditingRoute(null);
    setIsAddOpen(false);
    setIsDeleteOpen(false);

    // 3. Set selectedRoute
    setSelectedRoute(route);
    // 4. Open Route Details drawer
    setIsViewDrawerOpen(true);
    try {
      setLoadingShipments(true);
      const shipments = await routeService.getRouteShipments(route.id);
      setDrawerShipments(shipments);
    } catch (err) {
      console.warn('Failed to fetch shipments for route:', err);
      setDrawerShipments([]);
    } finally {
      setLoadingShipments(false);
    }
  };

  // ── COMPUTED STATS ────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = routes.length;
    const active = routes.filter((r) => r.status === 'ACTIVE').length;
    const inactive = routes.filter((r) => r.status === 'INACTIVE').length;
    const activeLoads = routes.reduce((acc, r) => acc + (Number(r.activeLoads) || 0), 0);
    return { total, active, inactive, activeLoads };
  }, [routes]);

  // ── FILTERED ROUTES ───────────────────────────────────────────────────
  const hasActiveFilters =
    search.trim() !== '' ||
    statusFilter !== 'ALL' ||
    driverFilter !== 'ALL' ||
    vehicleFilter !== 'ALL';

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setDriverFilter('ALL');
    setVehicleFilter('ALL');
    setPage(1);
  };

  const filteredRoutes = useMemo(() => {
    const term = search.trim().toLowerCase();
    return routes.filter((r) => {
      const matchSearch =
        !term ||
        r.routeCode.toLowerCase().includes(term) ||
        r.origin.toLowerCase().includes(term) ||
        r.destination.toLowerCase().includes(term) ||
        (r.originAddress && r.originAddress.toLowerCase().includes(term)) ||
        (r.destinationAddress && r.destinationAddress.toLowerCase().includes(term)) ||
        (r.driverName && r.driverName.toLowerCase().includes(term)) ||
        (r.vehicleNumber && r.vehicleNumber.toLowerCase().includes(term));

      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
      const matchDriver =
        driverFilter === 'ALL' ||
        (r.driverId && String(r.driverId) === driverFilter);
      const matchVehicle =
        vehicleFilter === 'ALL' ||
        (r.vehicleId && String(r.vehicleId) === vehicleFilter);

      return matchSearch && matchStatus && matchDriver && matchVehicle;
    });
  }, [routes, search, statusFilter, driverFilter, vehicleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRoutes.length / pageSize));
  const safePage = Math.max(1, Math.min(page, totalPages));

  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [page, totalPages]);

  const paginatedRoutes = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredRoutes.slice(start, start + pageSize);
  }, [filteredRoutes, safePage, pageSize]);

  // ── FORM VALIDATION ───────────────────────────────────────────────────
  const validateRouteForm = (
    data: CreateRoutePayload | UpdateRoutePayload
  ): Record<string, string> => {
    const errs: Record<string, string> = {};

    const orig = (data.originName || data.origin || '').trim();
    if (!orig) {
      errs.origin = 'Origin Location / Hub name is required.';
    }

    const dest = (data.destinationName || data.destination || '').trim();
    if (!dest) {
      errs.destination = 'Destination Location / Hub name is required.';
    } else if (orig && orig.toLowerCase() === dest.toLowerCase()) {
      errs.destination = 'Destination hub cannot be identical to Origin hub.';
    }

    const distRes = validatePositiveNumber(data.distanceKm, 'Distance (km)', 0.1);
    if (!distRes.isValid) errs.distanceKm = distRes.error!;

    const timeRes = validatePositiveNumber(
      data.estimatedTransitTimeHours,
      'Estimated Transit Time (hours)',
      0.1
    );
    if (!timeRes.isValid) errs.estimatedTransitTimeHours = timeRes.error!;

    // Latitude validation: -90 to 90
    if (data.originLatitude !== null && data.originLatitude !== undefined && (data.originLatitude as any) !== '') {
      const lat = Number(data.originLatitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        errs.originLatitude = 'Origin Latitude must be between -90 and 90.';
      }
    }

    // Longitude validation: -180 to 180
    if (data.originLongitude !== null && data.originLongitude !== undefined && (data.originLongitude as any) !== '') {
      const lng = Number(data.originLongitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        errs.originLongitude = 'Origin Longitude must be between -180 and 180.';
      }
    }

    if (data.destinationLatitude !== null && data.destinationLatitude !== undefined && (data.destinationLatitude as any) !== '') {
      const lat = Number(data.destinationLatitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        errs.destinationLatitude = 'Destination Latitude must be between -90 and 90.';
      }
    }

    if (data.destinationLongitude !== null && data.destinationLongitude !== undefined && (data.destinationLongitude as any) !== '') {
      const lng = Number(data.destinationLongitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        errs.destinationLongitude = 'Destination Longitude must be between -180 and 180.';
      }
    }

    return errs;
  };

  // ── ADD ROUTE HANDLER ─────────────────────────────────────────────────
  const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveOrigin = (newRoute.originName || newRoute.origin || '').trim();
    const effectiveDest = (newRoute.destinationName || newRoute.destination || '').trim();
    const payload: CreateRoutePayload = {
      ...newRoute,
      origin: effectiveOrigin,
      originName: effectiveOrigin,
      destination: effectiveDest,
      destinationName: effectiveDest,
      distance: newRoute.distanceKm,
      estimatedTransitHours: newRoute.estimatedTransitTimeHours,
    };

    const errors = validateRouteForm(payload);
    if (Object.keys(errors).length > 0) {
      setAddErrors(errors);
      showToast('error', 'Validation Error', 'Please correct the highlighted fields.');
      return;
    }
    setAddErrors({});

    try {
      setSubmittingAdd(true);
      const created = await routeService.createRoute(payload);
      setRoutes((prev) => [created, ...prev]);
      setSelectedRoute(created);
      setIsAddOpen(false);
      setNewRoute({
        routeCode: '',
        routeName: '',
        origin: '',
        originName: '',
        originCity: '',
        originState: '',
        destination: '',
        destinationName: '',
        destinationCity: '',
        destinationState: '',
        originAddress: '',
        destinationAddress: '',
        distanceKm: 250,
        estimatedTransitTimeHours: 5,
        status: 'ACTIVE',
        driverId: null,
        vehicleId: null,
        originLatitude: null,
        originLongitude: null,
        destinationLatitude: null,
        destinationLongitude: null,
      });
      showToast('success', 'Route Created', `Freight corridor ${created.routeCode} registered successfully in database.`);
    } catch (err: any) {
      if (err.response?.status === 409) {
        const msg = err.response?.data?.message || 'Driver or vehicle is already assigned to another active route.';
        const title = msg.toLowerCase().includes('driver') ? 'Driver unavailable' : 'Vehicle unavailable';
        showToast('error', title, msg);
      } else {
        const msg = err.response?.data?.message || err.message || 'Failed to create route.';
        showToast('error', 'Creation Failed', msg);
      }
    } finally {
      setSubmittingAdd(false);
    }
  };

  // ── EDIT ROUTE HANDLER ─────────────────────────────────────────────────
  const openEditModal = (route: Route) => {
    // 1. Clear/close the selected route
    setSelectedRoute(null);

    // 2. Close the Route Details drawer
    setIsViewDrawerOpen(false);
    setDrawerShipments([]);
    setLoadingShipments(false);
    setIsAddOpen(false);
    setIsDeleteOpen(false);

    // 3. Set the selected route as the route being edited
    setEditingRoute(route);
    setEditFormData({
      routeCode: route.routeCode,
      routeName: route.routeName || `${route.origin} → ${route.destination}`,
      origin: route.origin,
      originName: route.originName || route.origin,
      originCity: route.originCity || '',
      originState: route.originState || '',
      destination: route.destination,
      destinationName: route.destinationName || route.destination,
      destinationCity: route.destinationCity || '',
      destinationState: route.destinationState || '',
      originAddress: route.originAddress || '',
      destinationAddress: route.destinationAddress || '',
      distanceKm: route.distanceKm,
      estimatedTransitTimeHours: route.estimatedTransitTimeHours,
      status: route.status,
      driverId: route.driverId || null,
      vehicleId: route.vehicleId || null,
      originLatitude: route.originLatitude != null ? route.originLatitude : null,
      originLongitude: route.originLongitude != null ? route.originLongitude : null,
      destinationLatitude: route.destinationLatitude != null ? route.destinationLatitude : null,
      destinationLongitude: route.destinationLongitude != null ? route.destinationLongitude : null,
    });
    setEditErrors({});

    // 4. Open the Edit Freight Route modal
    setIsEditOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditOpen(false);
    setEditingRoute(null);
    setEditErrors({});
    setIsViewDrawerOpen(false);
  };

  const handleUpdateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoute) return;

    const effectiveOrigin = (editFormData.originName || editFormData.origin || '').trim();
    const effectiveDest = (editFormData.destinationName || editFormData.destination || '').trim();
    const payload: UpdateRoutePayload = {
      ...editFormData,
      origin: effectiveOrigin,
      originName: effectiveOrigin,
      destination: effectiveDest,
      destinationName: effectiveDest,
      distance: editFormData.distanceKm,
      estimatedTransitHours: editFormData.estimatedTransitTimeHours,
    };

    const errors = validateRouteForm(payload);
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      showToast('error', 'Validation Error', 'Please correct the highlighted fields.');
      return;
    }
    setEditErrors({});

    try {
      setSubmittingEdit(true);
      const updated = await routeService.updateRoute(editingRoute.id, payload);
      setRoutes((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setIsEditOpen(false);
      setEditingRoute(null);
      setIsViewDrawerOpen(false);
      setSelectedRoute(updated);
      showToast('success', 'Route Updated', `Corridor ${updated.routeCode} updated successfully.`);
    } catch (err: any) {
      if (err.response?.status === 409) {
        const msg = err.response?.data?.message || 'Driver or vehicle is already assigned to another active route.';
        const title = msg.toLowerCase().includes('driver') ? 'Driver unavailable' : 'Vehicle unavailable';
        showToast('error', title, msg);
      } else {
        const msg = err.response?.data?.message || err.message || 'Failed to update route.';
        showToast('error', 'Update Failed', msg);
      }
    } finally {
      setSubmittingEdit(false);
    }
  };

  // ── TOGGLE STATUS ─────────────────────────────────────────────────────
  const handleToggleStatus = async (route: Route) => {
    const nextStatus: RouteStatus = route.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const updated = await routeService.updateRouteStatus(route.id, nextStatus);
      setRoutes((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      if (selectedRoute?.id === updated.id) {
        setSelectedRoute(updated);
      }
      showToast('success', 'Status Changed', `Corridor ${updated.routeCode} is now ${nextStatus}.`);
    } catch (err: any) {
      if (err.response?.status === 409) {
        const msg = err.response?.data?.message || 'Driver or vehicle is already assigned to another active route.';
        const title = msg.toLowerCase().includes('driver') ? 'Driver unavailable' : 'Vehicle unavailable';
        showToast('error', title, msg);
      } else {
        const msg = err.response?.data?.message || err.message || 'Failed to update status.';
        showToast('error', 'Action Failed', msg);
      }
    }
  };

  // ── DELETE ROUTE ──────────────────────────────────────────────────────
  const openDeleteModal = (route: Route) => {
    setSelectedRoute(null);
    setIsViewDrawerOpen(false);
    setIsEditOpen(false);
    setEditingRoute(null);
    setRouteToDelete(route);
    setIsDeleteOpen(true);
  };

  const handleDeleteRoute = async () => {
    if (!routeToDelete) return;

    try {
      setSubmittingDelete(true);
      await routeService.deleteRoute(routeToDelete.id);
      setRoutes((prev) => prev.filter((r) => r.id !== routeToDelete.id));
      if (selectedRoute?.id === routeToDelete.id) {
        setSelectedRoute(routes.find((r) => r.id !== routeToDelete.id) || null);
      }
      setIsDeleteOpen(false);
      showToast('success', 'Route Deleted', `Freight corridor ${routeToDelete.routeCode} has been removed.`);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete route.';
      showToast('error', 'Cannot Delete Route', msg);
    } finally {
      setSubmittingDelete(false);
    }
  };

  // Driver initials helper
  const getDriverInitials = (name?: string) => {
    if (!name) return 'UN';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  // Helper to determine if a driver is assigned to another active route
  const isDriverAssignedToOtherActiveRoute = useCallback(
    (driverId: number | string, excludeRouteId?: number | null): boolean => {
      const dNum = Number(driverId);
      return routes.some(
        (r) => r.status === 'ACTIVE' && Number(r.driverId) === dNum && (excludeRouteId == null || r.id !== excludeRouteId)
      );
    },
    [routes]
  );

  // Helper to determine if a vehicle is assigned to another active route
  const isVehicleAssignedToOtherActiveRoute = useCallback(
    (vehicleId: number | string, excludeRouteId?: number | null): boolean => {
      const vNum = Number(vehicleId);
      return routes.some(
        (r) => r.status === 'ACTIVE' && Number(r.vehicleId) === vNum && (excludeRouteId == null || r.id !== excludeRouteId)
      );
    },
    [routes]
  );

  return (
    <div className="routes-page-container">
      {/* ── 1. PROFESSIONAL HEADER ── */}
      <div className="routes-header">
        <div className="routes-header-left">
          <div className="routes-header-icon">
            <RouteIcon size={22} />
          </div>
          <div>
            <div className="routes-header-title-row">
              <h1 className="routes-title">Routes & Network</h1>
              <div className="routes-operational-badge">
                <span className="routes-pulsing-dot"></span>
                <span>Network Operational</span>
              </div>
            </div>
            <p className="routes-subtitle">
              Manage freight corridors, fleet assignments and live route operations.
            </p>
          </div>
        </div>

        <div className="routes-header-actions">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing || loading}
            className="btn btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 15px', borderRadius: 10, fontSize: 13, fontWeight: 600 }}
            title="Refresh database records"
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} style={{ color: refreshing ? 'var(--primary)' : 'inherit' }} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <button
            onClick={() => {
              setSelectedRoute(null);
              setIsViewDrawerOpen(false);
              setIsEditOpen(false);
              setEditingRoute(null);
              setAddErrors({});
              setIsAddOpen(true);
            }}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700 }}
          >
            <Plus size={16} />
            <span>+ Create Route</span>
          </button>
        </div>
      </div>

      {/* ── 2. KPI CARDS (4 HORIZONTAL CARDS) ── */}
      <div className="routes-kpi-grid">
        {/* TOTAL ROUTES */}
        <div className="routes-kpi-card">
          <div>
            <div className="routes-kpi-label">TOTAL ROUTES</div>
            <div className="routes-kpi-number">
              {loading ? <span style={{ color: '#cbd5e1' }}>...</span> : stats.total}
            </div>
            <div className="routes-kpi-desc">All corridors</div>
          </div>
          <div className="routes-kpi-icon-wrap routes-kpi-icon-blue">
            <RouteIcon size={24} />
          </div>
        </div>

        {/* ACTIVE ROUTES */}
        <div className="routes-kpi-card">
          <div>
            <div className="routes-kpi-label">ACTIVE ROUTES</div>
            <div className="routes-kpi-number" style={{ color: '#059669' }}>
              {loading ? <span style={{ color: '#cbd5e1' }}>...</span> : stats.active}
            </div>
            <div className="routes-kpi-desc">Operational</div>
          </div>
          <div className="routes-kpi-icon-wrap routes-kpi-icon-emerald">
            <CheckCircle2 size={24} />
          </div>
        </div>

        {/* INACTIVE */}
        <div className="routes-kpi-card">
          <div>
            <div className="routes-kpi-label">INACTIVE</div>
            <div className="routes-kpi-number" style={{ color: '#475569' }}>
              {loading ? <span style={{ color: '#cbd5e1' }}>...</span> : stats.inactive}
            </div>
            <div className="routes-kpi-desc">Standby</div>
          </div>
          <div className="routes-kpi-icon-wrap routes-kpi-icon-slate">
            <Clock size={24} />
          </div>
        </div>

        {/* ACTIVE LOADS */}
        <div className="routes-kpi-card">
          <div>
            <div className="routes-kpi-label">ACTIVE LOADS</div>
            <div className="routes-kpi-number" style={{ color: '#2563eb' }}>
              {loading ? <span style={{ color: '#cbd5e1' }}>...</span> : stats.activeLoads}
            </div>
            <div className="routes-kpi-desc">In transit</div>
          </div>
          <div className="routes-kpi-icon-wrap routes-kpi-icon-indigo">
            <Truck size={24} />
          </div>
        </div>
      </div>

      {/* ── 3. LARGE LIVE MAP + 4. FLOATING ROUTE OVERLAY + 5. LEGEND ── */}
      <InteractiveRouteMap
        routes={routes}
        selectedRoute={selectedRoute}
        onSelectRoute={(r) => setSelectedRoute(r)}
        onViewDetails={(r) => handleOpenDrawer(r)}
        height={500}
        hideOverlay={isViewDrawerOpen || isEditOpen || isAddOpen || isDeleteOpen}
      />

      {/* ── 6. SEARCH + FILTER TOOLBAR ── */}
      <div className="routes-toolbar-card">
        {/* Search */}
        <div className="routes-search-wrap">
          <Search size={16} className="routes-search-icon" />
          <input
            type="text"
            className="routes-search-input"
            placeholder="Search route, origin, destination, driver or vehicle..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Filters */}
        <div className="routes-filter-group">
          {/* Status filter */}
          <div className="routes-filter-item">
            <label className="routes-filter-label">Status</label>
            <select
              className="routes-filter-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setPage(1);
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          {/* Driver filter */}
          <div className="routes-filter-item">
            <label className="routes-filter-label">Driver</label>
            <select
              className="routes-filter-select"
              value={driverFilter}
              onChange={(e) => {
                setDriverFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All Drivers</option>
              {drivers.map((d) => (
                <option key={d.id} value={String(d.id)}>
                  {d.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle filter */}
          <div className="routes-filter-item">
            <label className="routes-filter-label">Vehicle</label>
            <select
              className="routes-filter-select"
              value={vehicleFilter}
              onChange={(e) => {
                setVehicleFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All Vehicles</option>
              {vehicles.map((v) => (
                <option key={v.id} value={String(v.id)}>
                  {v.vehicleNumber} ({v.model || v.vehicleType})
                </option>
              ))}
            </select>
          </div>

          {/* Clear button */}
          {hasActiveFilters && (
            <button onClick={clearFilters} className="routes-clear-btn" title="Reset all filters">
              <X size={14} />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* ── ERROR STATE (IF ANY) ── */}
      {error && (
        <div
          style={{
            padding: '12px 16px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 12,
            color: '#991b1b',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadData()}
            style={{
              padding: '4px 10px',
              background: '#ffffff',
              border: '1px solid #fecaca',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              color: '#991b1b',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── 7. PROFESSIONAL ROUTE TABLE ── */}
      <div className="table-container routes-table-container" style={{ width: '100%', maxWidth: '100%' }}>
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw size={28} className="spin" style={{ margin: '0 auto 12px', color: 'var(--primary)', display: 'block' }} />
            <p style={{ fontSize: 14, fontWeight: 500 }}>Loading freight corridors...</p>
          </div>
        ) : filteredRoutes.length === 0 ? (
          <div style={{ padding: '50px 20px' }}>
            <EmptyState
              title="No Freight Corridors Found"
              description={
                hasActiveFilters
                  ? 'No routes match your search or filters.'
                  : 'Create your first freight route to start managing your logistics network.'
              }
              action={
                <button
                  onClick={() => {
                    setSelectedRoute(null);
                    setIsViewDrawerOpen(false);
                    setIsEditOpen(false);
                    setEditingRoute(null);
                    setAddErrors({});
                    setIsAddOpen(true);
                  }}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 10, padding: '9px 18px' }}
                >
                  <Plus size={16} />
                  <span>+ Create Route</span>
                </button>
              }
            />
          </div>
        ) : (
          <div className="table-container routes-table-scroll" style={{ width: '100%', maxWidth: '100%' }}>
            <table className="routes-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '22%' }}>Route</th>
                  <th style={{ width: '20%' }}>Origin</th>
                  <th style={{ width: '20%' }}>Destination</th>
                  <th style={{ width: '14%' }}>Active Shipments</th>
                  <th style={{ width: '12%' }}>Status</th>
                  <th style={{ textAlign: 'center', width: '12%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRoutes.map((r) => {
                  const isSelected = selectedRoute?.id === r.id;
                  const activeLoadsCount = Number(r.activeLoads) || 0;
                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedRoute(r)}
                      className={`routes-table-row ${isSelected ? 'selected' : ''}`}
                    >
                      {/* 1. ROUTE */}
                      <td>
                        <span className="routes-code-pill">{r.routeCode}</span>
                        <div className="routes-corridor-title" style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginTop: 2 }}>
                          {r.routeName || `${r.origin} ↔ ${r.destination}`}
                        </div>
                      </td>

                      {/* 2. ORIGIN */}
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }}>{r.origin}</div>
                        <span style={{ fontSize: 11.5, color: '#64748b' }}>Origin Hub</span>
                      </td>

                      {/* 3. DESTINATION */}
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }}>{r.destination}</div>
                        <span style={{ fontSize: 11.5, color: '#64748b' }}>Destination Hub</span>
                      </td>

                      {/* 4. LOADS */}
                      <td>
                        <span className={`load-count-badge ${activeLoadsCount === 0 ? 'zero' : ''}`}>
                          <Activity size={12} />
                          <span>{activeLoadsCount} Active</span>
                        </span>
                      </td>

                      {/* 5. STATUS */}
                      <td>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(r);
                          }}
                          className={`status-indicator-pill ${r.status === 'ACTIVE' ? 'active' : 'inactive'}`}
                          title="Click to toggle status"
                          style={{ cursor: 'pointer' }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              backgroundColor: r.status === 'ACTIVE' ? '#10b981' : '#94a3b8'
                            }}
                          ></span>
                          <span>{r.status}</span>
                        </span>
                      </td>

                      {/* 6. ACTIONS */}
                      <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div
                          className="routes-actions-cell"
                          style={{ justifyContent: 'center', gap: 6, flexWrap: 'nowrap' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleOpenDrawer(r)}
                            className="btn btn-outline btn-xs"
                            title="View Corridor Details & Shipments"
                            style={{ gap: 4, height: 26, padding: '0 8px', fontSize: 11.5 }}
                          >
                            <Eye size={12} />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => openEditModal(r)}
                            className="btn-icon btn-xs"
                            title="Edit Corridor"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(r)}
                            className="btn-icon btn-xs"
                            title="Delete Corridor"
                            style={{ color: '#ef4444' }}
                          >
                            <Trash2 size={13} />
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

        {/* Pagination bar */}
        {filteredRoutes.length > pageSize && (
          <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)', background: '#f8fafc' }}>
            <Pagination
              page={page}
              pageSize={pageSize}
              total={filteredRoutes.length}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>

      {/* ── 9. ROUTE DETAILS DRAWER (460px width) ── */}
      <Drawer
        isOpen={isViewDrawerOpen && !isEditOpen && !isAddOpen && !isDeleteOpen}
        onClose={() => {
          setIsViewDrawerOpen(false);
          setSelectedRoute(null);
        }}
        title="Route Details"
      >
        {selectedRoute && !isEditOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Header info */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: '16px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                  CORRIDOR CODE
                </div>
                <div className="routes-drawer-header-code">{selectedRoute.routeCode}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginTop: 2 }}>
                  {selectedRoute.origin} → {selectedRoute.destination}
                </div>
              </div>
              <span className={`status-indicator-pill ${selectedRoute.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: selectedRoute.status === 'ACTIVE' ? '#10b981' : '#94a3b8'
                  }}
                ></span>
                <span>{selectedRoute.status}</span>
              </span>
            </div>

            {/* ROUTE Section */}
            <div className="routes-drawer-section">
              <div className="routes-drawer-section-title">
                <Compass size={14} color="var(--primary)" />
                <span>ROUTE</span>
              </div>
              <div className="routes-drawer-data-grid">
                <div>
                  <div className="routes-drawer-field-label">Origin</div>
                  <div className="routes-drawer-field-value">{selectedRoute.origin}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                    {selectedRoute.originAddress || 'Standard Logistics Terminal'}
                  </div>
                </div>
                <div>
                  <div className="routes-drawer-field-label">Destination</div>
                  <div className="routes-drawer-field-value">{selectedRoute.destination}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                    {selectedRoute.destinationAddress || 'Commercial Freight Port'}
                  </div>
                </div>
                <div>
                  <div className="routes-drawer-field-label">Distance</div>
                  <div className="routes-drawer-field-value">{selectedRoute.distanceKm} km</div>
                </div>
                <div>
                  <div className="routes-drawer-field-label">Transit</div>
                  <div className="routes-drawer-field-value">~{selectedRoute.estimatedTransitTimeHours} hrs</div>
                </div>
              </div>
            </div>

            {/* DISPATCH Section */}
            <div className="routes-drawer-section">
              <div className="routes-drawer-section-title">
                <Truck size={14} color="var(--primary)" />
                <span>DISPATCH</span>
              </div>
              <div className="routes-drawer-data-grid">
                <div>
                  <div className="routes-drawer-field-label">Driver</div>
                  <div className="routes-drawer-field-value">
                    {selectedRoute.driverName || <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Unassigned</span>}
                  </div>
                  {selectedRoute.driverPhone && (
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{selectedRoute.driverPhone}</div>
                  )}
                  {selectedRoute.status === 'ACTIVE' && selectedRoute.driverId && isDriverAssignedToOtherActiveRoute(selectedRoute.driverId, selectedRoute.id) && (
                    <div style={{ fontSize: 11, color: '#b45309', background: '#fef3c7', padding: '3px 6px', borderRadius: 4, marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <AlertTriangle size={12} /> Conflict: Driver assigned to another active route
                    </div>
                  )}
                </div>
                <div>
                  <div className="routes-drawer-field-label">Vehicle</div>
                  <div className="routes-drawer-field-value">
                    {selectedRoute.vehicleNumber || <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Unassigned</span>}
                  </div>
                  {selectedRoute.vehicleModel && (
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{selectedRoute.vehicleModel}</div>
                  )}
                  {selectedRoute.status === 'ACTIVE' && selectedRoute.vehicleId && isVehicleAssignedToOtherActiveRoute(selectedRoute.vehicleId, selectedRoute.id) && (
                    <div style={{ fontSize: 11, color: '#b45309', background: '#fef3c7', padding: '3px 6px', borderRadius: 4, marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <AlertTriangle size={12} /> Conflict: Vehicle assigned to another active route
                    </div>
                  )}
                </div>
                <div>
                  <div className="routes-drawer-field-label">Active Loads</div>
                  <div className="routes-drawer-field-value" style={{ color: 'var(--primary)' }}>
                    {selectedRoute.activeLoads || 0}
                  </div>
                </div>
                <div>
                  <div className="routes-drawer-field-label">Vehicle Type</div>
                  <div className="routes-drawer-field-value">
                    {selectedRoute.vehicleType || 'Standard Fleet'}
                  </div>
                </div>
              </div>
            </div>

            {/* SHIPMENTS Section */}
            <div className="routes-drawer-section">
              <div className="routes-drawer-section-title">
                <FileText size={14} color="var(--primary)" />
                <span>SHIPMENTS</span>
              </div>

              {loadingShipments ? (
                <div style={{ padding: '20px 0', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                  <RefreshCw size={18} className="spin" style={{ margin: '0 auto 8px', color: 'var(--primary)', display: 'block' }} />
                  <span>Loading assigned shipments...</span>
                </div>
              ) : drawerShipments.length === 0 ? (
                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: 8, textAlign: 'center', fontSize: 12.5, color: 'var(--text-muted)' }}>
                  No active shipments currently on this route corridor.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
                  {drawerShipments.map((s) => (
                    <div key={s.id} className="routes-drawer-shipment-item">
                      <div className="routes-drawer-shipment-top">
                        <strong style={{ color: 'var(--primary)', fontSize: 13 }}>{s.trackingNumber}</strong>
                        <StatusBadge status={s.status} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#475569' }}>
                        <span>Order: <strong>{s.orderNumber || 'N/A'}</strong></span>
                        <span>Location: {s.currentLocationName || 'In Transit'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* TRACKING Section (real coordinates only) */}
            {selectedRoute.currentShipmentTrackingNumber && (
              <div className="routes-drawer-section" style={{ background: '#f5f3ff', borderColor: '#ddd6fe' }}>
                <div className="routes-drawer-section-title" style={{ color: '#6d28d9' }}>
                  <Navigation size={14} color="#6d28d9" />
                  <span>LIVE TRACKING TELEMETRY</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6d28d9', fontWeight: 600 }}>Active Shipment:</span>
                    <strong>{selectedRoute.currentShipmentTrackingNumber}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6d28d9', fontWeight: 600 }}>Current Location:</span>
                    <span>{selectedRoute.currentShipmentLocation || 'In Transit'}</span>
                  </div>
                  {selectedRoute.currentShipmentLatitude && selectedRoute.currentShipmentLongitude && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#7c3aed' }}>
                      <span>GPS Coordinates:</span>
                      <span>{selectedRoute.currentShipmentLatitude.toFixed(4)}, {selectedRoute.currentShipmentLongitude.toFixed(4)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Drawer Bottom Actions */}
            <div style={{ display: 'flex', gap: 10, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <button
                onClick={() => {
                  const targetRoute = selectedRoute;
                  setIsViewDrawerOpen(false);
                  setSelectedRoute(null);
                  if (targetRoute) {
                    openEditModal(targetRoute);
                  }
                }}
                className="btn btn-primary"
                style={{ flex: 1, padding: '10px 16px', borderRadius: 10, fontSize: 13 }}
              >
                Edit Corridor
              </button>
              <button
                onClick={() => {
                  setIsViewDrawerOpen(false);
                  setSelectedRoute(null);
                }}
                className="btn btn-outline"
                style={{ padding: '10px 16px', borderRadius: 10, fontSize: 13 }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Drawer>

      {/* ── 10. CREATE ROUTE MODAL ── */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setAddErrors({});
        }}
        title="Create Freight Corridor"
        size="lg"
      >
        <form onSubmit={handleAddRoute} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* ── SECTION 1: CORRIDOR OVERVIEW ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {/* Route Code */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                Route Code (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. RT-BLR-HYD-06"
                value={newRoute.routeCode || ''}
                onChange={(e) => setNewRoute({ ...newRoute, routeCode: e.target.value })}
                className="routes-search-input"
                style={{ paddingLeft: 12 }}
              />
            </div>

            {/* Route Name */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                Route Name
              </label>
              <input
                type="text"
                placeholder="e.g. Bengaluru → Hyderabad Express"
                value={newRoute.routeName || ''}
                onChange={(e) => setNewRoute({ ...newRoute, routeName: e.target.value })}
                className="routes-search-input"
                style={{ paddingLeft: 12 }}
              />
            </div>

            {/* Status */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                Status
              </label>
              <select
                value={newRoute.status}
                onChange={(e) => setNewRoute({ ...newRoute, status: e.target.value as RouteStatus })}
                className="routes-filter-select"
                style={{ width: '100%' }}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          {/* ── SECTION 2: ORIGIN LOCATION ── */}
          <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#059669', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={14} />
              <span>ORIGIN LOCATION</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {/* Origin Location Name */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                  Location Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bengaluru Central Hub"
                  value={newRoute.originName || newRoute.origin || ''}
                  onChange={(e) => setNewRoute({ ...newRoute, origin: e.target.value, originName: e.target.value })}
                  className="routes-search-input"
                  style={{
                    paddingLeft: 12,
                    borderColor: addErrors.origin ? '#ef4444' : undefined,
                    background: addErrors.origin ? '#fef2f2' : undefined
                  }}
                />
                {addErrors.origin && <p style={{ fontSize: 11, color: '#dc2626', margin: '4px 0 0' }}>{addErrors.origin}</p>}
              </div>

              {/* Origin Address */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                  Terminal Address
                </label>
                <input
                  type="text"
                  placeholder="Mahatma Gandhi Rd, Bengaluru"
                  value={newRoute.originAddress || ''}
                  onChange={(e) => setNewRoute({ ...newRoute, originAddress: e.target.value })}
                  className="routes-search-input"
                  style={{ paddingLeft: 12 }}
                />
              </div>

              {/* Origin City */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                  City
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bengaluru"
                  value={newRoute.originCity || ''}
                  onChange={(e) => setNewRoute({ ...newRoute, originCity: e.target.value })}
                  className="routes-search-input"
                  style={{ paddingLeft: 12 }}
                />
              </div>

              {/* Origin State */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                  State
                </label>
                <input
                  type="text"
                  placeholder="e.g. Karnataka"
                  value={newRoute.originState || ''}
                  onChange={(e) => setNewRoute({ ...newRoute, originState: e.target.value })}
                  className="routes-search-input"
                  style={{ paddingLeft: 12 }}
                />
              </div>

              {/* Origin Latitude */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                  Latitude (-90 to 90)
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 12.9716"
                  value={newRoute.originLatitude ?? ''}
                  onChange={(e) => setNewRoute({ ...newRoute, originLatitude: e.target.value !== '' ? parseFloat(e.target.value) : null })}
                  className="routes-search-input"
                  style={{
                    paddingLeft: 12,
                    borderColor: addErrors.originLatitude ? '#ef4444' : undefined
                  }}
                />
                {addErrors.originLatitude && <p style={{ fontSize: 11, color: '#dc2626', margin: '4px 0 0' }}>{addErrors.originLatitude}</p>}
              </div>

              {/* Origin Longitude */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                  Longitude (-180 to 180)
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 77.5946"
                  value={newRoute.originLongitude ?? ''}
                  onChange={(e) => setNewRoute({ ...newRoute, originLongitude: e.target.value !== '' ? parseFloat(e.target.value) : null })}
                  className="routes-search-input"
                  style={{
                    paddingLeft: 12,
                    borderColor: addErrors.originLongitude ? '#ef4444' : undefined
                  }}
                />
                {addErrors.originLongitude && <p style={{ fontSize: 11, color: '#dc2626', margin: '4px 0 0' }}>{addErrors.originLongitude}</p>}
              </div>
            </div>
          </div>

          {/* ── SECTION 3: DESTINATION LOCATION ── */}
          <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Navigation size={14} />
              <span>DESTINATION LOCATION</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {/* Destination Location Name */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                  Location Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hyderabad Logistics Hub"
                  value={newRoute.destinationName || newRoute.destination || ''}
                  onChange={(e) => setNewRoute({ ...newRoute, destination: e.target.value, destinationName: e.target.value })}
                  className="routes-search-input"
                  style={{
                    paddingLeft: 12,
                    borderColor: addErrors.destination ? '#ef4444' : undefined,
                    background: addErrors.destination ? '#fef2f2' : undefined
                  }}
                />
                {addErrors.destination && <p style={{ fontSize: 11, color: '#dc2626', margin: '4px 0 0' }}>{addErrors.destination}</p>}
              </div>

              {/* Destination Address */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                  Terminal Address
                </label>
                <input
                  type="text"
                  placeholder="Shamshabad Cargo Complex"
                  value={newRoute.destinationAddress || ''}
                  onChange={(e) => setNewRoute({ ...newRoute, destinationAddress: e.target.value })}
                  className="routes-search-input"
                  style={{ paddingLeft: 12 }}
                />
              </div>

              {/* Destination City */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                  City
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hyderabad"
                  value={newRoute.destinationCity || ''}
                  onChange={(e) => setNewRoute({ ...newRoute, destinationCity: e.target.value })}
                  className="routes-search-input"
                  style={{ paddingLeft: 12 }}
                />
              </div>

              {/* Destination State */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                  State
                </label>
                <input
                  type="text"
                  placeholder="e.g. Telangana"
                  value={newRoute.destinationState || ''}
                  onChange={(e) => setNewRoute({ ...newRoute, destinationState: e.target.value })}
                  className="routes-search-input"
                  style={{ paddingLeft: 12 }}
                />
              </div>

              {/* Destination Latitude */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                  Latitude (-90 to 90)
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 17.3850"
                  value={newRoute.destinationLatitude ?? ''}
                  onChange={(e) => setNewRoute({ ...newRoute, destinationLatitude: e.target.value !== '' ? parseFloat(e.target.value) : null })}
                  className="routes-search-input"
                  style={{
                    paddingLeft: 12,
                    borderColor: addErrors.destinationLatitude ? '#ef4444' : undefined
                  }}
                />
                {addErrors.destinationLatitude && <p style={{ fontSize: 11, color: '#dc2626', margin: '4px 0 0' }}>{addErrors.destinationLatitude}</p>}
              </div>

              {/* Destination Longitude */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                  Longitude (-180 to 180)
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 78.4867"
                  value={newRoute.destinationLongitude ?? ''}
                  onChange={(e) => setNewRoute({ ...newRoute, destinationLongitude: e.target.value !== '' ? parseFloat(e.target.value) : null })}
                  className="routes-search-input"
                  style={{
                    paddingLeft: 12,
                    borderColor: addErrors.destinationLongitude ? '#ef4444' : undefined
                  }}
                />
                {addErrors.destinationLongitude && <p style={{ fontSize: 11, color: '#dc2626', margin: '4px 0 0' }}>{addErrors.destinationLongitude}</p>}
              </div>
            </div>
          </div>

          {/* ── SECTION 4: METRICS & FLEET ASSIGNMENT ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {/* Distance */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                Distance (km) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={newRoute.distanceKm}
                onChange={(e) => setNewRoute({ ...newRoute, distanceKm: parseFloat(e.target.value) || 0 })}
                className="routes-search-input"
                style={{
                  paddingLeft: 12,
                  borderColor: addErrors.distanceKm ? '#ef4444' : undefined
                }}
              />
              {addErrors.distanceKm && <p style={{ fontSize: 11, color: '#dc2626', margin: '4px 0 0' }}>{addErrors.distanceKm}</p>}
            </div>

            {/* Estimated Transit Time */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                Transit Time (Hours) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={newRoute.estimatedTransitTimeHours}
                onChange={(e) => setNewRoute({ ...newRoute, estimatedTransitTimeHours: parseFloat(e.target.value) || 0 })}
                className="routes-search-input"
                style={{
                  paddingLeft: 12,
                  borderColor: addErrors.estimatedTransitTimeHours ? '#ef4444' : undefined
                }}
              />
              {addErrors.estimatedTransitTimeHours && (
                <p style={{ fontSize: 11, color: '#dc2626', margin: '4px 0 0' }}>{addErrors.estimatedTransitTimeHours}</p>
              )}
            </div>

            {/* Assign Driver */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                Assign Dedicated Driver
              </label>
              <select
                value={newRoute.driverId || ''}
                onChange={(e) => setNewRoute({ ...newRoute, driverId: e.target.value ? Number(e.target.value) : null })}
                className="routes-filter-select"
                style={{ width: '100%' }}
              >
                <option value="">-- No Driver Assigned --</option>
                {drivers.map((d) => {
                  const isAssigned = isDriverAssignedToOtherActiveRoute(d.id);
                  return (
                    <option key={d.id} value={d.id} disabled={isAssigned}>
                      {d.fullName} {d.phone ? `(${d.phone})` : ''} {isAssigned ? '— Unavailable (Already assigned)' : `- ${d.status}`}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Assign Vehicle */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                Assign Dedicated Vehicle
              </label>
              <select
                value={newRoute.vehicleId || ''}
                onChange={(e) => setNewRoute({ ...newRoute, vehicleId: e.target.value ? Number(e.target.value) : null })}
                className="routes-filter-select"
                style={{ width: '100%' }}
              >
                <option value="">-- No Vehicle Assigned --</option>
                {vehicles.map((v) => {
                  const isAssigned = isVehicleAssignedToOtherActiveRoute(v.id);
                  return (
                    <option key={v.id} value={v.id} disabled={isAssigned}>
                      {v.vehicleNumber} {v.model ? `(${v.model})` : (v.vehicleType ? `(${v.vehicleType})` : '')} {isAssigned ? '— Unavailable (Already assigned)' : `- ${v.status}`}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="btn btn-outline"
              style={{ padding: '8px 16px', borderRadius: 10 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingAdd}
              className="btn btn-primary"
              style={{ padding: '8px 20px', borderRadius: 10, fontWeight: 700 }}
            >
              {submittingAdd ? 'Saving...' : 'Create Route'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── 11. EDIT ROUTE MODAL ── */}
      <Modal
        isOpen={isEditOpen && !isViewDrawerOpen}
        onClose={handleCloseEditModal}
        title={`Edit Freight Route: ${editingRoute?.routeCode || ''}`}
        size="lg"
      >
        <form onSubmit={handleUpdateRoute} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* ── SECTION 1: CORRIDOR OVERVIEW ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {/* Route Code */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                Route Code
              </label>
              <input
                type="text"
                value={editFormData.routeCode || ''}
                onChange={(e) => setEditFormData({ ...editFormData, routeCode: e.target.value })}
                className="routes-search-input"
                style={{ paddingLeft: 12 }}
              />
            </div>

            {/* Route Name */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                Route Name
              </label>
              <input
                type="text"
                value={editFormData.routeName || ''}
                onChange={(e) => setEditFormData({ ...editFormData, routeName: e.target.value })}
                className="routes-search-input"
                style={{ paddingLeft: 12 }}
              />
            </div>

            {/* Status */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                Status
              </label>
              <select
                value={editFormData.status}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as RouteStatus })}
                className="routes-filter-select"
                style={{ width: '100%' }}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          {/* ── SECTION 2: ORIGIN LOCATION ── */}
          <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#059669', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={14} />
              <span>ORIGIN LOCATION</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {/* Origin Location Name */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                  Location Name *
                </label>
                <input
                  type="text"
                  value={editFormData.originName || editFormData.origin || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, origin: e.target.value, originName: e.target.value })}
                  className="routes-search-input"
                  style={{
                    paddingLeft: 12,
                    borderColor: editErrors.origin ? '#ef4444' : undefined,
                    background: editErrors.origin ? '#fef2f2' : undefined
                  }}
                />
                {editErrors.origin && <p style={{ fontSize: 11, color: '#dc2626', margin: '4px 0 0' }}>{editErrors.origin}</p>}
              </div>

              {/* Origin Address */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                  Terminal Address
                </label>
                <input
                  type="text"
                  value={editFormData.originAddress || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, originAddress: e.target.value })}
                  className="routes-search-input"
                  style={{ paddingLeft: 12 }}
                />
              </div>

              {/* Origin City */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                  City
                </label>
                <input
                  type="text"
                  value={editFormData.originCity || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, originCity: e.target.value })}
                  className="routes-search-input"
                  style={{ paddingLeft: 12 }}
                />
              </div>

              {/* Origin State */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                  State
                </label>
                <input
                  type="text"
                  value={editFormData.originState || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, originState: e.target.value })}
                  className="routes-search-input"
                  style={{ paddingLeft: 12 }}
                />
              </div>

              {/* Origin Latitude */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                  Latitude (-90 to 90)
                </label>
                <input
                  type="number"
                  step="any"
                  value={editFormData.originLatitude ?? ''}
                  onChange={(e) => setEditFormData({ ...editFormData, originLatitude: e.target.value !== '' ? parseFloat(e.target.value) : null })}
                  className="routes-search-input"
                  style={{
                    paddingLeft: 12,
                    borderColor: editErrors.originLatitude ? '#ef4444' : undefined
                  }}
                />
                {editErrors.originLatitude && <p style={{ fontSize: 11, color: '#dc2626', margin: '4px 0 0' }}>{editErrors.originLatitude}</p>}
              </div>

              {/* Origin Longitude */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                  Longitude (-180 to 180)
                </label>
                <input
                  type="number"
                  step="any"
                  value={editFormData.originLongitude ?? ''}
                  onChange={(e) => setEditFormData({ ...editFormData, originLongitude: e.target.value !== '' ? parseFloat(e.target.value) : null })}
                  className="routes-search-input"
                  style={{
                    paddingLeft: 12,
                    borderColor: editErrors.originLongitude ? '#ef4444' : undefined
                  }}
                />
                {editErrors.originLongitude && <p style={{ fontSize: 11, color: '#dc2626', margin: '4px 0 0' }}>{editErrors.originLongitude}</p>}
              </div>
            </div>
          </div>

          {/* ── SECTION 3: DESTINATION LOCATION ── */}
          <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Navigation size={14} />
              <span>DESTINATION LOCATION</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {/* Destination Location Name */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                  Location Name *
                </label>
                <input
                  type="text"
                  value={editFormData.destinationName || editFormData.destination || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, destination: e.target.value, destinationName: e.target.value })}
                  className="routes-search-input"
                  style={{
                    paddingLeft: 12,
                    borderColor: editErrors.destination ? '#ef4444' : undefined,
                    background: editErrors.destination ? '#fef2f2' : undefined
                  }}
                />
                {editErrors.destination && <p style={{ fontSize: 11, color: '#dc2626', margin: '4px 0 0' }}>{editErrors.destination}</p>}
              </div>

              {/* Destination Address */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                  Terminal Address
                </label>
                <input
                  type="text"
                  value={editFormData.destinationAddress || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, destinationAddress: e.target.value })}
                  className="routes-search-input"
                  style={{ paddingLeft: 12 }}
                />
              </div>

              {/* Destination City */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                  City
                </label>
                <input
                  type="text"
                  value={editFormData.destinationCity || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, destinationCity: e.target.value })}
                  className="routes-search-input"
                  style={{ paddingLeft: 12 }}
                />
              </div>

              {/* Destination State */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                  State
                </label>
                <input
                  type="text"
                  value={editFormData.destinationState || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, destinationState: e.target.value })}
                  className="routes-search-input"
                  style={{ paddingLeft: 12 }}
                />
              </div>

              {/* Destination Latitude */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                  Latitude (-90 to 90)
                </label>
                <input
                  type="number"
                  step="any"
                  value={editFormData.destinationLatitude ?? ''}
                  onChange={(e) => setEditFormData({ ...editFormData, destinationLatitude: e.target.value !== '' ? parseFloat(e.target.value) : null })}
                  className="routes-search-input"
                  style={{
                    paddingLeft: 12,
                    borderColor: editErrors.destinationLatitude ? '#ef4444' : undefined
                  }}
                />
                {editErrors.destinationLatitude && <p style={{ fontSize: 11, color: '#dc2626', margin: '4px 0 0' }}>{editErrors.destinationLatitude}</p>}
              </div>

              {/* Destination Longitude */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                  Longitude (-180 to 180)
                </label>
                <input
                  type="number"
                  step="any"
                  value={editFormData.destinationLongitude ?? ''}
                  onChange={(e) => setEditFormData({ ...editFormData, destinationLongitude: e.target.value !== '' ? parseFloat(e.target.value) : null })}
                  className="routes-search-input"
                  style={{
                    paddingLeft: 12,
                    borderColor: editErrors.destinationLongitude ? '#ef4444' : undefined
                  }}
                />
                {editErrors.destinationLongitude && <p style={{ fontSize: 11, color: '#dc2626', margin: '4px 0 0' }}>{editErrors.destinationLongitude}</p>}
              </div>
            </div>
          </div>

          {/* ── SECTION 4: METRICS & FLEET ASSIGNMENT ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {/* Distance */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                Distance (km) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={editFormData.distanceKm}
                onChange={(e) => setEditFormData({ ...editFormData, distanceKm: parseFloat(e.target.value) || 0 })}
                className="routes-search-input"
                style={{
                  paddingLeft: 12,
                  borderColor: editErrors.distanceKm ? '#ef4444' : undefined
                }}
              />
              {editErrors.distanceKm && <p style={{ fontSize: 11, color: '#dc2626', margin: '4px 0 0' }}>{editErrors.distanceKm}</p>}
            </div>

            {/* Transit Time */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                Transit Time (Hours) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={editFormData.estimatedTransitTimeHours}
                onChange={(e) => setEditFormData({ ...editFormData, estimatedTransitTimeHours: parseFloat(e.target.value) || 0 })}
                className="routes-search-input"
                style={{
                  paddingLeft: 12,
                  borderColor: editErrors.estimatedTransitTimeHours ? '#ef4444' : undefined
                }}
              />
              {editErrors.estimatedTransitTimeHours && (
                <p style={{ fontSize: 11, color: '#dc2626', margin: '4px 0 0' }}>{editErrors.estimatedTransitTimeHours}</p>
              )}
            </div>

            {/* Assign Driver */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                Assigned Dedicated Driver
              </label>
              <select
                value={editFormData.driverId || ''}
                onChange={(e) => setEditFormData({ ...editFormData, driverId: e.target.value ? Number(e.target.value) : null })}
                className="routes-filter-select"
                style={{ width: '100%' }}
              >
                <option value="">-- No Driver Assigned --</option>
                {drivers.map((d) => {
                  const isAssigned = isDriverAssignedToOtherActiveRoute(d.id, editingRoute?.id);
                  return (
                    <option key={d.id} value={d.id} disabled={isAssigned}>
                      {d.fullName} {d.phone ? `(${d.phone})` : ''} {isAssigned ? '— Unavailable (Already assigned)' : `- ${d.status}`}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Assign Vehicle */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                Assigned Dedicated Vehicle
              </label>
              <select
                value={editFormData.vehicleId || ''}
                onChange={(e) => setEditFormData({ ...editFormData, vehicleId: e.target.value ? Number(e.target.value) : null })}
                className="routes-filter-select"
                style={{ width: '100%' }}
              >
                <option value="">-- No Vehicle Assigned --</option>
                {vehicles.map((v) => {
                  const isAssigned = isVehicleAssignedToOtherActiveRoute(v.id, editingRoute?.id);
                  return (
                    <option key={v.id} value={v.id} disabled={isAssigned}>
                      {v.vehicleNumber} {v.model ? `(${v.model})` : (v.vehicleType ? `(${v.vehicleType})` : '')} {isAssigned ? '— Unavailable (Already assigned)' : `- ${v.status}`}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="btn btn-outline"
              style={{ padding: '8px 16px', borderRadius: 10 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingEdit}
              className="btn btn-primary"
              style={{ padding: '8px 20px', borderRadius: 10, fontWeight: 700 }}
            >
              {submittingEdit ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── 12. DELETE CONFIRMATION MODAL ── */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Remove Freight Corridor"
      >
        {routeToDelete && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div
              style={{
                padding: '14px',
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                color: '#92400e',
                fontSize: 13.5
              }}
            >
              <AlertTriangle size={18} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                Are you sure you want to delete freight route{' '}
                <strong>{routeToDelete.routeCode}</strong> ({routeToDelete.origin} →{' '}
                {routeToDelete.destination})?
              </div>
            </div>

            {Number(routeToDelete.activeLoads) > 0 ? (
              <div
                style={{
                  padding: '10px 14px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 10,
                  fontSize: 12,
                  color: '#991b1b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <AlertCircle size={15} />
                <span>
                  <strong>Safety Guard Active:</strong> This route has active shipments and cannot be deleted.
                </span>
              </div>
            ) : (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                This route has 0 active shipments and can be safely deleted. Any historical delivered
                shipments will remain preserved in database archives.
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="btn btn-outline"
                style={{ padding: '8px 16px', borderRadius: 10 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteRoute}
                disabled={submittingDelete || Number(routeToDelete.activeLoads) > 0}
                style={{
                  padding: '8px 18px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  background: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  cursor: Number(routeToDelete.activeLoads) > 0 ? 'not-allowed' : 'pointer',
                  opacity: Number(routeToDelete.activeLoads) > 0 ? 0.5 : 1
                }}
              >
                {submittingDelete ? 'Deleting...' : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
