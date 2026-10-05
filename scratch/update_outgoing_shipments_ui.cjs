const fs = require('fs');
const path = require('path');

const targetPath = 'd:\\Transportation-Logistic\\src\\pages\\warehouse\\OutgoingShipments.tsx';

const newOutgoingShipmentsContent = `import React, { useEffect, useState } from 'react';
import {
  Search, RefreshCw, Eye, CheckCircle2,
  X, MapPin, Box, PlayCircle, Check,
  Truck, UserCheck, AlertCircle
} from 'lucide-react';
import { warehousePortalService } from '../../services/warehousePortalService';
import type { WarehouseShipmentItem } from '../../types/warehousePortal';

// Helper to format float weights cleanly (e.g., 11.400000000000002 -> 11.4 kg, 5.0 -> 5 kg)
const formatWeight = (weight?: number | null): string => {
  if (weight == null || isNaN(weight)) return '—';
  const rounded = parseFloat(Number(weight).toFixed(2));
  return \`\${rounded} kg\`;
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
      setShipments(data);
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
    if (selectedShipment || assignModalShipment) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [selectedShipment, assignModalShipment]);

  const handleStartPicking = async (shipment: WarehouseShipmentItem) => {
    setActionLoadingId(shipment.id);
    try {
      const updated = await warehousePortalService.startPicking(shipment.id);
      setToastMessage(\`Picking started for shipment \${shipment.trackingNumber}.\`);
      if (selectedShipment?.id === shipment.id) {
        setSelectedShipment(updated);
      }
      await loadShipments();
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
      setToastMessage(\`Shipment \${shipment.trackingNumber} marked as PACKED and ready for fleet assignment.\`);
      if (selectedShipment?.id === shipment.id) {
        setSelectedShipment(updated);
      }
      await loadShipments();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to mark shipment as packed.');
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
      setAvailableDrivers(drivers || []);
      setAvailableVehicles(vehicles || []);
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
      setToastMessage(\`Driver and Vehicle successfully assigned to \${assignModalShipment.trackingNumber}.\`);
      if (selectedShipment?.id === assignModalShipment.id) {
        setSelectedShipment(updated);
      }
      setAssignModalShipment(null);
      await loadShipments();
    } catch (err: any) {
      setAssignError(err?.response?.data?.message || err?.message || 'Failed to assign driver and vehicle.');
    } finally {
      setIsAssigning(false);
    }
  };

  const filtered = shipments.filter((s) => {
    const stage = (s.operationalStage || 'READY_FOR_PROCESSING').toUpperCase();
    if (stageFilter !== 'ALL' && stage !== stageFilter) {
      return false;
    }
    if (!search) return true;
    const query = search.toLowerCase();
    return (
      s.trackingNumber.toLowerCase().includes(query) ||
      (s.orderNumber && s.orderNumber.toLowerCase().includes(query)) ||
      (s.customerName && s.customerName.toLowerCase().includes(query)) ||
      (s.destinationCity && s.destinationCity.toLowerCase().includes(query)) ||
      (s.packageDescription && s.packageDescription.toLowerCase().includes(query))
    );
  });

  const getStageBadgeStyle = (stage: string) => {
    switch (stage) {
      case 'READY_FOR_PROCESSING':
        return { bg: '#f1f5f9', color: '#475569', label: 'Ready to Process' };
      case 'PICKING':
        return { bg: '#eff6ff', color: '#1d4ed8', label: 'Picking' };
      case 'PACKED':
        return { bg: '#fef3c7', color: '#92400e', label: 'Packed' };
      case 'READY_FOR_DISPATCH':
        return { bg: '#ecfdf5', color: '#065f46', label: 'Ready for Dispatch' };
      case 'DISPATCHED':
      case 'IN_TRANSIT':
        return { bg: '#e0e7ff', color: '#3730a3', label: 'In Transit' };
      case 'DELIVERED':
        return { bg: '#dcfce7', color: '#15803d', label: 'Delivered' };
      case 'CANCELLED':
        return { bg: '#fee2e2', color: '#b91c1c', label: 'Cancelled' };
      default:
        return { bg: '#f1f5f9', color: '#475569', label: stage.replace(/_/g, ' ') };
    }
  };

  // Filter available vehicles: if vehicle has assignedDriver, check match with selected driver
  const compatibleVehicles = availableVehicles.filter(v => {
    if (!v.assignedDriver || !selectedDriverId) return true;
    return v.assignedDriver.id === Number(selectedDriverId);
  });

  return (
    <div className="wh-page-container" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      {/* Toast */}
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
          }}
        >
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            style={{ background: 'none', border: 'none', color: '#a7f3d0', cursor: 'pointer', padding: 2, marginLeft: 8 }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Warehouse Outbound Fulfillment
          </h1>
          <p style={{ fontSize: 13.5, color: '#64748b', margin: 0 }}>
            Operational pick, pack, and fleet assignment queue for orders allocated to this facility.
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
            }}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> Refresh Queue
          </button>
        </div>
      </div>

      {/* Toolbar & Stage Filters */}
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
              placeholder="Search by Tracking #, Order #, Customer, Destination..."
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
            <option value="PACKED">Packed (Awaiting Fleet)</option>
            <option value="READY_FOR_DISPATCH">Ready for Dispatch</option>
          </select>
        </div>

        <span style={{ fontSize: 12.5, color: '#64748b' }}>
          Showing <strong>{filtered.length}</strong> of {shipments.length} outbound shipments
        </span>
      </div>

      {/* Main Operational Table Container */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
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
          <div style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
            <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: 12.5, textAlign: 'left', boxSizing: 'border-box' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: 12 }}>
                  <th style={{ padding: '12px 10px', fontWeight: 700, width: '17%' }}>Tracking Number</th>
                  <th style={{ padding: '12px 10px', fontWeight: 700, width: '15%' }}>Order Number</th>
                  <th style={{ padding: '12px 10px', fontWeight: 700, width: '23%' }}>Customer</th>
                  <th style={{ padding: '12px 8px', fontWeight: 700, width: '12%' }}>Delivery Type</th>
                  <th style={{ padding: '12px 8px', fontWeight: 700, width: '16%' }}>Operational Stage</th>
                  <th style={{ padding: '12px 8px', fontWeight: 700, width: '17%', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const stage = (s.operationalStage || 'READY_FOR_PROCESSING').toUpperCase();
                  const stageBadge = getStageBadgeStyle(stage);
                  const isActionLoading = actionLoadingId === s.id;

                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      {/* 1. Tracking Number */}
                      <td style={{ padding: '12px 10px', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={s.trackingNumber}>
                        {s.trackingNumber}
                      </td>

                      {/* 2. Order Number */}
                      <td style={{ padding: '12px 10px', color: '#047857', fontWeight: 600, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={s.orderNumber || ''}>
                        {s.orderNumber || '—'}
                      </td>

                      {/* 3. Customer */}
                      <td style={{ padding: '12px 10px', color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={s.customerName || 'Customer'}>
                          {s.customerName || 'Customer'}
                        </div>
                        {s.customerEmail && (
                          <div style={{ fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={s.customerEmail}>
                            {s.customerEmail}
                          </div>
                        )}
                      </td>

                      {/* 4. Delivery Type */}
                      <td style={{ padding: '12px 8px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 7px',
                            borderRadius: 6,
                            backgroundColor: s.deliveryType === 'EXPRESS' ? '#fef3c7' : '#f1f5f9',
                            color: s.deliveryType === 'EXPRESS' ? '#b45309' : '#475569',
                            fontSize: 11,
                            fontWeight: 700,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '100%',
                          }}
                        >
                          {(s.deliveryType || 'STANDARD').replace('_', ' ')}
                        </span>
                      </td>

                      {/* 5. Operational Stage */}
                      <td style={{ padding: '12px 8px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '3px 7px',
                            borderRadius: 12,
                            backgroundColor: stageBadge.bg,
                            color: stageBadge.color,
                            fontSize: 11,
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            maxWidth: '100%',
                            overflow: 'hidden',
                          }}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: stageBadge.color, flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stageBadge.label}</span>
                        </span>
                      </td>

                      {/* 6. Actions */}
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 5, justifyContent: 'center', alignItems: 'center', flexWrap: 'nowrap' }}>
                          {/* [View] Action */}
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
                              whiteSpace: 'nowrap',
                              flexShrink: 0,
                            }}
                            title="View Shipment Details & Timeline"
                          >
                            <Eye size={12} />
                            <span>View</span>
                          </button>

                          {/* [Start Picking] Action for READY_FOR_PROCESSING */}
                          {stage === 'READY_FOR_PROCESSING' && (
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
                                flexShrink: 0,
                              }}
                              title="Start picking items for this shipment"
                            >
                              <PlayCircle size={12} />
                              <span>{isActionLoading ? 'Starting...' : 'Start Picking'}</span>
                            </button>
                          )}

                          {/* [Mark as Packed] Action for PICKING */}
                          {stage === 'PICKING' && (
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
                                backgroundColor: '#059669',
                                color: '#ffffff',
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: isActionLoading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 1px 3px rgba(5, 150, 105, 0.2)',
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                              }}
                              title="Mark items as packed and ready"
                            >
                              <Check size={12} />
                              <span>{isActionLoading ? 'Packing...' : 'Mark as Packed'}</span>
                            </button>
                          )}

                          {/* [Assign Driver & Vehicle] Action for PACKED */}
                          {stage === 'PACKED' && (
                            <button
                              onClick={() => openAssignModal(s)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
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
                                flexShrink: 0,
                              }}
                              title="Assign Driver & Vehicle to this packed shipment"
                            >
                              <Truck size={12} />
                              <span>Assign Fleet</span>
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

      {/* ── Driver & Vehicle Fleet Assignment Modal ── */}
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
                    Allocate fleet resources for outbound dispatch
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
                    {(assignModalShipment.deliveryType || 'STANDARD').replace('_', ' ')} • PACKED
                  </span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {assignError && (
              <div style={{ padding: '10px 14px', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, color: '#b91c1c', fontSize: 12.5, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={16} flexShrink={0} />
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
                    onChange={(e) => setSelectedDriverId(e.target.value ? Number(e.target.value) : '')}
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
                    <option value="">-- Select Available Driver ({availableDrivers.length} eligible) --</option>
                    {availableDrivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.fullName} ({d.phone || 'No phone'}) — Lic: {d.licenseNumber || 'Active'}
                      </option>
                    ))}
                  </select>
                  {availableDrivers.length === 0 && (
                    <span style={{ fontSize: 11.5, color: '#d97706', display: 'block', marginTop: 4 }}>
                      No available drivers currently at this warehouse facility.
                    </span>
                  )}
                </div>

                {/* Vehicle Selection */}
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Vehicle Selection <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value ? Number(e.target.value) : '')}
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
                    <option value="">-- Select Available Vehicle ({compatibleVehicles.length} eligible) --</option>
                    {compatibleVehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.vehicleNumber} ({v.vehicleType || 'TRUCK'}) — {v.model || 'Standard'} ({v.capacity ? \`\${v.capacity} \${v.capacityUnit || 'TONS'}\` : 'Available'})
                      </option>
                    ))}
                  </select>
                  {compatibleVehicles.length === 0 && (
                    <span style={{ fontSize: 11.5, color: '#d97706', display: 'block', marginTop: 4 }}>
                      No available vehicles currently match the selected criteria.
                    </span>
                  )}
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

      {/* ── High-Performance Shipment Detail Drawer with Timeline ── */}
      {selectedShipment && (
        <div
          className="wh-drawer-overlay"
          onClick={() => setSelectedShipment(null)}
          style={{ overscrollBehavior: 'contain' }}
        >
          <div
            className="wh-drawer"
            onClick={(e) => e.stopPropagation()}
            style={{ width: 540, maxWidth: '100%' }}
          >
            <div className="wh-drawer-header">
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
                className="wh-btn-icon"
                title="Close Drawer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="wh-drawer-body" style={{ overscrollBehavior: 'contain', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Quick Action Banner in Drawer */}
              {(() => {
                const stage = (selectedShipment.operationalStage || 'READY_FOR_PROCESSING').toUpperCase();
                if (stage === 'READY_FOR_PROCESSING') {
                  return (
                    <div style={{ padding: 14, backgroundColor: '#eff6ff', borderRadius: 10, border: '1px solid #bfdbfe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ color: '#1e40af', fontSize: 13, display: 'block' }}>Order Ready for Picking</strong>
                        <span style={{ color: '#3b82f6', fontSize: 12 }}>Items are reserved and allocated at this facility.</span>
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
                        <span style={{ color: '#059669', fontSize: 12 }}>Verify package contents and seal the consignment.</span>
                      </div>
                      <button
                        onClick={() => handleMarkPacked(selectedShipment)}
                        disabled={actionLoadingId === selectedShipment.id}
                        style={{ padding: '7px 14px', borderRadius: 6, backgroundColor: '#059669', color: '#fff', border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                      >
                        Mark as Packed
                      </button>
                    </div>
                  );
                }
                if (stage === 'PACKED') {
                  return (
                    <div style={{ padding: 14, backgroundColor: '#fef3c7', borderRadius: 10, border: '1px solid #fde68a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ color: '#92400e', fontSize: 13, display: 'block' }}>Shipment Packed & Sealed</strong>
                        <span style={{ color: '#b45309', fontSize: 12 }}>Assign available warehouse driver and vehicle.</span>
                      </div>
                      <button
                        onClick={() => openAssignModal(selectedShipment)}
                        style={{ padding: '7px 14px', borderRadius: 6, backgroundColor: '#047857', color: '#fff', border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        <Truck size={14} />
                        <span>Assign Fleet</span>
                      </button>
                    </div>
                  );
                }
                if (stage === 'READY_FOR_DISPATCH') {
                  return (
                    <div style={{ padding: 14, backgroundColor: '#ecfdf5', borderRadius: 10, border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <CheckCircle2 size={20} color="#065f46" flexShrink={0} />
                      <div>
                        <strong style={{ color: '#065f46', fontSize: 13, display: 'block' }}>Fleet Assigned — Ready for Dispatch</strong>
                        <span style={{ color: '#059669', fontSize: 12 }}>
                          Assigned to <strong>{selectedShipment.driverName || 'Driver'}</strong> ({selectedShipment.vehicleNumber || 'Vehicle'}). Awaiting dispatch handover.
                        </span>
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

              {/* 2. Routing Origin & Destination */}
              <div style={{ padding: 16, borderRadius: 10, backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', margin: '0 0 12px', letterSpacing: '0.04em' }}>
                  Routing Route
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <MapPin size={16} color="#059669" style={{ marginTop: 2, flexShrink: 0 }} />
                    <div style={{ fontSize: 13 }}>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>Origin: {selectedShipment.originWarehouseName || selectedShipment.originCity}</span>
                      <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: 12 }}>{selectedShipment.pickupAddress || 'Warehouse Staging'}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <MapPin size={16} color="#059669" style={{ marginTop: 2, flexShrink: 0 }} />
                    <div style={{ fontSize: 13 }}>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>Destination: {selectedShipment.destinationCity || 'Customer Destination'}</span>
                      <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: 12 }}>{selectedShipment.deliveryAddress || 'Delivery Address'}</p>
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
                              <strong>{item.productName || \`Item #\${item.productId}\`}</strong>
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
                  Shipment Lifecycle Timeline
                </h4>

                {/* Milestone Stepper */}
                {(() => {
                  const stage = (selectedShipment.operationalStage || 'READY_FOR_PROCESSING').toUpperCase();
                  const isPicking = stage === 'PICKING';
                  const isPacked = stage === 'PACKED';
                  const isReadyForDispatch = stage === 'READY_FOR_DISPATCH' || stage === 'DISPATCHED' || stage === 'IN_TRANSIT' || stage === 'DELIVERED';

                  return (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, position: 'relative' }}>
                      {/* Step 1: Order & Allocation */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, zIndex: 1 }}>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', backgroundColor: '#059669', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                          ✓
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#065f46' }}>Allocated</span>
                      </div>

                      <div style={{ flex: 1, height: 2, backgroundColor: isPicking || isPacked || isReadyForDispatch ? '#059669' : '#cbd5e1', margin: '0 4px -18px 4px' }} />

                      {/* Step 2: Picking */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, zIndex: 1 }}>
                        <div
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: '50%',
                            backgroundColor: isPacked || isReadyForDispatch ? '#059669' : isPicking ? '#1d4ed8' : '#e2e8f0',
                            color: isPacked || isReadyForDispatch || isPicking ? '#fff' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {isPacked || isReadyForDispatch ? '✓' : isPicking ? '●' : '2'}
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: isPicking ? '#1d4ed8' : (isPacked || isReadyForDispatch) ? '#065f46' : '#64748b' }}>
                          Picking
                        </span>
                      </div>

                      <div style={{ flex: 1, height: 2, backgroundColor: isPacked || isReadyForDispatch ? '#059669' : '#cbd5e1', margin: '0 4px -18px 4px' }} />

                      {/* Step 3: Packed */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, zIndex: 1 }}>
                        <div
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: '50%',
                            backgroundColor: isReadyForDispatch ? '#059669' : isPacked ? '#d97706' : '#e2e8f0',
                            color: isReadyForDispatch || isPacked ? '#fff' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {isReadyForDispatch ? '✓' : isPacked ? '●' : '3'}
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: isPacked ? '#d97706' : isReadyForDispatch ? '#065f46' : '#64748b' }}>
                          Packed
                        </span>
                      </div>

                      <div style={{ flex: 1, height: 2, backgroundColor: isReadyForDispatch ? '#059669' : '#cbd5e1', margin: '0 4px -18px 4px' }} />

                      {/* Step 4: Fleet Assigned */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, zIndex: 1 }}>
                        <div
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: '50%',
                            backgroundColor: isReadyForDispatch ? '#059669' : '#e2e8f0',
                            color: isReadyForDispatch ? '#fff' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {isReadyForDispatch ? '✓' : '4'}
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: isReadyForDispatch ? '#065f46' : '#64748b' }}>
                          Fleet Assigned
                        </span>
                      </div>

                      <div style={{ flex: 1, height: 2, backgroundColor: '#cbd5e1', margin: '0 4px -18px 4px' }} />

                      {/* Step 5: Dispatch */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, zIndex: 1 }}>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', backgroundColor: '#e2e8f0', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                          5
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 500, color: '#64748b' }}>Dispatch</span>
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
                          {evt.locationName && \`\${evt.locationName} • \`}
                          {evt.eventTime ? new Date(evt.eventTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 12.5, color: '#64748b', margin: 0 }}>
                    Initial tracking event registered upon automatic order fulfillment.
                  </p>
                )}
              </div>
            </div>

            <div className="wh-drawer-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setSelectedShipment(null)}
                className="wh-btn wh-btn-outline wh-btn-sm"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync(targetPath, newOutgoingShipmentsContent, 'utf8');
console.log('Updated OutgoingShipments.tsx with fleet assignment workflow');
