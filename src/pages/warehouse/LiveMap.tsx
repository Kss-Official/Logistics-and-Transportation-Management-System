import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  warehousePortalService, 
  type WarehouseShipmentItem,
  type WarehouseDriverItem,
  type WarehouseVehicleItem
} from '../../services/warehousePortalService';
import { 
  Navigation, 
  RefreshCw, 
  Crosshair, 
  Truck, 
  UserCheck, 
  Layers, 
  AlertCircle, 
  MapPin, 
  Building2, 
  Clock, 
  Phone, 
  CheckCircle2, 
  X, 
  Package, 
  Info,
  ChevronRight,
  ExternalLink,
  Radio,
  Search,
  Check,
  Compass,
  FileText,
  Eye,
  Box
} from 'lucide-react';

interface WarehouseLivePin {
  id: number;
  name: string;
  code: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
}

interface ActiveShipmentPin {
  shipmentId: number;
  trackingNumber: string;
  status: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  driverName?: string;
  driverPhone?: string;
  vehicleNumber?: string;
  destination?: string;
  updatedAt?: string;
}

export default function LiveMap() {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Data states
  const [warehouse, setWarehouse] = useState<WarehouseLivePin | null>(null);
  const [activeShipmentPins, setActiveShipmentPins] = useState<ActiveShipmentPin[]>([]);
  const [vehicles, setVehicles] = useState<WarehouseVehicleItem[]>([]);
  const [drivers, setDrivers] = useState<WarehouseDriverItem[]>([]);
  const [outgoingShipments, setOutgoingShipments] = useState<WarehouseShipmentItem[]>([]);

  // UI & Filter states
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [selectedShipment, setSelectedShipment] = useState<WarehouseShipmentItem | null>(null);

  // Layer filter mode: 'ALL' | 'VEHICLES' | 'DRIVERS' | 'DISPATCHES'
  const [filterMode, setFilterMode] = useState<'ALL' | 'VEHICLES' | 'DRIVERS' | 'DISPATCHES'>('ALL');

  // Layer toggles
  const [showWarehouseLayer, setShowWarehouseLayer] = useState<boolean>(true);
  const [showVehicleLayer, setShowVehicleLayer] = useState<boolean>(true);
  const [showDriverLayer, setShowDriverLayer] = useState<boolean>(true);
  const [showDispatchLayer, setShowDispatchLayer] = useState<boolean>(true);

  // Fetch telemetry from Spring Boot + PostgreSQL
  const loadLiveTelemetry = useCallback(async (isSilentRefresh = false) => {
    try {
      if (isSilentRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const [trackingRes, vehRes, drvRes, outRes, whRes] = await Promise.all([
        warehousePortalService.getLiveTracking(),
        warehousePortalService.getVehicles(),
        warehousePortalService.getDrivers(),
        warehousePortalService.getOutgoingShipments(),
        warehousePortalService.getWarehouse().catch(() => null)
      ]);

      const wh = trackingRes?.warehouse || whRes;
      if (wh) {
        setWarehouse({
          id: wh.id,
          name: wh.name || wh.warehouseName || 'Warehouse Hub',
          code: wh.code || wh.warehouseCode || '',
          latitude: wh.latitude ? Number(wh.latitude) : undefined,
          longitude: wh.longitude ? Number(wh.longitude) : undefined,
          address: wh.address || wh.addressLine1 || '',
          city: wh.city || ''
        });
      }

      if (trackingRes && Array.isArray(trackingRes.activeShipments)) {
        setActiveShipmentPins(trackingRes.activeShipments.map((s: any) => ({
          shipmentId: s.shipmentId || s.id,
          trackingNumber: s.trackingNumber,
          status: s.status,
          latitude: s.currentLatitude ? Number(s.currentLatitude) : undefined,
          longitude: s.currentLongitude ? Number(s.currentLongitude) : undefined,
          locationName: s.currentLocationName,
          driverName: s.driverName,
          driverPhone: s.driverPhone,
          vehicleNumber: s.vehicleNumber,
          destination: s.destinationCity || s.deliveryAddress,
          updatedAt: s.updatedAt
        })));
      }

      setVehicles(Array.isArray(vehRes) ? vehRes : []);
      setDrivers(Array.isArray(drvRes) ? drvRes : []);
      setOutgoingShipments(Array.isArray(outRes) ? outRes : []);
      setLastRefreshed(new Date());
    } catch (err: any) {
      console.error('Error loading warehouse live tracking telemetry:', err);
      setError(err?.response?.data?.message || err?.message || 'Unable to load real-time map telemetry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadLiveTelemetry(false);
  }, [loadLiveTelemetry]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (leafletMapRef.current) return;

    const initialLat = warehouse?.latitude || 20.5937;
    const initialLng = warehouse?.longitude || 78.9629;
    const initialZoom = warehouse?.latitude ? 12 : 5;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      zoomControl: true,
      attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    leafletMapRef.current = map;

    // Resize observer to ensure full container fill
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      leafletMapRef.current = null;
    };
  }, [loading]);

  // Update map markers
  useEffect(() => {
    if (!leafletMapRef.current || !markersLayerRef.current) return;
    const markersGroup = markersLayerRef.current;
    markersGroup.clearLayers();

    // 1. Authoritative Warehouse Marker
    if (warehouse && showWarehouseLayer && warehouse.latitude && warehouse.longitude) {
      const warehouseIcon = L.divIcon({
        className: 'custom-warehouse-pin',
        html: `
          <div style="
            background: #1e1b4b;
            color: #ffffff;
            border: 2px solid #ffffff;
            border-radius: 12px;
            padding: 8px 12px;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 8px 24px rgba(15, 23, 42, 0.4);
            font-family: system-ui, sans-serif;
            white-space: nowrap;
            cursor: pointer;
          ">
            <span style="font-size: 16px;">🏢</span>
            <div>
              <div style="font-size: 11px; font-weight: 800; color: #a5b4fc; text-transform: uppercase;">Hub Facility</div>
              <div style="font-size: 12.5px; font-weight: 700; color: #ffffff;">${warehouse.code || warehouse.name}</div>
            </div>
          </div>
        `,
        iconSize: [160, 48],
        iconAnchor: [80, 24]
      });

      const whMarker = L.marker([warehouse.latitude, warehouse.longitude], { icon: warehouseIcon })
        .bindPopup(`
          <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 200px;">
            <strong style="color: #0f172a; font-size: 13px;">${warehouse.name}</strong>
            <div style="font-size: 11px; color: #4338ca; font-weight: 700; margin-top: 2px;">${warehouse.code}</div>
            <div style="font-size: 11.5px; color: #64748b; margin-top: 4px;">${warehouse.address || ''}, ${warehouse.city || ''}</div>
            <div style="margin-top: 6px; font-size: 11px; color: #059669; font-weight: 600;">Status: Active Facility</div>
          </div>
        `);
      markersGroup.addLayer(whMarker);
    }

    // 2. Active Shipments
    if (showDispatchLayer && activeShipmentPins.length > 0) {
      activeShipmentPins.forEach((pin) => {
        if (!pin.latitude || !pin.longitude) return;

        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matches = pin.trackingNumber.toLowerCase().includes(q) ||
            (pin.driverName && pin.driverName.toLowerCase().includes(q)) ||
            (pin.vehicleNumber && pin.vehicleNumber.toLowerCase().includes(q));
          if (!matches) return;
        }

        const isTransit = pin.status === 'IN_TRANSIT';
        const badgeColor = isTransit ? '#2563eb' : '#059669';

        const shipmentIcon = L.divIcon({
          className: 'custom-shipment-pin',
          html: `
            <div style="
              background: ${badgeColor};
              color: #ffffff;
              border: 2px solid #ffffff;
              border-radius: 50%;
              width: 38px;
              height: 38px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 16px rgba(0,0,0,0.3);
              font-size: 18px;
              cursor: pointer;
              transition: transform 0.2s ease;
            ">
              🚚
            </div>
          `,
          iconSize: [38, 38],
          iconAnchor: [19, 19]
        });

        const markerPopup = `
          <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 220px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <strong style="color: #1d4ed8; font-size: 13px;">${pin.trackingNumber}</strong>
              <span style="font-size: 10px; font-weight: 700; color: ${badgeColor}; background: #f8fafc; padding: 2px 6px; border-radius: 4px; border: 1px solid #e2e8f0;">
                ${pin.status}
              </span>
            </div>
            <div style="font-size: 11.5px; color: #334155; margin-top: 4px;">
              <strong>Vehicle:</strong> ${pin.vehicleNumber || 'Unassigned'}
            </div>
            <div style="font-size: 11.5px; color: #334155; margin-top: 2px;">
              <strong>Driver:</strong> ${pin.driverName || 'Unassigned'} ${pin.driverPhone ? `(${pin.driverPhone})` : ''}
            </div>
            <div style="font-size: 11.5px; color: #64748b; margin-top: 4px;">
              <strong>Checkpoint:</strong> ${pin.locationName || 'Hub Transit Yard'}
            </div>
            <div style="font-size: 11.5px; color: #64748b; margin-top: 2px;">
              <strong>Destination:</strong> ${pin.destination || 'Direct Delivery'}
            </div>
            <div style="margin-top: 8px; font-size: 10.5px; color: #94a3b8;">
              Telemetry Updated: ${pin.updatedAt ? new Date(pin.updatedAt).toLocaleTimeString() : 'Recent'}
            </div>
          </div>
        `;

        const shipMarker = L.marker([pin.latitude, pin.longitude], { icon: shipmentIcon })
          .bindPopup(markerPopup);

        shipMarker.on('click', () => {
          const matched = outgoingShipments.find(s => s.trackingNumber === pin.trackingNumber);
          if (matched) {
            setSelectedShipment(matched);
          }
        });

        markersGroup.addLayer(shipMarker);
      });
    }
  }, [warehouse, activeShipmentPins, showWarehouseLayer, showDispatchLayer, searchQuery, outgoingShipments]);

  // Center map on warehouse hub
  const recenterToHub = () => {
    if (leafletMapRef.current && warehouse && warehouse.latitude != null && warehouse.longitude != null) {
      leafletMapRef.current.flyTo([warehouse.latitude, warehouse.longitude], 13, { duration: 1.2 });
    }
  };

  // Filtered outgoing shipments list
  const filteredOutgoing = useMemo(() => {
    if (!searchQuery) return outgoingShipments;
    const q = searchQuery.toLowerCase();
    return outgoingShipments.filter(s =>
      s.trackingNumber.toLowerCase().includes(q) ||
      (s.destinationCity && s.destinationCity.toLowerCase().includes(q)) ||
      (s.deliveryAddress && s.deliveryAddress.toLowerCase().includes(q)) ||
      (s.vehicleNumber && s.vehicleNumber.toLowerCase().includes(q)) ||
      (s.driverName && s.driverName.toLowerCase().includes(q))
    );
  }, [outgoingShipments, searchQuery]);

  // Fleet Statistics
  const fleetKPIs = useMemo(() => {
    const totalVehicles = vehicles.length;
    const operationalVehicles = vehicles.filter(v => v.status === 'AVAILABLE' || v.status === 'ASSIGNED').length;
    const totalDrivers = drivers.length;
    const availableDrivers = drivers.filter(d => d.status === 'AVAILABLE').length;
    const activeDispatchesCount = outgoingShipments.filter(s => 
      s.status === 'CONFIRMED' || s.status === 'IN_TRANSIT' || s.operationalStage === 'DISPATCHED'
    ).length;

    return { totalVehicles, operationalVehicles, totalDrivers, availableDrivers, activeDispatchesCount };
  }, [vehicles, drivers, outgoingShipments]);

  // Relative elapsed time
  const relativeTimeString = useMemo(() => {
    const diffSecs = Math.max(0, Math.floor((new Date().getTime() - lastRefreshed.getTime()) / 1000));
    if (diffSecs < 10) return 'Just now';
    if (diffSecs < 60) return `${diffSecs}s ago`;
    const mins = Math.floor(diffSecs / 60);
    return `${mins}m ago`;
  }, [lastRefreshed]);

  return (
    <div className="wh-page-container">
      {/* ── Page Header ── */}
      <div className="wh-header-row">
        <div>
          <div className="wh-title-group">
            <div className="wh-title-icon">
              <Compass size={22} />
            </div>
            <div>
              <h1 className="wh-page-title">Live Operational Map</h1>
              <p className="wh-page-subtitle">
                Monitor active warehouse fleet, dispatch routing, delivery checkpoints, and telemetry.
              </p>
            </div>
          </div>
        </div>

        <div className="wh-header-actions">
          <button
            onClick={recenterToHub}
            className="wh-btn wh-btn-outline"
            title="Center map on Bengaluru Hub"
          >
            <Crosshair size={15} />
            <span>Center Hub</span>
          </button>

          <button
            onClick={() => loadLiveTelemetry(true)}
            disabled={refreshing || loading}
            className="wh-btn wh-btn-primary"
            title="Fetch real-time telemetry"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Syncing...' : `Refresh (${relativeTimeString})`}</span>
          </button>
        </div>
      </div>

      {/* ── Filter & Search Toolbar ── */}
      <div className="wh-toolbar-card">
        <div className="wh-toolbar-row">
          <div className="wh-search-box" style={{ maxWidth: 360 }}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Search shipment, driver, vehicle plate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="wh-search-input"
            />
          </div>

          {/* Quick Filter Buttons: Search | All | Vehicles | Drivers | Dispatches */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <button
              onClick={() => setFilterMode('ALL')}
              className={`wh-btn wh-btn-sm ${filterMode === 'ALL' ? 'wh-btn-primary' : 'wh-btn-outline'}`}
            >
              All Layers
            </button>
            <button
              onClick={() => {
                setFilterMode('VEHICLES');
                setShowVehicleLayer(true);
              }}
              className={`wh-btn wh-btn-sm ${filterMode === 'VEHICLES' ? 'wh-btn-primary' : 'wh-btn-outline'}`}
            >
              <Truck size={13} />
              <span>Vehicles ({vehicles.length})</span>
            </button>
            <button
              onClick={() => {
                setFilterMode('DRIVERS');
                setShowDriverLayer(true);
              }}
              className={`wh-btn wh-btn-sm ${filterMode === 'DRIVERS' ? 'wh-btn-primary' : 'wh-btn-outline'}`}
            >
              <UserCheck size={13} />
              <span>Drivers ({drivers.length})</span>
            </button>
            <button
              onClick={() => {
                setFilterMode('DISPATCHES');
                setShowDispatchLayer(true);
              }}
              className={`wh-btn wh-btn-sm ${filterMode === 'DISPATCHES' ? 'wh-btn-primary' : 'wh-btn-outline'}`}
            >
              <Package size={13} />
              <span>Dispatches ({outgoingShipments.length})</span>
            </button>
          </div>

          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="wh-btn wh-btn-outline wh-btn-sm">
              <X size={14} /> Clear Search
            </button>
          )}
        </div>

        {/* Layer Checkboxes */}
        <div className="wh-toolbar-meta" style={{ justifyContent: 'flex-start', gap: 16 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Map Layers:
          </span>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#334155', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showWarehouseLayer}
              onChange={(e) => setShowWarehouseLayer(e.target.checked)}
              style={{ accentColor: '#059669' }}
            />
            <span>Central Warehouse</span>
          </label>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#334155', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showDispatchLayer}
              onChange={(e) => setShowDispatchLayer(e.target.checked)}
              style={{ accentColor: '#059669' }}
            />
            <span>In-Transit Shipments ({activeShipmentPins.length})</span>
          </label>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#334155', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showVehicleLayer}
              onChange={(e) => setShowVehicleLayer(e.target.checked)}
              style={{ accentColor: '#059669' }}
            />
            <span>Active Fleet</span>
          </label>
        </div>
      </div>

      {/* ── KPI Summary Cards ── */}
      <div className="wh-kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <div className="wh-kpi-card">
          <div className="wh-kpi-top">
            <span className="wh-kpi-label">Active Dispatches</span>
            <div className="wh-kpi-icon indigo">
              <Package size={18} />
            </div>
          </div>
          <div className="wh-kpi-value">{fleetKPIs.activeDispatchesCount}</div>
          <div className="wh-kpi-subtext">Consignments on live route</div>
        </div>

        <div className="wh-kpi-card">
          <div className="wh-kpi-top">
            <span className="wh-kpi-label">Operational Fleet</span>
            <div className="wh-kpi-icon blue">
              <Truck size={18} />
            </div>
          </div>
          <div className="wh-kpi-value" style={{ color: '#059669' }}>{fleetKPIs.operationalVehicles}</div>
          <div className="wh-kpi-subtext">Of {fleetKPIs.totalVehicles} total vehicles</div>
        </div>

        <div className="wh-kpi-card">
          <div className="wh-kpi-top">
            <span className="wh-kpi-label">Available Drivers</span>
            <div className="wh-kpi-icon green">
              <UserCheck size={18} />
            </div>
          </div>
          <div className="wh-kpi-value" style={{ color: '#059669' }}>{fleetKPIs.availableDrivers}</div>
          <div className="wh-kpi-subtext">Ready for immediate dispatch</div>
        </div>
      </div>

      {/* ── PRIMARY OPERATIONAL LAYOUT: 70% LEAFLET MAP / 30% ACTIVE DISPATCHES ── */}
      <div className="wh-map-grid">
        {/* LEFT (70%): Leaflet Map View */}
        <div className="wh-map-container">
          <div
            ref={mapContainerRef}
            style={{ width: '100%', height: '100%', minHeight: 480, zIndex: 1 }}
          />

          {/* Map Overlay Badge */}
          <div style={{
            position: 'absolute',
            top: 14,
            right: 14,
            zIndex: 400,
            background: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(4px)',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: '6px 12px',
            fontSize: 11.5,
            fontWeight: 700,
            color: '#1e293b',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#059669', display: 'inline-block' }} />
            <span>Bengaluru Operations Hub (12.9716° N, 77.5946° E)</span>
          </div>
        </div>

        {/* RIGHT (30%): Active Dispatches Panel */}
        <div className="wh-map-sidebar">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                ACTIVE DISPATCHES
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: 11.5, color: '#64748b' }}>
                Outbound consignments in transit
              </p>
            </div>
            <span className="wh-badge indigo">
              {filteredOutgoing.length} Active
            </span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredOutgoing.length === 0 ? (
              <div style={{ padding: '40px 16px', textAlign: 'center', color: '#94a3b8' }}>
                <Package size={36} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: 12.5, margin: 0 }}>No active dispatches found matching filter.</p>
              </div>
            ) : (
              filteredOutgoing.map((shipment) => {
                const isSelected = selectedShipment?.id === shipment.id;
                const isTransit = shipment.status === 'IN_TRANSIT' || shipment.operationalStage === 'DISPATCHED';

                return (
                  <div
                    key={shipment.id}
                    onClick={() => setSelectedShipment(shipment)}
                    style={{
                      background: isSelected ? '#ecfdf5' : '#ffffff',
                      border: isSelected ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                      borderRadius: 12,
                      padding: 14,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 1px 2px rgba(15,23,42,0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className="wh-mono-badge" style={{ fontSize: 12, color: '#047857' }}>
                        {shipment.trackingNumber}
                      </span>
                      <span className={`wh-badge ${isTransit ? 'blue' : 'green'}`} style={{ fontSize: 10.5, padding: '2px 6px' }}>
                        {shipment.status}
                      </span>
                    </div>

                    <div style={{ marginTop: 8, fontSize: 12, color: '#334155' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>
                        {shipment.destinationCity || shipment.deliveryAddress || 'Direct Destination'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, color: '#64748b', fontSize: 11.5 }}>
                        <span>Driver: <strong>{shipment.driverName || 'Unassigned'}</strong></span>
                        <span>Plate: <strong>{shipment.vehicleNumber || 'Pending'}</strong></span>
                      </div>
                    </div>

                    <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedShipment(shipment);
                        }}
                        className="wh-btn wh-btn-outline wh-btn-sm"
                        style={{ padding: '3px 8px', fontSize: 11 }}
                      >
                        <Eye size={11} />
                        <span>Inspect</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Slide-Over Shipment Manifest Drawer ── */}
      {selectedShipment && (
        <div className="wh-drawer-overlay" onClick={() => setSelectedShipment(null)}>
          <div className="wh-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="wh-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="wh-title-icon" style={{ width: 40, height: 40 }}>
                  <Package size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                    {selectedShipment.trackingNumber}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                    <span className="wh-badge blue">{selectedShipment.status}</span>
                    <span style={{ fontSize: 11, color: '#64748b' }}>Order #{selectedShipment.orderId || selectedShipment.orderNumber}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedShipment(null)}
                className="wh-btn-icon"
                title="Close drawer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="wh-drawer-body">
              {/* ROUTE INFORMATION */}
              <div className="wh-drawer-section">
                <div className="wh-drawer-section-title">
                  <Navigation size={13} color="#059669" />
                  <span>DISPATCH & ROUTE DETAILS</span>
                </div>
                <div className="wh-drawer-card">
                  <div className="wh-drawer-row">
                    <span className="wh-drawer-label">Origin Facility</span>
                    <span className="wh-drawer-val">
                      {warehouse?.name ? `${warehouse.name} (${warehouse.code || 'HUB'})` : 'Origin Facility'}
                    </span>
                  </div>
                  <div className="wh-drawer-row">
                    <span className="wh-drawer-label">Destination</span>
                    <span className="wh-drawer-val">{selectedShipment.destinationCity || selectedShipment.deliveryAddress || 'Client Facility'}</span>
                  </div>
                  <div className="wh-drawer-row">
                    <span className="wh-drawer-label">Estimated Arrival</span>
                    <span className="wh-drawer-val">
                      {selectedShipment.estimatedDeliveryDate ? new Date(selectedShipment.estimatedDeliveryDate).toLocaleDateString() : 'On Schedule'}
                    </span>
                  </div>
                </div>
              </div>

              {/* DRIVER & VEHICLE */}
              <div className="wh-drawer-section">
                <div className="wh-drawer-section-title">
                  <Truck size={13} color="#059669" />
                  <span>FLEET & DRIVER TELEMETRY</span>
                </div>
                <div className="wh-drawer-card">
                  <div className="wh-drawer-row">
                    <span className="wh-drawer-label">Driver Assigned</span>
                    <span className="wh-drawer-val">{selectedShipment.driverName || 'Unassigned'}</span>
                  </div>
                  {selectedShipment.driverPhone && (
                    <div className="wh-drawer-row">
                      <span className="wh-drawer-label">Contact Driver</span>
                      <a href={`tel:${selectedShipment.driverPhone}`} style={{ color: '#047857', fontWeight: 600, textDecoration: 'none' }}>
                        {selectedShipment.driverPhone}
                      </a>
                    </div>
                  )}
                  <div className="wh-drawer-row">
                    <span className="wh-drawer-label">Assigned Vehicle</span>
                    <span className="wh-mono-badge">{selectedShipment.vehicleNumber || 'Pending'}</span>
                  </div>
                </div>
              </div>

              {/* PRODUCT MANIFEST */}
              <div className="wh-drawer-section">
                <div className="wh-drawer-section-title">
                  <Box size={13} color="#059669" />
                  <span>CARGO MANIFEST</span>
                </div>
                <div className="wh-drawer-card">
                  {selectedShipment.items && selectedShipment.items.length > 0 ? (
                    selectedShipment.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: 12.5 }}>
                        <div>
                          <strong style={{ color: '#0f172a' }}>{item.productName || item.sku}</strong>
                          <div style={{ fontSize: 11, color: '#64748b' }}>SKU: {item.sku}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontWeight: 700, color: '#047857' }}>{item.quantity} Units</span>
                          {item.totalWeight && <div style={{ fontSize: 11, color: '#64748b' }}>{item.totalWeight} KG</div>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: 12.5, color: '#64748b' }}>
                      Standard freight consignment package
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="wh-drawer-footer">
              <button
                onClick={() => setSelectedShipment(null)}
                className="wh-btn wh-btn-outline"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
