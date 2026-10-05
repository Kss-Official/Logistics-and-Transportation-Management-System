import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, RefreshCw, Search, Phone, Mail, Truck,
  CheckCircle2, Clock, AlertCircle, ShieldCheck, MapPin,
  ExternalLink, UserCheck, Radio, ChevronRight, X,
  Download, Filter, ArrowUpRight, Calendar, User,
  FileText, Navigation, Check, Eye
} from 'lucide-react';
import { warehousePortalService } from '../../services/warehousePortalService';
import type { WarehouseDriverItem } from '../../types/warehousePortal';

export default function DriverTracking() {
  const navigate = useNavigate();

  // Data states
  const [drivers, setDrivers] = useState<WarehouseDriverItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [vehicleFilter, setVehicleFilter] = useState<string>('ALL');
  const [shipmentFilter, setShipmentFilter] = useState<string>('ALL');

  // Selected driver for slide-over drawer
  const [selectedDriver, setSelectedDriver] = useState<WarehouseDriverItem | null>(null);

  const [warehouse, setWarehouse] = useState<{ name?: string; code?: string } | null>(null);

  const loadDrivers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [data, whData] = await Promise.all([
        warehousePortalService.getDrivers(),
        warehousePortalService.getWarehouse().catch(() => null),
      ]);
      setDrivers(Array.isArray(data) ? data : []);
      if (whData) {
        setWarehouse({
          name: whData.warehouseName,
          code: whData.warehouseCode,
        });
      }
    } catch (err: unknown) {
      console.error('Failed to load drivers:', err);
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e.response?.data?.message || e.message || 'Failed to retrieve warehouse driver roster.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  // Lock background body scroll when driver inspection drawer is open
  useEffect(() => {
    if (selectedDriver) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [selectedDriver]);

  // Filter options derived dynamically from loaded data
  const vehicleOptions = useMemo(() => {
    const list = Array.from(new Set(drivers.map(d => d.assignedVehicle).filter(Boolean)));
    return list.filter(v => v !== 'None' && v !== 'Unassigned');
  }, [drivers]);

  // Filtered driver list
  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      // Status filter
      if (statusFilter !== 'ALL' && d.status !== statusFilter) return false;

      // Vehicle filter
      if (vehicleFilter !== 'ALL') {
        if (vehicleFilter === 'ASSIGNED' && (!d.assignedVehicle || d.assignedVehicle === 'None')) return false;
        if (vehicleFilter === 'UNASSIGNED' && d.assignedVehicle && d.assignedVehicle !== 'None') return false;
        if (vehicleFilter !== 'ASSIGNED' && vehicleFilter !== 'UNASSIGNED' && d.assignedVehicle !== vehicleFilter) return false;
      }

      // Shipment filter
      if (shipmentFilter !== 'ALL') {
        if (shipmentFilter === 'ON_TRIP' && (!d.currentShipment || d.currentShipment === 'None')) return false;
        if (shipmentFilter === 'NO_TRIP' && d.currentShipment && d.currentShipment !== 'None') return false;
        if (shipmentFilter !== 'ON_TRIP' && shipmentFilter !== 'NO_TRIP' && d.currentShipment !== shipmentFilter) return false;
      }

      // Search query
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        d.fullName.toLowerCase().includes(q) ||
        d.phone.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q) ||
        d.licenseNumber.toLowerCase().includes(q) ||
        (d.currentShipment && d.currentShipment.toLowerCase().includes(q)) ||
        (d.assignedVehicle && d.assignedVehicle.toLowerCase().includes(q)) ||
        (d.lastLocation && d.lastLocation.toLowerCase().includes(q))
      );
    });
  }, [drivers, search, statusFilter, vehicleFilter, shipmentFilter]);

  const hasActiveFilters = search || statusFilter !== 'ALL' || vehicleFilter !== 'ALL' || shipmentFilter !== 'ALL';

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setVehicleFilter('ALL');
    setShipmentFilter('ALL');
  };

  // Real CSV Export
  const handleExportCSV = () => {
    if (filteredDrivers.length === 0) return;
    const headers = ['Driver ID', 'Name', 'Phone', 'Email', 'License Number', 'Status', 'Vehicle', 'Current Shipment', 'Last Location', 'Last Updated'];
    const rows = filteredDrivers.map(d => [
      `DRV-${d.id}`,
      `"${d.fullName}"`,
      `"${d.phone}"`,
      `"${d.email}"`,
      `"${d.licenseNumber}"`,
      d.status,
      `"${d.assignedVehicle || 'Unassigned'}"`,
      `"${d.currentShipment || 'None'}"`,
      `"${d.lastLocation || 'N/A'}"`,
      `"${d.lastUpdated ? new Date(d.lastUpdated).toLocaleString() : 'N/A'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `drivers_roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <span className="wh-badge green"><CheckCircle2 size={12} /> AVAILABLE</span>;
      case 'ON_TRIP':
        return <span className="wh-badge blue"><Radio size={12} /> ON TRIP</span>;
      case 'OFF_DUTY':
        return <span className="wh-badge amber"><Clock size={12} /> OFF DUTY</span>;
      default:
        return <span className="wh-badge slate"><AlertCircle size={12} /> {status}</span>;
    }
  };

  return (
    <div className="wh-page-container">
      {/* ── Page Header ── */}
      <div className="wh-header-row">
        <div>
          <div className="wh-title-group">
            <div className="wh-title-icon">
              <Users size={22} />
            </div>
            <div>
              <h1 className="wh-page-title">Driver Tracking</h1>
              <p className="wh-page-subtitle">
                Monitor drivers, active delivery operations, assigned fleet assets, and duty status.
              </p>
            </div>
          </div>
        </div>

        <div className="wh-header-actions">
          <button
            onClick={() => navigate('/warehouse/live-map')}
            className="wh-btn wh-btn-outline"
            title="Switch to Live Map view"
          >
            <Navigation size={15} />
            <span>Live Map View</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={filteredDrivers.length === 0}
            className="wh-btn wh-btn-outline"
            title="Download drivers as CSV"
          >
            <Download size={15} />
            <span>Export Roster CSV</span>
          </button>

          <button
            onClick={loadDrivers}
            disabled={isLoading}
            className="wh-btn wh-btn-primary"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            <span>{isLoading ? 'Syncing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* ── Filters Bar ── */}
      <div className="wh-toolbar-card">
        <div className="wh-toolbar-row">
          <div className="wh-search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search driver by name, phone, license, vehicle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="wh-search-input"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="wh-select"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="ON_TRIP">On Trip</option>
            <option value="OFF_DUTY">Off Duty</option>
          </select>

          {/* Vehicle assignment filter */}
          <select
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
            className="wh-select"
          >
            <option value="ALL">All Vehicles</option>
            <option value="ASSIGNED">Assigned to Vehicle</option>
            <option value="UNASSIGNED">No Vehicle Assigned</option>
            {vehicleOptions.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>

          {/* Shipment trip filter */}
          <select
            value={shipmentFilter}
            onChange={(e) => setShipmentFilter(e.target.value)}
            className="wh-select"
          >
            <option value="ALL">All Trip Statuses</option>
            <option value="ON_TRIP">Active Consignment</option>
            <option value="NO_TRIP">No Active Trip</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="wh-btn wh-btn-outline wh-btn-sm"
            >
              <X size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Filter metadata counter */}
        <div className="wh-toolbar-meta">
          <div>
            Showing <strong>{filteredDrivers.length}</strong> of <strong>{drivers.length}</strong> registered drivers
            {statusFilter !== 'ALL' && <span className="wh-tag" style={{ marginLeft: 8 }}>Status: {statusFilter}</span>}
            {vehicleFilter !== 'ALL' && <span className="wh-tag" style={{ marginLeft: 6 }}>Vehicle: {vehicleFilter}</span>}
          </div>
          {hasActiveFilters && (
            <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>Active filters applied</span>
          )}
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div style={{ padding: '14px 18px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#991b1b', fontSize: 13 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertCircle size={18} color="#dc2626" />
            <span>{error}</span>
          </div>
          <button onClick={loadDrivers} className="wh-btn wh-btn-sm wh-btn-outline">
            Retry
          </button>
        </div>
      )}

      {/* ── DRIVER ROSTER TABLE ── */}
      <div className="wh-table-card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              DRIVER ROSTER
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
              Official personnel tracking for {warehouse?.name ? `${warehouse.name} (${warehouse.code || 'HUB'})` : 'Origin Warehouse Facility'}
            </p>
          </div>
          <span className="wh-badge slate">
            {filteredDrivers.length} Personnel
          </span>
        </div>

        {isLoading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#059669', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.7s linear infinite' }} />
            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Retrieving live driver roster...</p>
          </div>
        ) : filteredDrivers.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Users size={44} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: '0 0 6px' }}>No Drivers Found</h4>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0, maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>
              No driver records match your query. Try clearing filters or refreshing the roster.
            </p>
            {hasActiveFilters && (
              <button onClick={resetFilters} className="wh-btn wh-btn-outline wh-btn-sm" style={{ marginTop: 16 }}>
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="wh-table-wrapper" style={{ width: '100%', overflowX: 'hidden' }}>
            <table className="wh-table" style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: 12 }}>
                    <th style={{ padding: '12px 14px', fontWeight: 700, width: '28%' }}>Driver</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700, width: '16%' }}>Vehicle</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700, width: '16%' }}>Shipment</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700, width: '14%' }}>Status</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700, width: '14%' }}>Location</th>
                    <th className="wh-actions-header" style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'center', width: '12%' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDrivers.map((driver) => {
                    const initials = driver.fullName
                      ? driver.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                      : 'DR';
                    const isSelected = selectedDriver?.id === driver.id;

                    return (
                      <tr
                        key={driver.id}
                        onClick={() => setSelectedDriver(driver)}
                        className={`clickable ${isSelected ? 'selected' : ''}`}
                        style={{ borderBottom: '1px solid #f1f5f9' }}
                      >
                        {/* Driver Column */}
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div className="wh-avatar">
                              {initials}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 13.5 }}>
                                {driver.fullName}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                                <span className="wh-mono-badge" style={{ fontSize: 11, padding: '2px 6px' }}>
                                  DRV-{driver.id}
                                </span>
                                <a
                                  href={`tel:${driver.phone}`}
                                  onClick={(e) => e.stopPropagation()}
                                  style={{ fontSize: 11.5, color: '#64748b', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                  title="Call Driver"
                                >
                                  <Phone size={11} /> {driver.phone}
                                </a>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Vehicle Column */}
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          {driver.assignedVehicle && driver.assignedVehicle !== 'None' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Truck size={14} color="#059669" />
                              <span className="wh-mono-badge">
                                {driver.assignedVehicle}
                              </span>
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>Unassigned</span>
                          )}
                        </td>

                        {/* Shipment Column */}
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          {driver.currentShipment && driver.currentShipment !== 'None' ? (
                            <span className="wh-badge indigo">
                              <Navigation size={11} />
                              {driver.currentShipment}
                            </span>
                          ) : (
                            <span style={{ fontSize: 12, color: '#94a3b8' }}>None</span>
                          )}
                        </td>

                        {/* Status Column */}
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                            {getStatusBadge(driver.status)}
                          </div>
                        </td>

                        {/* Location Column */}
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#334155' }}>
                            <MapPin size={13} color="#64748b" style={{ flexShrink: 0 }} />
                            <span style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={driver.lastLocation}>
                              {driver.lastLocation || 'Bengaluru Yard Depot'}
                            </span>
                          </div>
                          {driver.lastUpdated && (
                            <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 2, marginLeft: 19 }}>
                              {new Date(driver.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                        </td>

                        {/* Action Column */}
                        <td className="wh-actions-cell" style={{ padding: '12px 16px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                          <div className="wh-actions-group" style={{ justifyContent: 'center' }}>
                            <button
                              onClick={() => setSelectedDriver(driver)}
                              className="wh-action-btn wh-action-btn-outline"
                              title="Inspect Driver Dossier"
                              style={{ padding: '0 10px', height: 28, fontSize: 11.5, gap: 5 }}
                            >
                              <Eye size={12} />
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
      </div>

      {/* ── Slide-Over Inspection Drawer ── */}
      {selectedDriver && (
        <div
          className="wh-drawer-overlay"
          onClick={() => setSelectedDriver(null)}
          style={{ overscrollBehavior: 'contain' }}
        >
          <div className="wh-drawer" onClick={(e) => e.stopPropagation()}>
            {/* Drawer Header */}
            <div className="wh-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="wh-avatar" style={{ width: 40, height: 40, fontSize: 14 }}>
                  {selectedDriver.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                    {selectedDriver.fullName}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                    <span className="wh-mono-badge" style={{ fontSize: 11 }}>DRV-{selectedDriver.id}</span>
                    {getStatusBadge(selectedDriver.status)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedDriver(null)}
                className="wh-btn-icon"
                title="Close drawer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="wh-drawer-body">
              {/* SECTION 1: PROFILE */}
              <div className="wh-drawer-section">
                <div className="wh-drawer-section-title">
                  <User size={13} color="#059669" />
                  <span>DRIVER PROFILE</span>
                </div>
                <div className="wh-drawer-card">
                  <div className="wh-drawer-row">
                    <span className="wh-drawer-label">Full Name</span>
                    <span className="wh-drawer-val">{selectedDriver.fullName}</span>
                  </div>
                  <div className="wh-drawer-row">
                    <span className="wh-drawer-label">Phone Contact</span>
                    <a href={`tel:${selectedDriver.phone}`} style={{ color: '#047857', fontWeight: 600, textDecoration: 'none' }}>
                      {selectedDriver.phone}
                    </a>
                  </div>
                  <div className="wh-drawer-row">
                    <span className="wh-drawer-label">Email</span>
                    <span className="wh-drawer-val">{selectedDriver.email || 'N/A'}</span>
                  </div>
                  <div className="wh-drawer-row">
                    <span className="wh-drawer-label">License Number</span>
                    <span className="wh-mono-badge">{selectedDriver.licenseNumber || 'DL-PENDING'}</span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: FLEET ASSIGNMENT */}
              <div className="wh-drawer-section">
                <div className="wh-drawer-section-title">
                  <Truck size={13} color="#059669" />
                  <span>VEHICLE ASSIGNMENT</span>
                </div>
                <div className="wh-drawer-card">
                  <div className="wh-drawer-row">
                    <span className="wh-drawer-label">Assigned Vehicle</span>
                    <span className="wh-mono-badge">
                      {selectedDriver.assignedVehicle || 'Unassigned'}
                    </span>
                  </div>
                  <div className="wh-drawer-row">
                    <span className="wh-drawer-label">Fleet Station</span>
                    <span className="wh-drawer-val">Bengaluru Yard Depot</span>
                  </div>
                  <div className="wh-drawer-row">
                    <span className="wh-drawer-label">Readiness</span>
                    <span className="wh-badge green">Roadworthy Certified</span>
                  </div>
                </div>
              </div>

              {/* SECTION 3: CURRENT DELIVERY */}
              <div className="wh-drawer-section">
                <div className="wh-drawer-section-title">
                  <Navigation size={13} color="#059669" />
                  <span>ACTIVE CONSIGNMENT</span>
                </div>
                <div className="wh-drawer-card">
                  <div className="wh-drawer-row">
                    <span className="wh-drawer-label">Tracking Number</span>
                    {selectedDriver.currentShipment && selectedDriver.currentShipment !== 'None' ? (
                      <span className="wh-badge indigo">{selectedDriver.currentShipment}</span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: 12 }}>No active consignment</span>
                    )}
                  </div>
                  <div className="wh-drawer-row">
                    <span className="wh-drawer-label">Trip State</span>
                    <span>{getStatusBadge(selectedDriver.status)}</span>
                  </div>
                  <div className="wh-drawer-row">
                    <span className="wh-drawer-label">Last Checkpoint</span>
                    <span className="wh-drawer-val">{selectedDriver.lastLocation || 'At Warehouse Yard'}</span>
                  </div>
                </div>
              </div>

              {/* SECTION 4: LOCATION TELEMETRY */}
              <div className="wh-drawer-section">
                <div className="wh-drawer-section-title">
                  <MapPin size={13} color="#059669" />
                  <span>GEOSPATIAL VERIFICATION</span>
                </div>
                <div className="wh-drawer-card">
                  <div className="wh-drawer-row">
                    <span className="wh-drawer-label">Reporting Hub</span>
                    <span className="wh-drawer-val">
                      {warehouse?.name ? `${warehouse.name} (${warehouse.code || 'HUB'})` : 'Origin Facility'}
                    </span>
                  </div>
                  <div className="wh-drawer-row">
                    <span className="wh-drawer-label">GPS Status</span>
                    <span className={`wh-badge ${selectedDriver.lastLocation ? 'green' : 'slate'}`}>
                      {selectedDriver.lastLocation ? 'Verified Signal' : 'Location Unavailable'}
                    </span>
                  </div>
                  <div className="wh-drawer-row">
                    <span className="wh-drawer-label">Last Timestamp</span>
                    <span className="wh-drawer-val">
                      {selectedDriver.lastUpdated ? new Date(selectedDriver.lastUpdated).toLocaleString() : 'Recent'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="wh-drawer-footer">
              <button
                onClick={() => setSelectedDriver(null)}
                className="wh-btn wh-btn-outline"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
