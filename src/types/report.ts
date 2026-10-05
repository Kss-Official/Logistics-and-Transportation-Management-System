export interface ReportOverview {
  totalOrders: number;
  totalShipments: number;
  activeShipments: number;
  deliveredShipments: number;
  pendingOrders: number;
  inTransitShipments: number;
  totalCustomers: number;
  activeDrivers: number;
  activeVehicles: number;
  activeRoutes: number;
  warehouseCount: number;
  totalInvoiceValue: number;
  outstandingAmount: number;
  totalPaidAmount: number;
}

export interface OrderTrendPoint {
  date: string;
  orders: number;
  volume: number;
}

export interface OrderAnalytics {
  totalOrders: number;
  statusDistribution: Record<string, number>;
  deliveryTypeDistribution: Record<string, number>;
  totalBookingVolume: number;
  averageOrderValue: number;
  fulfillmentRate: number;
  trendSeries: OrderTrendPoint[];
}

export interface ShipmentTrendPointReport {
  date: string;
  delivered: number;
  inTransit: number;
  pending: number;
  cancelled: number;
  total: number;
}

export interface ShipmentAnalytics {
  totalShipments: number;
  statusDistribution: Record<string, number>;
  deliveryTypeDistribution: Record<string, number>;
  trendSeries: ShipmentTrendPointReport[];
}

export interface DeliveryPerformance {
  deliverySuccessRate: number;
  onTimeDeliveryRate: number;
  averageTransitHours: number;
  delayedShipments: number;
  deliveredToday: number;
  deliveredThisWeek: number;
  deliveredThisMonth: number;
}

export interface VehicleRosterItem {
  id: number;
  licensePlate: string;
  model: string;
  type: string;
  status: string;
  capacityTons: number;
  assignedDriver: string;
  assignedRoute: string;
  activeLoads: number;
}

export interface FleetAnalytics {
  totalVehicles: number;
  activeVehicles: number;
  availableVehicles: number;
  assignedVehicles: number;
  maintenanceVehicles: number;
  utilizationRate: number;
  vehicleTypeDistribution: Record<string, number>;
  vehicleRoster: VehicleRosterItem[];
}

export interface DriverPerformanceItem {
  id: number;
  name: string;
  licenseNumber: string;
  phone: string;
  status: string;
  assignedVehicle: string;
  assignedRoute: string;
  totalRuns: number;
  onTimeRuns: number;
  onTimeRate: number;
  rating: number;
}

export interface DriverPerformanceReport {
  totalDrivers: number;
  activeDrivers: number;
  assignedDrivers: number;
  availableDrivers: number;
  drivers: DriverPerformanceItem[];
}

export interface RoutePerformanceItem {
  id: number;
  routeName: string;
  origin: string;
  destination: string;
  distanceKm: number;
  estimatedHours: number;
  assignedDriver: string;
  assignedVehicle: string;
  activeLoads: number;
  totalShipments: number;
  status: string;
}

export interface RoutePerformanceReport {
  totalRoutes: number;
  activeRoutes: number;
  inactiveRoutes: number;
  routes: RoutePerformanceItem[];
}

export interface WarehouseReportItem {
  id: number;
  code: string;
  name: string;
  location: string;
  manager: string;
  totalCapacity: number;
  usedCapacity: number;
  utilizationRate: number;
  status: string;
  type: string;
}

export interface WarehouseAnalyticsReport {
  totalWarehouses: number;
  activeWarehouses: number;
  totalCapacity: number;
  occupiedCapacity: number;
  overallUtilizationRate: number;
  warehouses: WarehouseReportItem[];
}

export interface CustomerStatItem {
  id: number;
  name: string;
  company: string;
  email: string;
  orderCount: number;
  totalSpent: number;
  totalInvoiced: number;
  totalPaid: number;
}

export interface CustomerAnalyticsReport {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisPeriod: number;
  customersWithOrders: number;
  ordersPerCustomerAvg: number;
  customerRetentionRate: number;
  topCustomersByVolume: CustomerStatItem[];
  topCustomersByRevenue: CustomerStatItem[];
}

export interface MonthlyFinancialBreakdown {
  month: string;
  orders: number;
  revenue: number;
  avgPerOrder: number;
}

export interface FinancialAnalyticsReport {
  totalInvoices: number;
  totalBilled: number;
  totalPaid: number;
  outstandingAmount: number;
  overdueAmount: number;
  averageInvoiceValue: number;
  paidCount: number;
  unpaidCount: number;
  partiallyPaidCount: number;
  overdueCount: number;
  paymentMethodBreakdown: Record<string, number>;
  monthlyBreakdown: MonthlyFinancialBreakdown[];
}

export interface ComprehensiveReport {
  dateRangeLabel: string;
  fromDate: string;
  toDate: string;
  overview: ReportOverview;
  orders: OrderAnalytics;
  shipments: ShipmentAnalytics;
  deliveryPerformance: DeliveryPerformance;
  fleet: FleetAnalytics;
  drivers: DriverPerformanceReport;
  routes: RoutePerformanceReport;
  warehouses: WarehouseAnalyticsReport;
  customers: CustomerAnalyticsReport;
  financial: FinancialAnalyticsReport;
}

export type ReportDateRange = 
  | 'TODAY'
  | 'YESTERDAY'
  | 'LAST_7_DAYS'
  | 'LAST_30_DAYS'
  | 'THIS_MONTH'
  | 'LAST_MONTH'
  | 'THIS_YEAR'
  | 'CUSTOM';
