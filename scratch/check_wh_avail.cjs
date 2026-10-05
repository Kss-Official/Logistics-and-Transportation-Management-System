const BASE_URL = "http://localhost:8080";

async function postJson(url, data, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const resp = await fetch(`${BASE_URL}${url}`, { method: 'POST', headers, body: JSON.stringify(data) });
  const text = await resp.text();
  try { return { status: resp.status, data: JSON.parse(text) }; } catch (e) { return { status: resp.status, raw: text }; }
}

async function getJson(url, token = null) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const resp = await fetch(`${BASE_URL}${url}`, { method: 'GET', headers });
  const text = await resp.text();
  try { return { status: resp.status, data: JSON.parse(text) }; } catch (e) { return { status: resp.status, raw: text }; }
}

async function run() {
  const loginRes = await postJson('/api/auth/login', { email: 'priya@primeroute.com', password: 'Manager@2026!' });
  const token = loginRes.data.token;
  console.log("Logged in as Priya");

  const drivers = await getJson('/api/warehouse/drivers/available', token);
  console.log("Available drivers for WH1:", drivers.data?.data || drivers.data);

  const vehicles = await getJson('/api/warehouse/vehicles/available', token);
  console.log("Available vehicles for WH1:", vehicles.data?.data || vehicles.data);
}

run().catch(console.error);
