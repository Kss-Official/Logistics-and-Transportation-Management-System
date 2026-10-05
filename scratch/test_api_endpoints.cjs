const crypto = require('crypto');

// Generate JWT token for admin
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

async function test() {
  console.log('--- Testing /api/admin/drivers/available ---');
  const dRes = await fetch('http://localhost:8080/api/admin/drivers/available', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const dData = await dRes.json();
  console.log('Status:', dRes.status);
  console.log('Success:', dData.success);
  console.log('Message:', dData.message);
  console.log('Drivers Count:', dData.data?.length);
  dData.data?.forEach(d => {
    console.log(`- ID: ${d.id}, Name: ${d.fullName}, Phone: ${d.phone}, License: ${d.licenseNumber}, Status: ${d.status}`);
  });

  console.log('\n--- Testing /api/admin/vehicles/available ---');
  const vRes = await fetch('http://localhost:8080/api/admin/vehicles/available', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const vData = await vRes.json();
  console.log('Status:', vRes.status);
  console.log('Success:', vData.success);
  console.log('Message:', vData.message);
  console.log('Vehicles Count:', vData.data?.length);
  vData.data?.forEach(v => {
    console.log(`- ID: ${v.id}, Plate: ${v.vehicleNumber}, Model: ${v.model}, Status: ${v.status}`);
  });
}

test().catch(console.error);
