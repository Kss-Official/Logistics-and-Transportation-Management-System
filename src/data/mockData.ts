/**
 * mockData.ts
 * -----------------------------------------------------------------
 * All mock data for PrimeRoute Logistics LTMS.
 * Data shapes mirror planned Spring Boot REST API DTOs.
 * Replace with Axios calls to Spring Boot endpoints when ready:
 *
 *   GET /api/orders          → orders
 *   GET /api/shipments       → shipments
 *   GET /api/customers       → customers
 *   GET /api/vehicles        → vehicles
 *   GET /api/drivers         → drivers
 *   GET /api/warehouses      → warehouses
 *   GET /api/invoices        → invoices
 *   GET /api/routes          → routes
 *   GET /api/support-tickets → supportTickets
 * -----------------------------------------------------------------
 */

import type { Order } from '../types/order';
import type { Shipment } from '../types/shipment';
import type { Customer } from '../types/customer';
import type { Vehicle } from '../types/vehicle';
import type { Driver } from '../types/driver';
import type { Invoice } from '../types/invoice';
import type { Warehouse, Route, SupportTicket } from '../types/warehouse';

// ─── Orders ────────────────────────────────────────────────────
export const mockOrders: Order[] = [
  {
    id: 'ORD-58231', customerId: 'CUST-1042', customer: 'Rohan Mehta',
    customerEmail: 'rohan.mehta@example.com',
    date: '2026-09-01', createdAt: '2026-09-01T09:00:00',
    pickupAddress: '24, MG Road, Bengaluru, Karnataka 560001',
    pickupContact: 'Rohan Mehta', pickupPhone: '+91 98450 11234',
    destination: 'Koramangala, Bengaluru', receiverName: 'Amit Shah', receiverPhone: '+91 98765 43210',
    packageType: 'Standard box', weight: 5.2, length: 40, width: 30, height: 25, quantity: 2,
    priority: 'Express',
    baseCharge: 250, weightCharge: 197.6, priorityCharge: 236.6, amount: 2450,
    tax: 220, total: 2670, paymentStatus: 'PENDING', status: 'SHIPPED',
    tracking: 'TRK-2026-000123', expectedDelivery: '2026-09-03',
  },
  {
    id: 'ORD-58230', customerId: 'CUST-1043', customer: 'Priya Nair',
    customerEmail: 'priya.nair@example.com',
    date: '2026-08-31', createdAt: '2026-08-31T10:30:00',
    pickupAddress: '12, Bandra West, Mumbai, Maharashtra 400050',
    pickupContact: 'Priya Nair', pickupPhone: '+91 90080 44321',
    destination: 'Andheri, Mumbai', receiverName: 'Deepa Nair', receiverPhone: '+91 99100 11223',
    packageType: 'Document', weight: 1.0, length: 35, width: 25, height: 5, quantity: 1,
    priority: 'Standard',
    baseCharge: 250, weightCharge: 38, priorityCharge: 0, amount: 1180,
    tax: 106, total: 1286, paymentStatus: 'PAID', status: 'DELIVERED',
    tracking: 'TRK-2026-000119', expectedDelivery: '2026-09-01',
  },
  {
    id: 'ORD-58229', customerId: 'CUST-1044', customer: 'Aditya Rao',
    customerEmail: 'aditya.rao@example.com',
    date: '2026-08-31', createdAt: '2026-08-31T14:15:00',
    pickupAddress: '88, Koramangala 4th Block, Bengaluru 560034',
    pickupContact: 'Aditya Rao', pickupPhone: '+91 99720 55889',
    destination: 'Sector 62, Noida', receiverName: 'Rakesh Rao', receiverPhone: '+91 88001 22334',
    packageType: 'Pallet', weight: 22.5, length: 120, width: 80, height: 60, quantity: 3,
    priority: 'Express',
    baseCharge: 250, weightCharge: 855, priorityCharge: 1368, amount: 3920,
    tax: 353, total: 4273, paymentStatus: 'PENDING', status: 'PROCESSING',
    tracking: 'TRK-2026-000117', expectedDelivery: '2026-09-04',
  },
  {
    id: 'ORD-58228', customerId: 'CUST-1042', customer: 'Rohan Mehta',
    customerEmail: 'rohan.mehta@example.com',
    date: '2026-08-30', createdAt: '2026-08-30T11:00:00',
    pickupAddress: '24, MG Road, Bengaluru, Karnataka 560001',
    pickupContact: 'Rohan Mehta', pickupPhone: '+91 98450 11234',
    destination: 'HSR Layout, Bengaluru', receiverName: 'Sneha Mehta', receiverPhone: '+91 98450 22345',
    packageType: 'Fragile', weight: 2.0, length: 30, width: 20, height: 20, quantity: 1,
    priority: 'Same Day',
    baseCharge: 250, weightCharge: 76, priorityCharge: 358.8, amount: 860,
    tax: 77, total: 937, paymentStatus: 'PAID', status: 'CONFIRMED',
    tracking: 'TRK-2026-000114', expectedDelivery: '2026-08-30',
  },
  {
    id: 'ORD-58227', customerId: 'CUST-1045', customer: 'Sana Sheikh',
    customerEmail: 'sana.sheikh@example.com',
    date: '2026-08-29', createdAt: '2026-08-29T09:30:00',
    pickupAddress: '5, Anna Salai, Chennai 600002',
    pickupContact: 'Sana Sheikh', pickupPhone: '+91 98110 22765',
    destination: 'T Nagar, Chennai', receiverName: 'Faisal Sheikh', receiverPhone: '+91 98110 33876',
    packageType: 'Oversized', weight: 45.0, length: 200, width: 100, height: 80, quantity: 1,
    priority: 'Standard',
    baseCharge: 250, weightCharge: 1710, priorityCharge: 0, amount: 5100,
    tax: 459, total: 5559, paymentStatus: 'FAILED', status: 'CANCELLED',
    tracking: '—', expectedDelivery: '2026-09-02',
  },
  {
    id: 'ORD-58226', customerId: 'CUST-1043', customer: 'Priya Nair',
    customerEmail: 'priya.nair@example.com',
    date: '2026-08-28', createdAt: '2026-08-28T15:45:00',
    pickupAddress: '12, Bandra West, Mumbai 400050',
    pickupContact: 'Priya Nair', pickupPhone: '+91 90080 44321',
    destination: 'Powai, Mumbai', receiverName: 'Ramesh Desai', receiverPhone: '+91 77001 55667',
    packageType: 'Standard box', weight: 3.5, length: 35, width: 25, height: 25, quantity: 2,
    priority: 'Standard',
    baseCharge: 250, weightCharge: 133, priorityCharge: 0, amount: 1750,
    tax: 157, total: 1907, paymentStatus: 'PENDING', status: 'NEW',
    tracking: '—', expectedDelivery: '2026-09-01',
  },
  {
    id: 'ORD-58225', customerId: 'CUST-1046', customer: 'Vikram Singh',
    customerEmail: 'vikram.singh@example.com',
    date: '2026-08-27', createdAt: '2026-08-27T08:00:00',
    pickupAddress: '14, Connaught Place, New Delhi 110001',
    pickupContact: 'Vikram Singh', pickupPhone: '+91 97001 66778',
    destination: 'Gurugram, Haryana', receiverName: 'Anjali Singh', receiverPhone: '+91 97001 77889',
    packageType: 'Standard box', weight: 8.0, length: 60, width: 40, height: 35, quantity: 4,
    priority: 'Express',
    baseCharge: 250, weightCharge: 304, priorityCharge: 486.4, amount: 2840,
    tax: 255, total: 3095, paymentStatus: 'PAID', status: 'DELIVERED',
    tracking: 'TRK-2026-000109', expectedDelivery: '2026-08-29',
  },
  {
    id: 'ORD-58224', customerId: 'CUST-1047', customer: 'Meena Pillai',
    customerEmail: 'meena.pillai@example.com',
    date: '2026-08-26', createdAt: '2026-08-26T13:00:00',
    pickupAddress: '77, Velachery Main Road, Chennai 600042',
    pickupContact: 'Meena Pillai', pickupPhone: '+91 80001 44556',
    destination: 'Electronic City, Bengaluru', receiverName: 'Suresh Kumar', receiverPhone: '+91 80001 55667',
    packageType: 'Fragile', weight: 6.5, length: 50, width: 40, height: 30, quantity: 2,
    priority: 'Standard',
    baseCharge: 250, weightCharge: 247, priorityCharge: 0, amount: 1920,
    tax: 172, total: 2092, paymentStatus: 'PAID', status: 'DELIVERED',
    tracking: 'TRK-2026-000106', expectedDelivery: '2026-08-28',
  },
  {
    id: 'ORD-58223', customerId: 'CUST-1044', customer: 'Aditya Rao',
    customerEmail: 'aditya.rao@example.com',
    date: '2026-08-25', createdAt: '2026-08-25T10:00:00',
    pickupAddress: '88, Koramangala 4th Block, Bengaluru 560034',
    pickupContact: 'Aditya Rao', pickupPhone: '+91 99720 55889',
    destination: 'Whitefield, Bengaluru', receiverName: 'Padma Rao', receiverPhone: '+91 99720 66990',
    packageType: 'Standard box', weight: 4.0, length: 40, width: 30, height: 30, quantity: 1,
    priority: 'Same Day',
    baseCharge: 250, weightCharge: 152, priorityCharge: 664.4, amount: 2230,
    tax: 200, total: 2430, paymentStatus: 'PENDING', status: 'READY_FOR_SHIPMENT',
    tracking: 'TRK-2026-000103', expectedDelivery: '2026-08-25',
  },
  {
    id: 'ORD-58222', customerId: 'CUST-1048', customer: 'Ravi Teja',
    customerEmail: 'ravi.teja@example.com',
    date: '2026-08-24', createdAt: '2026-08-24T16:30:00',
    pickupAddress: '32, Banjara Hills, Hyderabad 500034',
    pickupContact: 'Ravi Teja', pickupPhone: '+91 90001 88990',
    destination: 'Jubilee Hills, Hyderabad', receiverName: 'Kavya Reddy', receiverPhone: '+91 90001 99001',
    packageType: 'Document', weight: 0.5, length: 30, width: 22, height: 3, quantity: 5,
    priority: 'Standard',
    baseCharge: 250, weightCharge: 19, priorityCharge: 0, amount: 690,
    tax: 62, total: 752, paymentStatus: 'PAID', status: 'DELIVERED',
    tracking: 'TRK-2026-000098', expectedDelivery: '2026-08-26',
  },
];

// ─── Shipments ──────────────────────────────────────────────────
export const mockShipments: Shipment[] = [
  {
    id: 'SHP-001', trackingNumber: 'TRK-2026-000123',
    orderId: 'ORD-58231', customerId: 'CUST-1042', customer: 'Rohan Mehta',
    origin: 'Bengaluru Central WH, Whitefield', destination: 'Koramangala, Bengaluru',
    warehouseId: 'WH-01', warehouse: 'Bengaluru Central',
    vehicleId: 'VH-118', vehicle: 'Tata Signa 4623', vehicleReg: 'KA-05-AB-4471',
    driverId: 'DRV-201', driver: 'Manoj Kumar', driverPhone: '+91 90001 12233',
    currentLocation: 'NH-48, near Hosur', status: 'In Transit',
    route: 'Bengaluru → Koramangala', expectedDelivery: '2026-09-03',
    weight: 5.2,
    timeline: [
      { status: 'Order Confirmed', location: 'Bengaluru Central', time: '09:00 AM, 1 Sep' },
      { status: 'Picked Up', location: 'Bengaluru Central', time: '11:30 AM, 1 Sep' },
      { status: 'Arrived at Warehouse', location: 'Bengaluru Central WH', time: '02:15 PM, 1 Sep' },
      { status: 'Processing', location: 'Bengaluru Central WH', time: '04:00 PM, 1 Sep' },
      { status: 'Dispatched', location: 'Bengaluru Central WH', time: '06:00 PM, 1 Sep' },
      { status: 'In Transit', location: 'NH-48, near Hosur', time: '10:30 AM, 2 Sep', current: true },
      { status: 'Out for Delivery', location: 'Koramangala Hub', time: null, upcoming: true },
      { status: 'Delivered', location: '—', time: null, upcoming: true },
    ],
  },
  {
    id: 'SHP-002', trackingNumber: 'TRK-2026-000119',
    orderId: 'ORD-58230', customerId: 'CUST-1043', customer: 'Priya Nair',
    origin: 'Mumbai West WH, Andheri', destination: 'Andheri, Mumbai',
    warehouseId: 'WH-02', warehouse: 'Mumbai West',
    vehicleId: 'VH-104', vehicle: 'Ashok Leyland Dost', vehicleReg: 'MH-12-CD-9081',
    driverId: 'DRV-202', driver: 'Farhan Ali', driverPhone: '+91 90002 44556',
    currentLocation: 'Andheri East Hub', status: 'Delivered',
    route: 'Mumbai → Andheri', expectedDelivery: '2026-09-01',
    actualDelivery: '2026-09-01',
    weight: 1.0,
    timeline: [
      { status: 'Order Confirmed', location: 'Mumbai West WH', time: '10:30 AM, 31 Aug' },
      { status: 'Picked Up', location: 'Bandra West', time: '12:00 PM, 31 Aug' },
      { status: 'Arrived at Warehouse', location: 'Mumbai West WH', time: '01:30 PM, 31 Aug' },
      { status: 'Processing', location: 'Mumbai West WH', time: '03:00 PM, 31 Aug' },
      { status: 'Dispatched', location: 'Mumbai West WH', time: '05:00 PM, 31 Aug' },
      { status: 'In Transit', location: 'Western Express Highway', time: '07:00 AM, 1 Sep' },
      { status: 'Out for Delivery', location: 'Andheri Hub', time: '10:00 AM, 1 Sep' },
      { status: 'Delivered', location: 'Andheri, Mumbai', time: '12:45 PM, 1 Sep' },
    ],
  },
  {
    id: 'SHP-003', trackingNumber: 'TRK-2026-000117',
    orderId: 'ORD-58229', customerId: 'CUST-1044', customer: 'Aditya Rao',
    origin: 'Bengaluru Central WH, Whitefield', destination: 'Sector 62, Noida',
    warehouseId: 'WH-01', warehouse: 'Bengaluru Central',
    vehicleId: 'VH-096', vehicle: 'Mahindra Supro', vehicleReg: 'DL-01-EF-2290',
    driverId: 'DRV-204', driver: 'Deepak Yadav', driverPhone: '+91 90004 99001',
    currentLocation: 'Bengaluru Central WH', status: 'Processing',
    route: 'Bengaluru → Noida', expectedDelivery: '2026-09-04',
    weight: 22.5,
    timeline: [
      { status: 'Order Confirmed', location: 'Bengaluru Central', time: '02:15 PM, 31 Aug' },
      { status: 'Picked Up', location: 'Koramangala 4th Block', time: '04:00 PM, 31 Aug' },
      { status: 'Arrived at Warehouse', location: 'Bengaluru Central WH', time: '06:30 PM, 31 Aug' },
      { status: 'Processing', location: 'Bengaluru Central WH', time: '09:00 AM, 1 Sep', current: true },
      { status: 'Dispatched', location: '—', time: null, upcoming: true },
      { status: 'In Transit', location: '—', time: null, upcoming: true },
      { status: 'Out for Delivery', location: '—', time: null, upcoming: true },
      { status: 'Delivered', location: '—', time: null, upcoming: true },
    ],
  },
  {
    id: 'SHP-004', trackingNumber: 'TRK-2026-000109',
    orderId: 'ORD-58225', customerId: 'CUST-1046', customer: 'Vikram Singh',
    origin: 'Delhi NCR Hub, Gurugram', destination: 'Gurugram, Haryana',
    warehouseId: 'WH-03', warehouse: 'Delhi NCR Hub',
    vehicleId: 'VH-096', vehicle: 'Mahindra Supro', vehicleReg: 'DL-01-EF-2290',
    driverId: 'DRV-204', driver: 'Deepak Yadav', driverPhone: '+91 90004 99001',
    currentLocation: 'Gurugram', status: 'Delivered',
    route: 'Delhi → Gurugram', expectedDelivery: '2026-08-29',
    actualDelivery: '2026-08-29',
    weight: 8.0,
    timeline: [
      { status: 'Order Confirmed', location: 'Delhi NCR Hub', time: '08:00 AM, 27 Aug' },
      { status: 'Picked Up', location: 'Connaught Place', time: '10:00 AM, 27 Aug' },
      { status: 'Arrived at Warehouse', location: 'Delhi NCR Hub', time: '01:00 PM, 27 Aug' },
      { status: 'Processing', location: 'Delhi NCR Hub', time: '03:00 PM, 27 Aug' },
      { status: 'Dispatched', location: 'Delhi NCR Hub', time: '05:00 AM, 28 Aug' },
      { status: 'In Transit', location: 'NH-48, Gurgaon Road', time: '09:00 AM, 28 Aug' },
      { status: 'Out for Delivery', location: 'Gurugram', time: '11:00 AM, 29 Aug' },
      { status: 'Delivered', location: 'Gurugram, Haryana', time: '02:15 PM, 29 Aug' },
    ],
  },
  {
    id: 'SHP-005', trackingNumber: 'TRK-2026-000114',
    orderId: 'ORD-58228', customerId: 'CUST-1042', customer: 'Rohan Mehta',
    origin: 'Bengaluru Central WH, Whitefield', destination: 'HSR Layout, Bengaluru',
    warehouseId: 'WH-01', warehouse: 'Bengaluru Central',
    vehicleId: 'VH-118', vehicle: 'Tata Signa 4623', vehicleReg: 'KA-05-AB-4471',
    driverId: 'DRV-201', driver: 'Manoj Kumar', driverPhone: '+91 90001 12233',
    currentLocation: 'Bengaluru Central WH', status: 'Shipment Created',
    route: 'Bengaluru → HSR Layout', expectedDelivery: '2026-08-30',
    weight: 2.0,
    timeline: [
      { status: 'Order Confirmed', location: 'Bengaluru Central', time: '11:00 AM, 30 Aug', current: true },
      { status: 'Picked Up', location: '—', time: null, upcoming: true },
      { status: 'Arrived at Warehouse', location: '—', time: null, upcoming: true },
      { status: 'Processing', location: '—', time: null, upcoming: true },
      { status: 'Dispatched', location: '—', time: null, upcoming: true },
      { status: 'In Transit', location: '—', time: null, upcoming: true },
      { status: 'Out for Delivery', location: '—', time: null, upcoming: true },
      { status: 'Delivered', location: '—', time: null, upcoming: true },
    ],
  },
];

// ─── Customers ──────────────────────────────────────────────────
export const mockCustomers: Customer[] = [
  {
    id: 'CUST-1042', name: 'Rohan Mehta', email: 'rohan.mehta@example.com',
    phone: '+91 98450 11234', company: 'Mehta Enterprises',
    status: 'ACTIVE', since: '2024-03-11',
    totalOrders: 12, activeShipments: 1, totalSpent: 28450, pendingPayments: 2670,
    avatarInitials: 'RM',
    addresses: [
      { id: 'ADDR-001', label: 'Home', fullAddress: '24, MG Road, Bengaluru, Karnataka 560001', city: 'Bengaluru', state: 'Karnataka', pincode: '560001', contactPerson: 'Rohan Mehta', phone: '+91 98450 11234', isDefault: true },
      { id: 'ADDR-002', label: 'Office', fullAddress: '14th Floor, RMZ Infinity, Bengaluru 560016', city: 'Bengaluru', state: 'Karnataka', pincode: '560016', contactPerson: 'Rohan Mehta', phone: '+91 98450 11234', isDefault: false },
    ],
  },
  {
    id: 'CUST-1043', name: 'Priya Nair', email: 'priya.nair@example.com',
    phone: '+91 90080 44321', company: 'Nair Textiles Pvt. Ltd.',
    status: 'ACTIVE', since: '2024-06-02',
    totalOrders: 8, activeShipments: 1, totalSpent: 14800, pendingPayments: 1907,
    avatarInitials: 'PN',
    addresses: [
      { id: 'ADDR-003', label: 'Home', fullAddress: '12, Bandra West, Mumbai, Maharashtra 400050', city: 'Mumbai', state: 'Maharashtra', pincode: '400050', contactPerson: 'Priya Nair', phone: '+91 90080 44321', isDefault: true },
      { id: 'ADDR-004', label: 'Warehouse', fullAddress: 'Plot 5, MIDC, Andheri East, Mumbai 400093', city: 'Mumbai', state: 'Maharashtra', pincode: '400093', contactPerson: 'Manager', phone: '+91 90080 55432', isDefault: false },
    ],
  },
  {
    id: 'CUST-1044', name: 'Aditya Rao', email: 'aditya.rao@example.com',
    phone: '+91 99720 55889', company: undefined,
    status: 'ACTIVE', since: '2025-01-19',
    totalOrders: 5, activeShipments: 2, totalSpent: 11360, pendingPayments: 6703,
    avatarInitials: 'AR',
    addresses: [
      { id: 'ADDR-005', label: 'Home', fullAddress: '88, Koramangala 4th Block, Bengaluru 560034', city: 'Bengaluru', state: 'Karnataka', pincode: '560034', contactPerson: 'Aditya Rao', phone: '+91 99720 55889', isDefault: true },
    ],
  },
  {
    id: 'CUST-1045', name: 'Sana Sheikh', email: 'sana.sheikh@example.com',
    phone: '+91 98110 22765', company: 'Sheikh Exports',
    status: 'INACTIVE', since: '2023-11-08',
    totalOrders: 3, activeShipments: 0, totalSpent: 9200, pendingPayments: 5559,
    avatarInitials: 'SS',
    addresses: [
      { id: 'ADDR-006', label: 'Office', fullAddress: '5, Anna Salai, Chennai, Tamil Nadu 600002', city: 'Chennai', state: 'Tamil Nadu', pincode: '600002', contactPerson: 'Sana Sheikh', phone: '+91 98110 22765', isDefault: true },
    ],
  },
  {
    id: 'CUST-1046', name: 'Vikram Singh', email: 'vikram.singh@example.com',
    phone: '+91 97001 66778', company: 'Singh & Associates',
    status: 'ACTIVE', since: '2024-09-15',
    totalOrders: 6, activeShipments: 0, totalSpent: 17500, pendingPayments: 0,
    avatarInitials: 'VS',
    addresses: [
      { id: 'ADDR-007', label: 'Office', fullAddress: '14, Connaught Place, New Delhi 110001', city: 'New Delhi', state: 'Delhi', pincode: '110001', contactPerson: 'Vikram Singh', phone: '+91 97001 66778', isDefault: true },
    ],
  },
  {
    id: 'CUST-1047', name: 'Meena Pillai', email: 'meena.pillai@example.com',
    phone: '+91 80001 44556', company: undefined,
    status: 'ACTIVE', since: '2025-03-22',
    totalOrders: 4, activeShipments: 0, totalSpent: 8300, pendingPayments: 0,
    avatarInitials: 'MP',
    addresses: [
      { id: 'ADDR-008', label: 'Home', fullAddress: '77, Velachery Main Road, Chennai 600042', city: 'Chennai', state: 'Tamil Nadu', pincode: '600042', contactPerson: 'Meena Pillai', phone: '+91 80001 44556', isDefault: true },
    ],
  },
];

// ─── Vehicles ───────────────────────────────────────────────────
export const mockVehicles: Vehicle[] = [
  {
    id: 'VH-118', registrationNumber: 'KA-05-AB-4471', type: 'Container Truck',
    model: 'Signa 4623', make: 'Tata', year: 2022, capacity: '23 T', capacityTons: 23,
    fuelType: 'Diesel', driverId: 'DRV-201', driver: 'Manoj Kumar',
    status: 'IN_TRANSIT', lastService: '2026-07-15', nextService: '2026-10-15',
    totalTrips: 342, currentLocation: 'NH-48, near Hosur',
    insuranceExpiry: '2027-03-31',
  },
  {
    id: 'VH-104', registrationNumber: 'MH-12-CD-9081', type: 'Mini Truck',
    model: 'Dost', make: 'Ashok Leyland', year: 2021, capacity: '1.5 T', capacityTons: 1.5,
    fuelType: 'Diesel', driverId: 'DRV-202', driver: 'Farhan Ali',
    status: 'AVAILABLE', lastService: '2026-08-01', nextService: '2026-11-01',
    totalTrips: 519, currentLocation: 'Andheri Hub, Mumbai',
    insuranceExpiry: '2026-12-31',
  },
  {
    id: 'VH-096', registrationNumber: 'DL-01-EF-2290', type: 'Van',
    model: 'Supro', make: 'Mahindra', year: 2023, capacity: '1 T', capacityTons: 1,
    fuelType: 'CNG', driverId: 'DRV-204', driver: 'Deepak Yadav',
    status: 'ASSIGNED', lastService: '2026-08-20', nextService: '2026-11-20',
    totalTrips: 271, currentLocation: 'Bengaluru Central WH',
    insuranceExpiry: '2027-06-30',
  },
  {
    id: 'VH-077', registrationNumber: 'TN-09-GH-6612', type: 'Truck',
    model: 'Pro 3015', make: 'Eicher', year: 2020, capacity: '9 T', capacityTons: 9,
    fuelType: 'Diesel', driver: '—',
    status: 'MAINTENANCE', lastService: '2026-09-01', nextService: '2026-09-15',
    totalTrips: 198, insuranceExpiry: '2026-11-30',
  },
  {
    id: 'VH-062', registrationNumber: 'MH-04-IJ-7732', type: 'Truck',
    model: 'Super Ace', make: 'Tata', year: 2022, capacity: '2 T', capacityTons: 2,
    fuelType: 'Petrol', driver: '—',
    status: 'AVAILABLE', lastService: '2026-07-01', nextService: '2026-10-01',
    totalTrips: 412, insuranceExpiry: '2027-01-15',
  },
  {
    id: 'VH-051', registrationNumber: 'KA-01-KL-1144', type: 'Container Truck',
    model: 'Prima 4028.S', make: 'Tata', year: 2021, capacity: '40 T', capacityTons: 40,
    fuelType: 'Diesel', driver: '—',
    status: 'AVAILABLE', lastService: '2026-08-10', nextService: '2026-11-10',
    totalTrips: 156, insuranceExpiry: '2027-04-30',
  },
];

// ─── Drivers ────────────────────────────────────────────────────
export const mockDrivers: Driver[] = [
  {
    id: 'DRV-201', name: 'Manoj Kumar', email: 'manoj.k@primeroute.com',
    phone: '+91 90001 12233', licenseNumber: 'KA05-2029',
    licenseExpiry: '2029-06-30', vehicleId: 'VH-118',
    assignedVehicle: 'Tata Signa 4623', assignedVehicleReg: 'KA-05-AB-4471',
    status: 'ON_DELIVERY', totalDeliveries: 342, onTimeDeliveries: 318, rating: 4.8,
    joinedDate: '2022-01-15', currentShipment: 'TRK-2026-000123',
    avatarInitials: 'MK',
  },
  {
    id: 'DRV-202', name: 'Farhan Ali', email: 'farhan.a@primeroute.com',
    phone: '+91 90002 44556', licenseNumber: 'MH12-2027',
    licenseExpiry: '2027-08-31', vehicleId: 'VH-104',
    assignedVehicle: 'Ashok Leyland Dost', assignedVehicleReg: 'MH-12-CD-9081',
    status: 'AVAILABLE', totalDeliveries: 519, onTimeDeliveries: 498, rating: 4.9,
    joinedDate: '2021-06-01', avatarInitials: 'FA',
  },
  {
    id: 'DRV-203', name: 'Suresh Pillai', email: 'suresh.p@primeroute.com',
    phone: '+91 90003 77889', licenseNumber: 'TN09-2026',
    licenseExpiry: '2026-12-31', vehicleId: undefined,
    assignedVehicle: '—', assignedVehicleReg: '—',
    status: 'OFF_DUTY', totalDeliveries: 118, onTimeDeliveries: 105, rating: 4.5,
    joinedDate: '2024-02-10', avatarInitials: 'SP',
  },
  {
    id: 'DRV-204', name: 'Deepak Yadav', email: 'deepak.y@primeroute.com',
    phone: '+91 90004 99001', licenseNumber: 'DL01-2028',
    licenseExpiry: '2028-03-31', vehicleId: 'VH-096',
    assignedVehicle: 'Mahindra Supro', assignedVehicleReg: 'DL-01-EF-2290',
    status: 'AVAILABLE', totalDeliveries: 271, onTimeDeliveries: 258, rating: 4.7,
    joinedDate: '2023-04-01', avatarInitials: 'DY',
  },
  {
    id: 'DRV-205', name: 'Ramesh Gowda', email: 'ramesh.g@primeroute.com',
    phone: '+91 90005 11223', licenseNumber: 'KA02-2030',
    licenseExpiry: '2030-05-31', vehicleId: undefined,
    assignedVehicle: '—', assignedVehicleReg: '—',
    status: 'AVAILABLE', totalDeliveries: 88, onTimeDeliveries: 82, rating: 4.6,
    joinedDate: '2025-01-10', avatarInitials: 'RG',
  },
];

// ─── Warehouses ─────────────────────────────────────────────────
export const mockWarehouses: Warehouse[] = [
  {
    id: 'WH-01', name: 'Bengaluru Central', location: 'Whitefield, Bengaluru',
    city: 'Bengaluru', state: 'Karnataka',
    managerId: 'MGR-001', manager: 'K. Suresh', managerPhone: '+91 98001 11001',
    totalCapacity: 4000, usedCapacity: 3120, activeShipments: 42,
    status: 'ACTIVE', contactEmail: 'blr.central@primeroute.com',
    openingHours: 'Mon–Sat, 6:00 AM – 10:00 PM',
  },
  {
    id: 'WH-02', name: 'Mumbai West', location: 'Andheri, Mumbai',
    city: 'Mumbai', state: 'Maharashtra',
    managerId: 'MGR-002', manager: 'R. Deshpande', managerPhone: '+91 98001 22002',
    totalCapacity: 3200, usedCapacity: 3050, activeShipments: 18,
    status: 'FULL', contactEmail: 'mum.west@primeroute.com',
    openingHours: 'Mon–Sat, 7:00 AM – 9:00 PM',
  },
  {
    id: 'WH-03', name: 'Delhi NCR Hub', location: 'Gurugram, Haryana',
    city: 'Gurugram', state: 'Haryana',
    managerId: 'MGR-003', manager: 'N. Kapoor', managerPhone: '+91 98001 33003',
    totalCapacity: 5000, usedCapacity: 2100, activeShipments: 26,
    status: 'ACTIVE', contactEmail: 'del.ncr@primeroute.com',
    openingHours: 'Mon–Sun, 6:00 AM – 11:00 PM',
  },
  {
    id: 'WH-04', name: 'Chennai Port Yard', location: 'Ennore, Chennai',
    city: 'Chennai', state: 'Tamil Nadu',
    managerId: 'MGR-004', manager: 'V. Ilango', managerPhone: '+91 98001 44004',
    totalCapacity: 2600, usedCapacity: 0, activeShipments: 0,
    status: 'MAINTENANCE', contactEmail: 'che.port@primeroute.com',
    openingHours: 'Mon–Fri, 8:00 AM – 6:00 PM',
  },
  {
    id: 'WH-05', name: 'Hyderabad Central', location: 'Shamshabad, Hyderabad',
    city: 'Hyderabad', state: 'Telangana',
    managerId: 'MGR-005', manager: 'A. Reddy', managerPhone: '+91 98001 55005',
    totalCapacity: 3500, usedCapacity: 1890, activeShipments: 14,
    status: 'ACTIVE', contactEmail: 'hyd.central@primeroute.com',
    openingHours: 'Mon–Sat, 7:00 AM – 10:00 PM',
  },
];

// ─── Routes ─────────────────────────────────────────────────────
export const mockRoutes: Route[] = [
  {
    id: 'RTE-001', origin: 'Bengaluru Central WH, Whitefield', destination: 'Koramangala Hub',
    originCity: 'Bengaluru', destinationCity: 'Bengaluru',
    distanceKm: 18, estimatedTimeHours: 1.5,
    vehicleId: 'VH-118', vehicle: 'Tata Signa 4623 (KA-05-AB-4471)',
    driverId: 'DRV-201', driver: 'Manoj Kumar',
    activeShipments: 1, totalShipments: 128, status: 'ACTIVE', avgRating: 4.8,
  },
  {
    id: 'RTE-002', origin: 'Mumbai West WH, Andheri', destination: 'Kolkata Central WH',
    originCity: 'Mumbai', destinationCity: 'Kolkata',
    distanceKm: 2080, estimatedTimeHours: 36,
    vehicleId: 'VH-051', vehicle: 'Tata Prima 4028.S (KA-01-KL-1144)',
    driverId: 'DRV-202', driver: 'Farhan Ali',
    activeShipments: 2, totalShipments: 64, status: 'ACTIVE', avgRating: 4.6,
  },
  {
    id: 'RTE-003', origin: 'Chennai Port Yard, Ennore', destination: 'Bengaluru Central WH',
    originCity: 'Chennai', destinationCity: 'Bengaluru',
    distanceKm: 345, estimatedTimeHours: 6,
    vehicleId: undefined, vehicle: 'Unassigned',
    driverId: undefined, driver: 'Unassigned',
    activeShipments: 0, totalShipments: 41, status: 'INACTIVE', avgRating: 4.4,
  },
  {
    id: 'RTE-004', origin: 'Hyderabad Central WH, Shamshabad', destination: 'Pune Hub',
    originCity: 'Hyderabad', destinationCity: 'Pune',
    distanceKm: 563, estimatedTimeHours: 9,
    vehicleId: 'VH-096', vehicle: 'Mahindra Supro (DL-01-EF-2290)',
    driverId: 'DRV-204', driver: 'Deepak Yadav',
    activeShipments: 1, totalShipments: 57, status: 'ACTIVE', avgRating: 4.7,
  },
  {
    id: 'RTE-005', origin: 'Delhi NCR Hub, Gurugram', destination: 'Jaipur Depot',
    originCity: 'Delhi', destinationCity: 'Jaipur',
    distanceKm: 268, estimatedTimeHours: 4.5,
    vehicleId: 'VH-062', vehicle: 'Tata Super Ace (MH-04-IJ-7732)',
    driverId: 'DRV-205', driver: 'Ramesh Gowda',
    activeShipments: 1, totalShipments: 33, status: 'ACTIVE', avgRating: 4.5,
  },
];

// ─── Invoices ───────────────────────────────────────────────────
export const mockInvoices: Invoice[] = [
  {
    id: 'INV-9931', orderId: 'ORD-58231', customerId: 'CUST-1042',
    customer: 'Rohan Mehta', customerEmail: 'rohan.mehta@example.com', customerPhone: '+91 98450 11234',
    lineItems: [
      { description: 'Shipping Charge — Standard box (5.2 kg)', quantity: 2, unitPrice: 1225, total: 2450 },
    ],
    subtotal: 2450, tax: 220, taxRate: 9, discount: 0, total: 2670,
    status: 'PENDING', issueDate: '2026-09-01', dueDate: '2026-09-08',
  },
  {
    id: 'INV-9930', orderId: 'ORD-58230', customerId: 'CUST-1043',
    customer: 'Priya Nair', customerEmail: 'priya.nair@example.com', customerPhone: '+91 90080 44321',
    lineItems: [
      { description: 'Shipping Charge — Document (1 kg)', quantity: 1, unitPrice: 1180, total: 1180 },
    ],
    subtotal: 1180, tax: 106, taxRate: 9, discount: 0, total: 1286,
    status: 'PAID', issueDate: '2026-08-31', dueDate: '2026-09-02', paidDate: '2026-09-01',
  },
  {
    id: 'INV-9929', orderId: 'ORD-58229', customerId: 'CUST-1044',
    customer: 'Aditya Rao', customerEmail: 'aditya.rao@example.com', customerPhone: '+91 99720 55889',
    lineItems: [
      { description: 'Shipping Charge — Pallet (22.5 kg)', quantity: 3, unitPrice: 1306.67, total: 3920 },
    ],
    subtotal: 3920, tax: 353, taxRate: 9, discount: 0, total: 4273,
    status: 'PENDING', issueDate: '2026-08-31', dueDate: '2026-09-06',
  },
  {
    id: 'INV-9928', orderId: 'ORD-58228', customerId: 'CUST-1042',
    customer: 'Rohan Mehta', customerEmail: 'rohan.mehta@example.com', customerPhone: '+91 98450 11234',
    lineItems: [
      { description: 'Shipping Charge — Fragile (2 kg, Same Day)', quantity: 1, unitPrice: 860, total: 860 },
    ],
    subtotal: 860, tax: 77, taxRate: 9, discount: 0, total: 937,
    status: 'OVERDUE', issueDate: '2026-08-30', dueDate: '2026-08-30',
  },
  {
    id: 'INV-9927', orderId: 'ORD-58225', customerId: 'CUST-1046',
    customer: 'Vikram Singh', customerEmail: 'vikram.singh@example.com', customerPhone: '+91 97001 66778',
    lineItems: [
      { description: 'Shipping Charge — Standard box (8 kg, Express)', quantity: 4, unitPrice: 710, total: 2840 },
    ],
    subtotal: 2840, tax: 255, taxRate: 9, discount: 0, total: 3095,
    status: 'PAID', issueDate: '2026-08-27', dueDate: '2026-09-03', paidDate: '2026-08-29',
  },
  {
    id: 'INV-9926', orderId: 'ORD-58224', customerId: 'CUST-1047',
    customer: 'Meena Pillai', customerEmail: 'meena.pillai@example.com', customerPhone: '+91 80001 44556',
    lineItems: [
      { description: 'Shipping Charge — Fragile (6.5 kg)', quantity: 2, unitPrice: 960, total: 1920 },
    ],
    subtotal: 1920, tax: 172, taxRate: 9, discount: 0, total: 2092,
    status: 'PAID', issueDate: '2026-08-26', dueDate: '2026-09-02', paidDate: '2026-08-28',
  },
];

// ─── Support Tickets ────────────────────────────────────────────
export const mockSupportTickets: SupportTicket[] = [
  {
    id: 'TKT-001', customerId: 'CUST-1042', customer: 'Rohan Mehta',
    subject: 'Shipment delayed — TRK-2026-000123', description: 'My shipment has been in transit for 2 days. Expected delivery was yesterday.',
    priority: 'High', status: 'In Progress', assignedTo: 'Support Team A',
    createdAt: '2026-09-02T10:00:00', updatedAt: '2026-09-02T14:30:00',
    orderId: 'ORD-58231',
  },
  {
    id: 'TKT-002', customerId: 'CUST-1044', customer: 'Aditya Rao',
    subject: 'Invoice discrepancy on ORD-58229', description: 'The invoice shows a higher amount than quoted.',
    priority: 'Medium', status: 'Open', assignedTo: 'Billing Team',
    createdAt: '2026-09-01T15:20:00', updatedAt: '2026-09-01T15:20:00',
    orderId: 'ORD-58229',
  },
  {
    id: 'TKT-003', customerId: 'CUST-1045', customer: 'Sana Sheikh',
    subject: 'Refund request for cancelled order', description: 'Order was cancelled but refund not received.',
    priority: 'Critical', status: 'Open', assignedTo: 'Finance Team',
    createdAt: '2026-08-30T09:00:00', updatedAt: '2026-08-30T09:00:00',
    orderId: 'ORD-58227',
  },
  {
    id: 'TKT-004', customerId: 'CUST-1043', customer: 'Priya Nair',
    subject: 'Package arrived damaged', description: 'The box was crushed on arrival. Photos attached.',
    priority: 'High', status: 'Resolved', assignedTo: 'Claims Team',
    createdAt: '2026-08-29T11:30:00', updatedAt: '2026-09-01T16:00:00',
    orderId: 'ORD-58230',
  },
  {
    id: 'TKT-005', customerId: 'CUST-1046', customer: 'Vikram Singh',
    subject: 'Request to change delivery address', description: 'Need to update delivery address for ORD-58225.',
    priority: 'Low', status: 'Closed', assignedTo: 'Operations Team',
    createdAt: '2026-08-27T14:00:00', updatedAt: '2026-08-27T16:30:00',
    orderId: 'ORD-58225',
  },
];

// ─── Chart / Analytics Data ─────────────────────────────────────
export const mockMonthlyData = [
  { month: 'Apr', orders: 210, revenue: 412000, delivered: 198, delayed: 12 },
  { month: 'May', orders: 248, revenue: 468000, delivered: 235, delayed: 13 },
  { month: 'Jun', orders: 265, revenue: 501000, delivered: 251, delayed: 14 },
  { month: 'Jul', orders: 301, revenue: 588000, delivered: 288, delayed: 13 },
  { month: 'Aug', orders: 342, revenue: 640000, delivered: 328, delayed: 14 },
  { month: 'Sep', orders: 118, revenue: 231000, delivered: 96, delayed: 4 },
];

export const mockShipmentTrendData = [
  { date: '26 Aug', delivered: 38, inTransit: 12, pending: 8, cancelled: 2 },
  { date: '27 Aug', delivered: 42, inTransit: 15, pending: 6, cancelled: 1 },
  { date: '28 Aug', delivered: 35, inTransit: 18, pending: 9, cancelled: 3 },
  { date: '29 Aug', delivered: 48, inTransit: 14, pending: 7, cancelled: 2 },
  { date: '30 Aug', delivered: 52, inTransit: 20, pending: 10, cancelled: 1 },
  { date: '31 Aug', delivered: 44, inTransit: 22, pending: 12, cancelled: 2 },
  { date: '1 Sep',  delivered: 43, inTransit: 41, pending: 27, cancelled: 1 },
];

export const mockOrdersByStatus = [
  { name: 'Delivered', value: 302, color: '#059669' },
  { name: 'In Transit', value: 41,  color: '#d97706' },
  { name: 'Pending',    value: 27,  color: '#0891b2' },
  { name: 'Cancelled',  value: 12,  color: '#dc2626' },
  { name: 'Confirmed',  value: 18,  color: '#4f46e5' },
];

export const mockTopRoutes = [
  { route: 'Bengaluru → Koramangala', shipments: 128 },
  { route: 'Mumbai → Andheri',        shipments: 96 },
  { route: 'Delhi → Gurugram',        shipments: 74 },
  { route: 'Hyderabad → Pune',        shipments: 57 },
  { route: 'Chennai → Bengaluru',     shipments: 41 },
];

export const mockTopCustomers = [
  { name: 'Vikram Singh',  orders: 6 },
  { name: 'Rohan Mehta',  orders: 12 },
  { name: 'Priya Nair',   orders: 8 },
  { name: 'Aditya Rao',   orders: 5 },
  { name: 'Meena Pillai', orders: 4 },
];

// ─── Dashboard KPI Summary ──────────────────────────────────────
export const mockAdminKPIs = {
  totalOrders: 342,
  totalOrdersChange: +14.2,
  totalShipments: 376,
  totalShipmentsChange: +10.8,
  totalCustomers: 48,
  totalCustomersChange: +6.3,
  totalRevenue: 2310000,
  totalRevenueChange: +9.4,
  pendingOrders: 27,
  inTransit: 41,
  delivered: 302,
  cancelled: 12,
  availableVehicles: 4,
  totalVehicles: 6,
  activeDrivers: 4,
  totalDrivers: 5,
};

export const mockCustomerKPIs = {
  totalOrders: 4,
  totalOrdersChange: +18,
  activeShipments: 1,
  activeShipmentsChange: +12,
  inTransit: 1,
  inTransitChange: +15,
  delivered: 2,
  deliveredChange: +20,
};
