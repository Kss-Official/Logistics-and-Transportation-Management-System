$file = "C:\Users\shrut\Documents\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\Logistics-management\src\main\java\com\primeroute\logistics\dto\warehouse\WarehouseShipmentDTO.java"
$content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)

$oldSnippet = "    // Readiness`r`n    private boolean readyForDispatch;"
if (!$content.Contains($oldSnippet)) {
    $oldSnippet = "    // Readiness`n    private boolean readyForDispatch;"
}

$newSnippet = @"
    // Items
    private java.util.List<com.primeroute.logistics.dto.OrderItemDTO> items;

    // Readiness
    private boolean readyForDispatch;
"@

$content = $content.Replace($oldSnippet, $newSnippet)

$getterSetter = @"

    public java.util.List<com.primeroute.logistics.dto.OrderItemDTO> getItems() { return items; }
    public void setItems(java.util.List<com.primeroute.logistics.dto.OrderItemDTO> items) { this.items = items; }
}
"@

$lastBraceIndex = $content.LastIndexOf("}")
$content = $content.Substring(0, $lastBraceIndex) + $getterSetter

[System.IO.File]::WriteAllText($file, $content, (New-Object System.Text.UTF8Encoding $false))
Write-Host "Updated WarehouseShipmentDTO.java"
