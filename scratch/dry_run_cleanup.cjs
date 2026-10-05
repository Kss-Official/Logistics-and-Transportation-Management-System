const { execFileSync } = require('child_process');

const psqlPath = 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe';
const env = { ...process.env, PGPASSWORD: 'postgres123' };

function psql(query) {
  return execFileSync(psqlPath, ['-U', 'postgres', '-d', 'primeroute_db', '-c', query], { env, encoding: 'utf8' });
}

// Retained real users
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

// Retained real orders
const RETAINED_ORDER_NUMBERS = [
  'PR-ORD-77062649', // Order 49, Shruti Sanjana Sahoo, DELIVERED
  'PR-ORD-76406402', // Order 55, Shruti Sanjana Sahoo, DELIVERED
  'PR-ORD-30750634', // Order 586, Shruti Sanjana Sahoo, CONFIRMED (PAID)
  'PR-ORD-27539459', // Order 18, Manoj, PENDING
  'PR-ORD-60638742'  // Order 37, Koushik, DELIVERED
];

const testScript = `
BEGIN;

-- 1. Identify Demo Order IDs
CREATE TEMP TABLE demo_orders AS
SELECT id, order_number FROM orders
WHERE order_number NOT IN (${RETAINED_ORDER_NUMBERS.map(n => `'${n}'`).join(', ')});

-- 2. Identify Demo Shipment IDs
CREATE TEMP TABLE demo_shipments AS
SELECT s.id, s.tracking_number FROM shipments s
LEFT JOIN demo_orders d ON s.order_id = d.id
WHERE d.id IS NOT NULL OR s.order_id IS NULL;

-- 3. Identify Demo User IDs
CREATE TEMP TABLE demo_users AS
SELECT id, email FROM users
WHERE email NOT IN (${RETAINED_USER_EMAILS.map(e => `'${e}'`).join(', ')});

RAISE NOTICE 'Demo orders count: %', (SELECT count(*) FROM demo_orders);
RAISE NOTICE 'Demo shipments count: %', (SELECT count(*) FROM demo_shipments);
RAISE NOTICE 'Demo users count: %', (SELECT count(*) FROM demo_users);

-- Counts before deletion
SELECT count(*) as pod_before FROM proof_of_deliveries;
SELECT count(*) as ste_before FROM shipment_tracking_events;
SELECT count(*) as it_before FROM inventory_transactions;
SELECT count(*) as notif_before FROM notifications;
SELECT count(*) as stm_before FROM support_ticket_messages;
SELECT count(*) as st_before FROM support_tickets;
SELECT count(*) as fa_before FROM fulfillment_allocations;
SELECT count(*) as oi_before FROM order_items;
SELECT count(*) as sh_before FROM shipments;
SELECT count(*) as inv_before FROM invoices;
SELECT count(*) as ord_before FROM orders;
SELECT count(*) as addr_before FROM addresses;
SELECT count(*) as usr_before FROM users;

ROLLBACK;
`;

console.log('--- TESTING QUERY COMPATIBILITY ---');
console.log(psql(`
SELECT 
  (SELECT count(*) FROM orders WHERE order_number NOT IN (${RETAINED_ORDER_NUMBERS.map(n => `'${n}'`).join(', ')})) as demo_orders,
  (SELECT count(*) FROM shipments WHERE order_id NOT IN (SELECT id FROM orders WHERE order_number IN (${RETAINED_ORDER_NUMBERS.map(n => `'${n}'`).join(', ')}))) as demo_shipments,
  (SELECT count(*) FROM users WHERE email NOT IN (${RETAINED_USER_EMAILS.map(e => `'${e}'`).join(', ')})) as demo_users;
`));
