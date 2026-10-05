const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\dto\\driver';
const filePath = path.join(dir, 'DriverLocationUpdateRequest.java');

const content = `package com.primeroute.logistics.dto.driver;

import java.time.LocalDateTime;

public class DriverLocationUpdateRequest {
    private Long shipmentId;
    private Double latitude;
    private Double longitude;
    private Double accuracy;
    private Double heading;
    private Double speed;
    private String locationName;
    private LocalDateTime timestamp;

    public DriverLocationUpdateRequest() {}

    public DriverLocationUpdateRequest(Double latitude, Double longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public Long getShipmentId() {
        return shipmentId;
    }

    public void setShipmentId(Long shipmentId) {
        this.shipmentId = shipmentId;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Double getAccuracy() {
        return accuracy;
    }

    public void setAccuracy(Double accuracy) {
        this.accuracy = accuracy;
    }

    public Double getHeading() {
        return heading;
    }

    public void setHeading(Double heading) {
        this.heading = heading;
    }

    public Double getSpeed() {
        return speed;
    }

    public void setSpeed(Double speed) {
        this.speed = speed;
    }

    public String getLocationName() {
        return locationName;
    }

    public void setLocationName(String locationName) {
        this.locationName = locationName;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
`;

fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ Created DriverLocationUpdateRequest.java');
