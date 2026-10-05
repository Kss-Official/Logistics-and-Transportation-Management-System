const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : null;
          resolve({ status: res.statusCode, data: parsed, raw: body });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

async function verifyDashboard() {
  const loginRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'priya@primeroute.com', password: 'Manager@2026!' });

  const token = loginRes.data.token;
  const dashRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/warehouse-manager/dashboard',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  console.log('Dashboard HTTP Status:', dashRes.status);
  const d = dashRes.data?.data;
  console.log('Hub:', d?.warehouseName);
  console.log('- Total Inventory SKUs:', d?.totalInventoryItems);
  console.log('- Available Stock:', d?.availableStock);
  console.log('- Reserved Stock:', d?.reservedStock);
  console.log('- Low Stock Items:', d?.lowStockCount);
  console.log('- Ready for Dispatch:', d?.readyForDispatchCount);
  console.log('- Drivers Available:', d?.driversAvailableCount);
  console.log('- Vehicles Available:', d?.vehiclesAvailableCount);
}

verifyDashboard().catch(console.error);
