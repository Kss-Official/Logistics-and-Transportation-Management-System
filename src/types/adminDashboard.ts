export interface AdminRecentOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  destination: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

export interface AdminRecentShipment {
  id: number;
  trackingNumber: string;
  orderNumber: string;
  origin: string;
  destination: string;
  route: string;
  status: string;
  currentLocation: string;
  createdAt: string;
}

export interface AdminRouteStat {
  route: string;
  shipments: number;
}

export interface AdminCustomerStat {
  name: string;
  orders: number;
}

export interface MonthlyRevenueStat {
  month: string;
  revenue: number;
  orders: number;
  delivered: number;
}

export interface AdminDashboardSummary {
  totalOrders: number;
  totalShipments: number;
  totalCustomers: number;
  totalRevenue: number;
  ordersByStatus: Record<string, number>;
  recentOrders: AdminRecentOrder[];
  recentShipments: AdminRecentShipment[];
  topRoutes: AdminRouteStat[];
  topCustomers: AdminCustomerStat[];
  monthlyStats: MonthlyRevenueStat[];
  totalTickets: number;
  openTickets: number;
  ordersAwaitingWarehouseAssignment?: number;
  pendingOrderReview?: number;
  shipmentsAwaitingProcessing?: number;
  activeShipments?: number;
  inTransitShipments?: number;
  deliveredShipments?: number;
  delayedShipments?: number;
  activeWarehouses?: number;
  availableDrivers?: number;
  driversOnTrip?: number;
  availableVehicles?: number;
  vehiclesInTransit?: number;
  vehiclesUnderMaintenance?: number;
  lowInventoryAlerts?: number;
  needsAttention?: NeedsAttentionItem[];
}

export interface ShipmentTrendPoint {
  date: string;
  delivered: number;
  inTransit: number;
  pending: number;
  cancelled: number;
  total: number;
}

export interface NeedsAttentionItem {
  key: string;
  title: string;
  count: number;
  description: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  link: string;
}
