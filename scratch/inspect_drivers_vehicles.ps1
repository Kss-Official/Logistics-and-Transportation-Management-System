$PSQL = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
$env:PGPASSWORD = "postgres123"

function Run-Query($sql, $title) {
    Write-Host "`n=== $title ===" -ForegroundColor Cyan
    & $PSQL -U postgres -d primeroute_db -c $sql
}

Run-Query "\d drivers" "SCHEMA: drivers"
Run-Query "\d vehicles" "SCHEMA: vehicles"
Run-Query "SELECT * FROM drivers;" "ALL DRIVERS FULL"
Run-Query "SELECT * FROM vehicles;" "ALL VEHICLES FULL"
