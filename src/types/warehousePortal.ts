export interface WarehouseTrackingEvent {
  id?: number;
  status?: string;
  title: string;
  description?: string;
  locationName?: string;
  eventTime: string;
}

export interface WarehouseActivity {
  who: string;
  what: string;
  where: string;
  whenFormatted: string;
  timestamp: string;
  type: string;
  reference?: string;
}

export interface WarehouseInventoryItem {
  id: number;
  sku: string;
  productName: string;
  category: string;
  totalStock: number;
  availableStock: number;
  reservedStock: number;
  damagedStock: number;
  reorderLevel: number;
  unitPrice: number;
  unit: string;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  updatedAt: string;
}

export interface WarehouseTransaction {
  id: number;
  sku: string;
  productName: string;
  transactionType: 'RECEIVE' | 'DISPATCH' | 'RESERVE' | 'RELEASE' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'ADJUSTMENT' | 'DAMAGE';
  quantity: number;
  previousAvailable: number;
  newAvailable: number;
  performedBy: string;
  timestamp: string;
  reason?: string;
  referenceOrder?: string;
  referenceShipment?: string;
}

export interface WarehouseShipmentItem {
  id: number;
  trackingNumber: string;
  orderId?: number;
  orderNumber?: string;
  status: string;
  operationalStage: string;
  originWarehouseId?: number;
  originWarehouseName?: string;
  originCity?: string;
  originWarehouseAddress?: string;
  pickupAddress?: string;
  destinationWarehouseId?: number;
  destinationWarehouseName?: string;
  destinationCity?: string;
  destinationWarehouseAddress?: string;
  deliveryAddress?: string;
  packageDescription?: string;
  packageWeight?: number;
  packageQuantity?: number;
  deliveryType?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  trackingEvents?: WarehouseTrackingEvent[];
  driverId?: number;
  driverName?: string;
  driverPhone?: string;
  driverStatus?: string;
  vehicleId?: number;
  vehicleNumber?: string;
  vehicleType?: string;
  vehicleModel?: string;
  vehicleRegistrationNumber?: string;
  vehicleStatus?: string;
  estimatedDeliveryDate?: string;
  receivedAt?: string;
  createdAt: string;
  updatedAt: string;
  currentLatitude?: number;
  currentLongitude?: number;
  currentLocationName?: string;
  lastLocationUpdatedAt?: string;
  readyForDispatch: boolean;
  items?: WarehouseShipmentOrderItem[];
}

export interface WarehouseShipmentOrderItem {
  id?: number;
  productId?: number;
  sku?: string;
  productName?: string;
  category?: string;
  quantity: number;
  unitWeight?: number;
  unitPrice?: number;
  totalWeight?: number;
}

export interface WarehouseOrderItem {
  id: number;
  orderNumber: string;
  customerId?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  pickupAddress?: string;
  pickupCity?: string;
  pickupState?: string;
  pickupPostalCode?: string;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryState?: string;
  deliveryPostalCode?: string;
  deliveryType?: string;
  packageDescription?: string;
  packageQuantity?: number;
  packageWeight?: number;
  subtotal?: number;
  prioritySurcharge?: number;
  taxAmount?: number;
  totalAmount?: number;
  status: string;
  operationalStage?: string;
  trackingNumber?: string;
  shipmentId?: number;
  originWarehouseId?: number;
  originWarehouseName?: string;
  originWarehouseCode?: string;
  driverName?: string;
  vehicleNumber?: string;
  canStartProcessing: boolean;
  canMarkPacked: boolean;
  canReadyForDispatch: boolean;
  items?: Array<{
    id?: number;
    productId?: number;
    productName?: string;
    sku?: string;
    category?: string;
    quantity: number;
    unitPrice?: number;
    unitWeight?: number;
    totalWeight?: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseDashboardData {
  warehouseId: number;
  warehouseCode: string;
  warehouseName: string;
  warehouseType: string;
  managerName: string;
  managerEmail: string;
  city: string;
  state: string;
  totalCapacity: number;
  occupiedCapacity: number;
  availableCapacity: number;
  utilizationRate: number;
  status: string;
  operatingHours: string;

  totalInventoryItems: number;
  availableStock: number;
  reservedStock: number;
  damagedStock: number;
  lowStockCount: number;

  incomingShipmentsCount: number;
  outgoingShipmentsCount: number;
  readyToProcessCount?: number;
  pickingCount?: number;
  packedCount?: number;
  readyForDispatchCount: number;

  driversAvailableCount: number;
  driversTotalCount: number;
  vehiclesAvailableCount: number;
  vehiclesTotalCount: number;

  recentActivities: WarehouseActivity[];
  lowStockAlerts: WarehouseInventoryItem[];
  incomingPreview: WarehouseShipmentItem[];
  outgoingPreview: WarehouseShipmentItem[];
  fulfillmentAlerts?: FulfillmentAlert[];
}

export interface FulfillmentAlert {
  productId: number;
  sku: string;
  productName: string;
  category: string;
  requiredQuantity: number;
  availableStock: number;
  pendingOrdersCount: number;
  status: 'AVAILABLE' | 'INSUFFICIENT_STOCK';
}

export interface WarehouseDriverItem {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  status: 'AVAILABLE' | 'ON_TRIP' | 'OFF_DUTY' | 'INACTIVE';
  currentShipment: string;
  currentShipmentId?: number | null;
  assignedVehicle: string;
  lastLocation: string;
  lastUpdated: string;
}

export interface WarehouseVehicleItem {
  id: number;
  vehicleNumber: string;
  vehicleType: string;
  model: string;
  manufacturer: string;
  capacity: number;
  capacityUnit: string;
  status: 'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE' | 'INACTIVE';
  currentShipment: string;
  currentShipmentId?: number | null;
  currentDriver: string;
  lastLocation: string;
  lastUpdated: string;
}

export interface WarehouseReportData {
  warehouseCode: string;
  warehouseName: string;
  dateRange: string;
  totalItems: number;
  totalStockQuantity: number;
  stockValue: number;
  totalDispatches: number;
  activeShipments: number;
  averageUtilization: number;
  stockByCategory: Array<{ category: string; units: number }>;
  dailyDispatches: Array<{ day: string; dispatches: number; received: number }>;
  fleetUtilization: Array<{ name: string; value: number }>;
  transactionBreakdown: Array<{ type: string; count: number }>;
}

export interface WarehouseNotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'WARNING' | 'INFO' | 'SUCCESS' | 'ALERT';
  createdAt: string;
  read: boolean;
}

export interface ReceiveStockPayload {
  sku: string;
  productName?: string;
  category?: string;
  quantity: number;
  reason?: string;
  referenceNumber?: string;
  unitPrice?: number;
  unit?: string;
  reorderLevel?: number;
}

export interface ReserveStockPayload {
  sku: string;
  quantity: number;
  referenceOrder?: string;
  reason?: string;
}

export interface AdjustStockPayload {
  sku: string;
  newTotalStock: number;
  reason: string;
}

export interface AssignFleetPayload {
  driverId?: number;
  vehicleId?: number;
}

export interface UpdateWarehousePayload {
  operatingHours?: string;
  contactPhone?: string;
  contactEmail?: string;
  managerPhone?: string;
  managerEmail?: string;
  dockDoors?: number;
}
