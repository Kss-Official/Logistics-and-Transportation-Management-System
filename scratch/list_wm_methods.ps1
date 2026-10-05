$path = 'C:\Users\shrut\Documents\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\Logistics-management\src\main\java\com\primeroute\logistics\service\WarehouseManagerService.java'
$lines = Get-Content -Path $path
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match "public [A-Za-z0-9_<>, ]+\s+([a-zA-Z0-9_]+)\(") {
        Write-Host "$($i+1): $($lines[$i].Trim())"
    }
}
