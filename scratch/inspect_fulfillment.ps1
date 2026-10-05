$base = 'C:\Users\shrut\Documents\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\Logistics-management\src\main\java\com\primeroute\logistics\service'
Write-Host "=== FulfillmentEngineService lines 80-180 ==="
Get-Content "$base\FulfillmentEngineService.java" | Select-Object -Skip 80 -First 100

Write-Host "=== OrderService lines 80-220 ==="
Get-Content "$base\OrderService.java" | Select-Object -Skip 80 -First 140
