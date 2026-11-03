const http = require('http');

function makeRequest(path, method, body) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(body);
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('==============================================');
  console.log('LIVE HTTP VALIDATION & SECURITY TEST');
  console.log('==============================================\n');

  // 1. Test QA Invalid Quotation Form Payload
  console.log('--- 1. Testing QA Invalid Quotation Form Payload ---');
  const invalidQuotePayload = {
    companyName: '===========',
    contactName: '))))))))))))))))))))',
    email: '!#$%@jk',
    phone: 'abc'
  };
  const res1 = await makeRequest('/api/public/quotes', 'POST', invalidQuotePayload);
  console.log('Status Code:', res1.status, '(Expected 400)');
  console.log('Response Body:', JSON.stringify(res1.body, null, 2));

  // 2. Test QA Invalid Freight Consultation Payload
  console.log('\n--- 2. Testing QA Invalid Consultation Form Payload ---');
  const invalidConsultPayload = {
    companyName: '#%$$',
    contactPerson: '+_)))',
    workEmail: '#$%%@L.9b',
    phone: '12345'
  };
  const res2 = await makeRequest('/api/public/inquiries', 'POST', invalidConsultPayload);
  console.log('Status Code:', res2.status, '(Expected 400)');
  console.log('Response Body:', JSON.stringify(res2.body, null, 2));

  // 3. Test Legitimate Valid Quotation Request
  console.log('\n--- 3. Testing Legitimate Valid Quotation Request ---');
  const validQuotePayload = {
    companyName: 'PrimeRoute Logistics Pvt. Ltd.',
    contactName: 'Shruti Sanjana Sahoo',
    email: 'qa.inquiry@primeroute.test',
    phone: '9876543210',
    origin: 'Bengaluru Hub',
    destination: 'Mumbai DC',
    serviceType: 'Road Freight (FTL)',
    weight: 3500.0,
    message: 'Pallet count: 10; temperature control required.'
  };
  const res3 = await makeRequest('/api/public/quotes', 'POST', validQuotePayload);
  console.log('Status Code:', res3.status, '(Expected 201)');
  console.log('Response Body:', JSON.stringify(res3.body, null, 2));

  // 4. Test Legitimate Valid Consultation Request
  console.log('\n--- 4. Testing Legitimate Valid Consultation Request ---');
  const validConsultPayload = {
    companyName: 'ABC & Sons Logistics',
    fullName: 'Ramesh Kumar',
    email: 'ramesh@abclogistics.in',
    phone: '+91 98765 43210',
    origin: 'Kolkata Eastern Corridor Hub',
    destination: 'Delhi Terminal',
    serviceRequired: 'Part Load (LTL)',
    message: 'Monthly recurring freight consultation.'
  };
  const res4 = await makeRequest('/api/public/inquiries', 'POST', validConsultPayload);
  console.log('Status Code:', res4.status, '(Expected 201)');
  console.log('Response Body:', JSON.stringify(res4.body, null, 2));
}

runTests().catch(console.error);
