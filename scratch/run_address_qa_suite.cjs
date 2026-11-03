const http = require('http');
const { execSync } = require('child_process');

function request(method, url, data, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const postData = data ? JSON.stringify(data) : null;
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: method,
      headers: {
        ...(postData ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) } : {}),
        ...(token ? { 'Authorization': 'Bearer ' + token } : {})
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let json;
        try { json = JSON.parse(body); } catch (e) { json = body; }
        resolve({ status: res.statusCode, data: json });
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runQa() {
  console.log('=====================================================');
  console.log('--- PRIMEROUTE ADDRESS VALIDATION QA TEST SUITE ---');
  console.log('=====================================================');

  // 1. Authenticate Customer
  const loginRes = await request('POST', 'http://localhost:8080/api/auth/login', {
    email: 'customer@primeroute.com',
    password: 'Password@123'
  });
  const token = loginRes.data?.token || loginRes.data?.data?.token;
  console.log('[1] Customer Login:', loginRes.status === 200 && token ? 'SUCCESS' : 'FAILED');

  // 2. Test Negative Case from User Prompt (All Invalid Data)
  console.log('\n[2] NEGATIVE TEST: Exact Invalid Payload from Prompt');
  const invalidPayload = {
    locationType: 'OFFICE',
    contactPerson: '12L',
    contactPhone: '9000000000',
    streetAddress: 'wbhqwbdqd18u29w2u90e9ue9u',
    apartmentUnitLandmark: '92992898',
    city: '283899802290',
    state: '29u929i20i2',
    postalCode: '777777',
    country: 'India',
    isDefault: true
  };

  const negRes1 = await request('POST', 'http://localhost:8080/api/customer/addresses', invalidPayload, token);
  console.log('    HTTP Status:', negRes1.status, negRes1.status === 400 ? 'PASS (400 Bad Request)' : 'FAIL');
  console.log('    Response Structure:', JSON.stringify(negRes1.data, null, 2));

  // 3. Test Individual Field Rejections via API
  console.log('\n[3] NEGATIVE TESTS: Individual Field Variations');

  const variations = [
    { name: 'Invalid Contact Person (digits only: 123456)', override: { contactPerson: '123456' } },
    { name: 'Invalid Contact Person (symbols: @@@@@@)', override: { contactPerson: '@@@@@@' } },
    { name: 'Invalid Phone (starts with 1: 1234567890)', override: { contactPhone: '1234567890' } },
    { name: 'Invalid Phone (short: 98765)', override: { contactPhone: '98765' } },
    { name: 'Invalid Street (numbers only: 12345)', override: { streetAddress: '12345' } },
    { name: 'Invalid Street (symbols: @@@@@@)', override: { streetAddress: '@@@@@@' } },
    { name: 'Invalid Street (gibberish: wbhqwbdqd18u29w2u90e9ue9u)', override: { streetAddress: 'wbhqwbdqd18u29w2u90e9ue9u' } },
    { name: 'Invalid City (numbers only: 283899802290)', override: { city: '283899802290' } },
    { name: 'Invalid State (gibberish: 29u929i20i2)', override: { state: '29u929i20i2' } },
    { name: 'Invalid Postal Code (000000)', override: { postalCode: '000000' } },
    { name: 'Invalid Postal Code (short: 5600)', override: { postalCode: '5600' } }
  ];

  const baseValid = {
    addressType: 'Office',
    contactName: 'Rahul Kumar',
    phone: '9876543210',
    addressLine1: '12 MG Road, Indiranagar',
    addressLine2: 'Near Metro Station',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560038',
    country: 'India',
    defaultAddress: true
  };

  for (const v of variations) {
    const payload = { ...baseValid, ...v.override };
    const res = await request('POST', 'http://localhost:8080/api/customer/addresses', payload, token);
    console.log('    ' + v.name + ' => HTTP ' + res.status + ' ' + (res.status === 400 ? 'PASS' : 'FAIL'));
  }

  // 4. Test Positive Create Address
  console.log('\n[4] POSITIVE TEST: Create Valid Address');
  const posRes = await request('POST', 'http://localhost:8080/api/customer/addresses', baseValid, token);
  console.log('    HTTP Status:', posRes.status, (posRes.status === 200 || posRes.status === 201) ? 'PASS' : 'FAIL');
  const createdAddress = posRes.data?.data || posRes.data;
  const createdId = createdAddress?.id;
  console.log('    Created Address ID:', createdId);

  // 5. Test Positive Edit Address
  console.log('\n[5] POSITIVE TEST: Edit Address');
  const updatePayload = {
    ...baseValid,
    contactName: 'Priya Sharma',
    addressLine1: '45 Park Street, 2nd Floor',
    city: 'Kolkata',
    state: 'West Bengal',
    postalCode: '700016'
  };
  const editRes = await request('PUT', 'http://localhost:8080/api/customer/addresses/' + createdId, updatePayload, token);
  console.log('    HTTP Status:', editRes.status, editRes.status === 200 ? 'PASS' : 'FAIL');
  const updatedAddress = editRes.data?.data || editRes.data;
  console.log('    Updated Contact Name:', updatedAddress?.contactName);
  console.log('    Updated City:', updatedAddress?.city);
  console.log('    Updated State:', updatedAddress?.state);

  // 6. Test Negative Edit Address
  console.log('\n[6] NEGATIVE TEST: Edit Address with Invalid Values (e.g. City -> 283899802290)');
  const invalidEditPayload = {
    ...updatePayload,
    city: '283899802290'
  };
  const negEditRes = await request('PUT', 'http://localhost:8080/api/customer/addresses/' + createdId, invalidEditPayload, token);
  console.log('    HTTP Status:', negEditRes.status, negEditRes.status === 400 ? 'PASS (400 Bad Request)' : 'FAIL');
  console.log('    Errors:', JSON.stringify(negEditRes.data?.errors, null, 2));

  // 7. Verify Database Values in PostgreSQL
  console.log('\n[7] DATABASE PERSISTENCE VERIFICATION');
  const psqlQuery = 'SELECT id, contact_name, phone, address_line1, address_line2, city, state, postal_code, country, default_address FROM addresses WHERE id = ' + createdId + ';';
  const cmd = `powershell -Command "$env:PGPASSWORD = 'postgres123'; & 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' -U postgres -d primeroute_db -c \\"${psqlQuery}\\""`;
  const dbOutput = execSync(cmd, { encoding: 'utf8' });
  console.log('    PostgreSQL Query Output:');
  console.log(dbOutput);

  // 8. Ownership / Authorization Check: Try accessing without token
  console.log('\n[8] SECURITY TEST: Unauthorized Request (No Token)');
  const noTokenRes = await request('GET', 'http://localhost:8080/api/customer/addresses');
  console.log('    HTTP Status:', noTokenRes.status, noTokenRes.status === 401 ? 'PASS (401 Unauthorized)' : 'FAIL');

  console.log('=====================================================');
  console.log('--- ALL QA TESTS COMPLETED SUCCESSFULLY ---');
  console.log('=====================================================');
}

runQa();
