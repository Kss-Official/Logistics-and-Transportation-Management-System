export type DriverStatus = 'AVAILABLE' | 'ON_DELIVERY' | 'OFF_DUTY' | 'INACTIVE';

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  vehicleId?: string;
  assignedVehicle: string;
  assignedVehicleReg: string;
  status: DriverStatus;
  totalDeliveries: number;
  onTimeDeliveries: number;
  rating: number;
  joinedDate: string;
  currentShipment?: string;
  avatarInitials: string;
}
