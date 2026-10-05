$sqlCheck = @"
SELECT s.id AS shipment_id, s.tracking_number, s.status AS shipment_status, s.operational_stage,
       s.origin_warehouse_id, ow.warehouse_code AS origin_code,
       s.destination_warehouse_id, dw.warehouse_code AS dest_code,
       o.id AS order_id, o.order_number, o.origin_warehouse_id AS order_origin_id, oow.warehouse_code AS order_origin_code,
       pa.city AS pickup_city, da.city AS delivery_city
FROM shipments s
LEFT JOIN warehouses ow ON s.origin_warehouse_id = ow.id
LEFT JOIN warehouses dw ON s.destination_warehouse_id = dw.id
LEFT JOIN orders o ON s.order_id = o.id
LEFT JOIN warehouses oow ON o.origin_warehouse_id = oow.id
LEFT JOIN addresses pa ON o.pickup_address_id = pa.id
LEFT JOIN addresses da ON o.delivery_address_id = da.id;
"@

Write-Host "Running DB inspection query..."
# We can check with backend or psql if available, or write a quick Spring test/runner or psql
if (Get-Command psql -ErrorAction SilentlyContinue) {
    psql -U postgres -d primeroute_db -c "$sqlCheck"
} else {
    Write-Host "psql not in path, using Spring API / database check"
}
