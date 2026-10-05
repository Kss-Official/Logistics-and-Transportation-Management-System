const fs = require('fs');
const path = 'src/pages/admin/Shipments.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove PlusCircle from lucide-react imports if not used
content = content.replace(/  PlusCircle,\r?\n/, '');

// 2. Remove unused imports: warehouseService, Warehouse, AdminOrder
content = content.replace(/import \{ warehouseService \} from '\.\.\/\.\.\/services\/warehouseService';\r?\n/, '');
content = content.replace(/import type \{ Warehouse \} from '\.\.\/\.\.\/types\/warehouse';\r?\n/, '');
content = content.replace(/import type \{ AdminOrder \} from '\.\.\/\.\.\/types\/adminOrder';\r?\n/, '');

// 3. Remove Create Shipment Modal state
const stateBlockRegex = /  \/\/ ── Create Shipment Modal ──[\s\S]*?const \[isCreatingShipment, setIsCreatingShipment\] = useState\(false\);\r?\n\r?\n/;
content = content.replace(stateBlockRegex, '');

// 4. Remove handleOpenCreateModal and handleConfirmCreateShipment
const handlersBlockRegex = /  \/\/ ===========================================================================\r?\n  \/\/ 3\. FETCH UNASSIGNED ORDERS & WAREHOUSES FOR CREATE SHIPMENT MODAL\r?\n  \/\/ ===========================================================================[\s\S]*?\r?\n  \/\/ ===========================================================================\r?\n  \/\/ 3b\. ASSIGN VEHICLE MODAL HANDLERS/;
content = content.replace(handlersBlockRegex, '  // ===========================================================================\n  // 3b. ASSIGN VEHICLE MODAL HANDLERS');

// 5. Remove the "Create Shipment" button in the Page Header
const headerActionsRegex = /        <div className="page-actions">\r?\n          <button\r?\n            className="btn btn-primary btn-sm"\r?\n            onClick=\{handleOpenCreateModal\}\r?\n            title="Create and dispatch shipment for an order"\r?\n          >\r?\n            <PlusCircle size=\{14\} \/>\r?\n            <span>Create Shipment<\/span>\r?\n          <\/button>\r?\n\r?\n          <button\r?\n            className="btn btn-outline btn-sm"/;
const newHeaderActions = `        <div className="page-actions">
          <button
            className="btn btn-outline btn-sm"`;
content = content.replace(headerActionsRegex, newHeaderActions);

// 6. Update EmptyState when no shipments exist (remove Create Shipment button and update text)
const emptyStateRegex = /        \) : paginatedShipments\.length === 0 \? \(\r?\n          <EmptyState\r?\n            title="No shipments found"\r?\n            description=\{[\s\S]*?            \}\r?\n            action=\{[\s\S]*?            \}\r?\n          \/>/;
const newEmptyState = `        ) : paginatedShipments.length === 0 ? (
          <EmptyState
            title="No shipments found"
            description={
              search || statusFilter !== 'ALL'
                ? 'No shipments match your search criteria. Try adjusting or clearing your filters.'
                : 'No shipments have been created yet. Shipments are automatically generated upon customer order fulfillment.'
            }
            action={
              search || statusFilter !== 'ALL' ? (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={resetFilters}
                >
                  Reset Filters
                </button>
              ) : undefined
            }
          />`;
content = content.replace(emptyStateRegex, newEmptyState);

// 7. Remove the Create Shipment Modal JSX
const modalRegex = /      \{\/\* ── CREATE SHIPMENT MODAL ──[\s\S]*?<\/Modal>\r?\n\r?\n      \{\/\* ── ASSIGN VEHICLE MODAL/;
content = content.replace(modalRegex, '      {/* ── ASSIGN VEHICLE MODAL');

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated src/pages/admin/Shipments.tsx to remove manual Create Shipment UI.');
