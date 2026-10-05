const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/logistic_db'
});

async function main() {
  await client.connect();
  const tables = await client.query(
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  );
  console.log('Tables:', tables.rows.map(r => r.table_name));

  const orderCols = await client.query(
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'orders'
  );
  console.log('\nOrders columns:', orderCols.rows);

  const invoiceCols = await client.query(
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'invoices'
  );
  console.log('\nInvoices columns:', invoiceCols.rows);

  // Check order PR-ORD-10001907
  const ord = await client.query(
    SELECT o.id, o.order_number, o.status, o.payment_method, o.payment_status, o.total_amount,
           i.id as invoice_id, i.invoice_number, i.invoice_status, i.payment_status as inv_payment_status,
           i.payment_method as inv_payment_method, i.amount_paid, i.balance_due, i.payment_date
    FROM orders o
    LEFT JOIN invoices i ON i.order_id = o.id
    WHERE o.order_number = 'PR-ORD-10001907'
  );
  console.log('\nOrder PR-ORD-10001907 query:', ord.rows);

  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});