const fs = require('fs');

const dataInitPath = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics/config/DataInitializer.java';
let dataInitContent = fs.readFileSync(dataInitPath, 'utf8');

dataInitContent = dataInitContent.replace(
  'Warehouse mumWarehouse = warehouseRepository.findByWarehouseCode("WH-MUM-002").orElse(blrWarehouse);',
  'Warehouse ccuWarehouse = warehouseRepository.findByWarehouseCode("WH-CCU-006").orElse(blrWarehouse);'
);
dataInitContent = dataInitContent.replace(
  's.setOriginWarehouse((i % 2 == 0) ? blrWarehouse : mumWarehouse);',
  's.setOriginWarehouse((i % 2 == 0) ? blrWarehouse : ccuWarehouse);'
);
dataInitContent = dataInitContent.replace(
  's.setDestinationWarehouse(s.getOriginWarehouse().getId().equals(blrWarehouse.getId()) ? mumWarehouse : blrWarehouse);',
  's.setDestinationWarehouse(s.getOriginWarehouse().getId().equals(blrWarehouse.getId()) ? ccuWarehouse : blrWarehouse);'
);

fs.writeFileSync(dataInitPath, dataInitContent, 'utf8');
console.log('Updated DataInitializer.java');

const adminWhPath = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics/service/AdminWarehouseService.java';
let adminWhContent = fs.readFileSync(adminWhPath, 'utf8');

const oldSeedBlock = `        List<Warehouse> defaultList = List.of(
            createSeedWarehouse("WH-BLR-001", "Bengaluru Central Hub", WarehouseType.DISTRIBUTION_CENTER,
                "Priya Sharma", "+91 98001 11001", "priya@primeroute.com",
                "Plot 42, Export Promotion Industrial Park, Whitefield", "Phase 2 Industrial Corridor",
                "Bengaluru", "Karnataka", "560066", 12.9716, 77.5946,
                10000.0, 6800.0, "KG", "Mon-Sat, 06:00 AM - 10:00 PM", "+91 80 4455 6601", "support.blr@primeroute.com"),

            createSeedWarehouse("WH-MUM-002", "Mumbai West Freight Center", WarehouseType.CROSS_DOCK,
                "R. Deshpande", "+91 98001 22002", "mum.west@primeroute.com",
                "Bldg 12, MIDC Logistics Park, Andheri East", "Near International Air Cargo Terminal",
                "Mumbai", "Maharashtra", "400093", 19.0760, 72.8777,
                8000.0, 7400.0, "KG", "24/7 Operations", "+91 22 6677 8802", "support.mum@primeroute.com"),

            createSeedWarehouse("WH-DEL-003", "Delhi NCR Mega Fulfillment", WarehouseType.FULFILLMENT_CENTER,
                "N. Kapoor", "+91 98001 33003", "del.ncr@primeroute.com",
                "Sector 37, Pace City II, Udyog Vihar", "NH-48 Corridor",
                "Gurugram", "Haryana", "122001", 28.4595, 77.0266,
                15000.0, 11200.0, "KG", "24/7 Operations", "+91 124 4567 803", "support.del@primeroute.com"),

            createSeedWarehouse("WH-CHE-004", "Chennai Port Yard & Cold Storage", WarehouseType.COLD_STORAGE,
                "V. Ilango", "+91 98001 44004", "che.port@primeroute.com",
                "Harbour Expressway, Ennore Port Zone", "Gate 4 Container Terminal",
                "Chennai", "Tamil Nadu", "600057", 13.0827, 80.2707,
                6500.0, 2200.0, "KG", "Mon-Fri, 08:00 AM - 06:00 PM", "+91 44 2833 4404", "support.che@primeroute.com"),

            createSeedWarehouse("WH-HYD-005", "Hyderabad Aerotropolis Hub", WarehouseType.TRANSIT_HUB,
                "A. Reddy", "+91 98001 55005", "hyd.central@primeroute.com",
                "GMR Logistics Park, Shamshabad Airport Road", "Cargo Village Bay 7",
                "Hyderabad", "Telangana", "500409", 17.3850, 78.4867,
                9000.0, 4800.0, "KG", "Mon-Sat, 07:00 AM - 11:00 PM", "+91 40 2345 6705", "support.hyd@primeroute.com"),

            createSeedWarehouse("WH-CCU-006", "Kolkata Eastern Corridor Hub", WarehouseType.STORAGE_WAREHOUSE,
                "P. Mukherjee", "+91 98001 66006", "ccu.east@primeroute.com",
                "Dankuni Industrial Estate, NH-19 Toll Plaza", "Plot 18, Block B",
                "Kolkata", "West Bengal", "712311", 22.5726, 88.3639,
                7500.0, 3100.0, "KG", "Mon-Sat, 06:00 AM - 09:00 PM", "+91 33 2211 4406", "support.ccu@primeroute.com")
        );`;

const newSeedBlock = `        List<Warehouse> defaultList = List.of(
            createSeedWarehouse("WH-BLR-001", "Bengaluru Central Hub", WarehouseType.DISTRIBUTION_CENTER,
                "Priya Sharma", "+91 98001 11001", "priya@primeroute.com",
                "Plot 42, Export Promotion Industrial Park, Whitefield", "Phase 2 Industrial Corridor",
                "Bengaluru", "Karnataka", "560066", 12.9716, 77.5946,
                10000.0, 6800.0, "KG", "Mon-Sat, 06:00 AM - 10:00 PM", "+91 80 4455 6601", "support.blr@primeroute.com"),

            createSeedWarehouse("WH-CCU-006", "Kolkata Eastern Corridor Hub", WarehouseType.STORAGE_WAREHOUSE,
                "P. Mukherjee", "+91 98001 66006", "ccu.east@primeroute.com",
                "Dankuni Industrial Estate, NH-19 Toll Plaza", "Plot 18, Block B",
                "Kolkata", "West Bengal", "712311", 22.5726, 88.3639,
                7500.0, 3100.0, "KG", "Mon-Sat, 06:00 AM - 09:00 PM", "+91 33 2211 4406", "support.ccu@primeroute.com")
        );`;

if (adminWhContent.includes(oldSeedBlock)) {
  adminWhContent = adminWhContent.replace(oldSeedBlock, newSeedBlock);
  fs.writeFileSync(adminWhPath, adminWhContent, 'utf8');
  console.log('Updated AdminWarehouseService.java');
} else {
  console.log('AdminWarehouseService seed block already updated or not found');
}
