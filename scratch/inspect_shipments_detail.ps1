$PSQL = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
$env:PGPASSWORD = "postgres123"

function Run-Query($sql, $title) {
    Write-Host "`n=== $title ===" -ForegroundColor Cyan
    & $PSQL -U postgres -d primeroute_db -c $sql
}

Run-Query "SELECT s.id, s.tracking_number, s.order_id, o.order_number, s.driver_id, d.full_name as driver_name, s.vehicle_id, v.vehicle_number, s.status, s.operational_stage, s.created_at FROM shipments s LEFT JOIN orders o ON s.order_id = o.id LEFT JOIN drivers d ON s.driver_id = d.id LEFT JOIN vehicles v ON s.vehicle_id = v.id ORDER BY s.id;" "DETAILED SHIPMENT LIST"

Run-Query "SELECT s.id as shipment_id, s.tracking_number, count(te.id) as tracking_events_count FROM shipments s LEFT JOIN shipment_tracking_events te ON s.id = te.shipment_id GROUP BY s.id, s.tracking_number ORDER BY s.id;" "TRACKING EVENTS PER SHIPMENT"

Run-Query "SELECT id, invoice_number, order_id, shipment_id, total_amount FROM invoices;" "INVOICES WITH SHIPMENT_ID"
