const BASE_URL = 'http://localhost:8080/api';

async function testPaginationLogic() {
  console.log('Testing pagination logic on all admin pages...');
  
  const authRes = await fetch(BASE_URL + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'sanjanaaa.shru@gmail.com', password: 'Sanjana@102026' })
  });
  const authData = await authRes.json();
  const token = authData.token || authData.data?.token;

  // 1. Orders
  const orders = (await (await fetch(BASE_URL + '/admin/orders', { headers: { Authorization: `Bearer ${token}` } })).json()).data;
  console.log(`Orders: total ${orders.length}`);
  const orderPageSize = 8;
  const orderTotalPages = Math.ceil(orders.length / orderPageSize);
  for (let p = 1; p <= orderTotalPages; p++) {
    const pOrders = orders.slice((p - 1) * orderPageSize, p * orderPageSize);
    console.log(`  Page ${p}: ${pOrders.length} items (Showing ${(p - 1) * orderPageSize + 1}–${Math.min(p * orderPageSize, orders.length)} of ${orders.length})`);
  }

  // 2. Shipments
  const shipments = (await (await fetch(BASE_URL + '/admin/shipments', { headers: { Authorization: `Bearer ${token}` } })).json()).data;
  console.log(`Shipments: total ${shipments.length}`);
  const shipPageSize = 8;
  const shipTotalPages = Math.ceil(shipments.length / shipPageSize);
  for (let p = 1; p <= shipTotalPages; p++) {
    const pShips = shipments.slice((p - 1) * shipPageSize, p * shipPageSize);
    console.log(`  Page ${p}: ${pShips.length} items (Showing ${(p - 1) * shipPageSize + 1}–${Math.min(p * shipPageSize, shipments.length)} of ${shipments.length})`);
  }

  // 3. Customers
  const customers = (await (await fetch(BASE_URL + '/admin/customers', { headers: { Authorization: `Bearer ${token}` } })).json()).data;
  console.log(`Customers: total ${customers.length}`);
  const custPageSize = 6;
  const custTotalPages = Math.ceil(customers.length / custPageSize);
  for (let p = 1; p <= custTotalPages; p++) {
    const pCusts = customers.slice((p - 1) * custPageSize, p * custPageSize);
    console.log(`  Page ${p}: ${pCusts.length} items (Showing ${(p - 1) * custPageSize + 1}–${Math.min(p * custPageSize, customers.length)} of ${customers.length})`);
  }
}

testPaginationLogic();
