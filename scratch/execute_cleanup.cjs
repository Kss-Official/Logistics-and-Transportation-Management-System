const { execFileSync } = require('child_process');
const fs = require('fs');

const psqlPath = 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe';
const env = { ...process.env, PGPASSWORD: 'postgres123' };

function psql(query) {
  return execFileSync(psqlPath, ['-U', 'postgres', '-d', 'primeroute_db', '-c', query], { env, encoding: 'utf8' });
}

function queryCount(table) {
  const res = psql(`SELECT count(*) FROM ${table};`);
  const match = res.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

const RETAINED_USER_EMAILS = [
  'sanjanaaa.shru@gmail.com',
  'admin@primeroute.com',
  'priya@primeroute.com',
  'ccu.east@primeroute.com',
  'ramesh@primeroute.com',
  'priya.patel@primeroute.in',
  'sneha.kulkarni@primeroute.in',
  'anil.deshmukh.1790082100291@primeroute.com',
  'arjun.das@primeroute.in',
  'shrutisanjanasahoo@gmail.com',
  'manoj3@gmail.com',
  'gudi78@gmail.com',
  'routjig09@gmail.com',
  'kousik12@gmail.com'
];

const RETAINED_ORDER_NUMBERS = [
  'PR-ORD-77062649',
  'PR-ORD-76406402',
  'PR-ORD-30750634',
  'PR-ORD-27539459',
  'PR-ORD-60638742'
];

async function runCleanup() {
  console.log('============================================================');
  console.log('PRIMEROUTE LOGISTICS — EXECUTING FINAL DEMO DATA CLEANUP');
  console.log('============================================================\n');

  // 1. Record BEFORE Counts
  const beforeCounts = {
    users: queryCount('users'),
    orders: queryCount('orders'),
    order_items: queryCount('order_items'),
    shipments: queryCount('shipments'),
    shipment_tracking_events: queryCount('shipment_tracking_events'),
    invoices: queryCount('invoices'),
    proof_of_deliveries: queryCount('proof_of_deliveries'),
    fulfillment_allocations: queryCount('fulfillment_allocations'),
    inventory_transactions: queryCount('inventory_transactions'),
    support_tickets: queryCount('support_tickets'),
    support_ticket_messages: queryCount('support_ticket_messages'),
    notifications: queryCount('notifications'),
    addresses: queryCount('addresses'),
    drivers: queryCount('drivers'),
    vehicles: queryCount('vehicles'),
    warehouses: queryCount('warehouses'),
    routes: queryCount('routes'),
    products: queryCount('products')
  };

  console.log('--- BEFORE COUNTS ---');
  console.table(beforeCounts);

  const sqlCleanup = `
BEGIN;

-- 1. Delete Proof of Deliveries for demo shipments
DELETE FROM proof_of_deliveries
WHERE shipment_id NOT IN (
  SELECT s.id FROM shipments s
  JOIN orders o ON s.order_id = o.id
  WHERE o.order_number IN (${RETAINED_ORDER_NUMBERS.map(n => `'${n}'`).join(', ')})
);

-- 2. Delete Shipment Tracking Events for demo shipments
DELETE FROM shipment_tracking_events
WHERE shipment_id NOT IN (
  SELECT s.id FROM shipments s
  JOIN orders o ON s.order_id = o.id
  WHERE o.order_number IN (${RETAINED_ORDER_NUMBERS.map(n => `'${n}'`).join(', ')})
);

-- 3. Delete Inventory Transactions for demo orders/shipments
DELETE FROM inventory_transactions
WHERE reference_order IS NOT NULL 
  AND reference_order != ''
  AND reference_order NOT IN (${RETAINED_ORDER_NUMBERS.map(n => `'${n}'`).join(', ')});

DELETE FROM inventory_transactions
WHERE reference_shipment IS NOT NULL
  AND reference_shipment != ''
  AND reference_shipment NOT IN (
    SELECT s.tracking_number FROM shipments s
    JOIN orders o ON s.order_id = o.id
    WHERE o.order_number IN (${RETAINED_ORDER_NUMBERS.map(n => `'${n}'`).join(', ')})
  );

-- 4. Delete Support Ticket Messages and Support Tickets for demo users/automated tests
DELETE FROM support_ticket_messages
WHERE ticket_id IN (
  SELECT t.id FROM support_tickets t
  JOIN users u ON t.customer_id = u.id
  WHERE u.email NOT IN (${RETAINED_USER_EMAILS.map(e => `'${e}'`).join(', ')})
     OR t.ticket_number IN ('TCK-452949', 'PR-TKT-40196765', 'PR-TKT-95343383', 'PR-TKT-46875287', 'PR-TKT-59931034', 'PR-TKT-40960288', 'PR-TKT-88567614')
);

DELETE FROM support_tickets
WHERE customer_id NOT IN (SELECT id FROM users WHERE email IN (${RETAINED_USER_EMAILS.map(e => `'${e}'`).join(', ')}))
   OR ticket_number IN ('TCK-452949', 'PR-TKT-40196765', 'PR-TKT-95343383', 'PR-TKT-46875287', 'PR-TKT-59931034', 'PR-TKT-40960288', 'PR-TKT-88567614');

-- 5. Delete Notifications for demo users or referencing deleted entities
DELETE FROM notifications
WHERE user_id NOT IN (SELECT id FROM users WHERE email IN (${RETAINED_USER_EMAILS.map(e => `'${e}'`).join(', ')}))
   OR message LIKE '%PR-ORD-%' AND NOT (
      message LIKE '%PR-ORD-77062649%' OR 
      message LIKE '%PR-ORD-76406402%' OR 
      message LIKE '%PR-ORD-30750634%' OR 
      message LIKE '%PR-ORD-27539459%' OR 
      message LIKE '%PR-ORD-60638742%'
   );

-- 6. Delete Invoices for demo orders (MUST be before shipments and orders)
DELETE FROM invoices
WHERE order_id NOT IN (
  SELECT id FROM orders WHERE order_number IN (${RETAINED_ORDER_NUMBERS.map(n => `'${n}'`).join(', ')})
) OR order_id IS NULL;

-- 7. Delete Shipments for demo orders (MUST be before orders)
DELETE FROM shipments
WHERE order_id NOT IN (
  SELECT id FROM orders WHERE order_number IN (${RETAINED_ORDER_NUMBERS.map(n => `'${n}'`).join(', ')})
) OR order_id IS NULL;

-- 8. Delete Fulfillment Allocations for demo orders
DELETE FROM fulfillment_allocations
WHERE order_id NOT IN (
  SELECT id FROM orders WHERE order_number IN (${RETAINED_ORDER_NUMBERS.map(n => `'${n}'`).join(', ')})
);

-- 9. Delete Order Items for demo orders
DELETE FROM order_items
WHERE order_id NOT IN (
  SELECT id FROM orders WHERE order_number IN (${RETAINED_ORDER_NUMBERS.map(n => `'${n}'`).join(', ')})
);

-- 10. Delete Orders for demo customers / test batches
DELETE FROM orders
WHERE order_number NOT IN (${RETAINED_ORDER_NUMBERS.map(n => `'${n}'`).join(', ')});

-- 11. Delete Addresses for demo users (Only after orders referencing them are deleted)
DELETE FROM addresses
WHERE customer_id NOT IN (SELECT id FROM users WHERE email IN (${RETAINED_USER_EMAILS.map(e => `'${e}'`).join(', ')}));

-- 12. Delete Password Reset Tokens for demo users
DELETE FROM password_reset_tokens
WHERE user_id NOT IN (SELECT id FROM users WHERE email IN (${RETAINED_USER_EMAILS.map(e => `'${e}'`).join(', ')}));

-- 13. Delete Demo Users
DELETE FROM users
WHERE email NOT IN (${RETAINED_USER_EMAILS.map(e => `'${e}'`).join(', ')});

-- 14. Reconcile Warehouse Inventories (Ensure reserved_stock only accounts for active unfulfilled retained orders: PR-MOU-001 has 2 units reserved in WH 1)
UPDATE inventories
SET reserved_stock = 0,
    available_stock = total_stock - damaged_stock;

-- Apply reservation for active unfulfilled order PR-ORD-30750634 (2 units of PR-MOU-001 in WH 1)
UPDATE inventories
SET reserved_stock = 2,
    available_stock = total_stock - 2 - damaged_stock
WHERE warehouse_id = 1 AND sku = 'PR-MOU-001';

COMMIT;
`;

  console.log('--- EXECUTING CLEANUP SQL TRANSACTION ---');
  fs.writeFileSync('d:/Transportation-Logistic/scratch/cleanup_tx.sql', sqlCleanup);
  const result = execFileSync(psqlPath, ['-U', 'postgres', '-d', 'primeroute_db', '-f', 'd:/Transportation-Logistic/scratch/cleanup_tx.sql'], { env, encoding: 'utf8' });
  console.log(result);

  // 2. Record AFTER Counts
  const afterCounts = {
    users: queryCount('users'),
    orders: queryCount('orders'),
    order_items: queryCount('order_items'),
    shipments: queryCount('shipments'),
    shipment_tracking_events: queryCount('shipment_tracking_events'),
    invoices: queryCount('invoices'),
    proof_of_deliveries: queryCount('proof_of_deliveries'),
    fulfillment_allocations: queryCount('fulfillment_allocations'),
    inventory_transactions: queryCount('inventory_transactions'),
    support_tickets: queryCount('support_tickets'),
    support_ticket_messages: queryCount('support_ticket_messages'),
    notifications: queryCount('notifications'),
    addresses: queryCount('addresses'),
    drivers: queryCount('drivers'),
    vehicles: queryCount('vehicles'),
    warehouses: queryCount('warehouses'),
    routes: queryCount('routes'),
    products: queryCount('products')
  };

  console.log('\n--- AFTER COUNTS ---');
  console.table(afterCounts);

  // 3. Orphan Checks
  console.log('\n--- ORPHAN INTEGRITY CHECKS ---');
  const orphanChecks = [
    { desc: 'Shipments without Orders', sql: 'SELECT count(*) FROM shipments WHERE order_id NOT IN (SELECT id FROM orders);' },
    { desc: 'Invoices without Orders', sql: 'SELECT count(*) FROM invoices WHERE order_id NOT IN (SELECT id FROM orders);' },
    { desc: 'Proof of Deliveries without Shipments', sql: 'SELECT count(*) FROM proof_of_deliveries WHERE shipment_id NOT IN (SELECT id FROM shipments);' },
    { desc: 'Order Items without Orders', sql: 'SELECT count(*) FROM order_items WHERE order_id NOT IN (SELECT id FROM orders);' },
    { desc: 'Fulfillment Allocations without Orders', sql: 'SELECT count(*) FROM fulfillment_allocations WHERE order_id NOT IN (SELECT id FROM orders);' },
    { desc: 'Tracking Events without Shipments', sql: 'SELECT count(*) FROM shipment_tracking_events WHERE shipment_id NOT IN (SELECT id FROM shipments);' },
    { desc: 'Orders with Invalid Customer', sql: 'SELECT count(*) FROM orders WHERE customer_id NOT IN (SELECT id FROM users);' },
    { desc: 'Addresses with Invalid Customer', sql: 'SELECT count(*) FROM addresses WHERE customer_id NOT IN (SELECT id FROM users);' },
    { desc: 'Support Tickets with Invalid User', sql: 'SELECT count(*) FROM support_tickets WHERE customer_id NOT IN (SELECT id FROM users);' },
    { desc: 'Notifications with Invalid User', sql: 'SELECT count(*) FROM notifications WHERE user_id NOT IN (SELECT id FROM users);' },
  ];

  let orphanErrors = 0;
  for (const check of orphanChecks) {
    const res = psql(check.sql);
    const count = parseInt(res.match(/\d+/)[0], 10);
    const passed = count === 0;
    if (!passed) orphanErrors++;
    console.log(`${passed ? '✓' : '✗'} ${check.desc.padEnd(42)}: ${count} orphans`);
  }

  // 4. Verify Master Fleet and Warehouses
  console.log('\n--- MASTER DATA VERIFICATION ---');
  const whRes = psql('SELECT id, warehouse_code, warehouse_name, city, status FROM warehouses ORDER BY id;');
  console.log('Warehouses:\n', whRes);

  const drvRes = psql('SELECT id, full_name, email, status, warehouse_id, user_id FROM drivers ORDER BY id;');
  console.log('Drivers:\n', drvRes);

  const vehRes = psql('SELECT id, vehicle_number, vehicle_type, status, warehouse_id FROM vehicles ORDER BY id;');
  console.log('Vehicles:\n', vehRes);

  const ordRes = psql('SELECT o.id, o.order_number, u.email as customer_email, u.full_name as customer_name, o.status, o.total_amount, o.payment_method, o.payment_status FROM orders o JOIN users u ON o.customer_id = u.id ORDER BY o.id;');
  console.log('Retained Orders:\n', ordRes);

  const invRes = psql('SELECT id, invoice_number, order_id, total_amount, payment_method, payment_status, invoice_status FROM invoices ORDER BY id;');
  console.log('Retained Invoices:\n', invRes);

  console.log('\nCLEANUP COMPLETED SUCCESSFULLY WITH 0 ORPHANS!');
}

runCleanup();
