const fs = require('fs');
const path = require('path');
const basePath = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";
const wmServicePath = path.join(basePath, "service/WarehouseManagerService.java");

let content = fs.readFileSync(wmServicePath, 'utf8');

content = content.replace(
  `        this.vehicleRepository = vehicleRepository;\n        this.trackingEventRepository = trackingEventRepository;\n    }`,
  `        this.vehicleRepository = vehicleRepository;\n        this.trackingEventRepository = trackingEventRepository;\n        this.orderRepository = orderRepository;\n        this.shipmentService = shipmentService;\n    }`
);

fs.writeFileSync(wmServicePath, content, 'utf8');
console.log("Properly initialized orderRepository and shipmentService");
