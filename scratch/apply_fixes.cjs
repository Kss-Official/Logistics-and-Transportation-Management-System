const fs = require('fs');
const path = require('path');

const backendDir = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';

// 1. ShipmentRepository.java
const shipRepoPath = path.join(backendDir, 'src', 'main', 'java', 'com', 'primeroute', 'logistics', 'repository', 'ShipmentRepository.java');
let repoContent = fs.readFileSync(shipRepoPath, 'utf8');
if (!repoContent.includes('findActiveOutgoingByWarehouse')) {
  repoContent = repoContent.replace(
    'List<Shipment> findByOriginWarehouseOrderByCreatedAtDesc(Warehouse originWarehouse);',
    `List<Shipment> findByOriginWarehouseOrderByCreatedAtDesc(Warehouse originWarehouse);\n\n    @Query("SELECT s FROM Shipment s WHERE s.originWarehouse = :warehouse AND s.status NOT IN (com.primeroute.logistics.entity.OrderStatus.DELIVERED, com.primeroute.logistics.entity.OrderStatus.CANCELLED) ORDER BY s.createdAt DESC")\n    List<Shipment> findActiveOutgoingByWarehouse(@Param("warehouse") Warehouse warehouse);`
  );
  fs.writeFileSync(shipRepoPath, repoContent, 'utf8');
  console.log('Updated ShipmentRepository.java');
} else {
  console.log('ShipmentRepository.java already contains findActiveOutgoingByWarehouse');
}

// 2. WarehouseManagerService.java
const wmServicePath = path.join(backendDir, 'src', 'main', 'java', 'com', 'primeroute', 'logistics', 'service', 'WarehouseManagerService.java');
let wmContent = fs.readFileSync(wmServicePath, 'utf8');

// Update getOutgoingShipments()
wmContent = wmContent.replace(
  `    @Transactional(readOnly = true)\n    public List<WarehouseShipmentDTO> getOutgoingShipments() {\n        Warehouse warehouse = getScopedWarehouse();\n        List<Shipment> list = shipmentRepository.findByOriginWarehouseOrderByCreatedAtDesc(warehouse);`,
  `    @Transactional(readOnly = true)\n    public List<WarehouseShipmentDTO> getOutgoingShipments() {\n        Warehouse warehouse = getScopedWarehouse();\n        List<Shipment> list = shipmentRepository.findActiveOutgoingByWarehouse(warehouse);`
);

// Update mapToShipmentDTO origin/destination city setting
wmContent = wmContent.replace(
  `        if (s.getOriginWarehouse() != null) {\n            dto.setOriginWarehouseId(s.getOriginWarehouse().getId());\n            dto.setOriginWarehouseName(s.getOriginWarehouse().getWarehouseName());\n            if (dto.getOriginCity() == null) dto.setOriginCity(s.getOriginWarehouse().getCity());\n        }\n\n        if (s.getDestinationWarehouse() != null) {\n            dto.setDestinationWarehouseId(s.getDestinationWarehouse().getId());\n            dto.setDestinationWarehouseName(s.getDestinationWarehouse().getWarehouseName());\n            if (dto.getDestinationCity() == null) dto.setDestinationCity(s.getDestinationWarehouse().getCity());\n        }`,
  `        if (s.getOriginWarehouse() != null) {\n            dto.setOriginWarehouseId(s.getOriginWarehouse().getId());\n            dto.setOriginWarehouseName(s.getOriginWarehouse().getWarehouseName());\n            dto.setOriginCity(s.getOriginWarehouse().getCity());\n        }\n\n        if (s.getDestinationWarehouse() != null) {\n            dto.setDestinationWarehouseId(s.getDestinationWarehouse().getId());\n            dto.setDestinationWarehouseName(s.getDestinationWarehouse().getWarehouseName());\n            dto.setDestinationCity(s.getDestinationWarehouse().getCity());\n        }`
);

fs.writeFileSync(wmServicePath, wmContent, 'utf8');
console.log('Updated WarehouseManagerService.java');

// 3. WarehouseManagerShipmentScopingTest.java
const testPath = path.join(backendDir, 'src', 'test', 'java', 'com', 'primeroute', 'logistics', 'service', 'WarehouseManagerShipmentScopingTest.java');
let testContent = fs.readFileSync(testPath, 'utf8');
testContent = testContent.replace(/shipmentRepository\.findByOriginWarehouseOrderByCreatedAtDesc\(warehouseBengaluru\)/g, 'shipmentRepository.findActiveOutgoingByWarehouse(warehouseBengaluru)');
fs.writeFileSync(testPath, testContent, 'utf8');
console.log('Updated WarehouseManagerShipmentScopingTest.java');
