import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

const TITLE_MAP: Record<string, string> = {
  '/customer': 'Dashboard',
  '/customer/dashboard': 'Dashboard',
  '/customer/orders': 'My Orders',
  '/customer/orders/create': 'Create Order',
  '/customer/shipments': 'My Shipments',
  '/customer/track': 'Track Shipment',
  '/customer/invoices': 'Invoices',
  '/customer/addresses': 'Addresses',
  '/customer/support': 'Support',
  '/customer/profile': 'Profile',
};

export default function CustomerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const title = TITLE_MAP[location.pathname] || 'Dashboard';

  return (
    <div className="app-shell customer-app-shell">
      {sidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
          style={{ display: 'block' }}
        />
      )}
      <div className={`customer-sidebar-slot ${sidebarOpen ? 'open' : ''}`}>
        <Sidebar
          portal="customer"
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      <div className="main-wrapper customer-main-wrapper">
        <Header
          breadcrumb={`Customer Portal > ${title}`}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="page-content customer-page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
