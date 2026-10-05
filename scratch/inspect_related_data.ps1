$PSQL = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
$env:PGPASSWORD = "postgres123"

function Run-Query($sql, $title) {
    Write-Host "`n=== $title ===" -ForegroundColor Cyan
    & $PSQL -U postgres -d primeroute_db -c $sql
}

Run-Query "SELECT o.id, o.order_number, o.customer_id, o.origin_warehouse_id, o.status, s.id as shipment_id, s.tracking_number, s.driver_id, s.vehicle_id, s.status as shipment_status FROM orders o LEFT JOIN shipments s ON o.id = s.order_id ORDER BY o.id;" "ALL ORDERS AND THEIR SHIPMENTS"

Run-Query "SELECT id, invoice_number, order_id, shipment_id FROM invoices WHERE shipment_id IN (23, 24, 26, 32, 33, 39, 40, 41, 43) OR order_id IN (23, 25, 36, 41, 42, 46, 47, 48, 50);" "INVOICES LINKED TO DRIVER SHIPMENTS"

Run-Query "SELECT id, reference_shipment, reference_order, transaction_type, quantity, product_name FROM inventory_transactions WHERE reference_shipment IN ('PR-TRK-978XWFA4', 'PR-TRK-5HE8CLL3', 'PR-TRK-9352ES77', 'TRK-PR-Z56HH4YW', 'TRK-PR-JV685885', 'TRK-PR-BGQ7LNXH', 'TRK-PR-CR4R5P77', 'TRK-PR-H4ZVE8KN', 'TRK-PR-LBR4EJ33') OR reference_order IN ('PR-ORD-55161890', 'PR-ORD-11694295', 'PR-ORD-19214882', 'PR-ORD-77581730', 'PR-ORD-46348206', 'PR-ORD-87787000', 'PR-ORD-56107751', 'PR-ORD-91982468', 'PR-ORD-90152708');" "INVENTORY TRANSACTIONS LINKED TO DRIVER SHIPMENTS/ORDERS"

