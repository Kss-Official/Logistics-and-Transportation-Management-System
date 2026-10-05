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
    console.log('================================================================');
    console.log('1. CUSTOMER PORTAL VIEW: Shipment PR-TRK-KZ3GJJ6X (ID: 751)');
    console.log('================================================================');
    const customerToken = await login('gudisahoo@gmail.com', 'Gudi@450');
    const custRes = await request('http://localhost:8080/api/customer/shipments/751', {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const cData = custRes.body.data || custRes.body;
    console.log(JSON.stringify({
      id: cData.id || cData.shipmentId,
      trackingNumber: cData.trackingNumber,
      orderNumber: cData.orderNumber,
      status: cData.status,
      customerName: cData.customerName,
      customerEmail: cData.customerEmail,
      driverName: cData.driverName,
      driverPhone: cData.driverPhone,
      vehicleNumber: cData.vehicleNumber,
      vehicleModel: cData.vehicleModel,
      assignedBy: cData.assignedBy,
      assignedAt: cData.assignedAt,
      assignmentStatus: cData.assignmentStatus,
      originWarehouseName: cData.originWarehouseName,
      pickupAddress: cData.pickupAddress,
      deliveryAddress: cData.deliveryAddress,
      proofOfDelivery: cData.proofOfDelivery ? {
        id: cData.proofOfDelivery.id,
        recipientName: cData.proofOfDelivery.recipientName,
        deliveredBy: cData.proofOfDelivery.deliveredBy,
        deliveredAt: cData.proofOfDelivery.deliveredAt,
        signaturePresent: !!(cData.proofOfDelivery.signatureData || cData.proofOfDelivery.signatureBase64)
      } : null
    }, null, 2));

    console.log('\n================================================================');
    console.log('2. ADMIN PORTAL VIEW: Shipment PR-TRK-KZ3GJJ6X (ID: 751)');
    console.log('================================================================');
    const adminToken = await login('admin@primeroute.com', 'Password@123');
    const adminRes = await request('http://localhost:8080/api/admin/shipments/751', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const aData = adminRes.body.data || adminRes.body;
    console.log(JSON.stringify({
      id: aData.id,
      trackingNumber: aData.trackingNumber,
      orderNumber: aData.orderNumber,
      status: aData.status,
      customerName: aData.customerName,
      customerEmail: aData.customerEmail,
      assignedDriver: aData.assignedDriver,
      assignedVehicle: aData.assignedVehicle,
      assignedBy: aData.assignedBy,
      assignedAt: aData.assignedAt,
      assignmentStatus: aData.assignmentStatus,
      originWarehouseName: aData.originWarehouseName,
      proofOfDelivery: aData.proofOfDelivery ? {
        id: aData.proofOfDelivery.id,
        recipientName: aData.proofOfDelivery.recipientName,
        deliveredBy: aData.proofOfDelivery.deliveredBy,
        deliveredAt: aData.proofOfDelivery.deliveredAt,
        signaturePresent: !!(aData.proofOfDelivery.signatureData || aData.proofOfDelivery.signatureBase64)
      } : null
    }, null, 2));

    console.log('\n================================================================');
    console.log('3. WAREHOUSE MANAGER VIEW: Shipment PR-TRK-KZ3GJJ6X (ID: 751)');
    console.log('================================================================');
    const wmToken = await login('ccu.east@primeroute.com', 'Manager@2026!');
    const wmRes = await request('http://localhost:8080/api/warehouse-manager/shipments/751', {
      headers: { 'Authorization': `Bearer ${wmToken}` }
    });
    const wData = wmRes.body.data || wmRes.body;
    console.log(JSON.stringify({
      id: wData.id,
      trackingNumber: wData.trackingNumber,
      orderNumber: wData.orderNumber,
      status: wData.status,
      customerName: wData.customerName,
      customerEmail: wData.customerEmail,
      assignedDriver: wData.assignedDriver,
      assignedVehicle: wData.assignedVehicle,
      assignedBy: wData.assignedBy,
      assignedAt: wData.assignedAt,
      assignmentStatus: wData.assignmentStatus,
      proofOfDelivery: wData.proofOfDelivery ? {
        id: wData.proofOfDelivery.id,
        recipientName: wData.proofOfDelivery.recipientName,
        deliveredBy: wData.proofOfDelivery.deliveredBy,
        deliveredAt: wData.proofOfDelivery.deliveredAt,
        signaturePresent: !!(wData.proofOfDelivery.signatureData || wData.proofOfDelivery.signatureBase64)
      } : null
    }, null, 2));

    console.log('\n================================================================');
    console.log('4. PUBLIC TRACKING: Shipment PR-TRK-KZ3GJJ6X');
    console.log('================================================================');
    const pubRes = await request('http://localhost:8080/api/public/tracking/PR-TRK-KZ3GJJ6X');
    const pData = pubRes.body.data || pubRes.body;
    console.log(JSON.stringify({
      trackingNumber: pData.trackingNumber,
      orderNumber: pData.orderNumber,
      status: pData.status,
      deliveryType: pData.deliveryType,
      currentLocation: pData.currentLocation ? pData.currentLocation.locationName : null
    }, null, 2));

  } catch (err) {
    console.error('Error running test:', err);
  }
}

run();
