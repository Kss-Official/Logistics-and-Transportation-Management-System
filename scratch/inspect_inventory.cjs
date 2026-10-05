const { execFileSync } = require('child_process');

const psqlPath = 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe';
const env = { ...process.env, PGPASSWORD: 'postgres123' };

function psql(query) {
  try {
    return execFileSync(psqlPath, ['-U', 'postgres', '-d', 'primeroute_db', '-c', query], { env, encoding: 'utf8' });
  } catch (err) {
    return `[ERROR: ${err.message}]`;
  }
}

console.log('--- INVENTORIES TABLE ---');
console.log(psql('\\d inventories'));
console.log(psql('SELECT * FROM inventories;'));

console.log('--- INVENTORY TRANSACTIONS ---');
console.log(psql('\\d inventory_transactions'));
console.log(psql('SELECT id, warehouse_id, product_id, transaction_type, quantity, order_id, shipment_id, reference_number FROM inventory_transactions ORDER BY id;'));
