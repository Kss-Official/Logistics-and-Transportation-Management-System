import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

const TITLE_MAP: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/orders': 'Manage Orders',
  '/admin/shipments': 'Manage Shipments',
  '/admin/customers': 'Customers',
  '/admin/drivers': 'Drivers',
  '/admin/vehicles': 'Vehicles',
  '/admin/routes': 'Routes',
  '/admin/warehouses': 'Warehouses',
  '/admin/invoices': 'Invoices & Billing',
  '/admin/reports': 'Reports & Analytics',
  '/admin/support': 'Support Tickets',
  '/admin/settings': 'Settings',
};

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = TITLE_MAP[location.pathname] || 'Admin Portal';

  return (
    <div className="app-shell admin-app-shell">
      {sidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
          style={{ display: 'block' }}
        />
      )}
      <div className={`admin-sidebar-slot ${sidebarOpen ? 'open' : ''}`}>
        <Sidebar
          portal="admin"
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      <div className="main-wrapper admin-main-wrapper">
        <Header
          breadcrumb={`Admin Portal > ${title}`}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="page-content admin-page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
