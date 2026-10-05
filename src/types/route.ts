import type { DriverStatus } from './driver';
import type { VehicleType } from './vehicle';

export type RouteStatus = 'ACTIVE' | 'INACTIVE';

export interface Route {
  id: number;
  routeCode: string;
  routeName?: string;
  origin: string;
  originName?: string;
  originCity?: string;
  originState?: string;
  destination: string;
  destinationName?: string;
  destinationCity?: string;
  destinationState?: string;
  originAddress?: string;
  destinationAddress?: string;
  distanceKm: number;
  distance?: number;
  estimatedTransitTimeHours: number;
  estimatedTransit?: number;
  estimatedTransitHours?: number;
  status: RouteStatus;

  // Driver details
  driverId?: number;
  driverName?: string;
  driverPhone?: string;
  driverStatus?: DriverStatus;

  // Vehicle details
  vehicleId?: number;
  vehicleNumber?: string;
  vehicleModel?: string;
  vehicleType?: VehicleType;
  vehicleCapacity?: number;
  vehicleCapacityUnit?: string;

  // Active loads & telemetry
  activeLoads: number;
  totalShipments: number;

  // Real-time active shipment tracking
  currentShipmentTrackingNumber?: string;
  currentShipmentLocation?: string;
  currentShipmentLatitude?: number;
  currentShipmentLongitude?: number;

  // Geographic coordinates
  originLatitude?: number;
  originLongitude?: number;
  destinationLatitude?: number;
  destinationLongitude?: number;

  createdAt: string;
  updatedAt: string;
}

export interface RouteShipment {
  id: number;
  trackingNumber: string;
  orderNumber?: string;
  status: string;
  currentLocationName?: string;
  currentLatitude?: number | null;
  currentLongitude?: number | null;
  latestEventTitle?: string;
  latestEventLocation?: string;
  latestEventTime?: string;
}

export interface CreateRoutePayload {
  routeCode?: string;
  routeName?: string;
  origin: string;
  originName?: string;
  originCity?: string;
  originState?: string;
  destination: string;
  destinationName?: string;
  destinationCity?: string;
  destinationState?: string;
  originAddress?: string;
  destinationAddress?: string;
  distanceKm: number;
  distance?: number;
  estimatedTransitTimeHours: number;
  estimatedTransitHours?: number;
  status?: RouteStatus;
  driverId?: number | null;
  vehicleId?: number | null;
  originLatitude?: number | null;
  originLongitude?: number | null;
  destinationLatitude?: number | null;
  destinationLongitude?: number | null;
}

export interface UpdateRoutePayload {
  routeCode?: string;
  routeName?: string;
  origin: string;
  originName?: string;
  originCity?: string;
  originState?: string;
  destination: string;
  destinationName?: string;
  destinationCity?: string;
  destinationState?: string;
  originAddress?: string;
  destinationAddress?: string;
  distanceKm: number;
  distance?: number;
  estimatedTransitTimeHours: number;
  estimatedTransitHours?: number;
  status?: RouteStatus;
  driverId?: number | null;
  vehicleId?: number | null;
  originLatitude?: number | null;
  originLongitude?: number | null;
  destinationLatitude?: number | null;
  destinationLongitude?: number | null;
}
