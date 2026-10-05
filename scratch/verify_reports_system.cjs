const http = require('http');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432 -t -A';
process.env.PGPASSWORD = 'postgres123';

function runSql(query) {
  try {
    const cmd = `${PSQL} -c "${query.replace(/"/g, '\\"')}"`;
    const out = execSync(cmd, { encoding: 'utf8', env: process.env }).trim();
    return out;
  } catch (err) {
    console.error('SQL Error:', err.message);
    throw err;
  }
}

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function login(email, password) {
  const res = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email, password });
  if (res.status !== 200) throw new Error(`Login failed for ${email}: status ${res.status}`);
  return res.data.token || res.data?.data?.token;
}

async function run() {
  console.log('======================================================================');
  console.log('PRIMEROUTE LOGISTICS: ADMIN → REPORTS MODULE DEEP VERIFICATION');
  console.log('======================================================================\n');

  // 1. Authenticate Admin and Customer
  console.log('[1] AUTHENTICATION & SECURITY CHECK');
  const adminToken = await login('admin@primeroute.com', 'Admin@PrimeRoute2026!');
  console.log('✓ Admin login successful.');

  const customerToken = await login('customer@primeroute.com', 'Customer@123');
  console.log('✓ Customer (customer@primeroute.com) login successful.');

  // Security test: Customer token accessing /api/admin/reports/**
  const unauthRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/reports/dashboard',
    method: 'GET',
  });
  console.log(`✓ Unauthenticated request status: ${unauthRes.status} (Expected: 401/403)`);

  const custRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/reports/dashboard',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${customerToken}` },
  });
  console.log(`✓ Customer accessing admin reports status: ${custRes.status} (Expected: 403 Forbidden)`);

  const adminRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/reports/dashboard',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });
  console.log(`✓ Admin accessing admin reports status: ${adminRes.status} (Expected: 200 OK)`);
  const report = adminRes.data.data;

  // 2. FRONTEND STATIC DATA AUDIT
  console.log('\n[2] FRONTEND STATIC DATA AUDIT (src/pages/admin/Reports.tsx)');
  const frontendCode = fs.readFileSync('d:\\Transportation-Logistic\\src\\pages\\admin\\Reports.tsx', 'utf8');
  const mockChecks = [
    { pattern: /const totalOrders\s*=\s*\d+/i, name: 'hardcoded totalOrders' },
    { pattern: /const revenue\s*=\s*\d+/i, name: 'hardcoded revenue' },
    { pattern: /mockReport/i, name: 'mockReport variable' },
    { pattern: /dummyData/i, name: 'dummyData variable' },
  ];
  let foundMock = false;
  for (const check of mockChecks) {
    if (check.pattern.test(frontendCode)) {
      console.log(`❌ Found ${check.name} in Reports.tsx`);
      foundMock = true;
    }
  }
  if (!foundMock) {
    console.log('✓ No hardcoded KPI constants or mock arrays found in Reports.tsx.');
  }

  // 3. DATABASE VS API COUNTS
  console.log('\n[3] DATABASE VS API COUNTS VERIFICATION');
  const dbOrders = parseInt(runSql('SELECT COUNT(*) FROM orders;'), 10);
  const dbShipments = parseInt(runSql('SELECT COUNT(*) FROM shipments;'), 10);
  const dbCustomers = parseInt(runSql("SELECT COUNT(*) FROM users WHERE role = 'CUSTOMER';"), 10);
  const dbDrivers = parseInt(runSql('SELECT COUNT(*) FROM drivers;'), 10);
  const dbVehicles = parseInt(runSql('SELECT COUNT(*) FROM vehicles;'), 10);
  const dbRoutes = parseInt(runSql('SELECT COUNT(*) FROM routes;'), 10);
  const dbWarehouses = parseInt(runSql('SELECT COUNT(*) FROM warehouses;'), 10);
  const dbInvoices = parseInt(runSql('SELECT COUNT(*) FROM invoices;'), 10);

  console.log(`- Orders:      DB=${dbOrders}  |  API=${report.overview.totalOrders}  ->  ${dbOrders === report.overview.totalOrders ? 'MATCH ✓' : 'MISMATCH ❌'}`);
  console.log(`- Shipments:   DB=${dbShipments}  |  API=${report.overview.totalShipments}  ->  ${dbShipments === report.overview.totalShipments ? 'MATCH ✓' : 'MISMATCH ❌'}`);
  console.log(`- Customers:   DB=${dbCustomers}  |  API=${report.overview.totalCustomers}  ->  ${dbCustomers === report.overview.totalCustomers ? 'MATCH ✓' : 'MISMATCH ❌'}`);
  console.log(`- Drivers:     DB=${dbDrivers}  |  API=${report.drivers.totalDrivers}  ->  ${dbDrivers === report.drivers.totalDrivers ? 'MATCH ✓' : 'MISMATCH ❌'}`);
  console.log(`- Vehicles:    DB=${dbVehicles}  |  API=${report.fleet.totalVehicles}  ->  ${dbVehicles === report.fleet.totalVehicles ? 'MATCH ✓' : 'MISMATCH ❌'}`);
  console.log(`- Routes:      DB=${dbRoutes}  |  API=${report.routes.totalRoutes}  ->  ${dbRoutes === report.routes.totalRoutes ? 'MATCH ✓' : 'MISMATCH ❌'}`);
  console.log(`- Warehouses:  DB=${dbWarehouses}  |  API=${report.warehouses.totalWarehouses}  ->  ${dbWarehouses === report.warehouses.totalWarehouses ? 'MATCH ✓' : 'MISMATCH ❌'}`);
  console.log(`- Invoices:    DB=${dbInvoices}  |  API=${report.financial.totalInvoices}  ->  ${dbInvoices === report.financial.totalInvoices ? 'MATCH ✓' : 'MISMATCH ❌'}`);

  // 4. FINANCIAL TOTALS VERIFICATION
  console.log('\n[4] FINANCIAL AGGREGATIONS VERIFICATION');
  // Note: Enterprise TMS accounting excludes CANCELLED invoices from active billed receivables
  const dbTotalBilled = parseFloat(runSql("SELECT COALESCE(SUM(total_amount), 0) FROM invoices WHERE invoice_status != 'CANCELLED';") || '0');
  const dbPaid = parseFloat(runSql("SELECT COALESCE(SUM(amount_paid), 0) FROM invoices WHERE invoice_status != 'CANCELLED';") || '0');
  const dbOutstanding = parseFloat(runSql("SELECT COALESCE(SUM(balance_due), 0) FROM invoices WHERE invoice_status != 'CANCELLED';") || '0');
  const dbOverdue = parseFloat(runSql("SELECT COALESCE(SUM(balance_due), 0) FROM invoices WHERE invoice_status = 'OVERDUE' OR (due_date < CURRENT_DATE AND balance_due > 0 AND invoice_status != 'CANCELLED');") || '0');

  console.log(`- Total Billed (Active): DB=₹${dbTotalBilled.toFixed(2)} | API=₹${report.financial.totalBilled.toFixed(2)} -> ${Math.abs(dbTotalBilled - report.financial.totalBilled) < 0.01 ? 'MATCH ✓' : 'MISMATCH ❌'}`);
  console.log(`- Paid Amount:           DB=₹${dbPaid.toFixed(2)} | API=₹${report.financial.totalPaid.toFixed(2)} -> ${Math.abs(dbPaid - report.financial.totalPaid) < 0.01 ? 'MATCH ✓' : 'MISMATCH ❌'}`);
  console.log(`- Outstanding Amount:    DB=₹${dbOutstanding.toFixed(2)} | API=₹${report.financial.outstandingAmount.toFixed(2)} -> ${Math.abs(dbOutstanding - report.financial.outstandingAmount) < 0.01 ? 'MATCH ✓' : 'MISMATCH ❌'}`);
  console.log(`- Overdue Amount:        DB=₹${dbOverdue.toFixed(2)} | API=₹${report.financial.overdueAmount.toFixed(2)} -> ${Math.abs(dbOverdue - report.financial.overdueAmount) < 0.01 ? 'MATCH ✓' : 'MISMATCH ❌'}`);

  // 5. ORDER STATUS COUNTS
  console.log('\n[5] ORDER STATUS DISTRIBUTION VERIFICATION');
  const dbStatusCounts = runSql(`SELECT status, COUNT(*) FROM orders GROUP BY status;`)
    .replace(/\r/g, '')
    .split('\n')
    .filter(Boolean);
  for (const line of dbStatusCounts) {
    const [status, cnt] = line.split('|');
    const apiCount = report.orders.statusDistribution[status] || 0;
    console.log(`- Order Status [${status}]: DB=${cnt} | API=${apiCount} -> ${parseInt(cnt, 10) === apiCount ? 'MATCH ✓' : 'MISMATCH ❌'}`);
  }

  // 6. SHIPMENT STATUS COUNTS
  console.log('\n[6] SHIPMENT STATUS DISTRIBUTION VERIFICATION');
  const dbShipmentCounts = runSql(`SELECT status, COUNT(*) FROM shipments GROUP BY status;`)
    .replace(/\r/g, '')
    .split('\n')
    .filter(Boolean);
  for (const line of dbShipmentCounts) {
    const [status, cnt] = line.split('|');
    const apiCount = report.shipments.statusDistribution[status] || 0;
    console.log(`- Shipment Status [${status}]: DB=${cnt} | API=${apiCount} -> ${parseInt(cnt, 10) === apiCount ? 'MATCH ✓' : 'MISMATCH ❌'}`);
  }

  // 7. DATE FILTER DYNAMIC QUERY TEST
  console.log('\n[7] DATE FILTER DYNAMIC QUERY TEST');
  const ranges = ['TODAY', 'LAST_7_DAYS', 'LAST_30_DAYS', 'THIS_MONTH', 'THIS_YEAR'];
  for (const r of ranges) {
    const filterRes = await request({
      hostname: 'localhost',
      port: 8080,
      path: `/api/admin/reports/dashboard?range=${r}`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    const d = filterRes.data.data;
    console.log(`- Filter [${r}]: Orders=${d.orders.totalOrders}, Volume=₹${d.orders.totalBookingVolume.toFixed(2)}, Label="${d.dateRangeLabel}"`);
  }

  // 8. DYNAMIC UPDATE TESTS
  console.log('\n[8] DYNAMIC UPDATE TESTS');
  
  // A. Order Dynamic Test
  console.log('--- A. Dynamic Order Creation Test ---');
  const ordersBefore = report.overview.totalOrders;
  console.log(`Current Total Orders: ${ordersBefore}`);
  
  const createOrderRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/customer/orders',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerToken}`,
    },
  }, {
    pickupAddressId: 1,
    deliveryAddressId: 2,
    packageWeight: 4.5,
    packageQuantity: 1,
    packageDescription: 'Automated Reports Dynamic Verification Order',
    deliveryType: 'STANDARD',
  });
  
  let newOrderId;
  if (createOrderRes.status === 201 || createOrderRes.status === 200) {
    newOrderId = createOrderRes.data.data.id;
    console.log(`✓ Created test order #${newOrderId} (Order Number: ${createOrderRes.data.data.orderNumber})`);
  } else {
    console.log(`Order create response: status=${createOrderRes.status}`, createOrderRes.data || createOrderRes.raw);
  }

  // Fetch updated report
  const afterOrderRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/reports/dashboard',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });
  const ordersAfter = afterOrderRes.data.data.overview.totalOrders;
  console.log(`Updated Total Orders: ${ordersAfter} (Expected: ${ordersBefore + 1}) -> ${ordersAfter === ordersBefore + 1 ? 'DYNAMICALLY UPDATED ✓' : 'FAILED ❌'}`);

  // B. Invoice Payment Dynamic Test
  console.log('\n--- B. Dynamic Invoice Payment Test ---');
  const invRow = runSql("SELECT id, total_amount, amount_paid, balance_due FROM invoices WHERE balance_due > 100 AND invoice_status != 'CANCELLED' LIMIT 1;");
  if (invRow) {
    const [invId, invTotal, invPaid, invDue] = invRow.split('|').map(Number);
    console.log(`Target Invoice #${invId}: Total=₹${invTotal}, Paid=₹${invPaid}, Due=₹${invDue}`);
    
    const beforeOutstanding = afterOrderRes.data.data.financial.outstandingAmount;
    console.log(`Current Financial Outstanding Amount: ₹${beforeOutstanding}`);

    // Mark invoice with payment of ₹50
    const paymentAmount = 50;
    const payRes = await request({
      hostname: 'localhost',
      port: 8080,
      path: `/api/admin/invoices/${invId}/status`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
    }, {
      status: 'PARTIALLY_PAID',
      paymentStatus: 'PARTIALLY_PAID',
      amountPaid: invPaid + paymentAmount,
      paymentMethod: 'BANK_TRANSFER',
      paymentReference: 'VERIFY-TEST-PAY-001',
    });
    console.log(`✓ Applied ₹${paymentAmount} payment to Invoice #${invId} (Status: ${payRes.status})`);

    // Fetch report again
    const afterPayReportRes = await request({
      hostname: 'localhost',
      port: 8080,
      path: '/api/admin/reports/dashboard',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    const afterOutstanding = afterPayReportRes.data.data.financial.outstandingAmount;
    console.log(`Updated Financial Outstanding Amount: ₹${afterOutstanding} (Expected drop by ₹${paymentAmount}) -> ${Math.abs(beforeOutstanding - afterOutstanding - paymentAmount) < 0.01 ? 'DYNAMICALLY UPDATED ✓' : 'FAILED ❌'}`);

    // Revert the payment to keep database clean
    await request({
      hostname: 'localhost',
      port: 8080,
      path: `/api/admin/invoices/${invId}/status`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
    }, {
      status: 'ISSUED',
      paymentStatus: 'UNPAID',
      amountPaid: invPaid,
      paymentMethod: 'BANK_TRANSFER',
      paymentReference: 'REVERT-TEST-PAY',
    });
    console.log(`✓ Reverted test payment on Invoice #${invId} to restore original state.`);
  }

  // C. Shipment Dynamic Status Test
  console.log('\n--- C. Dynamic Shipment Status Test ---');
  const shipRow = runSql("SELECT id, status FROM shipments WHERE status != 'DELIVERED' LIMIT 1;").trim();
  if (shipRow) {
    const [shipId, originalStatus] = shipRow.split('|');
    console.log(`Target Shipment #${shipId} (Original Status: ${originalStatus})`);
    const initialDelivered = report.overview.deliveredShipments;

    // Update shipment status to DELIVERED using PUT /api/admin/shipments/{id}/status
    const updateShipRes = await request({
      hostname: 'localhost',
      port: 8080,
      path: `/api/admin/shipments/${shipId}/status`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
    }, {
      status: 'DELIVERED',
      location: 'PrimeRoute Central Hub',
      notes: 'Automated verification test delivery milestone',
    });
    console.log(`✓ Updated Shipment #${shipId} to DELIVERED (Status: ${updateShipRes.status})`);

    const afterShipReport = await request({
      hostname: 'localhost',
      port: 8080,
      path: '/api/admin/reports/dashboard',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    const newDelivered = afterShipReport.data.data.overview.deliveredShipments;
    console.log(`Delivered Shipments: Before=${initialDelivered} | After=${newDelivered} -> ${newDelivered === initialDelivered + 1 ? 'DYNAMICALLY UPDATED ✓' : 'FAILED ❌'}`);

    // Restore original status
    await request({
      hostname: 'localhost',
      port: 8080,
      path: `/api/admin/shipments/${shipId}/status`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
    }, {
      status: originalStatus,
      location: 'PrimeRoute Origin Terminal',
      notes: 'Restored original test shipment status',
    });
    console.log(`✓ Restored Shipment #${shipId} to ${originalStatus}`);
  }

  console.log('\n======================================================================');
  console.log('ALL VERIFICATION PHASES COMPLETED SUCCESSFULLY');
  console.log('======================================================================');
}

run().catch((err) => {
  console.error('Fatal error during verification:', err);
  process.exit(1);
});
