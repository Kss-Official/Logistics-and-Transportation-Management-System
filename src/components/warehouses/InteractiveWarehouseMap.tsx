import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Warehouse } from '../../types/warehouse';
import {
  Layers,
  MapPin,
  Maximize2,
  Minimize2,
  Navigation,
  Eye,
  Activity,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface InteractiveWarehouseMapProps {
  warehouses: Warehouse[];
  selectedWarehouse: Warehouse | null;
  onSelectWarehouse: (warehouse: Warehouse) => void;
  onViewDetails?: (warehouse: Warehouse) => void;
  height?: number | string;
}

export default function InteractiveWarehouseMap({
  warehouses,
  selectedWarehouse,
  onSelectWarehouse,
  onViewDetails,
  height = 420,
}: InteractiveWarehouseMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  // Stable refs for callbacks & latest data to avoid stale closures in Leaflet events
  const onViewDetailsRef = useRef(onViewDetails);
  onViewDetailsRef.current = onViewDetails;
  const onSelectWarehouseRef = useRef(onSelectWarehouse);
  onSelectWarehouseRef.current = onSelectWarehouse;
  const warehousesRef = useRef(warehouses);
  warehousesRef.current = warehouses;

  const [mapFilter, setMapFilter] = useState<'ALL' | 'ACTIVE'>('ALL');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Centralized robust facility detail opener
  const handleOpenFacilityDetails = (idOrCode: string | number) => {
    // If fullscreen is active, exit fullscreen so the drawer is visible
    setIsFullscreen(false);

    // Close open popup cleanly
    if (leafletMapRef.current) {
      leafletMapRef.current.closePopup();
    }

    const wh = warehousesRef.current.find(
      (item) => String(item.id) === String(idOrCode) || item.warehouseCode === String(idOrCode)
    );
    if (wh) {
      if (onSelectWarehouseRef.current) {
        onSelectWarehouseRef.current(wh);
      }
      if (onViewDetailsRef.current) {
        onViewDetailsRef.current(wh);
      }
    }
  };

  // Expose global window handler for direct popup onclick
  useEffect(() => {
    (window as any).__openWarehouseFacilityDetails = (idOrCode: string | number, e?: Event) => {
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }
      handleOpenFacilityDetails(idOrCode);
    };

    return () => {
      delete (window as any).__openWarehouseFacilityDetails;
    };
  }, []);

  // Map container capture-phase event listener to catch button clicks before Leaflet suppresses them
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const handleContainerClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const btn = target?.closest<HTMLButtonElement>('.wh-popup-view-btn, [data-warehouse-id]');
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.getAttribute('data-warehouse-id');
        if (id) {
          handleOpenFacilityDetails(id);
        }
      }
    };

    container.addEventListener('click', handleContainerClick, true);
    return () => {
      container.removeEventListener('click', handleContainerClick, true);
    };
  }, []);

  // Filter facilities with valid coordinates
  const displayWarehouses = warehouses.filter((w) => {
    if (mapFilter === 'ACTIVE' && w.status !== 'ACTIVE') return false;
    return w.latitude != null && w.longitude != null && !isNaN(Number(w.latitude)) && !isNaN(Number(w.longitude));
  });

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy existing instance if container re-rendered
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    const defaultCenter: L.LatLngExpression = [21.5937, 78.9629]; // Central India
    const defaultZoom = 5;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      scrollWheelZoom: true,
    }).setView(defaultCenter, defaultZoom);

    // Place zoom control at bottom-right so it doesn't overlap the top bar
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    leafletMapRef.current = map;
    markersRef.current = {};

    // Bind popupopen on the map to disable click propagation and wire buttons
    map.on('popupopen', (e) => {
      const popupEl = e.popup.getElement();
      if (popupEl) {
        const btns = popupEl.querySelectorAll<HTMLButtonElement>('.wh-popup-view-btn');
        btns.forEach((btn) => {
          L.DomEvent.disableClickPropagation(btn);
          L.DomEvent.disableScrollPropagation(btn);
          L.DomEvent.on(btn, 'click', (ev) => {
            L.DomEvent.stopPropagation(ev);
            L.DomEvent.preventDefault(ev);
            const id = btn.getAttribute('data-warehouse-id');
            if (id) {
              handleOpenFacilityDetails(id);
            }
          });
        });
      }
    });

    const bounds = L.latLngBounds([]);

    displayWarehouses.forEach((w) => {
      const lat = Number(w.latitude);
      const lng = Number(w.longitude);
      const isSelected = selectedWarehouse?.id === w.id;

      const util = w.utilizationRate ?? 0;
      let badgeColor = '#059669'; // green
      let badgeBg = '#ecfdf5';
      if (w.status === 'INACTIVE') {
        badgeColor = '#64748b';
        badgeBg = '#f1f5f9';
      } else if (w.status === 'MAINTENANCE') {
        badgeColor = '#d97706';
        badgeBg = '#fffbeb';
      } else if (util >= 90) {
        badgeColor = '#dc2626';
        badgeBg = '#fef2f2';
      } else if (util >= 70) {
        badgeColor = '#ea580c';
        badgeBg = '#fff7ed';
      }

      const icon = L.divIcon({
        className: 'custom-warehouse-pin',
        html: `
          <div style="
            display: flex;
            align-items: center;
            gap: 6px;
            background: ${isSelected ? badgeColor : '#ffffff'};
            color: ${isSelected ? '#ffffff' : '#1e293b'};
            padding: 5px 10px;
            border-radius: 9999px;
            border: 2px solid ${badgeColor};
            box-shadow: 0 4px 12px rgba(0,0,0,0.18);
            font-size: 11px;
            font-weight: 700;
            font-family: inherit;
            white-space: nowrap;
            cursor: pointer;
            transition: all 0.2s ease;
          ">
            <span style="
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: ${isSelected ? '#ffffff' : badgeColor};
              display: inline-block;
            "></span>
            <span>${w.warehouseCode}</span>
            <span style="
              background: ${isSelected ? 'rgba(255,255,255,0.25)' : badgeBg};
              color: ${isSelected ? '#ffffff' : badgeColor};
              font-size: 10px;
              padding: 1px 5px;
              border-radius: 4px;
            ">${util}%</span>
          </div>
        `,
        iconSize: [125, 30],
        iconAnchor: [62, 15],
      });

      const marker = L.marker([lat, lng], { icon }).addTo(map);

      // Popup Content
      const popupHtml = `
        <div style="min-width: 220px; font-family: inherit; color: #0f172a; padding: 2px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 6px;">
            <div>
              <div style="font-size: 10px; font-weight: 800; color: #64748b; font-family: monospace; letter-spacing: 0.05em;">${w.warehouseCode}</div>
              <div style="font-weight: 700; font-size: 13px; color: #0f172a;">${w.warehouseName}</div>
            </div>
            <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: ${badgeBg}; color: ${badgeColor};">
              ${w.status}
            </span>
          </div>

          <div style="font-size: 11px; color: #475569; margin-bottom: 8px; display: flex; align-items: center; gap: 4px;">
            <span>📍 ${w.city}, ${w.state}</span>
          </div>

          <div style="background: #f8fafc; padding: 8px 10px; border-radius: 6px; margin-bottom: 10px; border: 1px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 600; margin-bottom: 4px;">
              <span style="color: #64748b;">Capacity:</span>
              <span style="color: #0f172a;">${w.occupiedCapacity?.toLocaleString()} / ${w.totalCapacity?.toLocaleString()} ${w.capacityUnit}</span>
            </div>
            <div style="height: 6px; width: 100%; background: #e2e8f0; border-radius: 9999px; overflow: hidden; margin-bottom: 4px;">
              <div style="height: 100%; width: ${Math.min(util, 100)}%; background: ${badgeColor}; border-radius: 9999px;"></div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 10px; color: #64748b;">
              <span>Utilization: <strong>${util}%</strong></span>
              <span>Active Loads: <strong>${w.activeShipmentCount || 0}</strong></span>
            </div>
          </div>

          <div style="display: flex; gap: 6px;">
            <button
              type="button"
              id="wh-popup-view-${w.id}"
              class="wh-popup-view-btn"
              data-warehouse-id="${w.id}"
              onclick="window.__openWarehouseFacilityDetails && window.__openWarehouseFacilityDetails('${w.id}', event)"
              style="
                flex: 1;
                background: #0284c7;
                color: #ffffff;
                border: none;
                padding: 7px 10px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 700;
                cursor: pointer;
                box-shadow: 0 1px 3px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 5px;
                transition: background 0.15s ease;
              "
              onmouseover="this.style.background='#0369a1'"
              onmouseout="this.style.background='#0284c7'"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <span>View Facility Details</span>
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        if (onSelectWarehouseRef.current) {
          onSelectWarehouseRef.current(w);
        }
      });

      markersRef.current[String(w.id)] = marker;
      bounds.extend([lat, lng]);
    });

    if (displayWarehouses.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    }

    // Force map size recalculation after layout settles to guarantee complete tile coverage
    const tInit1 = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    const tInit2 = setTimeout(() => {
      map.invalidateSize();
    }, 400);

    return () => {
      clearTimeout(tInit1);
      clearTimeout(tInit2);
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [displayWarehouses.length, mapFilter]);

  // Container ResizeObserver: always triggers map.invalidateSize() on any container dimension change
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    let rafId: number;
    const observer = new ResizeObserver(() => {
      if (leafletMapRef.current) {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          leafletMapRef.current?.invalidateSize();
        });
      }
    });

    observer.observe(container);

    const handleWindowResize = () => {
      leafletMapRef.current?.invalidateSize();
    };
    window.addEventListener('resize', handleWindowResize);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  // Handle Fullscreen transitions & tile invalidation
  useEffect(() => {
    if (!leafletMapRef.current) return;
    const map = leafletMapRef.current;

    // Immediately and staggered calls across layout reflow frames
    map.invalidateSize();
    const t1 = setTimeout(() => {
      map.invalidateSize();
    }, 80);
    const t2 = setTimeout(() => {
      map.invalidateSize();
      if (displayWarehouses.length > 0) {
        const bounds = L.latLngBounds(
          displayWarehouses.map((w) => [Number(w.latitude), Number(w.longitude)])
        );
        map.fitBounds(bounds, { padding: isFullscreen ? [80, 80] : [40, 40], maxZoom: 12 });
      }
    }, 250);
    const t3 = setTimeout(() => {
      map.invalidateSize();
    }, 500);

    // Lock page body scroll when fullscreen is active
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Allow Esc key to exit fullscreen
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen, displayWarehouses.length]);

  // Center map on selected warehouse if changed
  useEffect(() => {
    if (!leafletMapRef.current || !selectedWarehouse) return;
    const lat = Number(selectedWarehouse.latitude);
    const lng = Number(selectedWarehouse.longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      const center = leafletMapRef.current.getCenter();
      const dist = Math.abs(center.lat - lat) + Math.abs(center.lng - lng);
      if (dist > 0.005) {
        leafletMapRef.current.flyTo([lat, lng], 12, { duration: 0.8 });
      }
      const marker = markersRef.current[String(selectedWarehouse.id)];
      if (marker && !marker.isPopupOpen()) {
        marker.openPopup();
      }
    }
  }, [selectedWarehouse]);

  const handleRecenter = () => {
    if (!leafletMapRef.current || displayWarehouses.length === 0) return;
    leafletMapRef.current.invalidateSize();
    const bounds = L.latLngBounds(
      displayWarehouses.map((w) => [Number(w.latitude), Number(w.longitude)])
    );
    leafletMapRef.current.fitBounds(bounds, { padding: isFullscreen ? [80, 80] : [40, 40], maxZoom: 12 });
  };

  return (
    <div
      style={{
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : undefined,
        left: isFullscreen ? 0 : undefined,
        right: isFullscreen ? 0 : undefined,
        bottom: isFullscreen ? 0 : undefined,
        width: isFullscreen ? '100vw' : '100%',
        height: isFullscreen ? '100vh' : height,
        borderRadius: isFullscreen ? 0 : 'var(--radius, 8px)',
        overflow: 'hidden',
        border: isFullscreen ? 'none' : '1px solid var(--border)',
        boxShadow: isFullscreen ? 'none' : '0 2px 8px rgba(0,0,0,0.06)',
        zIndex: isFullscreen ? 10000 : 1,
      }}
    >
      {/* Map Control Bar */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          right: 12,
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        {/* Left Badge */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(8px)',
            padding: '6px 12px',
            borderRadius: 8,
            boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            pointerEvents: 'auto',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--text-primary)',
          }}
        >
          <Layers size={14} style={{ color: 'var(--primary)' }} />
          <span>Regional Facility Network Map</span>
          <span
            style={{
              background: 'var(--primary-light, #e0f2fe)',
              color: 'var(--primary, #0284c7)',
              fontSize: 11,
              padding: '1px 6px',
              borderRadius: 4,
            }}
          >
            {displayWarehouses.length} Nodes
          </span>
        </div>

        {/* Right Actions */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            pointerEvents: 'auto',
          }}
        >
          {/* Map Filter */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(8px)',
              padding: 3,
              borderRadius: 8,
              boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
              display: 'flex',
              gap: 2,
            }}
          >
            <button
              type="button"
              onClick={() => setMapFilter('ALL')}
              style={{
                border: 'none',
                background: mapFilter === 'ALL' ? 'var(--primary)' : 'transparent',
                color: mapFilter === 'ALL' ? '#ffffff' : 'var(--text-secondary)',
                fontSize: 11,
                fontWeight: 600,
                padding: '4px 8px',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              All Facilities
            </button>
            <button
              type="button"
              onClick={() => setMapFilter('ACTIVE')}
              style={{
                border: 'none',
                background: mapFilter === 'ACTIVE' ? 'var(--primary)' : 'transparent',
                color: mapFilter === 'ACTIVE' ? '#ffffff' : 'var(--text-secondary)',
                fontSize: 11,
                fontWeight: 600,
                padding: '4px 8px',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              Active Only
            </button>
          </div>

          <button
            type="button"
            onClick={handleRecenter}
            title="Reset Map Zoom"
            style={{
              background: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(8px)',
              border: '1px solid var(--border)',
              padding: '6px 10px',
              borderRadius: 8,
              boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Navigation size={12} />
            Recenter
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
            style={{
              background: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(8px)',
              border: '1px solid var(--border)',
              padding: '6px 10px',
              borderRadius: 8,
              boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* Leaflet Container */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100%',
          minHeight: isFullscreen ? '100vh' : typeof height === 'number' ? `${height}px` : height,
          background: '#f1f5f9',
        }}
      />
    </div>
  );
}
