const fs = require('fs');

// 1. src/types/adminDriver.ts
let driverTypes = fs.readFileSync('src/types/adminDriver.ts', 'utf8');
if (!driverTypes.includes('warehouseId')) {
  driverTypes = driverTypes.replace(
    'address?: string;',
    'address?: string;\n  warehouseId?: number;\n  warehouseName?: string;\n  vehicleId?: number;\n  vehicleNumber?: string;\n  currentShipmentTrackingNumber?: string;'
  );
  driverTypes = driverTypes.replace(
    'status?: DriverStatus;',
    'status?: DriverStatus;\n  warehouseId?: number;'
  );
  fs.writeFileSync('src/types/adminDriver.ts', driverTypes, 'utf8');
  console.log('Updated src/types/adminDriver.ts');
}

// 2. src/types/vehicle.ts
let vehicleTypes = fs.readFileSync('src/types/vehicle.ts', 'utf8');
if (!vehicleTypes.includes('warehouseId')) {
  vehicleTypes = vehicleTypes.replace(
    'currentLocation?: string;',
    'currentLocation?: string;\n  warehouseId?: number;\n  warehouseName?: string;'
  );
  vehicleTypes = vehicleTypes.replace(
    'currentLocation?: string;\n}',
    'currentLocation?: string;\n  warehouseId?: number;\n}'
  );
  fs.writeFileSync('src/types/vehicle.ts', vehicleTypes, 'utf8');
  console.log('Updated src/types/vehicle.ts');
}

// 3. src/types/warehouse.ts
let whTypes = fs.readFileSync('src/types/warehouse.ts', 'utf8');
if (!whTypes.includes('availableDriverCount')) {
  whTypes = whTypes.replace(
    'activeShipmentCount?: number;',
    'activeShipmentCount?: number;\n  availableDriverCount?: number;\n  availableVehicleCount?: number;'
  );
  fs.writeFileSync('src/types/warehouse.ts', whTypes, 'utf8');
  console.log('Updated src/types/warehouse.ts');
}

// 4. src/types/adminDashboard.ts
let dashTypes = fs.readFileSync('src/types/adminDashboard.ts', 'utf8');
if (!dashTypes.includes('NeedsAttentionItem')) {
  dashTypes += `\nexport interface NeedsAttentionItem {
  key: string;
  title: string;
  count: number;
  description: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  link: string;
}
`;
  dashTypes = dashTypes.replace(
    'openTickets: number;',
    `openTickets: number;
  ordersAwaitingWarehouseAssignment?: number;
  pendingOrderReview?: number;
  shipmentsAwaitingProcessing?: number;
  activeShipments?: number;
  inTransitShipments?: number;
  deliveredShipments?: number;
  delayedShipments?: number;
  activeWarehouses?: number;
  availableDrivers?: number;
  driversOnTrip?: number;
  availableVehicles?: number;
  vehiclesInTransit?: number;
  vehiclesUnderMaintenance?: number;
  lowInventoryAlerts?: number;
  needsAttention?: NeedsAttentionItem[];`
  );
  fs.writeFileSync('src/types/adminDashboard.ts', dashTypes, 'utf8');
  console.log('Updated src/types/adminDashboard.ts');
}
