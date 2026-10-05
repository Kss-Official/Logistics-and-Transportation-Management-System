const { execFileSync } = require('child_process');
const fs = require('fs');

const psqlPath = 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe';
const env = { ...process.env, PGPASSWORD: 'postgres123' };

function query(sql) {
  const raw = execFileSync(psqlPath, ['-U', 'postgres', '-d', 'primeroute_db', '-A', '-t', '-F', '\t', '-c', sql], { env, encoding: 'utf8' });
  return raw.trim().split('\n').filter(l => l.trim().length > 0).map(l => l.split('\t'));
}

function verifyCounts() {
  console.log('================ CURRENT DB COUNTS ================');
  const entities = [
    { name: 'Users', table: 'users' },
    { name: 'Customers', table: 'users', where: "role = 'CUSTOMER'" },
    { name: 'Orders', table: 'orders' },
    { name: 'Order Items', table: 'order_items' },
    { name: 'Shipments', table: 'shipments' },
    { name: 'Tracking Events', table: 'shipment_tracking_events' },
    { name: 'Invoices', table: 'invoices' },
    { name: 'ePOD', table: 'proof_of_deliveries' },
    { name: 'Allocations', table: 'fulfillment_allocations' },
    { name: 'Inventory Transactions', table: 'inventory_transactions' },
    { name: 'Support Tickets', table: 'support_tickets' },
    { name: 'Notifications', table: 'notifications' },
    { name: 'Drivers', table: 'drivers' },
    { name: 'Vehicles', table: 'vehicles' },
    { name: 'Warehouses', table: 'warehouses' },
    { name: 'Products', table: 'products' },
    { name: 'Routes', table: 'routes' },
    { name: 'Addresses', table: 'addresses' }
  ];

  entities.forEach(e => {
    const sql = e.where ? `SELECT count(*) FROM ${e.table} WHERE ${e.where};` : `SELECT count(*) FROM ${e.table};`;
    const res = query(sql);
    console.log(`${e.name.padEnd(25)}: ${res[0]?.[0] || 0}`);
  });

  console.log('\n================ MASTER FLEET RELATIONSHIPS ================');
  const fleet = query(`
    SELECT v.vehicle_number, v.vehicle_type, v.model, d.full_name as driver_name, d.email, d.license_number, w.warehouse_name
    FROM vehicles v
    LEFT JOIN drivers d ON v.driver_id = d.id
    LEFT JOIN warehouses w ON v.warehouse_id = w.id
    ORDER BY v.vehicle_number;
  `);
  console.table(fleet.map(r => ({ VehicleNo: r[0], Type: r[1], Model: r[2], Driver: r[3], Email: r[4], License: r[5], Warehouse: r[6] })));

  console.log('\n================ PRESERVED ORDERS ================');
  const orders = query(`
    SELECT o.id, o.order_number, o.status, o.total_amount, o.payment_method, u.full_name as customer, i.invoice_number, i.payment_status
    FROM orders o
    JOIN users u ON o.customer_id = u.id
    LEFT JOIN invoices i ON i.order_id = o.id
    ORDER BY o.id;
  `);
  console.table(orders.map(r => ({ ID: r[0], OrderNo: r[1], Status: r[2], Amount: r[3], Method: r[4], Customer: r[5], Invoice: r[6], PayStatus: r[7] })));
  console.log('\n================ ORPHAN INTEGRITY CHECKS ================');
  const checks = [
    { name: 'Shipments without Orders', sql: 'SELECT count(*) FROM shipments s LEFT JOIN orders o ON s.order_id = o.id WHERE o.id IS NULL;' },
    { name: 'Invoices without Orders', sql: 'SELECT count(*) FROM invoices i LEFT JOIN orders o ON i.order_id = o.id WHERE o.id IS NULL;' },
    { name: 'ePODs without Shipments', sql: 'SELECT count(*) FROM proof_of_deliveries p LEFT JOIN shipments s ON p.shipment_id = s.id WHERE s.id IS NULL;' },
    { name: 'Order Items without Orders', sql: 'SELECT count(*) FROM order_items oi LEFT JOIN orders o ON oi.order_id = o.id WHERE o.id IS NULL;' },
    { name: 'Allocations without Orders', sql: 'SELECT count(*) FROM fulfillment_allocations fa LEFT JOIN orders o ON fa.order_id = o.id WHERE o.id IS NULL;' },
    { name: 'Tracking Events without Shipments', sql: 'SELECT count(*) FROM shipment_tracking_events ste LEFT JOIN shipments s ON ste.shipment_id = s.id WHERE s.id IS NULL;' },
    { name: 'Orders with Invalid Customer', sql: 'SELECT count(*) FROM orders o LEFT JOIN users u ON o.customer_id = u.id WHERE u.id IS NULL;' },
    { name: 'Addresses with Invalid Customer', sql: 'SELECT count(*) FROM addresses a LEFT JOIN users u ON a.customer_id = u.id WHERE u.id IS NULL;' },
    { name: 'Support Tickets with Invalid User', sql: 'SELECT count(*) FROM support_tickets st LEFT JOIN users u ON st.customer_id = u.id WHERE u.id IS NULL;' },
    { name: 'Notifications with Invalid User', sql: 'SELECT count(*) FROM notifications n LEFT JOIN users u ON n.user_id = u.id WHERE u.id IS NULL;' }
  ];

  checks.forEach(c => {
    const res = query(c.sql);
    const count = res[0]?.[0] || '0';
    console.log(`- ${c.name.padEnd(35)}: ${count === '0' ? 'PASSED (0 orphans)' : 'FAIL (' + count + ' orphans)'}`);
  });
}

verifyCounts();
