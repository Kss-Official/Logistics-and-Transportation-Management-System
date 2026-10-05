$env:PGPASSWORD = 'postgres123'
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d primeroute_db -f "d:\Transportation-Logistic\scratch\survey_db.sql"
