import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Truck,
  Calendar,
  Package,
  CheckCircle2,
  Clock,
  Circle,
  RefreshCw,
  PlusCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  User,
  Radio,
  CheckCircle,
  XCircle,
  Sparkles,
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/States';
import { useToast } from '../../components/common/Toast';
import InteractiveShipmentMap from '../../components/tracking/InteractiveShipmentMap';
import { shipmentService } from '../../services/shipmentService';
import type { TrackingResponse, TrackingMilestoneEvent } from '../../types/shipment';

const HORIZONTAL_MILESTONES = [
  { key: 'CONFIRMED', label: 'Order Confirmed' },
  { key: 'PICKED_UP', label: 'Picked Up' },
  { key: 'IN_TRANSIT', label: 'In Transit' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { key: 'DELIVERED', label: 'Delivered' },
];

function getMilestoneStep(status?: string): number {
  const norm = (status || '').toUpperCase().replace(/[\s-]/g, '_');
  if (norm === 'DELIVERED') return 4;
  if (norm === 'OUT_FOR_DELIVERY') return 3;
  if (norm === 'IN_TRANSIT' || norm === 'SHIPPED') return 2;
  if (norm === 'PICKED_UP' || norm === 'PROCESSING' || norm === 'READY_FOR_SHIPMENT') return 1;
  return 0; // CONFIRMED or PENDING or NEW
}

export default function TrackShipment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const queryParams = new URLSearchParams(location.search);
  const initialId = queryParams.get('id') || '';

  const [query, setQuery] = useState(initialId);
  const [shipment, setShipment] = useState<TrackingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasNoShipmentsAtAll, setHasNoShipmentsAtAll] = useState(false);
  const [searchNotFound, setSearchNotFound] = useState(false);
  const [lastPolledAt, setLastPolledAt] = useState<Date>(new Date());

  const pollingIntervalRef = useRef<any>(null);

  useEffect(() => {
    loadInitialTracking();
  }, [location.search]);

  // Set up 10-second automatic background polling for active deliveries
  useEffect(() => {
    if (!shipment) {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      return;
    }

    const isTerminal =
      shipment.status === 'DELIVERED' ||
      shipment.status === 'Delivered' ||
      shipment.status === 'CANCELLED' ||
      shipment.status === 'Cancelled';

    if (isTerminal) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    // Clear any existing timer
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const trackingCode = shipment.trackingNumber || shipment.orderNumber;
        if (!trackingCode) return;
        const freshData = await shipmentService.trackShipment(trackingCode);
        setShipment(freshData);
        setLastPolledAt(new Date());
      } catch (err) {
        console.warn('Background telemetry poll error:', err);
      }
    }, 10000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [shipment?.trackingNumber, shipment?.status]);

  const loadInitialTracking = async () => {
    const idFromUrl = queryParams.get('id')?.trim() || '';
    setLoading(true);
    setSearchNotFound(false);

    try {
      if (idFromUrl) {
        setQuery(idFromUrl);
        const data = await shipmentService.trackShipment(idFromUrl);
        setShipment(data);
        setHasNoShipmentsAtAll(false);
        setLastPolledAt(new Date());
      } else {
        // Fetch all shipments for this customer to default to their latest
        const allShipments = await shipmentService.getAllShipments();
        if (allShipments && allShipments.length > 0) {
          const first = allShipments[0];
          setQuery(first.trackingNumber || first.orderNumber);
          const data = await shipmentService.trackShipment(first.trackingNumber || first.orderNumber);
          setShipment(data);
          setHasNoShipmentsAtAll(false);
          setLastPolledAt(new Date());
        } else {
          setShipment(null);
          setHasNoShipmentsAtAll(true);
        }
      }
    } catch (err: any) {
      console.warn('Tracking fetch notice:', err?.response?.data?.message || err?.message);
      if (idFromUrl) {
        setSearchNotFound(true);
      } else {
        setHasNoShipmentsAtAll(true);
      }
      setShipment(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const searchCode = query.trim();
    if (!searchCode) {
      showToast('error', 'Search Required', 'Please enter a tracking number or order number.');
      return;
    }

    try {
      setLoading(true);
      setSearchNotFound(false);
      const data = await shipmentService.trackShipment(searchCode);
      setShipment(data);
      setHasNoShipmentsAtAll(false);
      setLastPolledAt(new Date());
      showToast('success', 'Shipment Found', `Showing live telemetry for ${data.trackingNumber}`);
    } catch (err: any) {
      console.error('Search shipment error:', err);
      setShipment(null);
      setSearchNotFound(true);
      showToast(
        'error',
        'Shipment Not Found',
        "We couldn't find a shipment associated with this tracking code. Please verify and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!shipment) return;
    try {
      setIsRefreshing(true);
      const data = await shipmentService.trackShipment(shipment.trackingNumber);
      setShipment(data);
      setLastPolledAt(new Date());
      showToast('success', 'Telemetry Refreshed', 'Latest shipment telemetry loaded from server.');
    } catch (err: any) {
      console.error('Refresh error:', err);
      showToast('error', 'Refresh Failed', 'Unable to refresh telemetry right now.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDateOnly = (dateStr?: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Freshness calculation
  const getFreshness = () => {
    if (!shipment) return { label: 'Unavailable', color: '#94a3b8', state: 'UNAVAILABLE' };

    const statusNorm = (shipment.status || '').toUpperCase();
    if (statusNorm === 'DELIVERED') {
      return { label: 'Delivered', color: '#10b981', state: 'DELIVERED' };
    }
    if (statusNorm === 'CANCELLED') {
      return { label: 'Cancelled', color: '#ef4444', state: 'CANCELLED' };
    }

    const updateTimeStr = shipment.lastLocationUpdatedAt || shipment.currentLocation?.lastUpdatedAt;
    if (!updateTimeStr) {
      return { label: 'Location Pending', color: '#64748b', state: 'PENDING' };
    }

    const updateTime = new Date(updateTimeStr).getTime();
    const now = Date.now();
    const diffSec = Math.max(0, Math.floor((now - updateTime) / 1000));

    if (diffSec < 60) {
      return { label: `● Live · Updated ${diffSec}s ago`, color: '#10b981', state: 'LIVE' };
    } else if (diffSec < 300) {
      const min = Math.floor(diffSec / 60);
      return { label: `● Recent · Updated ${min}m ago`, color: '#f59e0b', state: 'RECENT' };
    } else {
      return { label: '● Last Recorded Position', color: '#64748b', state: 'STALE' };
    }
  };

  const freshness = getFreshness();
  const isTerminalStatus =
    shipment?.status === 'DELIVERED' ||
    shipment?.status === 'Delivered' ||
    shipment?.status === 'CANCELLED' ||
    shipment?.status === 'Cancelled';

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', paddingBottom: 40 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Live Shipment Tracking
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Real-time GPS telemetry and corridor checkpoint visibility.
          </p>
        </div>
      </div>

      {/* Top Search Bar */}
      <div className="card" style={{ padding: '18px 22px', marginBottom: 20 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div className="search-box" style={{ flex: 1, minWidth: 260, maxWidth: 'none' }}>
            <Search size={18} className="search-box-icon" />
            <input
              type="text"
              className="search-input font-mono"
              style={{ padding: '11px 16px 11px 42px', fontSize: 14 }}
              placeholder="Enter Tracking Number (e.g. PR-TRK-... or PR-ORD-...)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: '0 24px', height: 44, fontSize: 14 }}
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <RefreshCw size={26} className="animate-spin" style={{ margin: '0 auto 12px', color: 'var(--primary)' }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
            Loading shipment telemetry...
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Connecting to GPS coordinates and journey milestones...
          </p>
        </div>
      ) : hasNoShipmentsAtAll ? (
        <div className="card" style={{ padding: '50px 24px', textAlign: 'center' }}>
          <EmptyState
            title="No shipments found"
            description="You don't have any active shipments yet. Create an order to start tracking your deliveries."
            action={
              <button
                className="btn btn-primary"
                onClick={() => navigate('/customer/orders/create')}
                style={{ marginTop: 8 }}
              >
                <PlusCircle size={15} /> Create Order
              </button>
            }
          />
        </div>
      ) : searchNotFound ? (
        <div className="card" style={{ padding: '50px 24px', textAlign: 'center' }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              background: 'var(--danger-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <AlertTriangle size={26} color="var(--danger)" />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
            Shipment not found
          </h3>
          <p
            style={{
              fontSize: 14,
              color: 'var(--text-secondary)',
              maxWidth: 460,
              margin: '8px auto 20px',
              lineHeight: 1.5,
            }}
          >
            We couldn't find a shipment associated with code <strong className="font-mono">{query}</strong>. Please check your tracking number or order ID and try again.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <button
              className="btn btn-outline"
              onClick={() => {
                setQuery('');
                loadInitialTracking();
              }}
            >
              Reset Search
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/customer/orders')}
            >
              View My Orders
            </button>
          </div>
        </div>
      ) : shipment ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Delivered or Cancelled Banner */}
          {shipment.status === 'DELIVERED' || shipment.status === 'Delivered' ? (
            <div
              style={{
                background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                border: '1px solid #10b981',
                borderRadius: 12,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: '#10b981',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <CheckCircle size={22} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#065f46' }}>
                  Delivery Completed Successfully
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: '#047857' }}>
                  This consignment has been safely delivered to the recipient address and verified. Real-time telemetry stream is closed.
                </p>
              </div>
            </div>
          ) : shipment.status === 'CANCELLED' || shipment.status === 'Cancelled' ? (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #f87171',
                borderRadius: 12,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <XCircle size={24} color="#dc2626" />
              <div>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#991b1b' }}>
                  Consignment Cancelled
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: '#b91c1c' }}>
                  This shipment was cancelled. No further movement will take place.
                </p>
              </div>
            </div>
          ) : null}

          {/* Shipment Overview Header Card */}
          <div className="card">
            <div
              style={{
                padding: '20px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16,
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Shipment Tracking Number
                  </span>
                  {/* Freshness Badge */}
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 12,
                      background: freshness.state === 'LIVE' ? '#dcfce7' : freshness.state === 'RECENT' ? '#fef3c7' : '#f1f5f9',
                      color: freshness.state === 'LIVE' ? '#166534' : freshness.state === 'RECENT' ? '#92400e' : '#475569',
                      border: `1px solid ${freshness.state === 'LIVE' ? '#86efac' : freshness.state === 'RECENT' ? '#fde68a' : '#e2e8f0'}`,
                    }}
                  >
                    {freshness.label}
                  </span>
                </div>
                <h2
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    color: 'var(--text-primary)',
                    marginTop: 4,
                  }}
                >
                  {shipment.trackingNumber}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Associated Order: <strong className="font-mono" style={{ color: 'var(--text-secondary)' }}>{shipment.orderNumber}</strong>
                  </span>
                  {!isTerminalStatus && (
                    <span style={{ fontSize: 11, color: '#3b82f6', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Radio size={12} className="animate-pulse" /> Auto-sync active (10s)
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Current Status
                  </span>
                  <div style={{ marginTop: 4 }}>
                    <StatusBadge status={shipment.status} />
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  title="Refresh Tracking"
                  style={{ height: 36 }}
                >
                  <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                  <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                </button>
              </div>
            </div>

            {/* Interactive Real Map */}
            <div style={{ padding: 20 }}>
              <InteractiveShipmentMap
                pickup={shipment.pickup}
                currentLocation={shipment.currentLocation}
                delivery={shipment.delivery}
                status={shipment.status}
                height={380}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap', gap: 8 }}>
                <span>
                  📍 Route Corridor: <strong>{shipment.pickup.city || 'Origin'}</strong> → <strong>{shipment.delivery.city || 'Destination'}</strong>
                </span>
                <span>
                  Last Telemetry Update:{' '}
                  <strong>{formatDateTime(shipment.lastLocationUpdatedAt || shipment.currentLocation?.lastUpdatedAt || shipment.lastUpdatedAt)}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Section: Live Fleet & Delivery Dispatch Card */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            {/* Live Location Card */}
            <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563eb',
                  flexShrink: 0,
                }}
              >
                <MapPin size={22} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Current Position
                </span>
                <h4 style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {shipment.currentLocationName || shipment.currentLocation?.locationName || 'In Transit Corridor'}
                </h4>
                <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                  {shipment.currentLatitude && shipment.currentLongitude
                    ? `Lat: ${shipment.currentLatitude.toFixed(4)}, Lng: ${shipment.currentLongitude.toFixed(4)}`
                    : 'Coordinates synchronized with linehaul dispatch'}
                </p>
              </div>
            </div>

            {/* Assigned Driver Card */}
            <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#16a34a',
                  flexShrink: 0,
                }}
              >
                <User size={22} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Assigned Delivery Agent
                </span>
                <h4 style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {shipment.driverName || 'PrimeRoute Logistics Fleet'}
                </h4>
                <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                  Vehicle: <strong style={{ color: 'var(--text-secondary)' }}>{shipment.vehicleNumber || 'Linehaul Unit'}</strong>
                </p>
              </div>
            </div>

            {/* Estimated Arrival Card */}
            <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: '#faf5ff',
                  border: '1px solid #e9d5ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9333ea',
                  flexShrink: 0,
                }}
              >
                <Calendar size={22} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Estimated Delivery
                </span>
                <h4 style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {formatDateOnly(shipment.estimatedDeliveryDate)}
                </h4>
                <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                  Type: {shipment.deliveryType ? shipment.deliveryType.replace('_', ' ') : 'Standard'}
                </p>
              </div>
            </div>
          </div>

          {/* Section: Horizontal Shipment Status Timeline */}
          <div className="card" style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Shipment Status Timeline
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  Progressive tracking milestones from booking to final delivery
                </p>
              </div>
              <StatusBadge status={shipment.status} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflowX: 'auto', paddingBottom: 8 }}>
              {HORIZONTAL_MILESTONES.map((m, idx) => {
                const step = getMilestoneStep(shipment.status);
                const isCompleted = idx < step || (step === 4 && idx === 4);
                const isCurrent = idx === step && step !== 4;
                const isFuture = idx > step;

                return (
                  <React.Fragment key={m.key}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', zIndex: 2, minWidth: 100 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: isCompleted ? 'var(--success)' : isCurrent ? 'var(--primary)' : '#f1f5f9',
                          color: isCompleted || isCurrent ? '#ffffff' : '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: 8,
                          boxShadow: isCurrent ? '0 0 0 4px rgba(37, 99, 235, 0.2)' : 'none',
                          border: isFuture ? '1px solid #e2e8f0' : 'none',
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={18} />
                        ) : isCurrent ? (
                          <Clock size={18} />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: isCurrent ? 700 : 600,
                          color: isCurrent ? 'var(--primary)' : isCompleted ? 'var(--text-primary)' : 'var(--text-muted)',
                          lineHeight: 1.3,
                        }}
                      >
                        {m.label}
                      </span>
                    </div>

                    {idx < HORIZONTAL_MILESTONES.length - 1 && (
                      <div
                        style={{
                          flex: 1,
                          height: 3,
                          minWidth: 24,
                          background: idx < step ? 'var(--success)' : '#e2e8f0',
                          margin: '-24px 0 0 0',
                          zIndex: 1,
                        }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Section: Shipment Details Card (Two-Column Layout) */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
              Consignment & Route Details
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: 24,
              }}
            >
              {/* Column 1: Consignment Identifiers & Service */}
              <div
                style={{
                  background: 'var(--page-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Tracking Number
                  </span>
                  <p style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace', color: 'var(--primary)', margin: '4px 0 0' }}>
                    {shipment.trackingNumber}
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Order Number
                  </span>
                  <p style={{ fontSize: 14, fontWeight: 600, fontFamily: 'monospace', color: 'var(--text-primary)', margin: '4px 0 0' }}>
                    {shipment.orderNumber}
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Current Status
                  </span>
                  <div style={{ marginTop: 4 }}>
                    <StatusBadge status={shipment.status} />
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Delivery Service
                  </span>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '4px 0 0' }}>
                    {shipment.deliveryType ? shipment.deliveryType.replace('_', ' ') : 'Standard'} Express
                  </p>
                </div>
              </div>

              {/* Column 2: Route, Schedule & Package */}
              <div
                style={{
                  background: 'var(--page-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Origin Warehouse / Point
                  </span>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4, margin: '4px 0 0' }}>
                    {shipment.originName || shipment.pickup.addressText}
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Delivery Destination Address
                  </span>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4, margin: '4px 0 0' }}>
                    {shipment.destinationAddress || shipment.delivery.addressText}
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Expected Delivery Date
                  </span>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0 0' }}>
                    {formatDateOnly(shipment.estimatedDeliveryDate)}
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Cargo Specifications
                  </span>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                    {shipment.packageDetails.description || 'General Parcel Cargo'} · {shipment.packageDetails.weight} kg · {shipment.packageDetails.quantity} unit{shipment.packageDetails.quantity === 1 ? '' : 's'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Milestone Checkpoint Timeline */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
              Milestone Checkpoints
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, paddingLeft: 10 }}>
              {shipment.events && shipment.events.length > 0 ? (
                shipment.events.map((ev, idx) => {
                  const isLast = idx === shipment.events.length - 1;
                  return (
                    <div key={ev.id || idx} style={{ display: 'flex', gap: 16, position: 'relative' }}>
                      {/* Timeline Connector Line & Dot */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: ev.completed
                              ? 'var(--success)'
                              : ev.current
                              ? 'var(--indigo)'
                              : '#e2e8f0',
                            color: '#ffffff',
                            zIndex: 2,
                            boxShadow: ev.current ? '0 0 0 4px rgba(79, 70, 229, 0.2)' : 'none',
                          }}
                        >
                          {ev.completed ? (
                            <CheckCircle2 size={16} />
                          ) : ev.current ? (
                            <Clock size={16} />
                          ) : (
                            <Circle size={10} color="#94a3b8" />
                          )}
                        </div>

                        {!isLast && (
                          <div
                            style={{
                              width: 2,
                              flex: 1,
                              minHeight: 44,
                              background: ev.completed ? 'var(--success)' : '#e2e8f0',
                              margin: '4px 0',
                            }}
                          />
                        )}
                      </div>

                      {/* Event Details */}
                      <div style={{ paddingBottom: isLast ? 0 : 28, flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 6 }}>
                          <h4
                            style={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: ev.completed || ev.current ? 'var(--text-primary)' : 'var(--text-muted)',
                              margin: 0,
                            }}
                          >
                            {ev.title}
                          </h4>

                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {formatDateTime(ev.eventTime)}
                          </span>
                        </div>

                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 6px', lineHeight: 1.4 }}>
                          {ev.description}
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                          <MapPin size={12} color="var(--primary)" />
                          <span>{ev.locationName}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  No tracking milestones logged yet.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
