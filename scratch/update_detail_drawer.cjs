const fs = require('fs');

const drawerPath = 'd:/Transportation-Logistic/src/components/shipments/ShipmentDetailDrawer.tsx';
let content = fs.readFileSync(drawerPath, 'utf8');

// Replace the 2-column info grid (lines 502-593) with 3 organized cards:
// 1. ORDER & CUSTOMER DETAILS
// 2. FULFILLMENT
// 3. DELIVERY
const targetStart = '{/* ── 2-Column Info Grid: Order & Transit ── */}';
const targetEnd = '{/* Addresses Breakdown */}';

const newCardsJSX = `{/* ── Order, Fulfillment, & Delivery Cards (Step 14) ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {/* 1. ORDER & CUSTOMER DETAILS */}
          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              background: 'var(--card-bg)',
            }}
          >
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', margin: '0 0 12px', letterSpacing: '0.04em' }}>
              Order & Customer Details
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Order Number:</span>{' '}
                <strong className="font-mono" style={{ color: 'var(--primary)' }}>#{active.orderNumber}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Customer:</span>{' '}
                <strong style={{ color: 'var(--text-primary)' }}>{active.customerName}</strong>
                {active.customerEmail && (
                  <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {active.customerEmail}
                  </div>
                )}
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Pickup Address:</span>{' '}
                <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {active.pickupAddress || (active.pickupCity ? \`\${active.pickupCity}, \${active.pickupState || ''}\` : '—')}
                </p>
              </div>
            </div>
          </div>

          {/* 2. FULFILLMENT */}
          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              background: 'var(--card-bg)',
            }}
          >
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', margin: '0 0 12px', letterSpacing: '0.04em' }}>
              Fulfillment
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Fulfillment Warehouse:</span>{' '}
                <strong style={{ color: 'var(--text-primary)', display: 'block' }}>
                  {active.warehouseName || 'Not Assigned'}
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Warehouse Code:</span>{' '}
                <span className="badge badge-slate" style={{ fontSize: 11, fontWeight: 700 }}>
                  {active.warehouseCode || '—'}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Warehouse Manager:</span>{' '}
                <strong style={{ color: 'var(--text-primary)', display: 'block' }}>
                  {active.warehouseManagerName || 'Not Assigned'}
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Manager Email:</span>{' '}
                <span className="font-mono" style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block' }}>
                  {active.warehouseManagerEmail || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* 3. DELIVERY */}
          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              background: 'var(--card-bg)',
            }}
          >
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', margin: '0 0 12px', letterSpacing: '0.04em' }}>
              Delivery
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Destination:</span>{' '}
                <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.4 }}>
                  {active.destination || active.deliveryAddress || active.deliveryCity || '—'}
                </p>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Delivery Type:</span>{' '}
                <span className="badge badge-slate" style={{ fontSize: 11, marginLeft: 6 }}>
                  {active.deliveryType ? active.deliveryType.replace('_', ' ') : 'Standard'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Current Status:</span>{' '}
                <StatusBadge status={active.status} />
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Expected Delivery:</span>{' '}
                <strong style={{ color: 'var(--text-primary)', display: 'block' }}>
                  {formatDate(active.expectedDelivery)}
                </strong>
              </div>
            </div>
          </div>
        </div>

        `;

const startPos = content.indexOf(targetStart);
const endPos = content.indexOf(targetEnd);
if (startPos >= 0 && endPos > startPos) {
  content = content.substring(0, startPos) + newCardsJSX + content.substring(endPos);
  fs.writeFileSync(drawerPath, content, 'utf8');
  console.log("ShipmentDetailDrawer.tsx updated successfully!");
} else {
  console.error("Target range not found in ShipmentDetailDrawer.tsx");
}
