import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Public Multi-Page Site
import Home from '../pages/Home';
import Solutions from '../pages/Solutions';
import Services from '../pages/Services';
import Platform from '../pages/Platform';
import Tracking from '../pages/Tracking';
import About from '../pages/About';
import Contact from '../pages/Contact';
import Portals from '../pages/Portals';
import FAQPage from '../pages/FAQPage';

// Auth Pages
import SignInAdmin from '../pages/SignInAdmin';
import SignInCustomer from '../pages/SignInCustomer';
import SignInWarehouse from '../pages/SignInWarehouse';
import SignInDriver from '../pages/SignInDriver';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';

// Layouts
import AdminLayout from '../layouts/AdminLayout';
import CustomerLayout from '../layouts/CustomerLayout';
import WarehouseLayout from '../layouts/WarehouseLayout';
import DriverLayout from '../layouts/DriverLayout';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminOrders from '../pages/admin/Orders';
import AdminShipments from '../pages/admin/Shipments';
import AdminCustomers from '../pages/admin/Customers';
import AdminDrivers from '../pages/admin/Drivers';
import AdminVehicles from '../pages/admin/Vehicles';
import AdminRoutesPage from '../pages/admin/Routes';
import AdminWarehouses from '../pages/admin/Warehouses';
import AdminInvoices from '../pages/admin/Invoices';
import AdminReports from '../pages/admin/Reports';
import AdminSupport from '../pages/admin/Support';
import AdminSettings from '../pages/admin/Settings';
import AdminNotifications from '../pages/admin/Notifications';

// Customer Pages
import CustomerDashboard from '../pages/customer/CustomerDashboard';
import CustomerOrders from '../pages/customer/MyOrders';
import CustomerCreateOrder from '../pages/customer/CreateOrder';
import CustomerShipments from '../pages/customer/MyShipments';
import CustomerTrackShipment from '../pages/customer/TrackShipment';
import CustomerInvoices from '../pages/customer/Invoices';
import CustomerAddresses from '../pages/customer/Addresses';
import CustomerSupport from '../pages/customer/Support';
import CustomerProfile from '../pages/customer/Profile';
import CustomerNotifications from '../pages/customer/Notifications';

// Warehouse Manager Pages
import WarehouseDashboard from '../pages/warehouse/Dashboard';
import WarehouseMyOrders from '../pages/warehouse/MyOrders';
import WarehouseInventory from '../pages/warehouse/Inventory';
import WarehouseInventoryHistory from '../pages/warehouse/InventoryHistory';
import WarehouseOutgoingShipments from '../pages/warehouse/OutgoingShipments';
import WarehouseDispatch from '../pages/warehouse/Dispatch';
import WarehouseDriverTracking from '../pages/warehouse/DriverTracking';
import WarehouseVehicleTracking from '../pages/warehouse/VehicleTracking';
import WarehouseLiveMap from '../pages/warehouse/LiveMap';
import WarehouseDetails from '../pages/warehouse/WarehouseDetails';
import WarehouseReports from '../pages/warehouse/Reports';
import WarehouseNotifications from '../pages/warehouse/Notifications';
import WarehouseProfile from '../pages/warehouse/Profile';
import WarehouseSupport from '../pages/warehouse/Support';

// Driver Pages
import DriverDashboard from '../pages/driver/DriverDashboard';
import DriverDeliveries from '../pages/driver/DriverDeliveries';
import DriverDeliveryDetails from '../pages/driver/DriverDeliveryDetails';
import DriverCurrentDelivery from '../pages/driver/DriverCurrentDelivery';
import DriverRoute from '../pages/driver/DriverRoute';
import DriverLiveLocation from '../pages/driver/DriverLiveLocation';
import DriverVehicle from '../pages/driver/DriverVehicle';
import DriverVehicleInspection from '../pages/driver/DriverVehicleInspection';
import DriverHistory from '../pages/driver/DriverHistory';
import DriverNotifications from '../pages/driver/DriverNotifications';
import DriverProfile from '../pages/driver/DriverProfile';
import DriverSupport from '../pages/driver/DriverSupport';

import SignInPortal from '../pages/SignInPortal';

export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Public Multi-Page Routes ── */}
      <Route path="/" element={<Home />} />
      <Route path="/solutions" element={<Solutions />} />
      <Route path="/services" element={<Services />} />
      <Route path="/platform" element={<Platform />} />
      <Route path="/tracking" element={<Tracking />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/portals" element={<Portals />} />
      <Route path="/faq" element={<FAQPage />} />

      {/* ── Auth Flow & Portal Selector ── */}
      <Route path="/signin" element={<SignInPortal />} />
      <Route path="/signin/portal" element={<SignInPortal />} />
      <Route path="/signin/portals" element={<SignInPortal />} />

      {/* Role-specific login pages */}
      <Route path="/signin/admin" element={<SignInAdmin />} />
      <Route path="/signin/customer" element={<SignInCustomer />} />
      <Route path="/signin/warehouse" element={<SignInWarehouse />} />
      <Route path="/signin/driver" element={<SignInDriver />} />
      <Route path="/signin-driver" element={<Navigate to="/signin/driver" replace />} />

      {/* Public Registration & Password Recovery */}
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ── Admin Portal Routes (role-protected) ── */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="ADMIN">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="shipments" element={<AdminShipments />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="drivers" element={<AdminDrivers />} />
        <Route path="vehicles" element={<AdminVehicles />} />
        <Route path="routes" element={<AdminRoutesPage />} />
        <Route path="warehouses" element={<AdminWarehouses />} />
        <Route path="invoices" element={<AdminInvoices />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="support" element={<AdminSupport />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="notifications" element={<AdminNotifications />} />
      </Route>

      {/* ── Customer Portal Routes (role-protected) ── */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute allowedRole="CUSTOMER">
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/customer/dashboard" replace />} />
        <Route path="dashboard" element={<CustomerDashboard />} />
        <Route path="orders" element={<CustomerOrders />} />
        <Route path="orders/create" element={<CustomerCreateOrder />} />
        <Route path="shipments" element={<CustomerShipments />} />
        <Route path="track" element={<CustomerTrackShipment />} />
        <Route path="invoices" element={<CustomerInvoices />} />
        <Route path="addresses" element={<CustomerAddresses />} />
        <Route path="support" element={<CustomerSupport />} />
        <Route path="profile" element={<CustomerProfile />} />
        <Route path="notifications" element={<CustomerNotifications />} />
      </Route>

      {/* ── Warehouse Manager Portal Routes (role-protected) ── */}
      <Route
        path="/warehouse"
        element={
          <ProtectedRoute allowedRole="WAREHOUSE_MANAGER">
            <WarehouseLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/warehouse/dashboard" replace />} />
        <Route path="dashboard" element={<WarehouseDashboard />} />
        <Route path="orders" element={<WarehouseMyOrders />} />
        <Route path="my-orders" element={<Navigate to="/warehouse/orders" replace />} />
        <Route path="inventory" element={<WarehouseInventory />} />
        <Route path="outgoing" element={<WarehouseOutgoingShipments />} />
        <Route path="dispatch" element={<WarehouseDispatch />} />
        <Route path="driver-tracking" element={<WarehouseDriverTracking />} />
        <Route path="vehicle-tracking" element={<WarehouseVehicleTracking />} />
        <Route path="live-map" element={<WarehouseLiveMap />} />
        <Route path="details" element={<WarehouseDetails />} />
        <Route path="inventory-history" element={<WarehouseInventoryHistory />} />
        <Route path="reports" element={<WarehouseReports />} />
        <Route path="notifications" element={<WarehouseNotifications />} />
        <Route path="profile" element={<WarehouseProfile />} />
        <Route path="support" element={<WarehouseSupport />} />

        {/* Backward-compatibility aliases for earlier path conventions */}
        <Route path="shipments/outgoing" element={<Navigate to="/warehouse/outgoing" replace />} />
        <Route path="tracking/drivers" element={<Navigate to="/warehouse/driver-tracking" replace />} />
        <Route path="tracking/vehicles" element={<Navigate to="/warehouse/vehicle-tracking" replace />} />
        <Route path="tracking/map" element={<Navigate to="/warehouse/live-map" replace />} />
        <Route path="facility" element={<Navigate to="/warehouse/details" replace />} />
        <Route path="inventory/history" element={<Navigate to="/warehouse/inventory-history" replace />} />

        {/* Authenticated warehouse fallback: keep user inside warehouse if route not recognized */}
        <Route path="*" element={<Navigate to="/warehouse/dashboard" replace />} />
      </Route>

      {/* ── Driver Portal Routes (role-protected) ── */}
      <Route
        path="/driver"
        element={
          <ProtectedRoute allowedRole="DRIVER">
            <DriverLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/driver/dashboard" replace />} />
        <Route path="dashboard" element={<DriverDashboard />} />
        <Route path="deliveries" element={<DriverDeliveries />} />
        <Route path="deliveries/:id" element={<DriverDeliveryDetails />} />
        <Route path="current-delivery" element={<DriverCurrentDelivery />} />
        <Route path="pickup" element={<Navigate to="/driver/current-delivery" replace />} />
        <Route path="delivery" element={<Navigate to="/driver/current-delivery" replace />} />
        <Route path="route" element={<DriverRoute />} />
        <Route path="live-location" element={<DriverLiveLocation />} />
        <Route path="vehicle" element={<DriverVehicle />} />
        <Route path="vehicle-inspection" element={<Navigate to="/driver/vehicle" replace />} />
        <Route path="history" element={<DriverHistory />} />
        <Route path="notifications" element={<DriverNotifications />} />
        <Route path="profile" element={<DriverProfile />} />
        <Route path="support" element={<DriverSupport />} />

        {/* Authenticated driver fallback: keep user inside driver dashboard */}
        <Route path="*" element={<Navigate to="/driver/dashboard" replace />} />
      </Route>

      {/* ── Catch-all → Home ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
