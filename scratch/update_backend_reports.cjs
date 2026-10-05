const fs = require('fs');

const filePath = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics/service/AdminReportService.java';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix getOperationsOverview activeDrivers and activeVehicles
const oldOverview = `        long activeDrivers = drivers.stream()
                .filter(d -> d.getStatus() == DriverStatus.AVAILABLE || d.getStatus() == DriverStatus.ON_DUTY)
                .count();
        dto.setActiveDrivers(activeDrivers);

        long activeVehicles = vehicles.stream()
                .filter(v -> v.getStatus() == VehicleStatus.AVAILABLE || v.getStatus() == VehicleStatus.IN_TRANSIT)
                .count();
        dto.setActiveVehicles(activeVehicles);`;

const newOverview = `        long activeDrivers = drivers.stream()
                .filter(d -> d.getStatus() == DriverStatus.AVAILABLE || d.getStatus() == DriverStatus.ON_DUTY || d.getStatus() == DriverStatus.ON_DELIVERY || d.getStatus() == DriverStatus.ON_TRIP)
                .count();
        dto.setActiveDrivers(activeDrivers);

        long activeVehicles = vehicles.stream()
                .filter(v -> v.getStatus() == VehicleStatus.AVAILABLE || v.getStatus() == VehicleStatus.ASSIGNED || v.getStatus() == VehicleStatus.IN_TRANSIT)
                .count();
        dto.setActiveVehicles(activeVehicles);`;

// 2. Fix getFleetAnalytics
const oldFleet = `    public FleetAnalyticsDTO getFleetAnalytics() {
        List<Vehicle> vehicles = vehicleRepository.findAllByOrderByCreatedAtDesc();
        List<Shipment> shipments = shipmentRepository.findAll();
        List<Route> routes = routeRepository.findAll();

        FleetAnalyticsDTO dto = new FleetAnalyticsDTO();
        dto.setTotalVehicles(vehicles.size());

        long active = vehicles.stream().filter(v -> v.getStatus() == VehicleStatus.AVAILABLE || v.getStatus() == VehicleStatus.IN_TRANSIT).count();
        dto.setActiveVehicles(active);

        long available = vehicles.stream().filter(v -> v.getStatus() == VehicleStatus.AVAILABLE).count();
        dto.setAvailableVehicles(available);

        long maintenance = vehicles.stream().filter(v -> v.getStatus() == VehicleStatus.MAINTENANCE || v.getStatus() == VehicleStatus.INACTIVE).count();
        dto.setMaintenanceVehicles(maintenance);

        long assigned = vehicles.stream().filter(v -> v.getAssignedDriver() != null || routes.stream().anyMatch(r -> r.getVehicle() != null && r.getVehicle().getId().equals(v.getId()))).count();
        dto.setAssignedVehicles(assigned);

        double utilRate = vehicles.isEmpty() ? 0.0 : ((double) assigned / vehicles.size() * 100.0);
        dto.setUtilizationRate(Math.round(utilRate * 10.0) / 10.0);

        Map<String, Long> typeMap = new LinkedHashMap<>();
        for (Vehicle v : vehicles) {
            String tName = v.getVehicleType() != null ? v.getVehicleType().name() : "STANDARD";
            typeMap.put(tName, typeMap.getOrDefault(tName, 0L) + 1L);
        }
        dto.setVehicleTypeDistribution(typeMap);

        List<FleetAnalyticsDTO.VehicleRosterItemDTO> roster = new ArrayList<>();
        for (Vehicle v : vehicles) {
            FleetAnalyticsDTO.VehicleRosterItemDTO item = new FleetAnalyticsDTO.VehicleRosterItemDTO();
            item.setId(v.getId());
            item.setLicensePlate(v.getVehicleNumber() != null ? v.getVehicleNumber() : v.getRegistrationNumber());
            item.setModel(v.getModel() != null ? v.getModel() : "Commercial Fleet");
            item.setType(v.getVehicleType() != null ? v.getVehicleType().name() : "STANDARD");
            item.setStatus(v.getStatus() != null ? v.getStatus().name() : "AVAILABLE");
            item.setCapacityTons(v.getCapacity() != null ? v.getCapacity() : 5.0);

            String driverName = v.getAssignedDriver() != null ? v.getAssignedDriver().getFullName() : "Unassigned";
            item.setAssignedDriver(driverName);

            Optional<Route> matchedRoute = routes.stream().filter(r -> r.getVehicle() != null && r.getVehicle().getId().equals(v.getId())).findFirst();
            item.setAssignedRoute(matchedRoute.map(r -> r.getOrigin() + " \u2192 " + r.getDestination()).orElse("None Assigned"));

            long activeLoads = shipments.stream()
                    .filter(s -> s.getVehicle() != null && s.getVehicle().getId().equals(v.getId()) &&
                            (s.getStatus() == OrderStatus.IN_TRANSIT || s.getStatus() == OrderStatus.PICKED_UP))
                    .count();
            item.setActiveLoads(activeLoads);

            roster.add(item);
        }
        dto.setVehicleRoster(roster);

        return dto;
    }`;

const newFleet = `    public FleetAnalyticsDTO getFleetAnalytics() {
        List<Vehicle> vehicles = vehicleRepository.findAllByOrderByCreatedAtDesc();
        List<Shipment> shipments = shipmentRepository.findAll();
        List<Route> routes = routeRepository.findAll();

        FleetAnalyticsDTO dto = new FleetAnalyticsDTO();
        dto.setTotalVehicles(vehicles.size());

        long active = vehicles.stream().filter(v -> v.getStatus() == VehicleStatus.AVAILABLE || v.getStatus() == VehicleStatus.ASSIGNED || v.getStatus() == VehicleStatus.IN_TRANSIT).count();
        dto.setActiveVehicles(active);

        long assigned = vehicles.stream().filter(v -> v.getStatus() == VehicleStatus.ASSIGNED || v.getAssignedDriver() != null || routes.stream().anyMatch(r -> r.getVehicle() != null && r.getVehicle().getId().equals(v.getId()))).count();
        dto.setAssignedVehicles(assigned);

        long maintenance = vehicles.stream().filter(v -> v.getStatus() == VehicleStatus.MAINTENANCE || v.getStatus() == VehicleStatus.INACTIVE).count();
        dto.setMaintenanceVehicles(maintenance);

        long available = vehicles.stream().filter(v -> v.getStatus() == VehicleStatus.AVAILABLE && v.getAssignedDriver() == null && routes.stream().noneMatch(r -> r.getVehicle() != null && r.getVehicle().getId().equals(v.getId()))).count();
        dto.setAvailableVehicles(available);

        double utilRate = vehicles.isEmpty() ? 0.0 : ((double) assigned / vehicles.size() * 100.0);
        dto.setUtilizationRate(Math.round(utilRate * 10.0) / 10.0);

        Map<String, Long> typeMap = new LinkedHashMap<>();
        for (Vehicle v : vehicles) {
            String tName = v.getVehicleType() != null ? v.getVehicleType().name() : "STANDARD";
            typeMap.put(tName, typeMap.getOrDefault(tName, 0L) + 1L);
        }
        dto.setVehicleTypeDistribution(typeMap);

        List<FleetAnalyticsDTO.VehicleRosterItemDTO> roster = new ArrayList<>();
        for (Vehicle v : vehicles) {
            FleetAnalyticsDTO.VehicleRosterItemDTO item = new FleetAnalyticsDTO.VehicleRosterItemDTO();
            item.setId(v.getId());
            item.setLicensePlate(v.getVehicleNumber() != null ? v.getVehicleNumber() : v.getRegistrationNumber());
            item.setModel(v.getModel() != null ? v.getModel() : "Commercial Fleet");
            item.setType(v.getVehicleType() != null ? v.getVehicleType().name() : "STANDARD");
            item.setStatus(v.getStatus() != null ? v.getStatus().name() : "AVAILABLE");
            item.setCapacityTons(v.getCapacity() != null ? v.getCapacity() : 5.0);

            String driverName = v.getAssignedDriver() != null ? v.getAssignedDriver().getFullName() : "Unassigned";
            item.setAssignedDriver(driverName);

            Optional<Route> matchedRoute = routes.stream().filter(r ->
                (r.getVehicle() != null && r.getVehicle().getId().equals(v.getId())) ||
                (v.getAssignedDriver() != null && r.getDriver() != null && r.getDriver().getId().equals(v.getAssignedDriver().getId()))
            ).findFirst();
            item.setAssignedRoute(matchedRoute.map(r -> r.getOrigin() + " \u2192 " + r.getDestination()).orElse("None Assigned"));

            long activeLoads = shipments.stream()
                    .filter(s -> s.getVehicle() != null && s.getVehicle().getId().equals(v.getId()) &&
                            (s.getStatus() == OrderStatus.IN_TRANSIT || s.getStatus() == OrderStatus.PICKED_UP || s.getStatus() == OrderStatus.OUT_FOR_DELIVERY))
                    .count();
            item.setActiveLoads(activeLoads);

            roster.add(item);
        }
        dto.setVehicleRoster(roster);

        return dto;
    }`;

// 3. Fix getDriverPerformance
const oldDrivers = `    public DriverPerformanceReportDTO getDriverPerformance() {
        List<Driver> drivers = driverRepository.findAllByOrderByCreatedAtDesc();
        List<Shipment> shipments = shipmentRepository.findAll();
        List<Route> routes = routeRepository.findAll();
        List<Vehicle> vehicles = vehicleRepository.findAll();

        DriverPerformanceReportDTO dto = new DriverPerformanceReportDTO();
        dto.setTotalDrivers(drivers.size());

        long active = drivers.stream().filter(d -> d.getStatus() == DriverStatus.AVAILABLE || d.getStatus() == DriverStatus.ON_DUTY).count();
        dto.setActiveDrivers(active);

        long available = drivers.stream().filter(d -> d.getStatus() == DriverStatus.AVAILABLE).count();
        dto.setAvailableDrivers(available);

        long assigned = drivers.stream().filter(d ->
                vehicles.stream().anyMatch(v -> v.getAssignedDriver() != null && v.getAssignedDriver().getId().equals(d.getId())) ||
                routes.stream().anyMatch(r -> r.getDriver() != null && r.getDriver().getId().equals(d.getId()))
        ).count();
        dto.setAssignedDrivers(assigned);

        List<DriverPerformanceReportDTO.DriverPerformanceItemDTO> roster = new ArrayList<>();
        for (Driver d : drivers) {
            DriverPerformanceReportDTO.DriverPerformanceItemDTO item = new DriverPerformanceReportDTO.DriverPerformanceItemDTO();
            item.setId(d.getId());
            item.setName(d.getFullName());
            item.setLicenseNumber(d.getLicenseNumber() != null ? d.getLicenseNumber() : "DL-PENDING");
            item.setPhone(d.getPhone() != null ? d.getPhone() : "N/A");
            item.setStatus(d.getStatus() != null ? d.getStatus().name() : "AVAILABLE");

            Optional<Vehicle> veh = vehicles.stream().filter(v -> v.getAssignedDriver() != null && v.getAssignedDriver().getId().equals(d.getId())).findFirst();
            item.setAssignedVehicle(veh.map(v -> v.getVehicleNumber() != null ? v.getVehicleNumber() : v.getModel()).orElse("Unassigned"));

            Optional<Route> r = routes.stream().filter(rt -> rt.getDriver() != null && rt.getDriver().getId().equals(d.getId())).findFirst();
            item.setAssignedRoute(r.map(rt -> rt.getOrigin() + " \u2192 " + rt.getDestination()).orElse("Standby"));

            long runs = shipments.stream().filter(s -> s.getDriver() != null && s.getDriver().getId().equals(d.getId())).count();
            long onTime = shipments.stream().filter(s -> s.getDriver() != null && s.getDriver().getId().equals(d.getId()) && s.getStatus() == OrderStatus.DELIVERED).count();

            item.setTotalRuns(runs);
            item.setOnTimeRuns(onTime);
            double rate = (runs == 0) ? 98.0 : ((double) onTime / runs * 100.0);
            item.setOnTimeRate(Math.round(rate * 10.0) / 10.0);
            item.setRating(4.8); // Professional benchmark rating

            roster.add(item);
        }
        dto.setDrivers(roster);

        return dto;
    }`;

const newDrivers = `    public DriverPerformanceReportDTO getDriverPerformance() {
        List<Driver> drivers = driverRepository.findAllByOrderByCreatedAtDesc();
        List<Shipment> shipments = shipmentRepository.findAll();
        List<Route> routes = routeRepository.findAll();
        List<Vehicle> vehicles = vehicleRepository.findAll();

        DriverPerformanceReportDTO dto = new DriverPerformanceReportDTO();
        dto.setTotalDrivers(drivers.size());

        long active = drivers.stream().filter(d -> d.getStatus() == DriverStatus.AVAILABLE || d.getStatus() == DriverStatus.ON_DUTY || d.getStatus() == DriverStatus.ON_DELIVERY || d.getStatus() == DriverStatus.ON_TRIP).count();
        dto.setActiveDrivers(active);

        long assigned = drivers.stream().filter(d ->
                d.getStatus() == DriverStatus.ON_DUTY || d.getStatus() == DriverStatus.ON_DELIVERY || d.getStatus() == DriverStatus.ON_TRIP ||
                vehicles.stream().anyMatch(v -> v.getAssignedDriver() != null && v.getAssignedDriver().getId().equals(d.getId())) ||
                routes.stream().anyMatch(r -> r.getDriver() != null && r.getDriver().getId().equals(d.getId()))
        ).count();
        dto.setAssignedDrivers(assigned);

        long available = drivers.stream().filter(d ->
                d.getStatus() == DriverStatus.AVAILABLE &&
                vehicles.stream().noneMatch(v -> v.getAssignedDriver() != null && v.getAssignedDriver().getId().equals(d.getId())) &&
                routes.stream().noneMatch(r -> r.getDriver() != null && r.getDriver().getId().equals(d.getId()))
        ).count();
        dto.setAvailableDrivers(available);

        List<DriverPerformanceReportDTO.DriverPerformanceItemDTO> roster = new ArrayList<>();
        for (Driver d : drivers) {
            DriverPerformanceReportDTO.DriverPerformanceItemDTO item = new DriverPerformanceReportDTO.DriverPerformanceItemDTO();
            item.setId(d.getId());
            item.setName(d.getFullName());
            item.setLicenseNumber(d.getLicenseNumber() != null ? d.getLicenseNumber() : "DL-PENDING");
            item.setPhone(d.getPhone() != null ? d.getPhone() : "N/A");
            item.setStatus(d.getStatus() != null ? d.getStatus().name() : "AVAILABLE");

            Optional<Vehicle> veh = vehicles.stream().filter(v -> v.getAssignedDriver() != null && v.getAssignedDriver().getId().equals(d.getId())).findFirst();
            item.setAssignedVehicle(veh.map(v -> v.getVehicleNumber() != null ? v.getVehicleNumber() : v.getModel()).orElse("Unassigned"));

            Optional<Route> r = routes.stream().filter(rt ->
                (rt.getDriver() != null && rt.getDriver().getId().equals(d.getId())) ||
                (rt.getVehicle() != null && veh.isPresent() && rt.getVehicle().getId().equals(veh.get().getId()))
            ).findFirst();
            item.setAssignedRoute(r.map(rt -> rt.getOrigin() + " \u2192 " + rt.getDestination()).orElse("Standby"));

            long runs = shipments.stream().filter(s ->
                (s.getDriver() != null && s.getDriver().getId().equals(d.getId())) ||
                (veh.isPresent() && s.getVehicle() != null && s.getVehicle().getId().equals(veh.get().getId()))
            ).count();

            long onTime = shipments.stream().filter(s ->
                ((s.getDriver() != null && s.getDriver().getId().equals(d.getId())) ||
                 (veh.isPresent() && s.getVehicle() != null && s.getVehicle().getId().equals(veh.get().getId()))) &&
                s.getStatus() == OrderStatus.DELIVERED
            ).count();

            item.setTotalRuns(runs);
            item.setOnTimeRuns(onTime);
            double rate = (runs == 0) ? 100.0 : ((double) onTime / runs * 100.0);
            item.setOnTimeRate(Math.round(rate * 10.0) / 10.0);
            item.setRating(4.8);

            roster.add(item);
        }
        dto.setDrivers(roster);

        return dto;
    }`;

// 4. Fix getRoutePerformance
const oldRoutes = `    public RoutePerformanceReportDTO getRoutePerformance() {
        List<Route> routes = routeRepository.findAllWithDetails();
        List<Shipment> shipments = shipmentRepository.findAll();

        RoutePerformanceReportDTO dto = new RoutePerformanceReportDTO();
        dto.setTotalRoutes(routes.size());

        long active = routes.stream().filter(r -> r.getStatus() == RouteStatus.ACTIVE).count();
        dto.setActiveRoutes(active);
        dto.setInactiveRoutes(routes.size() - active);

        List<RoutePerformanceReportDTO.RoutePerformanceItemDTO> list = new ArrayList<>();
        for (Route r : routes) {
            RoutePerformanceReportDTO.RoutePerformanceItemDTO item = new RoutePerformanceReportDTO.RoutePerformanceItemDTO();
            item.setId(r.getId());
            item.setRouteName(r.getOrigin() + " \u2192 " + r.getDestination());
            item.setOrigin(r.getOrigin());
            item.setDestination(r.getDestination());
            item.setDistanceKm(r.getDistanceKm() != null ? r.getDistanceKm() : 0.0);
            item.setEstimatedHours(r.getEstimatedTransitHours() != null ? r.getEstimatedTransitHours() : (r.getEstimatedTransitTimeHours() != null ? r.getEstimatedTransitTimeHours() : 0.0));
            item.setStatus(r.getStatus() != null ? r.getStatus().name() : "ACTIVE");

            item.setAssignedDriver(r.getDriver() != null ? r.getDriver().getFullName() : "Unassigned");
            item.setAssignedVehicle(r.getVehicle() != null ? (r.getVehicle().getVehicleNumber() != null ? r.getVehicle().getVehicleNumber() : r.getVehicle().getModel()) : "Unassigned");

            long activeLoads = shipments.stream()
                    .filter(s -> s.getRoute() != null && s.getRoute().getId().equals(r.getId()) &&
                            (s.getStatus() == OrderStatus.IN_TRANSIT || s.getStatus() == OrderStatus.PICKED_UP))
                    .count();
            item.setActiveLoads(activeLoads);

            long totalRouted = shipments.stream()
                    .filter(s -> s.getRoute() != null && s.getRoute().getId().equals(r.getId()))
                    .count();
            item.setTotalShipments(totalRouted);

            list.add(item);
        }

        list.sort((a, b) -> Long.compare(b.getTotalShipments(), a.getTotalShipments()));
        dto.setRoutes(list);

        return dto;
    }`;

const newRoutes = `    public RoutePerformanceReportDTO getRoutePerformance() {
        List<Route> routes = routeRepository.findAllWithDetails();
        List<Shipment> shipments = shipmentRepository.findAll();
        List<Vehicle> vehicles = vehicleRepository.findAll();

        RoutePerformanceReportDTO dto = new RoutePerformanceReportDTO();
        dto.setTotalRoutes(routes.size());

        long active = routes.stream().filter(r -> r.getStatus() == RouteStatus.ACTIVE).count();
        dto.setActiveRoutes(active);
        dto.setInactiveRoutes(routes.size() - active);

        List<RoutePerformanceReportDTO.RoutePerformanceItemDTO> list = new ArrayList<>();
        for (Route r : routes) {
            RoutePerformanceReportDTO.RoutePerformanceItemDTO item = new RoutePerformanceReportDTO.RoutePerformanceItemDTO();
            item.setId(r.getId());
            item.setRouteName(r.getOrigin() + " \u2192 " + r.getDestination());
            item.setOrigin(r.getOrigin());
            item.setDestination(r.getDestination());
            item.setDistanceKm(r.getDistanceKm() != null ? r.getDistanceKm() : 0.0);
            item.setEstimatedHours(r.getEstimatedTransitHours() != null ? r.getEstimatedTransitHours() : (r.getEstimatedTransitTimeHours() != null ? r.getEstimatedTransitTimeHours() : 0.0));
            item.setStatus(r.getStatus() != null ? r.getStatus().name() : "ACTIVE");

            String driverName = r.getDriver() != null ? r.getDriver().getFullName() :
                (r.getVehicle() != null && r.getVehicle().getAssignedDriver() != null ? r.getVehicle().getAssignedDriver().getFullName() : "Unassigned");
            item.setAssignedDriver(driverName);

            String vehicleName = r.getVehicle() != null ? (r.getVehicle().getVehicleNumber() != null ? r.getVehicle().getVehicleNumber() : r.getVehicle().getModel()) :
                (r.getDriver() != null ? vehicles.stream().filter(v -> v.getAssignedDriver() != null && v.getAssignedDriver().getId().equals(r.getDriver().getId())).findFirst().map(v -> v.getVehicleNumber() != null ? v.getVehicleNumber() : v.getModel()).orElse("Unassigned") : "Unassigned");
            item.setAssignedVehicle(vehicleName);

            long activeLoads = shipments.stream()
                    .filter(s -> (s.getRoute() != null && s.getRoute().getId().equals(r.getId())) ||
                                 (r.getVehicle() != null && s.getVehicle() != null && s.getVehicle().getId().equals(r.getVehicle().getId())))
                    .filter(s -> s.getStatus() == OrderStatus.IN_TRANSIT || s.getStatus() == OrderStatus.PICKED_UP || s.getStatus() == OrderStatus.OUT_FOR_DELIVERY)
                    .count();
            item.setActiveLoads(activeLoads);

            long totalRouted = shipments.stream()
                    .filter(s -> (s.getRoute() != null && s.getRoute().getId().equals(r.getId())) ||
                                 (r.getVehicle() != null && s.getVehicle() != null && s.getVehicle().getId().equals(r.getVehicle().getId())))
                    .count();
            item.setTotalShipments(totalRouted);

            list.add(item);
        }

        list.sort((a, b) -> Long.compare(b.getTotalShipments(), a.getTotalShipments()));
        dto.setRoutes(list);

        return dto;
    }`;

// Normalize line endings
content = content.replace(/\r\n/g, '\n');
const normOldOverview = oldOverview.replace(/\r\n/g, '\n');
const normOldFleet = oldFleet.replace(/\r\n/g, '\n');
const normOldDrivers = oldDrivers.replace(/\r\n/g, '\n');
const normOldRoutes = oldRoutes.replace(/\r\n/g, '\n');

if (!content.includes(normOldOverview)) {
    console.error('ERROR: Could not find oldOverview in file');
}
if (!content.includes(normOldFleet)) {
    console.error('ERROR: Could not find oldFleet in file');
}
if (!content.includes(normOldDrivers)) {
    console.error('ERROR: Could not find oldDrivers in file');
}
if (!content.includes(normOldRoutes)) {
    console.error('ERROR: Could not find oldRoutes in file');
}

content = content.replace(normOldOverview, newOverview.replace(/\r\n/g, '\n'));
content = content.replace(normOldFleet, newFleet.replace(/\r\n/g, '\n'));
content = content.replace(normOldDrivers, newDrivers.replace(/\r\n/g, '\n'));
content = content.replace(normOldRoutes, newRoutes.replace(/\r\n/g, '\n'));

fs.writeFileSync(filePath, content, 'utf8');
console.log('SUCCESS: AdminReportService.java updated.');
