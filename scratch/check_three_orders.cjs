const { execSync } = require('child_process');

const sql = `
SELECT 
  o.id AS order_id,
  o.order_number,
  o.customer_id,
  u.email AS customer_email,
  u.name AS customer_name,
  o.created_at,
  o.status
FROM orders o
LEFT JOIN users u ON o.customer_id = u.id
WHERE o.order_number IN ('PR-ORD-13928278', 'PR-ORD-13076290', 'PR-ORD-13059718')
ORDER BY o.id ASC;
`;

try {
  const sql = `
  SELECT 
    o.id AS order_id,
    o.order_number,
    o.customer_id,
    u.email AS customer_email,
    u.full_name AS customer_name,
    o.created_at,
    o.status,
    s.id AS shipment_id,
    s.tracking_number
  FROM orders o
  LEFT JOIN users u ON o.customer_id = u.id
  LEFT JOIN shipments s ON s.order_id = o.id
  WHERE o.order_number IN ('PR-ORD-13928278', 'PR-ORD-13076290', 'PR-ORD-13059718')
  ORDER BY o.id ASC;
  `;

  const output = execSync(`"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -c "${sql.replace(/\r?\n/g, ' ')}"`, {
    env: { ...process.env, PGPASSWORD: 'postgres123' },
    encoding: 'utf8'
  });
  console.log('--- EXACT THREE ORDERS QUERY ---');
  console.log(output);

  const groupedOrders = execSync(`"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -c "SELECT customer_id, count(*) as count FROM orders GROUP BY customer_id ORDER BY customer_id ASC;"`, {
    env: { ...process.env, PGPASSWORD: 'postgres123' },
    encoding: 'utf8'
  });
  console.log('--- ORDERS GROUPED BY CUSTOMER_ID ---');
  console.log(groupedOrders);




} catch (err) {
  console.error('Error running query:', err);
}
