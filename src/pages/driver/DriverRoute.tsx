import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Navigation,
  MapPin,
  Clock,
  Compass,
  ArrowRight,
  ExternalLink,
  RotateCw,
  AlertTriangle,
  CheckCircle2,
  CornerUpRight,
  CornerUpLeft,
  ArrowUp,
  Map,
  Truck,
  Building,
  Radio,
  Maximize2,
  Crosshair,
  Package,
  Layers,
  Info,
  ShieldCheck
} from 'lucide-react';
import { driverPortalService } from '../../services/driverPortalService';
import { useDriverGpsBroadcaster } from '../../hooks/useDriverGpsBroadcaster';
import type { DeliveryAssignment, DriverRouteData, RouteStepItem, RouteWaypointItem } from '../../types/driverPortal';

export default function DriverRoute() {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);
  const polylineGroupRef = useRef<L.LayerGroup | null>(null);

  const [delivery, setDelivery] = useState<DeliveryAssignment | null>(null);
  const [routeData, setRouteData] = useState<DriverRouteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isGpsActive = Boolean(
    delivery &&
    (delivery.status === 'IN_TRANSIT' || delivery.status === 'OUT_FOR_DELIVERY')
  );

  const handleBroadcastSuccess = useCallback((updated: DeliveryAssignment) => {
    setDelivery(updated);
  }, []);

  // Background real GPS broadcaster for active delivery
  const gps = useDriverGpsBroadcaster(delivery, {
    enabled: isGpsActive,
    intervalMs: 15000,
    onBroadcastSuccess: handleBroadcastSuccess,
  });

  const fetchRouteAndDelivery = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    setErrorMsg(null);
    try {
      const [delData, rData] = await Promise.all([
        driverPortalService.getCurrentDelivery(),
        driverPortalService.getDeliveryRoute('active'),
      ]);

      const isActive = Boolean(
        delData && (delData.status === 'IN_TRANSIT' || delData.status === 'OUT_FOR_DELIVERY')
      );
      setDelivery(delData);
      if (!isActive) {
        setRouteData(null);
      } else {
        setRouteData(rData);
      }
    } catch (err: any) {
      console.error('Error fetching driver route context:', err);
      setErrorMsg('Failed to load active delivery route telemetry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRouteAndDelivery();
  }, []);

  // Recalculate route when GPS changes significantly (> 100 meters)
  const prevCoordsRef = useRef<[number, number] | null>(null);
  useEffect(() => {
    if (!gps.latitude || !gps.longitude || !delivery || !isGpsActive) return;

    const prev = prevCoordsRef.current;
    if (prev) {
      const distMoved = Math.sqrt(
        Math.pow(gps.latitude - prev[0], 2) + Math.pow(gps.longitude - prev[1], 2)
      );
      // Only re-fetch if moved more than approx 100 meters
      if (distMoved < 0.001) return;
    }

    prevCoordsRef.current = [gps.latitude, gps.longitude];
    driverPortalService.getDeliveryRoute(delivery.id).then((r) => {
      if (r && isGpsActive) setRouteData(r);
    }).catch(console.warn);
  }, [gps.latitude, gps.longitude, delivery?.id, isGpsActive]);

  // Derived coordinates (Only valid when active delivery exists)
  const originCoords: [number, number] | null = (isGpsActive && routeData?.origin.latitude && routeData.origin.longitude)
    ? [routeData.origin.latitude, routeData.origin.longitude]
    : (isGpsActive && delivery?.pickupHub?.coordinates)
    ? delivery.pickupHub.coordinates
    : null;

  const destCoords: [number, number] | null = (isGpsActive && routeData?.destination.latitude && routeData.destination.longitude)
    ? [routeData.destination.latitude, routeData.destination.longitude]
    : (isGpsActive && delivery?.destination?.coordinates)
    ? delivery.destination.coordinates
    : null;

  const currentLat = gps.latitude ?? (isGpsActive ? routeData?.currentLocation.latitude : null) ?? delivery?.currentLatitude ?? originCoords?.[0] ?? 12.9716;
  const currentLng = gps.longitude ?? (isGpsActive ? routeData?.currentLocation.longitude : null) ?? delivery?.currentLongitude ?? originCoords?.[1] ?? 77.5946;
  const currentCoords: [number, number] = [currentLat, currentLng];

  // Leaflet Map Initialization & Rendering
  useEffect(() => {
    if (loading || !mapContainerRef.current) return;

    // 1. Initialize Map
    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: currentCoords,
        zoom: 12,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      leafletMapRef.current = map;
      polylineGroupRef.current = L.layerGroup().addTo(map);
      markerGroupRef.current = L.layerGroup().addTo(map);
    }

    const map = leafletMapRef.current;
    const markerGroup = markerGroupRef.current;
    const polylineGroup = polylineGroupRef.current;
    if (!map || !markerGroup || !polylineGroup) return;

    markerGroup.clearLayers();
    polylineGroup.clearLayers();

    const boundsPoints: [number, number][] = [];

    // Helper for custom styled markers
    const createCustomIcon = (bgColor: string, symbol: string, isPulsing = false) => {
      return L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            ${isPulsing ? `<div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background-color: ${bgColor}; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
            <div style="
              position: relative;
              width: 38px;
              height: 38px;
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
              ${symbol}
            </div>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
        popupAnchor: [0, -20],
      });
    };

    // 1. Origin Marker
    if (originCoords) {
      boundsPoints.push(originCoords);
      const originMarker = L.marker(originCoords, { icon: createCustomIcon('#059669', '🏢') }).addTo(markerGroup);
      originMarker.bindPopup(`
        <div style="padding: 4px; font-family: inherit;">
          <div style="font-weight: 800; color: #059669; font-size: 13px;">ORIGIN WAREHOUSE</div>
          <div style="font-weight: 700; color: #0f172a; margin-top: 2px;">${routeData?.origin.facilityName || delivery?.pickupLocation.facilityName || 'Dispatch Hub'}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${routeData?.origin.address || delivery?.pickupLocation.address || ''}</div>
        </div>
      `);
    }

    // 2. Destination Marker
    if (destCoords) {
      boundsPoints.push(destCoords);
      const destMarker = L.marker(destCoords, { icon: createCustomIcon('#dc2626', '📍') }).addTo(markerGroup);
      destMarker.bindPopup(`
        <div style="padding: 4px; font-family: inherit;">
          <div style="font-weight: 800; color: #dc2626; font-size: 13px;">DESTINATION RECIPIENT</div>
          <div style="font-weight: 700; color: #0f172a; margin-top: 2px;">${routeData?.destination.customerName || delivery?.recipientName || 'Customer'}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${routeData?.destination.address || delivery?.deliveryLocation.address || ''}, ${routeData?.destination.city || ''}</div>
        </div>
      `);
    }

    // 3. Current Live Driver Marker
    boundsPoints.push(currentCoords);
    const isLiveSignal = gps.isWatching || (routeData?.freshness === 'LIVE');
    const driverMarker = L.marker(currentCoords, { icon: createCustomIcon('#2563eb', '🚚', isLiveSignal) }).addTo(markerGroup);
    driverMarker.bindPopup(`
      <div style="padding: 4px; font-family: inherit;">
        <div style="font-weight: 800; color: #2563eb; font-size: 13px;">CURRENT DRIVER POSITION</div>
        <div style="font-weight: 700; color: #0f172a; margin-top: 2px;">${routeData?.currentLocation.facilityName || 'Live Vehicle Position'}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${currentLat.toFixed(5)}° N, ${currentLng.toFixed(5)}° E</div>
        <div style="font-size: 11px; color: #16a34a; font-weight: 700; margin-top: 4px;">Signal: ${routeData?.freshness || 'LIVE'}</div>
      </div>
    `);

    // 4. Draw Road Geometry Polylines
    // Full Route (Base Corridor Glow)
    if (routeData?.fullRouteGeometry && routeData.fullRouteGeometry.length > 1) {
      const fullGeo = routeData.fullRouteGeometry as [number, number][];
      L.polyline(fullGeo, {
        color: '#94a3b8',
        weight: 6,
        opacity: 0.5,
        dashArray: '8, 8',
      }).addTo(polylineGroup);
    }

    // Active Remaining Road Route (Vibrant Blue Highway Line)
    if (routeData?.routeGeometry && routeData.routeGeometry.length > 1) {
      const activeGeo = routeData.routeGeometry as [number, number][];
      // Outer glow
      L.polyline(activeGeo, {
        color: '#3b82f6',
        weight: 8,
        opacity: 0.35,
      }).addTo(polylineGroup);

      // Inner sharp route line
      L.polyline(activeGeo, {
        color: '#1d4ed8',
        weight: 5,
        opacity: 0.95,
      }).addTo(polylineGroup);

      activeGeo.forEach((pt) => boundsPoints.push(pt));
    } else if (originCoords && destCoords) {
      // Fallback straight corridor if geometry not yet calculated
      L.polyline([originCoords, currentCoords, destCoords], {
        color: '#2563eb',
        weight: 4,
        opacity: 0.8,
      }).addTo(polylineGroup);
    }

    // Fit map bounds if valid points exist
    if (boundsPoints.length > 1) {
      map.fitBounds(L.latLngBounds(boundsPoints), { padding: [50, 50], maxZoom: 15 });
    } else {
      map.setView(currentCoords, 13);
    }
  }, [loading, routeData, currentLat, currentLng, originCoords, destCoords]);

  // Map Controls
  const handleRecenter = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo(currentCoords, 15, { animate: true, duration: 1 });
    }
  };

  const handleFitRoute = () => {
    if (!leafletMapRef.current) return;
    const points: [number, number][] = [currentCoords];
    if (originCoords) points.push(originCoords);
    if (destCoords) points.push(destCoords);
    if (routeData?.routeGeometry) {
      routeData.routeGeometry.forEach(pt => points.push(pt));
    }
    if (points.length > 1) {
      leafletMapRef.current.fitBounds(L.latLngBounds(points), { padding: [50, 50], maxZoom: 15 });
    }
  };

  const handleOpenGoogleMaps = () => {
    if (destCoords) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&origin=${currentLat},${currentLng}&destination=${destCoords[0]},${destCoords[1]}&travelmode=driving`,
        '_blank'
      );
    } else if (delivery) {
      const dest = encodeURIComponent(`${delivery.deliveryLocation.address}, ${delivery.deliveryLocation.city}`);
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`, '_blank');
    }
  };

  const getStepIcon = (iconType?: string) => {
    switch (iconType) {
      case 'TURN_RIGHT': return <CornerUpRight size={18} />;
      case 'TURN_LEFT': return <CornerUpLeft size={18} />;
      case 'FORK': return <Compass size={18} />;
      case 'ARRIVE': return <CheckCircle2 size={18} />;
      case 'DEPART': return <Truck size={18} />;
      default: return <ArrowUp size={18} />;
    }
  };

  if (loading) {
    return (
      <div className="driver-page-container" style={{ alignItems: 'center', justifyContent: 'center', minHeight: 350 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <RotateCw className="animate-spin" size={32} style={{ color: '#2563eb' }} />
          <div style={{ color: '#0f172a', fontWeight: 700, fontSize: 16 }}>Calculating Dynamic Road Route & Telemetry...</div>
          <div style={{ color: '#64748b', fontSize: 13 }}>Connecting to satellite GPS and routing engine</div>
        </div>
      </div>
    );
  }

  // Empty State: Authenticated driver has no active delivery assigned
  if (!delivery) {
    return (
      <div className="driver-page-container">
        <div className="driver-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Compass size={32} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
            No Active Delivery Assigned
          </h2>
          <p style={{ color: '#64748b', fontSize: 14, maxWidth: 460, margin: '0 auto 24px', lineHeight: 1.5 }}>
            You currently have no dispatch or in-transit shipments assigned to your driver roster. Check your assigned deliveries or return to dashboard.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/driver/deliveries" className="driver-btn-primary" style={{ padding: '10px 20px' }}>
              <Package size={16} /> View Deliveries
            </Link>
            <Link to="/driver/live-location" className="driver-btn-secondary" style={{ padding: '10px 20px' }}>
              <MapPin size={16} /> Live Location
            </Link>
            <Link to="/driver/dashboard" className="driver-btn-secondary" style={{ padding: '10px 20px' }}>
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Delivery Completed State: Active route is completed
  if (delivery.status === 'DELIVERED') {
    return (
      <div className="driver-page-container">
        <div className="driver-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: '#f0fdf4',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <CheckCircle2 size={32} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
            Delivery Completed & Closed
          </h2>
          <p style={{ color: '#64748b', fontSize: 14, maxWidth: 480, margin: '0 auto 24px', lineHeight: 1.5 }}>
            Consignment #{delivery.trackingNumber} has been successfully delivered and verified with electronic proof of delivery. Active corridor navigation is now closed.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/driver/deliveries" className="driver-btn-primary" style={{ padding: '10px 20px' }}>
              <Package size={16} /> View All Deliveries
            </Link>
            <Link to="/driver/live-location" className="driver-btn-secondary" style={{ padding: '10px 20px' }}>
              <MapPin size={16} /> Live Location Telemetry
            </Link>
            <Link to="/driver/dashboard" className="driver-btn-secondary" style={{ padding: '10px 20px' }}>
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const distanceRemaining = routeData?.distanceRemainingKm ?? delivery?.distanceKm ?? 0;
  const totalDist = routeData?.totalDistanceKm ?? delivery?.distanceKm ?? distanceRemaining;
  const etaMins = routeData?.estimatedDurationMinutes ?? delivery?.estimatedDurationMins ?? 0;
  const etaHours = Math.floor(etaMins / 60);
  const etaRemainingMins = etaMins % 60;
  const etaDisplay = etaHours > 0 ? `${etaHours}h ${etaRemainingMins}m` : `${etaRemainingMins} mins`;

  const freshness = routeData?.freshness || (gps.isWatching ? 'LIVE' : 'LAST_RECORDED');
  const isDelivered = (delivery?.status as string) === 'DELIVERED';
  const isOutForDelivery = delivery?.status === 'OUT_FOR_DELIVERY';

  return (
    <div className="driver-page-container">
      {/* ── Real-Time GPS Telemetry Broadcasting Pill ── */}
      {isGpsActive && (
        <div
          style={{
            marginBottom: 16,
            padding: '10px 16px',
            borderRadius: 10,
            backgroundColor: gps.isWatching ? '#eff6ff' : '#f8fafc',
            border: `1px solid ${gps.isWatching ? '#bfdbfe' : '#e2e8f0'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 12.5,
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: gps.isWatching ? '#22c55e' : '#94a3b8',
              }}
              className={gps.isWatching ? 'animate-pulse' : ''}
            />
            <strong style={{ color: '#1d4ed8' }}>Live Satellite Telemetry Stream Active</strong>
            <span style={{ color: '#64748b', fontFamily: 'monospace' }}>
              ({currentLat.toFixed(5)}° N, {currentLng.toFixed(5)}° E)
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: '#64748b' }}>
              {gps.lastBroadcastTime ? `Last synced: ${gps.lastBroadcastTime.toLocaleTimeString()}` : 'Connecting telemetry...'}
            </span>
            <Link to="/driver/live-location" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'underline' }}>
              View Telemetry Map
            </Link>
          </div>
        </div>
      )}

      {/* ── Route Header Banner ── */}
      <div className="driver-card" style={{ marginBottom: 16 }}>
        <div className="driver-card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <span className={`driver-badge ${isDelivered ? 'driver-badge-green' : isOutForDelivery ? 'driver-badge-blue' : 'driver-badge-amber'}`}>
                {delivery?.status?.replace(/_/g, ' ') || 'IN TRANSIT'}
              </span>
              <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                {routeData?.routeCode || `RT-${delivery?.trackingNumber || 'ACTIVE'}`}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 6,
                  backgroundColor: freshness === 'LIVE' ? '#dcfce7' : freshness === 'RECENT' ? '#fef3c7' : '#f1f5f9',
                  color: freshness === 'LIVE' ? '#166534' : freshness === 'RECENT' ? '#92400e' : '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Radio size={12} className={freshness === 'LIVE' ? 'animate-pulse' : ''} />
                {freshness}
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
              Turn-by-Turn Corridor Navigation
            </h2>
            <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>
              Tracking Number: <strong>{delivery?.trackingNumber || routeData?.trackingNumber}</strong> &bull; Origin: {routeData?.origin.city || delivery?.pickupLocation.city} &bull; Destination: {routeData?.destination.city || delivery?.deliveryLocation.city}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => fetchRouteAndDelivery(true)}
              disabled={refreshing}
              className="driver-btn-secondary"
              style={{ padding: '8px 14px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
              title="Refresh road route and distance calculations"
            >
              <RotateCw size={14} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh Route'}
            </button>
            <Link
              to="/driver/current-delivery"
              className="driver-btn-secondary"
              style={{ padding: '8px 14px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Package size={14} /> Consignment Details
            </Link>
            <button
              onClick={handleOpenGoogleMaps}
              className="driver-btn-primary"
              style={{ padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <ExternalLink size={14} /> Launch GPS Navigation
            </button>
          </div>
        </div>

        {/* Route Metric Highlights */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 12,
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 10,
            padding: 16,
            marginTop: 8,
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>Distance Remaining</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
              {distanceRemaining.toFixed(1)} <span style={{ fontSize: 13, fontWeight: 600 }}>KM</span>
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
              Total: {totalDist.toFixed(1)} km
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>Estimated Drive Time</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#2563eb', marginTop: 2 }}>
              {etaDisplay}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
              Avg speed: 42 km/h
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>Estimated Arrival (ETA)</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
              {routeData?.estimatedDeliveryTime || delivery?.deliveryEta || 'Pending'}
            </div>
            <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 600, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22c55e' }} />
              Active Route Calculated
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>Current Position</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 6, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {routeData?.currentLocation.facilityName || 'En route'}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
              {currentLat.toFixed(4)}° N, {currentLng.toFixed(4)}° E
            </div>
          </div>
        </div>
      </div>

      {/* ── Interactive Leaflet Road Route Map ── */}
      <div className="driver-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20, position: 'relative' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Map size={18} style={{ color: '#2563eb' }} />
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
              Live Road Navigation & Highway Corridor Map
            </h3>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleRecenter}
              className="driver-btn-secondary"
              style={{ padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
              title="Center map on driver GPS location"
            >
              <Crosshair size={13} /> Recenter Driver
            </button>
            <button
              onClick={handleFitRoute}
              className="driver-btn-secondary"
              style={{ padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
              title="Fit map to full corridor route"
            >
              <Maximize2 size={13} /> Fit Full Route
            </button>
          </div>
        </div>

        {/* Map Container */}
        <div
          ref={mapContainerRef}
          style={{
            height: 420,
            width: '100%',
            backgroundColor: '#e2e8f0',
            position: 'relative',
            zIndex: 1,
          }}
        />

        {/* Map Floating Legend */}
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            zIndex: 10,
            backgroundColor: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(6px)',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: '8px 12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            fontSize: 11.5,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#0f172a', fontWeight: 600 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#059669' }} /> Origin Hub: {routeData?.origin.facilityName || 'Warehouse'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#0f172a', fontWeight: 600 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#2563eb' }} /> Live Driver: {currentLat.toFixed(4)}°, {currentLng.toFixed(4)}°
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#0f172a', fontWeight: 600 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#dc2626' }} /> Destination: {routeData?.destination.city || 'Customer'}
          </div>
        </div>
      </div>

      {/* ── Two-Column Layout: Dynamic Waypoints Timeline & Turn-by-Turn Road Instructions ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Dynamic Waypoints Sequence */}
        <div className="driver-card">
          <h3 className="driver-card-title">
            <MapPin size={18} style={{ color: '#2563eb' }} />
            Route Waypoints & Operational Checkpoints
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16, position: 'relative' }}>
            {routeData?.waypoints && routeData.waypoints.length > 0 ? (
              routeData.waypoints.map((wp, idx) => {
                const isCompleted = wp.status === 'COMPLETED';
                const isNext = wp.status === 'NEXT';

                return (
                  <div key={wp.id || idx} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        backgroundColor: isCompleted ? '#16a34a' : isNext ? '#2563eb' : '#e2e8f0',
                        color: isCompleted || isNext ? '#ffffff' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 12,
                        flexShrink: 0,
                        boxShadow: isNext ? '0 0 0 4px #dbeafe' : 'none',
                      }}
                    >
                      {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: isNext ? '#2563eb' : '#0f172a' }}>
                          {wp.name}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>
                          {wp.distanceKm != null ? `${wp.distanceKm.toFixed(1)} km` : ''} &bull; {wp.estimatedTime}
                        </span>
                      </div>

                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                        {wp.address}
                      </div>

                      {wp.instructions && (
                        <div
                          style={{
                            fontSize: 11.5,
                            color: isNext ? '#1e3a8a' : '#475569',
                            backgroundColor: isNext ? '#eff6ff' : '#f8fafc',
                            padding: '4px 8px',
                            borderRadius: 4,
                            marginTop: 6,
                            display: 'inline-block',
                          }}
                        >
                          {wp.instructions}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ color: '#64748b', fontSize: 13 }}>
                Loading road waypoints...
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Turn-by-Turn Road Maneuver Instructions */}
        <div className="driver-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="driver-card-title" style={{ margin: 0 }}>
              <Compass size={18} style={{ color: '#2563eb' }} />
              Turn-by-Turn Road Maneuvers
            </h3>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
              {routeData?.routeSteps?.length || 0} maneuvers
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16, maxHeight: 360, overflowY: 'auto' }}>
            {routeData?.routeSteps && routeData.routeSteps.length > 0 ? (
              routeData.routeSteps.map((step, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    backgroundColor: idx === 0 ? '#eff6ff' : '#f8fafc',
                    border: idx === 0 ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                    borderRadius: 8,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      backgroundColor: idx === 0 ? '#2563eb' : '#e2e8f0',
                      color: idx === 0 ? '#ffffff' : '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {getStepIcon(step.iconType)}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: idx === 0 ? 700 : 500, color: '#0f172a' }}>
                      {step.instruction}
                    </div>
                  </div>

                  <div style={{ fontSize: 12, fontWeight: 700, color: idx === 0 ? '#2563eb' : '#64748b', flexShrink: 0 }}>
                    {step.distanceKm != null ? `${step.distanceKm} km` : ''}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: '#64748b', fontSize: 13, padding: '16px 0' }}>
                Calculating road maneuver sequence...
              </div>
            )}
          </div>

          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <button
              onClick={handleOpenGoogleMaps}
              className="driver-btn-primary"
              style={{ width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Navigation size={16} /> Open Turn-by-Turn in Google Maps Navigation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
