$base = 'C:\Users\shrut\Documents\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\Logistics-management\src\main\java\com\primeroute\logistics'
Get-ChildItem -Path $base -Recurse -File | ForEach-Object {
    $rel = $_.FullName.Substring($base.Length + 1)
    Write-Host $rel
}
