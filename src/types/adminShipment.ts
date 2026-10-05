import type { DeliveryType } from './order';
import type { ShipmentStatus } from './shipment';
import type { DriverStatus } from './adminDriver';

export interface AdminShipmentTrackingEvent {
  id: number;
  status: string;
  title: string;
  description: string;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  eventTime: string;
  completed: boolean;
  current: boolean;
}

export interface AdminShipment {
  id: number;
  trackingNumber: string;

  orderId: number;
  orderNumber: string;

  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;

  pickupAddress: string;
  pickupCity: string;
  pickupState: string;

  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;

  origin: string;
  destination: string;

  deliveryType: DeliveryType;
  status: ShipmentStatus;
  expectedDelivery: string;
  currentLocation: string;

  driverId?: number | null;
  assignedDriver: string | null;
  driverPhone?: string | null;
  driverStatus?: DriverStatus | null;

  assignedVehicle: string | null;
  vehicleId?: number | null;
  vehicleNumber?: string | null;
  vehicleModel?: string | null;
  vehicleType?: string | null;
  vehicleRegistrationNumber?: string | null;

  packageDescription?: string;
  packageWeight?: number;
  packageQuantity?: number;

  warehouseId?: number;
  warehouseCode?: string;
  warehouseName?: string;
  warehouseManagerName?: string;
  warehouseManagerEmail?: string;
  shipmentNumber?: string;

  // Assignment & Audit
  assignmentStatus?: string;
  assignedBy?: string;
  assignedAt?: string;

  createdAt: string;
  updatedAt: string;

  events: AdminShipmentTrackingEvent[];
}

export interface AdminCreateShipmentPayload {
  orderId: number;
  warehouseId: number;
}

export interface AdminUpdateShipmentStatusPayload {
  status: ShipmentStatus;
  locationName?: string;
  description?: string;
}

export interface AdminUpdateShipmentPayload {
  status?: ShipmentStatus;
  currentLocationName?: string;
  estimatedDeliveryDate?: string;
  driverId?: number;
}

export interface AdminOverrideAssignmentPayload {
  driverId: number;
  vehicleId: number;
  reason: string;
}
