const http = require('http');

function request(path) {
  return new Promise((resolve, reject) => {
    const req = http.get({ hostname: 'localhost', port: 8080, path }, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
  });
}

async function run() {
  console.log('--- Testing Spring Boot FAQ API Endpoints ---');

  console.log('\n[1] GET /api/faqs (all active FAQs)...');
  const allFaqs = await request('/api/faqs');
  console.log('Status:', allFaqs.status);
  console.log('Success:', allFaqs.data.success);
  console.log('Count:', allFaqs.data.data ? allFaqs.data.data.length : 0);

  if (allFaqs.status !== 200 || !allFaqs.data.data || allFaqs.data.data.length === 0) {
    throw new Error('Failed to retrieve FAQs from backend API!');
  }

  console.log('First FAQ Question:', allFaqs.data.data[0].q);
  console.log('First FAQ Answer:', allFaqs.data.data[0].a.slice(0, 70) + '...');

  console.log('\n[2] GET /api/faqs?category=Tracking...');
  const trackingFaqs = await request('/api/faqs?category=Tracking');
  console.log('Status:', trackingFaqs.status);
  console.log('Tracking FAQs count:', trackingFaqs.data.data.length);
  trackingFaqs.data.data.forEach((f) => console.log('  - [' + f.category + '] ' + f.q));

  if (trackingFaqs.data.data.some((f) => f.category !== 'Tracking')) {
    throw new Error('Category filter returned non-Tracking FAQs!');
  }

  console.log('\n[3] GET /api/faqs/categories...');
  const cats = await request('/api/faqs/categories');
  console.log('Status:', cats.status);
  console.log('Categories:', cats.data.data);

  if (!cats.data.data || cats.data.data.length < 5) {
    throw new Error('Failed to retrieve categories!');
  }

  console.log('\n======================================================');
  console.log('DYNAMIC FAQ BACKEND & DATABASE FULLY OPERATIONAL!');
  console.log('======================================================');
}

run().catch((err) => {
  console.error('VERIFICATION FAILED:', err.message);
  process.exit(1);
});
