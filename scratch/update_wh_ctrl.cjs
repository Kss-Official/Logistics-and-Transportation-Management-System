const fs = require('fs');
const file = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics/controller/WarehouseManagerController.java';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `    @GetMapping("/warehouse")
    public ResponseEntity<ApiResponse<Warehouse>> getWarehouse() {
        Warehouse warehouse = warehouseManagerService.getWarehouseDetails();
        return ResponseEntity.ok(new ApiResponse<>(true, "Warehouse details retrieved", warehouse));
    }`,
  `    @GetMapping("/warehouse")
    public ResponseEntity<ApiResponse<?>> getWarehouse() {
        Object warehouse = warehouseManagerService.getWarehouseDetails();
        return ResponseEntity.ok(new ApiResponse<>(true, "Warehouse details retrieved", warehouse));
    }`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated WarehouseManagerController.java');
