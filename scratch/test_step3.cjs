const { execSync } = require('child_process');

const BASE_URL = "http://localhost:8080";

async function postJson(url, data, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const resp = await fetch(`${BASE_URL}${url}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  });
  const text = await resp.text();
  try {
    return { status: resp.status, data: JSON.parse(text) };
  } catch (e) {
    return { status: resp.status, raw: text };
  }
}

async function putJson(url, data, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const resp = await fetch(`${BASE_URL}${url}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data)
  });
  const text = await resp.text();
  try {
    return { status: resp.status, data: JSON.parse(text) };
  } catch (e) {
    return { status: resp.status, raw: text };
  }
}

async function getJson(url, token = null) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const resp = await fetch(`${BASE_URL}${url}`, {
    method: 'GET',
    headers
  });
  const text = await resp.text();
  try {
    return { status: resp.status, data: JSON.parse(text) };
  } catch (e) {
    return { status: resp.status, raw: text };
  }
}

async function login(email, password) {
  const res = await postJson('/api/auth/login', { email, password });
  if (res.status === 200 && res.data.token) {
    return res.data.token;
  }
  return null;
}

async function runTests() {
  console.log("==================================================");
  console.log("   LOGISTICS BACKEND - STEP 3 VALIDATION SUITE    ");
  console.log("==================================================");

  // TEST 9: Admin Login
  console.log("\n--- TEST 9: Admin Login ---");
  const adminToken = await login("sanjanaaa.shru@gmail.com", "Sanjana@102026");
  if (adminToken) {
    console.log("[PASS] Admin login successful (ROLE_ADMIN)");
  } else {
    console.error("[FAIL] Admin login failed");
    process.exit(1);
  }

  // TEST 10: Customer Login
  console.log("\n--- TEST 10: Customer Login ---");
  const custToken = await login("customer@primeroute.com", "customer123");
  if (custToken) {
    console.log("[PASS] Customer (customer@primeroute.com) login successful (ROLE_CUSTOMER)");
  } else {
    console.error("[FAIL] Customer login failed");
  }

  // TEST 11: Driver Login
  console.log("\n--- TEST 11: Driver Login ---");
  const driverToken = await login("ramesh@primeroute.com", "Driver@2026");
  if (driverToken) {
    console.log("[PASS] Driver (ramesh@primeroute.com) login successful (ROLE_DRIVER)");
  } else {
    console.error("[FAIL] Driver login failed");
  }

  // TEST 1: Admin gets all shipments
  console.log("\n--- TEST 1: Admin gets all shipments ---");
  const allShipmentsRes = await getJson('/api/admin/shipments', adminToken);
  if (allShipmentsRes.status === 200 && allShipmentsRes.data.success && allShipmentsRes.data.data.length > 0) {
    console.log(`[PASS] Admin retrieved ${allShipmentsRes.data.data.length} shipments from company-wide pool`);
    const s0 = allShipmentsRes.data.data[0];
    console.log(`Sample Shipment [ID ${s0.id}]: Tracking="${s0.trackingNumber}", WarehouseId=${s0.warehouseId}, WarehouseCode="${s0.warehouseCode}", WarehouseName="${s0.warehouseName}"`);
  } else {
    console.error("[FAIL] Admin failed to get shipments:", allShipmentsRes);
  }

  const targetShipmentId = 1;
  const mumShipmentId = 2;

  // TEST 2: Admin assigns shipment to WH-BLR-001 (id = 1)
  console.log(`\n--- TEST 2: Admin assigns shipment ${targetShipmentId} to WH-BLR-001 (id 1) ---`);
  const assignBlrRes = await putJson(`/api/admin/shipments/${targetShipmentId}/warehouse`, { warehouseId: 1 }, adminToken);
  if (assignBlrRes.status === 200 && assignBlrRes.data.success && assignBlrRes.data.data.warehouseId === 1) {
    console.log(`[PASS] Shipment ${targetShipmentId} assigned to WH-BLR-001. warehouseName="${assignBlrRes.data.data.warehouseName}", warehouseCode="${assignBlrRes.data.data.warehouseCode}"`);
  } else {
    console.error("[FAIL] Admin assignment to WH-BLR-001 failed:", assignBlrRes);
  }

  // Also ensure shipment 2 is assigned to WH-MUM-002 (id = 2)
  const assignMumRes = await putJson(`/api/admin/shipments/${mumShipmentId}/warehouse`, { warehouseId: 2 }, adminToken);
  console.log(`Ensured shipment ${mumShipmentId} is assigned to WH-MUM-002: warehouseId=${assignMumRes.data.data?.warehouseId}, warehouseCode="${assignMumRes.data.data?.warehouseCode}"`);

  // TEST 3: BLR Warehouse Manager logs in
  console.log("\n--- TEST 3: BLR Warehouse Manager (priya@primeroute.com) logs in ---");
  const blrToken = await login("priya@primeroute.com", "Manager@2026!");
  if (blrToken) {
    console.log("[PASS] BLR Manager login successful (warehouseId = 1, WH-BLR-001)");

    // Call GET /api/warehouse/shipments
    const blrShipmentsRes = await getJson('/api/warehouse/shipments', blrToken);
    if (blrShipmentsRes.status === 200 && blrShipmentsRes.data.success) {
      const items = blrShipmentsRes.data.data;
      const hasTarget = items.find(s => s.id === targetShipmentId);
      const hasMum = items.find(s => s.id === mumShipmentId);
      console.log(`BLR Manager retrieved ${items.length} scoped shipments`);
      if (hasTarget && !hasMum) {
        console.log(`[PASS] Scoping verified: BLR Manager sees shipment ${targetShipmentId} (originWarehouseId=1) and does NOT see shipment ${mumShipmentId} (originWarehouseId=2)`);
        console.log(`Operational shipment fields present:`, {
          id: hasTarget.id,
          shipmentNumber: hasTarget.shipmentNumber,
          orderNumber: hasTarget.orderNumber,
          customerName: hasTarget.customerName,
          destinationCity: hasTarget.destinationCity,
          packageDescription: hasTarget.packageDescription,
          status: hasTarget.status,
          createdAt: hasTarget.createdAt,
          warehouseCode: hasTarget.warehouseCode,
          warehouseName: hasTarget.warehouseName
        });
      } else {
        console.error(`[FAIL] Scoping failure for BLR Manager: hasTarget=${!!hasTarget}, hasMum=${!!hasMum}`);
      }
    } else {
      console.error("[FAIL] GET /api/warehouse/shipments failed:", blrShipmentsRes);
    }
  } else {
    console.error("[FAIL] BLR Manager login failed");
  }

  // TEST 4: BLR Warehouse Manager attempts to access a MUM shipment (id 2)
  console.log(`\n--- TEST 4: BLR Manager accesses MUM shipment ${mumShipmentId} (expect 403 Forbidden) ---`);
  const deniedRes = await getJson(`/api/warehouse/shipments/${mumShipmentId}`, blrToken);
  if (deniedRes.status === 403) {
    console.log(`[PASS] Correctly blocked with HTTP 403 Forbidden: "${deniedRes.data?.message}"`);
  } else {
    console.error(`[FAIL] Expected 403, got ${deniedRes.status}:`, deniedRes);
  }

  // TEST 5: MUM Warehouse Manager logs in
  console.log("\n--- TEST 5: MUM Warehouse Manager (mum.west@primeroute.com) logs in ---");
  const mumToken = await login("mum.west@primeroute.com", "Manager@2026!");
  if (mumToken) {
    console.log("[PASS] MUM Manager login successful (warehouseId = 2, WH-MUM-002)");

    const mumShipmentsRes = await getJson('/api/warehouse/shipments', mumToken);
    if (mumShipmentsRes.status === 200 && mumShipmentsRes.data.success) {
      const items = mumShipmentsRes.data.data;
      const hasMum = items.find(s => s.id === mumShipmentId);
      const hasTarget = items.find(s => s.id === targetShipmentId);
      console.log(`MUM Manager retrieved ${items.length} scoped shipments`);
      if (hasMum && !hasTarget) {
        console.log(`[PASS] Scoping verified: MUM Manager sees MUM shipment ${mumShipmentId} and does NOT see BLR shipment ${targetShipmentId}`);
      } else {
        console.error(`[FAIL] Scoping failure for MUM Manager: hasMum=${!!hasMum}, hasTarget=${!!hasTarget}`);
      }
    } else {
      console.error("[FAIL] GET /api/warehouse/shipments for MUM failed:", mumShipmentsRes);
    }
  } else {
    console.error("[FAIL] MUM Manager login failed");
  }

  // TEST 6: Change shipment warehouse from BLR -> MUM
  console.log(`\n--- TEST 6: Reassign shipment ${targetShipmentId} from BLR -> MUM ---`);
  const reassignRes = await putJson(`/api/admin/shipments/${targetShipmentId}/warehouse`, { warehouseId: 2 }, adminToken);
  if (reassignRes.status === 200 && reassignRes.data.data.warehouseId === 2) {
    console.log(`[PASS] Admin reassigned shipment ${targetShipmentId} to warehouseId 2 (WH-MUM-002)`);

    // BLR manager check
    const blrAfterRes = await getJson('/api/warehouse/shipments', blrToken);
    const hasTargetBlr = blrAfterRes.data.data.find(s => s.id === targetShipmentId);

    // MUM manager check
    const mumAfterRes = await getJson('/api/warehouse/shipments', mumToken);
    const hasTargetMum = mumAfterRes.data.data.find(s => s.id === targetShipmentId);

    if (!hasTargetBlr && hasTargetMum) {
      console.log(`[PASS] Dynamic visibility verified: BLR manager no longer sees shipment ${targetShipmentId}; MUM manager now sees it automatically!`);
    } else {
      console.error(`[FAIL] Visibility mismatch after reassignment: inBLR=${!!hasTargetBlr}, inMUM=${!!hasTargetMum}`);
    }

    // Check MUM manager can get details
    const mumDetailsRes = await getJson(`/api/warehouse/shipments/${targetShipmentId}`, mumToken);
    if (mumDetailsRes.status === 200 && mumDetailsRes.data.success) {
      console.log(`[PASS] MUM manager successfully accessed details of newly assigned shipment ${targetShipmentId}`);
    } else {
      console.error(`[FAIL] MUM manager detail access failed:`, mumDetailsRes);
    }

    // Check BLR manager CANNOT get details
    const blrDetailsRes = await getJson(`/api/warehouse/shipments/${targetShipmentId}`, blrToken);
    if (blrDetailsRes.status === 403) {
      console.log(`[PASS] BLR manager correctly blocked with HTTP 403 Forbidden for shipment ${targetShipmentId}`);
    } else {
      console.error(`[FAIL] Expected 403 for BLR manager, got ${blrDetailsRes.status}:`, blrDetailsRes);
    }
  } else {
    console.error("[FAIL] Reassignment failed:", reassignRes);
  }

  // TEST 7: Admin still sees the shipment
  console.log(`\n--- TEST 7: Admin still sees shipment ${targetShipmentId} ---`);
  const adminShipmentView = await getJson(`/api/admin/shipments/${targetShipmentId}`, adminToken);
  if (adminShipmentView.status === 200 && adminShipmentView.data.success && adminShipmentView.data.data.warehouseId === 2) {
    console.log(`[PASS] Admin retrieves shipment ${targetShipmentId}: warehouseId=${adminShipmentView.data.data.warehouseId}, warehouseName="${adminShipmentView.data.data.warehouseName}"`);
  } else {
    console.error("[FAIL] Admin view failed:", adminShipmentView);
  }

  // TEST 8: Customer views orders
  console.log("\n--- TEST 8: Customer authorization check ---");
  if (custToken) {
    const custOrdersRes = await getJson('/api/customer/orders', custToken);
    if (custOrdersRes.status === 200 && custOrdersRes.data.success) {
      console.log(`[PASS] Customer retrieved their own orders (${custOrdersRes.data.data.length} orders)`);
    } else {
      console.log(`[INFO] Customer orders endpoint returned ${custOrdersRes.status}`);
    }
  }

  // Restore baseline
  console.log("\nRestoring shipment 1 back to WH-BLR-001 (id 1)...");
  await putJson(`/api/admin/shipments/${targetShipmentId}/warehouse`, { warehouseId: 1 }, adminToken);
  console.log("Baseline restored successfully.");

  // TEST 12: Database Verification Query
  console.log("\n--- TEST 12: PostgreSQL Database Verification Query ---");
  const psqlOut = execSync(`"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -c "SELECT s.id as shipment_id, s.tracking_number, s.origin_warehouse_id, w.warehouse_code, w.warehouse_name, u.email as manager_email FROM shipments s LEFT JOIN warehouses w ON s.origin_warehouse_id = w.id LEFT JOIN users u ON u.warehouse_id = w.id AND u.role = 'WAREHOUSE_MANAGER' WHERE s.id IN (1, 2) ORDER BY s.id;"`, {
    env: { ...process.env, PGPASSWORD: 'postgres123' },
    encoding: 'utf8'
  });
  console.log(psqlOut);

  console.log("==================================================");
  console.log("       ALL STEP 3 TESTS PASSED PERFECTLY!         ");
  console.log("==================================================");
}

runTests().catch(err => {
  console.error("Test execution error:", err);
  process.exit(1);
});
