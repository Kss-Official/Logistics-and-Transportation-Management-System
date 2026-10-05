const { execSync } = require('child_process');
process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432 -X';

function query(sql) {
  const cmd = `${PSQL} -c "${sql.replace(/"/g, '\\"')}"`;
  return execSync(cmd, { encoding: 'utf8', env: process.env });
}

console.log("=== WAREHOUSES ===");
console.log(query("SELECT id, warehouse_code, warehouse_name, city, status FROM warehouses;"));

console.log("=== DRIVERS ===");
console.log(query("SELECT id, full_name, email, status, warehouse_id FROM drivers;"));

console.log("=== VEHICLES ===");
console.log(query("SELECT id, vehicle_number, model, status, warehouse_id, driver_id FROM vehicles;"));

console.log("=== USERS ===");
console.log(query("SELECT id, email, full_name, role, warehouse_id FROM users WHERE role = 'WAREHOUSE_MANAGER' OR warehouse_id IS NOT NULL;"));

console.log("=== SHIPMENTS ===");
console.log(query("SELECT id, tracking_number, status, origin_warehouse_id, destination_warehouse_id, driver_id, vehicle_id, order_id FROM shipments;"));

console.log("=== ORDERS ===");
console.log(query("SELECT id, order_number, status, origin_warehouse_id FROM orders;"));

console.log("=== INVENTORIES ===");
console.log(query("SELECT id, sku, product_name, warehouse_id, available_stock FROM inventories;"));

console.log("=== INVENTORY TRANSACTIONS ===");
console.log(query("SELECT id, sku, transaction_type, warehouse_id FROM inventory_transactions;"));

console.log("=== FULFILLMENT ALLOCATIONS ===");
console.log(query("SELECT id, order_id, warehouse_id, allocation_status FROM fulfillment_allocations;"));

console.log("=== ROUTES ===");
console.log(query("SELECT id, route_code, route_name, driver_id, vehicle_id FROM routes;"));

console.log("=== INVOICES ===");
console.log(query("SELECT id, invoice_number, order_id, shipment_id FROM invoices;"));
