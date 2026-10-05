const fs = require('fs');
const path = require('path');

const drawerPath = path.join(__dirname, '..', 'src', 'components', 'shipments', 'ShipmentDetailDrawer.tsx');
let code = fs.readFileSync(drawerPath, 'utf8');

// 1. Add imports: Modal, MoreVertical, ChevronDown, driverService, vehicleService, AdminDriver, Vehicle
code = code.replace(
  "  Building2,\n} from 'lucide-react';",
  `  Building2,\n  MoreVertical,\n} from 'lucide-react';\nimport Modal from '../common/Modal';\nimport driverService from '../../services/driverService';\nimport vehicleService from '../../services/vehicleService';\nimport type { AdminDriver } from '../../types/adminDriver';\nimport type { Vehicle } from '../../types/vehicle';`
);

// 2. Add onShipmentUpdated prop to ShipmentDetailDrawerProps
code = code.replace(
  "  onUpdateStatusClick?: (shipment: AdminShipment) => void;",
  `  onUpdateStatusClick?: (shipment: AdminShipment) => void;\n  onShipmentUpdated?: (shipment: AdminShipment) => void;`
);

code = code.replace(
  "  onUpdateStatusClick,\n  onAssignVehicleClick,\n  onAssignDriverClick,\n}: ShipmentDetailDrawerProps) {",
  `  onUpdateStatusClick,\n  onShipmentUpdated,\n  onAssignVehicleClick,\n  onAssignDriverClick,\n}: ShipmentDetailDrawerProps) {`
);

// 3. Add state and handlers for More Menu & Override Modal
const stateInsertTarget = "  const lastFetchedIdRef = useRef<number | null>(null);";
const stateInsertCode = `  const lastFetchedIdRef = useRef<number | null>(null);

  // Secondary More menu state
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Override Assignment Modal state
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
      const updated = await adminShipmentService.overrideAssignment(active.id, {
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
  };`;
code = code.replace(stateInsertTarget, stateInsertCode);

// 4. Update footer to remove bottom override button
const footerTarget = `          <div style={{ display: 'flex', gap: 10 }}>
            {onUpdateStatusClick && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => onUpdateStatusClick(active)}
              >
                <Edit3 size={13} /> Update Status
              </button>
            )}
            {onAssignVehicleClick && (
              <button
                className="btn btn-outline btn-sm text-warning"
                title="Admin Emergency Override for Driver & Vehicle Assignment"
                onClick={() => onAssignVehicleClick(active)}
                style={{ borderColor: '#f59e0b', color: '#b45309' }}
              >
                <ShieldAlert size={13} /> Override Assignment
              </button>
            )}
          </div>`;

const footerReplacement = `          <div>
            {onUpdateStatusClick && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => onUpdateStatusClick(active)}
              >
                <Edit3 size={13} /> Update Status
              </button>
            )}
          </div>`;
code = code.replace(footerTarget, footerReplacement);

// 5. Update top identity strip: add More menu
const topIdentityTarget = `          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <StatusBadge status={active.status} />
          </div>`;

const topIdentityReplacement = `          <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }} ref={moreMenuRef}>
            <StatusBadge status={active.status} />

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
          </div>`;
code = code.replace(topIdentityTarget, topIdentityReplacement);

// 6. Update ASSIGNMENT header and remove banner
code = code.replace(
  '<h4\n                style={{\n                  fontSize: 13,\n                  fontWeight: 700,\n                  color: \'var(--text-primary)\',\n                  textTransform: \'uppercase\',\n                  letterSpacing: \'0.04em\',\n                  margin: 0,\n                }}\n              >\n                Warehouse Dispatch & Assignment\n              </h4>',
  `<h4\n                style={{\n                  fontSize: 13,\n                  fontWeight: 700,\n                  color: 'var(--text-primary)',\n                  textTransform: 'uppercase',\n                  letterSpacing: '0.04em',\n                  margin: 0,\n                }}\n              >\n                ASSIGNMENT\n              </h4>`
);

code = code.replace(
  `              <span\n                className={\`badge \${isAssigned ? 'badge-success' : 'badge-amber'}\`}\n                style={{ fontSize: 11, fontWeight: 700 }}\n              >\n                {isAssigned ? 'Assigned' : 'Pending Warehouse Dispatch'}\n              </span>`,
  `              <span\n                className={\`badge \${isAssigned ? 'badge-success' : 'badge-amber'}\`}\n                style={{ fontSize: 11, fontWeight: 700 }}\n              >\n                {active.assignmentStatus || (isAssigned ? 'Assigned' : 'Awaiting Warehouse Assignment')}\n              </span>`
);

// Update Assigned By & Time block
const assignedByTarget = `            {/* Assigned By & Time */}
            <div style={{ background: 'var(--page-bg)', padding: '12px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
                Assigned By
              </div>
              <strong style={{ color: 'var(--text-primary)', fontSize: 13, display: 'block' }}>
                {assignedByLabel}
              </strong>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                Assignment Timestamp:
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
                {formatDateTime(active.updatedAt || active.createdAt)}
              </span>
            </div>`;

const assignedByReplacement = `            {/* Assigned By & Time */}
            <div style={{ background: 'var(--page-bg)', padding: '12px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
                Assigned By
              </div>
              <strong style={{ color: 'var(--text-primary)', fontSize: 13, display: 'block' }}>
                {active.assignedBy || (isAssigned ? 'Warehouse Manager' : 'Not Assigned')}
              </strong>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                Assigned At:
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
                {active.assignedAt ? formatDateTime(active.assignedAt) : (isAssigned ? formatDateTime(active.updatedAt || active.createdAt) : '—')}
              </span>
            </div>`;
code = code.replace(assignedByTarget, assignedByReplacement);

// Remove the yellow warning banner
const bannerRegex = /\{\/\* Override Action notice for Admin \*\/\}[\s\S]*?<\/button>\s*\)\}\s*<\/div>/;
code = code.replace(bannerRegex, '');

// 7. Add the Override Modal dialog right before </Drawer>
const modalCode = `
      {/* ── OVERRIDE SHIPMENT ASSIGNMENT MODAL ── */}
      <Modal
        isOpen={isOverrideModalOpen}
        onClose={() => !isSubmittingOverride && setIsOverrideModalOpen(false)}
        title={\`Override Shipment Assignment — \${active.trackingNumber}\`}
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
                <strong>{active.assignedDriver || 'None (Unassigned)'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Vehicle:</span>
                <strong className="font-mono">{active.vehicleNumber || 'None (Unassigned)'}</strong>
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
                    const matchedVeh = overrideVehicles.find((v) => v.assignedDriver?.id === dId);
                    if (matchedVeh) {
                      setSelectedOverrideVehicleId(matchedVeh.id);
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
                    const veh = overrideVehicles.find((v) => v.id === vId);
                    if (veh && veh.assignedDriver) {
                      setSelectedOverrideDriverId(veh.assignedDriver.id);
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
    </Drawer>`;

code = code.replace("    </Drawer>", modalCode);

fs.writeFileSync(drawerPath, code, 'utf8');
console.log("Updated ShipmentDetailDrawer.tsx successfully!");
