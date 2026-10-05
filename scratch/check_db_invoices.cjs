const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres123',
    database: 'primeroute_db'
});

async function main() {
    await client.connect();
    console.log('Connected to PostgreSQL primeroute_db');

    const ordersRes = await client.query(`
        SELECT id, order_number, status, payment_method, payment_status, total_amount 
        FROM orders 
        ORDER BY id DESC 
        LIMIT 10
    `);
    console.log('\n--- Recent Orders ---');
    console.table(ordersRes.rows);

    const invoicesRes = await client.query(`
        SELECT id, invoice_number, order_id, invoice_status, payment_status, payment_method, total_amount, amount_paid, balance_due 
        FROM invoices 
        ORDER BY id DESC 
        LIMIT 10
    `);
    console.log('\n--- Recent Invoices ---');
    console.table(invoicesRes.rows);

    await client.end();
}

main().catch(console.error);
