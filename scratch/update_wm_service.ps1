$path = 'C:\Users\shrut\Documents\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\Logistics-management\src\main\java\com\primeroute\logistics\service\WarehouseManagerService.java'
$content = Get-Content -Path $path -Raw

# 1. Update assignFleet stage validation to allow both PACKED and READY_FOR_DISPATCH
$oldAssignCheck = 'if (!"PACKED".equals(currentStage)) {'
$newAssignCheck = 'if (!"PACKED".equals(currentStage) && !"READY_FOR_DISPATCH".equals(currentStage)) {'
$content = $content.Replace($oldAssignCheck, $newAssignCheck)

# 2. Update dashboard counts
$oldDashCounts = '        List<Shipment> readyForDispatch = shipmentRepository.findReadyForDispatchByWarehouse(warehouse);
        dto.setReadyForDispatchCount(readyForDispatch.size());'

$newDashCounts = '        List<Shipment> allOriginShipments = shipmentRepository.findByOriginWarehouseOrderByCreatedAtDesc(warehouse);
        long readyToProcess = allOriginShipments.stream()
                .filter(s -> s.getStatus() != OrderStatus.CANCELLED && s.getStatus() != OrderStatus.DELIVERED)
                .filter(s -> "READY_FOR_PROCESSING".equalsIgnoreCase(s.getOperationalStage()) || s.getOperationalStage() == null)
                .count();
        long picking = allOriginShipments.stream()
                .filter(s -> s.getStatus() != OrderStatus.CANCELLED && s.getStatus() != OrderStatus.DELIVERED)
                .filter(s -> "PICKING".equalsIgnoreCase(s.getOperationalStage()))
                .count();
        long packed = allOriginShipments.stream()
                .filter(s -> s.getStatus() != OrderStatus.CANCELLED && s.getStatus() != OrderStatus.DELIVERED)
                .filter(s -> "PACKED".equalsIgnoreCase(s.getOperationalStage()))
                .count();
        long readyForDispatch = allOriginShipments.stream()
                .filter(s -> s.getStatus() != OrderStatus.CANCELLED && s.getStatus() != OrderStatus.DELIVERED)
                .filter(s -> "READY_FOR_DISPATCH".equalsIgnoreCase(s.getOperationalStage()))
                .count();

        dto.setReadyToProcessCount(readyToProcess);
        dto.setPickingCount(picking);
        dto.setPackedCount(packed);
        dto.setReadyForDispatchCount(readyForDispatch);'

$content = $content.Replace($oldDashCounts, $newDashCounts)

Set-Content -Path $path -Value $content -NoNewline
Write-Host "Updated WarehouseManagerService.java"
