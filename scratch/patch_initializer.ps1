$file = "C:\Users\shrut\Documents\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\Logistics-management\src\main\java\com\primeroute\logistics\config\DataInitializer.java"
$content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)

# Replace the initial admin password
$oldSnippet = 'passwordEncoder.encode("Admin@PrimeRoute2026!")'
$newSnippet = 'passwordEncoder.encode("Sanjana@102026")'

if ($content.Contains($oldSnippet)) {
    $content = $content.Replace($oldSnippet, $newSnippet)
    [System.IO.File]::WriteAllText($file, $content, (New-Object System.Text.UTF8Encoding $false))
    Write-Host "Successfully updated DataInitializer.java with Sanjana@102026"
} else {
    Write-Host "Snippet not found"
}
