const fs = require('fs');
const file = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics/service/WarehouseManagerService.java';
let content = fs.readFileSync(file, 'utf8');

const target = `    public Warehouse getWarehouseDetails() {
        return getScopedWarehouse();
    }`;

const replacement = `    public Map<String, Object> getWarehouseDetails() {
        Warehouse w = getScopedWarehouse();
        Map<String, Object> m = new HashMap<>();
        m.put("id", w.getId());
        m.put("code", w.getWarehouseCode());
        m.put("name", w.getWarehouseName());
        m.put("address", w.getAddressLine1() + (w.getAddressLine2() != null ? ", " + w.getAddressLine2() : ""));
        m.put("city", w.getCity());
        m.put("state", w.getState());
        m.put("postalCode", w.getPostalCode());
        m.put("latitude", w.getLatitude() != null ? w.getLatitude() : 12.9716);
        m.put("longitude", w.getLongitude() != null ? w.getLongitude() : 77.5946);
        m.put("totalCapacity", w.getTotalCapacity() != null ? w.getTotalCapacity() : 10000.0);
        m.put("currentOccupancy", w.getOccupiedCapacity() != null ? w.getOccupiedCapacity() : 0.0);
        m.put("operatingHours", w.getOperatingHours());
        m.put("contactPhone", w.getContactPhone());
        m.put("managerEmail", w.getManagerEmail());
        m.put("dockDoors", 12);
        return m;
    }`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Successfully updated getWarehouseDetails in WarehouseManagerService.java');
} else {
    console.error('Target not found!');
}
