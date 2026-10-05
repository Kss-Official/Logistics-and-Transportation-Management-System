const { execSync } = require('child_process');
process.env.PGPASSWORD = 'postgres123';
const PSQL = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d primeroute_db -h localhost -p 5432';

const sql = `
SELECT d.id, d.full_name, d.status AS driver_status,
       COUNT(s.id) FILTER (WHERE s.status NOT IN ('DELIVERED', 'CANCELLED')) AS active_shipments_count,
       STRING_AGG(CASE WHEN s.status NOT IN ('DELIVERED', 'CANCELLED') THEN s.tracking_number || ':' || s.status ELSE NULL END, ', ') AS active_shipment_details
FROM drivers d
LEFT JOIN shipments s ON s.driver_id = d.id
GROUP BY d.id, d.full_name, d.status
ORDER BY d.id;
`;

console.log(execSync(`${PSQL} -c "${sql.replace(/\n/g, ' ')}"`, { encoding: 'utf8', env: process.env }));
