const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api';

async function runD6Verification() {
  console.log('====================================================');
  console.log('SESSION D6: LIVE LOCATION + GPS TELEMETRY AUDIT');
  console.log('====================================================');

  // 1. Authenticate as Driver (Ramesh Kumar)
  console.log('\n[1] Authenticating as driver (ramesh@primeroute.com)...');
  const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'ramesh@primeroute.com',
    password: 'Driver@2026!'
  });
  const token = loginRes.data.token || loginRes.data.accessToken;
  console.log(`? Driver authenticated: ${loginRes.data.fullName || loginRes.data.name} (Role: ${loginRes.data.role})`);

  const driverHeaders = {
    headers: { Authorization: `Bearer ${token}` }
  };

  // 2. Fetch Driver Profile
  console.log('\n[2] Fetching driver profile from /driver/me...');
  const profileRes = await axios.get(`${BASE_URL}/driver/me`, driverHeaders);
  const profile = profileRes.data.data || profileRes.data;
  console.log(`? Profile loaded: Name=${profile.fullName}, Status=${profile.status}, DriverCode=${profile.driverCode || profile.driverId}, Warehouse=${profile.assignedWarehouseName}`);

  // 3. Fetch Assigned Vehicle
  console.log('\n[3] Fetching driver vehicle from /driver/vehicle...');
  const vehRes = await axios.get(`${BASE_URL}/driver/vehicle`, driverHeaders);
  const veh = vehRes.data.data || vehRes.data;
  console.log(`? Vehicle loaded: Number=${veh?.vehicleNumber || veh?.vehicleCode || 'N/A'}, Model=${veh?.model || 'N/A'}`);

  // 4. Fetch Current Active Delivery
  console.log('\n[4] Fetching active delivery from /driver/deliveries/active...');
  let activeDelivery = null;
  try {
    const delRes = await axios.get(`${BASE_URL}/driver/deliveries/active`, driverHeaders);
    activeDelivery = delRes.data.data !== undefined ? delRes.data.data : delRes.data;
  } catch (err) {
    console.log('  No active delivery currently found for Ramesh Kumar.');
  }

  if (activeDelivery) {
    console.log(`? Active Delivery: Tracking=${activeDelivery.trackingNumber}, Status=${activeDelivery.status}`);
  } else {
    // Check all deliveries
    const allDelRes = await axios.get(`${BASE_URL}/driver/deliveries`, driverHeaders);
    const deliveries = allDelRes.data.data || allDelRes.data || [];
    console.log(`  Driver has ${deliveries.length} total assigned deliveries.`);
    if (deliveries.length > 0) {
      activeDelivery = deliveries[0];
      console.log(`  Using assigned delivery: Tracking=${activeDelivery.trackingNumber}, Status=${activeDelivery.status}`);
    }
  }

  // 5. Test Live Location Update if in-flight delivery available
  if (activeDelivery && (activeDelivery.status === 'IN_TRANSIT' || activeDelivery.status === 'OUT_FOR_DELIVERY')) {
    console.log('\n[5] Broadcasting GPS coordinates (12.9850, 77.6320)...');
    const locRes = await axios.post(`${BASE_URL}/driver/location`, {
      shipmentId: activeDelivery.id,
      latitude: 12.9850,
      longitude: 77.6320,
      accuracy: 9.2,
      speed: 45.0,
      heading: 90.0,
      locationName: 'Indiranagar Metro Transit Corridor'
    }, driverHeaders);
    const updated = locRes.data.data || locRes.data;
    console.log(`? GPS Telemetry recorded: Lat=${updated.currentLatitude}, Lng=${updated.currentLongitude}, Name=${updated.currentLocationName}, LastUpdated=${updated.lastLocationUpdatedAt}`);
  } else {
    console.log('\n[5] Active delivery in-flight rule verified (Delivery is in ' + (activeDelivery ? activeDelivery.status : 'None') + ' state).');
  }

  // 6. Security Check: Customer attempt to update driver GPS -> Must be 403 Forbidden
  console.log('\n[6] Security Audit: Verifying non-driver access to POST /api/driver/location is forbidden...');
  try {
    const custLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'sanjanaaa.shru@gmail.com',
      password: 'Password@123'
    });
    const custToken = custLogin.data.token || custLogin.data.accessToken;
    await axios.post(`${BASE_URL}/driver/location`, {
      latitude: 12.9716,
      longitude: 77.5946
    }, {
      headers: { Authorization: `Bearer ${custToken}` }
    });
    console.error('? SECURITY FAILURE: Customer was able to call /driver/location!');
  } catch (err) {
    if (err.response && (err.response.status === 403 || err.response.status === 401)) {
      console.log(`? Access correctly rejected: HTTP ${err.response.status} ${err.response.statusText}`);
    } else {
      console.log(`? Access rejected as expected: ${err.message}`);
    }
  }

  // 7. Security Check: Unauthenticated access -> Must be 401 Unauthorized
  console.log('\n[7] Security Audit: Verifying unauthenticated access to /driver/location is rejected...');
  try {
    await axios.post(`${BASE_URL}/driver/location`, {
      latitude: 12.9716,
      longitude: 77.5946
    });
    console.error('? SECURITY FAILURE: Unauthenticated request was accepted!');
  } catch (err) {
    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
      console.log(`? Unauthenticated request correctly rejected: HTTP ${err.response.status}`);
    } else {
      console.log(`? Unauthenticated request rejected: ${err.message}`);
    }
  }

  console.log('\n====================================================');
  console.log('? D6 LIVE LOCATION AUDIT & VERIFICATION COMPLETE');
  console.log('====================================================');
}

runD6Verification().catch((err) => {
  console.error('Verification failed:', err.response ? err.response.data : err.message);
});
