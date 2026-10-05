$PSQL = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
if (-not (Test-Path $PSQL)) {
    $PSQL = (Get-Command psql.exe -ErrorAction SilentlyContinue).Source
}

$env:PGPASSWORD = "postgres123"

function Run-Query($sql, $title) {
    Write-Host "`n=== $title ===" -ForegroundColor Cyan
    & $PSQL -U postgres -d primeroute_db -c $sql
}

Run-Query "SELECT count(*) AS total_drivers FROM drivers;" "DRIVERS COUNT"
Run-Query "SELECT id, driver_code, full_name, email, phone, status, assigned_warehouse_id FROM drivers ORDER BY id;" "ALL DRIVERS"

Run-Query "SELECT count(*) AS total_vehicles FROM vehicles;" "VEHICLES COUNT"
Run-Query "SELECT id, vehicle_number, registration_number, vehicle_type, status, assigned_warehouse_id, assigned_driver_id FROM vehicles ORDER BY id;" "ALL VEHICLES"

Run-Query "SELECT count(*) AS total_warehouses FROM warehouses;" "WAREHOUSES COUNT"
Run-Query "SELECT id, warehouse_code, warehouse_name, city, status FROM warehouses ORDER BY id;" "ALL WAREHOUSES"

Run-Query "SELECT count(*) AS total_users FROM users;" "USERS COUNT"
Run-Query "SELECT id, email, full_name, role, is_active FROM users ORDER BY id;" "ALL USERS"

Run-Query "SELECT count(*) AS total_orders FROM orders;" "ORDERS COUNT"
Run-Query "SELECT id, order_number, customer_id, origin_warehouse_id, status, total_amount, created_at FROM orders ORDER BY id;" "ALL ORDERS"

Run-Query "SELECT count(*) AS total_shipments FROM shipments;" "SHIPMENTS COUNT"
Run-Query "SELECT id, tracking_number, order_id, origin_warehouse_id, destination_warehouse_id, driver_id, vehicle_id, status, operational_stage, created_at FROM shipments ORDER BY id;" "ALL SHIPMENTS"

Run-Query "SELECT count(*) AS total_tracking_events FROM shipment_tracking_events;" "SHIPMENT TRACKING EVENTS COUNT"
Run-Query "SELECT id, shipment_id, stage, status, location, event_timestamp FROM shipment_tracking_events ORDER BY id;" "ALL TRACKING EVENTS"

Run-Query "SELECT count(*) AS total_invoices FROM invoices;" "INVOICES COUNT"
Run-Query "SELECT id, invoice_number, order_id, shipment_id, total_amount, status FROM invoices ORDER BY id;" "ALL INVOICES"

Run-Query "SELECT count(*) AS total_inventory_transactions FROM inventory_transactions;" "INVENTORY TRANSACTIONS COUNT"
Run-Query "SELECT id, warehouse_id, product_id, reference_type, reference_id, quantity, transaction_type FROM inventory_transactions ORDER BY id;" "ALL INVENTORY TRANSACTIONS"

Run-Query "SELECT count(*) AS total_order_items FROM order_items;" "ORDER ITEMS COUNT"
Run-Query "SELECT id, order_id, product_id, quantity, unit_price FROM order_items ORDER BY id;" "ALL ORDER ITEMS"

Run-Query "SELECT count(*) AS total_fulfillment_allocations FROM fulfillment_allocations;" "FULFILLMENT ALLOCATIONS COUNT"
