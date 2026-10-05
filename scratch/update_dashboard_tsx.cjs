const fs = require('fs');

let dashContent = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf8');

// Ensure NeedsAttentionItem is imported or supported
if (!dashContent.includes('AlertOctagon')) {
  dashContent = dashContent.replace(
    '  Package, Truck, Users, Wallet, ChevronRight,',
    '  Package, Truck, Users, Wallet, ChevronRight,\n  AlertOctagon, Clock, ShieldAlert, Building2, UserCheck, Wrench,'
  );
}

// Add Needs Attention Section right after the top KPI cards
const needsAttnBlock = `
      {/* Dynamic Needs Attention Section */}
      {summary?.needsAttention && summary.needsAttention.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)', animation: 'pulse 2s infinite' }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Operational Priority & Needs Attention ({summary.needsAttention.reduce((acc, item) => acc + item.count, 0)})
              </h3>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Real-time PostgreSQL Alerts</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            {summary.needsAttention.map((item) => {
              const isCrit = item.severity === 'CRITICAL';
              const isWarn = item.severity === 'WARNING';
              const borderColor = isCrit ? 'rgba(239, 68, 68, 0.4)' : isWarn ? 'rgba(245, 158, 11, 0.4)' : 'rgba(59, 130, 246, 0.4)';
              const bgColor = isCrit ? 'rgba(239, 68, 68, 0.04)' : isWarn ? 'rgba(245, 158, 11, 0.04)' : 'rgba(59, 130, 246, 0.04)';
              const badgeColor = isCrit ? '#dc2626' : isWarn ? '#d97706' : '#2563eb';

              return (
                <div
                  key={item.key}
                  className="card"
                  style={{
                    padding: '16px 18px',
                    margin: 0,
                    border: \`1px solid \${borderColor}\`,
                    backgroundColor: bgColor,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  }}
                  onClick={() => navigate(item.link)}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{item.title}</span>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 12,
                          color: '#fff',
                          backgroundColor: badgeColor,
                        }}
                      >
                        {item.count}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                      {item.description}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: 12, fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>
                    <span>Resolve Action</span>
                    <ChevronRight size={14} style={{ marginLeft: 4 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Fleet & Operational Telemetry KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
        <div className="card" style={{ padding: '14px 16px', margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Fulfillment Hubs</span>
            <Building2 size={16} color="var(--primary)" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
            {isLoading ? '...' : (summary?.activeWarehouses ?? 0)} Active
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>Company-wide fulfillment network</div>
        </div>

        <div className="card" style={{ padding: '14px 16px', margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Active Fleet</span>
            <Truck size={16} color="#4f46e5" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
            {isLoading ? '...' : (summary?.availableVehicles ?? 0)} Available
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
            {summary?.vehiclesInTransit ?? 0} In Transit • {summary?.vehiclesUnderMaintenance ?? 0} In Shop
          </div>
        </div>

        <div className="card" style={{ padding: '14px 16px', margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Drivers Ready</span>
            <UserCheck size={16} color="#059669" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
            {isLoading ? '...' : (summary?.availableDrivers ?? 0)} Available
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
            {summary?.driversOnTrip ?? 0} On Active Delivery
          </div>
        </div>

        <div className="card" style={{ padding: '14px 16px', margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Stock Alerts</span>
            <AlertTriangle size={16} color={summary?.lowInventoryAlerts ? '#d97706' : 'var(--text-muted)'} />
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: summary?.lowInventoryAlerts ? 'var(--warning)' : 'var(--text-primary)', marginTop: 4 }}>
            {isLoading ? '...' : (summary?.lowInventoryAlerts ?? 0)} Low SKUs
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>Threshold reorder alerts</div>
        </div>
      </div>
`;

if (!dashContent.includes('Operational Priority & Needs Attention')) {
  dashContent = dashContent.replace(
    '{/* Main Charts Section */}',
    needsAttnBlock + '\n      {/* Main Charts Section */}'
  );
}

fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', dashContent, 'utf8');
console.log('Updated src/pages/admin/AdminDashboard.tsx');
