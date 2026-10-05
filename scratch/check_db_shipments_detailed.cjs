const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres123',
    database: 'primeroute_db'
});

async function run() {
    await client.connect();
    const res = await client.query(`
        SELECT id, tracking_number, status, operational_stage, driver_id, vehicle_id, origin_warehouse_id, destination_warehouse_id
        FROM shipments
        WHERE origin_warehouse_id = 1
        ORDER BY id ASC;
    `);
    console.log("Shipments for Origin Warehouse ID = 1 (WH-BLR-001):");
    console.table(res.rows);

    const stages = await client.query(`
        SELECT operational_stage, status, count(*) 
        FROM shipments 
        WHERE origin_warehouse_id = 1 
        GROUP BY operational_stage, status;
    `);
    console.log("Group by operational_stage & status:");
    console.table(stages.rows);

    await client.end();
}

run().catch(console.error);
