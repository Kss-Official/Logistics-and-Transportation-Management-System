const fs = require('fs');

// 1. Fix src/types/adminDriver.ts
const adminDriverTypes = `export type DriverStatus =
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
  status?: DriverStatus;
}
`;
fs.writeFileSync('src/types/adminDriver.ts', adminDriverTypes, 'utf8');
console.log('Fixed src/types/adminDriver.ts');

// 2. Fix src/pages/admin/AdminDashboard.tsx icon import
let dash = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf8');
if (!dash.includes('AlertTriangle,')) {
  dash = dash.replace(
    '  AlertOctagon, Clock, ShieldAlert, Building2, UserCheck, Wrench,',
    '  AlertOctagon, Clock, ShieldAlert, Building2, UserCheck, Wrench, AlertTriangle,'
  );
  fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', dash, 'utf8');
  console.log('Fixed src/pages/admin/AdminDashboard.tsx imports');
}

// 3. Fix src/pages/admin/Vehicles.tsx formData
let veh = fs.readFileSync('src/pages/admin/Vehicles.tsx', 'utf8');

// Fix formData state declaration
veh = veh.replace(
  /const \[formData, setFormData\] = useState\(\{[\s\S]*?\}\);/,
  `const [formData, setFormData] = useState({
    vehicleNumber: '',
    vehicleType: 'TRUCK' as VehicleType,
    manufacturer: '',
    model: '',
    capacity: '',
    capacityUnit: 'TONS',
    warehouseId: undefined as number | undefined,
    registrationNumber: '',
    registrationExpiry: '',
    insuranceExpiry: '',
    currentLocation: '',
    driverId: '',
  });`
);

// Fix handleOpenAddModal
veh = veh.replace(
  /setFormData\(\{[\s\S]*?vehicleType: 'TRUCK'[\s\S]*?\}\);/,
  `setFormData({
      vehicleNumber: '',
      vehicleType: 'TRUCK',
      manufacturer: '',
      model: '',
      capacity: '',
      capacityUnit: 'TONS',
      warehouseId: undefined,
      registrationNumber: '',
      registrationExpiry: '',
      insuranceExpiry: '',
      currentLocation: '',
      driverId: '',
    });`
);

fs.writeFileSync('src/pages/admin/Vehicles.tsx', veh, 'utf8');
console.log('Fixed src/pages/admin/Vehicles.tsx');
