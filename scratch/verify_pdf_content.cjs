const fs = require('fs');

async function testPdf() {
    const BASE_URL = 'http://localhost:8080/api';
    const custLoginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'shrutisanjanasahoo@gmail.com', password: 'Shruti@1234!' })
    });
    const custLoginData = await custLoginRes.json();
    const token = custLoginData.token;

    const pdfRes = await fetch(`${BASE_URL}/customer/invoices/INV-PR-ORD-30750634/download`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const buf = Buffer.from(await pdfRes.arrayBuffer());
    fs.writeFileSync('scratch/test_exact_invoice_card.pdf', buf);
    console.log('Saved scratch/test_exact_invoice_card.pdf (' + buf.length + ' bytes)');
    const pdfStr = buf.toString('latin1');
    console.log('Contains PAYMENT INFORMATION:', pdfStr.includes('PAYMENT INFORMATION'));
    console.log('Contains Credit / Debit Card:', pdfStr.includes('Credit / Debit Card'));
    console.log('Contains UNPAID:', pdfStr.includes('UNPAID'));
    console.log('Contains PAID:', pdfStr.includes('PAID'));
}

testPdf().catch(console.error);
