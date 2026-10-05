import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Truck, CheckCircle2, Navigation, Layers } from 'lucide-react';

export interface LocationPoint {
  name?: string;
  locationName?: string;
  addressText?: string;
  city?: string;
  state?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface InteractiveShipmentMapProps {
  pickup: LocationPoint;
  currentLocation: LocationPoint & { lastUpdatedAt?: string };
  delivery: LocationPoint;
  status: string;
  height?: number | string;
}

export default function InteractiveShipmentMap({
  pickup,
  currentLocation,
  delivery,
  status,
  height = 360,
}: InteractiveShipmentMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const googleMapRef = useRef<any>(null);

  const [mapEngine, setMapEngine] = useState<'google' | 'leaflet'>('leaflet');
  const [loadError, setLoadError] = useState<string | null>(null);

  // Check valid coordinates
  const pickupLat = pickup?.latitude ?? 20.2961;
  const pickupLng = pickup?.longitude ?? 85.8245;

  const deliveryLat = delivery?.latitude ?? 20.4625;
  const deliveryLng = delivery?.longitude ?? 85.8830;

  const currentLat = currentLocation?.latitude ?? (pickupLat + deliveryLat) / 2;
  const currentLng = currentLocation?.longitude ?? (pickupLng + deliveryLng) / 2;

  const googleApiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();

  // ----------------------------------------------------
  // Initialize Map
  // ----------------------------------------------------
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
  }, [pickupLat, pickupLng, deliveryLat, deliveryLng, currentLat, currentLng, status, googleApiKey]);

  // ----------------------------------------------------
  // LEAFLET / OPENSTREETMAP INITIALIZATION
  // ----------------------------------------------------
  const initLeafletMap = () => {
    if (!mapContainerRef.current) return;

    // Destroy existing instance
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    try {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Custom Pickup Marker Icon
      const pickupIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            display: flex;
            align-items: center;
            gap: 6px;
            background: #ffffff;
            color: #065f46;
            padding: 5px 10px;
            border-radius: 9999px;
            border: 2px solid #059669;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.15);
            font-size: 11px;
            font-weight: 700;
            white-space: nowrap;
          ">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #059669; display: inline-block;"></span>
            ${pickup?.city || 'Pickup'}
          </div>
        `,
        iconSize: [100, 30],
        iconAnchor: [50, 15],
      });

      // Custom Current Location Marker Icon
      const isDelivered = status === 'DELIVERED';
      const isPickedUp = status !== 'PENDING' && status !== 'CONFIRMED';

      const currentIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            display: flex;
            align-items: center;
            gap: 6px;
            background: #4f46e5;
            color: #ffffff;
            padding: 6px 12px;
            border-radius: 9999px;
            box-shadow: 0 4px 10px rgba(79, 70, 229, 0.4);
            font-size: 12px;
            font-weight: 700;
            white-space: nowrap;
          ">
            🚚 ${isDelivered ? 'Delivered' : isPickedUp ? 'In Transit' : 'At Origin'}
          </div>
        `,
        iconSize: [110, 32],
        iconAnchor: [55, 16],
      });

      // Custom Delivery Marker Icon
      const deliveryIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            display: flex;
            align-items: center;
            gap: 6px;
            background: #ffffff;
            color: #1e40af;
            padding: 5px 10px;
            border-radius: 9999px;
            border: 2px solid #2563eb;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.15);
            font-size: 11px;
            font-weight: 700;
            white-space: nowrap;
          ">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #2563eb; display: inline-block;"></span>
            ${delivery?.city || 'Destination'}
          </div>
        `,
        iconSize: [110, 30],
        iconAnchor: [55, 15],
      });

      // Add Markers
      const pMarker = L.marker([pickupLat, pickupLng], { icon: pickupIcon }).addTo(map);
      pMarker.bindPopup(`<b>Pickup Location</b><br/>${pickup.addressText || pickup.city}`);

      const dMarker = L.marker([deliveryLat, deliveryLng], { icon: deliveryIcon }).addTo(map);
      dMarker.bindPopup(`<b>Delivery Destination</b><br/>${delivery.addressText || delivery.city}`);

      if (!isDelivered) {
        const cMarker = L.marker([currentLat, currentLng], { icon: currentIcon }).addTo(map);
        cMarker.bindPopup(`<b>Current Telemetry</b><br/>${currentLocation.locationName || 'En Route'}`);
      }

      // Route Polyline
      const latLngs: L.LatLngExpression[] = [
        [pickupLat, pickupLng],
        [currentLat, currentLng],
        [deliveryLat, deliveryLng],
      ];

      L.polyline(latLngs, {
        color: '#3b82f6',
        weight: 4,
        opacity: 0.8,
        dashArray: '8, 8',
      }).addTo(map);

      // Fit Bounds
      const bounds = L.latLngBounds([
        [pickupLat, pickupLng],
        [currentLat, currentLng],
        [deliveryLat, deliveryLng],
      ]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });

      // Invalidate size after layout
      setTimeout(() => {
        map.invalidateSize();
      }, 200);

      leafletMapRef.current = map;
      setMapEngine('leaflet');
    } catch (err: any) {
      console.error('Failed to initialize Leaflet map:', err);
      setLoadError('Unable to load interactive map.');
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
      script.onload = () => {
        renderGoogleMap();
      };
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
        zoom: 7,
        center: { lat: currentLat, lng: currentLng },
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      });

      // Markers
      new google.maps.Marker({
        position: { lat: pickupLat, lng: pickupLng },
        map,
        title: `Pickup: ${pickup?.city || ''}`,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#059669',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

      new google.maps.Marker({
        position: { lat: deliveryLat, lng: deliveryLng },
        map,
        title: `Delivery: ${delivery?.city || ''}`,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#2563eb',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

      if (status !== 'DELIVERED') {
        new google.maps.Marker({
          position: { lat: currentLat, lng: currentLng },
          map,
          title: `Current: ${currentLocation?.locationName || 'In Transit'}`,
          label: {
            text: '🚚',
            fontSize: '16px',
          },
        });
      }

      // Polyline
      const routeLine = new google.maps.Polyline({
        path: [
          { lat: pickupLat, lng: pickupLng },
          { lat: currentLat, lng: currentLng },
          { lat: deliveryLat, lng: deliveryLng },
        ],
        geodesic: true,
        strokeColor: '#2563eb',
        strokeOpacity: 0.8,
        strokeWeight: 4,
      });
      routeLine.setMap(map);

      // Bounds
      const bounds = new google.maps.LatLngBounds();
      bounds.extend({ lat: pickupLat, lng: pickupLng });
      bounds.extend({ lat: currentLat, lng: currentLng });
      bounds.extend({ lat: deliveryLat, lng: deliveryLng });
      map.fitBounds(bounds, 50);

      googleMapRef.current = map;
      setMapEngine('google');
    } catch (e) {
      console.warn('Google Maps rendering error, fallback to Leaflet:', e);
      initLeafletMap();
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--card-border)',
        boxShadow: 'var(--card-shadow)',
        background: '#f8fafc',
      }}
    >
      {/* Map Canvas Container */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: typeof height === 'number' ? `${height}px` : height,
          zIndex: 1,
        }}
      />

      {/* Map Legend & Telemetry Overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          right: 12,
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(6px)',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          borderRadius: 8,
          padding: '8px 12px',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          fontSize: 11,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          pointerEvents: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#059669' }} />
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Origin:</span>
          <span style={{ color: 'var(--text-secondary)' }}>{pickup.city || 'Origin'}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4f46e5' }} />
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Current:</span>
          <span style={{ color: 'var(--text-secondary)' }}>{currentLocation.locationName || 'En Route'}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563eb' }} />
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Destination:</span>
          <span style={{ color: 'var(--text-secondary)' }}>{delivery.city || 'Destination'}</span>
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', marginTop: 3, paddingTop: 3, color: 'var(--text-muted)', fontSize: 10 }}>
          {mapEngine === 'google' ? 'Google Maps JavaScript API' : 'OpenStreetMap Live Telemetry'}
        </div>
      </div>
    </div>
  );
}
