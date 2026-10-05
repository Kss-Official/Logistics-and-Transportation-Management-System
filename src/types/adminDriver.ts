export type DriverStatus =
  | 'AVAILABLE'
  | 'ON_DUTY'
  | 'ON_DELIVERY'
  | 'ON_TRIP'
  | 'OFF_DUTY'
  | 'INACTIVE';

export interface AdminDriver {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  address?: string | null;
  warehouseId?: number;
  warehouseName?: string;
  vehicleId?: number;
  vehicleNumber?: string;
  currentShipmentTrackingNumber?: string;
  status: DriverStatus;
  assignedShipmentsCount?: number;
  assignedShipmentNumbers?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateDriverPayload {
  fullName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  address?: string;
  warehouseId?: number;
  vehicleId?: number;
  status?: DriverStatus;
}

export interface UpdateDriverPayload {
  fullName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  address?: string;
  warehouseId?: number;
  vehicleId?: number;
  status?: DriverStatus;
}
