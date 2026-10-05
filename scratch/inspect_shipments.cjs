const axios = require('axios');

async function main() {
  const loginRes = await axios.post('http://localhost:8080/api/auth/login', {
    email: 'priya@primeroute.com',
    password: 'Manager@2026!'
  });

  const token = loginRes.data.token || loginRes.data.data?.token;
  console.log('Logged in as Priya Sharma, token length:', token?.length);

  const authHeaders = { Authorization: `Bearer ${token}` };

  const [incRes, outRes, allRes] = await Promise.all([
    axios.get('http://localhost:8080/api/warehouse-manager/shipments/incoming', { headers: authHeaders }),
    axios.get('http://localhost:8080/api/warehouse-manager/shipments/outgoing', { headers: authHeaders }),
    axios.get('http://localhost:8080/api/warehouse-manager/shipments', { headers: authHeaders }),
  ]);

  const incoming = incRes.data.data;
  const outgoing = outRes.data.data;

  console.log('\n=== INCOMING SHIPMENTS COUNT ===', incoming.length);
  incoming.forEach(s => {
    console.log(`[IN] ID: ${s.id} | Trk: ${s.trackingNumber} | Ord: ${s.orderNumber} | Origin: ${s.originWarehouseName || s.originCity} (ID: ${s.originWarehouseId}) | Dest: ${s.destinationWarehouseName || s.destinationCity} (ID: ${s.destinationWarehouseId}) | Status: ${s.status} | Stage: ${s.operationalStage} | Created: ${s.createdAt}`);
  });

  console.log('\n=== OUTGOING SHIPMENTS COUNT ===', outgoing.length);
  outgoing.forEach(s => {
    console.log(`[OUT] ID: ${s.id} | Trk: ${s.trackingNumber} | Ord: ${s.orderNumber} | Origin: ${s.originWarehouseName || s.originCity} (ID: ${s.originWarehouseId}) | Dest: ${s.destinationWarehouseName || s.destinationCity} (ID: ${s.destinationWarehouseId}) | Status: ${s.status} | Stage: ${s.operationalStage} | Created: ${s.createdAt}`);
  });
}

main().catch(err => {
  console.error('Error:', err?.response?.data || err.message);
});
