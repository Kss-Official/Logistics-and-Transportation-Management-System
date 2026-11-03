const { Client } = require('pg');
const client = new Client({
  user: 'postgres',
  password: process.env.PGPASSWORD || 'postgres123',
  host: 'localhost',
  port: 5432,
  database: 'primeroute_db'
});

async function run() {
  try {
    await client.connect();
    const ord = await client.query("SELECT * FROM orders WHERE order_number LIKE '%17902717%'");
    console.log('ORDER:', ord.rows);
    const inv = await client.query("SELECT * FROM invoices WHERE invoice_number LIKE '%17902717%' OR order_id IN (SELECT id FROM orders WHERE order_number LIKE '%17902717%')");
    console.log('INVOICE:', inv.rows);
    const allDelivered = await client.query("SELECT o.id, o.order_number, o.status, o.payment_status, o.payment_method, i.invoice_number, i.payment_status as inv_pstatus, i.invoice_status as inv_status FROM orders o LEFT JOIN invoices i ON i.order_id = o.id WHERE o.status = 'DELIVERED'");
    console.log('ALL DELIVERED ORDERS & INVOICES:');
    console.table(allDelivered.rows);
    await client.end();
  } catch (err) {
    console.error(err);
  }
}
run();
