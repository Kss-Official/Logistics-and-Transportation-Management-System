const fs = require('fs');
const { execSync } = require('child_process');

process.env.PGPASSWORD = 'postgres123';
const cmd = `"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -t -A -c `;

function query(sql) {
  return execSync(`"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -c "${sql}"`, {
    env: process.env,
    encoding: 'utf8'
  });
}

console.log('=== USER ===');
console.log(query("SELECT id, email, full_name, role, status, created_at FROM users WHERE LOWER(email) = 'shrutisanjanasahoo@gmail.com';"));

console.log('=== ORDERS ===');
console.log(query("SELECT o.id, o.order_number, o.status, o.delivery_type, o.package_description, o.package_weight, o.total_amount, o.origin_warehouse_id, o.created_at FROM orders o JOIN users u ON o.customer_id = u.id WHERE LOWER(u.email) = 'shrutisanjanasahoo@gmail.com' ORDER BY o.id ASC;"));

console.log('=== SHIPMENTS ===');
console.log(query("SELECT s.id, s.tracking_number, s.order_id, o.order_number, s.status, s.operational_stage, s.assignment_status, s.driver_id, d.full_name AS driver_name, s.vehicle_id, v.vehicle_number, s.origin_warehouse_id, ow.warehouse_code AS origin_wh, s.destination_warehouse_id, dw.warehouse_code AS dest_wh FROM shipments s JOIN orders o ON s.order_id = o.id JOIN users u ON o.customer_id = u.id LEFT JOIN drivers d ON s.driver_id = d.id LEFT JOIN vehicles v ON s.vehicle_id = v.id LEFT JOIN warehouses ow ON s.origin_warehouse_id = ow.id LEFT JOIN warehouses dw ON s.destination_warehouse_id = dw.id WHERE LOWER(u.email) = 'shrutisanjanasahoo@gmail.com' ORDER BY s.id ASC;"));

console.log('=== ORDER ITEMS ===');
console.log(query("SELECT oi.id, oi.order_id, o.order_number, oi.product_id, p.sku, oi.quantity, oi.unit_price, oi.total_weight FROM order_items oi JOIN orders o ON oi.order_id = o.id JOIN users u ON o.customer_id = u.id LEFT JOIN products p ON oi.product_id = p.id WHERE LOWER(u.email) = 'shrutisanjanasahoo@gmail.com' ORDER BY oi.id ASC;"));
