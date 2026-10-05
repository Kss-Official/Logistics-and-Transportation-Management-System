$loginUrl = 'http://localhost:8080/api/auth/login'
$loginBody = @{
    email = 'customer@primeroute.com'
    password = 'customer123'
} | ConvertTo-Json

try {
    $loginRes = Invoke-RestMethod -Uri $loginUrl -Method Post -Body $loginBody -ContentType 'application/json'
    $token = if ($loginRes.token) { $loginRes.token } else { $loginRes.data.token }
    Write-Output "Logged in successfully as customer. Token received: $($token.Substring(0, 15))..."

    $headers = @{
        'Authorization' = "Bearer $token"
        'Content-Type' = 'application/json'
    }

    # Fetch addresses & products
    $addresses = (Invoke-RestMethod -Uri 'http://localhost:8080/api/customer/addresses' -Method Get -Headers $headers).data
    if (-not $addresses -or $addresses.Count -eq 0) {
        Write-Output "Creating sample pickup and delivery addresses..."
        $addr1 = @{
            addressType = 'WAREHOUSE'
            contactName = 'Alex Morgan'
            phone = '9876543210'
            addressLine1 = '123 Tech Park'
            city = 'Mumbai'
            state = 'Maharashtra'
            postalCode = '400001'
            country = 'India'
            defaultAddress = $true
        } | ConvertTo-Json
        $a1Res = (Invoke-RestMethod -Uri 'http://localhost:8080/api/customer/addresses' -Method Post -Headers $headers -Body $addr1).data

        $addr2 = @{
            addressType = 'OFFICE'
            contactName = 'Rahul Sharma'
            phone = '9876543211'
            addressLine1 = '456 Business Bay'
            city = 'Delhi'
            state = 'Delhi'
            postalCode = '110001'
            country = 'India'
            defaultAddress = $false
        } | ConvertTo-Json
        $a2Res = (Invoke-RestMethod -Uri 'http://localhost:8080/api/customer/addresses' -Method Post -Headers $headers -Body $addr2).data

        $addresses = @($a1Res, $a2Res)
    }

    $products = (Invoke-RestMethod -Uri 'http://localhost:8080/api/products' -Method Get -Headers $headers).data

    Write-Output "Found $($addresses.Count) addresses and $($products.Count) products."
    $pAddr = $addresses[0].id
    $dAddr = if ($addresses.Count -gt 1) { $addresses[1].id } else { $addresses[0].id }
    $prodId = $products[0].id

    # Test Validation: Create Order with NO paymentMethod
    Write-Output "Testing Requirement 2: No payment method validation"
    $invalidPayload = @{
        pickupAddressId = $pAddr
        deliveryAddressId = $dAddr
        items = @( @{ productId = $prodId; quantity = 1 } )
        deliveryType = 'STANDARD'
    } | ConvertTo-Json

    try {
        $badRes = Invoke-RestMethod -Uri 'http://localhost:8080/api/customer/orders' -Method Post -Headers $headers -Body $invalidPayload
        Write-Output "ERROR: Order creation should have failed without paymentMethod!"
    } catch {
        Write-Output "SUCCESS: Rejected order with no paymentMethod: $($_.Exception.Message)"
    }

    # Test each of the 6 payment methods
    $methods = @('UPI', 'CARD', 'NET_BANKING', 'BANK_TRANSFER', 'COD', 'CREDIT')
    $createdOrders = @()

    foreach ($m in $methods) {
        Write-Output "Testing Payment Method: $m"
        $payload = @{
            pickupAddressId = $pAddr
            deliveryAddressId = $dAddr
            items = @( @{ productId = $prodId; quantity = 1 } )
            deliveryType = 'STANDARD'
            paymentMethod = $m
        } | ConvertTo-Json

        $res = Invoke-RestMethod -Uri 'http://localhost:8080/api/customer/orders' -Method Post -Headers $headers -Body $payload
        $order = $res.data
        Write-Output "Order created: $($order.orderNumber) | Payment Method: $($order.paymentMethod) | Payment Status: $($order.paymentStatus) | Invoice #: $($order.invoiceNumber)"
        $createdOrders += $order
    }

    # Verify Invoice for each order
    Write-Output "Verifying Invoices in Database"
    $invoices = (Invoke-RestMethod -Uri 'http://localhost:8080/api/customer/invoices' -Method Get -Headers $headers).data
    Write-Output "Total customer invoices: $($invoices.Count)"

    foreach ($ord in $createdOrders) {
        $inv = $invoices | Where-Object { $_.orderNumber -eq $ord.orderNumber -or $_.orderId -eq $ord.id }
        if ($inv) {
            Write-Output "Invoice $($inv.invoiceNumber) (ID: $($inv.id)) -> Order: $($ord.orderNumber) | Method: $($inv.paymentMethod) | Status: $($inv.paymentStatus)"
        } else {
            Write-Output "WARNING: Invoice not found for order $($ord.orderNumber)"
        }
    }

    # Download Invoice PDF for UPI, COD, CREDIT
    Write-Output "Testing PDF Generation for UPI, COD, CREDIT"
    foreach ($ord in $createdOrders | Where-Object { $_.paymentMethod -in @('UPI', 'COD', 'CREDIT') }) {
        $pdfUrl = "http://localhost:8080/api/customer/invoices/$($ord.orderNumber)/download"
        $outPath = "d:\Transportation-Logistic\Invoice-$($ord.paymentMethod).pdf"
        Invoke-WebRequest -Uri $pdfUrl -Headers $headers -OutFile $outPath
        Write-Output "Downloaded PDF for $($ord.paymentMethod) to $outPath (Size: $((Get-Item $outPath).Length) bytes)"
    }

} catch {
    Write-Output "Error: $($_.Exception.Message)"
    if ($_.ErrorDetails) { Write-Output $_.ErrorDetails.Message }
}
