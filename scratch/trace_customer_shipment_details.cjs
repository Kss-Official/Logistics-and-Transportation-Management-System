const http = require('http');

function request(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, data: json });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function main() {
  try {
    // 1. Login as customer (gudisahoo@gmail.com, owner of PR-TRK-WQ73ENPZ)
    let loginRes = await request('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      email: 'gudisahoo@gmail.com',
      password: 'Password@123'
    });

    console.log('Customer login status:', loginRes.status);
    const token = loginRes.data?.data?.token || loginRes.data?.token;

    if (!token) {
      console.log('Login failed:', loginRes.data);
      return;
    }

    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Fetch Customer Shipments
    const shipmentsRes = await request('http://localhost:8080/api/customer/shipments', {
      headers: authHeaders
    });
    console.log('\nGET /api/customer/shipments status:', shipmentsRes.status);
    console.log('Shipments count:', shipmentsRes.data?.data?.length);
    console.log('Shipments list:\n', JSON.stringify(shipmentsRes.data?.data, null, 2));

    // 3. Test tracking endpoint for PR-TRK-WQ73ENPZ
    const trackRes = await request('http://localhost:8080/api/customer/shipments/track/PR-TRK-WQ73ENPZ', {
      headers: authHeaders
    });
    console.log('\nGET /api/customer/shipments/track/PR-TRK-WQ73ENPZ status:', trackRes.status);
    console.log('Track Response:\n', JSON.stringify(trackRes.data, null, 2));

    // 4. Test detail by ID endpoint: /api/customer/shipments/628
    const detailRes = await request('http://localhost:8080/api/customer/shipments/628', {
      headers: authHeaders
    });
    console.log('\nGET /api/customer/shipments/628 status:', detailRes.status);
    console.log('Shipment 628 Details:\n', JSON.stringify(detailRes.data, null, 2));

    // 5. Test customer tracking by ID: /api/customer/shipments/628/tracking
    const trackIdRes = await request('http://localhost:8080/api/customer/shipments/628/tracking', {
      headers: authHeaders
    });
    console.log('\nGET /api/customer/shipments/628/tracking status:', trackIdRes.status);

    // 6. Test Customer Authorization: Customer A trying to access another customer's shipment or invalid ID
    // Let's test non-existent shipment
    const notFoundRes = await request('http://localhost:8080/api/customer/shipments/999999', {
      headers: authHeaders
    });
    console.log('\nGET /api/customer/shipments/999999 status (expected 404):', notFoundRes.status);

    // Let's test unauthenticated
    const unauthRes = await request('http://localhost:8080/api/customer/shipments/628');
    console.log('\nGET unauthenticated status (expected 401/403):', unauthRes.status);

  } catch (err) {
    console.error('Error:', err);
  }
}

main();
