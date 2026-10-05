const { execSync } = require('child_process');
process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432';

const sql = `
SELECT v.id, v.vehicle_number, v.model, v.status AS vehicle_status,
       COUNT(s.id) FILTER (WHERE s.status NOT IN ('DELIVERED', 'CANCELLED')) AS active_shipments_count,
       STRING_AGG(CASE WHEN s.status NOT IN ('DELIVERED', 'CANCELLED') THEN s.tracking_number || ':' || s.status ELSE NULL END, ', ') AS active_shipment_details
FROM vehicles v
LEFT JOIN shipments s ON s.vehicle_id = v.id
GROUP BY v.id, v.vehicle_number, v.model, v.status
ORDER BY v.id;
`;

console.log(execSync(`${PSQL} -c "${sql.replace(/\n/g, ' ')}"`, { encoding: 'utf8', env: process.env }));
