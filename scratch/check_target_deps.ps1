$PSQL = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
$env:PGPASSWORD = "postgres123"

function Run-Query($sql, $title) {
    Write-Host "`n=== $title ===" -ForegroundColor Cyan
    & $PSQL -U postgres -d primeroute_db -c $sql
}

Run-Query "SELECT id, order_id, warehouse_id, status FROM fulfillment_allocations WHERE order_id IN (23, 25, 36, 41, 42, 46, 47, 48, 50);" "FULFILLMENT ALLOCATIONS FOR TARGET ORDERS"
Run-Query "SELECT id, order_id, product_id, quantity FROM order_items WHERE order_id IN (23, 25, 36, 41, 42, 46, 47, 48, 50);" "ORDER ITEMS FOR TARGET ORDERS"
Run-Query "SELECT id, reference_shipment, reference_order, transaction_type, quantity, product_name FROM inventory_transactions WHERE reference_order IN ('PR-ORD-90152708', 'PR-ORD-91982468', 'PR-ORD-56107751', 'PR-ORD-87787000', 'PR-ORD-46348206', 'PR-ORD-77581730', 'PR-ORD-11694295', 'PR-ORD-19214882', 'PR-ORD-55161890') OR reference_shipment IN ('PR-TRK-978XWFA4', 'PR-TRK-5HE8CLL3', 'PR-TRK-9352ES77', 'TRK-PR-Z56HH4YW', 'TRK-PR-JV685885', 'TRK-PR-BGQ7LNXH', 'TRK-PR-CR4R5P77', 'TRK-PR-H4ZVE8KN', 'TRK-PR-LBR4EJ33');" "INVENTORY TRANSACTIONS FOR TARGET ORDERS/SHIPMENTS"
