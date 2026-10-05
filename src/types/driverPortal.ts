export type DriverStatus = 'AVAILABLE' | 'ON_DUTY' | 'ASSIGNED' | 'ON_TRIP' | 'OFF_DUTY' | 'SUSPENDED' | 'ON_BREAK';

export type DeliveryStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'DISPATCHED'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'ARRIVED_AT_PICKUP'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'ARRIVED_AT_DESTINATION'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'FAILED_DELIVERY';

export interface CargoItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  weightKg: number;
  packageType?: string;
  description?: string;
  dimensions?: string;
  isHazardous?: boolean;
}

export interface HubLocation {
  id: number;
  name: string;
  code: string;
  city: string;
  address: string;
  dockNumber?: string;
  contactName: string;
  contactPhone: string;
  coordinates: [number, number]; // [lat, lng]
}

export interface CustomerDestination {
  customerName: string;
  companyName?: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  deliveryNotes?: string;
  coordinates: [number, number]; // [lat, lng]
}

export interface ProofOfDeliveryData {
  deliveryId?: string;
  recipientName?: string;
  receivedBy?: string;
  signatureBase64?: string;
  signatureData?: string;
  photoUrl?: string;
  notes?: string;
  deliveredAt?: string;
  timestamp?: string;
  deliveryCoordinates?: [number, number];
}

export interface DriverTrackingEvent {
  id?: number;
  status: string;
  title: string;
  description: string;
  location: string;
  timestamp: string;
  latitude?: number;
  longitude?: number;
}

export interface DeliveryAssignment {
  id: string;
  trackingNumber: string;
  orderNumber: string;
  status: DeliveryStatus;
  priority: 'CRITICAL' | 'HIGH' | 'STANDARD';
  assignedAt: string;
  assignedDate: string;
  pickupEta: string;
  deliveryEta: string;
  estimatedDeliveryTime: string;
  totalQuantity: number;
  totalPackages: number;
  totalWeightKg: number;
  volumeCbm?: number;
  cargoSummary?: string;
  customerOrderRef?: string;
  recipientName: string;
  recipientPhone: string;
  recipientEmail: string;
  recipientCity: string;
  cargoItems: CargoItem[];
  trackingEvents?: DriverTrackingEvent[];
  pickupHub: HubLocation;
  destination: CustomerDestination;
  pickupLocation: {
    facilityName: string;
    address: string;
    city: string;
    dockBay: string;
    contactPerson: string;
    contactPhone: string;
    specialInstructions?: string;
  };
  deliveryLocation: {
    facilityName: string;
    address: string;
    city: string;
    specialInstructions?: string;
  };
  distanceKm: number;
  estimatedDurationMins: number;
  currentLatitude?: number;
  currentLongitude?: number;
  currentLocationName?: string;
  lastLocationUpdatedAt?: string;
  pickupChecklistCompleted?: boolean;
  deliveryChecklistCompleted?: boolean;
  proofOfDelivery?: ProofOfDeliveryData;
}

export interface DriverProfileData {
  id: string;
  fullName: string;
  name?: string;
  email: string;
  phone: string;
  address?: string;
  driverCode: string;
  driverId?: string;
  licenseNumber: string;
  licenseExpiry: string;
  status: DriverStatus;
  assignedVehicleId: string;
  assignedVehiclePlate: string;
  assignedVehicleModel: string;
  assignedVehicleCode?: string;
  assignedWarehouseName: string;
  assignedWarehouseCode?: string;
  assignedWarehouseId?: string;
  assignedHub?: string;
  totalTripsCompleted: number;
  totalDeliveriesCompleted: number;
  onTimeRatePercentage: number;
  onTimeRatePercent?: number;
  safetyRating: number; // e.g. 4.9
  rating?: number;
  shiftStartedAt?: string;
}

export interface VehicleTelemetry {
  id: string;
  vehicleNumber: string;
  vehicleCode?: string;
  plateNumber: string;
  licensePlate?: string;
  registrationNumber?: string;
  manufacturer?: string;
  model: string;
  type: string;
  vehicleType?: string;
  capacityTons: number;
  capacityUnit?: string;
  fuelPercentage: number;
  fuelLevelPercent?: number;
  odometerKm: number;
  engineTemperatureC: number;
  engineTempCelsius?: number;
  tirePressurePsi: number;
  batteryVoltage?: number;
  status: string;
  lastInspectionDate: string;
  insuranceExpiry: string;
  pucExpiry: string;
  registrationExpiry?: string;
  warehouseName?: string;
  assignedWarehouseName?: string;
  assignedWarehouseCode?: string;
  currentLocation?: string;
}

export interface VehicleInspectionItem {
  id: string;
  label: string;
  category?: string;
  passed?: boolean;
  status?: 'PASS' | 'FAIL';
}

export interface VehicleInspectionReport {
  id: string;
  driverId: string;
  vehiclePlate?: string;
  vehicleCode?: string;
  timestamp: string;
  odometerKm: number;
  condition?: 'READY' | 'NEEDS_ATTENTION' | 'GROUNDED';
  overallStatus: 'PASSED' | 'FAILED' | 'READY' | 'NEEDS_ATTENTION' | 'GROUNDED';
  inspectionType: 'PRE_TRIP' | 'POST_TRIP';
  items: VehicleInspectionItem[];
  notes?: string;
}

export interface DriverNotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  timestamp: string;
  createdAt?: string;
  read: boolean;
  actionUrl?: string;
  deliveryId?: string;
}

export interface DriverSupportTicket {
  id: string;
  ticketCode?: string;
  ticketNumber?: string;
  category: 'DISPATCH' | 'BREAKDOWN' | 'CUSTOMER_ISSUE' | 'ACCIDENT' | 'OTHER' | 'DELIVERY_DELAY' | 'VEHICLE_BREAKDOWN' | 'CARGO_ISSUE' | 'ROUTE_ASSISTANCE' | 'GENERAL' | string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'CRITICAL' | string;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | string;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface DriverSupportContact {
  supportPhone: string;
  supportEmail: string;
  supportHours: string;
  availability?: string;
  description?: string;
}

export interface DriverDashboardKpis {
  todaysDeliveries: number;
  assignedToday?: number;
  completedDeliveries: number;
  completedToday?: number;
  pendingDeliveries: number;
  pendingToday?: number;
  distanceKmToday: number;
  distanceCoveredTodayKm?: number;
  onTimeDeliveries: number;
  driverStatus: DriverStatus;
}

export interface RouteStepItem {
  instruction: string;
  maneuver: string;
  distanceKm: number;
  durationSeconds?: number;
  iconType?: string;
}

export interface RouteWaypointItem {
  id: string;
  name: string;
  type: 'ORIGIN' | 'TRANSIT' | 'DESTINATION';
  address: string;
  latitude?: number;
  longitude?: number;
  distanceKm: number;
  estimatedTime: string;
  status: 'COMPLETED' | 'NEXT' | 'UPCOMING';
  instructions?: string;
}

export interface DriverRouteData {
  shipmentId: number | string;
  trackingNumber: string;
  orderNumber?: string;
  status: string;
  operationalStage?: string;
  routeCode?: string;
  origin: {
    facilityName?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
    contactPhone?: string;
  };
  currentLocation: {
    facilityName?: string;
    latitude?: number;
    longitude?: number;
    city?: string;
  };
  destination: {
    customerName?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
    phone?: string;
    deliveryNotes?: string;
  };
  distanceRemainingKm: number;
  totalDistanceKm: number;
  estimatedDurationMinutes: number;
  estimatedDeliveryTime: string;
  lastLocationUpdatedAt?: string;
  freshness: 'LIVE' | 'RECENT' | 'LAST_RECORDED' | 'OFFLINE';
  routeGeometry: [number, number][];
  fullRouteGeometry?: [number, number][];
  routeSteps: RouteStepItem[];
  waypoints: RouteWaypointItem[];
}

