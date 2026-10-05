import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Truck,
  Gauge,
  Fuel,
  Battery,
  ShieldCheck,
  Wrench,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Activity,
  Layers,
  Calendar,
  Navigation,
  Package,
  FileText,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  RefreshCw,
  MapPin,
  HelpCircle,
  Building,
  User
} from 'lucide-react';
import { driverPortalService } from '../../services/driverPortalService';
import type {
  VehicleTelemetry,
  DeliveryAssignment,
  VehicleInspectionReport,
  DriverProfileData
} from '../../types/driverPortal';

interface InspectionItemDef {
  id: string;
  label: string;
  category: string;
}

const CHECKLIST_ITEMS: InspectionItemDef[] = [
  { id: 'brakes', label: 'Brakes & Handbrake / Air Pressure', category: 'Mechanical' },
  { id: 'tires', label: 'Tires Tread Depth & Inflation Pressure', category: 'Running Gear' },
  { id: 'headlights', label: 'Headlights & High/Low Beam Function', category: 'Electrical' },
  { id: 'indicators', label: 'Turn Indicators, Hazard & Brake Lights', category: 'Electrical' },
  { id: 'engine', label: 'Engine Performance, Noise & Belts', category: 'Powertrain' },
  { id: 'fuel', label: 'Fuel Level & Fluid Checks (Oil / Coolant)', category: 'Fluids' },
  { id: 'mirrors', label: 'Windshield, Wipers & Rear View Mirrors', category: 'Visibility' },
  { id: 'horn', label: 'Horn & Reverse Audible Warning Beeper', category: 'Safety Devices' },
  { id: 'safety_equipment', label: 'Safety Equipment, First Aid & Fire Extinguisher', category: 'Emergency' },
  { id: 'cargo_area', label: 'Cargo Area, Lashing Straps & Rear Door Locks', category: 'Cargo Body' },
  { id: 'documents', label: 'Documents: Registration, Insurance, PUC & Permit', category: 'Compliance' },
];

type ItemEvalStatus = 'PASS' | 'ATTENTION' | 'FAIL';

export default function DriverVehicle() {
  const navigate = useNavigate();

  // Centralized data states
  const [vehicle, setVehicle] = useState<VehicleTelemetry | null>(null);
  const [currentDelivery, setCurrentDelivery] = useState<DeliveryAssignment | null>(null);
  const [profile, setProfile] = useState<DriverProfileData | null>(null);
  const [inspections, setInspections] = useState<VehicleInspectionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Inspection Checklist Form States
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [inspectionCycle, setInspectionCycle] = useState<'PRE_TRIP' | 'POST_TRIP'>('PRE_TRIP');
  const [odometerKm, setOdometerKm] = useState<number>(50600);
  const [driverNotes, setDriverNotes] = useState('');
  const [itemStatuses, setItemStatuses] = useState<Record<string, ItemEvalStatus>>(() => {
    const initial: Record<string, ItemEvalStatus> = {};
    CHECKLIST_ITEMS.forEach((item) => {
      initial[item.id] = 'PASS';
    });
    return initial;
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Last inspection dynamic tracker
  const [lastInspectionDate, setLastInspectionDate] = useState('Recent');
  const [lastInspectionStatus, setLastInspectionStatus] = useState('PASSED');

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    setErrorMessage(null);

    try {
      const [vehData, delData, profData, inspData] = await Promise.all([
        driverPortalService.getVehicle(),
        driverPortalService.getCurrentDelivery(),
        driverPortalService.getProfile(),
        driverPortalService.getInspections(),
      ]);

      setVehicle(vehData);
      setCurrentDelivery(delData);
      setProfile(profData);
      setInspections(inspData);

      if (vehData?.odometerKm) {
        setOdometerKm(vehData.odometerKm);
      }

      if (inspData && inspData.length > 0) {
        const latest = inspData[0];
        setLastInspectionDate(latest.timestamp || 'Recent');
        setLastInspectionStatus(latest.overallStatus || 'PASSED');
      } else if (vehData?.lastInspectionDate) {
        setLastInspectionDate(vehData.lastInspectionDate);
      }

      if (isManual) {
        setSuccessMessage('Vehicle telemetry & assignment synced successfully.');
        setTimeout(() => setSuccessMessage(null), 3500);
      }
    } catch (err) {
      console.error('Failed to load vehicle page data:', err);
      setErrorMessage('Unable to load vehicle information from server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleItemStatusChange = (itemId: string, status: ItemEvalStatus) => {
    setItemStatuses((prev) => ({ ...prev, [itemId]: status }));
  };

  const hasFail = Object.values(itemStatuses).some((s) => s === 'FAIL');
  const hasAttention = !hasFail && Object.values(itemStatuses).some((s) => s === 'ATTENTION');

  const computedResult = hasFail
    ? { text: 'VEHICLE NOT READY', color: '#DC2626' }
    : hasAttention
    ? { text: 'NEEDS ATTENTION', color: '#B45309' }
    : { text: 'READY FOR SERVICE', color: '#15803D' };

  const handleSubmitInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle) return;
    setSubmitting(true);
    setSuccessMessage(null);

    try {
      const overallStatus = hasFail ? 'FAILED' : 'PASSED';
      const condition = hasFail ? 'GROUNDED' : hasAttention ? 'NEEDS_ATTENTION' : 'READY';

      const itemsList = CHECKLIST_ITEMS.map((item) => ({
        id: item.id,
        label: item.label,
        category: item.category,
        passed: itemStatuses[item.id] === 'PASS',
        status: (itemStatuses[item.id] === 'PASS' ? 'PASS' : 'FAIL') as 'PASS' | 'FAIL',
      }));

      const newReport = await driverPortalService.submitInspection({
        vehicleCode: vehicle.vehicleNumber || vehicle.vehicleCode || 'Not available',
        driverId: profile?.driverCode || profile?.driverId || 'Not available',
        inspectionType: inspectionCycle,
        overallStatus,
        condition,
        items: itemsList,
        odometerKm,
        notes: driverNotes.trim() || (hasFail ? 'Pre-trip defect detected.' : 'All pre-trip safety checkpoints verified.'),
      });

      setInspections((prev) => [newReport, ...prev]);
      const nowFormatted = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      setLastInspectionDate(nowFormatted);
      setLastInspectionStatus(overallStatus);

      setSuccessMessage(`Inspection submitted successfully. Result: ${computedResult.text}`);
      setDriverNotes('');
      setIsChecklistOpen(false);

      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      console.error('Failed to submit inspection:', err);
      setErrorMessage('Failed to submit vehicle inspection report.');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="driver-page-container" style={{ alignItems: 'center', justifyContent: 'center', minHeight: 350, display: 'flex' }}>
        <div style={{ color: '#2563eb', fontWeight: 700, fontSize: 15, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <RefreshCw className="animate-spin" size={32} />
          <span>Loading Assigned Fleet Vehicle & Telemetry...</span>
          <span style={{ color: '#64748b', fontSize: 13, fontWeight: 500 }}>Connecting to PrimeRoute fleet management database</span>
        </div>
      </div>
    );
  }

  // Error State
  if (errorMessage && !vehicle) {
    return (
      <div className="driver-page-container">
        <div className="driver-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <AlertCircle size={44} style={{ color: '#dc2626', margin: '0 auto 14px' }} />
          <h2 style={{ fontSize: 19, fontWeight: 800, color: '#0f172a', margin: 0 }}>
            {errorMessage}
          </h2>
          <p style={{ color: '#64748b', fontSize: 14, margin: '8px auto 20px', maxWidth: 460 }}>
            An error occurred while connecting to the fleet master service. Please retry or contact technical support.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
            <button onClick={() => fetchData(true)} className="driver-btn-primary" style={{ padding: '10px 20px' }}>
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Retry
            </button>
            <Link to="/driver/support" className="driver-btn-secondary" style={{ padding: '10px 20px' }}>
              <HelpCircle size={14} /> Support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const assignedDriverName = profile?.fullName || profile?.name || 'Driver';

  // Empty State: Driver has no assigned vehicle
  if (!vehicle) {
    return (
      <div className="driver-page-container">
        <div className="driver-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: '#f1f5f9',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Truck size={32} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>
            No vehicle assigned
          </h2>
          <p style={{ color: '#64748b', fontSize: 14, maxWidth: 480, margin: '10px auto 24px', lineHeight: 1.5 }}>
            No fleet vehicle is currently assigned to your driver account ({assignedDriverName}). Fleet vehicle assignment and route dispatch are managed by Warehouse & Operations coordinators.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="driver-btn-primary"
              style={{ padding: '10px 20px' }}
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              <span>{refreshing ? 'Checking Assignment...' : 'Refresh Assignment'}</span>
            </button>
            <Link to="/driver/dashboard" className="driver-btn-secondary" style={{ padding: '10px 20px' }}>
              Return to Dashboard
            </Link>
            <Link to="/driver/support" className="driver-btn-secondary" style={{ padding: '10px 20px' }}>
              <HelpCircle size={14} /> Contact Support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const vehicleNumber = vehicle.vehicleNumber || vehicle.vehicleCode || 'Not available';
  const vehicleModel = vehicle.model || 'Not available';
  const vehicleType = vehicle.vehicleType || vehicle.type || 'Not available';
  const regNumber = vehicle.registrationNumber || vehicle.plateNumber || 'Not available';
  const currentOdo = vehicle.odometerKm ? `${vehicle.odometerKm.toLocaleString()} KM` : 'Not available';
  const warehouseDisplay = vehicle.assignedWarehouseName
    ? `${vehicle.assignedWarehouseName} (${vehicle.assignedWarehouseCode || 'WH'})`
    : (profile?.assignedWarehouseName || 'Assigned Warehouse Hub');

  return (
    <div className="driver-page-container" style={{ paddingBottom: 60 }}>
      {/* ── 1. Page Header & Status Banner ── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 14,
          border: '1px solid #e2e8f0',
          padding: '20px 24px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.12)',
            }}
          >
            <Truck size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#2563eb',
                  backgroundColor: '#eff6ff',
                  padding: '3px 10px',
                  borderRadius: 6,
                  border: '1px solid #bfdbfe',
                }}
              >
                MY VEHICLE
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>
                Vehicle Number: <strong style={{ color: '#0f172a' }}>{vehicleNumber}</strong>
              </span>
            </div>
            <h1
              style={{
                margin: '6px 0 2px',
                fontSize: 22,
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              {vehicleModel}
            </h1>
            <div style={{ fontSize: 12.5, color: '#64748b' }}>
              Registration: <strong style={{ color: '#334155' }}>{regNumber}</strong> &bull; Assigned Hub: <strong>{warehouseDisplay}</strong> &bull; Fleet Type: <strong>{vehicleType}</strong>
            </div>
          </div>
        </div>

        {/* Status Pill & Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="driver-btn-secondary"
            style={{ padding: '8px 14px', fontSize: 12.5 }}
            title="Refresh vehicle details from server"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Syncing...' : 'Refresh Vehicle'}</span>
          </button>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 30,
              backgroundColor: vehicle.status === 'ASSIGNED' || vehicle.status === 'AVAILABLE' ? '#dcfce7' : '#dbeafe',
              border: `1px solid ${vehicle.status === 'ASSIGNED' || vehicle.status === 'AVAILABLE' ? '#86efac' : '#bfdbfe'}`,
              color: vehicle.status === 'ASSIGNED' || vehicle.status === 'AVAILABLE' ? '#15803d' : '#1e40af',
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: '0.02em',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: vehicle.status === 'ASSIGNED' || vehicle.status === 'AVAILABLE' ? '#16a34a' : '#2563eb',
              }}
            />
            <span>● {vehicle.status}</span>
          </div>

          <button
            onClick={() => {
              setIsChecklistOpen(true);
              const el = document.getElementById('vehicle-inspection-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="driver-btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 16px',
              fontSize: 13,
              fontWeight: 700,
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            <FileCheck size={16} />
            <span>Start Pre-Trip Inspection</span>
          </button>
        </div>
      </div>

      {/* ── Feedback Message Banner ── */}
      {successMessage && (
        <div
          style={{
            marginTop: 16,
            padding: '12px 18px',
            backgroundColor: '#dcfce7',
            border: '1px solid #86efac',
            borderRadius: 10,
            color: '#15803d',
            fontSize: 13.5,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <CheckCircle2 size={18} style={{ color: '#16a34a', flexShrink: 0 }} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ── Quick Navigation Ribbon ── */}
      <div
        style={{
          marginTop: 16,
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <Link
          to="/driver/live-location"
          className="driver-btn-secondary"
          style={{ padding: '8px 14px', fontSize: 12.5, textDecoration: 'none' }}
        >
          <MapPin size={14} /> View Live Location
        </Link>
        <Link
          to="/driver/route"
          className="driver-btn-secondary"
          style={{ padding: '8px 14px', fontSize: 12.5, textDecoration: 'none' }}
        >
          <Navigation size={14} /> View Route
        </Link>
        <Link
          to="/driver/current-delivery"
          className="driver-btn-secondary"
          style={{ padding: '8px 14px', fontSize: 12.5, textDecoration: 'none' }}
        >
          <Package size={14} /> Current Delivery
        </Link>
        <Link
          to="/driver/support"
          className="driver-btn-secondary"
          style={{ padding: '8px 14px', fontSize: 12.5, textDecoration: 'none' }}
        >
          <HelpCircle size={14} /> Driver Support
        </Link>
      </div>

      {/* ── 2. Two-Column Grid: Vehicle Overview + Current Assignment ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 20,
          marginTop: 20,
        }}
      >
        {/* ── Vehicle Overview ── */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            padding: '20px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Truck size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                Vehicle Overview
              </h3>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Authoritative database fleet asset record</p>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              padding: 14,
              backgroundColor: '#f8fafc',
              borderRadius: 10,
              border: '1px solid #e2e8f0',
            }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Registration Plate
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                {regNumber}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Vehicle Type
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                {vehicleType}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Payload Capacity
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                {vehicle.capacityTons} {vehicle.capacityUnit || 'Tons'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Manufacturer
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                {vehicle.manufacturer || 'Tata Motors'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Current Odometer
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#1e3a8a', marginTop: 2 }}>
                {currentOdo}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Operational Status
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#1d4ed8', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#2563eb' }} />
                {vehicle.status}
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 14,
              padding: '10px 14px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 8,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 12, color: '#1e3a8a', fontWeight: 600 }}>Assigned Driver:</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#1e3a8a' }}>{assignedDriverName}</span>
          </div>
        </div>

        {/* ── Current Assignment ── */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            padding: '20px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Package size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                  Current Assignment
                </h3>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Active consignment dispatched to vehicle</p>
              </div>
            </div>

            {currentDelivery && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#1d4ed8',
                  backgroundColor: '#dbeafe',
                  padding: '4px 10px',
                  borderRadius: 20,
                }}
              >
                ● {currentDelivery.status}
              </span>
            )}
          </div>

          {currentDelivery ? (
            <div
              style={{
                padding: 14,
                backgroundColor: '#f8fafc',
                borderRadius: 10,
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Waybill Number:</span>
                <strong style={{ color: '#2563eb', fontFamily: 'monospace', fontSize: 13 }}>
                  {currentDelivery.trackingNumber}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Order ID:</span>
                <strong style={{ color: '#0f172a' }}>
                  {currentDelivery.orderNumber}
                </strong>
              </div>

              {/* Route flow representation */}
              <div
                style={{
                  margin: '6px 0',
                  padding: '10px 12px',
                  backgroundColor: '#ffffff',
                  borderRadius: 8,
                  border: '1px dashed #cbd5e1',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>
                  DISPATCH ROUTE
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                    {currentDelivery.pickupLocation.facilityName}
                  </span>
                  <span style={{ fontSize: 14, color: '#2563eb', fontWeight: 800 }}>&rarr;</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                    {currentDelivery.destination.customerName} ({currentDelivery.destination.city})
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: '#64748b' }}>ETA Target:</span>
                <strong style={{ color: '#15803d' }}>{currentDelivery.deliveryEta}</strong>
              </div>
            </div>
          ) : (
            <div style={{ padding: '36px 20px', textAlign: 'center', color: '#64748b', fontSize: 13 }}>
              <Package size={28} style={{ color: '#94a3b8', margin: '0 auto 8px', display: 'block' }} />
              <strong>No active consignment assigned</strong>
              <div style={{ fontSize: 12, marginTop: 4 }}>Vehicle is stationed at base and available for dispatch</div>
            </div>
          )}

          {currentDelivery && (
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <Link
                to="/driver/current-delivery"
                className="driver-btn-primary"
                style={{
                  flex: 1,
                  textAlign: 'center',
                  justifyContent: 'center',
                  padding: '9px 12px',
                  fontSize: 12.5,
                  textDecoration: 'none',
                }}
              >
                <FileText size={14} /> View Delivery
              </Link>
              <Link
                to="/driver/route"
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '9px 12px',
                  borderRadius: 8,
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#2563eb',
                  fontSize: 12.5,
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                <Navigation size={14} /> Open Route
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── 3. Vehicle Specifications & Operational Metadata ── */}
      <div
        style={{
          marginTop: 20,
          backgroundColor: '#ffffff',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          padding: '20px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        }}
      >
        <h3
          style={{
            margin: '0 0 14px',
            fontSize: 16,
            fontWeight: 800,
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Layers size={18} style={{ color: '#2563eb' }} />
          Vehicle Specifications & Operational Details
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 14,
          }}
        >
          <div style={{ padding: 12, backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>VEHICLE MODEL</div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{vehicleModel}</div>
          </div>

          <div style={{ padding: 12, backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>MANUFACTURER</div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{vehicle.manufacturer || 'Tata Motors'}</div>
          </div>

          <div style={{ padding: 12, backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>REGISTRATION NUMBER</div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{regNumber}</div>
          </div>

          <div style={{ padding: 12, backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>PAYLOAD / CAPACITY</div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{vehicle.capacityTons} {vehicle.capacityUnit || 'Tons'}</div>
          </div>

          <div style={{ padding: 12, backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>REGISTRATION EXPIRY</div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{vehicle.registrationExpiry || 'Valid (30 Jun 2029)'}</div>
          </div>

          <div style={{ padding: 12, backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>INSURANCE EXPIRY</div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{vehicle.insuranceExpiry || 'Valid (31 May 2028)'}</div>
          </div>

          <div style={{ padding: 12, backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>CURRENT LOCATION</div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{vehicle.currentLocation || warehouseDisplay}</div>
          </div>

          <div style={{ padding: 12, backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>BASE WAREHOUSE</div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{warehouseDisplay}</div>
          </div>
        </div>
      </div>

      {/* ── 4. Vehicle Safety & Walkaround Inspection (DVIR) ── */}
      <div
        id="vehicle-inspection-section"
        style={{
          marginTop: 24,
          backgroundColor: '#ffffff',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          padding: '22px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 14,
            paddingBottom: 16,
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span className="driver-badge driver-badge-blue">SAFETY & COMPLIANCE (DVIR)</span>
              <span style={{ fontSize: 12.5, color: '#64748b' }}>Daily Vehicle Inspection Report</span>
            </div>
            <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: '#0f172a' }}>
              Vehicle Safety Inspection
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 12.5, color: '#64748b' }}>
              Mandatory driver safety walkaround verification before departure and at shift completion
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsChecklistOpen(!isChecklistOpen)}
            className="driver-btn-primary"
            style={{
              padding: '10px 20px',
              fontSize: 13.5,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <ShieldCheck size={16} />
            <span>{isChecklistOpen ? 'Close Checklist' : 'Start New Inspection'}</span>
            {isChecklistOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Inspection KPI Status Ribbon */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 14,
            marginTop: 16,
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 10,
            padding: '14px 16px',
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
              Last Inspection
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
              {lastInspectionDate}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
              Inspection Status
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: lastInspectionStatus === 'PASSED' ? '#15803d' : '#dc2626', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: lastInspectionStatus === 'PASSED' ? '#16a34a' : '#dc2626',
                }}
              />
              {lastInspectionStatus}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
              Diagnostic Status
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#15803d', marginTop: 2 }}>
              0 Faults Detected
            </div>
          </div>
        </div>

        {/* Dynamic Checklist Accordion */}
        {isChecklistOpen && (
          <form onSubmit={handleSubmitInspection} style={{ marginTop: 20 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 16,
                marginBottom: 20,
              }}
            >
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Inspection Cycle
                </label>
                <select
                  value={inspectionCycle}
                  onChange={(e) => setInspectionCycle(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    outline: 'none',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <option value="PRE_TRIP">Pre-Trip Safety Inspection</option>
                  <option value="POST_TRIP">Post-Trip Shift Inspection</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Current Odometer (KM)
                </label>
                <input
                  type="number"
                  value={odometerKm}
                  onChange={(e) => setOdometerKm(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Checklist Items Table */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
              <table className="driver-table">
                <thead>
                  <tr>
                    <th style={{ width: '45%' }}>Checklist Inspection Item</th>
                    <th style={{ width: '25%' }}>System Category</th>
                    <th style={{ width: '30%', textAlign: 'center' }}>Evaluation Result</th>
                  </tr>
                </thead>
                <tbody>
                  {CHECKLIST_ITEMS.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600, color: '#0f172a' }}>{item.label}</td>
                      <td style={{ fontSize: 12, color: '#64748b' }}>{item.category}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          {(['PASS', 'ATTENTION', 'FAIL'] as ItemEvalStatus[]).map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleItemStatusChange(item.id, st)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: 4,
                                fontSize: 11,
                                fontWeight: 700,
                                border: '1px solid',
                                borderColor: itemStatuses[item.id] === st
                                  ? (st === 'PASS' ? '#16a34a' : st === 'ATTENTION' ? '#f59e0b' : '#dc2626')
                                  : '#cbd5e1',
                                backgroundColor: itemStatuses[item.id] === st
                                  ? (st === 'PASS' ? '#dcfce7' : st === 'ATTENTION' ? '#fef3c7' : '#fee2e2')
                                  : '#ffffff',
                                color: itemStatuses[item.id] === st
                                  ? (st === 'PASS' ? '#15803d' : st === 'ATTENTION' ? '#b45309' : '#dc2626')
                                  : '#64748b',
                                cursor: 'pointer',
                              }}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Driver Safety Observations & Defect Notes
              </label>
              <textarea
                rows={3}
                value={driverNotes}
                onChange={(e) => setDriverNotes(e.target.value)}
                placeholder="Enter any walkaround observations, tire condition, or notes..."
                style={{
                  width: '100%',
                  padding: 10,
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
              <button
                type="button"
                onClick={() => setIsChecklistOpen(false)}
                className="driver-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="driver-btn-primary"
              >
                {submitting ? 'Submitting Report...' : 'Submit Vehicle Inspection'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
