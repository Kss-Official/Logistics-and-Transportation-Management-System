const fs = require('fs');

// 1. Update src/pages/admin/Drivers.tsx
let driversContent = fs.readFileSync('src/pages/admin/Drivers.tsx', 'utf8');

// Add warehouseService import
if (!driversContent.includes('warehouseService')) {
  driversContent = driversContent.replace(
    "import vehicleService from '../../services/vehicleService';",
    "import vehicleService from '../../services/vehicleService';\nimport { warehouseService } from '../../services/warehouseService';\nimport type { Warehouse } from '../../types/warehouse';"
  );

  // Add warehouses state
  driversContent = driversContent.replace(
    'const [vehicles, setVehicles] = useState<Vehicle[]>([]);',
    'const [vehicles, setVehicles] = useState<Vehicle[]>([]);\n  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);'
  );

  // Update fetch data
  driversContent = driversContent.replace(
    'const [driversData, vehiclesData] = await Promise.all([',
    'const [driversData, vehiclesData, warehousesData] = await Promise.all(['
  );
  driversContent = driversContent.replace(
    'vehicleService.getAllVehicles().catch(() => []),',
    'vehicleService.getAllVehicles().catch(() => []),\n        warehouseService.getAllWarehouses().catch(() => []),'
  );
  driversContent = driversContent.replace(
    'setVehicles(vehiclesData);',
    'setVehicles(vehiclesData);\n      setWarehouses(warehousesData);'
  );

  // Update formData
  driversContent = driversContent.replace(
    "status: 'AVAILABLE' as DriverStatus,",
    "status: 'AVAILABLE' as DriverStatus,\n    warehouseId: undefined as number | undefined,"
  );

  // Update handleOpenAddModal
  driversContent = driversContent.replace(
    "status: 'AVAILABLE',",
    "status: 'AVAILABLE',\n      warehouseId: undefined,"
  );

  // Update handleOpenEditModal
  driversContent = driversContent.replace(
    'status: driver.status,',
    'status: driver.status,\n      warehouseId: driver.warehouseId,'
  );

  // Update table headers
  driversContent = driversContent.replace(
    '<th>PHONE</th>',
    '<th>PHONE</th>\n                  <th>WAREHOUSE</th>\n                  <th>VEHICLE</th>'
  );

  // Update table row
  driversContent = driversContent.replace(
    `                      {/* PHONE */}
                      <td style={{ whiteSpace: 'nowrap', fontSize: 13 }}>
                        {d.phone}
                      </td>`,
    `                      {/* PHONE */}
                      <td style={{ whiteSpace: 'nowrap', fontSize: 13 }}>
                        {d.phone}
                      </td>

                      {/* WAREHOUSE */}
                      <td style={{ fontSize: 12 }}>
                        {d.warehouseName ? (
                          <span className="badge badge-indigo" style={{ fontSize: 11 }}>
                            {d.warehouseName}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>
                        )}
                      </td>

                      {/* VEHICLE */}
                      <td style={{ fontSize: 12, fontFamily: 'monospace' }}>
                        {d.vehicleNumber ? (
                          <span className="badge badge-slate" style={{ fontSize: 11 }}>
                            {d.vehicleNumber}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>None</span>
                        )}
                      </td>`
  );

  // Add warehouse dropdown to Add/Edit modal form
  const warehouseFormSelect = `
            {/* Fulfillment Warehouse */}
            <div className="form-group">
              <label className="form-label">Assigned Fulfillment Warehouse</label>
              <select
                className="form-control"
                value={formData.warehouseId || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    warehouseId: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
              >
                <option value="">-- Unassigned (Company Wide) --</option>
                {warehouses
                  .filter((w) => w.status === 'ACTIVE')
                  .map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.warehouseCode} - {w.warehouseName} ({w.city})
                    </option>
                  ))}
              </select>
              <span className="form-hint" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Associates this driver with a specific regional fulfillment facility.
              </span>
            </div>
`;
  driversContent = driversContent.replace(
    '{/* Driver Status */}',
    warehouseFormSelect + '\n            {/* Driver Status */}'
  );

  fs.writeFileSync('src/pages/admin/Drivers.tsx', driversContent, 'utf8');
  console.log('Updated src/pages/admin/Drivers.tsx');
}

// 2. Update src/pages/admin/Vehicles.tsx
let vehiclesContent = fs.readFileSync('src/pages/admin/Vehicles.tsx', 'utf8');

if (!vehiclesContent.includes('warehouseService')) {
  vehiclesContent = vehiclesContent.replace(
    "import driverService from '../../services/driverService';",
    "import driverService from '../../services/driverService';\nimport { warehouseService } from '../../services/warehouseService';\nimport type { Warehouse } from '../../types/warehouse';"
  );

  // Add warehouses state
  vehiclesContent = vehiclesContent.replace(
    'const [drivers, setDrivers] = useState<AdminDriver[]>([]);',
    'const [drivers, setDrivers] = useState<AdminDriver[]>([]);\n  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);'
  );

  // Update fetch data
  vehiclesContent = vehiclesContent.replace(
    'const [vehData, drvData] = await Promise.all([',
    'const [vehData, drvData, whData] = await Promise.all(['
  );
  vehiclesContent = vehiclesContent.replace(
    'driverService.getAllDrivers().catch(() => []),',
    'driverService.getAllDrivers().catch(() => []),\n        warehouseService.getAllWarehouses().catch(() => []),'
  );
  vehiclesContent = vehiclesContent.replace(
    'setDrivers(drvData);',
    'setDrivers(drvData);\n      setWarehouses(whData);'
  );

  // Update formData
  vehiclesContent = vehiclesContent.replace(
    "capacityUnit: 'TONS',",
    "capacityUnit: 'TONS',\n    warehouseId: undefined as number | undefined,"
  );

  // Update handleOpenAddModal
  vehiclesContent = vehiclesContent.replace(
    "capacityUnit: 'TONS',",
    "capacityUnit: 'TONS',\n      warehouseId: undefined,"
  );

  // Update handleOpenEditModal
  vehiclesContent = vehiclesContent.replace(
    'capacityUnit: vehicle.capacityUnit,',
    'capacityUnit: vehicle.capacityUnit,\n      warehouseId: vehicle.warehouseId,'
  );

  // Update table header: add Warehouse column
  vehiclesContent = vehiclesContent.replace(
    '<th style={{ padding: \'12px 16px\', fontSize: 12, fontWeight: 600, color: \'var(--text-secondary)\', whiteSpace: \'nowrap\' }}>Model & Make</th>',
    '<th style={{ padding: \'12px 16px\', fontSize: 12, fontWeight: 600, color: \'var(--text-secondary)\', whiteSpace: \'nowrap\' }}>Model & Make</th>\n                    <th style={{ padding: \'12px 16px\', fontSize: 12, fontWeight: 600, color: \'var(--text-secondary)\', whiteSpace: \'nowrap\' }}>Warehouse</th>'
  );

  // Update table row: add Warehouse cell
  vehiclesContent = vehiclesContent.replace(
    `                      {/* Capacity */}
                      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>`,
    `                      {/* Warehouse */}
                      <td style={{ padding: '12px 16px', fontSize: 12, whiteSpace: 'nowrap' }}>
                        {v.warehouseName ? (
                          <span className="badge badge-indigo" style={{ fontSize: 11 }}>
                            {v.warehouseName}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>
                        )}
                      </td>

                      {/* Capacity */}
                      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>`
  );

  // Add warehouse dropdown to Add/Edit vehicle form
  const vehWhSelect = `
            {/* Warehouse Assignment */}
            <div className="form-group">
              <label className="form-label">Base Warehouse</label>
              <select
                className="form-control"
                value={formData.warehouseId || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    warehouseId: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
              >
                <option value="">-- Unassigned (Company Fleet) --</option>
                {warehouses
                  .filter((w) => w.status === 'ACTIVE')
                  .map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.warehouseCode} - {w.warehouseName} ({w.city})
                    </option>
                  ))}
              </select>
            </div>
`;
  vehiclesContent = vehiclesContent.replace(
    '{/* Current Location */}',
    vehWhSelect + '\n            {/* Current Location */}'
  );

  fs.writeFileSync('src/pages/admin/Vehicles.tsx', vehiclesContent, 'utf8');
  console.log('Updated src/pages/admin/Vehicles.tsx');
}
