const fs = require('fs');
const path = require('path');

const BACKEND_BASE = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

// 1. Create AdminNeedsAttentionDTO.java
const needsAttnPath = path.join(BACKEND_BASE, 'dto', 'AdminNeedsAttentionDTO.java');
const needsAttnContent = `package com.primeroute.logistics.dto;

public class AdminNeedsAttentionDTO {
    private String key;
    private String title;
    private long count;
    private String description;
    private String severity;
    private String link;

    public AdminNeedsAttentionDTO() {}

    public AdminNeedsAttentionDTO(String key, String title, long count, String description, String severity, String link) {
        this.key = key;
        this.title = title;
        this.count = count;
        this.description = description;
        this.severity = severity;
        this.link = link;
    }

    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public long getCount() { return count; }
    public void setCount(long count) { this.count = count; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }
}
`;
fs.writeFileSync(needsAttnPath, needsAttnContent, 'utf8');
console.log('Created AdminNeedsAttentionDTO.java');

// 2. Update AdminDashboardSummaryDTO.java
const dashDtoPath = path.join(BACKEND_BASE, 'dto', 'AdminDashboardSummaryDTO.java');
const dashDtoContent = `package com.primeroute.logistics.dto;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class AdminDashboardSummaryDTO {
    private long totalOrders;
    private long totalShipments;
    private long totalCustomers;
    private double totalRevenue;
    private Map<String, Long> ordersByStatus;
    private List<AdminRecentOrderDTO> recentOrders = new ArrayList<>();
    private List<AdminRecentShipmentDTO> recentShipments = new ArrayList<>();
    private List<AdminRouteStatDTO> topRoutes = new ArrayList<>();
    private List<AdminCustomerStatDTO> topCustomers = new ArrayList<>();
    private List<MonthlyRevenueStatDTO> monthlyStats = new ArrayList<>();
    private long totalTickets;
    private long openTickets;

    // Real-time Fleet & Operations Telemetry
    private long ordersAwaitingWarehouseAssignment;
    private long pendingOrderReview;
    private long shipmentsAwaitingProcessing;
    private long activeShipments;
    private long inTransitShipments;
    private long deliveredShipments;
    private long delayedShipments;
    private long activeWarehouses;
    private long availableDrivers;
    private long driversOnTrip;
    private long availableVehicles;
    private long vehiclesInTransit;
    private long vehiclesUnderMaintenance;
    private long lowInventoryAlerts;

    // Dynamic Needs Attention Action Items
    private List<AdminNeedsAttentionDTO> needsAttention = new ArrayList<>();

    public AdminDashboardSummaryDTO() {}

    public long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }

    public long getTotalShipments() { return totalShipments; }
    public void setTotalShipments(long totalShipments) { this.totalShipments = totalShipments; }

    public long getTotalCustomers() { return totalCustomers; }
    public void setTotalCustomers(long totalCustomers) { this.totalCustomers = totalCustomers; }

    public double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; }

    public Map<String, Long> getOrdersByStatus() { return ordersByStatus; }
    public void setOrdersByStatus(Map<String, Long> ordersByStatus) { this.ordersByStatus = ordersByStatus; }

    public List<AdminRecentOrderDTO> getRecentOrders() { return recentOrders; }
    public void setRecentOrders(List<AdminRecentOrderDTO> recentOrders) { this.recentOrders = recentOrders; }

    public List<AdminRecentShipmentDTO> getRecentShipments() { return recentShipments; }
    public void setRecentShipments(List<AdminRecentShipmentDTO> recentShipments) { this.recentShipments = recentShipments; }

    public List<AdminRouteStatDTO> getTopRoutes() { return topRoutes; }
    public void setTopRoutes(List<AdminRouteStatDTO> topRoutes) { this.topRoutes = topRoutes; }

    public List<AdminCustomerStatDTO> getTopCustomers() { return topCustomers; }
    public void setTopCustomers(List<AdminCustomerStatDTO> topCustomers) { this.topCustomers = topCustomers; }

    public List<MonthlyRevenueStatDTO> getMonthlyStats() { return monthlyStats; }
    public void setMonthlyStats(List<MonthlyRevenueStatDTO> monthlyStats) { this.monthlyStats = monthlyStats; }

    public long getTotalTickets() { return totalTickets; }
    public void setTotalTickets(long totalTickets) { this.totalTickets = totalTickets; }

    public long getOpenTickets() { return openTickets; }
    public void setOpenTickets(long openTickets) { this.openTickets = openTickets; }

    public long getOrdersAwaitingWarehouseAssignment() { return ordersAwaitingWarehouseAssignment; }
    public void setOrdersAwaitingWarehouseAssignment(long ordersAwaitingWarehouseAssignment) { this.ordersAwaitingWarehouseAssignment = ordersAwaitingWarehouseAssignment; }

    public long getPendingOrderReview() { return pendingOrderReview; }
    public void setPendingOrderReview(long pendingOrderReview) { this.pendingOrderReview = pendingOrderReview; }

    public long getShipmentsAwaitingProcessing() { return shipmentsAwaitingProcessing; }
    public void setShipmentsAwaitingProcessing(long shipmentsAwaitingProcessing) { this.shipmentsAwaitingProcessing = shipmentsAwaitingProcessing; }

    public long getActiveShipments() { return activeShipments; }
    public void setActiveShipments(long activeShipments) { this.activeShipments = activeShipments; }

    public long getInTransitShipments() { return inTransitShipments; }
    public void setInTransitShipments(long inTransitShipments) { this.inTransitShipments = inTransitShipments; }

    public long getDeliveredShipments() { return deliveredShipments; }
    public void setDeliveredShipments(long deliveredShipments) { this.deliveredShipments = deliveredShipments; }

    public long getDelayedShipments() { return delayedShipments; }
    public void setDelayedShipments(long delayedShipments) { this.delayedShipments = delayedShipments; }

    public long getActiveWarehouses() { return activeWarehouses; }
    public void setActiveWarehouses(long activeWarehouses) { this.activeWarehouses = activeWarehouses; }

    public long getAvailableDrivers() { return availableDrivers; }
    public void setAvailableDrivers(long availableDrivers) { this.availableDrivers = availableDrivers; }

    public long getDriversOnTrip() { return driversOnTrip; }
    public void setDriversOnTrip(long driversOnTrip) { this.driversOnTrip = driversOnTrip; }

    public long getAvailableVehicles() { return availableVehicles; }
    public void setAvailableVehicles(long availableVehicles) { this.availableVehicles = availableVehicles; }

    public long getVehiclesInTransit() { return vehiclesInTransit; }
    public void setVehiclesInTransit(long vehiclesInTransit) { this.vehiclesInTransit = vehiclesInTransit; }

    public long getVehiclesUnderMaintenance() { return vehiclesUnderMaintenance; }
    public void setVehiclesUnderMaintenance(long vehiclesUnderMaintenance) { this.vehiclesUnderMaintenance = vehiclesUnderMaintenance; }

    public long getLowInventoryAlerts() { return lowInventoryAlerts; }
    public void setLowInventoryAlerts(long lowInventoryAlerts) { this.lowInventoryAlerts = lowInventoryAlerts; }

    public List<AdminNeedsAttentionDTO> getNeedsAttention() { return needsAttention; }
    public void setNeedsAttention(List<AdminNeedsAttentionDTO> needsAttention) { this.needsAttention = needsAttention; }
}
`;
fs.writeFileSync(dashDtoPath, dashDtoContent, 'utf8');
console.log('Updated AdminDashboardSummaryDTO.java');
