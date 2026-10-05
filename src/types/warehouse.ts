export type WarehouseStatus = 'ACTIVE' | 'FULL' | 'MAINTENANCE' | 'INACTIVE';

export type WarehouseType =
  | 'DISTRIBUTION_CENTER'
  | 'FULFILLMENT_CENTER'
  | 'STORAGE_WAREHOUSE'
  | 'COLD_STORAGE'
  | 'CROSS_DOCK'
  | 'TRANSIT_HUB';

export interface Warehouse {
  id: string | number;
  warehouseCode?: string;
  warehouseName?: string;
  warehouseType?: WarehouseType;
  status: WarehouseStatus;
  managerName?: string;
  managerPhone?: string;
  managerEmail?: string;
  addressLine1?: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  totalCapacity: number;
  occupiedCapacity?: number;
  availableCapacity?: number;
  utilizationRate?: number;
  capacityUnit?: string;
  operatingHours?: string;
  contactPhone?: string;
  contactEmail?: string;
  activeShipmentCount?: number;
  availableDriverCount?: number;
  availableVehicleCount?: number;
  activeRouteCount?: number;
  inboundLoadCount?: number;
  outboundLoadCount?: number;
  createdAt?: string;
  updatedAt?: string;

  // Backward compatibility fields for legacy mockData and Reports
  name: string;
  location: string;
  manager: string;
  managerId?: string;
  usedCapacity: number;
  activeShipments?: number;
  openingHours?: string;
}

export interface CreateWarehousePayload {
  warehouseCode: string;
  warehouseName: string;
  warehouseType: WarehouseType;
  status: WarehouseStatus;
  managerName: string;
  managerPhone?: string;
  managerEmail?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  totalCapacity: number;
  occupiedCapacity?: number;
  capacityUnit?: string;
  operatingHours?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export interface UpdateWarehousePayload {
  warehouseCode: string;
  warehouseName: string;
  warehouseType: WarehouseType;
  status?: WarehouseStatus;
  managerName: string;
  managerPhone?: string;
  managerEmail?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  totalCapacity: number;
  occupiedCapacity?: number;
  capacityUnit?: string;
  operatingHours?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export interface Route {
  id: string;
  origin: string;
  destination: string;
  originCity: string;
  destinationCity: string;
  distanceKm: number;
  estimatedTimeHours: number;
  vehicleId?: string;
  vehicle: string;
  driverId?: string;
  driver: string;
  activeShipments: number;
  totalShipments: number;
  status: 'ACTIVE' | 'INACTIVE';
  avgRating: number;
}

export interface SupportTicket {
  id: string;
  customerId: string;
  customer: string;
  subject: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  orderId?: string;
}
