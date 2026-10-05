import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Send, RefreshCw, CheckCircle2, AlertCircle, AlertTriangle,
  Truck, User, MapPin, Package, Clock, ShieldCheck, X,
  Radio, Check, ExternalLink, ArrowRight, Navigation,
  Boxes, ShieldAlert, DoorOpen, Gauge
} from 'lucide-react';
import { warehousePortalService } from '../../services/warehousePortalService';
import type { WarehouseShipmentItem } from '../../types/warehousePortal';

export default function Dispatch() {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState<WarehouseShipmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [warehouse, setWarehouse] = useState<{ name?: string; code?: string } | null>(null);

  const loadDispatchQueue = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [data, whData] = await Promise.all([
        warehousePortalService.getDispatchReadyShipments(),
        warehousePortalService.getWarehouse().catch(() => null),
      ]);
      setShipments(Array.isArray(data) ? data : []);
      if (whData) {
        setWarehouse({
          name: whData.warehouseName,
          code: whData.warehouseCode,
        });
      }
    } catch (err: unknown) {
      console.error('Failed to load dispatch queue:', err);
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e?.response?.data?.message || e.message || 'Failed to load dispatch queue from backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDispatchQueue();
  }, []);

  const handleDispatch = async (shipment: WarehouseShipmentItem) => {
    if (!shipment.driverId) {
      alert('Pre-Flight Validation Failed: A driver must be assigned before dispatching.');
      return;
    }
    if (!shipment.vehicleId) {
      alert('Pre-Flight Validation Failed: A transport vehicle must be assigned before dispatching.');
      return;
    }

    setActionLoadingId(shipment.id);
    try {
      await warehousePortalService.dispatchShipment(shipment.id);
      setToastMessage(`Shipment ${shipment.trackingNumber} successfully released! Gate authorization confirmed.`);
      loadDispatchQueue();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      alert(e?.response?.data?.message || 'Dispatch authorization failed. Please check backend requirements.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="wh-page-container">
      {/* ── Toast Banner ── */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            backgroundColor: '#065f46',
            color: '#ffffff',
            padding: '14px 22px',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            zIndex: 9999,
            fontSize: 13.5,
            fontWeight: 600,
            border: '1px solid #059669'
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

      {/* ── Page Header ── */}
      <div className="wh-header-row">
        <div>
          <div className="wh-title-group">
            <div className="wh-title-icon">
              <Send size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1 className="wh-page-title">Freight Dispatch Console</h1>
                <span className="wh-badge green">
                  {shipments.length} Staged for Release
                </span>
              </div>
              <p className="wh-page-subtitle">
                Verify pre-departure conditions, driver manifests, vehicle readiness, and authorize freight gate release.
              </p>
            </div>
          </div>
        </div>

        <div className="wh-header-actions">
          <Link
            to="/warehouse/outgoing"
            className="wh-btn wh-btn-outline"
            title="View packaging & staging queue in Outgoing Shipments"
          >
            <Boxes size={15} />
            <span>Outgoing Shipments</span>
          </Link>

          <Link
            to="/warehouse/live-map"
            className="wh-btn wh-btn-outline"
            title="Monitor live active fleet on interactive map"
          >
            <Navigation size={15} />
            <span>Live Fleet Map</span>
          </Link>

          <button
            onClick={loadDispatchQueue}
            disabled={isLoading}
            className="wh-btn wh-btn-primary"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            <span>{isLoading ? 'Checking Staging...' : 'Refresh Queue'}</span>
          </button>
        </div>
      </div>

      {/* ── Pre-Dispatch Verification Rules Banner ── */}
      <div className="wh-toolbar-card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <ShieldCheck size={18} color="#059669" />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
            Pre-Dispatch Operational Compliance Standard
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 12.5, color: '#64748b', lineHeight: 1.5 }}>
          Before authorizing final exit through security checkpoints, each consignment must satisfy all 4 operational protocols:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}>
            <CheckCircle2 size={16} color="#059669" />
            <span><strong>1. Packed & Staged:</strong> Verified at dock</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}>
            <CheckCircle2 size={16} color="#059669" />
            <span><strong>2. Driver Assigned:</strong> Authorized driver</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}>
            <CheckCircle2 size={16} color="#059669" />
            <span><strong>3. Vehicle Available:</strong> Roadworthy unit</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}>
            <CheckCircle2 size={16} color="#059669" />
            <span><strong>4. Custody Cleared:</strong> {warehouse?.code || 'Facility'} signed</span>
          </div>
        </div>
      </div>

      {/* ── Error State ── */}
      {error && (
        <div style={{ padding: '14px 18px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#991b1b', fontSize: 13 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertCircle size={18} color="#dc2626" />
            <span>{error}</span>
          </div>
          <button onClick={loadDispatchQueue} className="wh-btn wh-btn-sm wh-btn-outline">
            Retry
          </button>
        </div>
      )}

      {/* ── Content: Loading, Empty Staging Bay, or Active Staging Cards ── */}
      {isLoading ? (
        <div style={{ padding: '80px 20px', textAlign: 'center', background: '#ffffff', borderRadius: 18, border: '1px solid #e2e8f0' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#059669', borderRadius: '50%', margin: '0 auto 14px', animation: 'spin 0.7s linear infinite' }} />
          <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>Checking Dispatch Staging Bay</h4>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Querying active warehouse dispatches from PostgreSQL...</p>
        </div>
      ) : shipments.length === 0 ? (
        /* ── ENTERPRISE CLIENT-GRADE EMPTY STAGING BAY CARD ── */
        <div className="wh-table-card" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            backgroundColor: '#ecfdf5',
            border: '2px solid #a7f3d0',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.15)'
          }}>
            <Send size={32} />
          </div>

          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.01em' }}>
            Dispatch Staging Bay Clear
          </h3>
          <p style={{ fontSize: 13.5, color: '#64748b', maxWidth: 520, margin: '0 auto 24px', lineHeight: 1.6 }}>
            No shipments are currently held in the <strong>READY FOR DISPATCH</strong> staging buffer. All active orders have either departed or are in packaging.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Link
              to="/warehouse/outgoing"
              className="wh-btn wh-btn-primary"
            >
              <Boxes size={15} />
              <span>Go to Outgoing Shipments</span>
              <ArrowRight size={14} />
            </Link>

            <Link
              to="/warehouse/live-map"
              className="wh-btn wh-btn-outline"
            >
              <Navigation size={15} />
              <span>Monitor Live Map</span>
            </Link>
          </div>

          {/* Operational Dock Status Footer */}
          <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'center', gap: 32, fontSize: 12, color: '#64748b', flexWrap: 'wrap' }}>
            <div>
              Facility Hub: <strong style={{ color: '#0f172a' }}>{warehouse?.name ? `${warehouse.name} (${warehouse.code || 'HUB'})` : 'Origin Facility'}</strong>
            </div>
            <div>
              Gate Clearance: <strong style={{ color: '#059669' }}>Operational / Normal</strong>
            </div>
            <div>
              Next Scheduled Batch: <strong style={{ color: '#059669' }}>Immediate on Packaging Completion</strong>
            </div>
          </div>
        </div>
      ) : (
        /* ── ACTIVE STAGED SHIPMENTS GRID ── */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
          {shipments.map((s) => {
            const hasDriver = !!s.driverId;
            const hasVehicle = !!s.vehicleId;
            const isFullyReady = hasDriver && hasVehicle;
            const isProcessing = actionLoadingId === s.id;

            return (
              <div
                key={s.id}
                className="wh-details-card"
                style={{
                  border: isFullyReady ? '1px solid #a7f3d0' : '1px solid #fde68a',
                  boxShadow: isFullyReady ? '0 4px 16px rgba(5,150,105,0.08)' : '0 4px 16px rgba(217,119,6,0.08)'
                }}
              >
                {/* Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Ready for Release
                    </span>
                    <h3 style={{ margin: '4px 0 2px', fontSize: 17, fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
                      {s.trackingNumber}
                    </h3>
                    <div style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>
                      Order #{s.orderNumber || s.orderId}
                    </div>
                  </div>

                  <span className={`wh-badge ${isFullyReady ? 'green' : 'amber'}`}>
                    {isFullyReady ? 'VERIFIED READY' : 'FLEET PENDING'}
                  </span>
                </div>

                {/* Destination & Cargo Details */}
                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <MapPin size={15} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>
                        {s.destinationWarehouseName || s.destinationCity || 'Client Destination'}
                      </div>
                      <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 1 }}>
                        {s.deliveryAddress}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 6, borderTop: '1px solid #eef2ff' }}>
                    <Package size={15} color="#059669" style={{ flexShrink: 0 }} />
                    <div style={{ color: '#334155' }}>
                      <span style={{ fontWeight: 600 }}>{s.packageDescription || 'General Freight'}</span>
                      <span style={{ color: '#64748b', marginLeft: 6 }}>
                        ({s.packageQuantity || 1} units • {s.packageWeight || '—'} kg)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pre-Flight Fleet Status Checklist */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
                    Pre-Flight Fleet Status:
                  </span>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: hasDriver ? '#ecfdf5' : '#fef2f2', borderRadius: 8, border: `1px solid ${hasDriver ? '#a7f3d0' : '#fecaca'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <User size={14} color={hasDriver ? '#059669' : '#dc2626'} />
                      <span style={{ fontWeight: 600, color: hasDriver ? '#065f46' : '#991b1b' }}>Assigned Driver:</span>
                    </div>
                    <span style={{ fontWeight: 700, color: hasDriver ? '#065f46' : '#991b1b' }}>
                      {hasDriver ? s.driverName : 'Unassigned'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: hasVehicle ? '#ecfdf5' : '#fef2f2', borderRadius: 8, border: `1px solid ${hasVehicle ? '#a7f3d0' : '#fecaca'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Truck size={14} color={hasVehicle ? '#059669' : '#dc2626'} />
                      <span style={{ fontWeight: 600, color: hasVehicle ? '#065f46' : '#991b1b' }}>Assigned Vehicle:</span>
                    </div>
                    <span className={hasVehicle ? 'wh-mono-badge' : ''} style={{ color: hasVehicle ? '#0f172a' : '#991b1b', fontWeight: 700 }}>
                      {hasVehicle ? s.vehicleNumber : 'Unassigned'}
                    </span>
                  </div>
                </div>

                {/* Dispatch Release Button */}
                <div style={{ paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                  <button
                    onClick={() => handleDispatch(s)}
                    disabled={!isFullyReady || isProcessing}
                    className={`wh-btn ${isFullyReady ? 'wh-btn-primary' : 'wh-btn-outline'}`}
                    style={{
                      width: '100%',
                      padding: '11px 16px',
                      background: isFullyReady ? '#059669' : '#f8fafc',
                      borderColor: isFullyReady ? '#047857' : '#e2e8f0',
                      color: isFullyReady ? '#ffffff' : '#94a3b8'
                    }}
                  >
                    <Send size={15} />
                    <span>{isProcessing ? 'Authorizing Dispatch...' : 'Authorize Dispatch & Release'}</span>
                  </button>
                  {!isFullyReady && (
                    <p style={{ margin: '6px 0 0', textAlign: 'center', fontSize: 11, color: '#d97706', fontWeight: 600 }}>
                      Assign driver & vehicle in Outgoing Shipments before release.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
