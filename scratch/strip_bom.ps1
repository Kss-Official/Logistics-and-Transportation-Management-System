$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

$files = @(
    'C:\Users\shrut\Documents\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\Logistics-management\src\main\java\com\primeroute\logistics\config\DataInitializer.java',
    'C:\Users\shrut\Documents\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\Logistics-management\src\main\java\com\primeroute\logistics\service\GeocodingService.java',
    'C:\Users\shrut\Documents\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\Logistics-management\src\main\java\com\primeroute\logistics\service\FulfillmentEngineService.java',
    'C:\Users\shrut\Documents\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\Logistics-management\src\test\java\com\primeroute\logistics\service\FulfillmentEngineServiceTest.java'
)

foreach ($f in $files) {
    if (Test-Path $f) {
        $text = [System.IO.File]::ReadAllText($f)
        [System.IO.File]::WriteAllText($f, $text, $utf8NoBom)
        Write-Host "Rewrote without BOM: $f"
    }
}
