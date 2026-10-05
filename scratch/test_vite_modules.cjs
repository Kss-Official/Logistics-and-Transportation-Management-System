const http = require('http');

function get(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, length: data.length, data: data.substring(0, 100) }));
    }).on('error', err => resolve({ error: err.message }));
  });
}

async function run() {
  console.log('GET / ->', await get('http://localhost:5173/'));
  console.log('GET /src/main.tsx ->', await get('http://localhost:5173/src/main.tsx'));
  console.log('GET /src/pages/customer/CustomerDashboard.tsx ->', await get('http://localhost:5173/src/pages/customer/CustomerDashboard.tsx'));
  console.log('GET /src/components/dashboard/OrdersStatusDonut.tsx ->', await get('http://localhost:5173/src/components/dashboard/OrdersStatusDonut.tsx'));
}

run();
