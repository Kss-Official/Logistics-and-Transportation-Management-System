const crypto = require('crypto');

const secret = 'PrimeRouteLogisticsSecretKey2026ForDevelopmentOnlyChangeThisLater';

function base64url(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function makeToken(email, role) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const payload = base64url(JSON.stringify({
    sub: email,
    role: role,
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

  return `${header}.${payload}.${signature}`;
}

async function main() {
  const token = makeToken('priya@primeroute.com', 'ROLE_WAREHOUSE_MANAGER');

  console.log('--- 1. PROFILE API ---');
  const profRes = await fetch('http://localhost:8080/api/warehouse-manager/profile', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const profData = await profRes.json();
  console.log(JSON.stringify(profData, null, 2));

  console.log('\n--- 2. WAREHOUSE DETAILS API ---');
  const whRes = await fetch('http://localhost:8080/api/warehouse-manager/warehouse', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const whData = await whRes.json();
  console.log(JSON.stringify(whData, null, 2));

  console.log('\n--- 3. REPORTS API ---');
  const repRes = await fetch('http://localhost:8080/api/warehouse-manager/reports', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const repData = await repRes.json();
  console.log(JSON.stringify(repData, null, 2));

  console.log('\n--- 4. NOTIFICATIONS API ---');
  const notifRes = await fetch('http://localhost:8080/api/warehouse-manager/notifications', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const notifData = await notifRes.json();
  console.log(JSON.stringify(notifData, null, 2));
}

main().catch(console.error);
