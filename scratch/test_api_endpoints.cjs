const http = require('http');

function post(urlPath, data) {
  return new Promise((resolve) => {
    const postData = JSON.stringify(data);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 8080,
        path: urlPath,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(body);
          } catch {
            parsed = body;
          }
          resolve({ status: res.statusCode, data: parsed });
        });
      }
    );
    req.on('error', (err) => resolve({ status: 0, error: err.message }));
    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('=== STARTING DIRECT API VALIDATION TESTS ===\n');

  // Test 1: Observed QA issue payload
  console.log('--- TEST 1: Original QA Bug Payload (J789 / P%7@2.jk / 9000000000 / Ab1😂😂😂😂😂) ---');
  const qaRes = await post('/api/auth/register', {
    fullName: 'J789',
    email: 'P%7@2.jk',
    phone: '9000000000',
    password: 'Ab1😂😂😂😂😂',
    companyName: 'Bug Corp'
  });
  console.log('Status:', qaRes.status);
  console.log('Response:', JSON.stringify(qaRes.data, null, 2));
  console.log('Result:', qaRes.status === 400 ? '✅ PASSED (Properly Rejected)' : '❌ FAILED');

  // Test 2: Invalid Name ("12345")
  console.log('\n--- TEST 2: Invalid Name ("12345") ---');
  const nameRes = await post('/api/auth/register', {
    fullName: '12345',
    email: 'test.name@gmail.com',
    phone: '9876543210',
    password: 'Prime@12345',
  });
  console.log('Status:', nameRes.status, '| Message:', nameRes.data.message || nameRes.data);
  console.log('Result:', nameRes.status === 400 ? '✅ PASSED' : '❌ FAILED');

  // Test 3: Invalid Email ("abc@gmail" / "P%7@2.jk")
  console.log('\n--- TEST 3: Invalid Email ("abc@gmail") ---');
  const emailRes = await post('/api/auth/register', {
    fullName: 'Valid Name',
    email: 'abc@gmail',
    phone: '9876543210',
    password: 'Prime@12345',
  });
  console.log('Status:', emailRes.status, '| Message:', emailRes.data.message || emailRes.data);
  console.log('Result:', emailRes.status === 400 ? '✅ PASSED' : '❌ FAILED');

  // Test 4: Invalid Phone ("1234567890")
  console.log('\n--- TEST 4: Invalid Phone ("1234567890" not starting with 6-9) ---');
  const phoneRes = await post('/api/auth/register', {
    fullName: 'Valid Name',
    email: 'valid.phone.test@gmail.com',
    phone: '1234567890',
    password: 'Prime@12345',
  });
  console.log('Status:', phoneRes.status, '| Message:', phoneRes.data.message || phoneRes.data);
  console.log('Result:', phoneRes.status === 400 ? '✅ PASSED' : '❌ FAILED');

  // Test 5: Weak Password ("Password123" missing special char)
  console.log('\n--- TEST 5: Weak Password ("Password123" - missing special char) ---');
  const passRes = await post('/api/auth/register', {
    fullName: 'Valid Name',
    email: 'valid.pass.test@gmail.com',
    phone: '9876543210',
    password: 'Password123',
  });
  console.log('Status:', passRes.status, '| Message:', passRes.data.message || passRes.data);
  console.log('Result:', passRes.status === 400 ? '✅ PASSED' : '❌ FAILED');

  // Test 6: Valid Registration (with 9000000000)
  const uniqueEmail = `test.customer.${Date.now()}@gmail.com`;
  console.log(`\n--- TEST 6: Valid Registration (${uniqueEmail} / 9000000000 / Prime@12345) ---`);
  const validRes = await post('/api/auth/register', {
    fullName: 'Ananya Sharma',
    email: uniqueEmail,
    phone: '9000000000',
    password: 'Prime@12345',
    companyName: 'Sharma Logistics'
  });
  console.log('Status:', validRes.status, '| Data:', validRes.data);
  console.log('Result:', validRes.status === 200 ? '✅ PASSED' : '❌ FAILED');

  // Test 7: Duplicate Email (409 Conflict)
  console.log(`\n--- TEST 7: Duplicate Email Registration (${uniqueEmail}) ---`);
  const dupRes = await post('/api/auth/register', {
    fullName: 'Ananya Sharma Dup',
    email: uniqueEmail,
    phone: '9876543210',
    password: 'Prime@12345',
  });
  console.log('Status:', dupRes.status, '| Message:', dupRes.data.message);
  console.log('Result:', dupRes.status === 409 && dupRes.data.message === 'An account with this email already exists.' ? '✅ PASSED (Controlled 409 Conflict)' : '❌ FAILED');

  // Test 8: Valid Login with the newly registered user
  console.log('\n--- TEST 8: Valid Login with Registered Credentials ---');
  const loginRes = await post('/api/auth/login', {
    email: uniqueEmail,
    password: 'Prime@12345'
  });
  console.log('Status:', loginRes.status, '| Role:', loginRes.data.role, '| Token Present:', !!loginRes.data.token);
  console.log('Result:', loginRes.status === 200 && loginRes.data.token ? '✅ PASSED' : '❌ FAILED');

  // Test 9: Wrong Password Login (401 Unauthorized)
  console.log('\n--- TEST 9: Wrong Password Login ---');
  const wrongPassRes = await post('/api/auth/login', {
    email: uniqueEmail,
    password: 'WrongPassword@123'
  });
  console.log('Status:', wrongPassRes.status, '| Message:', wrongPassRes.data.message);
  console.log('Result:', wrongPassRes.status === 401 && wrongPassRes.data.message === 'Invalid email or password.' ? '✅ PASSED' : '❌ FAILED');

  // Test 10: Non-existent Email Login (401 Unauthorized)
  console.log('\n--- TEST 10: Non-existent Email Login ---');
  const nonExistentRes = await post('/api/auth/login', {
    email: 'nonexistent.user.12345@domain.com',
    password: 'Prime@12345'
  });
  console.log('Status:', nonExistentRes.status, '| Message:', nonExistentRes.data.message);
  console.log('Result:', nonExistentRes.status === 401 && nonExistentRes.data.message === 'Invalid email or password.' ? '✅ PASSED' : '❌ FAILED');

  // Test 11: Malformed Login Email (400 Bad Request)
  console.log('\n--- TEST 11: Malformed Login Email ("P%7@2.jk") ---');
  const malformedLoginRes = await post('/api/auth/login', {
    email: 'P%7@2.jk',
    password: 'Prime@12345'
  });
  console.log('Status:', malformedLoginRes.status, '| Message:', malformedLoginRes.data.message);
  console.log('Result:', malformedLoginRes.status === 400 ? '✅ PASSED' : '❌ FAILED');

  // Test 12: Empty Login Fields (400 Bad Request)
  console.log('\n--- TEST 12: Empty Login Request ---');
  const emptyLoginRes = await post('/api/auth/login', {
    email: '',
    password: ''
  });
  console.log('Status:', emptyLoginRes.status, '| Message:', emptyLoginRes.data.message);
  console.log('Result:', emptyLoginRes.status === 400 ? '✅ PASSED' : '❌ FAILED');

  console.log('\n=== ALL API VALIDATION TESTS COMPLETED ===');
}

runTests();
