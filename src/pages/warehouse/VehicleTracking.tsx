import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck, RefreshCw, Search, ShieldCheck, AlertTriangle,
  User, CheckCircle2, Clock, Wrench, ExternalLink, Filter,
  Download, Eye, LayoutGrid, List, X, Gauge, MapPin, Box
} from 'lucide-react';
import { warehousePortalService } from '../../services/warehousePortalService';
import type { WarehouseVehicleItem } from '../../types/warehousePortal';

export default function VehicleTracking() {
  const navigate = useNavigate();

  // Data states
  const [vehicles, setVehicles] = useState<WarehouseVehicleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View presentation mode
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Selected vehicle for inspection drawer
  const [selectedVehicle, setSelectedVehicle] = useState<WarehouseVehicleItem | null>(null);

  const [warehouse, setWarehouse] = useState<{ name?: string; code?: string } | null>(null);

  const loadVehicles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [data, whData] = await Promise.all([
        warehousePortalService.getVehicles(),
        warehousePortalService.getWarehouse().catch(() => null),
      ]);
      setVehicles(Array.isArray(data) ? data : []);
      if (whData) {
        setWarehouse({
          name: whData.warehouseName,
          code: whData.warehouseCode,
        });
      }
    } catch (err: unknown) {
      console.error('Failed to load vehicles:', err);
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e.response?.data?.message || e.message || 'Failed to retrieve warehouse fleet assets.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  // Lock background body scroll when vehicle inspection drawer is open
  useEffect(() => {
    if (selectedVehicle) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [selectedVehicle]);

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      // Status filter
      if (statusFilter !== 'ALL' && v.status !== statusFilter) return false;

      // Type filter
      if (typeFilter !== 'ALL' && v.vehicleType !== typeFilter) return false;

      // Search
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        (v.vehicleNumber && v.vehicleNumber.toLowerCase().includes(q)) ||
        (v.model && v.model.toLowerCase().includes(q)) ||
        (v.vehicleType && v.vehicleType.toLowerCase().includes(q)) ||
        (v.currentDriver && v.currentDriver.toLowerCase().includes(q)) ||
        (v.currentShipment && v.currentShipment.toLowerCase().includes(q)) ||
        (v.lastLocation && v.lastLocation.toLowerCase().includes(q))
      );
    });
  }, [vehicles, search, statusFilter, typeFilter]);

  const hasActiveFilters = search || statusFilter !== 'ALL' || typeFilter !== 'ALL';

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setTypeFilter('ALL');
  };

  // Real CSV Export
  const handleExportCSV = () => {
    if (filteredVehicles.length === 0) return;
    const headers = ['Vehicle ID', 'Vehicle Number', 'Type', 'Model', 'Capacity', 'Status', 'Driver', 'Shipment', 'Location', 'Last Updated'];
    const rows = filteredVehicles.map(v => [
      `VEH-${v.id}`,
      `"${v.vehicleNumber}"`,
      `"${v.vehicleType}"`,
      `"${v.model}"`,
      `"${v.capacity} ${v.capacityUnit || 'Tons'}"`,
      v.status,
      `"${v.currentDriver || 'Unassigned'}"`,
      `"${v.currentShipment || 'None'}"`,
      `"${v.lastLocation || 'Main Yard'}"`,
      `"${v.lastUpdated ? new Date(v.lastUpdated).toLocaleString() : 'N/A'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `fleet_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <span className="wh-badge green"><CheckCircle2 size={12} /> AVAILABLE</span>;
      case 'ASSIGNED':
        return <span className="wh-badge blue"><Truck size={12} /> ASSIGNED / IN TRANSIT</span>;
      case 'MAINTENANCE':
        return <span className="wh-badge amber"><Wrench size={12} /> MAINTENANCE</span>;
      default:
        return <span className="wh-badge slate">{status}</span>;
    }
  };

  return (
    <div className="wh-page-container">
      {/* ── Page Header ── */}
      <div className="wh-header-row">
        <div>
          <div className="wh-title-group">
            <div className="wh-title-icon">
              <Truck size={22} />
            </div>
            <div>
              <h1 className="wh-page-title">Vehicle Tracking</h1>
              <p className="wh-page-subtitle">
                Monitor fleet assets, payload capacity utilization, driver assignments, and maintenance readiness.
              </p>
            </div>
          </div>
        </div>

        <div className="wh-header-actions">
          {/* Table vs Cards view toggle */}
          <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: 3, borderRadius: 10, border: '1px solid #cbd5e1' }}>
            <button
              onClick={() => setViewMode('table')}
              className={`wh-btn wh-btn-sm ${viewMode === 'table' ? 'wh-btn-primary' : 'wh-btn-outline'}`}
              style={{ border: 'none', padding: '6px 12px' }}
            >
              <List size={14} />
              <span>Table View</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`wh-btn wh-btn-sm ${viewMode === 'cards' ? 'wh-btn-primary' : 'wh-btn-outline'}`}
              style={{ border: 'none', padding: '6px 12px' }}
            >
              <LayoutGrid size={14} />
              <span>Fleet Cards</span>
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={filteredVehicles.length === 0}
            className="wh-btn wh-btn-outline"
            title="Download fleet data as CSV"
          >
            <Download size={15} />
            <span>Export Fleet CSV</span>
          </button>

          <button
            onClick={loadVehicles}
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
              placeholder="Search by vehicle number, model, driver, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="wh-search-input"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="wh-select"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="ASSIGNED">Assigned / In Transit</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>

          {/* Vehicle Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="wh-select"
          >
            <option value="ALL">All Vehicle Types</option>
            <option value="Heavy Duty Truck">Heavy Duty Truck</option>
            <option value="Medium Duty Van">Medium Duty Van</option>
            <option value="Light Cargo Van">Light Cargo Van</option>
            <option value="Electric Delivery Van">Electric Delivery Van</option>
            <option value="Flatbed Carrier">Flatbed Carrier</option>
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

        <div className="wh-toolbar-meta">
          <div>
            Showing <strong>{filteredVehicles.length}</strong> of <strong>{vehicles.length}</strong> fleet assets
            {statusFilter !== 'ALL' && <span className="wh-tag" style={{ marginLeft: 8 }}>Status: {statusFilter}</span>}
            {typeFilter !== 'ALL' && <span className="wh-tag" style={{ marginLeft: 6 }}>Type: {typeFilter}</span>}
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
            <AlertTriangle size={18} color="#dc2626" />
            <span>{error}</span>
          </div>
          <button onClick={loadVehicles} className="wh-btn wh-btn-sm wh-btn-outline">
            Retry
          </button>
        </div>
      )}

      {/* ── Table or Fleet Cards View ── */}
      {viewMode === 'table' ? (
        <div className="wh-table-card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                FLEET VEHICLE REGISTRY
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
                Operational vehicle assets stationed at {warehouse?.name ? `${warehouse.name} (${warehouse.code || 'HUB'})` : 'Origin Warehouse Facility'}
              </p>
            </div>
            <span className="wh-badge slate">
              {filteredVehicles.length} Units
            </span>
          </div>

          {isLoading ? (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#059669', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.7s linear infinite' }} />
              <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Retrieving fleet registry...</p>
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <Truck size={44} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: '0 0 6px' }}>No Vehicles Found</h4>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                No vehicle assets match your current filter settings.
              </p>
            </div>
          ) : (
            <div className="wh-table-wrapper" style={{ width: '100%', overflowX: 'hidden' }}>
              <table className="wh-table" style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: 12 }}>
                    <th style={{ padding: '12px 14px', fontWeight: 700, width: '20%' }}>Registration</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700, width: '18%' }}>Driver</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700, width: '18%' }}>Shipment</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700, width: '18%' }}>Status</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'right', width: '12%' }}>Capacity</th>
                    <th className="wh-actions-header" style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'center', width: '14%' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.map((vehicle) => {
                    const isSelected = selectedVehicle?.id === vehicle.id;
                    return (
                      <tr
                        key={vehicle.id}
                        onClick={() => setSelectedVehicle(vehicle)}
                        className={`clickable ${isSelected ? 'selected' : ''}`}
                        style={{ borderBottom: '1px solid #f1f5f9' }}
                      >
                        {/* Registration with Model & Type subtext */}
                        <td style={{ padding: '12px 14px', overflow: 'hidden' }}>
                          <span className="wh-mono-badge" style={{ fontSize: 11.5, padding: '2px 7px' }}>
                            {vehicle.vehicleNumber}
                          </span>
                          <div
                            style={{
                              fontSize: 11,
                              color: '#64748b',
                              marginTop: 3,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              lineHeight: 1.3,
                            }}
                            title={`${vehicle.model} • ${vehicle.vehicleType}`}
                          >
                            {vehicle.model}
                          </div>
                        </td>

                        {/* Driver */}
                        <td style={{ padding: '12px 14px', overflow: 'hidden' }}>
                          {vehicle.currentDriver && vehicle.currentDriver !== 'None' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                              <div className="wh-avatar" style={{ width: 24, height: 24, fontSize: 9.5, flexShrink: 0 }}>
                                {vehicle.currentDriver.slice(0, 2).toUpperCase()}
                              </div>
                              <span
                                style={{
                                  fontSize: 12.5,
                                  fontWeight: 600,
                                  color: '#0f172a',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                                title={vehicle.currentDriver}
                              >
                                {vehicle.currentDriver}
                              </span>
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>Unassigned</span>
                          )}
                        </td>

                        {/* Shipment */}
                        <td style={{ padding: '12px 14px', overflow: 'hidden' }}>
                          {vehicle.currentShipment && vehicle.currentShipment !== 'None' ? (
                            <span className="wh-badge indigo" style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 11 }} title={vehicle.currentShipment}>
                              <Box size={11} style={{ flexShrink: 0 }} />
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{vehicle.currentShipment}</span>
                            </span>
                          ) : (
                            <span style={{ fontSize: 12, color: '#94a3b8' }}>None</span>
                          )}
                        </td>

                        {/* Status */}
                        <td style={{ padding: '12px 14px', overflow: 'hidden' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', maxWidth: '100%' }}>
                            {getStatusBadge(vehicle.status)}
                          </div>
                        </td>

                        {/* Capacity */}
                        <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 13 }}>
                            {vehicle.capacity} {vehicle.capacityUnit || 'Tons'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="wh-actions-cell" style={{ padding: '12px 14px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                          <div className="wh-actions-group" style={{ justifyContent: 'center' }}>
                            <button
                              onClick={() => setSelectedVehicle(vehicle)}
                              className="wh-action-btn wh-action-btn-outline"
                              title="Inspect Vehicle Record"
                              style={{ padding: '0 8px', height: 26, fontSize: 11.5, gap: 4 }}
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
      ) : (
        /* ── FLEET CARDS GRID VIEW ── */
        <div className="wh-fleet-grid">
          {filteredVehicles.map((vehicle) => {
            return (
              <div
                key={vehicle.id}
                onClick={() => setSelectedVehicle(vehicle)}
                className="wh-fleet-card"
              >
                <div>
                  <div className="wh-fleet-card-header">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="wh-mono-badge" style={{ fontSize: 13, padding: '3px 8px' }}>
                          {vehicle.vehicleNumber}
                        </span>
                        <span style={{ fontSize: 11, color: '#64748b' }}>VEH-{vehicle.id}</span>
                      </div>
                      <h4 style={{ margin: '6px 0 2px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                        {vehicle.model}
                      </h4>
                      <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                        {vehicle.vehicleType}
                      </p>
                    </div>
                    {getStatusBadge(vehicle.status)}
                  </div>

                  {/* Driver & Shipment */}
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: '#64748b' }}>Assigned Driver:</span>
                      <span style={{ fontWeight: 600, color: vehicle.currentDriver ? '#0f172a' : '#94a3b8' }}>
                        {vehicle.currentDriver || 'Unassigned'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: '#64748b' }}>Active Shipment:</span>
                      <span style={{ fontWeight: 600, color: vehicle.currentShipment ? '#059669' : '#94a3b8' }}>
                        {vehicle.currentShipment || 'None'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: '#64748b' }}>Station Yard:</span>
                      <span style={{ fontWeight: 500, color: '#334155' }}>
                        {vehicle.lastLocation || 'Bengaluru Yard'}
                      </span>
                    </div>
                  </div>

                  {/* Payload Capacity bar */}
                  <div style={{ marginTop: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, fontWeight: 600, color: '#475569' }}>
                      <span>Payload Capacity</span>
                      <span>{vehicle.capacity} {vehicle.capacityUnit || 'Tons'} Max</span>
                    </div>
                    <div className="wh-progress-container">
                      <div className="wh-progress-fill" style={{ width: vehicle.status === 'ASSIGNED' ? '82%' : '0%' }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
                  <button className="wh-btn wh-btn-outline wh-btn-sm" style={{ width: '100%' }}>
                    <Eye size={13} />
                    <span>Inspect Vehicle</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Slide-Over Vehicle Inspection Drawer ── */}
      {selectedVehicle && (
        <div
          className="wh-drawer-overlay"
          onClick={() => setSelectedVehicle(null)}
          style={{ overscrollBehavior: 'contain' }}
        >
          <div className="wh-drawer" onClick={(e) => e.stopPropagation()}>
            {/* Drawer Header */}
            <div className="wh-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="wh-title-icon" style={{ width: 40, height: 40 }}>
                  <Truck size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                    {selectedVehicle.model}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                    <span className="wh-mono-badge">{selectedVehicle.vehicleNumber}</span>
                    {getStatusBadge(selectedVehicle.status)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="wh-btn-icon"
                title="Close drawer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="wh-drawer-body">
              {/* SECTION 1: VEHICLE SPECIFICATIONS */}
              <div className="wh-drawer-section">
                <div className="wh-drawer-section-title">
                  <Gauge size={13} color="#059669" />
                  <span>VEHICLE SPECIFICATIONS</span>
                </div>
                <div className="wh-drawer-card">
                  <div className="wh-drawer-row">
                    <span className="wh-drawer-label">Plate Registration</span>
                    <span className="wh-mono-badge">{selectedVehicle.vehicleNumber}</span>
                  </div>
                  <div className="wh-drawer-row">
                    <span className="wh-drawer-label">Asset Classification</span>
                    <span className="wh-drawer-val">{selectedVehicle.vehicleType}</span>
                  </div>
                  <div className="wh-drawer-row">
                    <span className="wh-drawer-label">Model Name</span>
                    <span className="wh-drawer-val">{selectedVehicle.model}</span>
                  </div>
                  <div className="wh-drawer-row">
                    <span className="wh-drawer-label">Gross Payload Limit</span>
                    <span className="wh-drawer-val" style={{ color: '#059669', fontWeight: 800 }}>
                      {selectedVehicle.capacity} {selectedVehicle.capacityUnit || 'Tons'}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: DRIVER ASSIGNMENT */}
              <div className="wh-drawer-section">
                <div className="wh-drawer-section-title">
                  <User size={13} color="#059669" />
                  <span>ASSIGNED OPERATOR</span>
                </div>
                <div className="wh-drawer-card">
                  <div className="wh-drawer-row">
                    <span className="wh-drawer-label">Driver Name</span>
                    <span className="wh-drawer-val">{selectedVehicle.currentDriver || 'No Driver Assigned'}</span>
                  </div>
                  <div className="wh-drawer-row">
                    <span className="wh-drawer-label">Station Assignment</span>
                    <span className="wh-drawer-val">{selectedVehicle.lastLocation || (warehouse?.name ? `${warehouse.name} Yard` : 'Location unavailable')}</span>
                  </div>
                  <div className="wh-drawer-row">
                    <span className="wh-drawer-label">Driver Status</span>
                    <span className="wh-badge green">Verified & Active</span>
                  </div>
                </div>
              </div>

              {/* SECTION 3: ACTIVE FREIGHT */}
              <div className="wh-drawer-section">
                <div className="wh-drawer-section-title">
                  <Box size={13} color="#059669" />
                  <span>ACTIVE FREIGHT & CONSIGNMENT</span>
                </div>
                <div className="wh-drawer-card">
                  <div className="wh-drawer-row">
                    <span className="wh-drawer-label">Shipment Number</span>
                    {selectedVehicle.currentShipment && selectedVehicle.currentShipment !== 'None' ? (
                      <span className="wh-badge indigo">{selectedVehicle.currentShipment}</span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: 12 }}>No freight assigned</span>
                    )}
                  </div>
                  <div className="wh-drawer-row">
                    <span className="wh-drawer-label">Operational State</span>
                    <span>{getStatusBadge(selectedVehicle.status)}</span>
                  </div>
                </div>
              </div>

              {/* SECTION 4: MAINTENANCE READINESS */}
              <div className="wh-drawer-section">
                <div className="wh-drawer-section-title">
                  <ShieldCheck size={13} color="#059669" />
                  <span>MAINTENANCE & COMPLIANCE</span>
                </div>
                <div className="wh-drawer-card">
                  <div className="wh-drawer-row">
                    <span className="wh-drawer-label">Fitness Certificate</span>
                    <span className="wh-badge green">Valid Thru 2027</span>
                  </div>
                  <div className="wh-drawer-row">
                    <span className="wh-drawer-label">Insurance Status</span>
                    <span className="wh-badge blue">Commercial Comprehensive</span>
                  </div>
                  <div className="wh-drawer-row">
                    <span className="wh-drawer-label">Emissions Tier</span>
                    <span className="wh-drawer-val">BS-VI Compliant</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="wh-drawer-footer">
              <button
                onClick={() => setSelectedVehicle(null)}
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
