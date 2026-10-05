const fs = require('fs');
const path = require('path');

const BACKEND_BASE = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

// 1. AdminDriverDTO.java
const driverDtoPath = path.join(BACKEND_BASE, 'dto', 'AdminDriverDTO.java');
let driverDto = fs.readFileSync(driverDtoPath, 'utf8');

if (!driverDto.includes('warehouseId')) {
  driverDto = driverDto.replace(
    'private String address;',
    `private String address;\n    private Long warehouseId;\n    private String warehouseName;\n    private Long vehicleId;\n    private String vehicleNumber;\n    private String currentShipmentTrackingNumber;`
  );

  const gettersSetters = `
    public Long getWarehouseId() { return warehouseId; }
    public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }

    public String getWarehouseName() { return warehouseName; }
    public void setWarehouseName(String warehouseName) { this.warehouseName = warehouseName; }

    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }

    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }

    public String getCurrentShipmentTrackingNumber() { return currentShipmentTrackingNumber; }
    public void setCurrentShipmentTrackingNumber(String currentShipmentTrackingNumber) { this.currentShipmentTrackingNumber = currentShipmentTrackingNumber; }
}`;
  driverDto = driverDto.replace(/\}\s*$/, gettersSetters + '\n');
  fs.writeFileSync(driverDtoPath, driverDto, 'utf8');
  console.log('Updated AdminDriverDTO.java');
}

// 2. CreateDriverRequest.java
const createDriverReqPath = path.join(BACKEND_BASE, 'dto', 'CreateDriverRequest.java');
let createDriverReq = fs.readFileSync(createDriverReqPath, 'utf8');
if (!createDriverReq.includes('warehouseId')) {
  createDriverReq = createDriverReq.replace(
    'private DriverStatus status = DriverStatus.AVAILABLE;',
    'private DriverStatus status = DriverStatus.AVAILABLE;\n    private Long warehouseId;'
  );
  createDriverReq = createDriverReq.replace(/\}\s*$/, `
    public Long getWarehouseId() { return warehouseId; }
    public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }
}\n`);
  fs.writeFileSync(createDriverReqPath, createDriverReq, 'utf8');
  console.log('Updated CreateDriverRequest.java');
}

// 3. UpdateDriverRequest.java
const updateDriverReqPath = path.join(BACKEND_BASE, 'dto', 'UpdateDriverRequest.java');
let updateDriverReq = fs.readFileSync(updateDriverReqPath, 'utf8');
if (!updateDriverReq.includes('warehouseId')) {
  updateDriverReq = updateDriverReq.replace(
    'private DriverStatus status;',
    'private DriverStatus status;\n    private Long warehouseId;'
  );
  updateDriverReq = updateDriverReq.replace(/\}\s*$/, `
    public Long getWarehouseId() { return warehouseId; }
    public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }
}\n`);
  fs.writeFileSync(updateDriverReqPath, updateDriverReq, 'utf8');
  console.log('Updated UpdateDriverRequest.java');
}

// 4. VehicleDTO.java
const vehicleDtoPath = path.join(BACKEND_BASE, 'dto', 'VehicleDTO.java');
let vehicleDto = fs.readFileSync(vehicleDtoPath, 'utf8');
if (!vehicleDto.includes('warehouseId')) {
  vehicleDto = vehicleDto.replace(
    'private String currentLocation;',
    'private String currentLocation;\n    private Long warehouseId;\n    private String warehouseName;'
  );
  vehicleDto = vehicleDto.replace(/\}\s*$/, `
    public Long getWarehouseId() { return warehouseId; }
    public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }

    public String getWarehouseName() { return warehouseName; }
    public void setWarehouseName(String warehouseName) { this.warehouseName = warehouseName; }
}\n`);
  fs.writeFileSync(vehicleDtoPath, vehicleDto, 'utf8');
  console.log('Updated VehicleDTO.java');
}

// 5. CreateVehicleRequest.java
const createVehReqPath = path.join(BACKEND_BASE, 'dto', 'CreateVehicleRequest.java');
let createVehReq = fs.readFileSync(createVehReqPath, 'utf8');
if (!createVehReq.includes('warehouseId')) {
  createVehReq = createVehReq.replace(
    'private String currentLocation;',
    'private String currentLocation;\n    private Long warehouseId;'
  );
  createVehReq = createVehReq.replace(/\}\s*$/, `
    public Long getWarehouseId() { return warehouseId; }
    public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }
}\n`);
  fs.writeFileSync(createVehReqPath, createVehReq, 'utf8');
  console.log('Updated CreateVehicleRequest.java');
}

// 6. UpdateVehicleRequest.java
const updateVehReqPath = path.join(BACKEND_BASE, 'dto', 'UpdateVehicleRequest.java');
let updateVehReq = fs.readFileSync(updateVehReqPath, 'utf8');
if (!updateVehReq.includes('warehouseId')) {
  updateVehReq = updateVehReq.replace(
    'private String currentLocation;',
    'private String currentLocation;\n    private Long warehouseId;'
  );
  updateVehReq = updateVehReq.replace(/\}\s*$/, `
    public Long getWarehouseId() { return warehouseId; }
    public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }
}\n`);
  fs.writeFileSync(updateVehReqPath, updateVehReq, 'utf8');
  console.log('Updated UpdateVehicleRequest.java');
}

// 7. WarehouseDTO.java
const whDtoPath = path.join(BACKEND_BASE, 'dto', 'WarehouseDTO.java');
let whDto = fs.readFileSync(whDtoPath, 'utf8');
if (!whDto.includes('availableDriverCount')) {
  whDto = whDto.replace(
    'private Long outboundLoadCount = 0L;',
    'private Long outboundLoadCount = 0L;\n    private Long availableDriverCount = 0L;\n    private Long availableVehicleCount = 0L;'
  );
  whDto = whDto.replace(/\}\s*$/, `
    public Long getAvailableDriverCount() { return availableDriverCount; }
    public void setAvailableDriverCount(Long availableDriverCount) { this.availableDriverCount = availableDriverCount; }

    public Long getAvailableVehicleCount() { return availableVehicleCount; }
    public void setAvailableVehicleCount(Long availableVehicleCount) { this.availableVehicleCount = availableVehicleCount; }
}\n`);
  fs.writeFileSync(whDtoPath, whDto, 'utf8');
  console.log('Updated WarehouseDTO.java');
}
