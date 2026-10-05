$base = 'C:\Users\shrut\Documents\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\Logistics-management\src\main\java\com\primeroute\logistics\service'
Write-Host "=== FulfillmentEngineService.java ==="
Get-Content "$base\FulfillmentEngineService.java" | Select-Object -First 60

Write-Host "=== OrderService.java ==="
Get-Content "$base\OrderService.java" | Select-Object -First 60
