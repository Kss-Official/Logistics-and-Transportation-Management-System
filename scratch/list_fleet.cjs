const http = require('http');

function request(path, token) {
  return new Promise((resolve) => {
    http.get({
      hostname: 'localhost', port: 8080, path,
      headers: { Authorization: `Bearer ${token}` }
    }, res => {
      let b = ''; res.on('data', c => b += c);
      res.on('end', () => resolve(JSON.parse(b)));
    });
  });
}

async function run() {
  const login = await new Promise(resolve => {
    const req = http.request({
      hostname: 'localhost', port: 8080, path: '/api/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, res => {
      let b = ''; res.on('data', c => b += c);
      res.on('end', () => resolve(JSON.parse(b)));
    });
    req.write(JSON.stringify({ email: 'priya@primeroute.com', password: 'Manager@2026!' }));
    req.end();
  });
  const token = login.token;

  const drvs = await request('/api/warehouse-manager/drivers', token);
  console.log('Drivers:');
  drvs.data.forEach(d => console.log(`  ID: ${d.id}, Name: ${d.fullName}, Status: ${d.status}`));

  const vehs = await request('/api/warehouse-manager/vehicles', token);
  console.log('Vehicles:');
  vehs.data.forEach(v => console.log(`  ID: ${v.id}, Plate: ${v.vehicleNumber}, Status: ${v.status}`));
}
run();
