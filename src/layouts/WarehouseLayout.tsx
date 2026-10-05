import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import WarehouseSidebar from '../components/layout/WarehouseSidebar';
import Header from '../components/layout/Header';

const TITLE_MAP: Record<string, string> = {
  '/warehouse/dashboard': 'Dashboard',
  '/warehouse/orders': 'My Orders',
  '/warehouse/my-orders': 'My Orders',
  '/warehouse/inventory': 'Inventory',
  '/warehouse/outgoing': 'Outgoing Shipments',
  '/warehouse/dispatch': 'Dispatch Console',
  '/warehouse/driver-tracking': 'Driver Tracking',
  '/warehouse/vehicle-tracking': 'Vehicle Tracking',
  '/warehouse/live-map': 'Live Map',
  '/warehouse/details': 'Warehouse Details',
  '/warehouse/inventory-history': 'Inventory History',
  '/warehouse/reports': 'Analytics & Reports',
  '/warehouse/notifications': 'Operational Notifications',
  '/warehouse/profile': 'Warehouse Manager Profile',
  '/warehouse/support': 'Help & Support',
};

export default function WarehouseLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = TITLE_MAP[location.pathname] || 'Warehouse Portal';

  return (
    <div className="app-shell wh-app-shell">
      {sidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
          style={{ display: 'block' }}
        />
      )}
      <div className={`wh-sidebar-slot ${sidebarOpen ? 'open' : ''}`}>
        <WarehouseSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="main-wrapper wh-main-wrapper">
        <Header
          breadcrumb={`Warehouse Portal > ${title}`}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="page-content wh-page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
