import React, { useState, useEffect, useRef } from 'react';
import Drawer from '../common/Drawer';
import StatusBadge from '../common/StatusBadge';
import type { AdminShipment } from '../../types/adminShipment';
import adminShipmentService from '../../services/adminShipmentService';
import shipmentService from '../../services/shipmentService';
import { useAuth } from '../../context/AuthContext';
import {
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  Edit3,
  RefreshCw,
  AlertCircle,
  Package,
  UserCheck,
  Truck,
  ShieldAlert,
  Warehouse,
  Building2,
  MoreVertical,
} from 'lucide-react';
import Modal from '../common/Modal';
import driverService from '../../services/driverService';
import vehicleService from '../../services/vehicleService';
import type { AdminDriver } from '../../types/adminDriver';
import type { Vehicle } from '../../types/vehicle';

interface ShipmentDetailDrawerProps {
  shipment: any | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatusClick?: (shipment: any) => void;
  onShipmentUpdated?: (shipment: any) => void;
  onAssignVehicleClick?: (shipment: any) => void;
  onAssignDriverClick?: (shipment: any) => void;
}

export default function ShipmentDetailDrawer({
  shipment,
  isOpen,
  onClose,
  onUpdateStatusClick,
  onShipmentUpdated,
  onAssignVehicleClick,
  onAssignDriverClick,
}: ShipmentDetailDrawerProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // Local state for full milestone telemetry and rich fields
  const [details, setDetails] = useState<any | null>(shipment);
  const [loadingMilestones, setLoadingMilestones] = useState(false);
  const [milestoneError, setMilestoneError] = useState<string | null>(null);

  // Keep track of which shipment ID we loaded
  const lastFetchedIdRef = useRef<number | string | null>(null);

  // Secondary More menu state (Admin only)
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Override Assignment Modal state (Admin only)
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [overrideDrivers, setOverrideDrivers] = useState<AdminDriver[]>([]);
  const [overrideVehicles, setOverrideVehicles] = useState<Vehicle[]>([]);
  const [loadingOverrideFleet, setLoadingOverrideFleet] = useState(false);
  const [selectedOverrideDriverId, setSelectedOverrideDriverId] = useState<number | ''>('');
  const [selectedOverrideVehicleId, setSelectedOverrideVehicleId] = useState<number | ''>('');
  const [overrideReason, setOverrideReason] = useState('');
  const [isSubmittingOverride, setIsSubmittingOverride] = useState(false);
  const [overrideError, setOverrideError] = useState<string | null>(null);
  const [overrideSuccess, setOverrideSuccess] = useState<string | null>(null);

  // Close more menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    if (isMoreMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMoreMenuOpen]);

  const handleOpenOverrideModal = async () => {
    setIsMoreMenuOpen(false);
    setIsOverrideModalOpen(true);
    setOverrideError(null);
    setOverrideSuccess(null);
    setOverrideReason('');
    setSelectedOverrideDriverId(active.driverId || '');
    setSelectedOverrideVehicleId(active.vehicleId || '');
    setLoadingOverrideFleet(true);

    try {
      const [drivers, vehicles] = await Promise.all([
        driverService.getAllDrivers(),
        vehicleService.getAllVehicles(),
      ]);
      setOverrideDrivers(drivers.filter((d) => d.status !== 'INACTIVE'));
      setOverrideVehicles(vehicles.filter((v) => v.status !== 'INACTIVE' && v.status !== 'MAINTENANCE'));
    } catch (err: any) {
      console.error('Failed to load fleet for override:', err);
      setOverrideError('Failed to load available fleet. Please retry.');
    } finally {
      setLoadingOverrideFleet(false);
    }
  };

  const handleConfirmOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOverrideDriverId || !selectedOverrideVehicleId) {
      setOverrideError('Please select both a driver and a vehicle.');
      return;
    }
    if (!overrideReason.trim()) {
      setOverrideError('Override justification reason is required.');
      return;
    }

    setIsSubmittingOverride(true);
    setOverrideError(null);
    try {
      const updated = await adminShipmentService.overrideAssignment(active.id || active.shipmentId, {
        driverId: Number(selectedOverrideDriverId),
        vehicleId: Number(selectedOverrideVehicleId),
        reason: overrideReason.trim(),
      });
      setDetails(updated);
      setOverrideSuccess('Fleet assignment overridden successfully.');
      if (onShipmentUpdated) {
        onShipmentUpdated(updated);
      }
      setTimeout(() => {
        setIsOverrideModalOpen(false);
        setOverrideSuccess(null);
      }, 1200);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to override fleet assignment.';
      setOverrideError(msg);
    } finally {
      setIsSubmittingOverride(false);
    }
  };

  const loadShipmentData = (targetId: number | string, isRetry = false) => {
    setLoadingMilestones(true);
    setMilestoneError(null);

    const fetchPromise = isAdmin
      ? adminShipmentService.getShipmentById(targetId)
      : shipmentService.getShipmentDetails(targetId);

    fetchPromise
      .then((fullData: any) => {
        if (fullData) {
          setDetails((prev: any) => (prev ? { ...prev, ...fullData } : fullData));
          setMilestoneError(null);
        }
      })
      .catch((err: any) => {
        console.warn('Could not load extra shipment details:', err);
        setMilestoneError('Tracking history is currently unavailable.');
      })
      .finally(() => {
        setLoadingMilestones(false);
      });
  };

  // Sync initial row data immediately when opened or selected shipment changes
  useEffect(() => {
    if (!isOpen || !shipment) {
      return;
    }

    setDetails(shipment);
    setMilestoneError(null);

    const targetId = shipment.id || shipment.shipmentId;
    if (!targetId) return;

    // If events and full addresses are already fully available, no need to refetch
    if (shipment.events && shipment.events.length > 0 && (shipment.originWarehouseName || shipment.warehouseName)) {
      lastFetchedIdRef.current = targetId;
      setLoadingMilestones(false);
      return;
    }

    // Avoid duplicate fetch for identical ID
    if (lastFetchedIdRef.current === targetId) {
      return;
    }

    lastFetchedIdRef.current = targetId;
    loadShipmentData(targetId);
  }, [isOpen, shipment?.id, shipment?.shipmentId, isAdmin]);

  if (!shipment && !details) return null;

  const active = details || shipment || {};

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const retryLoadMilestones = () => {
    const targetId = active.id || active.shipmentId || shipment?.id || shipment?.shipmentId;
    if (targetId) {
      loadShipmentData(targetId, true);
    }
  };

  // Unified Field Resolvers
  const trackingNumber = active.trackingNumber || '—';
  const orderNumber = active.orderNumber || '—';
  const status = active.status || 'CONFIRMED';
  const deliveryType = active.deliveryType ? active.deliveryType.replace(/_/g, ' ') : 'STANDARD';

  const driverName = active.driverName || active.assignedDriver || (typeof active.driver === 'string' ? active.driver : active.driver?.fullName) || null;
  const driverPhone = active.driverPhone || (active.driver?.phone) || null;
  const driverCode = active.driverCode || (active.driver?.licenseNumber) || null;
  const driverStatus = active.driverStatus || (active.driver?.status) || null;

  const vehicleNumber = active.vehicleNumber || (typeof active.vehicle === 'string' ? active.vehicle : active.vehicle?.vehicleNumber) || null;
  const vehicleModel = active.vehicleModel || (active.vehicle?.model) || null;
  const vehicleType = active.vehicleType || (active.vehicle?.vehicleType) || null;
  const vehicleReg = active.vehicleRegistrationNumber || active.vehicleReg || (active.vehicle?.registrationNumber) || null;

  const isAssigned = !!(vehicleNumber || driverName);

  const originWhName = active.originWarehouseName || active.warehouseName || (active.originWarehouse?.warehouseName) || (active.origin || active.pickupCity ? `${active.origin || active.pickupCity} Warehouse Hub` : 'Central Logistics Hub');
  const originWhCode = active.originWarehouseCode || active.warehouseCode || (active.originWarehouse?.warehouseCode) || '—';
  const whManagerName = active.warehouseManagerName || (active.originWarehouse?.managerName) || (isAssigned ? 'Warehouse Manager' : 'Not Assigned');
  const whManagerEmail = active.warehouseManagerEmail || (active.originWarehouse?.managerEmail) || '—';

  const assignedByLabel = active.assignedBy || (isAssigned || status === 'DELIVERED' ? (originWhName ? `${originWhName} Manager` : 'Warehouse Operations') : 'Warehouse Operations (Pending)');
  const assignmentStatus = active.assignmentStatus || (status === 'DELIVERED' ? 'Completed / Delivered' : (isAssigned ? 'Assigned' : 'Awaiting Warehouse Assignment'));

  const customerName = active.customerName || (active.customer ? (typeof active.customer === 'string' ? active.customer : active.customer.fullName) : '') || '—';
  const customerEmail = active.customerEmail || (active.customer?.email) || '';

  const pickupAddress = active.pickupAddress || active.pickup?.addressText || active.originName || (active.pickupCity ? `${active.pickupCity}, ${active.pickupState || ''}` : '—');
  const deliveryAddress = active.deliveryAddress || active.delivery?.addressText || active.destinationAddress || active.destination || (active.deliveryCity ? `${active.deliveryCity}, ${active.deliveryState || ''}` : '—');

  const expectedDelivery = active.estimatedDeliveryDate || active.expectedDelivery;
  const events = active.events || active.trackingEvents || active.timeline || [];
  const pod = active.proofOfDelivery || null;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Shipment Details — ${trackingNumber}`}
      subtitle={`Associated Order #${orderNumber} · Created ${formatDate(active.createdAt)}`}
      size="lg"
      footer={
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <button className="btn btn-dark btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Top Identity Strip */}
        <div
          style={{
            background: 'var(--page-bg)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Tracking Number
            </span>
            <h3
              style={{
                fontSize: 20,
                fontWeight: 700,
                fontFamily: 'monospace',
                color: 'var(--primary)',
                margin: '2px 0 0',
              }}
            >
              {trackingNumber}
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }} ref={moreMenuRef}>
            <StatusBadge status={status} />

            {/* More Menu (Admin Only) */}
            {isAdmin && (
              <>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setIsMoreMenuOpen((prev) => !prev)}
                  title="More Actions"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '6px 10px',
                    fontSize: 12,
                    borderRadius: 'var(--radius)',
                  }}
                >
                  <MoreVertical size={15} />
                  <span>More</span>
                </button>

                {isMoreMenuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: 6,
                      background: 'var(--card-bg)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                      minWidth: 190,
                      zIndex: 50,
                      overflow: 'hidden',
                      padding: '4px 0',
                    }}
                  >
                    <button
                      type="button"
                      onClick={handleOpenOverrideModal}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 14px',
                        fontSize: 13,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: 'none',
                        border: 'none',
                        color: '#b45309',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#fffbeb')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    >
                      <ShieldAlert size={14} color="#d97706" />
                      <span>Override Assignment</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Operational Assignment Information ── */}
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '18px 20px',
            background: isAssigned ? 'rgba(37, 99, 235, 0.02)' : 'var(--card-bg)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 10,
              paddingBottom: 12,
              borderBottom: '1px solid var(--border)',
              marginBottom: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Building2 size={16} color="var(--primary)" />
              <h4
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  margin: 0,
                }}
              >
                ASSIGNMENT
              </h4>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Assignment Status:</span>
              <span
                className={`badge ${isAssigned || status === 'DELIVERED' ? 'badge-success' : 'badge-amber'}`}
                style={{ fontSize: 11, fontWeight: 700 }}
              >
                {assignmentStatus}
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 14,
              fontSize: 13,
            }}
          >
            {/* Driver Info */}
            <div style={{ background: 'var(--page-bg)', padding: '12px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
                <UserCheck size={13} color="var(--primary)" /> Driver
              </div>
              <strong style={{ fontSize: 14, color: driverName ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {driverName || 'Not Assigned'}
              </strong>
              {driverPhone && (
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>
                  📞 {driverPhone}
                </div>
              )}
              {driverStatus && (
                <div style={{ marginTop: 6 }}>
                  <StatusBadge status={driverStatus} />
                </div>
              )}
            </div>

            {/* Vehicle Info */}
            <div style={{ background: 'var(--page-bg)', padding: '12px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
                <Truck size={13} color="var(--primary)" /> Vehicle
              </div>
              <strong className="font-mono" style={{ fontSize: 14, color: vehicleNumber ? 'var(--primary)' : 'var(--text-muted)' }}>
                {vehicleNumber || 'Not Assigned'}
              </strong>
              {vehicleModel && (
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>
                  {vehicleModel} {vehicleType ? `· ${vehicleType.replace(/_/g, ' ')}` : ''}
                </div>
              )}
              {vehicleReg && (
                <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  Plate: {vehicleReg}
                </div>
              )}
            </div>

            {/* Assigned By & Time */}
            <div style={{ background: 'var(--page-bg)', padding: '12px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
                Assigned By
              </div>
              <strong style={{ color: 'var(--text-primary)', fontSize: 13, display: 'block' }}>
                {assignedByLabel}
              </strong>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                Assigned At:
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
                {active.assignedAt ? formatDateTime(active.assignedAt) : (isAssigned ? formatDateTime(active.updatedAt || active.createdAt) : '—')}
              </span>
            </div>
          </div>
        </div>

        {/* ── Order, Fulfillment, & Delivery Cards ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {/* 1. ORDER & CUSTOMER DETAILS */}
          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              background: 'var(--card-bg)',
            }}
          >
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', margin: '0 0 12px', letterSpacing: '0.04em' }}>
              Order & Customer Details
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Order Number:</span>{' '}
                <strong className="font-mono" style={{ color: 'var(--primary)' }}>#{orderNumber}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Customer:</span>{' '}
                <strong style={{ color: 'var(--text-primary)' }}>{customerName}</strong>
                {customerEmail && (
                  <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {customerEmail}
                  </div>
                )}
              </div>
              {active.packageDescription && (
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Package Details:</span>{' '}
                  <div style={{ fontSize: 12, color: 'var(--text-primary)', marginTop: 2, fontWeight: 500 }}>
                    {active.packageDescription}
                    {active.packageWeight ? ` · ${active.packageWeight} kg` : ''}
                    {active.packageQuantity ? ` · Qty: ${active.packageQuantity}` : ''}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. FULFILLMENT (ORIGIN WAREHOUSE) */}
          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              background: 'var(--card-bg)',
            }}
          >
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', margin: '0 0 12px', letterSpacing: '0.04em' }}>
              Fulfillment
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Origin Warehouse:</span>{' '}
                <strong style={{ color: 'var(--text-primary)', display: 'block' }}>
                  {originWhName}
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Warehouse Code:</span>{' '}
                <span className="badge badge-slate" style={{ fontSize: 11, fontWeight: 700 }}>
                  {originWhCode}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Warehouse Manager:</span>{' '}
                <strong style={{ color: 'var(--text-primary)', display: 'block' }}>
                  {whManagerName}
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Manager Email:</span>{' '}
                <span className="font-mono" style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block' }}>
                  {whManagerEmail}
                </span>
              </div>
            </div>
          </div>

          {/* 3. DELIVERY */}
          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              background: 'var(--card-bg)',
            }}
          >
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', margin: '0 0 12px', letterSpacing: '0.04em' }}>
              Delivery
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Destination:</span>{' '}
                <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.4 }}>
                  {deliveryAddress}
                </p>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Delivery Type:</span>{' '}
                <span className="badge badge-slate" style={{ fontSize: 11, marginLeft: 6 }}>
                  {deliveryType}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Current Status:</span>{' '}
                <StatusBadge status={status} />
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Expected Delivery:</span>{' '}
                <strong style={{ color: 'var(--text-primary)', display: 'block' }}>
                  {formatDate(expectedDelivery)}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Addresses Breakdown */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
          }}
        >
          <div
            style={{
              background: 'var(--page-bg)',
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <MapPin size={14} color="var(--primary)" />
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Origin Warehouse / Pickup Location
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4 }}>
              {pickupAddress}
            </p>
          </div>

          <div
            style={{
              background: 'var(--page-bg)',
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <MapPin size={14} color="var(--success)" />
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Delivery Destination Address
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4 }}>
              {deliveryAddress}
            </p>
          </div>
        </div>

        {/* Electronic Proof of Delivery (ePOD) Card */}
        {pod && (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.08) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={18} color="#059669" />
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                  Electronic Proof of Delivery (ePOD)
                </h4>
              </div>
              <span className="badge badge-success" style={{ fontSize: 11, fontWeight: 700 }}>
                Verified Handover
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 12,
                fontSize: 12,
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Recipient Name:</span>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginTop: 2 }}>
                  {pod.recipientName || customerName}
                </strong>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)' }}>Delivered By:</span>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginTop: 2 }}>
                  {pod.deliveredBy || driverName || 'Assigned Driver'}
                </strong>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)' }}>Delivered At:</span>
                <span style={{ color: 'var(--text-primary)', display: 'block', marginTop: 2, fontWeight: 500 }}>
                  {formatDateTime(pod.deliveredAt || active.updatedAt)}
                </span>
              </div>

              {pod.deliveryNotes && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Delivery Notes:</span>
                  <p style={{ margin: '2px 0 0', color: 'var(--text-primary)', fontStyle: 'italic' }}>
                    "{pod.deliveryNotes}"
                  </p>
                </div>
              )}
            </div>

            {pod.signatureData && (
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Recipient Signature Proof
                </span>
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: '8px 12px',
                    display: 'inline-block',
                    maxWidth: 240,
                  }}
                >
                  <img
                    src={pod.signatureData.startsWith('data:') ? pod.signatureData : `data:image/png;base64,${pod.signatureData}`}
                    alt="Recipient Signature"
                    style={{ maxHeight: 50, maxWidth: '100%', objectFit: 'contain' }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Checkpoint Milestones Timeline */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Milestone Telemetry Timeline
            </h4>
            {loadingMilestones && (
              <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <RefreshCw size={12} className="animate-spin" />
                Loading telemetry...
              </span>
            )}
          </div>

          {milestoneError ? (
            <div
              style={{
                padding: '12px 16px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: 'var(--radius)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger)', fontSize: 13 }}>
                <AlertCircle size={16} />
                <span>{milestoneError}</span>
              </div>
              <button className="btn btn-outline btn-sm" onClick={retryLoadMilestones}>
                Retry
              </button>
            </div>
          ) : events && events.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, paddingLeft: 8 }}>
              {events.map((ev: any, idx: number) => {
                const isLast = idx === events.length - 1;
                return (
                  <div key={ev.id || idx} style={{ display: 'flex', gap: 14, position: 'relative' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: ev.completed
                            ? 'var(--success)'
                            : ev.current
                            ? 'var(--primary)'
                            : '#e2e8f0',
                          color: '#ffffff',
                          zIndex: 2,
                          fontSize: 11,
                        }}
                      >
                        {ev.completed ? <CheckCircle2 size={14} /> : idx + 1}
                      </div>

                      {!isLast && (
                        <div
                          style={{
                            width: 2,
                            flex: 1,
                            minHeight: 36,
                            background: ev.completed ? 'var(--success)' : '#e2e8f0',
                            margin: '4px 0',
                          }}
                        />
                      )}
                    </div>

                    <div style={{ paddingBottom: isLast ? 0 : 20, flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                          {ev.title}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {formatDateTime(ev.eventTime)}
                        </span>
                      </div>

                      <p style={{ margin: '2px 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                        {ev.description}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                        <MapPin size={11} color="var(--primary)" />
                        <span>{ev.locationName}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : loadingMilestones ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              <RefreshCw size={16} className="animate-spin" style={{ margin: '0 auto 6px', display: 'block' }} />
              Loading milestone history...
            </div>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
              No milestone events logged yet.
            </p>
          )}
        </div>
      </div>

      {/* ── OVERRIDE SHIPMENT ASSIGNMENT MODAL (ADMIN ONLY) ── */}
      {isAdmin && (
        <Modal
          isOpen={isOverrideModalOpen}
          onClose={() => !isSubmittingOverride && setIsOverrideModalOpen(false)}
          title={`Override Shipment Assignment — ${trackingNumber}`}
          size="md"
        >
          <form onSubmit={handleConfirmOverride}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Current Assignment Box */}
              <div
                style={{
                  background: 'var(--page-bg)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  fontSize: 13,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Current Assignment
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Driver:</span>
                  <strong>{driverName || 'None (Unassigned)'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Vehicle:</span>
                  <strong className="font-mono">{vehicleNumber || 'None (Unassigned)'}</strong>
                </div>
              </div>

              {overrideError && (
                <div
                  style={{
                    padding: '10px 14px',
                    background: 'var(--danger-bg, #fee2e2)',
                    color: 'var(--danger, #b91c1c)',
                    borderRadius: 'var(--radius)',
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <span>{overrideError}</span>
                </div>
              )}

              {overrideSuccess && (
                <div
                  style={{
                    padding: '10px 14px',
                    background: 'var(--success-bg, #dcfce7)',
                    color: 'var(--success, #15803d)',
                    borderRadius: 'var(--radius)',
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
                  <span>{overrideSuccess}</span>
                </div>
              )}

              {/* Select Driver */}
              <div className="form-group">
                <label className="form-label form-label-required">
                  New Driver
                </label>
                <select
                  className="form-select"
                  value={selectedOverrideDriverId}
                  onChange={(e) => {
                    const dId = e.target.value ? Number(e.target.value) : '';
                    setSelectedOverrideDriverId(dId);
                    if (dId) {
                      const matchedVeh = overrideVehicles.find((v) => Number(v.driverId) === dId);
                      if (matchedVeh) {
                        setSelectedOverrideVehicleId(Number(matchedVeh.id));
                      }
                    }
                  }}
                  disabled={isSubmittingOverride || loadingOverrideFleet}
                  required
                >
                  <option value="">-- Select Driver --</option>
                  {overrideDrivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullName} — {d.phone} ({d.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Vehicle */}
              <div className="form-group">
                <label className="form-label form-label-required">
                  New Vehicle
                </label>
                <select
                  className="form-select"
                  value={selectedOverrideVehicleId}
                  onChange={(e) => {
                    const vId = e.target.value ? Number(e.target.value) : '';
                    setSelectedOverrideVehicleId(vId);
                    if (vId) {
                      const veh = overrideVehicles.find((v) => Number(v.id) === vId);
                      if (veh && veh.driverId) {
                        setSelectedOverrideDriverId(Number(veh.driverId));
                      }
                    }
                  }}
                  disabled={isSubmittingOverride || loadingOverrideFleet}
                  required
                >
                  <option value="">-- Select Vehicle --</option>
                  {overrideVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.vehicleNumber} — {v.model} ({v.registrationNumber}) [Cap: {v.capacity} {v.capacityUnit || 'TONS'}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Reason */}
              <div className="form-group">
                <label className="form-label form-label-required">
                  Reason for Override (Mandatory)
                </label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Enter detailed reason for administrator fleet reassignment..."
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  disabled={isSubmittingOverride}
                  required
                  style={{ resize: 'vertical' }}
                />
                <span className="text-xs text-muted" style={{ marginTop: 4, display: 'block' }}>
                  This justification will be permanently audited in the shipment milestone timeline.
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setIsOverrideModalOpen(false)}
                  disabled={isSubmittingOverride}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isSubmittingOverride || !selectedOverrideDriverId || !selectedOverrideVehicleId || !overrideReason.trim()}
                >
                  {isSubmittingOverride ? 'Confirming Override...' : 'Confirm Override'}
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </Drawer>
  );
}
