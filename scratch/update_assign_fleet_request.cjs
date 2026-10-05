const fs = require('fs');
const path = require('path');

const BACKEND_BASE = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

const reqPath = path.join(BACKEND_BASE, 'dto', 'warehouse', 'AssignFleetRequest.java');

const content = `package com.primeroute.logistics.dto.warehouse;

public class AssignFleetRequest {
    private Long driverId;
    private Long vehicleId;

    public AssignFleetRequest() {}

    public AssignFleetRequest(Long driverId, Long vehicleId) {
        this.driverId = driverId;
        this.vehicleId = vehicleId;
    }

    public Long getDriverId() {
        return driverId;
    }

    public void setDriverId(Long driverId) {
        this.driverId = driverId;
    }

    public Long getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
    }
}
`;

fs.writeFileSync(reqPath, content, 'utf8');
console.log('Updated AssignFleetRequest.java with constructors');
