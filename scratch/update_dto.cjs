const fs = require('fs');

const fDTO = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\dto\\CustomerDashboardDTO.java';

const dtoContent = `package com.primeroute.logistics.dto;

import java.util.List;
import java.util.Map;

public class CustomerDashboardDTO {

    private long totalOrders;
    private long pendingOrders;
    private long activeShipments;
    private long deliveredShipments;
    private long pendingInvoices;
    private Map<String, Long> ordersByStatus;
    private List<OrderResponse> recentOrders;

    public CustomerDashboardDTO() {
    }

    public CustomerDashboardDTO(
            long totalOrders,
            long pendingOrders,
            long activeShipments,
            long deliveredShipments,
            long pendingInvoices,
            Map<String, Long> ordersByStatus,
            List<OrderResponse> recentOrders) {
        this.totalOrders = totalOrders;
        this.pendingOrders = pendingOrders;
        this.activeShipments = activeShipments;
        this.deliveredShipments = deliveredShipments;
        this.pendingInvoices = pendingInvoices;
        this.ordersByStatus = ordersByStatus;
        this.recentOrders = recentOrders;
    }

    public long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public long getPendingOrders() {
        return pendingOrders;
    }

    public void setPendingOrders(long pendingOrders) {
        this.pendingOrders = pendingOrders;
    }

    public long getActiveShipments() {
        return activeShipments;
    }

    public void setActiveShipments(long activeShipments) {
        this.activeShipments = activeShipments;
    }

    public long getDeliveredShipments() {
        return deliveredShipments;
    }

    public void setDeliveredShipments(long deliveredShipments) {
        this.deliveredShipments = deliveredShipments;
    }

    public long getPendingInvoices() {
        return pendingInvoices;
    }

    public void setPendingInvoices(long pendingInvoices) {
        this.pendingInvoices = pendingInvoices;
    }

    public Map<String, Long> getOrdersByStatus() {
        return ordersByStatus;
    }

    public void setOrdersByStatus(Map<String, Long> ordersByStatus) {
        this.ordersByStatus = ordersByStatus;
    }

    public List<OrderResponse> getRecentOrders() {
        return recentOrders;
    }

    public void setRecentOrders(List<OrderResponse> recentOrders) {
        this.recentOrders = recentOrders;
    }
}
`;

fs.writeFileSync(fDTO, dtoContent, 'utf8');
console.log('Successfully updated CustomerDashboardDTO.java');
