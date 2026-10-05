const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'primeroute_db',
    password: 'postgres',
    port: 5432,
});

async function main() {
    try {
        await client.connect();
        console.log('Connected to PostgreSQL database: primeroute_db');

        // Check columns
        const colRes = await client.query(`
            SELECT column_name, data_type, is_nullable, character_maximum_length 
            FROM information_schema.columns 
            WHERE table_name = 'fulfillment_allocations'
            ORDER BY ordinal_position;
        `);
        console.log('\n--- COLUMNS IN fulfillment_allocations ---');
        console.table(colRes.rows);

        // Check foreign keys
        const fkRes = await client.query(`
            SELECT
                tc.table_schema, 
                tc.constraint_name, 
                tc.table_name, 
                kcu.column_name, 
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name 
            FROM 
                information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                  AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='fulfillment_allocations';
        `);
        console.log('\n--- FOREIGN KEYS IN fulfillment_allocations ---');
        console.table(fkRes.rows);

        // Check indexes
        const idxRes = await client.query(`
            SELECT indexname, indexdef
            FROM pg_indexes
            WHERE tablename = 'fulfillment_allocations';
        `);
        console.log('\n--- INDEXES IN fulfillment_allocations ---');
        console.table(idxRes.rows);

        // Verify count of rows (should be 0, no fake data)
        const countRes = await client.query('SELECT COUNT(*) FROM fulfillment_allocations;');
        console.log('\n--- ROW COUNT IN fulfillment_allocations ---');
        console.log('Total rows:', countRes.rows[0].count);

        await client.end();
    } catch (err) {
        console.error('Error querying PostgreSQL:', err);
        process.exit(1);
    }
}

main();
