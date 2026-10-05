async function testSecurity() {
    console.log('Testing security boundary...');
    const BASE_URL = 'http://localhost:8080/api';

    // Log in as Customer
    const custLoginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'shrutisanjanasahoo@gmail.com', password: 'Shruti@1234!' })
    });
    const custToken = (await custLoginRes.json()).token;

    // Try to download an invoice belonging to another customer (e.g. invoice 1 or another customer's order)
    const unauthorizedPdfRes = await fetch(`${BASE_URL}/customer/invoices/1/download`, {
        headers: { 'Authorization': `Bearer ${custToken}` }
    });
    console.log('Accessing unowned invoice returns HTTP status:', unauthorizedPdfRes.status);
    if (unauthorizedPdfRes.status === 403 || unauthorizedPdfRes.status === 404) {
        console.log('✓ Security enforced: Customer cannot access unauthorized invoices.');
    } else {
        console.log('WARNING: unexpected status:', unauthorizedPdfRes.status);
    }
}

testSecurity().catch(console.error);
