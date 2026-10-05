const fs = require('fs');
const path = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics/controller/DriverPortalController.java';
let content = fs.readFileSync(path, 'utf8');

const routeEndpoints = `
    /**
     * Retrieves dynamic road navigation route, coordinates, distance, and ETA for a specific shipment.
     */
    @GetMapping("/deliveries/{id}/route")
    public ResponseEntity<?> getDeliveryRoute(@PathVariable("id") Long id) {
        try {
            DriverRouteDTO route = driverPortalService.getDeliveryRoute(id);
            if (route == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, "No delivery route found for shipment #" + id, null));
            }
            return ResponseEntity.ok(new ApiResponse<>(true, "Delivery route retrieved successfully", route));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Failed to calculate route: " + e.getMessage(), null));
        }
    }

    /**
     * Retrieves dynamic road navigation route for the driver's active delivery.
     */
    @GetMapping("/deliveries/active/route")
    public ResponseEntity<?> getActiveDeliveryRoute() {
        try {
            DriverRouteDTO route = driverPortalService.getActiveDeliveryRoute();
            if (route == null) {
                return ResponseEntity.ok(new ApiResponse<>(true, "No active delivery route assigned", null));
            }
            return ResponseEntity.ok(new ApiResponse<>(true, "Active delivery route retrieved successfully", route));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Failed to calculate active delivery route: " + e.getMessage(), null));
        }
    }
`;

if (!content.includes('getDeliveryRoute(')) {
  const lastIndex = content.lastIndexOf('}');
  content = content.substring(0, lastIndex) + routeEndpoints + '\n}\n';
  fs.writeFileSync(path, content, 'utf8');
  console.log('DriverPortalController updated successfully.');
} else {
  console.log('DriverPortalController already has getDeliveryRoute.');
}
