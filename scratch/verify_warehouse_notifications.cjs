const http = require('http');
const { execSync } = require('child_process');

const BASE_URL = 'http://localhost:8080';

function runSql(query) {
  try {
    const singleLine = query.replace(/"/g, '`"').replace(/\r?\n/g, ' ');
    const cmd = `powershell -Command "$env:PGPASSWORD='postgres123'; & 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' -U postgres -d primeroute_db -h localhost -p 5432 -c \\"${singleLine}\\" -t -A"`;
    return execSync(cmd, { encoding: 'utf8' }).trim();
  } catch (e) {
    console.error('SQL Execution Error:', e.message);
    return null;
  }
}

function request(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });

    req.on('error', (e) => reject(e));

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function login(email, password) {
  const res = await request('POST', '/api/auth/login', {}, { email, password });
  const token = res.body?.token || res.body?.data?.token;
  if (res.status === 200 && token) {
    return token;
  }
  throw new Error(`Login failed for ${email}: status ${res.status} ${JSON.stringify(res.body)}`);
}

async function main() {
  console.log('=== STARTING WAREHOUSE MANAGER NOTIFICATION E2E TEST ===');

  // Find warehouse managers in DB
  const managerAEmail = 'priya@primeroute.com';
  const managerBEmail = 'ccu.east@primeroute.com';
  const customerEmail = 'shrutisanjanasahoo@gmail.com';
  const driverEmail = 'ramesh@primeroute.com';

  const managerAId = runSql(`SELECT id FROM users WHERE email = '${managerAEmail}';`);
  const managerBId = runSql(`SELECT id FROM users WHERE email = '${managerBEmail}';`);
  console.log(`Manager A (${managerAEmail}) user_id:`, managerAId);
  console.log(`Manager B (${managerBEmail}) user_id:`, managerBId);

  // Clean previous test alerts and insert fresh ones
  runSql(`DELETE FROM notifications WHERE title LIKE 'TEST_WM_%';`);
  runSql(`
    INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
    VALUES 
      (${managerAId}, 'TEST_WM_1', 'Inbound inventory alert', 'WARNING', false, NOW() - INTERVAL '10 minutes'),
      (${managerAId}, 'TEST_WM_2', 'Dock 3 scheduled for dispatch', 'INFO', false, NOW() - INTERVAL '5 minutes'),
      (${managerAId}, 'TEST_WM_3', 'Safety inspection checklist pending', 'ALERT', false, NOW());
  `);
  if (managerBId) {
    runSql(`
      INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
      VALUES (${managerBId}, 'TEST_WM_B_SECRET', 'Audit report for Kolkata warehouse', 'INFO', false, NOW());
    `);
  }

  // 1. Authenticate Users
  console.log('\n--- 1. Authenticating Users via JWT ---');
  const tokenA = await login(managerAEmail, 'Manager@2026!');
  console.log(`Manager A token acquired.`);

  let tokenB = null;
  if (managerBId) {
    tokenB = await login(managerBEmail, 'Manager@2026!');
    console.log(`Manager B token acquired.`);
  }

  const tokenCust = await login(customerEmail, 'Driver@2026!');
  console.log(`Customer token acquired.`);

  const tokenDriver = await login(driverEmail, 'Driver@2026!');
  console.log(`Driver token acquired.`);

  // 2. GET /api/warehouse-manager/notifications
  console.log('\n--- 2. GET /api/warehouse-manager/notifications ---');
  const getRes = await request('GET', '/api/warehouse-manager/notifications', {
    Authorization: `Bearer ${tokenA}`,
  });
  console.log('Status:', getRes.status);
  console.log('Notification count for Manager A:', getRes.body.data?.length);
  console.log('First notification:', getRes.body.data?.[0]);

  if (getRes.status !== 200 || !Array.isArray(getRes.body.data) || getRes.body.data.length === 0) {
    throw new Error('GET notifications failed or returned empty array!');
  }

  // Verify all notifications have numeric IDs
  for (const n of getRes.body.data) {
    if (typeof n.id !== 'number') {
      throw new Error(`Notification ID is not numeric: ${n.id} (${typeof n.id})`);
    }
  }

  const notif1 = getRes.body.data[0];
  const notif2 = getRes.body.data[1];

  // 3. GET /api/warehouse-manager/notifications/unread-count
  console.log('\n--- 3. GET /api/warehouse-manager/notifications/unread-count ---');
  const unreadRes = await request('GET', '/api/warehouse-manager/notifications/unread-count', {
    Authorization: `Bearer ${tokenA}`,
  });
  const unreadCountVal = unreadRes.body?.data?.unreadCount ?? unreadRes.body?.unreadCount ?? unreadRes.body?.data;
  console.log('Status:', unreadRes.status, 'Unread Count:', unreadCountVal);
  if (unreadRes.status !== 200 || typeof unreadCountVal !== 'number') {
    throw new Error('Unread count endpoint failed!');
  }

  // 4. PATCH /api/warehouse-manager/notifications/{id}/read
  console.log(`\n--- 4. PATCH /api/warehouse-manager/notifications/${notif1.id}/read ---`);
  const patchSingle = await request('PATCH', `/api/warehouse-manager/notifications/${notif1.id}/read`, {
    Authorization: `Bearer ${tokenA}`,
  });
  console.log('Patch Single Status:', patchSingle.status, 'Body:', patchSingle.body);
  if (patchSingle.status !== 200 || !patchSingle.body.success) {
    throw new Error('PATCH single notification read failed!');
  }

  // Check DB state
  const isReadDb = runSql(`SELECT is_read FROM notifications WHERE id = ${notif1.id};`);
  console.log(`Database is_read for ID ${notif1.id}:`, isReadDb);
  if (isReadDb !== 't' && isReadDb !== 'true') {
    throw new Error('Database is_read was not persisted as true!');
  }

  // 5. PATCH /api/warehouse-manager/notifications/read-all
  console.log('\n--- 5. PATCH /api/warehouse-manager/notifications/read-all ---');
  const readAllRes = await request('PATCH', '/api/warehouse-manager/notifications/read-all', {
    Authorization: `Bearer ${tokenA}`,
  });
  console.log('Read All Status:', readAllRes.status, 'Body:', readAllRes.body);
  if (readAllRes.status !== 200 || !readAllRes.body.success) {
    throw new Error('PATCH read-all failed!');
  }

  // Verify unread count is now 0
  const unreadAfter = await request('GET', '/api/warehouse-manager/notifications/unread-count', {
    Authorization: `Bearer ${tokenA}`,
  });
  const unreadCountAfter = unreadAfter.body?.data?.unreadCount ?? unreadAfter.body?.unreadCount ?? unreadAfter.body?.data;
  console.log('Unread Count after read-all:', unreadCountAfter);
  if (unreadCountAfter !== 0) {
    throw new Error(`Expected unread count to be 0, but got ${unreadCountAfter}`);
  }

  // 6. DELETE /api/warehouse-manager/notifications/{id}
  console.log(`\n--- 6. DELETE /api/warehouse-manager/notifications/${notif1.id} ---`);
  const delRes = await request('DELETE', `/api/warehouse-manager/notifications/${notif1.id}`, {
    Authorization: `Bearer ${tokenA}`,
  });
  console.log('Delete Status:', delRes.status, 'Body:', delRes.body);
  if (delRes.status !== 200 || !delRes.body.success) {
    throw new Error('DELETE notification failed!');
  }

  // Check DB state
  const checkDelDb = runSql(`SELECT count(*) FROM notifications WHERE id = ${notif1.id};`);
  console.log(`Database count for deleted ID ${notif1.id}:`, checkDelDb);
  if (checkDelDb !== '0') {
    throw new Error('Notification was not removed from PostgreSQL database!');
  }

  // 7. Test 404 for non-existent notification ID
  console.log('\n--- 7. DELETE non-existent notification (ID 99999999) -> Expect 404 ---');
  const del404 = await request('DELETE', '/api/warehouse-manager/notifications/99999999', {
    Authorization: `Bearer ${tokenA}`,
  });
  console.log('Status (expect 404):', del404.status);
  if (del404.status !== 404) {
    throw new Error(`Expected 404 for non-existent ID, got ${del404.status}`);
  }

  // 8. Test 404 for non-numeric/mock notification string ID (LOW-10)
  console.log('\n--- 8. DELETE invalid string ID "LOW-10" -> Expect 404 ---');
  const delLow10 = await request('DELETE', '/api/warehouse-manager/notifications/LOW-10', {
    Authorization: `Bearer ${tokenA}`,
  });
  console.log('Status (expect 404):', delLow10.status);
  if (delLow10.status !== 404) {
    throw new Error(`Expected 404 for invalid string ID "LOW-10", got ${delLow10.status}`);
  }

  // 9. Security Isolation between Warehouse Managers
  if (tokenB) {
    console.log('\n--- 9. Security: Cross-Manager Isolation ---');
    const bNotifs = await request('GET', '/api/warehouse-manager/notifications', {
      Authorization: `Bearer ${tokenB}`,
    });
    console.log('Manager B notifications count:', bNotifs.body.data?.length);
    if (bNotifs.body.data?.length > 0) {
      const bId = bNotifs.body.data[0].id;
      // Manager A attempts to delete Manager B's notification
      const crossDel = await request('DELETE', `/api/warehouse-manager/notifications/${bId}`, {
        Authorization: `Bearer ${tokenA}`,
      });
      console.log(`Manager A deleting Manager B's notif ${bId}: Status = ${crossDel.status} (Expected 403)`);
      if (crossDel.status !== 403) {
        throw new Error(`Expected 403 when Manager A deletes Manager B's notification, got ${crossDel.status}`);
      }

      // Manager A attempts to mark read Manager B's notification
      const crossRead = await request('PATCH', `/api/warehouse-manager/notifications/${bId}/read`, {
        Authorization: `Bearer ${tokenA}`,
      });
      console.log(`Manager A reading Manager B's notif ${bId}: Status = ${crossRead.status} (Expected 403)`);
      if (crossRead.status !== 403) {
        throw new Error(`Expected 403 when Manager A marks read Manager B's notification, got ${crossRead.status}`);
      }
    }
  }

  // 10. Role Security: Customer calling Warehouse Manager notifications -> 403
  console.log('\n--- 10. Role Security: Customer calling Warehouse notifications -> Expect 403 ---');
  const custWhRes = await request('GET', '/api/warehouse-manager/notifications', {
    Authorization: `Bearer ${tokenCust}`,
  });
  console.log('Customer accessing WH notifications status (expect 403):', custWhRes.status);
  if (custWhRes.status !== 403) {
    throw new Error(`Expected 403 for customer accessing WH notifications, got ${custWhRes.status}`);
  }

  // 11. Role Security: Driver calling Warehouse Manager notifications -> 403
  console.log('\n--- 11. Role Security: Driver calling Warehouse notifications -> Expect 403 ---');
  const driverWhRes = await request('GET', '/api/warehouse-manager/notifications', {
    Authorization: `Bearer ${tokenDriver}`,
  });
  console.log('Driver accessing WH notifications status (expect 403):', driverWhRes.status);
  if (driverWhRes.status !== 403) {
    throw new Error(`Expected 403 for driver accessing WH notifications, got ${driverWhRes.status}`);
  }

  // 12. Security: Unauthenticated access -> 401
  console.log('\n--- 12. Security: Unauthenticated access -> Expect 401 ---');
  const unauthRes = await request('GET', '/api/warehouse-manager/notifications');
  console.log('Unauthenticated status (expect 401):', unauthRes.status);
  if (unauthRes.status !== 401) {
    throw new Error(`Expected 401 for unauthenticated access, got ${unauthRes.status}`);
  }

  // 13. Customer Regression
  console.log('\n--- 13. Customer Notifications Regression Check ---');
  const custNotifs = await request('GET', '/api/customer/notifications', {
    Authorization: `Bearer ${tokenCust}`,
  });
  const custUnread = await request('GET', '/api/customer/notifications/unread-count', {
    Authorization: `Bearer ${tokenCust}`,
  });
  console.log('Customer GET status:', custNotifs.status, 'Unread status:', custUnread.status);
  if (custNotifs.status !== 200 || custUnread.status !== 200) {
    throw new Error('Customer notifications regression check failed!');
  }

  // 14. Driver Regression
  console.log('\n--- 14. Driver Notifications Regression Check ---');
  const driverNotifs = await request('GET', '/api/driver/notifications', {
    Authorization: `Bearer ${tokenDriver}`,
  });
  const driverUnread = await request('GET', '/api/driver/notifications/unread-count', {
    Authorization: `Bearer ${tokenDriver}`,
  });
  console.log('Driver GET status:', driverNotifs.status, 'Unread status:', driverUnread.status);
  if (driverNotifs.status !== 200 || driverUnread.status !== 200) {
    throw new Error('Driver notifications regression check failed!');
  }

  // Clean test alerts
  runSql(`DELETE FROM notifications WHERE title LIKE 'TEST_WM_%';`);

  console.log('\n======================================================');
  console.log('ALL 14 NOTIFICATION TESTS AND SECURITY CHECKS PASSED!');
  console.log('======================================================\n');
}

main().catch((err) => {
  console.error('ERROR IN VERIFICATION SCRIPT:', err);
  process.exit(1);
});
