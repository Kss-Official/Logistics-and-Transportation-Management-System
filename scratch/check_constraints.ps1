$PSQL = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
$env:PGPASSWORD = "postgres123"

function Run-Query($sql, $title) {
    Write-Host "`n=== $title ===" -ForegroundColor Cyan
    & $PSQL -U postgres -d primeroute_db -c $sql
}

Run-Query "SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'vehicles'::regclass;" "VEHICLES CONSTRAINTS"
Run-Query "SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'drivers'::regclass;" "DRIVERS CONSTRAINTS"
Run-Query "SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'shipments'::regclass;" "SHIPMENTS CONSTRAINTS"
