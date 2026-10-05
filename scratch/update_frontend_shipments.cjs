const fs = require('fs');
const path = require('path');

const shipmentsPath = 'd:/Transportation-Logistic/src/pages/admin/Shipments.tsx';
let sContent = fs.readFileSync(shipmentsPath, 'utf8');

// 1. Add warehouseService and Warehouse imports
if (!sContent.includes("import { warehouseService }")) {
  sContent = sContent.replace(
    "import vehicleService from '../../services/vehicleService';",
    "import vehicleService from '../../services/vehicleService';\nimport { warehouseService } from '../../services/warehouseService';\nimport type { Warehouse } from '../../types/warehouse';"
  );
}

// 2. Update Create Shipment Modal State
const oldCreateState = `  // ── Create Shipment Modal ──────────────────────────────────────────────────
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [unassignedOrders, setUnassignedOrders] = useState<AdminOrder[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<AdminDriver[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | ''>('');
  const [selectedDriverId, setSelectedDriverId] = useState<number | ''>('');
  const [createVehicleId, setCreateVehicleId] = useState<number | ''>('');
  const [createInitialLocation, setCreateInitialLocation] = useState('');
  const [loadingUnassigned, setLoadingUnassigned] = useState(false);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [driverError, setDriverError] = useState<string | null>(null);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [vehicleError, setVehicleError] = useState<string | null>(null);
  const [isCreatingShipment, setIsCreatingShipment] = useState(false);`;

const newCreateState = `  // ── Create Shipment Modal ──────────────────────────────────────────────────
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [unassignedOrders, setUnassignedOrders] = useState<AdminOrder[]>([]);
  const [activeWarehouses, setActiveWarehouses] = useState<Warehouse[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | ''>('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | ''>('');
  const [loadingUnassigned, setLoadingUnassigned] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [warehouseError, setWarehouseError] = useState<string | null>(null);
  const [isCreatingShipment, setIsCreatingShipment] = useState(false);`;

sContent = sContent.replace(oldCreateState, newCreateState);

// 3. Update handleOpenCreateModal and handleConfirmCreateShipment
const oldHandlersTargetStart = "  // ===========================================================================\n  // 3. FETCH UNASSIGNED ORDERS & FLEET FOR CREATE SHIPMENT MODAL\n  // ===========================================================================";
const oldHandlersTargetEnd = "  // ===========================================================================\n  // 3b. ASSIGN VEHICLE MODAL HANDLERS";

const newHandlers = `  // ===========================================================================
  // 3. FETCH UNASSIGNED ORDERS & WAREHOUSES FOR CREATE SHIPMENT MODAL
  // ===========================================================================
  const handleOpenCreateModal = async () => {
    setIsCreateModalOpen(true);
    setSelectedOrderId('');
    setSelectedWarehouseId('');
    setWarehouseError(null);

    // 1. Fetch eligible unassigned orders from PostgreSQL
    setLoadingUnassigned(true);
    adminShipmentService.getUnassignedOrders()
      .then((orders) => {
        setUnassignedOrders(orders);
        if (orders.length > 0) {
          setSelectedOrderId(orders[0].id);
        }
      })
      .catch((err: any) => {
        console.error('Failed to load eligible orders:', err);
        showToast(
          'error',
          'Failed to Load Orders',
          'Could not fetch eligible orders for shipment creation.'
        );
      })
      .finally(() => setLoadingUnassigned(false));

    // 2. Fetch active fulfillment warehouses from PostgreSQL
    setLoadingWarehouses(true);
    warehouseService.getAllWarehouses()
      .then((warehouses) => {
        const active = warehouses.filter((w) => w.status === 'ACTIVE');
        setActiveWarehouses(active);
        if (active.length > 0) {
          setSelectedWarehouseId(active[0].id);
        }
        setWarehouseError(null);
      })
      .catch((err: any) => {
        console.error('Failed to load warehouses:', err);
        setWarehouseError('Unable to load warehouses. Please try again.');
      })
      .finally(() => setLoadingWarehouses(false));
  };

  const handleConfirmCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) {
      showToast('error', 'Order Selection Required', 'Please select an order to create shipment.');
      return;
    }
    if (!selectedWarehouseId) {
      showToast('error', 'Fulfillment Warehouse Required', 'Please select a fulfillment warehouse.');
      return;
    }

    try {
      setIsCreatingShipment(true);
      const created = await adminShipmentService.createShipment({
        orderId: Number(selectedOrderId),
        warehouseId: Number(selectedWarehouseId),
      });

      showToast(
        'success',
        'Shipment Created',
        \`Created shipment \${created.trackingNumber} for order #\${created.orderNumber} assigned to \${created.warehouseName || 'fulfillment warehouse'}.\`
      );

      setIsCreateModalOpen(false);
      setUnassignedOrders((prev) => prev.filter((o) => o.id !== Number(selectedOrderId)));
      setSelectedShipment(created);
      setIsDrawerOpen(true);
      await fetchShipments(false);
    } catch (err: any) {
      console.error('Shipment creation failed:', err);
      const msg =
        err?.response?.data?.message ||
        'Failed to create shipment. Please ensure the order exists and does not already have an active shipment.';
      showToast('error', 'Creation Failed', msg);
    } finally {
      setIsCreatingShipment(false);
    }
  };

`;

const sIdx = sContent.indexOf(oldHandlersTargetStart);
const eIdx = sContent.indexOf(oldHandlersTargetEnd);
if (sIdx >= 0 && eIdx > sIdx) {
  sContent = sContent.substring(0, sIdx) + newHandlers + sContent.substring(eIdx);
}

// 4. Update table headers to:
// Tracking Number | Order Number | Customer | Pickup | Fulfillment Warehouse | Destination | Delivery Type | Current Status | Expected Delivery | Actions
const oldTableHead = `                <tr>
                  {/* 1. TRACKING NUMBER */}
                  <th className="col-tracking">TRACKING NUMBER</th>
                  {/* 2. ORDER NUMBER */}
                  <th className="col-order-no">ORDER NUMBER</th>
                  {/* 3. CUSTOMER */}
                  <th className="col-entity-info">CUSTOMER</th>
                  {/* 4. ORIGIN */}
                  <th className="col-address">ORIGIN</th>
                  {/* 5. DESTINATION */}
                  <th className="col-address">DESTINATION</th>
                  {/* 6. DELIVERY TYPE */}
                  <th className="col-badge">DELIVERY TYPE</th>
                  {/* 7. CURRENT STATUS */}
                  <th className="col-status-badge">CURRENT STATUS</th>
                  {/* 8. EXPECTED DELIVERY */}
                  <th className="col-date-time">EXPECTED DELIVERY</th>
                  {/* 9. ACTIONS */}
                  <th className="col-table-actions">ACTIONS</th>
                </tr>`;

const newTableHead = `                <tr>
                  {/* 1. TRACKING NUMBER */}
                  <th className="col-tracking">TRACKING NUMBER</th>
                  {/* 2. ORDER NUMBER */}
                  <th className="col-order-no">ORDER NUMBER</th>
                  {/* 3. CUSTOMER */}
                  <th className="col-entity-info">CUSTOMER</th>
                  {/* 4. PICKUP */}
                  <th className="col-address">PICKUP</th>
                  {/* 5. FULFILLMENT WAREHOUSE */}
                  <th className="col-address">FULFILLMENT WAREHOUSE</th>
                  {/* 6. DESTINATION */}
                  <th className="col-address">DESTINATION</th>
                  {/* 7. DELIVERY TYPE */}
                  <th className="col-badge">DELIVERY TYPE</th>
                  {/* 8. CURRENT STATUS */}
                  <th className="col-status-badge">CURRENT STATUS</th>
                  {/* 9. EXPECTED DELIVERY */}
                  <th className="col-date-time">EXPECTED DELIVERY</th>
                  {/* 10. ACTIONS */}
                  <th className="col-table-actions">ACTIONS</th>
                </tr>`;

sContent = sContent.replace(oldTableHead, newTableHead);

// 5. Update Table Row origin cell to Pickup & Fulfillment Warehouse cells
const oldOriginCell = `                      {/* 4. ORIGIN */}
                      <td className="col-address">
                        <div
                          className="table-text-block"
                          title={\`\${s.origin || ''} — \${s.pickupAddress || ''}\`}
                        >
                          <span className="table-text-primary">{s.origin || '—'}</span>
                          <span className="table-text-secondary">{s.pickupAddress || ''}</span>
                        </div>
                      </td>`;

const newOriginCell = `                      {/* 4. PICKUP */}
                      <td className="col-address">
                        <div
                          className="table-text-block"
                          title={s.pickupAddress || s.pickupCity || ''}
                        >
                          <span className="table-text-primary">{s.pickupCity || s.pickupAddress || '—'}</span>
                          {s.pickupAddress && s.pickupCity && (
                            <span className="table-text-secondary">{s.pickupAddress}</span>
                          )}
                        </div>
                      </td>

                      {/* 5. FULFILLMENT WAREHOUSE */}
                      <td className="col-address">
                        <div
                          className="table-text-block"
                          title={\`\${s.warehouseName || ''} (\${s.warehouseCode || ''})\`}
                        >
                          <span className="table-text-primary" style={{ fontWeight: 600 }}>
                            {s.warehouseName || 'Unassigned'}
                          </span>
                          {s.warehouseCode && (
                            <span className="badge badge-slate" style={{ fontSize: 10, padding: '1px 5px', width: 'fit-content' }}>
                              {s.warehouseCode}
                            </span>
                          )}
                        </div>
                      </td>`;

sContent = sContent.replace(oldOriginCell, newOriginCell);

// 6. Update Create Shipment Modal JSX
const oldModalStart = '      {/* ── CREATE SHIPMENT MODAL ─────────────────────────────────────────── */}';
const oldModalEnd = '      {/* ── ASSIGN VEHICLE MODAL ─────────────────────────────────────────── */}';

const newModalJSX = `      {/* ── CREATE SHIPMENT MODAL ─────────────────────────────────────────── */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => !isCreatingShipment && setIsCreateModalOpen(false)}
        title="Create Shipment from Order"
        size="md"
      >
        <form onSubmit={handleConfirmCreateShipment}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '72vh', overflowY: 'auto', paddingRight: 4 }}>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
              Select a customer order and assign the initial fulfillment warehouse.
              The assigned Warehouse Manager will be responsible for operational picking, packing, driver assignment, and dispatch.
            </p>

            {loadingUnassigned ? (
              <div style={{ padding: '30px 0', textAlign: 'center' }}>
                <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 8px', color: 'var(--primary)' }} />
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Loading eligible orders...
                </p>
              </div>
            ) : unassignedOrders.length === 0 ? (
              <div
                style={{
                  background: 'var(--page-bg)',
                  padding: '20px',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                  border: '1px solid var(--border)',
                }}
              >
                <p style={{ fontWeight: 600, fontSize: 14, margin: '0 0 4px', color: 'var(--text-primary)' }}>
                  No eligible orders available.
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                  There are currently no customer orders waiting for fulfillment.
                </p>
              </div>
            ) : (
              <>
                {/* 1. SELECT ORDER */}
                <div className="form-group">
                  <label className="form-label form-label-required">
                    Select Order *
                  </label>
                  <select
                    className="form-select"
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(Number(e.target.value))}
                    disabled={isCreatingShipment}
                    required
                  >
                    {unassignedOrders.map((ord) => (
                      <option key={ord.id} value={ord.id}>
                        {ord.orderNumber} — {ord.customerName} ({ord.pickupCity || 'Origin'} → {ord.deliveryCity || 'Destination'}) • {(ord.deliveryType || 'STANDARD').replace('_', ' ')}
                      </option>
                    ))}
                  </select>

                  {(() => {
                    const currentOrd = unassignedOrders.find((o) => o.id === Number(selectedOrderId));
                    if (!currentOrd) return null;
                    return (
                      <div
                        style={{
                          marginTop: 10,
                          padding: '12px 14px',
                          background: 'var(--page-bg)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border)',
                          fontSize: 12,
                        }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.04em' }}>
                          ORDER DETAILS
                        </div>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '8px 14px',
                          }}
                        >
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Customer: </span>
                            <strong style={{ color: 'var(--text-primary)' }}>{currentOrd.customerName}</strong>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Delivery Type: </span>
                            <span className="badge badge-slate" style={{ fontSize: 10, padding: '2px 6px' }}>
                              {(currentOrd.deliveryType || 'STANDARD').replace('_', ' ')}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Pickup: </span>
                            <span style={{ color: 'var(--text-secondary)' }}>{currentOrd.pickupAddress || currentOrd.pickupCity || '—'}</span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Destination: </span>
                            <span style={{ color: 'var(--text-secondary)' }}>{currentOrd.deliveryAddress || currentOrd.deliveryCity || '—'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* 2. SELECT FULFILLMENT WAREHOUSE */}
                <div className="form-group">
                  <label className="form-label form-label-required">
                    FULFILLMENT WAREHOUSE *
                  </label>
                  <select
                    className="form-select"
                    value={selectedWarehouseId}
                    onChange={(e) => setSelectedWarehouseId(e.target.value ? Number(e.target.value) : '')}
                    disabled={isCreatingShipment || loadingWarehouses || !!warehouseError}
                    required
                  >
                    {loadingWarehouses ? (
                      <option value="">Loading active warehouses...</option>
                    ) : warehouseError ? (
                      <option value="">{warehouseError}</option>
                    ) : activeWarehouses.length === 0 ? (
                      <option value="">No active warehouses found</option>
                    ) : (
                      <>
                        <option value="" disabled>-- Select Warehouse --</option>
                        {activeWarehouses.map((wh) => (
                          <option key={wh.id} value={wh.id}>
                            {wh.warehouseName} ({wh.warehouseCode}) — {wh.city}
                          </option>
                        ))}
                      </>
                    )}
                  </select>

                  {/* Derived Warehouse Manager Card (dynamically displayed from selected warehouse) */}
                  {(() => {
                    const currentWh = activeWarehouses.find((w) => w.id === Number(selectedWarehouseId));
                    if (!currentWh) return null;
                    return (
                      <div
                        style={{
                          marginTop: 10,
                          padding: '12px 14px',
                          background: 'rgba(37, 99, 235, 0.03)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid rgba(37, 99, 235, 0.15)',
                          fontSize: 12,
                        }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', marginBottom: 6, letterSpacing: '0.04em' }}>
                          FULFILLMENT RESPONSIBILITY
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px 14px' }}>
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Warehouse Manager: </span>
                            <strong style={{ color: 'var(--text-primary)' }}>{currentWh.managerName || 'Operations Lead'}</strong>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Email: </span>
                            <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{currentWh.managerEmail || '—'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* 3. SHIPMENT SUMMARY */}
                <div
                  style={{
                    padding: '12px 14px',
                    background: 'var(--page-bg)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    fontSize: 12,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '6px 14px',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Tracking Number: </span>
                    <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>Generated by backend</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Initial Status: </span>
                    <span className="badge badge-amber" style={{ fontSize: 10, padding: '2px 6px' }}>PENDING</span>
                  </div>
                </div>
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={isCreatingShipment}
              >
                Cancel
              </button>

              {unassignedOrders.length > 0 && (
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isCreatingShipment || !selectedOrderId || !selectedWarehouseId}
                >
                  {isCreatingShipment ? 'Creating Shipment...' : 'Create Shipment'}
                </button>
              )}
            </div>
          </div>
        </form>
      </Modal>

`;

const mStart = sContent.indexOf(oldModalStart);
const mEnd = sContent.indexOf(oldModalEnd);
if (mStart >= 0 && mEnd > mStart) {
  sContent = sContent.substring(0, mStart) + newModalJSX + sContent.substring(mEnd);
}

fs.writeFileSync(shipmentsPath, sContent, 'utf8');
console.log("Updated Shipments.tsx successfully!");
