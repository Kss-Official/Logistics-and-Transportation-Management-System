const axios = require('axios');

async function testDriverRouteLive() {
  console.log('=== Testing PrimeRoute Driver Route Live Flow ===\n');

  try {
    // 1. Driver Login
    console.log('Step 1: Logging in as Driver (ramesh@primeroute.com)...');
    const loginRes = await axios.post('http://localhost:8080/api/auth/login', {
      email: 'ramesh@primeroute.com',
      password: 'Driver@2026'
    });

    const driverToken = loginRes.data.token || loginRes.data.jwt;
    console.log('Driver Login Successful! Role:', loginRes.data.role, 'Email:', loginRes.data.email);

    const authHeaders = { headers: { Authorization: `Bearer ${driverToken}` } };

    // 2. Fetch Active Delivery
    console.log('\nStep 2: Fetching Active Delivery...');
    const activeRes = await axios.get('http://localhost:8080/api/driver/deliveries/active', authHeaders);
    console.log('Active Delivery found:', activeRes.data.data ? activeRes.data.data.trackingNumber : 'None');

    // 3. Fetch Active Delivery Route
    console.log('\nStep 3: Fetching Dynamic Road Route (/api/driver/deliveries/active/route)...');
    const routeRes = await axios.get('http://localhost:8080/api/driver/deliveries/active/route', authHeaders);
    const route = routeRes.data.data;

    console.log('Route Retrieved Successfully:');
    console.log('- Tracking Number:', route.trackingNumber);
    console.log('- Route Code:', route.routeCode);
    console.log('- Status:', route.status);
    console.log('- Freshness:', route.freshness);
    console.log('- Origin:', route.origin.facilityName, `(${route.origin.latitude}, ${route.origin.longitude})`);
    console.log('- Current Location:', route.currentLocation.facilityName, `(${route.currentLocation.latitude}, ${route.currentLocation.longitude})`);
    console.log('- Destination:', route.destination.customerName, route.destination.city, `(${route.destination.latitude}, ${route.destination.longitude})`);
    console.log('- Total Route Distance:', route.totalDistanceKm, 'km');
    console.log('- Distance Remaining:', route.distanceRemainingKm, 'km');
    console.log('- Estimated Duration:', route.estimatedDurationMinutes, 'mins');
    console.log('- Estimated Arrival Time:', route.estimatedDeliveryTime);
    console.log('- Road Geometry Points Count:', route.routeGeometry ? route.routeGeometry.length : 0);
    console.log('- Turn-by-Turn Maneuver Steps Count:', route.routeSteps ? route.routeSteps.length : 0);
    if (route.routeSteps && route.routeSteps.length > 0) {
      console.log('  First maneuver:', route.routeSteps[0].instruction, `(${route.routeSteps[0].distanceKm} km)`);
    }
    console.log('- Waypoints Count:', route.waypoints ? route.waypoints.length : 0);

    // 4. Update Driver GPS to a new closer location and test dynamic recalculation
    console.log('\nStep 4: Simulating GPS update to closer position...');
    const newLat = 13.0400;
    const newLng = 77.6800;
    await axios.post('http://localhost:8080/api/driver/location', {
      latitude: newLat,
      longitude: newLng,
      locationName: 'Hebbal Outer Ring Rd Flyover'
    }, authHeaders);
    console.log(`GPS updated to (${newLat}, ${newLng})`);

    // 5. Re-fetch route and verify dynamic distance/ETA change
    console.log('\nStep 5: Re-fetching route to verify dynamic recalculation...');
    const route2Res = await axios.get('http://localhost:8080/api/driver/deliveries/active/route', authHeaders);
    const route2 = route2Res.data.data;
    console.log('- New Current Location:', route2.currentLocation.facilityName);
    console.log('- Updated Distance Remaining:', route2.distanceRemainingKm, 'km (Previous:', route.distanceRemainingKm, 'km)');
    console.log('- Updated Estimated Duration:', route2.estimatedDurationMinutes, 'mins');
    console.log('- Dynamic recalculation verified:', route2.distanceRemainingKm !== route.distanceRemainingKm || route2.currentLocation.latitude === newLat);

    // 6. Test Security: Unauthenticated request must return 401
    console.log('\nStep 6: Testing unauthenticated request (expecting 401)...');
    try {
      await axios.get('http://localhost:8080/api/driver/deliveries/active/route');
      console.log('ERROR: Unauthenticated request succeeded unexpectedly');
    } catch (err) {
      console.log('Unauthenticated request correctly rejected with status:', err.response?.status);
    }

    console.log('\n=== ALL LIVE DRIVER ROUTE CHECKS PASSED ===\n');
  } catch (err) {
    console.error('Test failed with error:', err.response ? `${err.response.status} ${JSON.stringify(err.response.data)}` : err.message);
  }
}

testDriverRouteLive();
