import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Route } from '../../types/route';
import {
  Navigation,
  Layers,
  MapPin,
  Truck,
  User,
  Activity,
  Maximize2,
  Minimize2,
  Clock,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  X
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

interface InteractiveRouteMapProps {
  routes: Route[];
  selectedRoute: Route | null;
  onSelectRoute?: (route: Route) => void;
  onViewDetails?: (route: Route) => void;
  height?: number | string;
  hideOverlay?: boolean;
}

export default function InteractiveRouteMap({
  routes,
  selectedRoute,
  onSelectRoute,
  onViewDetails,
  height = 480,
  hideOverlay = false,
}: InteractiveRouteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const googleMapRef = useRef<any>(null);

  const [mapEngine, setMapEngine] = useState<'google' | 'leaflet'>('leaflet');
  const [mapFilter, setMapFilter] = useState<'ALL' | 'ACTIVE'>('ALL');
  const [showSidePanel, setShowSidePanel] = useState(true);

  const googleApiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();

  // Filter routes based on top-right map filter toggle
  const displayRoutes = routes.filter((r) => {
    if (mapFilter === 'ACTIVE') return r.status === 'ACTIVE';
    return true;
  });

  // Filter routes that have valid coordinates
  const validRoutes = displayRoutes.filter(
    (r) =>
      r.originLatitude != null &&
      r.originLongitude != null &&
      r.destinationLatitude != null &&
      r.destinationLongitude != null
  );

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (googleApiKey) {
      initGoogleMap();
    } else {
      initLeafletMap();
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [routes, selectedRoute, mapFilter, googleApiKey]);

  // ----------------------------------------------------
  // LEAFLET / OPENSTREETMAP INITIALIZATION
  // ----------------------------------------------------
  const initLeafletMap = () => {
    if (!mapContainerRef.current) return;

    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    try {
      const defaultCenter: L.LatLngExpression = [21.0, 78.0];
      const defaultZoom = 5;

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView(defaultCenter, defaultZoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const allPoints: L.LatLngExpression[] = [];

      validRoutes.forEach((route) => {
        const isSelected = selectedRoute?.id === route.id;
        const origLat = route.originLatitude!;
        const origLng = route.originLongitude!;
        const destLat = route.destinationLatitude!;
        const destLng = route.destinationLongitude!;

        allPoints.push([origLat, origLng], [destLat, destLng]);

        // Origin Marker (Emerald Pill)
        const originIcon = L.divIcon({
          className: 'custom-route-marker',
          html: `
            <div style="
              display: flex;
              align-items: center;
              gap: 5px;
              background: ${isSelected ? '#059669' : '#ffffff'};
              color: ${isSelected ? '#ffffff' : '#065f46'};
              padding: 4px 8px;
              border-radius: 9999px;
              border: 2px solid #059669;
              box-shadow: 0 4px 8px rgba(0,0,0,0.18);
              font-size: 11px;
              font-weight: 700;
              white-space: nowrap;
              cursor: pointer;
            ">
              <span style="width: 7px; height: 7px; border-radius: 50%; background: ${isSelected ? '#ffffff' : '#059669'}; display: inline-block;"></span>
              ${route.origin}
            </div>
          `,
          iconSize: [120, 28],
          iconAnchor: [60, 14],
        });

        // Destination Marker (Blue Pill)
        const destIcon = L.divIcon({
          className: 'custom-route-marker',
          html: `
            <div style="
              display: flex;
              align-items: center;
              gap: 5px;
              background: ${isSelected ? '#2563eb' : '#ffffff'};
              color: ${isSelected ? '#ffffff' : '#1e40af'};
              padding: 4px 8px;
              border-radius: 9999px;
              border: 2px solid #2563eb;
              box-shadow: 0 4px 8px rgba(0,0,0,0.18);
              font-size: 11px;
              font-weight: 700;
              white-space: nowrap;
              cursor: pointer;
            ">
              <span style="width: 7px; height: 7px; border-radius: 50%; background: ${isSelected ? '#ffffff' : '#2563eb'}; display: inline-block;"></span>
              ${route.destination}
            </div>
          `,
          iconSize: [120, 28],
          iconAnchor: [60, 14],
        });

        const popupContent = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; padding: 4px; min-width: 200px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-weight: 800; color: #0f172a; font-size: 13px;">${route.routeCode}</span>
              <span style="background: ${route.status === 'ACTIVE' ? '#dcfce7' : '#f1f5f9'}; color: ${route.status === 'ACTIVE' ? '#166534' : '#475569'}; padding: 2px 7px; border-radius: 9999px; font-weight: 700; font-size: 10px;">
                ${route.status}
              </span>
            </div>
            <div style="color: #334155; margin-bottom: 2px;"><strong>From:</strong> ${route.origin}</div>
            <div style="color: #334155; margin-bottom: 6px;"><strong>To:</strong> ${route.destination}</div>
            <div style="border-top: 1px solid #e2e8f0; padding-top: 6px; margin-top: 4px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px; color: #475569;">
              <div><strong>Dist:</strong> ${route.distanceKm} km</div>
              <div><strong>Transit:</strong> ~${route.estimatedTransitTimeHours}h</div>
              <div><strong>Driver:</strong> ${route.driverName || 'Unassigned'}</div>
              <div><strong>Vehicle:</strong> ${route.vehicleNumber || 'Unassigned'}</div>
            </div>
            ${
              Number(route.activeLoads) > 0
                ? `<div style="margin-top: 6px; background: #eff6ff; padding: 4px 8px; border-radius: 6px; color: #1d4ed8; font-weight: 700; font-size: 11px; display: flex; align-items: center; gap: 4px;">
                    🚚 ${route.activeLoads} Active Load${route.activeLoads > 1 ? 's' : ''} in Transit
                  </div>`
                : ''
            }
          </div>
        `;

        const origMarker = L.marker([origLat, origLng], { icon: originIcon }).addTo(map);
        origMarker.bindPopup(popupContent);
        origMarker.on('click', () => {
          onSelectRoute?.(route);
          setShowSidePanel(true);
        });

        const destMarker = L.marker([destLat, destLng], { icon: destIcon }).addTo(map);
        destMarker.bindPopup(popupContent);
        destMarker.on('click', () => {
          onSelectRoute?.(route);
          setShowSidePanel(true);
        });

        // ── LIVE SHIPMENT MARKER (when coordinates exist) ──
        if (
          route.currentShipmentLatitude != null &&
          route.currentShipmentLongitude != null
        ) {
          const shipLat = route.currentShipmentLatitude;
          const shipLng = route.currentShipmentLongitude;
          allPoints.push([shipLat, shipLng]);

          const shipmentIcon = L.divIcon({
            className: 'custom-shipment-marker',
            html: `
              <div style="
                display: flex;
                align-items: center;
                gap: 5px;
                background: #4f46e5;
                color: #ffffff;
                padding: 4px 9px;
                border-radius: 9999px;
                box-shadow: 0 4px 10px rgba(79, 70, 229, 0.45);
                font-size: 11px;
                font-weight: 800;
                white-space: nowrap;
                cursor: pointer;
                border: 2px solid #ffffff;
              ">
                🚚 ${route.currentShipmentTrackingNumber || 'In Transit'}
              </div>
            `,
            iconSize: [130, 28],
            iconAnchor: [65, 14],
          });

          const shipMarker = L.marker([shipLat, shipLng], { icon: shipmentIcon }).addTo(map);
          shipMarker.bindPopup(`
            <div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
              <strong style="color: #4f46e5;">🚚 Live Shipment Telemetry</strong><br/>
              <strong>Tracking:</strong> ${route.currentShipmentTrackingNumber}<br/>
              <strong>Location:</strong> ${route.currentShipmentLocation || 'En Route'}<br/>
              <strong>Corridor:</strong> ${route.routeCode}
            </div>
          `);
          shipMarker.on('click', () => {
            onSelectRoute?.(route);
            setShowSidePanel(true);
          });
        }

        // Corridor Polyline
        const lineColor = isSelected
          ? '#2563eb'
          : route.status === 'ACTIVE'
          ? '#059669'
          : '#94a3b8';
        const lineWeight = isSelected ? 5 : 3.5;
        const lineOpacity = isSelected ? 0.95 : 0.65;
        const dashArray = route.status === 'INACTIVE' ? '6, 6' : undefined;

        const polyline = L.polyline(
          [
            [origLat, origLng],
            [destLat, destLng],
          ],
          {
            color: lineColor,
            weight: lineWeight,
            opacity: lineOpacity,
            dashArray,
          }
        ).addTo(map);

        polyline.bindPopup(popupContent);
        polyline.on('click', () => {
          onSelectRoute?.(route);
          setShowSidePanel(true);
        });
      });

      // Fit bounds
      if (selectedRoute && selectedRoute.originLatitude && selectedRoute.destinationLatitude) {
        const pointsToFit: L.LatLngExpression[] = [
          [selectedRoute.originLatitude, selectedRoute.originLongitude!],
          [selectedRoute.destinationLatitude, selectedRoute.destinationLongitude!],
        ];
        if (
          selectedRoute.currentShipmentLatitude != null &&
          selectedRoute.currentShipmentLongitude != null
        ) {
          pointsToFit.push([
            selectedRoute.currentShipmentLatitude,
            selectedRoute.currentShipmentLongitude,
          ]);
        }
        const selBounds = L.latLngBounds(pointsToFit);
        map.fitBounds(selBounds, { padding: [70, 70], maxZoom: 12 });
      } else if (allPoints.length > 0) {
        const bounds = L.latLngBounds(allPoints);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
      }

      setTimeout(() => {
        map.invalidateSize();
      }, 250);

      leafletMapRef.current = map;
      setMapEngine('leaflet');
    } catch (err) {
      console.error('Failed to initialize Leaflet routes map:', err);
    }
  };

  // ----------------------------------------------------
  // GOOGLE MAPS INITIALIZATION
  // ----------------------------------------------------
  const initGoogleMap = () => {
    if (!googleApiKey) {
      initLeafletMap();
      return;
    }

    if ((window as any).google && (window as any).google.maps) {
      renderGoogleMap();
      return;
    }

    const scriptId = 'google-maps-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => renderGoogleMap();
      script.onerror = () => {
        console.warn('Google Maps API failed to load, falling back to OpenStreetMap.');
        initLeafletMap();
      };
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', () => renderGoogleMap());
    }
  };

  const renderGoogleMap = () => {
    const google = (window as any).google;
    if (!google || !google.maps || !mapContainerRef.current) return;

    try {
      const map = new google.maps.Map(mapContainerRef.current, {
        zoom: 5,
        center: { lat: 21.0, lng: 78.0 },
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      });

      const bounds = new google.maps.LatLngBounds();

      validRoutes.forEach((route) => {
        const isSelected = selectedRoute?.id === route.id;
        const orig = { lat: route.originLatitude!, lng: route.originLongitude! };
        const dest = { lat: route.destinationLatitude!, lng: route.destinationLongitude! };

        bounds.extend(orig);
        bounds.extend(dest);

        // Origin Marker
        new google.maps.Marker({
          position: orig,
          map,
          title: `Origin: ${route.origin} (${route.routeCode})`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: isSelected ? 9 : 7,
            fillColor: '#059669',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });

        // Destination Marker
        new google.maps.Marker({
          position: dest,
          map,
          title: `Destination: ${route.destination} (${route.routeCode})`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: isSelected ? 9 : 7,
            fillColor: '#2563eb',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });

        // Current Shipment Marker (if telemetry exists)
        if (
          route.currentShipmentLatitude != null &&
          route.currentShipmentLongitude != null
        ) {
          const shipPos = {
            lat: route.currentShipmentLatitude,
            lng: route.currentShipmentLongitude,
          };
          bounds.extend(shipPos);
          new google.maps.Marker({
            position: shipPos,
            map,
            title: `Shipment: ${route.currentShipmentTrackingNumber} (${route.currentShipmentLocation || 'In Transit'})`,
            label: {
              text: '🚚',
              fontSize: '16px',
            },
          });
        }

        // Polyline
        const poly = new google.maps.Polyline({
          path: [orig, dest],
          geodesic: true,
          strokeColor: isSelected ? '#2563eb' : route.status === 'ACTIVE' ? '#059669' : '#94a3b8',
          strokeOpacity: isSelected ? 0.95 : 0.65,
          strokeWeight: isSelected ? 5 : 3.5,
        });
        poly.setMap(map);

        google.maps.event.addListener(poly, 'click', () => {
          onSelectRoute?.(route);
          setShowSidePanel(true);
        });
      });

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds);
      }
      googleMapRef.current = map;
      setMapEngine('google');
    } catch (err) {
      console.error('Google Maps render error:', err);
      initLeafletMap();
    }
  };

  const hasTrackingCoords = routes.some(
    (r) => r.currentShipmentLatitude != null && r.currentShipmentLongitude != null
  );

  return (
    <div className="routes-map-card">
      {/* ── 3. MAP HEADER BAR ── */}
      <div className="routes-map-card-header">
        <div className="routes-map-card-title-group">
          <div className="routes-map-card-title">
            <Navigation size={17} style={{ color: 'var(--primary)' }} />
            <span>LIVE NETWORK MAP</span>
            <span className="routes-pulsing-dot" style={{ display: 'inline-block', marginLeft: 4 }}></span>
          </div>
          <span style={{ color: 'var(--border-dark)', fontSize: 13, margin: '0 4px' }}>|</span>
          <div className="routes-map-card-subtitle">
            Real-time freight corridors and route activity
          </div>
        </div>

        {/* Right side toggle: [All Routes] [Active Only] */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="routes-map-toggle-group">
            <button
              onClick={() => setMapFilter('ALL')}
              className={`routes-map-toggle-btn ${mapFilter === 'ALL' ? 'active' : ''}`}
            >
              All Routes ({routes.length})
            </button>
            <button
              onClick={() => setMapFilter('ACTIVE')}
              className={`routes-map-toggle-btn ${mapFilter === 'ACTIVE' ? 'active' : ''}`}
            >
              Active Only ({routes.filter((r) => r.status === 'ACTIVE').length})
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 10px',
              borderRadius: 8,
              background: '#f8fafc',
              border: '1px solid var(--border)',
              fontSize: 11,
              fontWeight: 600,
              color: '#64748b'
            }}
          >
            <Layers size={13} />
            <span>{mapEngine === 'google' ? 'Google Maps' : 'OpenStreetMap'}</span>
          </div>
        </div>
      </div>

      {/* ── MAP CANVAS & OVERLAYS ── */}
      <div className="routes-map-canvas-wrap" style={{ height: typeof height === 'number' ? `${height}px` : height }}>
        {/* The Leaflet map DOM element */}
        <div
          ref={mapContainerRef}
          style={{ width: '100%', height: '100%', zIndex: 1 }}
        />

        {/* ── 4. MAP OVERLAY (SELECTED ROUTE FLOATING PANEL) ── */}
        {selectedRoute && showSidePanel && !hideOverlay && (
          <div className="routes-map-floating-overlay">
            {/* Header */}
            <div className="routes-map-overlay-header">
              <div>
                <div className="routes-map-overlay-eyebrow">SELECTED ROUTE</div>
                <div className="routes-map-overlay-code">{selectedRoute.routeCode}</div>
                <div className="routes-map-overlay-hubs">
                  {selectedRoute.origin} → {selectedRoute.destination}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <StatusBadge status={selectedRoute.status} />
                <button
                  onClick={() => setShowSidePanel(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: 2,
                    display: 'flex'
                  }}
                  title="Minimize panel"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Metrics */}
            <div className="routes-map-overlay-grid">
              <div className="routes-map-overlay-stat">
                <div className="routes-map-overlay-stat-label">Distance</div>
                <div className="routes-map-overlay-stat-val">{selectedRoute.distanceKm} km</div>
              </div>
              <div className="routes-map-overlay-stat">
                <div className="routes-map-overlay-stat-label">Transit</div>
                <div className="routes-map-overlay-stat-val">~{selectedRoute.estimatedTransitTimeHours} hrs</div>
              </div>
              <div className="routes-map-overlay-stat" style={{ background: '#eff6ff', borderColor: '#dbeafe' }}>
                <div className="routes-map-overlay-stat-label" style={{ color: '#2563eb' }}>Active Loads</div>
                <div className="routes-map-overlay-stat-val" style={{ color: '#1d4ed8' }}>
                  {selectedRoute.activeLoads || 0}
                </div>
              </div>
            </div>

            {/* Dispatch details */}
            <div className="routes-map-overlay-dispatch">
              <div className="routes-map-overlay-row">
                <span className="routes-map-overlay-row-label">
                  <User size={13} /> Driver
                </span>
                <span className="routes-map-overlay-row-val">
                  {selectedRoute.driverName || <span style={{ color: '#94a3b8', fontWeight: 400 }}>Unassigned</span>}
                </span>
              </div>
              <div className="routes-map-overlay-row">
                <span className="routes-map-overlay-row-label">
                  <Truck size={13} /> Vehicle
                </span>
                <span className="routes-map-overlay-row-val">
                  {selectedRoute.vehicleNumber ? (
                    `${selectedRoute.vehicleNumber} (${selectedRoute.vehicleModel || selectedRoute.vehicleType || 'Truck'})`
                  ) : (
                    <span style={{ color: '#94a3b8', fontWeight: 400 }}>Unassigned</span>
                  )}
                </span>
              </div>
              <div className="routes-map-overlay-row">
                <span className="routes-map-overlay-row-label">
                  <Activity size={13} /> Active Loads
                </span>
                <span className="routes-map-overlay-row-val" style={{ color: '#2563eb', fontWeight: 700 }}>
                  {selectedRoute.activeLoads || 0}
                </span>
              </div>
            </div>

            {/* Live tracking banner if coordinates exist */}
            {selectedRoute.currentShipmentTrackingNumber && (
              <div
                style={{
                  padding: '8px 10px',
                  borderRadius: 8,
                  background: '#eef2ff',
                  border: '1px solid #c7d2fe',
                  fontSize: 11,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <span style={{ fontSize: 14 }}>🚚</span>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: 700, color: '#3730a3' }}>
                    {selectedRoute.currentShipmentTrackingNumber}
                  </div>
                  <div style={{ color: '#4f46e5', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {selectedRoute.currentShipmentLocation || 'In Transit'}
                  </div>
                </div>
              </div>
            )}

            {/* CTA Button */}
            <button
              onClick={() => onViewDetails?.(selectedRoute)}
              className="routes-map-overlay-btn"
            >
              <span>View Route Details & Shipments</span>
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* Button to reopen overlay if closed */}
        {selectedRoute && !showSidePanel && !hideOverlay && (
          <button
            onClick={() => setShowSidePanel(true)}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 500,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--primary)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer'
            }}
          >
            <Activity size={14} />
            <span>Show {selectedRoute.routeCode}</span>
          </button>
        )}

        {/* ── 5. MAP LEGEND ── */}
        <div className="routes-map-legend">
          <div className="routes-map-legend-item">
            <span className="routes-map-legend-dot-origin"></span>
            <span>Origin</span>
          </div>
          <div className="routes-map-legend-item">
            <span className="routes-map-legend-dot-dest"></span>
            <span>Destination</span>
          </div>
          <div className="routes-map-legend-item">
            <span className="routes-map-legend-line-active"></span>
            <span>Active Route</span>
          </div>
          {hasTrackingCoords && (
            <div className="routes-map-legend-item">
              <span className="routes-map-legend-dot-live"></span>
              <span>Current Location</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
