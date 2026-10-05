$path = 'C:\Users\shrut\Documents\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\Logistics-management\src\main\java\com\primeroute\logistics\service\WarehouseManagerService.java'
$content = Get-Content -Path $path -Raw
$pattern = '(?s)\r?\n\s*@Autowired\r?\n\s*public WarehouseManagerService\(\r?\n\s*UserRepository userRepository,\r?\n\s*WarehouseRepository warehouseRepository,\r?\n\s*InventoryRepository inventoryRepository,\r?\n\s*InventoryTransactionRepository transactionRepository,\r?\n\s*ShipmentRepository shipmentRepository,\r?\n\s*DriverRepository driverRepository,\r?\n\s*VehicleRepository vehicleRepository,\r?\n\s*ShipmentTrackingEventRepository trackingEventRepository\)\s*\{[^\}]*\}'
$newContent = [regex]::Replace($content, $pattern, '')
Set-Content -Path $path -Value $newContent -NoNewline
Write-Host "Removed second constructor successfully"
