export type VehicleStatus = 'AVAILABLE' | 'ASSIGNED' | 'IN_TRANSIT' | 'MAINTENANCE' | 'INACTIVE';

export type VehicleType =
  | 'VAN'
  | 'TRUCK'
  | 'MINI_TRUCK'
  | 'HEAVY_TRUCK'
  | 'CONTAINER_TRUCK'
  | 'TEMPO'
  | 'REFRIGERATED_TRUCK';

export interface Vehicle {
  id: number | string;
  vehicleNumber?: string;
  vehicleType?: VehicleType;
  manufacturer?: string;
  model: string;
  capacity?: number | string;
  capacityUnit?: string;
  registrationNumber: string;
  registrationExpiry?: string;
  insuranceExpiry?: string;
  status: VehicleStatus;
  currentLocation?: string;
  warehouseId?: number;
  warehouseName?: string;

  // Driver telemetry
  driverId?: number | string | null;
  driverName?: string;
  driverPhone?: string;

  // Shipment telemetry
  currentShipmentId?: number | string | null;
  currentShipmentTrackingNumber?: string;
  currentShipmentOrderNumber?: string;
  currentShipmentStatus?: string;
  currentShipmentOrigin?: string;
  currentShipmentDestination?: string;

  createdAt?: string;
  updatedAt?: string;

  // Backward compatibility fields
  driver?: string;
  type?: string;
  make?: string;
  year?: number;
  capacityTons?: number;
  fuelType?: string;
  lastService?: string;
  nextService?: string;
  totalTrips?: number;
}

export interface CreateVehiclePayload {
  vehicleNumber: string;
  vehicleType: VehicleType;
  manufacturer?: string;
  model: string;
  capacity: number;
  capacityUnit?: string;
  registrationNumber: string;
  registrationExpiry: string;
  insuranceExpiry: string;
  currentLocation?: string;
  warehouseId?: number | null;
  driverId?: number | string | null;
  status?: VehicleStatus;
}

export interface UpdateVehiclePayload {
  vehicleNumber: string;
  vehicleType: VehicleType;
  manufacturer?: string;
  model: string;
  capacity: number;
  capacityUnit?: string;
  registrationNumber: string;
  registrationExpiry: string;
  insuranceExpiry: string;
  currentLocation?: string;
  warehouseId?: number | null;
  driverId?: number | string | null;
  status?: VehicleStatus;
}

