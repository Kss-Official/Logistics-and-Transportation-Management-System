const http = require('http');
const crypto = require('crypto');
const { execSync } = require('child_process');

process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432';

const secret = 'PrimeRouteLogisticsSecretKey2026ForDevelopmentOnlyChangeThisLater';
function base64url(buf) { return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_'); }
const header = { alg: 'HS256', typ: 'JWT' };
const now = Math.floor(Date.now() / 1000);
const payload = { sub: 'sanjanaaa.shru@gmail.com', role: 'ROLE_ADMIN', iat: now, exp: now + 3600 * 24 };
const headB64 = base64url(Buffer.from(JSON.stringify(header)));
const payloadB64 = base64url(Buffer.from(JSON.stringify(payload)));
const signInput = headB64 + '.' + payloadB64;
const token = signInput + '.' + base64url(crypto.createHmac('sha256', secret).update(signInput).digest());

function apiRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const headers = { 'Authorization': 'Bearer ' + token };
    let bodyStr = '';
    if (data) {
      bodyStr = JSON.stringify(data);
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }
    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path,
      method,
      headers
    }, (res) => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(b) });
        } catch {
          resolve({ status: res.statusCode, data: b });
        }
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function run() {
  console.log('====================================================');
  console.log('TEST 1: DATABASE CHECK FOR TRK-PR-CR4R5P77 & PR-VH-005');
  console.log('====================================================');
  const dbShipment = execSync(`${PSQL} -c "SELECT id, tracking_number, driver_id, vehicle_id, status FROM shipments WHERE tracking_number = 'TRK-PR-CR4R5P77';"`, { encoding: 'utf8', env: process.env });
  console.log('Shipment in DB:\n' + dbShipment);

  const dbVehicle = execSync(`${PSQL} -c "SELECT id, vehicle_number, driver_id, status FROM vehicles WHERE vehicle_number = 'PR-VH-005';"`, { encoding: 'utf8', env: process.env });
  console.log('Vehicle in DB:\n' + dbVehicle);

  console.log('====================================================');
  console.log('TEST 2: GET SHIPMENT DETAILS VIA API (TRK-PR-CR4R5P77)');
  console.log('====================================================');
  const shipRes = await apiRequest('GET', '/api/admin/shipments/24');
  console.log('Shipment API response status:', shipRes.status);
  const sData = shipRes.data.data;
  console.log('Shipment Tracking Number:', sData.trackingNumber);
  console.log('Assigned Driver:', sData.assignedDriver, '(ID:', sData.driverId, ')');
  console.log('Assigned Vehicle:', sData.vehicleNumber, '(ID:', sData.vehicleId, ')');

  console.log('====================================================');
  console.log('TEST 3: GET VEHICLE DETAILS VIA API (PR-VH-005)');
  console.log('====================================================');
  const vehRes = await apiRequest('GET', '/api/admin/vehicles/9');
  console.log('Vehicle API response status:', vehRes.status);
  const vData = vehRes.data.data;
  console.log('Vehicle Number:', vData.vehicleNumber);
  console.log('Current Shipment:', vData.currentShipmentTrackingNumber, '(ID:', vData.currentShipmentId, ')');
  console.log('Assigned Driver:', vData.driverName, '(ID:', vData.driverId, ')');
  console.log('Driver Phone:', vData.driverPhone);

  if (sData.assignedDriver === vData.driverName) {
    console.log('>>> PASSED: Shipment Details and Vehicles Page agree on driver:', sData.assignedDriver);
  } else {
    console.error('>>> FAILED: Driver mismatch! Shipment:', sData.assignedDriver, 'vs Vehicle:', vData.driverName);
    process.exit(1);
  }

  console.log('====================================================');
  console.log('TEST 4: GET DRIVER DETAILS VIA API');
  console.log('====================================================');
  const priyaRes = await apiRequest('GET', '/api/admin/drivers/13');
  const uttamRes = await apiRequest('GET', '/api/admin/drivers/19');
  console.log('Priya Patel status:', priyaRes.data.data.status, '| Active Shipments:', priyaRes.data.data.assignedShipmentsCount, priyaRes.data.data.assignedShipmentNumbers);
  console.log('Uttam status:', uttamRes.data.data.status, '| Active Shipments:', uttamRes.data.data.assignedShipmentsCount, uttamRes.data.data.assignedShipmentNumbers);

  console.log('====================================================');
  console.log('TEST 5: TEST DRIVER REASSIGNMENT: PRIYA -> UTTAM');
  console.log('====================================================');
  console.log('Reassigning driver of shipment 24 to Uttam (ID: 19)...');
  const reassignRes = await apiRequest('PATCH', '/api/admin/shipments/24/driver', { driverId: 19 });
  console.log('Reassign response status:', reassignRes.status);
  console.log('New shipment driver in API:', reassignRes.data.data.assignedDriver);

  const shipAfter = (await apiRequest('GET', '/api/admin/shipments/24')).data.data;
  const vehAfter = (await apiRequest('GET', '/api/admin/vehicles/9')).data.data;
  const priyaAfter = (await apiRequest('GET', '/api/admin/drivers/13')).data.data;
  const uttamAfter = (await apiRequest('GET', '/api/admin/drivers/19')).data.data;

  console.log('AFTER REASSIGNMENT:');
  console.log('Shipment Details driver:', shipAfter.assignedDriver, '(ID:', shipAfter.driverId, ')');
  console.log('Vehicle Details driver:', vehAfter.driverName, '(ID:', vehAfter.driverId, ')');
  console.log('Priya Patel status:', priyaAfter.status, '| Active Shipments:', priyaAfter.assignedShipmentsCount);
  console.log('Uttam status:', uttamAfter.status, '| Active Shipments:', uttamAfter.assignedShipmentsCount, uttamAfter.assignedShipmentNumbers);

  if (shipAfter.assignedDriver === 'Uttam' && vehAfter.driverName === 'Uttam' && uttamAfter.status === 'ON_TRIP' && priyaAfter.status === 'AVAILABLE') {
    console.log('>>> PASSED: Reassignment perfectly synchronized across Shipment, Vehicle, and Drivers!');
  } else {
    console.error('>>> FAILED synchronization after reassignment!');
    process.exit(1);
  }

  console.log('====================================================');
  console.log('TEST 6: REASSIGN BACK: UTTAM -> PRIYA');
  console.log('====================================================');
  const revertRes = await apiRequest('PATCH', '/api/admin/shipments/24/driver', { driverId: 13 });
  console.log('Revert response status:', revertRes.status);
  const shipFinal = (await apiRequest('GET', '/api/admin/shipments/24')).data.data;
  const vehFinal = (await apiRequest('GET', '/api/admin/vehicles/9')).data.data;
  const priyaFinal = (await apiRequest('GET', '/api/admin/drivers/13')).data.data;
  const uttamFinal = (await apiRequest('GET', '/api/admin/drivers/19')).data.data;

  console.log('Shipment Final driver:', shipFinal.assignedDriver);
  console.log('Vehicle Final driver:', vehFinal.driverName);
  console.log('Priya Final status:', priyaFinal.status, '| Active Shipments:', priyaFinal.assignedShipmentsCount, priyaFinal.assignedShipmentNumbers);
  console.log('Uttam Final status:', uttamFinal.status, '| Active Shipments:', uttamFinal.assignedShipmentsCount, uttamFinal.assignedShipmentNumbers);

  if (shipFinal.assignedDriver === 'Priya Patel' && vehFinal.driverName === 'Priya Patel' && priyaFinal.status === 'ON_TRIP' && uttamFinal.status === 'AVAILABLE') {
    console.log('>>> ALL VERIFICATION TESTS PASSED SUCCESSFULLY! <<<');
  } else {
    console.error('>>> Revert verification failed!');
    process.exit(1);
  }
}

run().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
