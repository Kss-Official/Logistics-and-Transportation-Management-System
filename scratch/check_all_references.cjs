const { execSync } = require('child_process');
process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432 -X';

function query(sql) {
  const cmd = `${PSQL} -c "${sql.replace(/"/g, '\\"')}"`;
  return execSync(cmd, { encoding: 'utf8', env: process.env });
}

const delWh = "(2, 3, 4, 5, 7, 8, 9)";
const delDrv = "(12, 15, 17, 18, 19)";
const delVeh = "(2, 3, 12, 14)";
const delUsers = "(23, 25, 26, 27, 28, 29, 30, 32)";

console.log("=== SHIPMENTS REFERENCING DELETED WAREHOUSES ===");
console.log(query(`SELECT id, tracking_number, status, origin_warehouse_id, destination_warehouse_id, driver_id, vehicle_id FROM shipments WHERE origin_warehouse_id IN ${delWh} OR destination_warehouse_id IN ${delWh};`));

console.log("=== SHIPMENTS REFERENCING DELETED DRIVERS ===");
console.log(query(`SELECT id, tracking_number, status, origin_warehouse_id, destination_warehouse_id, driver_id, vehicle_id FROM shipments WHERE driver_id IN ${delDrv};`));

console.log("=== SHIPMENTS REFERENCING DELETED VEHICLES ===");
console.log(query(`SELECT id, tracking_number, status, origin_warehouse_id, destination_warehouse_id, driver_id, vehicle_id FROM shipments WHERE vehicle_id IN ${delVeh};`));

console.log("=== ORDERS REFERENCING DELETED WAREHOUSES ===");
console.log(query(`SELECT id, order_number, status, origin_warehouse_id FROM orders WHERE origin_warehouse_id IN ${delWh};`));

console.log("=== ROUTES REFERENCING DELETED DRIVERS/VEHICLES ===");
console.log(query(`SELECT id, route_code, driver_id, vehicle_id FROM routes WHERE driver_id IN ${delDrv} OR vehicle_id IN ${delVeh};`));

console.log("=== INVENTORIES REFERENCING DELETED WAREHOUSES ===");
console.log(query(`SELECT id, sku, warehouse_id FROM inventories WHERE warehouse_id IN ${delWh};`));

console.log("=== INVENTORY TRANSACTIONS REFERENCING DELETED WAREHOUSES ===");
console.log(query(`SELECT id, sku, warehouse_id FROM inventory_transactions WHERE warehouse_id IN ${delWh};`));

console.log("=== FULFILLMENT ALLOCATIONS REFERENCING DELETED WAREHOUSES ===");
console.log(query(`SELECT id, order_id, warehouse_id FROM fulfillment_allocations WHERE warehouse_id IN ${delWh};`));

console.log("=== USER NOTIFICATIONS REFERENCING DELETED USERS ===");
console.log(query(`SELECT id, user_id, title FROM notifications WHERE user_id IN ${delUsers};`));
