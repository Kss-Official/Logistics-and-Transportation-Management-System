const fs = require('fs');
const path = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics/service/AdminRouteService.java';
let code = fs.readFileSync(path, 'utf8');

const targetStr = 'if (route.getDriver() != null) {';
const idx = code.indexOf(targetStr);
const endSnippet = 'dto.setDestinationLongitude(route.getDestinationLongitude());';
const endIdx = code.indexOf(endSnippet, idx);

if (idx !== -1 && endIdx !== -1) {
  const fullEnd = endIdx + endSnippet.length;
  // Let's find where activeShipments was declared before or after
  const afterActiveShipments = code.indexOf('.collect(Collectors.toList());', fullEnd);
  const totalEnd = afterActiveShipments + '.collect(Collectors.toList());'.length;

  const replacement = `List<Shipment> activeShipments = shipmentRepository.findByRoute(route).stream()
                .filter(s -> s.getStatus() != OrderStatus.DELIVERED && s.getStatus() != OrderStatus.CANCELLED)
                .collect(Collectors.toList());

        Driver operationalDriver = route.getDriver();
        Vehicle operationalVehicle = route.getVehicle();

        if (!activeShipments.isEmpty()) {
            Shipment s = activeShipments.get(0);
            if (s.getDriver() != null) {
                operationalDriver = s.getDriver();
            }
            if (s.getVehicle() != null) {
                operationalVehicle = s.getVehicle();
            }
        }

        if (operationalDriver != null) {
            dto.setDriverId(operationalDriver.getId());
            dto.setDriverName(operationalDriver.getFullName());
            dto.setDriverPhone(operationalDriver.getPhone());
            dto.setDriverStatus(operationalDriver.getStatus());
        }

        if (operationalVehicle != null) {
            dto.setVehicleId(operationalVehicle.getId());
            dto.setVehicleNumber(operationalVehicle.getVehicleNumber());
            dto.setVehicleModel(operationalVehicle.getModel());
            dto.setVehicleType(operationalVehicle.getVehicleType());
            dto.setVehicleCapacity(operationalVehicle.getCapacity());
            dto.setVehicleCapacityUnit(operationalVehicle.getCapacityUnit());
        }

        long activeLoads = shipmentRepository.countActiveShipmentsByRoute(route);
        dto.setActiveLoads(activeLoads);
        dto.setTotalShipments(shipmentRepository.countByRoute(route));

        dto.setOriginLatitude(route.getOriginLatitude());
        dto.setOriginLongitude(route.getOriginLongitude());
        dto.setDestinationLatitude(route.getDestinationLatitude());
        dto.setDestinationLongitude(route.getDestinationLongitude());`;

  code = code.slice(0, idx) + replacement + code.slice(totalEnd);
  fs.writeFileSync(path, code, 'utf8');
  console.log('Successfully updated AdminRouteService.java');
} else {
  console.log('Could not find markers in AdminRouteService.java');
}
