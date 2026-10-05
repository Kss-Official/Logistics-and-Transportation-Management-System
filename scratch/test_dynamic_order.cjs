const http = require('http');

function post(urlPath, data, token) {
  return new Promise((resolve) => {
    const body = JSON.stringify(data);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        hostname: 'localhost',
        port: 8080,
        path: urlPath,
        method: 'POST',
        headers,
      },
      (res) => {
        let b = '';
        res.on('data', (c) => (b += c));
        res.on('end', () => resolve({ status: res.statusCode, body: b }));
      }
    );
    req.on('error', (err) => resolve({ error: err.message }));
    req.write(body);
    req.end();
  });
}

function get(urlPath, token) {
  return new Promise((resolve) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        hostname: 'localhost',
        port: 8080,
        path: urlPath,
        method: 'GET',
        headers,
      },
      (res) => {
        let b = '';
        res.on('data', (c) => (b += c));
        res.on('end', () => resolve({ status: res.statusCode, body: b }));
      }
    );
    req.on('error', (err) => resolve({ error: err.message }));
    req.end();
  });
}

async function run() {
  console.log('--- Step 1: Customer Login ---');
  const custLogin = await post('/api/auth/login', {
    email: 'customer@primeroute.com',
    password: 'Customer@123',
  });
  const custToken = JSON.parse(custLogin.body).token;

  console.log('--- Step 2: Dashboard Before New Order ---');
  const dash1 = await get('/api/customer/dashboard', custToken);
  const data1 = JSON.parse(dash1.body).data;
  console.log('Total Orders:', data1.totalOrders);
  console.log('Distribution:', data1.ordersByStatus);

  console.log('--- Step 3: Create a Dynamic Express Order ---');
  const newOrderRes = await post(
    '/api/customer/orders',
    {
      pickupAddressId: 1,
      deliveryAddressId: 2,
      packageDescription: 'Express Circuit Boards Dynamic Test',
      packageWeight: 2.5,
      packageQuantity: 2,
      deliveryType: 'EXPRESS',
    },
    custToken
  );
  console.log('Create order status:', newOrderRes.status);
  const orderCreated = JSON.parse(newOrderRes.body).data;
  console.log('Created order number:', orderCreated.orderNumber, 'status:', orderCreated.status);

  console.log('--- Step 4: Dashboard After New Order ---');
  const dash2 = await get('/api/customer/dashboard', custToken);
  const data2 = JSON.parse(dash2.body).data;
  console.log('Total Orders:', data2.totalOrders);
  console.log('Distribution:', data2.ordersByStatus);
  console.log('Pending count increased:', data2.ordersByStatus.PENDING === data1.ordersByStatus.PENDING + 1);
}

run();
