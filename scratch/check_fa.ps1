$PSQL = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
$env:PGPASSWORD = "postgres123"

function Run-Query($sql, $title) {
    Write-Host "`n=== $title ===" -ForegroundColor Cyan
    & $PSQL -U postgres -d primeroute_db -c $sql
}

Run-Query "\d fulfillment_allocations" "SCHEMA: fulfillment_allocations"
Run-Query "SELECT * FROM fulfillment_allocations WHERE order_id IN (23, 25, 36, 41, 42, 46, 47, 48, 50);" "TARGET FULFILLMENT ALLOCATIONS"
