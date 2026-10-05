$path = 'C:\Users\shrut\Documents\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\Logistics-management\src\main\java\com\primeroute\logistics\service\AdminVehicleService.java'
$content = Get-Content -Path $path -Raw

# Add disassociateDriverFromOtherVehicles method and invoke it
$helperMethod = @"
    private void disassociateDriverFromOtherVehicles(Driver driver, Long currentVehicleId) {
        if (driver == null) return;
        List<Vehicle> existingVehicles = vehicleRepository.findByAssignedDriver(driver);
        for (Vehicle other : existingVehicles) {
            if (currentVehicleId == null || !other.getId().equals(currentVehicleId)) {
                other.setAssignedDriver(null);
                if (other.getStatus() == VehicleStatus.ASSIGNED) {
                    other.setStatus(VehicleStatus.AVAILABLE);
                }
                vehicleRepository.save(other);
            }
        }
    }
"@

if (!$content.Contains("disassociateDriverFromOtherVehicles")) {
    $content = $content.Replace("    public VehicleDTO assignDriver(Long id, AssignDriverRequest req) {", $helperMethod + "`r`n`r`n    public VehicleDTO assignDriver(Long id, AssignDriverRequest req) {")
    
    # In createVehicle
    $oldCreateDriver = "        if (req.getDriverId() != null) {
            Driver driver = driverRepository.findById(req.getDriverId())
                    .orElseThrow(() -> new ResourceNotFoundException(""Driver not found with id: "" + req.getDriverId()));
            vehicle.setAssignedDriver(driver);"
    $newCreateDriver = "        if (req.getDriverId() != null) {
            Driver driver = driverRepository.findById(req.getDriverId())
                    .orElseThrow(() -> new ResourceNotFoundException(""Driver not found with id: "" + req.getDriverId()));
            disassociateDriverFromOtherVehicles(driver, null);
            vehicle.setAssignedDriver(driver);"
    $content = $content.Replace($oldCreateDriver, $newCreateDriver)

    # In updateVehicle
    $oldUpdateDriver = "        if (req.getDriverId() != null) {
            Driver driver = driverRepository.findById(req.getDriverId())
                    .orElseThrow(() -> new ResourceNotFoundException(""Driver not found with id: "" + req.getDriverId()));
            vehicle.setAssignedDriver(driver);"
    $newUpdateDriver = "        if (req.getDriverId() != null) {
            Driver driver = driverRepository.findById(req.getDriverId())
                    .orElseThrow(() -> new ResourceNotFoundException(""Driver not found with id: "" + req.getDriverId()));
            disassociateDriverFromOtherVehicles(driver, vehicle.getId());
            vehicle.setAssignedDriver(driver);"
    $content = $content.Replace($oldUpdateDriver, $newUpdateDriver)

    # In assignDriver
    $oldAssignDriver = "            vehicle.setAssignedDriver(driver);
            if (vehicle.getWarehouse() != null) {"
    $newAssignDriver = "            disassociateDriverFromOtherVehicles(driver, vehicle.getId());
            vehicle.setAssignedDriver(driver);
            if (vehicle.getWarehouse() != null) {"
    $content = $content.Replace($oldAssignDriver, $newAssignDriver)

    Set-Content -Path $path -Value $content -NoNewline
    Write-Host "Updated AdminVehicleService.java with driver-vehicle unique pairing logic"
} else {
    Write-Host "Already updated AdminVehicleService.java"
}
