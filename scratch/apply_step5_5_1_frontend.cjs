const fs = require('fs');

// 1. Update src/types/warehousePortal.ts
let typesContent = fs.readFileSync('src/types/warehousePortal.ts', 'utf8');

if (!typesContent.includes('export interface WarehouseTrackingEvent')) {
    typesContent = `export interface WarehouseTrackingEvent {
  id?: number;
  status?: string;
  title: string;
  description?: string;
  locationName?: string;
  eventTime: string;
}\n\n` + typesContent;
}

if (!typesContent.includes('deliveryType?: string;')) {
    typesContent = typesContent.replace(
        '  packageQuantity?: number;',
        `  packageQuantity?: number;
  deliveryType?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  trackingEvents?: WarehouseTrackingEvent[];`
    );
}

if (!typesContent.includes('readyToProcessCount?: number;')) {
    typesContent = typesContent.replace(
        '  readyForDispatchCount: number;',
        `  readyToProcessCount?: number;
  pickingCount?: number;
  packedCount?: number;
  readyForDispatchCount: number;`
    );
}

fs.writeFileSync('src/types/warehousePortal.ts', typesContent, 'utf8');
console.log('Updated src/types/warehousePortal.ts');

// 2. Update src/services/warehousePortalService.ts
let serviceContent = fs.readFileSync('src/services/warehousePortalService.ts', 'utf8');

if (!serviceContent.includes('startPicking(')) {
    const newMethods = `  async startPicking(id: number | string): Promise<WarehouseShipmentItem> {
    const res = await api.post<ApiResponse<WarehouseShipmentItem>>(\`/warehouse-manager/shipments/\${id}/start-picking\`);
    return res.data.data;
  },

  async markPacked(id: number | string): Promise<WarehouseShipmentItem> {
    const res = await api.post<ApiResponse<WarehouseShipmentItem>>(\`/warehouse-manager/shipments/\${id}/mark-packed\`);
    return res.data.data;
  },

  async updateShipmentStage(id: number | string, stage: string): Promise<WarehouseShipmentItem> {`;

    serviceContent = serviceContent.replace('  async updateShipmentStage(id: number | string, stage: string): Promise<WarehouseShipmentItem> {', newMethods);
    fs.writeFileSync('src/services/warehousePortalService.ts', serviceContent, 'utf8');
    console.log('Updated src/services/warehousePortalService.ts');
}

// 3. Update src/pages/warehouse/OutgoingShipments.tsx
const outgoingShipmentsCode = fs.readFileSync('scratch/OutgoingShipments_content.txt', 'utf8');
fs.writeFileSync('src/pages/warehouse/OutgoingShipments.tsx', outgoingShipmentsCode, 'utf8');
console.log('Updated src/pages/warehouse/OutgoingShipments.tsx');

// 4. Update src/pages/warehouse/Dashboard.tsx
let dashboardCode = fs.readFileSync('src/pages/warehouse/Dashboard.tsx', 'utf8');

if (!dashboardCode.includes('Ready to Process')) {
    const stageKpiCards = `      {/* ── Section B: Operational Pick & Pack KPIs ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '16px 20px' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Ready to Process</span>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: '4px 0 2px' }}>
            {data.readyToProcessCount != null ? data.readyToProcessCount : 0}
          </div>
          <span style={{ fontSize: 12, color: '#64748b' }}>Allocated & awaiting pick</span>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '16px 20px' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Picking in Progress</span>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#1d4ed8', margin: '4px 0 2px' }}>
            {data.pickingCount != null ? data.pickingCount : 0}
          </div>
          <span style={{ fontSize: 12, color: '#64748b' }}>Currently on pick line</span>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '16px 20px' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Packed Consignments</span>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#92400e', margin: '4px 0 2px' }}>
            {data.packedCount != null ? data.packedCount : 0}
          </div>
          <span style={{ fontSize: 12, color: '#64748b' }}>Ready for dispatch staging</span>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '16px 20px' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Outbound</span>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#065f46', margin: '4px 0 2px' }}>
            {data.outgoingShipmentsCount || 0}
          </div>
          <span style={{ fontSize: 12, color: '#64748b' }}>Allocated to this hub</span>
        </div>
      </div>`;

    dashboardCode = dashboardCode.replace('{/* ── Section A: Warehouse Summary Banner ── */}', stageKpiCards + '\n\n      {/* ── Section A: Warehouse Summary Banner ── */}');
    fs.writeFileSync('src/pages/warehouse/Dashboard.tsx', dashboardCode, 'utf8');
    console.log('Updated src/pages/warehouse/Dashboard.tsx');
}
