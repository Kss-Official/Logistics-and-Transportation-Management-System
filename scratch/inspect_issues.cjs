const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432';

function query(sql) {
  return execSync(`${PSQL} -c "${sql}"`, { encoding: 'utf8', env: process.env });
}

console.log('=== CHECK USERS TABLE ===');
console.log(query("SELECT id, email, full_name, role, status, LENGTH(password) as pwd_len, SUBSTRING(password, 1, 7) as pwd_prefix FROM users WHERE email IN ('admin@primeroute.com', 'customer@primeroute.com');"));

console.log('=== CHECK ORDERS SCHEMA ===');
console.log(query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'orders' ORDER BY ordinal_position;"));

console.log('=== CHECK ORDERS FOR ALL CUSTOMERS ===');
console.log(query("SELECT id, order_number, customer_id, status, created_at FROM orders ORDER BY id;"));

console.log('=== CHECK STATUS DISTRIBUTION FOR CUSTOMER 2 ===');
console.log(query("SELECT status, count(*) FROM orders WHERE customer_id = 2 GROUP BY status ORDER BY status;"));
console.log(query("SELECT count(*) as total_orders FROM orders WHERE customer_id = 2;"));

console.log('=== CHECK SHIPMENTS SCHEMA & DATA ===');
console.log(query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'shipments' ORDER BY ordinal_position;"));
console.log(query("SELECT * FROM shipments;"));
