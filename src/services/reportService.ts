import api from './api';
import type {
  ComprehensiveReport,
  ReportOverview,
  OrderAnalytics,
  ShipmentAnalytics,
  DeliveryPerformance,
  FleetAnalytics,
  DriverPerformanceReport,
  RoutePerformanceReport,
  WarehouseAnalyticsReport,
  CustomerAnalyticsReport,
  FinancialAnalyticsReport,
  ReportDateRange,
} from '../types/report';

export interface ReportFilterParams {
  range?: ReportDateRange;
  from?: string;
  to?: string;
}

/**
 * Get comprehensive analytics covering all 10 logistics domains in a unified API call
 */
export async function getDashboardReport(params?: ReportFilterParams): Promise<ComprehensiveReport> {
  const response = await api.get('/admin/reports/dashboard', { params });
  return response.data.data;
}

export async function getOperationsOverview(params?: ReportFilterParams): Promise<ReportOverview> {
  const response = await api.get('/admin/reports/overview', { params });
  return response.data.data;
}

export async function getOrderAnalytics(params?: ReportFilterParams): Promise<OrderAnalytics> {
  const response = await api.get('/admin/reports/orders', { params });
  return response.data.data;
}

export async function getShipmentAnalytics(params?: ReportFilterParams): Promise<ShipmentAnalytics> {
  const response = await api.get('/admin/reports/shipments', { params });
  return response.data.data;
}

export async function getDeliveryPerformance(params?: ReportFilterParams): Promise<DeliveryPerformance> {
  const response = await api.get('/admin/reports/delivery-performance', { params });
  return response.data.data;
}

export async function getFleetAnalytics(): Promise<FleetAnalytics> {
  const response = await api.get('/admin/reports/fleet');
  return response.data.data;
}

export async function getDriverPerformance(): Promise<DriverPerformanceReport> {
  const response = await api.get('/admin/reports/drivers');
  return response.data.data;
}

export async function getRoutePerformance(): Promise<RoutePerformanceReport> {
  const response = await api.get('/admin/reports/routes');
  return response.data.data;
}

export async function getWarehouseAnalytics(): Promise<WarehouseAnalyticsReport> {
  const response = await api.get('/admin/reports/warehouses');
  return response.data.data;
}

export async function getCustomerAnalytics(params?: ReportFilterParams): Promise<CustomerAnalyticsReport> {
  const response = await api.get('/admin/reports/customers', { params });
  return response.data.data;
}

export async function getFinancialAnalytics(params?: ReportFilterParams): Promise<FinancialAnalyticsReport> {
  const response = await api.get('/admin/reports/financial', { params });
  return response.data.data;
}

export const reportService = {
  getDashboardReport,
  getOperationsOverview,
  getOrderAnalytics,
  getShipmentAnalytics,
  getDeliveryPerformance,
  getFleetAnalytics,
  getDriverPerformance,
  getRoutePerformance,
  getWarehouseAnalytics,
  getCustomerAnalytics,
  getFinancialAnalytics,
};

export default reportService;
