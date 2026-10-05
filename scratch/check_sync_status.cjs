const crypto = require('crypto');
const secret = 'PrimeRouteLogisticsSecretKey2026ForDevelopmentOnlyChangeThisLater';

function base64url(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
const now = Math.floor(Date.now() / 1000);
const payload = base64url(JSON.stringify({
  sub: 'sanjanaaa.shru@gmail.com',
  role: 'ROLE_ADMIN',
  iat: now,
  exp: now + 3600
}));

const signature = crypto
  .createHmac('sha256', secret)
  .update(`${header}.${payload}`)
  .digest('base64')
  .replace(/=/g, '')
  .replace(/\+/g, '-')
  .replace(/\//g, '_');

const token = `${header}.${payload}.${signature}`;

async function check() {
  console.log('=== GET /api/admin/drivers (Drivers page) ===');
  const resAll = await fetch('http://localhost:8080/api/admin/drivers', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const dataAll = await resAll.json();
  dataAll.data?.forEach(d => {
    console.log(`ID: ${d.id} | Name: ${d.fullName.padEnd(20)} | Status: ${d.status.padEnd(10)} | Active Shipments: ${d.assignedShipmentsCount} | Numbers: ${d.assignedShipmentNumbers.join(', ')}`);
  });

  console.log('\n=== GET /api/admin/drivers/available (Create Shipment modal) ===');
  const resAvail = await fetch('http://localhost:8080/api/admin/drivers/available', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const dataAvail = await resAvail.json();
  console.log(`Count available: ${dataAvail.data?.length}`);
  dataAvail.data?.forEach(d => {
    console.log(`ID: ${d.id} | Name: ${d.fullName.padEnd(20)} | Status: ${d.status.padEnd(10)} | Active: ${d.assignedShipmentsCount}`);
  });
}

check().catch(console.error);
