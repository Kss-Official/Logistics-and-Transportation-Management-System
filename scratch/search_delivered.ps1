$base = 'C:\Users\shrut\Documents\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\Logistics-management\src\main\java\com\primeroute\logistics'
Select-String -Path "$base\*.java", "$base\**\*.java" -Pattern "DELIVERED" | ForEach-Object {
    $rel = $_.Path.Substring($base.Length + 1)
    Write-Host "$rel : $($_.LineNumber) : $($_.Line.Trim())"
}
