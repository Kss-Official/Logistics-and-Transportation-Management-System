export type ShipmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'In Transit'
  | 'Delivered'
  | 'Processing'
  | 'Dispatched'
  | 'Out for Delivery'
  | 'Pending'
  | 'Cancelled'
  | string;

export interface TrackingEvent {
  status: string;
  location?: string;
  time?: string | null;
  upcoming?: boolean;
  current?: boolean;
}

export interface Shipment {
  id: string | number;
  trackingNumber: string;
  orderId: string;
  customerId?: string;
  customer?: string;
  origin: string;
  destination: string;
  warehouseId?: string;
  warehouse?: string;
  vehicleId?: string;
  vehicle?: string;
  vehicleReg?: string;
  driverId?: string;
  driver?: string;
  driverPhone?: string;
  currentLocation: string;
  status: ShipmentStatus;
  route?: string;
  expectedDelivery?: string;
  actualDelivery?: string;
  weight?: number;
  timeline: TrackingEvent[];
}

export interface LocationInfo {
  contactName?: string;
  phone?: string;
  addressText: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
}

export interface CurrentLocationInfo {
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  lastUpdatedAt: string;
}

export interface PackageInfo {
  description: string;
  weight: number;
  quantity: number;
}

export interface TrackingMilestoneEvent {
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

export interface ProofOfDeliveryInfo {
  id?: number;
  shipmentId?: number;
  trackingNumber?: string;
  recipientName?: string;
  receivedBy?: string;
  signatureData?: string;
  signatureBase64?: string;
  photoData?: string;
  photoUrl?: string;
  deliveryNotes?: string;
  notes?: string;
  deliveredAt?: string;
  deliveredBy?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface TrackingResponse {
  shipmentId?: number;
  id?: number;
  trackingNumber: string;
  orderNumber: string;
  customerName?: string;
  customerEmail?: string;
  status: ShipmentStatus | string;
  operationalStage?: string;
  assignmentStatus?: string;
  assignedBy?: string | null;
  assignedAt?: string | null;
  driverName?: string | null;
  driverCode?: string | null;
  driverPhone?: string | null;
  driverStatus?: string | null;
  vehicleNumber?: string | null;
  vehicleModel?: string | null;
  vehicleType?: string | null;
  vehicleRegistrationNumber?: string | null;
  vehicleReg?: string | null;
  originWarehouseName?: string | null;
  originWarehouseCode?: string | null;
  warehouseManagerName?: string | null;
  warehouseManagerEmail?: string | null;
  pickupAddress?: string | null;
  deliveryAddress?: string | null;
  pickup: LocationInfo;
  delivery: LocationInfo;
  currentLocation: CurrentLocationInfo;
  currentLatitude?: number | null;
  currentLongitude?: number | null;
  currentLocationName?: string;
  lastLocationUpdatedAt?: string | null;
  originName?: string;
  destinationAddress?: string;
  packageDescription?: string;
  packageWeight?: number;
  packageQuantity?: number;
  packageDetails: PackageInfo;
  deliveryType: string;
  estimatedDeliveryDate: string;
  createdAt: string;
  lastUpdatedAt: string;
  updatedAt?: string;
  proofOfDelivery?: ProofOfDeliveryInfo | null;
  events: TrackingMilestoneEvent[];
  trackingEvents?: TrackingMilestoneEvent[];
}

export interface ShipmentSummary {
  id: number;
  trackingNumber: string;
  orderNumber: string;
  customerName?: string;
  customerEmail?: string;
  status: ShipmentStatus | string;
  origin: string;
  destination: string;
  currentLocation: string;
  deliveryType: string;
  driverName?: string | null;
  driverPhone?: string | null;
  vehicleNumber?: string | null;
  vehicleModel?: string | null;
  vehicleType?: string | null;
  originWarehouseName?: string | null;
  originWarehouseCode?: string | null;
  assignmentStatus?: string | null;
  assignedBy?: string | null;
  assignedAt?: string | null;
  estimatedDeliveryDate: string;
  createdAt: string;
}
