const http = require('http');

function request(url, options = {}, data = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    if (data) {
      reqOptions.headers['Content-Type'] = 'application/json';
      reqOptions.headers['Content-Length'] = Buffer.byteLength(data);
    }

    const req = http.request(reqOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed });
        } catch(e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function login(email, password) {
  const res = await request('http://localhost:8080/api/auth/login', {
    method: 'POST'
  }, JSON.stringify({ email, password }));
  return res.body.token || (res.body.data && res.body.data.token);
}

async function run() {
  try {
    console.log('--- 1. Testing Customer View for PR-TRK-KZ3GJJ6X ---');
    const customerToken = await login('gudisahoo@gmail.com', 'Gudi@450');
    if (!customerToken) {
      console.log('Customer login failed');
      return;
    }

    const customerRes = await request('http://localhost:8080/api/customer/shipments/751', {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });

    console.log('Customer Detail Response:');
    const custData = customerRes.body.data || customerRes.body;
    console.log(JSON.stringify({
      id: custData.id,
      trackingNumber: custData.trackingNumber,
      status: custData.status,
      customerName: custData.customerName,
      customerEmail: custData.customerEmail,
      driverName: custData.driverName,
      driverPhone: custData.driverPhone,
      vehicleNumber: custData.vehicleNumber,
      vehicleModel: custData.vehicleModel,
      assignedBy: custData.assignedBy,
      assignedAt: custData.assignedAt,
      assignmentStatus: custData.assignmentStatus,
      proofOfDelivery: custData.proofOfDelivery
    }, null, 2));

    console.log('\n--- 2. Testing Admin View for PR-TRK-KZ3GJJ6X ---');
    const adminToken = await login('admin@primeroute.in', 'Admin@123');
    if (adminToken) {
      const adminRes = await request('http://localhost:8080/api/admin/shipments/751', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const adminData = adminRes.body.data || adminRes.body;
      console.log('Admin Detail Response:');
      console.log(JSON.stringify({
        id: adminData.id,
        trackingNumber: adminData.trackingNumber,
        status: adminData.status,
        customerName: adminData.customerName,
        driverName: adminData.driverName,
        vehicleNumber: adminData.vehicleNumber,
        assignedBy: adminData.assignedBy,
        assignedAt: adminData.assignedAt,
        proofOfDelivery: adminData.proofOfDelivery
      }, null, 2));
    }

    console.log('\n--- 3. Testing Public Tracking for PR-TRK-KZ3GJJ6X ---');
    const trackRes = await request('http://localhost:8080/api/track/PR-TRK-KZ3GJJ6X');
    const trackData = trackRes.body.data || trackRes.body;
    console.log('Public Tracking Response:');
    console.log(JSON.stringify({
      trackingNumber: trackData.trackingNumber,
      status: trackData.status,
      customerName: trackData.customerName,
      driverName: trackData.driverName,
      vehicleNumber: trackData.vehicleNumber,
      assignedBy: trackData.assignedBy,
      assignedAt: trackData.assignedAt,
      assignmentStatus: trackData.assignmentStatus,
      proofOfDelivery: trackData.proofOfDelivery
    }, null, 2));

  } catch (err) {
    console.error('Error running test:', err);
  }
}

run();
