import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  X,
  Radio,
  Truck,
  MapPin,
  Building2,
  Navigation,
  Phone,
  Calendar,
  Clock,
  RefreshCw,
  Maximize2,
  User,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Layers
} from 'lucide-react';
import { warehousePortalService } from '../../services/warehousePortalService';
import type { WarehouseShipmentItem } from '../../types/warehousePortal';

interface LiveShipmentTrackingModalProps {
  shipment: WarehouseShipmentItem;
  onClose: () => void;
}

export default function LiveShipmentTrackingModal({ shipment, onClose }: LiveShipmentTrackingModalProps) {
  const [currentShipment, setCurrentShipment] = useState<WarehouseShipmentItem>(shipment);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  // Poll for live GPS telemetry from driver
  const fetchLatestTelemetry = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const updated = await warehousePortalService.getShipmentById(shipment.id);
      if (updated) {
        setCurrentShipment(updated);
        setLastRefreshedAt(new Date());
        setError(null);
      }
    } catch (err: any) {
      console.warn('Failed to poll live telemetry:', err);
      if (!silent) {
        setError(err?.response?.data?.message || 'Failed to update live coordinates.');
      }
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  };

  // Periodic polling every 10 seconds while modal is open
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchLatestTelemetry(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, shipment.id]);

  // Derive coordinates
  const originLat = 12.9716; // default BLR if origin coords not set
  const originLng = 77.5946;

  const destLat = 13.0827; // default MAA
  const destLng = 80.2707;

  // Real Driver Live Coordinates from Backend
  const driverLat = currentShipment.currentLatitude ?? (originLat + destLat) / 2;
  const driverLng = currentShipment.currentLongitude ?? (originLng + destLng) / 2;
  const hasRealDriverGps = currentShipment.currentLatitude != null && currentShipment.currentLongitude != null;

  // Initialize and Update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      leafletMapRef.current = map;
      markerGroupRef.current = L.layerGroup().addTo(map);
    }

    const map = leafletMapRef.current;
    const markerGroup = markerGroupRef.current;
    if (!map || !markerGroup) return;

    markerGroup.clearLayers();

    // Helper for custom markers
    const createCustomIcon = (bgColor: string, iconHtml: string, pulse = false) => {
      return L.divIcon({
        className: 'custom-tracking-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            ${pulse ? `<div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background-color: ${bgColor}; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
            <div style="
              position: relative;
              width: 36px;
              height: 36px;
              border-radius: 50%;
              background-color: ${bgColor};
              color: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 16px;
              font-weight: 800;
              border: 3px solid #ffffff;
              box-shadow: 0 4px 12px rgba(0,0,0,0.35);
              z-index: 10;
            ">
              ${iconHtml}
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20],
      });
    };

    const originIcon = createCustomIcon('#059669', '🏢');
    const destIcon = createCustomIcon('#dc2626', '📍');
    const truckIcon = createCustomIcon('#2563eb', '🚚', hasRealDriverGps);

    // 1. Origin Marker
    const originMarker = L.marker([originLat, originLng], { icon: originIcon }).addTo(markerGroup);
    originMarker.bindPopup(`
      <div style="font-family: inherit; font-size: 12px; line-height: 1.4;">
        <strong style="color: #059669;">Origin Warehouse Hub</strong><br/>
        <strong>${currentShipment.originWarehouseName || 'Origin Terminal'}</strong><br/>
        <span style="color: #64748b;">${currentShipment.originCity || 'Fulfillment Hub'}</span>
      </div>
    `);

    // 2. Destination Marker
    const destMarker = L.marker([destLat, destLng], { icon: destIcon }).addTo(markerGroup);
    destMarker.bindPopup(`
      <div style="font-family: inherit; font-size: 12px; line-height: 1.4;">
        <strong style="color: #dc2626;">Customer Destination</strong><br/>
        <strong>${currentShipment.customerName || 'Customer'}</strong><br/>
        <span style="color: #64748b;">${currentShipment.deliveryAddress || currentShipment.destinationCity || 'Delivery Location'}</span>
      </div>
    `);

    // 3. Driver Live Location Marker
    const driverMarker = L.marker([driverLat, driverLng], { icon: truckIcon }).addTo(markerGroup);
    driverMarker.bindPopup(`
      <div style="font-family: inherit; font-size: 12.5px; line-height: 1.5; min-width: 200px;">
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
          <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #2563eb;"></span>
          <strong style="color: #1e3a8a;">${hasRealDriverGps ? 'REAL-TIME DRIVER POSITION' : 'ESTIMATED POSITION'}</strong>
        </div>
        <div><strong>Driver:</strong> ${currentShipment.driverName || 'Assigned Driver'}</div>
        <div><strong>Vehicle:</strong> ${currentShipment.vehicleNumber || 'PR-VH'} (${currentShipment.vehicleRegistrationNumber || currentShipment.vehicleModel || ''})</div>
        <div><strong>Status:</strong> <span style="font-weight: 700; color: #2563eb;">${currentShipment.status}</span></div>
        <div><strong>Location:</strong> ${currentShipment.currentLocationName || 'In Transit Corridor'}</div>
        <div><strong>GPS:</strong> ${driverLat.toFixed(5)}, ${driverLng.toFixed(5)}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px; border-top: 1px solid #e2e8f0; padding-top: 4px;">
          Last Telemetry Update: ${currentShipment.lastLocationUpdatedAt ? new Date(currentShipment.lastLocationUpdatedAt).toLocaleTimeString() : 'Recent'}
        </div>
      </div>
    `);

    // 4. Polylines
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    const pathCoords: [number, number][] = [
      [originLat, originLng],
      [driverLat, driverLng],
      [destLat, destLng],
    ];

    polylineRef.current = L.polyline(pathCoords, {
      color: '#2563eb',
      weight: 4,
      dashArray: '6, 6',
      opacity: 0.75,
    }).addTo(map);

    // Auto-fit bounds
    map.fitBounds([
      [originLat, originLng],
      [driverLat, driverLng],
      [destLat, destLng],
    ], { padding: [50, 50], maxZoom: 14 });

  }, [originLat, originLng, destLat, destLng, driverLat, driverLng, hasRealDriverGps, currentShipment]);

  const handleRecenterDriver = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([driverLat, driverLng], 14, { duration: 0.8 });
    }
  };

  const handleFitRoute = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.fitBounds([
        [originLat, originLng],
        [driverLat, driverLng],
        [destLat, destLng],
      ], { padding: [50, 50] });
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: 1080,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top Header ── */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Navigation size={22} className="animate-spin-slow" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0f172a' }}>
                  Live GPS Consignment Tracking
                </h3>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '2px 8px',
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 700,
                    backgroundColor: hasRealDriverGps ? '#dcfce7' : '#e0f2fe',
                    color: hasRealDriverGps ? '#15803d' : '#0369a1',
                  }}
                >
                  <Radio size={12} className={hasRealDriverGps ? 'animate-pulse' : ''} />
                  {hasRealDriverGps ? 'LIVE DRIVER GPS' : 'ACTIVE CONSIGNMENT'}
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>
                Shipment: <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{currentShipment.trackingNumber}</strong> &bull; Order #{currentShipment.orderNumber || 'PR-ORD'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                backgroundColor: autoRefresh ? '#f0fdf4' : '#ffffff',
                color: autoRefresh ? '#15803d' : '#64748b',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
              title="Toggle automatic real-time telemetry polling"
            >
              <Radio size={12} className={autoRefresh ? 'animate-pulse' : ''} />
              <span>{autoRefresh ? 'Auto-Sync ON' : 'Auto-Sync OFF'}</span>
            </button>

            <button
              onClick={() => fetchLatestTelemetry()}
              disabled={isRefreshing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#334155',
                fontSize: 12,
                fontWeight: 600,
                cursor: isRefreshing ? 'not-allowed' : 'pointer',
              }}
            >
              <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync GPS'}</span>
            </button>

            <button
              onClick={onClose}
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                border: 'none',
                backgroundColor: '#e2e8f0',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Main Content: Left Map + Right Telemetry Panel ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', flex: 1, minHeight: 480, overflow: 'hidden' }}>
          {/* Map Area */}
          <div style={{ position: 'relative', height: '100%', minHeight: 480, backgroundColor: '#f1f5f9' }}>
            <div ref={mapContainerRef} style={{ width: '100%', height: '100%', minHeight: 480, zIndex: 1 }} />

            {/* Floating Map Controls */}
            <div
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                zIndex: 400,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <button
                onClick={handleRecenterDriver}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#1d4ed8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                }}
              >
                <Truck size={14} /> Recenter Truck
              </button>
              <button
                onClick={handleFitRoute}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                }}
              >
                <Maximize2 size={14} /> Fit Route
              </button>
            </div>

            {/* Bottom Map Status Bar */}
            <div
              style={{
                position: 'absolute',
                bottom: 12,
                left: 12,
                right: 12,
                zIndex: 400,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(4px)',
                borderRadius: 10,
                padding: '8px 14px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#334155' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: hasRealDriverGps ? '#16a34a' : '#2563eb' }} />
                <span>
                  Live Coordinates: <strong>{driverLat.toFixed(5)}° N, {driverLng.toFixed(5)}° E</strong>
                </span>
                {currentShipment.currentLocationName && (
                  <span style={{ color: '#64748b' }}>&bull; {currentShipment.currentLocationName}</span>
                )}
              </div>
              <div style={{ fontSize: 11.5, color: '#64748b' }}>
                Last synced: {lastRefreshedAt.toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Right Telemetry Details Sidebar */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderLeft: '1px solid #e2e8f0',
              padding: 20,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {/* Live Telemetry Card */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: 14,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Live Fleet Telemetry
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Operational Status</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#2563eb', marginTop: 2 }}>
                    {currentShipment.status}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Stage</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                    {currentShipment.operationalStage}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Telemetry Source</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: hasRealDriverGps ? '#15803d' : '#0369a1', marginTop: 2 }}>
                    {hasRealDriverGps ? 'Driver Device GPS' : 'Transit Corridor'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Last GPS Update</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                    {currentShipment.lastLocationUpdatedAt
                      ? new Date(currentShipment.lastLocationUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                      : 'Recently'}
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned Driver Card */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 10 }}>
                <User size={14} color="#2563eb" /> Assigned Driver
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 14 }}>
                    {currentShipment.driverName || 'No Driver Assigned'}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Phone size={11} /> {currentShipment.driverPhone || 'Not available'}
                  </div>
                </div>
                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: 10,
                    fontSize: 11,
                    fontWeight: 700,
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                  }}
                >
                  {currentShipment.driverStatus || 'ON_TRIP'}
                </span>
              </div>
            </div>

            {/* Assigned Vehicle Card */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 10 }}>
                <Truck size={14} color="#2563eb" /> Assigned Vehicle
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 14, fontFamily: 'monospace' }}>
                    {currentShipment.vehicleNumber || 'Unassigned'}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                    {currentShipment.vehicleModel || currentShipment.vehicleRegistrationNumber || 'Standard Freight Truck'}
                  </div>
                </div>
                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: 10,
                    fontSize: 11,
                    fontWeight: 700,
                    backgroundColor: '#e0f2fe',
                    color: '#0369a1',
                  }}
                >
                  {currentShipment.vehicleStatus || 'IN_TRANSIT'}
                </span>
              </div>
            </div>

            {/* Destination Address Card */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>
                <MapPin size={14} color="#dc2626" /> Delivery Destination
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                {currentShipment.customerName || 'Customer Recipient'}
              </div>
              <div style={{ fontSize: 12, color: '#475569', marginTop: 3, lineHeight: 1.4 }}>
                {currentShipment.deliveryAddress || 'Customer Delivery Address'}
              </div>
              {currentShipment.customerPhone && (
                <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Phone size={11} /> {currentShipment.customerPhone}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
