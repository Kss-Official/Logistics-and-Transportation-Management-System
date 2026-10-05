const { spawnSync } = require('child_process');
const psqlPath = 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe';

const sql = `
DO $$
DECLARE
    seq RECORD;
    tbl RECORD;
    max_val BIGINT;
BEGIN
    FOR seq IN 
        SELECT s.relname AS seq_name, t.relname AS table_name, a.attname AS col_name
        FROM pg_class s
        JOIN pg_depend d ON d.objid = s.oid
        JOIN pg_class t ON d.refobjid = t.oid
        JOIN pg_attribute a ON (d.refobjid = a.attrelid AND d.refobjsubid = a.attnum)
        WHERE s.relkind = 'S'
    LOOP
        EXECUTE format('SELECT COALESCE(MAX(%I), 0) FROM %I', seq.col_name, seq.table_name) INTO max_val;
        IF max_val > 0 THEN
            EXECUTE format('SELECT setval(%L, %s, true)', seq.seq_name, max_val);
            RAISE NOTICE 'Updated sequence % for table %.% to %', seq.seq_name, seq.table_name, seq.col_name, max_val;
        END IF;
    END LOOP;
END $$;
`;

const res = spawnSync(psqlPath, ['-U', 'postgres', '-d', 'primeroute_db', '-c', sql], {
  env: { ...process.env, PGPASSWORD: 'postgres123' },
  encoding: 'utf8'
});

console.log('STDOUT:', res.stdout);
console.log('STDERR:', res.stderr);
