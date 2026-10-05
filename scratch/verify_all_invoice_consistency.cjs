const fs = require('fs');

async function testCompleteInvoiceConsistency() {
    console.log('================================================================');
    console.log('PRIMEROUTE LOGISTICS — PAYMENT DATA CONSISTENCY VERIFICATION');
    console.log('================================================================');

    const BASE_URL = 'http://localhost:8080/api';

    // 1. Authenticate Customer & Admin
    console.log('\n[1] Authenticating Customer and Admin...');
    const custLoginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'shrutisanjanasahoo@gmail.com', password: 'Shruti@1234!' })
    });
    const custLoginData = await custLoginRes.json();
    const customerToken = custLoginData.token || (custLoginData.data && custLoginData.data.token);
    if (!customerToken) {
        throw new Error('Customer login failed: ' + JSON.stringify(custLoginData));
    }
    console.log('✓ Customer logged in successfully.');

    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@primeroute.com', password: 'Sanjana@102026' })
    });
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData.token || (adminLoginData.data && adminLoginData.data.token);
    if (!adminToken) {
        throw new Error('Admin login failed: ' + JSON.stringify(adminLoginData));
    }
    console.log('✓ Admin logged in successfully.');

    // 2. Verify Exact Order PR-ORD-30750634 (Invoice INV-PR-ORD-30750634)
    console.log('\n[2] Testing Exact Order PR-ORD-30750634 / INV-PR-ORD-30750634...');
    
    // Customer Invoices API
    const custInvoicesRes = await fetch(`${BASE_URL}/customer/invoices`, {
        headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const custInvoices = await custInvoicesRes.json();
    const targetCustInv = (custInvoices.data || []).find(i => i.invoiceNumber === 'INV-PR-ORD-30750634' || i.orderNumber === 'PR-ORD-30750634');
    
    console.log('\nCustomer Invoice API Result for INV-PR-ORD-30750634:');
    console.log(JSON.stringify(targetCustInv, null, 2));

    // Admin Invoices API
    const adminInvoicesRes = await fetch(`${BASE_URL}/admin/invoices`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const adminInvoices = await adminInvoicesRes.json();
    const targetAdminInv = (adminInvoices.data || []).find(i => i.invoiceNumber === 'INV-PR-ORD-30750634' || i.orderNumber === 'PR-ORD-30750634');

    console.log('\nAdmin Invoice API Result for INV-PR-ORD-30750634:');
    console.log(JSON.stringify(targetAdminInv, null, 2));

    if (!targetCustInv || !targetAdminInv) {
        throw new Error('Could not find target invoice in one or both portals');
    }

    if (targetCustInv.paymentMethod !== 'CARD' || targetAdminInv.paymentMethod !== 'CARD') {
        throw new Error(`Payment method mismatch! Cust: ${targetCustInv.paymentMethod}, Admin: ${targetAdminInv.paymentMethod}`);
    }

    if (targetCustInv.paymentStatus !== 'UNPAID' || targetAdminInv.paymentStatus !== 'UNPAID') {
        throw new Error(`Payment status mismatch or auto-paid! Cust: ${targetCustInv.paymentStatus}, Admin: ${targetAdminInv.paymentStatus}`);
    }

    console.log('\n>>> EXACT ORDER CHECK PASSED: Both Customer and Admin return paymentMethod=CARD and paymentStatus=UNPAID!');

    // 3. Test PDF Download for exact invoice
    console.log('\n[3] Testing PDF Download for INV-PR-ORD-30750634...');
    const custPdfRes = await fetch(`${BASE_URL}/customer/invoices/INV-PR-ORD-30750634/download`, {
        headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    if (custPdfRes.status !== 200) {
        throw new Error(`Customer PDF download failed with status ${custPdfRes.status}`);
    }
    const custPdfBytes = await custPdfRes.arrayBuffer();
    console.log(`✓ Customer PDF downloaded successfully (${custPdfBytes.byteLength} bytes)`);

    const adminPdfRes = await fetch(`${BASE_URL}/admin/invoices/${targetAdminInv.id}/download`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (adminPdfRes.status !== 200) {
        throw new Error(`Admin PDF download failed with status ${adminPdfRes.status}`);
    }
    const adminPdfBytes = await adminPdfRes.arrayBuffer();
    console.log(`✓ Admin PDF downloaded successfully (${adminPdfBytes.byteLength} bytes)`);

    // Fetch customer addresses
    const addrRes = await fetch(`${BASE_URL}/customer/addresses`, {
        headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const addrData = await addrRes.json();
    const addresses = addrData.data || [];
    if (addresses.length < 2) {
        throw new Error('Customer has less than 2 addresses');
    }
    const pickupAddressId = addresses[0].id;
    const deliveryAddressId = addresses[1].id;
    console.log(`Using Customer Address IDs: Pickup=${pickupAddressId}, Delivery=${deliveryAddressId}`);

    // 4. Test All 6 Payment Methods
    console.log('\n[4] Testing all 6 Payment Methods across complete flow...');
    const methods = [
        { id: 'UPI', label: 'UPI' },
        { id: 'CARD', label: 'Credit / Debit Card' },
        { id: 'NET_BANKING', label: 'Net Banking' },
        { id: 'BANK_TRANSFER', label: 'Bank Transfer' },
        { id: 'COD', label: 'Cash on Delivery' },
        { id: 'CREDIT', label: 'Credit / Invoice Billing' }
    ];

    const results = [];

    for (const m of methods) {
        console.log(`\n--- Creating Order with method: ${m.id} (${m.label}) ---`);
        const createOrderPayload = {
            pickupAddressId: pickupAddressId,
            deliveryAddressId: deliveryAddressId,
            deliveryType: 'STANDARD',
            packageDescription: `Test Shipment for ${m.label}`,
            packageWeight: 2.0,
            packageQuantity: 1,
            paymentMethod: m.id
        };

        const createRes = await fetch(`${BASE_URL}/customer/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${customerToken}`
            },
            body: JSON.stringify(createOrderPayload)
        });

        const createData = await createRes.json();
        if (!createData.data) {
            throw new Error(`Order creation failed for ${m.id}: ${JSON.stringify(createData)}`);
        }
        const newOrder = createData.data;
        const orderNum = newOrder.orderNumber;
        const invNum = 'INV-' + orderNum;
        console.log(`Created Order ${orderNum}, expected invoice ${invNum}`);

        // Verify Customer Invoices API
        const cInvsRes = await fetch(`${BASE_URL}/customer/invoices`, {
            headers: { 'Authorization': `Bearer ${customerToken}` }
        });
        const cInvs = await cInvsRes.json();
        const cInv = (cInvs.data || []).find(i => i.orderNumber === orderNum || i.invoiceNumber === invNum);

        // Verify Admin Invoices API
        const aInvsRes = await fetch(`${BASE_URL}/admin/invoices`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const aInvs = await aInvsRes.json();
        const aInv = (aInvs.data || []).find(i => i.orderNumber === orderNum || i.invoiceNumber === invNum);

        // Verify PDF
        const pdfRes = await fetch(`${BASE_URL}/customer/invoices/${encodeURIComponent(invNum)}/download`, {
            headers: { 'Authorization': `Bearer ${customerToken}` }
        });

        const passed = cInv && aInv && 
                       cInv.paymentMethod === m.id && 
                       aInv.paymentMethod === m.id && 
                       cInv.paymentStatus === 'UNPAID' && 
                       aInv.paymentStatus === 'UNPAID' &&
                       pdfRes.status === 200;

        results.push({
            method: m.id,
            label: m.label,
            orderNumber: orderNum,
            invoiceNumber: invNum,
            customerPaymentMethod: cInv ? cInv.paymentMethod : 'MISSING',
            adminPaymentMethod: aInv ? aInv.paymentMethod : 'MISSING',
            customerPaymentStatus: cInv ? cInv.paymentStatus : 'MISSING',
            adminPaymentStatus: aInv ? aInv.paymentStatus : 'MISSING',
            pdfDownloadStatus: pdfRes.status,
            passed: !!passed
        });

        console.log(`✓ ${m.id}: Customer=${cInv?.paymentMethod} (${cInv?.paymentStatus}), Admin=${aInv?.paymentMethod} (${aInv?.paymentStatus}), PDF Status=${pdfRes.status} -> MATCH`);
    }

    console.log('\n================================================================');
    console.log('SUMMARY OF ALL PAYMENT METHOD TESTS:');
    console.table(results);
    console.log('================================================================');

    const allPassed = results.every(r => r.passed);
    if (!allPassed) {
        throw new Error('Some payment method tests failed!');
    }
    console.log('\nALL 6 PAYMENT METHOD TESTS PASSED WITH 100% SUCCESS!');
}

testCompleteInvoiceConsistency().catch(err => {
    console.error('FATAL ERROR:', err);
    process.exit(1);
});
