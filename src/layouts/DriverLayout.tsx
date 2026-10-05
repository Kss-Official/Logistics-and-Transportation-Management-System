import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import DriverSidebar from '../components/layout/DriverSidebar';
import Header from '../components/layout/Header';
import { driverPortalService } from '../services/driverPortalService';
import type { DriverProfileData } from '../types/driverPortal';

const TITLE_MAP: Record<string, string> = {
  '/driver': 'Dashboard',
  '/driver/dashboard': 'Dashboard',
  '/driver/deliveries': 'My Deliveries',
  '/driver/current-delivery': 'Active Consignment Execution',
  '/driver/route': 'Optimized Transit Route',
  '/driver/live-location': 'Live Fleet Telemetry & GPS',
  '/driver/vehicle': 'My Vehicle & Safety Inspection',
  '/driver/vehicle-inspection': 'My Vehicle & Safety Inspection',
  '/driver/history': 'Completed Trips & Delivery History',
  '/driver/notifications': 'Fleet Dispatch Notifications',
  '/driver/profile': 'Driver Credentials & Licensing',
  '/driver/support': 'Fleet Control Tower Support',
};

export default function DriverLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<DriverProfileData | null>(null);
  const location = useLocation();

  const title = TITLE_MAP[location.pathname] ||
    (location.pathname.startsWith('/driver/deliveries/') ? 'Delivery Details' : 'Driver Portal');

  useEffect(() => {
    let isMounted = true;
    driverPortalService.getProfile().then(prof => {
      if (isMounted) setProfile(prof);
    }).catch(() => {});
    return () => { isMounted = false; };
  }, [location.pathname]);

  return (
    <div className="app-shell driver-app-shell">
      {sidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
          style={{ display: 'block' }}
        />
      )}
      <div className={`driver-sidebar-slot ${sidebarOpen ? 'open' : ''}`}>
        <DriverSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          profile={profile}
        />
      </div>

      <div className="main-wrapper driver-main-wrapper">
        <Header
          breadcrumb={`Driver Portal > ${title}`}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="page-content driver-page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
