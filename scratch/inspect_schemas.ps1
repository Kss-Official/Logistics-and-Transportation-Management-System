$PSQL = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
$env:PGPASSWORD = "postgres123"

function Run-Query($sql, $title) {
    Write-Host "`n=== $title ===" -ForegroundColor Cyan
    & $PSQL -U postgres -d primeroute_db -c $sql
}

Run-Query "\d shipment_tracking_events" "SCHEMA: shipment_tracking_events"
Run-Query "\d invoices" "SCHEMA: invoices"
Run-Query "\d inventory_transactions" "SCHEMA: inventory_transactions"
Run-Query "SELECT id, driver_code, full_name, email, phone, status, assigned_warehouse_id, current_vehicle_id FROM drivers;" "DRIVERS FULL"
Run-Query "SELECT id, vehicle_number, registration_number, vehicle_type, status, assigned_warehouse_id, assigned_driver_id FROM vehicles;" "VEHICLES FULL"
Run-Query "SELECT id, tracking_number, order_id, driver_id, vehicle_id, status, operational_stage FROM shipments WHERE driver_id IS NOT NULL OR vehicle_id IS NOT NULL;" "SHIPMENTS WITH DRIVER OR VEHICLE"
