import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Truck,
  Gauge,
  Compass,
  Radio,
  RefreshCw,
  Maximize2,
  ShieldCheck,
  AlertCircle,
  Clock,
  Wifi,
  Navigation,
  CheckCircle2,
  Package,
  Layers,
  Crosshair,
  User,
  Activity,
  AlertTriangle,
  LocateFixed
} from 'lucide-react';
import { driverPortalService } from '../../services/driverPortalService';
import { useDriverGpsBroadcaster } from '../../hooks/useDriverGpsBroadcaster';
import type { VehicleTelemetry, DeliveryAssignment, DriverProfileData } from '../../types/driverPortal';

function getHeadingCompass(heading: number | null): string {
  if (heading == null) return 'Unavailable';
  const deg = ((heading % 360) + 360) % 360;
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}

export default function DriverLiveLocation() {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  const [profile, setProfile] = useState<DriverProfileData | null>(null);
  const [vehicle, setVehicle] = useState<VehicleTelemetry | null>(null);
  const [delivery, setDelivery] = useState<DeliveryAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isBroadcastingManual, setIsBroadcastingManual] = useState(true);

  const isActiveDelivery = Boolean(
    delivery &&
    (delivery.status === 'IN_TRANSIT' || delivery.status === 'OUT_FOR_DELIVERY')
  );

  const isGpsActive = Boolean(isBroadcastingManual && isActiveDelivery);

  const handleBroadcastSuccess = useCallback((updated: DeliveryAssignment) => {
    setDelivery(updated);
  }, []);

  // Hook for real GPS telemetry acquisition and periodic transmission to backend
  const gps = useDriverGpsBroadcaster(delivery, {
    enabled: isGpsActive,
    intervalMs: 15000,
    onBroadcastSuccess: handleBroadcastSuccess,
  });

  const fetchData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [profData, vehData, currDel] = await Promise.all([
        driverPortalService.getProfile(),
        driverPortalService.getVehicle(),
        driverPortalService.getCurrentDelivery(),
      ]);
      setProfile(profData);
      setVehicle(vehData);
      setDelivery(currDel);
      if (isManual) {
        setStatusMessage('Telemetry refreshed from server.');
        setTimeout(() => setStatusMessage(null), 3500);
      }
    } catch (err) {
      console.error('Failed to load telemetry context:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute GPS Freshness
  const computeFreshness = (): 'LIVE' | 'RECENT' | 'LAST_RECORDED' => {
    if (delivery?.status === 'DELIVERED') {
      return 'LAST_RECORDED';
    }
    const lastTimestamp = delivery?.lastLocationUpdatedAt
      ? new Date(delivery.lastLocationUpdatedAt).getTime()
      : gps.lastBroadcastTime
      ? gps.lastBroadcastTime.getTime()
      : null;

    if (!lastTimestamp) return 'LAST_RECORDED';

    const diffSeconds = (Date.now() - lastTimestamp) / 1000;
    if (diffSeconds < 60 && isActiveDelivery) {
      return 'LIVE';
    } else if (diffSeconds < 300) {
      return 'RECENT';
    } else {
      return 'LAST_RECORDED';
    }
  };

  const freshness = computeFreshness();

  // Coordinates resolution (Only resolve origin/destination when an active delivery exists)
  const originCoords: [number, number] | null = (isActiveDelivery && delivery?.pickupHub?.coordinates)
    ? delivery.pickupHub.coordinates
    : null;
  const destCoords: [number, number] | null = (isActiveDelivery && delivery?.destination?.coordinates)
    ? delivery.destination.coordinates
    : null;

  // Real Driver Live Coordinates from GPS Hook or persisted backend state
  const hasGpsCoords = gps.latitude != null || delivery?.currentLatitude != null;
  const currentLat = gps.latitude ?? delivery?.currentLatitude ?? 12.9716;
  const currentLng = gps.longitude ?? delivery?.currentLongitude ?? 77.5946;
  const currentCoords: [number, number] = [currentLat, currentLng];

  // Leaflet Map Initialization & Updates
  useEffect(() => {
    if (loading || !mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: currentCoords,
        zoom: 13,
        zoomControl: true,
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
    const createCustomIcon = (bgColor: string, symbol: string, isPulsing = false) => {
      return L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            ${isPulsing ? `<div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background-color: ${bgColor}; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
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
              box-shadow: 0 4px 10px rgba(0,0,0,0.3);
              z-index: 10;
            ">
              ${symbol}
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20],
      });
    };

    const isMarkerLive = freshness === 'LIVE' && gps.isWatching;
    const truckIcon = createCustomIcon('#2563eb', '🚚', isMarkerLive);

    // 1. Truck / Driver Live Marker
    const truckMarker = L.marker(currentCoords, { icon: truckIcon }).addTo(markerGroup);
    truckMarker.bindPopup(`
      <div style="font-family: inherit; font-size: 12px; line-height: 1.4;">
        <strong style="color: #2563eb;">${vehicle?.vehicleNumber || profile?.assignedVehiclePlate || 'Assigned Vehicle'}</strong><br/>
        Driver: <strong>${profile?.fullName || 'Driver'}</strong> (${profile?.driverCode || profile?.driverId || 'DRV'})<br/>
        Status: <strong>${isActiveDelivery ? (delivery?.status || 'Active') : 'No Active Delivery'}</strong><br/>
        Driver Status: <strong>${profile?.status || 'AVAILABLE'}</strong><br/>
        Speed: <strong>${gps.speed != null ? `${gps.speed} km/h` : 'Speed unavailable'}</strong><br/>
        Heading: <strong>${gps.heading != null ? `${gps.heading}° (${getHeadingCompass(gps.heading)})` : 'Heading unavailable'}</strong><br/>
        Accuracy: <strong>${gps.accuracy != null ? `±${Math.round(gps.accuracy)}m` : 'Accuracy unavailable'}</strong><br/>
        GPS: ${currentLat.toFixed(5)}°, ${currentLng.toFixed(5)}°
      </div>
    `);

    // 2. Origin Marker (Only if active delivery exists)
    if (isActiveDelivery && originCoords) {
      const originIcon = createCustomIcon('#059669', '🏢');
      const originMarker = L.marker(originCoords, { icon: originIcon }).addTo(markerGroup);
      originMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px;">
          <strong style="color: #059669;">Origin Hub</strong><br/>
          ${delivery?.pickupLocation?.facilityName || profile?.assignedWarehouseName || 'Fulfillment Center'}<br/>
          ${delivery?.pickupLocation?.city || ''}
        </div>
      `);
    }

    // 3. Destination Marker (Only if active delivery exists)
    if (isActiveDelivery && destCoords) {
      const destIcon = createCustomIcon('#dc2626', '📍');
      const destMarker = L.marker(destCoords, { icon: destIcon }).addTo(markerGroup);
      destMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px;">
          <strong style="color: #dc2626;">Destination</strong><br/>
          ${delivery?.destination?.customerName || delivery?.recipientName || 'Customer Destination'}<br/>
          ${delivery?.destination?.address || ''}, ${delivery?.destination?.city || ''}
        </div>
      `);
    }

    // 4. Polylines (Only if active delivery exists; clear if no active delivery)
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    if (isActiveDelivery && originCoords && destCoords) {
      const routePath: [number, number][] = [originCoords, currentCoords, destCoords];
      polylineRef.current = L.polyline(routePath, {
        color: '#2563eb',
        weight: 4,
        dashArray: '6, 6',
        opacity: 0.8,
      }).addTo(map);
    }

  }, [loading, currentLat, currentLng, gps.speed, gps.heading, gps.accuracy, gps.isWatching, freshness, profile, vehicle, delivery, isActiveDelivery, originCoords, destCoords]);

  const handleRecenter = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo(currentCoords, 14, { duration: 0.8 });
    }
  };

  const handleFitBounds = () => {
    if (leafletMapRef.current && isActiveDelivery && originCoords && destCoords) {
      leafletMapRef.current.fitBounds([originCoords, destCoords, currentCoords], { padding: [40, 40] });
    }
  };

  const handleManualBroadcast = async () => {
    if (!isActiveDelivery) {
      setStatusMessage('No active delivery available for shipment tracking.');
      setTimeout(() => setStatusMessage(null), 4000);
      return;
    }
    await gps.triggerManualBroadcast();
    await fetchData(true);
  };

  return (
    <div className="driver-page-container">
      {/* ── Status Feedback Alert ── */}
      {statusMessage && (
        <div
          style={{
            padding: '10px 16px',
            backgroundColor: '#dcfce7',
            border: '1px solid #86efac',
            borderRadius: 8,
            color: '#15803d',
            fontSize: 13,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <CheckCircle2 size={16} />
          {statusMessage}
        </div>
      )}

      {/* ── Delivery Completed Notification ── */}
      {delivery?.status === 'DELIVERED' && (
        <div
          style={{
            padding: '12px 18px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 10,
            color: '#166534',
            fontSize: 13.5,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={18} />
            <span>Delivery completed — live tracking stopped. Final recorded location preserved.</span>
          </div>
          <Link to="/driver/deliveries" style={{ color: '#15803d', textDecoration: 'underline', fontSize: 13 }}>
            View Deliveries &rarr;
          </Link>
        </div>
      )}

      {/* ── GPS Permission Denied Warning Banner ── */}
      {gps.permissionStatus === 'denied' && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: 10,
            backgroundColor: '#fef2f2',
            border: '1px solid #fee2e2',
            color: '#b91c1c',
            fontSize: 13.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={18} />
            <strong>Location permission is required to broadcast live GPS.</strong>
          </div>
          <button
            onClick={gps.requestPermission}
            className="driver-btn-primary"
            style={{ padding: '6px 14px', fontSize: 12.5, backgroundColor: '#dc2626', borderColor: '#b91c1c' }}
          >
            <LocateFixed size={14} /> Enable Location
          </button>
        </div>
      )}

      {/* ── Top Telemetry Banner ── */}
      <div className="driver-card">
        <div className="driver-card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              {/* Telemetry Status Badge */}
              <span
                className={`driver-badge ${
                  delivery?.status === 'DELIVERED'
                    ? 'driver-badge-green'
                    : gps.permissionStatus === 'denied'
                    ? 'driver-badge-red'
                    : isGpsActive && gps.isWatching
                    ? 'driver-badge-blue'
                    : 'driver-badge-gray'
                }`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
              >
                <Radio size={12} className={isGpsActive && gps.isWatching ? 'animate-pulse' : ''} />
                {delivery?.status === 'DELIVERED'
                  ? 'DELIVERY COMPLETED'
                  : gps.permissionStatus === 'denied'
                  ? 'PERMISSION DENIED'
                  : isGpsActive && gps.isWatching
                  ? 'REAL GPS TELEMETRY ACTIVE'
                  : 'GPS STANDBY'}
              </span>

              {/* Freshness Badge */}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: 6,
                  backgroundColor:
                    freshness === 'LIVE' ? '#dcfce7' : freshness === 'RECENT' ? '#fef3c7' : '#f1f5f9',
                  color:
                    freshness === 'LIVE' ? '#166534' : freshness === 'RECENT' ? '#92400e' : '#475569',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Activity size={12} className={freshness === 'LIVE' ? 'animate-pulse' : ''} />
                {freshness}
              </span>

              {/* Driver Status Badge */}
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: 6,
                  backgroundColor: profile?.status === 'ON_TRIP' ? '#dbeafe' : '#f1f5f9',
                  color: profile?.status === 'ON_TRIP' ? '#1e40af' : '#475569',
                }}
              >
                DRIVER: {profile?.status || 'AVAILABLE'}
              </span>

              <span style={{ fontSize: 13, color: '#64748b' }}>
                Transmission Interval: 15s &bull; Broadcasts: {gps.broadcastCount}
              </span>
            </div>

            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
              Live Driver GPS Telemetry
            </h2>

            <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>
              Driver: <strong>{profile?.fullName || 'Driver'}</strong> ({profile?.driverCode || profile?.driverId || 'DRV-N/A'}) &bull; Vehicle: <strong>{vehicle?.vehicleNumber || profile?.assignedVehiclePlate || 'Assigned Vehicle'}</strong> ({vehicle?.model || 'Commercial Fleet'}) &bull; Shipment: <strong>{delivery?.trackingNumber || 'No Active Delivery'}</strong> ({delivery?.status ? delivery.status.replace(/_/g, ' ') : 'None'})
            </div>
          </div>

          {/* Quick Map & Portal Controls */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={handleManualBroadcast}
              disabled={gps.isBroadcasting || !isActiveDelivery}
              className="driver-btn-secondary"
              style={{
                padding: '8px 12px',
                fontSize: 12.5,
                opacity: !isActiveDelivery ? 0.6 : 1,
                cursor: !isActiveDelivery ? 'not-allowed' : 'pointer',
              }}
              title={isActiveDelivery ? "Force immediate GPS coordinates transmission to backend" : "No active delivery available for shipment tracking"}
            >
              <RefreshCw size={13} className={gps.isBroadcasting ? 'animate-spin' : ''} />
              <span>{gps.isBroadcasting ? 'Broadcasting...' : 'Broadcast GPS Now'}</span>
            </button>
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="driver-btn-secondary"
              style={{ padding: '8px 12px', fontSize: 12.5 }}
              title="Retrieve latest persisted telemetry and shipment state"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              <span>{refreshing ? 'Syncing...' : 'Refresh GPS'}</span>
            </button>
            <button
              onClick={handleRecenter}
              disabled={!hasGpsCoords}
              className="driver-btn-secondary"
              style={{
                padding: '8px 12px',
                fontSize: 12.5,
                opacity: !hasGpsCoords ? 0.6 : 1,
              }}
              title={hasGpsCoords ? "Center map on driver GPS position" : "GPS coordinates unavailable"}
            >
              <Crosshair size={14} /> Recenter Driver
            </button>
            <button
              onClick={handleFitBounds}
              disabled={!isActiveDelivery || !originCoords || !destCoords}
              className="driver-btn-secondary"
              style={{
                padding: '8px 12px',
                fontSize: 12.5,
                opacity: (!isActiveDelivery || !originCoords || !destCoords) ? 0.5 : 1,
                cursor: (!isActiveDelivery || !originCoords || !destCoords) ? 'not-allowed' : 'pointer',
              }}
              title={isActiveDelivery ? "Fit map bounds to corridor route" : "Route fitting disabled — No active delivery"}
            >
              <Maximize2 size={14} /> Fit Route
            </button>
            <button
              onClick={() => navigate('/driver/route')}
              className="driver-btn-secondary"
              style={{ padding: '8px 12px', fontSize: 12.5 }}
              title="Navigate to Turn-by-Turn Road Route"
            >
              <Navigation size={14} /> Route
            </button>
            <button
              onClick={() => navigate('/driver/current-delivery')}
              className="driver-btn-secondary"
              style={{ padding: '8px 12px', fontSize: 12.5 }}
              title="Navigate to Active Consignment Details"
            >
              <Package size={14} /> Current Delivery
            </button>
            <button
              onClick={() => setIsBroadcastingManual(!isBroadcastingManual)}
              disabled={!isActiveDelivery}
              className={isBroadcastingManual && isActiveDelivery ? 'driver-btn-primary' : 'driver-btn-secondary'}
              style={{
                padding: '8px 14px',
                fontSize: 12.5,
                opacity: !isActiveDelivery ? 0.6 : 1,
              }}
              title={isActiveDelivery ? "Toggle automatic periodic telemetry broadcasting" : "Broadcasting disabled — No active delivery"}
            >
              <Wifi size={14} /> {isBroadcastingManual && isActiveDelivery ? 'Broadcasting ON' : 'Broadcasting OFF'}
            </button>
          </div>
        </div>

        {/* GPS Error Alert */}
        {gps.error && gps.permissionStatus !== 'denied' && (
          <div
            style={{
              margin: '10px 0',
              padding: '10px 14px',
              borderRadius: 8,
              backgroundColor: '#fef2f2',
              border: '1px solid #fee2e2',
              color: '#b91c1c',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} />
              <span>{gps.error}</span>
            </div>
            <button
              onClick={gps.requestPermission}
              className="driver-btn-secondary"
              style={{ padding: '4px 10px', fontSize: 12 }}
            >
              Retry GPS
            </button>
          </div>
        )}

        {/* Live Gauges Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: 12,
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: 14,
            marginTop: 10,
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Current Speed</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#2563eb', marginTop: 2 }}>
              {gps.speed != null ? (
                <>
                  {gps.speed} <span style={{ fontSize: 13, fontWeight: 600 }}>KM/H</span>
                  {gps.speed === 0 && <span style={{ fontSize: 11, color: '#64748b', marginLeft: 6 }}>(Stationary)</span>}
                </>
              ) : (
                <span style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>Speed unavailable</span>
              )}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Heading Direction</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Compass size={16} style={{ color: '#2563eb' }} />
              {gps.heading != null ? `${Math.round(gps.heading)}° (${getHeadingCompass(gps.heading)})` : 'Heading unavailable'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>GPS Coordinates</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginTop: 6, fontFamily: 'monospace' }}>
              {currentLat.toFixed(5)}° N, {currentLng.toFixed(5)}° E
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>GPS Fix & Accuracy</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: gps.accuracy != null && gps.accuracy <= 25 ? '#16a34a' : '#2563eb', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: gps.isWatching ? '#22c55e' : '#94a3b8' }} />
              {gps.accuracy != null ? `Real GPS • ±${Math.round(gps.accuracy)}m` : 'Accuracy unavailable'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Current Location</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginTop: 6, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {isActiveDelivery
                ? (delivery?.currentLocationName || delivery?.pickupLocation?.city || 'In Transit Corridor')
                : (profile?.assignedWarehouseName || 'Driver Base Location (Available)')}
            </div>
          </div>
        </div>
      </div>

      {/* ── Interactive Leaflet Map Container ── */}
      <div className="driver-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          ref={mapContainerRef}
          style={{
            width: '100%',
            height: 480,
            minHeight: 360,
            backgroundColor: '#e2e8f0',
            zIndex: 1,
          }}
        />
        <div
          style={{
            padding: '10px 16px',
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 12,
            color: '#64748b',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            {isActiveDelivery && originCoords && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#059669' }} /> Origin Hub ({delivery?.pickupLocation?.city || 'Warehouse'})
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#2563eb' }} /> {isActiveDelivery ? `Live Vehicle (${profile?.fullName || 'Driver'})` : `Driver Position (${profile?.fullName || 'Driver'})`}
            </span>
            {isActiveDelivery && destCoords && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#dc2626' }} /> Destination ({delivery?.destination?.customerName || delivery?.recipientName || 'Customer'})
              </span>
            )}
            {!isActiveDelivery && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontStyle: 'italic' }}>
                No active delivery route
              </span>
            )}
          </div>
          <span>
            {gps.lastBroadcastTime
              ? `Last telemetry transmitted: ${gps.lastBroadcastTime.toLocaleTimeString()}`
              : delivery?.lastLocationUpdatedAt
              ? `Last synced: ${new Date(delivery.lastLocationUpdatedAt).toLocaleTimeString()}`
              : 'Standby / Last recorded location'}
          </span>
        </div>
      </div>
    </div>
  );
}

