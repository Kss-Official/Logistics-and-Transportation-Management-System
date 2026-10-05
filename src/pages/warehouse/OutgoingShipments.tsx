import React, { useEffect, useState, useMemo } from 'react';
import {
  Search, RefreshCw, Eye, CheckCircle2,
  X, MapPin, Box, PlayCircle, Check, Send,
  Truck, UserCheck, AlertCircle, AlertTriangle,
  Radio, Navigation, Calendar, User, Phone, Mail
} from 'lucide-react';
import { warehousePortalService } from '../../services/warehousePortalService';
import type { WarehouseShipmentItem } from '../../types/warehousePortal';
import LiveShipmentTrackingModal from '../../components/warehouse/LiveShipmentTrackingModal';

// Helper to format float weights cleanly
const formatWeight = (weight?: number | null): string => {
  if (weight == null || isNaN(weight)) return '—';
  const rounded = parseFloat(Number(weight).toFixed(2));
  return `${rounded} kg`;
};

const formatItemWeight = (totalWeight?: number | null, unitWeight?: number | null, qty?: number): string => {
  if (totalWeight != null && !isNaN(totalWeight)) {
    return formatWeight(totalWeight);
  }
  if (unitWeight != null && qty != null && !isNaN(unitWeight)) {
    return formatWeight(unitWeight * qty);
  }
  return '—';
};

export default function OutgoingShipments() {
  const [shipments, setShipments] = useState<WarehouseShipmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [selectedShipment, setSelectedShipment] = useState<WarehouseShipmentItem | null>(null);
  const [trackingModalShipment, setTrackingModalShipment] = useState<WarehouseShipmentItem | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Assignment Modal State
  const [assignModalShipment, setAssignModalShipment] = useState<WarehouseShipmentItem | null>(null);
  const [availableDrivers, setAvailableDrivers] = useState<any[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<any[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<number | ''>('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | ''>('');
  const [isFleetLoading, setIsFleetLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  const loadShipments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await warehousePortalService.getOutgoingShipments();
      setShipments(Array.isArray(data) ? data : []);
      if (selectedShipment) {
        const updated = data.find((s) => s.id === selectedShipment.id);
        if (updated) setSelectedShipment(updated);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load outgoing shipments.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadShipments();
  }, []);

  // Lock body scroll when drawer or modal is open
  useEffect(() => {
    if (selectedShipment || assignModalShipment || trackingModalShipment) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [selectedShipment, assignModalShipment, trackingModalShipment]);

  // Operational Action Handlers
  const handleStartPicking = async (shipment: WarehouseShipmentItem) => {
    setActionLoadingId(shipment.id);
    try {
      const updated = await warehousePortalService.startPicking(shipment.id);
      setToastMessage(`Picking started for shipment ${shipment.trackingNumber}.`);
      if (selectedShipment?.id === shipment.id) {
        setSelectedShipment(updated);
      }
      setShipments((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to start picking.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMarkPacked = async (shipment: WarehouseShipmentItem) => {
    setActionLoadingId(shipment.id);
    try {
      const updated = await warehousePortalService.markPacked(shipment.id);
      setToastMessage(`Shipment ${shipment.trackingNumber} marked as PACKED.`);
      if (selectedShipment?.id === shipment.id) {
        setSelectedShipment(updated);
      }
      setShipments((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to mark shipment as packed.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReadyForDispatch = async (shipment: WarehouseShipmentItem) => {
    setActionLoadingId(shipment.id);
    try {
      const updated = await warehousePortalService.markReadyForDispatch(shipment.id);
      setToastMessage(`Shipment ${shipment.trackingNumber} staged as READY FOR DISPATCH. Assign fleet to proceed.`);
      if (selectedShipment?.id === shipment.id) {
        setSelectedShipment(updated);
      }
      // Move this shipment immediately to the top (index 0) upon confirmed backend success
      setShipments((prev) => [
        updated,
        ...prev.filter((s) => s.id !== updated.id),
      ]);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to stage shipment for dispatch.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDispatch = async (shipment: WarehouseShipmentItem) => {
    if (!shipment.driverName && !shipment.driverId) {
      alert('Cannot dispatch: No driver assigned.');
      return;
    }
    if (!shipment.vehicleNumber && !shipment.vehicleId) {
      alert('Cannot dispatch: No vehicle assigned.');
      return;
    }

    setActionLoadingId(shipment.id);
    try {
      const updated = await warehousePortalService.dispatchShipment(shipment.id);
      setToastMessage(`Shipment ${shipment.trackingNumber} successfully DISPATCHED! Status changed to IN_TRANSIT.`);
      if (selectedShipment?.id === shipment.id) {
        setSelectedShipment(updated);
      }
      setShipments((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to dispatch shipment.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const openAssignModal = async (shipment: WarehouseShipmentItem) => {
    setAssignModalShipment(shipment);
    setSelectedDriverId('');
    setSelectedVehicleId('');
    setAssignError(null);
    setIsFleetLoading(true);
    try {
      const [drivers, vehicles] = await Promise.all([
        warehousePortalService.getAvailableDrivers(),
        warehousePortalService.getAvailableVehicles()
      ]);
      setAvailableDrivers(Array.isArray(drivers) ? drivers : []);
      setAvailableVehicles(Array.isArray(vehicles) ? vehicles : []);
    } catch (err: any) {
      setAssignError(err?.response?.data?.message || 'Failed to load available fleet resources.');
    } finally {
      setIsFleetLoading(false);
    }
  };

  const handleAssignFleetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalShipment) return;

    if (!selectedDriverId) {
      setAssignError('Please select an available Driver.');
      return;
    }
    if (!selectedVehicleId) {
      setAssignError('Please select an available Vehicle.');
      return;
    }

    setIsAssigning(true);
    setAssignError(null);
    try {
      const updated = await warehousePortalService.assignFleet(assignModalShipment.id, {
        driverId: Number(selectedDriverId),
        vehicleId: Number(selectedVehicleId)
      });
      setToastMessage(`Driver and Vehicle successfully assigned to ${assignModalShipment.trackingNumber}. Ready for Dispatch.`);
      if (selectedShipment?.id === assignModalShipment.id) {
        setSelectedShipment(updated);
      }
      setAssignModalShipment(null);
      setShipments((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } catch (err: any) {
      setAssignError(err?.response?.data?.message || err?.message || 'Failed to assign driver and vehicle.');
    } finally {
      setIsAssigning(false);
    }
  };

  // Filter logic
  const filtered = useMemo(() => {
    return shipments.filter((s) => {
      const stage = (s.operationalStage || 'READY_FOR_PROCESSING').toUpperCase();
      const status = (s.status || '').toUpperCase();

      if (stageFilter !== 'ALL') {
        if (stageFilter === 'READY_FOR_PROCESSING') {
          if (stage !== 'READY_FOR_PROCESSING' && stage !== 'READY_TO_PROCESS' && stage !== 'CONFIRMED') return false;
        } else if (stageFilter === 'IN_TRANSIT') {
          if (stage !== 'DISPATCHED' && stage !== 'IN_TRANSIT' && status !== 'IN_TRANSIT') return false;
        } else if (stageFilter === 'OUT_FOR_DELIVERY') {
          if (stage !== 'OUT_FOR_DELIVERY' && status !== 'OUT_FOR_DELIVERY') return false;
        } else if (stageFilter === 'DELIVERED') {
          if (status !== 'DELIVERED') return false;
        } else {
          if (stage !== stageFilter) return false;
        }
      }

      if (!search.trim()) return true;
      const query = search.toLowerCase();
      return (
        s.trackingNumber?.toLowerCase().includes(query) ||
        s.orderNumber?.toLowerCase().includes(query) ||
        s.customerName?.toLowerCase().includes(query) ||
        s.destinationCity?.toLowerCase().includes(query) ||
        s.deliveryAddress?.toLowerCase().includes(query) ||
        s.driverName?.toLowerCase().includes(query) ||
        s.vehicleNumber?.toLowerCase().includes(query) ||
        s.packageDescription?.toLowerCase().includes(query)
      );
    });
  }, [shipments, search, stageFilter]);

  const getStageBadgeStyle = (stage?: string, status?: string) => {
    if (status === 'CANCELLED') {
      return { bg: '#fee2e2', color: '#b91c1c', label: 'Cancelled' };
    }
    if (status === 'DELIVERED') {
      return { bg: '#dcfce7', color: '#15803d', label: 'Delivered' };
    }
    if (status === 'OUT_FOR_DELIVERY' || stage === 'OUT_FOR_DELIVERY') {
      return { bg: '#f3e8ff', color: '#6b21a8', label: 'Out for Delivery' };
    }
    if (status === 'IN_TRANSIT' || stage === 'DISPATCHED' || stage === 'IN_TRANSIT') {
      return { bg: '#e0e7ff', color: '#3730a3', label: 'In Transit' };
    }

    const s = (stage || 'READY_FOR_PROCESSING').toUpperCase();
    switch (s) {
      case 'READY_FOR_PROCESSING':
      case 'READY_TO_PROCESS':
      case 'CONFIRMED':
        return { bg: '#f1f5f9', color: '#475569', label: 'Ready to Process' };
      case 'PICKING':
        return { bg: '#eff6ff', color: '#1d4ed8', label: 'Picking' };
      case 'PACKED':
        return { bg: '#fef3c7', color: '#92400e', label: 'Packed' };
      case 'READY_FOR_DISPATCH':
        return { bg: '#ecfdf5', color: '#065f46', label: 'Ready for Dispatch' };
      default:
        return { bg: '#f1f5f9', color: '#475569', label: s.replace(/_/g, ' ') };
    }
  };

  return (
    <div className="wh-page-container" style={{ padding: '24px 28px', maxWidth: 1440, margin: '0 auto' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            backgroundColor: '#065f46',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
            zIndex: 9999,
            fontSize: 13.5,
            fontWeight: 600,
            border: '1px solid #059669',
            animation: 'slideIn 0.3s ease',
          }}
        >
          <CheckCircle2 size={18} color="#a7f3d0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            style={{ background: 'none', border: 'none', color: '#a7f3d0', cursor: 'pointer', padding: 2, marginLeft: 8 }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── 1. Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Outgoing Shipments Console
          </h1>
          <p style={{ fontSize: 13.5, color: '#64748b', margin: 0 }}>
            Operational workspace for pick, pack, fleet assignment, and outbound dispatch for orders originating at this facility.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={loadShipments}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> Refresh Queue
          </button>
        </div>
      </div>

      {/* ── 2. Toolbar & Filters ── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 12,
          padding: '14px 18px',
          border: '1px solid #e2e8f0',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 280 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by Tracking #, Order #, Customer, Driver, Destination..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none' }}
            />
          </div>

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, backgroundColor: '#ffffff', color: '#334155', outline: 'none', fontWeight: 500 }}
          >
            <option value="ALL">All Operational Stages</option>
            <option value="READY_FOR_PROCESSING">Ready to Process</option>
            <option value="PICKING">Picking</option>
            <option value="PACKED">Packed</option>
            <option value="READY_FOR_DISPATCH">Ready for Dispatch</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
            <option value="DELIVERED">Delivered</option>
          </select>
        </div>

        <span style={{ fontSize: 12.5, color: '#64748b' }}>
          Showing <strong>{filtered.length}</strong> of {shipments.length} outbound shipments
        </span>
      </div>

      {/* ── 3. Operational Shipments Data Table ── */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', width: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        {isLoading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px', color: '#059669' }} />
            <p style={{ margin: 0, fontSize: 13 }}>Loading outbound operational queue...</p>
          </div>
        ) : error ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#dc2626' }}>{error}</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>
            <Box size={42} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>No shipments in this queue</h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
              {search || stageFilter !== 'ALL'
                ? 'No shipments match the current filters.'
                : 'No pending orders allocated for warehouse fulfillment.'}
            </p>
          </div>
        ) : (
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: 12 }}>
                  <th style={{ padding: '12px 12px', fontWeight: 700, width: '16%' }}>Tracking / Order #</th>
                  <th style={{ padding: '12px 12px', fontWeight: 700, width: '17%' }}>Customer</th>
                  <th style={{ padding: '12px 12px', fontWeight: 700, width: '18%' }}>Delivery Destination</th>
                  <th style={{ padding: '12px 10px', fontWeight: 700, width: '12%' }}>Delivery Type</th>
                  <th style={{ padding: '12px 10px', fontWeight: 700, width: '15%' }}>Assigned Fleet</th>
                  <th style={{ padding: '12px 10px', fontWeight: 700, width: '12%' }}>Operational Stage</th>
                  <th style={{ padding: '12px 12px', fontWeight: 700, width: '10%', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const stage = (s.operationalStage || 'READY_FOR_PROCESSING').toUpperCase();
                  const status = (s.status || '').toUpperCase();
                  const stageBadge = getStageBadgeStyle(stage, status);
                  const isActionLoading = actionLoadingId === s.id;
                  const hasFleet = !!((s.driverName || s.driverId) && (s.vehicleNumber || s.vehicleId));

                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      {/* 1. Tracking / Order Number */}
                      <td style={{ padding: '12px 12px' }}>
                        <div
                          style={{ fontWeight: 700, color: '#0f172a', fontFamily: 'monospace', cursor: 'pointer' }}
                          onClick={() => setSelectedShipment(s)}
                          title="Click to view full shipment specifications"
                        >
                          {s.trackingNumber}
                        </div>
                        {s.orderNumber && (
                          <div style={{ fontSize: 11, color: '#047857', fontFamily: 'monospace', marginTop: 2 }}>
                            {s.orderNumber}
                          </div>
                        )}
                      </td>

                      {/* 2. Customer */}
                      <td style={{ padding: '12px 12px' }}>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>
                          {s.customerName || 'Customer'}
                        </div>
                        {s.customerEmail && (
                          <div style={{ fontSize: 11, color: '#64748b' }}>
                            {s.customerEmail}
                          </div>
                        )}
                      </td>

                      {/* 3. Delivery Destination (Direct Address) */}
                      <td style={{ padding: '12px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                          <MapPin size={13} color="#2563eb" style={{ flexShrink: 0, marginTop: 2 }} />
                          <div>
                            <span style={{ fontWeight: 600, color: '#334155' }}>
                              {s.destinationCity || 'Destination'}
                            </span>
                            {s.deliveryAddress && (
                              <div style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }} title={s.deliveryAddress}>
                                {s.deliveryAddress}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 4. Delivery Type */}
                      <td style={{ padding: '12px 10px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 7px',
                            borderRadius: 6,
                            backgroundColor: s.deliveryType === 'EXPRESS' ? '#fef3c7' : '#f1f5f9',
                            color: s.deliveryType === 'EXPRESS' ? '#b45309' : '#475569',
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          {(s.deliveryType || 'STANDARD').replace('_', ' ')}
                        </span>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                          {formatWeight(s.packageWeight)} • {s.packageQuantity || 1} pkg
                        </div>
                      </td>

                      {/* 5. Assigned Fleet */}
                      <td style={{ padding: '12px 10px' }}>
                        {s.driverName || s.vehicleNumber ? (
                          <div>
                            <div style={{ fontWeight: 600, color: '#065f46', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Truck size={12} />
                              <span>{s.driverName || 'Driver Assigned'}</span>
                            </div>
                            {s.vehicleNumber && (
                              <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>
                                {s.vehicleNumber}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: 11.5, color: '#94a3b8', fontStyle: 'italic' }}>
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* 6. Operational Stage Badge */}
                      <td style={{ padding: '12px 10px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '3px 8px',
                            borderRadius: 12,
                            backgroundColor: stageBadge.bg,
                            color: stageBadge.color,
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: stageBadge.color, flexShrink: 0 }} />
                          <span>{stageBadge.label}</span>
                        </span>
                      </td>

                      {/* 7. Actions per Business Architecture */}
                      <td style={{ padding: '12px 12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 5, justifyContent: 'center', alignItems: 'center' }}>
                          {/* [View] Action (Always Available) */}
                          <button
                            onClick={() => setSelectedShipment(s)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 3,
                              padding: '5px 8px',
                              borderRadius: 6,
                              border: '1px solid #cbd5e1',
                              backgroundColor: '#ffffff',
                              color: '#334155',
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                            title="View Shipment Details & Timeline"
                          >
                            <Eye size={12} />
                            <span>View</span>
                          </button>

                          {/* 1. READY_TO_PROCESS: [Start Picking] */}
                          {(stage === 'READY_FOR_PROCESSING' || stage === 'READY_TO_PROCESS' || stage === 'CONFIRMED') &&
                            status !== 'DELIVERED' && status !== 'CANCELLED' && status !== 'IN_TRANSIT' && (
                            <button
                              onClick={() => handleStartPicking(s)}
                              disabled={isActionLoading}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 3,
                                padding: '5px 8px',
                                borderRadius: 6,
                                border: 'none',
                                backgroundColor: '#1d4ed8',
                                color: '#ffffff',
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: isActionLoading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 1px 3px rgba(29, 78, 216, 0.2)',
                                whiteSpace: 'nowrap',
                              }}
                              title="Start picking items for this shipment"
                            >
                              <PlayCircle size={12} />
                              <span>{isActionLoading ? 'Starting...' : 'Start Picking'}</span>
                            </button>
                          )}

                          {/* 2. PICKING: [Mark Packed] */}
                          {stage === 'PICKING' && status !== 'DELIVERED' && status !== 'CANCELLED' && (
                            <button
                              onClick={() => handleMarkPacked(s)}
                              disabled={isActionLoading}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 3,
                                padding: '5px 8px',
                                borderRadius: 6,
                                border: 'none',
                                backgroundColor: '#d97706',
                                color: '#ffffff',
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: isActionLoading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 1px 3px rgba(217, 119, 6, 0.2)',
                                whiteSpace: 'nowrap',
                              }}
                              title="Mark items packed & sealed"
                            >
                              <Check size={12} />
                              <span>{isActionLoading ? 'Packing...' : 'Mark Packed'}</span>
                            </button>
                          )}

                          {/* 3. PACKED: [Ready for Dispatch] */}
                          {stage === 'PACKED' && status !== 'DELIVERED' && status !== 'CANCELLED' && (
                            <button
                              onClick={() => handleReadyForDispatch(s)}
                              disabled={isActionLoading}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 3,
                                padding: '5px 8px',
                                borderRadius: 6,
                                border: 'none',
                                backgroundColor: '#059669',
                                color: '#ffffff',
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: isActionLoading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 1px 3px rgba(5, 150, 105, 0.2)',
                                whiteSpace: 'nowrap',
                              }}
                              title="Stage shipment as ready for dispatch"
                            >
                              <Box size={12} />
                              <span>{isActionLoading ? 'Staging...' : 'Ready for Dispatch'}</span>
                            </button>
                          )}

                          {/* 4. READY_FOR_DISPATCH: [Assign Fleet] OR [Dispatch] */}
                          {stage === 'READY_FOR_DISPATCH' && status !== 'DELIVERED' && status !== 'CANCELLED' && (
                            !hasFleet ? (
                              <button
                                onClick={() => openAssignModal(s)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 3,
                                  padding: '5px 8px',
                                  borderRadius: 6,
                                  border: 'none',
                                  backgroundColor: '#047857',
                                  color: '#ffffff',
                                  fontSize: 11,
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  boxShadow: '0 1px 3px rgba(4, 120, 87, 0.25)',
                                  whiteSpace: 'nowrap',
                                }}
                                title="Assign Driver & Vehicle to this shipment"
                              >
                                <Truck size={12} />
                                <span>Assign Fleet</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleDispatch(s)}
                                disabled={isActionLoading}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 3,
                                  padding: '5px 8px',
                                  borderRadius: 6,
                                  border: 'none',
                                  backgroundColor: '#2563eb',
                                  color: '#ffffff',
                                  fontSize: 11,
                                  fontWeight: 700,
                                  cursor: isActionLoading ? 'not-allowed' : 'pointer',
                                  boxShadow: '0 1px 3px rgba(37, 99, 235, 0.25)',
                                  whiteSpace: 'nowrap',
                                }}
                                title="Dispatch shipment on outbound route"
                              >
                                <Send size={12} />
                                <span>{isActionLoading ? 'Dispatching...' : 'Dispatch'}</span>
                              </button>
                            )
                          )}

                          {/* 5. IN_TRANSIT / DISPATCHED / OUT_FOR_DELIVERY / DELIVERED: [Track] */}
                          {(stage === 'DISPATCHED' || stage === 'IN_TRANSIT' || stage === 'OUT_FOR_DELIVERY' || status === 'IN_TRANSIT' || status === 'OUT_FOR_DELIVERY' || status === 'DELIVERED') &&
                            status !== 'CANCELLED' && (
                            <button
                              onClick={() => setTrackingModalShipment(s)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 3,
                                padding: '5px 8px',
                                borderRadius: 6,
                                border: '1px solid #bfdbfe',
                                backgroundColor: '#eff6ff',
                                color: '#1d4ed8',
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                              }}
                              title="Track live consignment GPS coordinates"
                            >
                              <Radio size={12} className="animate-pulse" />
                              <span>Track</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 4. Driver & Vehicle Fleet Assignment Modal ── */}
      {assignModalShipment && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: 16,
          }}
          onClick={() => !isAssigning && setAssignModalShipment(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 14,
              border: '1px solid #e2e8f0',
              boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)',
              width: '100%',
              maxWidth: 520,
              padding: 24,
              boxSizing: 'border-box',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Truck size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Assign Driver & Vehicle
                  </h3>
                  <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                    Allocate warehouse fleet resources for outbound dispatch
                  </p>
                </div>
              </div>
              <button
                onClick={() => !isAssigning && setAssignModalShipment(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Shipment Summary Pill */}
            <div style={{ padding: '12px 14px', backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 18, fontSize: 12.5 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Tracking #</span>
                  <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{assignModalShipment.trackingNumber}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Order #</span>
                  <strong style={{ color: '#047857', fontFamily: 'monospace' }}>{assignModalShipment.orderNumber || '—'}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Customer</span>
                  <span style={{ color: '#334155', fontWeight: 600 }}>{assignModalShipment.customerName || 'Customer'}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Delivery Type / Stage</span>
                  <span style={{ color: '#1e40af', fontWeight: 600 }}>
                    {(assignModalShipment.deliveryType || 'STANDARD').replace('_', ' ')} • READY FOR DISPATCH
                  </span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {assignError && (
              <div style={{ padding: '10px 14px', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, color: '#b91c1c', fontSize: 12.5, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{assignError}</span>
              </div>
            )}

            {isFleetLoading ? (
              <div style={{ padding: '30px 0', textAlign: 'center', color: '#64748b' }}>
                <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 6px', color: '#059669' }} />
                <span style={{ fontSize: 12.5 }}>Loading available warehouse drivers & vehicles...</span>
              </div>
            ) : (
              <form onSubmit={handleAssignFleetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Driver Selection */}
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Driver Selection <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <select
                    value={selectedDriverId}
                    onChange={(e) => {
                      const dVal = e.target.value ? Number(e.target.value) : '';
                      setSelectedDriverId(dVal);
                      if (dVal) {
                        const found = availableDrivers.find((d) => d.id === dVal);
                        const vId = found?.primaryVehicle?.id || found?.vehicleId;
                        setSelectedVehicleId(vId ? Number(vId) : '');
                      } else {
                        setSelectedVehicleId('');
                      }
                    }}
                    disabled={isAssigning}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      outline: 'none',
                      fontWeight: 500,
                    }}
                  >
                    <option value="">
                      -- Select Available Driver ({availableDrivers.filter((d) => d.primaryVehicle || d.vehicleId).length} eligible) --
                    </option>
                    {availableDrivers
                      .filter((d) => d.primaryVehicle || d.vehicleId)
                      .map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.fullName} — {d.primaryVehicle?.vehicleNumber || d.vehicleNumber || 'Vehicle Assigned'}
                        </option>
                      ))}
                  </select>
                  {availableDrivers.filter((d) => d.primaryVehicle || d.vehicleId).length === 0 && (
                    <span style={{ fontSize: 11.5, color: '#d97706', display: 'block', marginTop: 4 }}>
                      ⚠️ No available drivers with assigned primary vehicles found at this facility.
                    </span>
                  )}
                </div>

                {/* Paired Primary Vehicle (Auto-Resolved) */}
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Primary Assigned Vehicle <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  {(() => {
                    const selDriver = availableDrivers.find((d) => d.id === Number(selectedDriverId));
                    const pv = selDriver?.primaryVehicle;
                    const vNum = pv?.vehicleNumber || selDriver?.vehicleNumber;

                    return (
                      <div
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 8,
                          border: '1px solid #cbd5e1',
                          backgroundColor: selectedDriverId ? '#f0fdf4' : '#f8fafc',
                          color: selectedDriverId ? '#166534' : '#64748b',
                          fontSize: 13,
                          fontWeight: selectedDriverId ? 600 : 400,
                          boxSizing: 'border-box',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>
                          {selectedDriverId && vNum ? (
                            <>
                              <strong style={{ fontFamily: 'monospace', color: '#047857' }}>{vNum}</strong>
                              {pv?.model ? ` — ${pv.model}` : ''}
                              {pv?.vehicleType ? ` — ${pv.vehicleType}` : ''}
                              {pv?.capacity ? ` — ${pv.capacity} ${pv.capacityUnit || 'TONS'}` : ''}
                            </>
                          ) : (
                            '-- Select a Driver above to automatically load primary vehicle --'
                          )}
                        </span>
                        {selectedDriverId && vNum && (
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, backgroundColor: '#dcfce7', color: '#15803d' }}>
                            Auto-Paired
                          </span>
                        )}
                      </div>
                    );
                  })()}
                  <span style={{ fontSize: 11, color: '#64748b', display: 'block', marginTop: 4 }}>
                    ℹ️ Driver and Vehicle are paired at this facility to ensure valid operational dispatch.
                  </span>
                </div>

                {/* Modal Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => setAssignModalShipment(null)}
                    disabled={isAssigning}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      color: '#475569',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: isAssigning ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAssigning || !selectedDriverId || !selectedVehicleId}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 18px',
                      borderRadius: 8,
                      border: 'none',
                      backgroundColor: '#059669',
                      color: '#ffffff',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: (isAssigning || !selectedDriverId || !selectedVehicleId) ? 'not-allowed' : 'pointer',
                      opacity: (isAssigning || !selectedDriverId || !selectedVehicleId) ? 0.6 : 1,
                      boxShadow: '0 1px 3px rgba(5, 150, 105, 0.3)',
                    }}
                  >
                    {isAssigning ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Assigning...</span>
                      </>
                    ) : (
                      <>
                        <UserCheck size={15} />
                        <span>Assign & Prepare Dispatch</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── 5. Shipment Detail Drawer with Timeline & Operations ── */}
      {selectedShipment && (
        <div
          className="wh-drawer-overlay"
          onClick={() => setSelectedShipment(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(3px)',
            zIndex: 999,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 580,
              height: '100%',
              backgroundColor: '#ffffff',
              boxShadow: '-6px 0 25px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f8fafc',
              }}
            >
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#059669', letterSpacing: '0.04em' }}>
                  Fulfillment Operational Detail
                </span>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '4px 0 0', fontFamily: 'monospace' }}>
                  {selectedShipment.trackingNumber}
                </h2>
              </div>
              <button
                onClick={() => setSelectedShipment(null)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 6, borderRadius: 6 }}
                title="Close Drawer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body */}
            <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Contextual Operational Action Banner in Drawer */}
              {(() => {
                if (selectedShipment.status === 'DELIVERED') {
                  return (
                    <div style={{ padding: 14, backgroundColor: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <CheckCircle2 size={20} color="#16a34a" style={{ flexShrink: 0 }} />
                      <div>
                        <strong style={{ color: '#166534', fontSize: 13, display: 'block' }}>Shipment Delivered</strong>
                        <span style={{ color: '#15803d', fontSize: 12 }}>Delivered directly to customer delivery address. Outbound workflow complete.</span>
                      </div>
                    </div>
                  );
                }
                if (selectedShipment.status === 'CANCELLED') {
                  return (
                    <div style={{ padding: 14, backgroundColor: '#fef2f2', borderRadius: 10, border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <AlertTriangle size={20} color="#dc2626" style={{ flexShrink: 0 }} />
                      <div>
                        <strong style={{ color: '#991b1b', fontSize: 13, display: 'block' }}>Shipment Cancelled</strong>
                        <span style={{ color: '#b91c1c', fontSize: 12 }}>This shipment has been cancelled.</span>
                      </div>
                    </div>
                  );
                }

                const stage = (selectedShipment.operationalStage || 'READY_FOR_PROCESSING').toUpperCase();
                const status = (selectedShipment.status || '').toUpperCase();
                const hasFleet = !!((selectedShipment.driverName || selectedShipment.driverId) && (selectedShipment.vehicleNumber || selectedShipment.vehicleId));

                if (stage === 'READY_FOR_PROCESSING' || stage === 'READY_TO_PROCESS' || stage === 'CONFIRMED') {
                  return (
                    <div style={{ padding: 14, backgroundColor: '#eff6ff', borderRadius: 10, border: '1px solid #bfdbfe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ color: '#1e40af', fontSize: 13, display: 'block' }}>Ready for Picking</strong>
                        <span style={{ color: '#3b82f6', fontSize: 12 }}>Items are allocated at this facility.</span>
                      </div>
                      <button
                        onClick={() => handleStartPicking(selectedShipment)}
                        disabled={actionLoadingId === selectedShipment.id}
                        style={{ padding: '7px 14px', borderRadius: 6, backgroundColor: '#1d4ed8', color: '#fff', border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                      >
                        Start Picking
                      </button>
                    </div>
                  );
                }
                if (stage === 'PICKING') {
                  return (
                    <div style={{ padding: 14, backgroundColor: '#ecfdf5', borderRadius: 10, border: '1px solid #a7f3d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ color: '#065f46', fontSize: 13, display: 'block' }}>Picking in Progress</strong>
                        <span style={{ color: '#059669', fontSize: 12 }}>Verify cargo contents and mark as packed.</span>
                      </div>
                      <button
                        onClick={() => handleMarkPacked(selectedShipment)}
                        disabled={actionLoadingId === selectedShipment.id}
                        style={{ padding: '7px 14px', borderRadius: 6, backgroundColor: '#d97706', color: '#fff', border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                      >
                        Mark Packed
                      </button>
                    </div>
                  );
                }
                if (stage === 'PACKED') {
                  return (
                    <div style={{ padding: 14, backgroundColor: '#fef3c7', borderRadius: 10, border: '1px solid #fde68a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ color: '#92400e', fontSize: 13, display: 'block' }}>Shipment Packed & Sealed</strong>
                        <span style={{ color: '#b45309', fontSize: 12 }}>Stage shipment for dispatch assignment.</span>
                      </div>
                      <button
                        onClick={() => handleReadyForDispatch(selectedShipment)}
                        disabled={actionLoadingId === selectedShipment.id}
                        style={{ padding: '7px 14px', borderRadius: 6, backgroundColor: '#059669', color: '#fff', border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        <Box size={14} />
                        <span>Ready for Dispatch</span>
                      </button>
                    </div>
                  );
                }
                if (stage === 'READY_FOR_DISPATCH') {
                  return (
                    <div style={{ padding: 14, backgroundColor: '#ecfdf5', borderRadius: 10, border: '1px solid #a7f3d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ color: '#065f46', fontSize: 13, display: 'block' }}>
                          {hasFleet ? 'Fleet Assigned — Ready to Dispatch' : 'Ready for Dispatch — Fleet Required'}
                        </strong>
                        <span style={{ color: '#059669', fontSize: 12 }}>
                          {hasFleet
                            ? `Driver: ${selectedShipment.driverName} • Vehicle: ${selectedShipment.vehicleNumber}`
                            : 'Assign available warehouse driver and vehicle.'}
                        </span>
                      </div>
                      {!hasFleet ? (
                        <button
                          onClick={() => openAssignModal(selectedShipment)}
                          style={{ padding: '7px 14px', borderRadius: 6, backgroundColor: '#047857', color: '#fff', border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                          <Truck size={14} />
                          <span>Assign Fleet</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDispatch(selectedShipment)}
                          disabled={actionLoadingId === selectedShipment.id}
                          style={{ padding: '7px 14px', borderRadius: 6, backgroundColor: '#2563eb', color: '#fff', border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                          <Send size={14} />
                          <span>Dispatch</span>
                        </button>
                      )}
                    </div>
                  );
                }
                if (stage === 'DISPATCHED' || stage === 'IN_TRANSIT' || status === 'IN_TRANSIT') {
                  return (
                    <div style={{ padding: 14, backgroundColor: '#e0e7ff', borderRadius: 10, border: '1px solid #c7d2fe', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Truck size={20} color="#3730a3" style={{ flexShrink: 0 }} />
                      <div>
                        <strong style={{ color: '#3730a3', fontSize: 13, display: 'block' }}>Shipment In Transit</strong>
                        <span style={{ color: '#4338ca', fontSize: 12 }}>
                          Driver {selectedShipment.driverName || 'Assigned'} is en route to the customer delivery address on vehicle {selectedShipment.vehicleNumber || ''}.
                        </span>
                      </div>
                    </div>
                  );
                }
                if (stage === 'OUT_FOR_DELIVERY' || status === 'OUT_FOR_DELIVERY') {
                  return (
                    <div style={{ padding: 14, backgroundColor: '#f3e8ff', borderRadius: 10, border: '1px solid #e9d5ff', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Navigation size={20} color="#6b21a8" style={{ flexShrink: 0 }} />
                      <div>
                        <strong style={{ color: '#6b21a8', fontSize: 13, display: 'block' }}>Out for Delivery</strong>
                        <span style={{ color: '#7e22ce', fontSize: 12 }}>Consignment is out for last-mile direct delivery to the customer.</span>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* 1. Core Shipment Attributes */}
              <div style={{ padding: 16, borderRadius: 10, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', margin: '0 0 12px', letterSpacing: '0.04em' }}>
                  Shipment Specification
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, fontSize: 13 }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: 11.5 }}>Order Number</span>
                    <strong style={{ color: '#047857', fontFamily: 'monospace' }}>{selectedShipment.orderNumber || '—'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: 11.5 }}>Delivery Type</span>
                    <strong style={{ color: '#0f172a' }}>{(selectedShipment.deliveryType || 'STANDARD').replace('_', ' ')}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: 11.5 }}>Customer</span>
                    <strong style={{ color: '#0f172a' }}>{selectedShipment.customerName || 'Customer'}</strong>
                    {selectedShipment.customerPhone && <div style={{ fontSize: 11.5, color: '#64748b' }}>{selectedShipment.customerPhone}</div>}
                    {selectedShipment.customerEmail && <div style={{ fontSize: 11.5, color: '#64748b' }}>{selectedShipment.customerEmail}</div>}
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: 11.5 }}>Operational Stage</span>
                    <strong style={{ color: '#1e40af' }}>{(selectedShipment.operationalStage || 'READY_FOR_PROCESSING').replace(/_/g, ' ')}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: 11.5 }}>Package Description</span>
                    <strong style={{ color: '#0f172a' }}>{selectedShipment.packageDescription || 'General Cargo'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: 11.5 }}>Quantity / Total Weight</span>
                    <strong style={{ color: '#0f172a' }}>{selectedShipment.packageQuantity || 1} units ({formatWeight(selectedShipment.packageWeight)})</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: 11.5 }}>Created Date</span>
                    <strong style={{ color: '#334155' }}>
                      {selectedShipment.createdAt ? new Date(selectedShipment.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                    </strong>
                  </div>
                  {selectedShipment.driverName && (
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: 11.5 }}>Assigned Driver</span>
                      <strong style={{ color: '#065f46' }}>{selectedShipment.driverName}</strong>
                      {selectedShipment.driverPhone && <div style={{ fontSize: 11, color: '#64748b' }}>{selectedShipment.driverPhone}</div>}
                    </div>
                  )}
                  {selectedShipment.vehicleNumber && (
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: 11.5 }}>Assigned Vehicle</span>
                      <strong style={{ color: '#065f46' }}>{selectedShipment.vehicleNumber}</strong>
                      {selectedShipment.vehicleType && <div style={{ fontSize: 11, color: '#64748b' }}>{selectedShipment.vehicleType} • {selectedShipment.vehicleModel}</div>}
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Direct Delivery Route Card */}
              <div style={{ padding: 16, borderRadius: 10, backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', margin: '0 0 12px', letterSpacing: '0.04em' }}>
                  Direct Delivery Route
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <MapPin size={16} color="#059669" style={{ marginTop: 2, flexShrink: 0 }} />
                    <div style={{ fontSize: 13 }}>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>Origin: {selectedShipment.originWarehouseName || selectedShipment.originCity}</span>
                      <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: 12 }}>{selectedShipment.pickupAddress || 'Origin Facility'}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <MapPin size={16} color="#2563eb" style={{ marginTop: 2, flexShrink: 0 }} />
                    <div style={{ fontSize: 13 }}>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>Direct Customer Destination: {selectedShipment.destinationCity || 'Customer Address'}</span>
                      <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: 12 }}>{selectedShipment.deliveryAddress || 'Customer Delivery Address'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Items Pick List */}
              {selectedShipment.items && selectedShipment.items.length > 0 && (
                <div style={{ padding: 16, borderRadius: 10, backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', margin: '0 0 10px', letterSpacing: '0.04em' }}>
                    Fulfillment Pick Items ({selectedShipment.items.length} SKUs)
                  </h4>
                  <div style={{ borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                      <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                        <tr>
                          <th style={{ textAlign: 'left', padding: '7px 10px' }}>SKU</th>
                          <th style={{ textAlign: 'left', padding: '7px 10px' }}>Product</th>
                          <th style={{ textAlign: 'center', padding: '7px 10px' }}>Pick Qty</th>
                          <th style={{ textAlign: 'right', padding: '7px 10px' }}>Weight</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedShipment.items.map((item, idx) => (
                          <tr key={item.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '7px 10px', fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                              {item.sku || '—'}
                            </td>
                            <td style={{ padding: '7px 10px', color: '#334155' }}>
                              <strong>{item.productName || `Item #${item.productId}`}</strong>
                            </td>
                            <td style={{ padding: '7px 10px', textAlign: 'center' }}>
                              <span style={{ fontWeight: 800, color: '#065f46', background: '#ecfdf5', padding: '2px 6px', borderRadius: 4 }}>
                                {item.quantity} units
                              </span>
                            </td>
                            <td style={{ padding: '7px 10px', textAlign: 'right', color: '#475569' }}>
                              {formatItemWeight(item.totalWeight, item.unitWeight, item.quantity)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 4. Operational Stage & Milestone Timeline */}
              <div style={{ padding: 16, borderRadius: 10, backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', margin: '0 0 14px', letterSpacing: '0.04em' }}>
                  Outbound Lifecycle Progression
                </h4>

                {/* Milestone Stepper */}
                {(() => {
                  const stage = (selectedShipment.operationalStage || 'READY_FOR_PROCESSING').toUpperCase();
                  const status = (selectedShipment.status || '').toUpperCase();

                  const isPicking = stage === 'PICKING';
                  const isPacked = stage === 'PACKED';
                  const isReadyForDispatch = stage === 'READY_FOR_DISPATCH';
                  const isDispatched = stage === 'DISPATCHED' || stage === 'IN_TRANSIT' || status === 'IN_TRANSIT' || stage === 'OUT_FOR_DELIVERY' || status === 'OUT_FOR_DELIVERY' || status === 'DELIVERED';
                  const isDelivered = status === 'DELIVERED';

                  return (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, position: 'relative' }}>
                      {/* Step 1: Picking */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, zIndex: 1 }}>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', backgroundColor: isPicking || isPacked || isReadyForDispatch || isDispatched ? '#059669' : '#e2e8f0', color: isPicking || isPacked || isReadyForDispatch || isDispatched ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                          {isPacked || isReadyForDispatch || isDispatched ? '✓' : '1'}
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#065f46' }}>Picking</span>
                      </div>

                      <div style={{ flex: 1, height: 2, backgroundColor: isPacked || isReadyForDispatch || isDispatched ? '#059669' : '#cbd5e1', margin: '0 4px -18px 4px' }} />

                      {/* Step 2: Packed */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, zIndex: 1 }}>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', backgroundColor: isReadyForDispatch || isDispatched ? '#059669' : isPacked ? '#d97706' : '#e2e8f0', color: isReadyForDispatch || isDispatched || isPacked ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                          {isReadyForDispatch || isDispatched ? '✓' : '2'}
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: isPacked ? '#d97706' : isReadyForDispatch || isDispatched ? '#065f46' : '#64748b' }}>
                          Packed
                        </span>
                      </div>

                      <div style={{ flex: 1, height: 2, backgroundColor: isReadyForDispatch || isDispatched ? '#059669' : '#cbd5e1', margin: '0 4px -18px 4px' }} />

                      {/* Step 3: Ready for Dispatch */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, zIndex: 1 }}>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', backgroundColor: isDispatched ? '#059669' : isReadyForDispatch ? '#059669' : '#e2e8f0', color: isDispatched || isReadyForDispatch ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                          {isDispatched ? '✓' : '3'}
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: isReadyForDispatch || isDispatched ? '#065f46' : '#64748b' }}>
                          Ready
                        </span>
                      </div>

                      <div style={{ flex: 1, height: 2, backgroundColor: isDispatched ? '#059669' : '#cbd5e1', margin: '0 4px -18px 4px' }} />

                      {/* Step 4: Dispatch / In Transit */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, zIndex: 1 }}>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', backgroundColor: isDelivered ? '#059669' : isDispatched ? '#2563eb' : '#e2e8f0', color: isDelivered || isDispatched ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                          {isDelivered ? '✓' : '4'}
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: isDispatched ? '#2563eb' : '#64748b' }}>
                          In Transit
                        </span>
                      </div>

                      <div style={{ flex: 1, height: 2, backgroundColor: isDelivered ? '#059669' : '#cbd5e1', margin: '0 4px -18px 4px' }} />

                      {/* Step 5: Delivered */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, zIndex: 1 }}>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', backgroundColor: isDelivered ? '#15803d' : '#e2e8f0', color: isDelivered ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                          5
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: isDelivered ? '#15803d' : '#64748b' }}>
                          Delivered
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Chronological Tracking Events */}
                {selectedShipment.trackingEvents && selectedShipment.trackingEvents.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderLeft: '2px solid #e2e8f0', paddingLeft: 14, marginLeft: 6 }}>
                    {selectedShipment.trackingEvents.map((evt, idx) => (
                      <div key={evt.id || idx} style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: -19, top: 4, width: 8, height: 8, borderRadius: '50%', backgroundColor: '#059669' }} />
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>{evt.title}</div>
                        <div style={{ fontSize: 12, color: '#64748b', margin: '1px 0' }}>{evt.description}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>
                          {evt.locationName && `${evt.locationName} • `}
                          {evt.eventTime ? new Date(evt.eventTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 12.5, color: '#64748b', margin: 0 }}>
                    Initial tracking milestone recorded upon order fulfillment allocation.
                  </p>
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              {(selectedShipment.status === 'IN_TRANSIT' || selectedShipment.status === 'OUT_FOR_DELIVERY' || selectedShipment.status === 'DISPATCHED' || selectedShipment.status === 'DELIVERED') ? (
                <button
                  onClick={() => setTrackingModalShipment(selectedShipment)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '9px 16px',
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                  }}
                >
                  <Navigation size={14} />
                  <span>Open Live GPS Telemetry Map</span>
                </button>
              ) : (
                <div />
              )}
              <button
                onClick={() => setSelectedShipment(null)}
                style={{
                  padding: '9px 18px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#334155',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. Live GPS Telemetry Tracking Modal ── */}
      {trackingModalShipment && (
        <LiveShipmentTrackingModal
          shipment={trackingModalShipment}
          onClose={() => setTrackingModalShipment(null)}
        />
      )}
    </div>
  );
}
