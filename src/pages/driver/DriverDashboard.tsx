import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Truck,
  Package,
  CheckCircle2,
  Clock,
  Navigation,
  MapPin,
  Phone,
  ArrowRight,
  ShieldCheck,
  Fuel,
  Gauge,
  AlertTriangle,
  FileCheck,
  Calendar,
  Layers,
  AlertCircle,
  Bell,
  MessageSquare,
  CheckCheck
} from 'lucide-react';
import { driverPortalService } from '../../services/driverPortalService';
import type {
  DriverProfileData,
  DriverDashboardKpis,
  DeliveryAssignment,
  VehicleTelemetry,
  DriverNotificationItem
} from '../../types/driverPortal';

export default function DriverDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<DriverProfileData | null>(null);
  const [kpis, setKpis] = useState<DriverDashboardKpis | null>(null);
  const [activeDelivery, setActiveDelivery] = useState<DeliveryAssignment | null>(null);
  const [todayDeliveries, setTodayDeliveries] = useState<DeliveryAssignment[]>([]);
  const [vehicle, setVehicle] = useState<VehicleTelemetry | null>(null);
  const [notifications, setNotifications] = useState<DriverNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadDashboard = async () => {
      try {
        const [profData, kpiData, currentDel, allDels, vehData, notifsData, unreadData] = await Promise.all([
          driverPortalService.getProfile(),
          driverPortalService.getDashboardKpis(),
          driverPortalService.getCurrentDelivery(),
          driverPortalService.getDeliveries(),
          driverPortalService.getVehicle(),
          driverPortalService.getNotifications(),
          driverPortalService.getUnreadCount()
        ]);
        if (isMounted) {
          setProfile(profData);
          setKpis(kpiData);
          setActiveDelivery(currentDel);
          setTodayDeliveries(allDels.slice(0, 5));
          setVehicle(vehData);
          setNotifications(notifsData.slice(0, 3));
          setUnreadCount(unreadData);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Failed to load driver dashboard:', err);
        if (isMounted) {
          setError('Unable to load driver operations console. Please check server connectivity.');
          setLoading(false);
        }
      }
    };
    loadDashboard();

    const handleNotifsChanged = () => {
      driverPortalService.getNotifications().then(data => {
        if (isMounted) setNotifications(data.slice(0, 3));
      }).catch(() => {});
      driverPortalService.getUnreadCount().then(c => {
        if (isMounted) setUnreadCount(c);
      }).catch(() => {});
    };

    window.addEventListener('driver-notifications:updated', handleNotifsChanged);
    window.addEventListener('notifications:updated', handleNotifsChanged);

    const interval = setInterval(handleNotifsChanged, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('driver-notifications:updated', handleNotifsChanged);
      window.removeEventListener('notifications:updated', handleNotifsChanged);
    };
  }, []);

  if (loading) {
    return (
      <div className="driver-page-container" style={{ alignItems: 'center', justifyContent: 'center', minHeight: 320, display: 'flex' }}>
        <div style={{ color: '#2563eb', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 18, height: 18, border: '2px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
          <span>Loading driver operations console...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="driver-page-container">
        <div className="driver-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <AlertCircle size={40} style={{ color: '#dc2626', margin: '0 auto 12px' }} />
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>{error}</h3>
          <p style={{ color: '#64748b', fontSize: 13, margin: '8px 0 16px' }}>
            Please confirm that you are signed in as an authorized Driver.
          </p>
          <button onClick={() => window.location.reload()} className="driver-btn-primary">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="driver-badge driver-badge-green"><CheckCircle2 size={12} /> Delivered</span>;
      case 'IN_TRANSIT':
        return <span className="driver-badge driver-badge-blue"><Navigation size={12} /> In Transit</span>;
      case 'OUT_FOR_DELIVERY':
        return <span className="driver-badge driver-badge-blue"><Truck size={12} /> Out For Delivery</span>;
      case 'ACCEPTED':
      case 'ARRIVED_AT_PICKUP':
      case 'PICKED_UP':
      case 'ARRIVED_AT_DESTINATION':
        return <span className="driver-badge driver-badge-amber"><Clock size={12} /> {status.replace(/_/g, ' ')}</span>;
      default:
        return <span className="driver-badge driver-badge-slate">{status.replace(/_/g, ' ')}</span>;
    }
  };

  const driverStatusLabel = kpis?.driverStatus || profile?.status || 'AVAILABLE';
  const isDriverOnDuty = driverStatusLabel === 'ON_DUTY' || driverStatusLabel === 'ON_TRIP' || driverStatusLabel === 'AVAILABLE';

  const driverDisplayName = profile?.name || profile?.fullName || 'Driver';
  const vehicleLabel = profile?.assignedVehicleCode && profile?.assignedVehicleCode !== 'Not available'
    ? `${profile.assignedVehicleCode} • ${profile.assignedVehicleModel || 'Cargo Vehicle'}`
    : vehicle?.vehicleCode && vehicle.vehicleCode !== 'Not available'
    ? `${vehicle.vehicleCode} • ${vehicle.model}`
    : 'No vehicle assigned';

  const vehiclePlate = profile?.assignedVehiclePlate && profile?.assignedVehiclePlate !== 'Not available'
    ? profile.assignedVehiclePlate
    : vehicle?.plateNumber && vehicle.plateNumber !== 'Not available'
    ? vehicle.plateNumber
    : null;

  return (
    <div className="driver-page-container">
      {/* ── Welcome Banner ── */}
      <div
        className="driver-card"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          color: '#ffffff',
          border: 'none',
          padding: '24px 28px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 13, opacity: 0.9, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Truck size={16} />
              PrimeRoute Fleet Operations
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                backgroundColor: isDriverOnDuty ? '#dcfce7' : '#f1f5f9',
                color: isDriverOnDuty ? '#15803d' : '#475569',
                padding: '3px 10px',
                borderRadius: 12,
                fontSize: 11.5,
                fontWeight: 800,
                letterSpacing: '0.04em',
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: isDriverOnDuty ? '#22c55e' : '#94a3b8',
                }}
              />
              {driverStatusLabel.replace(/_/g, ' ')}
            </span>
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            Welcome back, {driverDisplayName}
          </h2>
          <p style={{ margin: 0, fontSize: 13.5, opacity: 0.9, maxWidth: 650 }}>
            Vehicle: <strong>{vehicleLabel}</strong> {vehiclePlate ? `(${vehiclePlate})` : ''} &bull; Driver ID: <strong>{profile?.driverId || 'Not available'}</strong>
          </p>
        </div>

        <div
          style={{
            position: 'absolute',
            right: 20,
            bottom: -20,
            opacity: 0.1,
            pointerEvents: 'none',
          }}
        >
          <Truck size={200} />
        </div>
      </div>

      {/* ── Operational KPI Cards ── */}
      <div className="driver-kpi-grid">
        <div className="driver-kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="driver-kpi-label">Today's Deliveries</span>
            <Package size={18} style={{ color: '#2563eb' }} />
          </div>
          <div className="driver-kpi-value">{kpis?.assignedToday ?? 0}</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>Assigned consignments</div>
        </div>

        <div className="driver-kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="driver-kpi-label">Completed Deliveries</span>
            <CheckCircle2 size={18} style={{ color: '#16a34a' }} />
          </div>
          <div className="driver-kpi-value" style={{ color: '#16a34a' }}>{kpis?.completedToday ?? 0}</div>
          <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>Delivered & Verified</div>
        </div>

        <div className="driver-kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="driver-kpi-label">Pending Deliveries</span>
            <Clock size={18} style={{ color: '#f59e0b' }} />
          </div>
          <div className="driver-kpi-value" style={{ color: '#d97706' }}>{kpis?.pendingToday ?? 0}</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>Active / in-transit queue</div>
        </div>

        <div className="driver-kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="driver-kpi-label">Distance Today</span>
            <Navigation size={18} style={{ color: '#2563eb' }} />
          </div>
          <div className="driver-kpi-value">
            {kpis?.distanceCoveredTodayKm != null && kpis.distanceCoveredTodayKm > 0 ? (
              <>
                {kpis.distanceCoveredTodayKm} <span style={{ fontSize: 14, fontWeight: 600 }}>KM</span>
              </>
            ) : (
              <span style={{ fontSize: 18, color: '#64748b' }}>Not available</span>
            )}
          </div>
          <div style={{ fontSize: 12, color: '#64748b' }}>Calculated route telemetry</div>
        </div>
      </div>

      {/* ── Operational Dispatch Notifications Banner ── */}
      <div className="driver-card" style={{ padding: '16px 20px', borderLeft: '4px solid #3b82f6' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: notifications.length > 0 ? 12 : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                backgroundColor: unreadCount > 0 ? '#dbeafe' : '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: unreadCount > 0 ? '#2563eb' : '#64748b',
                flexShrink: 0,
              }}
            >
              <Bell size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                  Operational Dispatch Notifications
                </span>
                {unreadCount > 0 ? (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      padding: '1px 8px',
                      borderRadius: 10,
                      letterSpacing: '0.02em',
                    }}
                  >
                    {unreadCount} NEW
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      backgroundColor: '#dcfce7',
                      color: '#15803d',
                      padding: '1px 8px',
                      borderRadius: 10,
                    }}
                  >
                    Up to date
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>
                Live dispatch updates, assignment alerts, and route telemetry communications.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => navigate('/driver/notifications')}
              className="driver-btn-secondary"
              id="dashboard-view-all-notifs-btn"
              style={{ padding: '6px 14px', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <span>View All ({notifications.length})</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {notifications.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.read) {
                    driverPortalService.markNotificationRead(notif.id);
                  }
                  navigate('/driver/notifications');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '8px 12px',
                  borderRadius: 8,
                  backgroundColor: notif.read ? '#f8fafc' : '#eff6ff',
                  border: notif.read ? '1px solid #e2e8f0' : '1px solid #bfdbfe',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      backgroundColor: notif.read ? 'transparent' : '#2563eb',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: notif.read ? 600 : 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {notif.title}
                    </div>
                    <div style={{ fontSize: 12, color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {notif.message}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={11} />
                  <span>{new Date(notif.timestamp || notif.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Active Delivery Spotlight ── */}
      {activeDelivery ? (
        <div
          className="driver-card"
          style={{
            borderLeft: '5px solid #2563eb',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.08)',
          }}
        >
          <div className="driver-card-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#2563eb', letterSpacing: '0.05em' }}>
                  CURRENT DELIVERY
                </span>
                <span style={{ fontSize: 13, color: '#64748b', fontWeight: 700 }}>
                  {activeDelivery.trackingNumber}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 16, fontWeight: 800, color: '#0f172a', flexWrap: 'wrap' }}>
                <span>{activeDelivery.pickupLocation.facilityName}</span>
                <span style={{ color: '#2563eb' }}>&rarr;</span>
                <span>{activeDelivery.destination.customerName} ({activeDelivery.destination.city})</span>
              </div>
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Status:</span>
                {getStatusBadge(activeDelivery.status)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/driver/current-delivery')}
                className="driver-btn-primary"
                style={{ padding: '9px 18px', fontSize: 13, fontWeight: 800, letterSpacing: '0.03em' }}
              >
                VIEW DELIVERY
              </button>
              <button
                onClick={() => navigate('/driver/route')}
                className="driver-btn-secondary"
                style={{ padding: '9px 18px', fontSize: 13, fontWeight: 800, letterSpacing: '0.03em' }}
              >
                <Navigation size={14} />
                OPEN ROUTE
              </button>
            </div>
          </div>

          {/* Waypoints Visual Box */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 16,
              backgroundColor: '#f8fafc',
              padding: 16,
              borderRadius: 10,
              border: '1px solid #e2e8f0',
              marginBottom: 16,
            }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>
                Pickup Location
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                {activeDelivery.pickupLocation.facilityName}
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                {activeDelivery.pickupLocation.address}, {activeDelivery.pickupLocation.city}
              </div>
              <div style={{ fontSize: 11, color: '#2563eb', marginTop: 4, fontWeight: 600 }}>
                Dock Bay: {activeDelivery.pickupLocation.dockBay}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>
                Customer Delivery Address
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                {activeDelivery.destination.customerName}
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                {activeDelivery.destination.address}, {activeDelivery.destination.city}
              </div>
              <div style={{ fontSize: 11, color: '#16a34a', marginTop: 4, fontWeight: 600 }}>
                Estimated Delivery: {activeDelivery.estimatedDeliveryTime}
              </div>
            </div>
          </div>

          {/* Quick Cargo Metric Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 12.5, color: '#475569', alignItems: 'center' }}>
            <span><strong>Packages:</strong> {activeDelivery.totalPackages} units</span>
            <span>&bull;</span>
            <span><strong>Weight:</strong> {activeDelivery.totalWeightKg} kg</span>
            <span>&bull;</span>
            <span><strong>Cargo:</strong> {activeDelivery.cargoSummary}</span>
            <span>&bull;</span>
            <span><strong>Current Status:</strong> {getStatusBadge(activeDelivery.status)}</span>
          </div>
        </div>
      ) : (
        <div className="driver-card" style={{ textAlign: 'center', padding: '36px 20px' }}>
          <CheckCircle2 size={40} style={{ color: '#16a34a', margin: '0 auto 12px' }} />
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>No active delivery assigned</h3>
          <p style={{ color: '#64748b', fontSize: 13, margin: '6px 0 16px' }}>
            All assigned deliveries are completed or you are currently in available standby mode.
          </p>
          <Link to="/driver/deliveries" className="driver-btn-primary">
            View Assigned Deliveries
          </Link>
        </div>
      )}

      {/* ── Quick Driver Actions ── */}
      <div className="driver-card">
        <h3 className="driver-card-title">
          <Layers size={18} style={{ color: '#2563eb' }} />
          Driver Operational Shortcuts
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 14 }}>
          <Link
            to="/driver/current-delivery"
            style={{
              padding: 14,
              borderRadius: 10,
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              transition: 'transform 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1d4ed8', fontWeight: 700, fontSize: 14 }}>
              <Package size={18} />
              Current Delivery
            </div>
            <div style={{ fontSize: 12, color: '#475569' }}>
              Execute active trip, cargo verification & ePOD
            </div>
          </Link>

          <Link
            to="/driver/live-location"
            style={{
              padding: 14,
              borderRadius: 10,
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              transition: 'transform 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1d4ed8', fontWeight: 700, fontSize: 14 }}>
              <MapPin size={18} />
              Live Location
            </div>
            <div style={{ fontSize: 12, color: '#475569' }}>
              Real-time GPS tracking & telemetry broadcast
            </div>
          </Link>

          <Link
            to="/driver/route"
            style={{
              padding: 14,
              borderRadius: 10,
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              transition: 'transform 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1d4ed8', fontWeight: 700, fontSize: 14 }}>
              <Navigation size={18} />
              Optimized Route
            </div>
            <div style={{ fontSize: 12, color: '#475569' }}>
              Waypoints, route telemetry & maps
            </div>
          </Link>

          <Link
            to="/driver/vehicle"
            style={{
              padding: 14,
              borderRadius: 10,
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              transition: 'transform 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1d4ed8', fontWeight: 700, fontSize: 14 }}>
              <ShieldCheck size={18} />
              My Vehicle
            </div>
            <div style={{ fontSize: 12, color: '#475569' }}>
              Inspect assigned vehicle diagnostics & DVIR
            </div>
          </Link>
        </div>
      </div>

      {/* ── Today's Assignments Table & Vehicle Health ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Deliveries Summary Table */}
        <div className="driver-card" style={{ flex: 2 }}>
          <div className="driver-card-header">
            <h3 className="driver-card-title">
              <Calendar size={18} style={{ color: '#2563eb' }} />
              Assigned Consignments ({todayDeliveries.length})
            </h3>
            <Link to="/driver/deliveries" style={{ fontSize: 12.5, fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}>
              View All &rarr;
            </Link>
          </div>

          <div className="driver-table-wrapper">
            {todayDeliveries.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#64748b', fontSize: 13 }}>
                No consignments currently assigned.
              </div>
            ) : (
              <table className="driver-table">
                <thead>
                  <tr>
                    <th style={{ width: '30%' }}>Tracking #</th>
                    <th style={{ width: '30%' }}>Recipient & City</th>
                    <th style={{ width: '20%' }}>Status</th>
                    <th style={{ width: '20%', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {todayDeliveries.map((del) => (
                    <tr key={del.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{del.trackingNumber}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{del.totalPackages} pkgs &bull; {del.totalWeightKg}kg</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#334155' }}>{del.recipientName}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{del.recipientCity}</div>
                      </td>
                      <td>{getStatusBadge(del.status)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <Link
                          to={`/driver/deliveries/${del.id}`}
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: '#2563eb',
                            textDecoration: 'none',
                            padding: '4px 8px',
                            borderRadius: 4,
                            backgroundColor: '#eff6ff',
                          }}
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Assigned Vehicle Health Card */}
        <div className="driver-card" style={{ flex: 1 }}>
          <div className="driver-card-header">
            <h3 className="driver-card-title">
              <Truck size={18} style={{ color: '#2563eb' }} />
              Assigned Vehicle Telemetry
            </h3>
            <Link to="/driver/vehicle" style={{ fontSize: 12.5, fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}>
              Diagnostics &rarr;
            </Link>
          </div>

          {vehicle ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569' }}>
                  <Truck size={16} style={{ color: '#2563eb' }} />
                  <span>Vehicle Model</span>
                </div>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{vehicle.model}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569' }}>
                  <Gauge size={16} style={{ color: '#2563eb' }} />
                  <span>Registration</span>
                </div>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{vehicle.plateNumber}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569' }}>
                  <Fuel size={16} style={{ color: '#2563eb' }} />
                  <span>Fuel Level</span>
                </div>
                <span style={{ fontWeight: 700, color: '#16a34a' }}>{vehicle.fuelPercentage}% Full</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569' }}>
                  <ShieldCheck size={16} style={{ color: '#16a34a' }} />
                  <span>Vehicle Status</span>
                </div>
                <span className="driver-badge driver-badge-green">{vehicle.status}</span>
              </div>
            </div>
          ) : (
            <div style={{ padding: 24, textAlign: 'center', color: '#64748b', fontSize: 13 }}>
              No vehicle assigned
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
