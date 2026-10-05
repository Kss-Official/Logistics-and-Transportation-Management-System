const http = require('http');
const { execSync } = require('child_process');

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
  console.log('--- Step 1: Inserting new dynamic FAQ record directly into PostgreSQL ---');
  const insertSql = `
    $env:PGPASSWORD = 'postgres123';
    & 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' -U postgres -d primeroute_db -c "INSERT INTO faqs (category, question, answer, display_order, is_active) VALUES ('General', 'What SLA response times does PrimeRoute guarantee?', 'PrimeRoute guarantees a 99.9% uptime SLA for tracking telemetry and under 15-minute priority dispatch confirmations for commercial freight accounts.', 11, true);"
  `;
  execSync(`powershell -Command "${insertSql}"`);

  console.log('\n--- Step 2: Fetching FAQs from Spring Boot backend API ---');
  const res = await request('/api/faqs');
  console.log('Count from API:', res.data.data.length);
  const found = res.data.data.find(f => f.q.includes('What SLA response times'));
  if (!found) {
    throw new Error('Newly inserted FAQ was not returned by the backend API!');
  }
  console.log('Successfully found dynamically inserted FAQ:');
  console.log('  Question:', found.q);
  console.log('  Answer:', found.a);

  console.log('\n--- Step 3: Cleaning up test FAQ record ---');
  const deleteSql = `
    $env:PGPASSWORD = 'postgres123';
    & 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' -U postgres -d primeroute_db -c "DELETE FROM faqs WHERE question = 'What SLA response times does PrimeRoute guarantee?';"
  `;
  execSync(`powershell -Command "${deleteSql}"`);

  console.log('\nDynamic persistence and API retrieval fully verified!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
