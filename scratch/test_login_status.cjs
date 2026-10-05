async function testMum() {
  const resp = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'mum.west@primeroute.com', password: 'Manager@2026!' })
  });
  console.log("Mum Status:", resp.status);
  const data = await resp.json();
  console.log("Mum Response:", data);
}

testMum();
