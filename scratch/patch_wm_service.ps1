$file = "C:\Users\shrut\Documents\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\Logistics-management\src\main\java\com\primeroute\logistics\service\WarehouseManagerService.java"
$content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)

$oldSnippet = @"
            if (s.getOrder().getDeliveryAddress() != null) {
                dto.setDeliveryAddress(s.getOrder().getDeliveryAddress().getAddressLine1() + ", " + s.getOrder().getDeliveryAddress().getCity());
                dto.setDestinationCity(s.getOrder().getDeliveryAddress().getCity());
            }
        }
"@

$newSnippet = @"
            if (s.getOrder().getDeliveryAddress() != null) {
                dto.setDeliveryAddress(s.getOrder().getDeliveryAddress().getAddressLine1() + ", " + s.getOrder().getDeliveryAddress().getCity());
                dto.setDestinationCity(s.getOrder().getDeliveryAddress().getCity());
            }

            if (s.getOrder().getItems() != null && !s.getOrder().getItems().isEmpty()) {
                dto.setItems(s.getOrder().getItems().stream().map(oi -> new com.primeroute.logistics.dto.OrderItemDTO(
                        oi.getId(),
                        oi.getProduct() != null ? oi.getProduct().getId() : null,
                        oi.getProduct() != null ? oi.getProduct().getSku() : "",
                        oi.getProduct() != null ? oi.getProduct().getName() : "",
                        oi.getProduct() != null ? oi.getProduct().getCategory() : "",
                        oi.getQuantity(),
                        oi.getUnitWeight(),
                        oi.getUnitPrice(),
                        oi.getTotalWeight()
                )).collect(Collectors.toList()));
            }
        }
"@

if ($content.Contains($oldSnippet)) {
    $content = $content.Replace($oldSnippet, $newSnippet)
    [System.IO.File]::WriteAllText($file, $content, (New-Object System.Text.UTF8Encoding $false))
    Write-Host "Updated WarehouseManagerService.java with shipment items mapping"
} else {
    # Check normalized line endings
    $oldNorm = $oldSnippet.Replace("`r`n", "`n")
    $contentNorm = $content.Replace("`r`n", "`n")
    if ($contentNorm.Contains($oldNorm)) {
        $newNorm = $newSnippet.Replace("`r`n", "`n")
        $contentNorm = $contentNorm.Replace($oldNorm, $newNorm)
        [System.IO.File]::WriteAllText($file, $contentNorm, (New-Object System.Text.UTF8Encoding $false))
        Write-Host "Updated WarehouseManagerService.java (normalized)"
    } else {
        Write-Host "Target snippet not found"
    }
}
