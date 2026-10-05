const { execFileSync } = require('child_process');
const fs = require('fs');

const psqlPath = 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe';
const env = { ...process.env, PGPASSWORD: 'postgres123' };

function query(sql) {
  const raw = execFileSync(psqlPath, ['-U', 'postgres', '-d', 'primeroute_db', '-A', '-F', '\t', '-c', sql], { env, encoding: 'utf8' });
  const lines = raw.trim().split('\n');
  if (lines.length === 0 || !lines[0]) return [];
  const headers = lines[0].split('\t');
  return lines.slice(1).filter(l => l && !l.startsWith('(')).map(line => {
    const vals = line.split('\t');
    const obj = {};
    headers.forEach((h, i) => obj[h] = vals[i]);
    return obj;
  });
}

function runAudit() {
  console.log('=== GENERATING DETAILED CLEANUP CLASSIFICATION AUDIT REPORT ===');

  // 1. Users Classification
  const users = query('SELECT id, email, full_name, role, status, created_at FROM users ORDER BY id;');
  const userClassification = users.map(u => {
    const email = (u.email || '').toLowerCase();
    const name = (u.full_name || '').toLowerCase();
    let classification = 'PRESERVE';
    let reason = 'Legitimate system account / preserved master user';

    // Master roles to ALWAYS preserve
    if (['priya@primeroute.com', 'ccu.east@primeroute.com'].includes(email) || u.role === 'WAREHOUSE_MANAGER') {
      classification = 'PRESERVE';
      reason = 'Warehouse Manager master account';
    } else if (['ramesh@primeroute.com', 'priya.patel@primeroute.in', 'sneha.kulkarni@primeroute.in', 'anil.deshmukh.1790082100291@primeroute.com', 'arjun.das@primeroute.in'].includes(email) || u.role === 'DRIVER') {
      classification = 'PRESERVE';
      reason = 'Driver master operational account';
    } else if (['sanjanaaa.shru@gmail.com', 'admin@primeroute.com'].includes(email) || u.role === 'ADMIN') {
      classification = 'PRESERVE';
      reason = 'Admin portal master account';
    } else if (['shrutisanjanasahoo@gmail.com', 'manoj3@gmail.com', 'gudi78@gmail.com', 'routjig09@gmail.com', 'kousik12@gmail.com'].includes(email)) {
      classification = 'PRESERVE';
      reason = 'Real customer account';
    } else if (
      email.includes('test') ||
      email.includes('demo') ||
      email.includes('audit') ||
      email.includes('verification') ||
      email.includes('notif.cust') ||
      email.includes('customer_b_') ||
      name.includes('test') ||
      name.includes('demo') ||
      name.includes('verification') ||
      name.includes('audit') ||
      ['vjiu@gmail.com', 'koushik@gmail.com'].includes(email)
    ) {
      classification = 'REMOVE';
      reason = 'Automated test / demo disposable user account';
    } else {
      classification = 'UNCERTAIN';
      reason = 'Unrecognized customer account';
    }

    return { ...u, classification, reason };
  });

  // 2. Orders Classification
  const orders = query(`
    SELECT o.id, o.order_number, o.customer_id, u.email as user_email, u.full_name as user_name,
           o.status, o.total_amount, o.payment_method, o.payment_status, o.created_at
    FROM orders o
    LEFT JOIN users u ON o.customer_id = u.id
    ORDER BY o.id;
  `);

  const orderClassification = orders.map(o => {
    const user = userClassification.find(u => u.id === o.customer_id);
    let classification = 'PRESERVE';
    let reason = 'Real customer order';

    if (user && user.classification === 'REMOVE') {
      classification = 'REMOVE';
      reason = `Belongs to demo/test customer: ${user.full_name} (${user.email})`;
    } else if (['PR-ORD-52560607', 'PR-ORD-81864338', 'PR-ORD-19543436', 'PR-ORD-77094728', 'PR-ORD-26252901', 'PR-ORD-80034974'].includes(o.order_number)) {
      // These were batch payment test orders created in rapid succession
      // Let's check if we want to retain or remove them, or keep real orders PR-ORD-77062649, PR-ORD-76406402, PR-ORD-30750634
      classification = 'REMOVE';
      reason = 'Automated batch test order created during payment method verification';
    } else if (['PR-ORD-97050885', 'PR-ORD-45496077'].includes(o.order_number)) {
      classification = 'REMOVE';
      reason = 'Test cancelled order created during payment testing';
    }

    return { ...o, classification, reason };
  });

  // 3. Shipments Classification
  const shipments = query(`
    SELECT s.id, s.tracking_number, s.order_id, o.order_number, s.status, s.operational_stage,
           s.driver_id, d.full_name as driver_name, s.vehicle_id, s.origin_warehouse_id, s.destination_warehouse_id, s.created_at
    FROM shipments s
    LEFT JOIN orders o ON s.order_id = o.id
    LEFT JOIN drivers d ON s.driver_id = d.id
    ORDER BY s.id;
  `);

  const shipmentClassification = shipments.map(s => {
    const ord = orderClassification.find(o => o.id === s.order_id);
    let classification = 'PRESERVE';
    let reason = 'Shipment attached to preserved customer order';

    if (ord && ord.classification === 'REMOVE') {
      classification = 'REMOVE';
      reason = `Attached to demo/test order #${ord.order_number} (${ord.user_name})`;
    } else if (!ord) {
      classification = 'REMOVE';
      reason = 'Orphan shipment with no order';
    }

    return { ...s, classification, reason };
  });

  // 4. Invoices Classification
  const invoices = query(`
    SELECT i.id, i.invoice_number, i.order_id, o.order_number, i.customer_id, u.email as user_email,
           i.total_amount, i.payment_method, i.payment_status, i.invoice_status, i.created_at
    FROM invoices i
    LEFT JOIN orders o ON i.order_id = o.id
    LEFT JOIN users u ON i.customer_id = u.id
    ORDER BY i.id;
  `);

  const invoiceClassification = invoices.map(i => {
    const ord = orderClassification.find(o => o.id === i.order_id);
    let classification = 'PRESERVE';
    let reason = 'Authoritative invoice for preserved customer order';

    if (ord && ord.classification === 'REMOVE') {
      classification = 'REMOVE';
      reason = `Attached to demo/test order #${ord.order_number}`;
    } else if (!ord) {
      classification = 'REMOVE';
      reason = 'Orphan invoice with no order';
    }

    return { ...i, classification, reason };
  });

  // 5. Proof of Deliveries Classification
  const pods = query(`
    SELECT p.id, p.shipment_id, s.tracking_number, p.recipient_name, p.received_by, p.delivered_at
    FROM proof_of_deliveries p
    LEFT JOIN shipments s ON p.shipment_id = s.id
    ORDER BY p.id;
  `);

  const podClassification = pods.map(p => {
    const sh = shipmentClassification.find(s => s.id === p.shipment_id);
    let classification = 'PRESERVE';
    let reason = 'Valid ePOD for preserved shipment';

    if (sh && sh.classification === 'REMOVE') {
      classification = 'REMOVE';
      reason = `ePOD for demo/test shipment #${sh.tracking_number}`;
    } else if (!sh) {
      classification = 'REMOVE';
      reason = 'Orphan ePOD record';
    }

    return { ...p, classification, reason };
  });

  // 6. Support Tickets Classification
  const tickets = query(`
    SELECT t.id, t.ticket_number, t.customer_id, u.email as user_email, u.full_name as user_name,
           t.category, t.priority, t.status, t.subject, t.created_at
    FROM support_tickets t
    LEFT JOIN users u ON t.customer_id = u.id
    ORDER BY t.id;
  `);

  const ticketClassification = tickets.map(t => {
    const user = userClassification.find(u => u.id === t.customer_id);
    let classification = 'PRESERVE';
    let reason = 'Legitimate customer / operational ticket';

    if (user && user.classification === 'REMOVE') {
      classification = 'REMOVE';
      reason = `Test ticket created by demo user (${user.email})`;
    } else if ((t.subject || '').toLowerCase().includes('integration test') || (t.subject || '').toLowerCase().includes('urgent freight escalation test')) {
      classification = 'REMOVE';
      reason = 'Automated E2E testing ticket';
    }

    return { ...t, classification, reason };
  });

  const summary = {
    users: {
      total: userClassification.length,
      preserve: userClassification.filter(x => x.classification === 'PRESERVE').length,
      remove: userClassification.filter(x => x.classification === 'REMOVE').length,
      uncertain: userClassification.filter(x => x.classification === 'UNCERTAIN').length,
      items: userClassification
    },
    orders: {
      total: orderClassification.length,
      preserve: orderClassification.filter(x => x.classification === 'PRESERVE').length,
      remove: orderClassification.filter(x => x.classification === 'REMOVE').length,
      uncertain: orderClassification.filter(x => x.classification === 'UNCERTAIN').length,
      items: orderClassification
    },
    shipments: {
      total: shipmentClassification.length,
      preserve: shipmentClassification.filter(x => x.classification === 'PRESERVE').length,
      remove: shipmentClassification.filter(x => x.classification === 'REMOVE').length,
      uncertain: shipmentClassification.filter(x => x.classification === 'UNCERTAIN').length,
      items: shipmentClassification
    },
    invoices: {
      total: invoiceClassification.length,
      preserve: invoiceClassification.filter(x => x.classification === 'PRESERVE').length,
      remove: invoiceClassification.filter(x => x.classification === 'REMOVE').length,
      uncertain: invoiceClassification.filter(x => x.classification === 'UNCERTAIN').length,
      items: invoiceClassification
    },
    pods: {
      total: podClassification.length,
      preserve: podClassification.filter(x => x.classification === 'PRESERVE').length,
      remove: podClassification.filter(x => x.classification === 'REMOVE').length,
      uncertain: podClassification.filter(x => x.classification === 'UNCERTAIN').length,
      items: podClassification
    },
    tickets: {
      total: ticketClassification.length,
      preserve: ticketClassification.filter(x => x.classification === 'PRESERVE').length,
      remove: ticketClassification.filter(x => x.classification === 'REMOVE').length,
      uncertain: ticketClassification.filter(x => x.classification === 'UNCERTAIN').length,
      items: ticketClassification
    }
  };

  fs.writeFileSync('d:/Transportation-Logistic/scratch/cleanup_plan.json', JSON.stringify(summary, null, 2));

  console.log('\n=== SUMMARY OF CLASSIFICATION ===');
  console.log(`Users: Total ${summary.users.total} -> Preserve: ${summary.users.preserve}, Remove: ${summary.users.remove}, Uncertain: ${summary.users.uncertain}`);
  console.log(`Orders: Total ${summary.orders.total} -> Preserve: ${summary.orders.preserve}, Remove: ${summary.orders.remove}, Uncertain: ${summary.orders.uncertain}`);
  console.log(`Shipments: Total ${summary.shipments.total} -> Preserve: ${summary.shipments.preserve}, Remove: ${summary.shipments.remove}, Uncertain: ${summary.shipments.uncertain}`);
  console.log(`Invoices: Total ${summary.invoices.total} -> Preserve: ${summary.invoices.preserve}, Remove: ${summary.invoices.remove}, Uncertain: ${summary.invoices.uncertain}`);
  console.log(`Proof of Deliveries: Total ${summary.pods.total} -> Preserve: ${summary.pods.preserve}, Remove: ${summary.pods.remove}, Uncertain: ${summary.pods.uncertain}`);
  console.log(`Support Tickets: Total ${summary.tickets.total} -> Preserve: ${summary.tickets.preserve}, Remove: ${summary.tickets.remove}, Uncertain: ${summary.tickets.uncertain}`);

  return summary;
}

runAudit();
