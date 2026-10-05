BEGIN;

-- 1. Unlink routes from removed drivers and vehicles
UPDATE routes SET driver_id = NULL WHERE driver_id NOT IN (13, 16, 20, 21);
UPDATE routes SET vehicle_id = NULL WHERE vehicle_id NOT IN (1, 8, 9, 13);

-- 2. Update shipments to reference ONLY active warehouses (1: Bengaluru, 6: Kolkata)
UPDATE shipments
SET origin_warehouse_id = 1
WHERE origin_warehouse_id NOT IN (1, 6);

UPDATE shipments
SET destination_warehouse_id = 6
WHERE destination_warehouse_id NOT IN (1, 6) OR destination_warehouse_id = origin_warehouse_id;

-- 3. Clean shipment driver and vehicle references for removed fleet entities
UPDATE shipments
SET driver_id = NULL, vehicle_id = NULL, assignment_status = 'UNASSIGNED', assigned_by = NULL, assigned_at = NULL
WHERE driver_id NOT IN (13, 16, 20, 21) OR vehicle_id NOT IN (1, 8, 9, 13);

-- Mark old test shipments with non-conforming pairs as DELIVERED
UPDATE shipments
SET status = 'DELIVERED', operational_stage = 'DISPATCHED'
WHERE id IN (24, 39);

-- 4. Unlink vehicles from drivers before cleanup
UPDATE vehicles SET driver_id = NULL;

-- 5. Delete unwanted vehicles (keep 1: VH-001, 8: PR-VH-004, 9: PR-VH-005, 13: KA-01-OVR-2890)
DELETE FROM vehicles WHERE id NOT IN (1, 8, 9, 13);

-- 6. Delete unwanted drivers (keep 13: Priya Patel, 16: Sneha Kulkarni, 20: Ramesh Kumar, 21: Anil Deshmukh)
DELETE FROM drivers WHERE id NOT IN (13, 16, 20, 21);

-- 7. Unlink users from warehouses to be deleted
UPDATE users SET warehouse_id = NULL WHERE warehouse_id NOT IN (1, 6);

-- Delete unused warehouse managers (keep Priya Sharma: 20 -> WH 1, P. Mukherjee: 24 -> WH 6)
DELETE FROM users WHERE id IN (23, 25, 26, 27, 28, 29, 30, 32);

-- 8. Delete unwanted warehouses (keep 1: Bengaluru Central Hub, 6: Kolkata Eastern Corridor Hub)
DELETE FROM warehouses WHERE id NOT IN (1, 6);

-- 9. Setup target Warehouses
UPDATE warehouses
SET warehouse_name = 'Bengaluru Central Hub',
    city = 'Bengaluru',
    manager_name = 'Priya Sharma',
    manager_email = 'priya@primeroute.com',
    manager_phone = '+91 98001 11001',
    status = 'ACTIVE'
WHERE id = 1;

UPDATE warehouses
SET warehouse_name = 'Kolkata Eastern Corridor Hub',
    city = 'Kolkata',
    manager_name = 'P. Mukherjee',
    manager_email = 'ccu.east@primeroute.com',
    manager_phone = '+91 98001 66006',
    status = 'ACTIVE'
WHERE id = 6;

-- 10. Setup target Drivers
-- Bengaluru Drivers:
UPDATE drivers
SET full_name = 'Anil Deshmukh',
    email = 'anil.deshmukh@primeroute.com',
    phone = '+91 98765 72649',
    warehouse_id = 1,
    status = 'ON_TRIP'
WHERE id = 21;

UPDATE drivers
SET full_name = 'Ramesh Kumar',
    email = 'ramesh@primeroute.com',
    phone = '+91 98765 43211',
    warehouse_id = 1,
    status = 'AVAILABLE'
WHERE id = 20;

-- Kolkata Drivers:
UPDATE drivers
SET full_name = 'Sneha Kulkarni',
    email = 'sneha.kulkarni@primeroute.in',
    phone = '+91 97654 32100',
    warehouse_id = 6,
    status = 'AVAILABLE'
WHERE id = 16;

UPDATE drivers
SET full_name = 'Priya Patel',
    email = 'priya.patel@primeroute.in',
    phone = '+91 98234 56789',
    warehouse_id = 6,
    status = 'AVAILABLE'
WHERE id = 13;

-- 11. Setup target Vehicles and Fleet Pairs
-- Bengaluru Vehicles:
-- Anil Deshmukh <-> KA-01-OVR-2890 <-> Bengaluru Central Hub
UPDATE vehicles
SET vehicle_number = 'KA-01-OVR-2890',
    model = 'Eicher Pro 3019',
    warehouse_id = 1,
    driver_id = 21,
    status = 'IN_TRANSIT',
    current_location = 'Bengaluru Central Hub'
WHERE id = 13;

-- Ramesh Kumar <-> VH-001 <-> Bengaluru Central Hub
UPDATE vehicles
SET vehicle_number = 'VH-001',
    model = 'Prima 5530.S High-Deck',
    warehouse_id = 1,
    driver_id = 20,
    status = 'ASSIGNED',
    current_location = 'Bengaluru Central Hub'
WHERE id = 1;

-- Kolkata Vehicles:
-- Sneha Kulkarni <-> PR-VH-005 <-> Kolkata Eastern Corridor Hub
UPDATE vehicles
SET vehicle_number = 'PR-VH-005',
    model = 'Tata Prima 2830.K',
    warehouse_id = 6,
    driver_id = 16,
    status = 'ASSIGNED',
    current_location = 'Kolkata Eastern Corridor Hub'
WHERE id = 9;

-- Priya Patel <-> PR-VH-004 <-> Kolkata Eastern Corridor Hub
UPDATE vehicles
SET vehicle_number = 'PR-VH-004',
    model = 'BharatBenz 1917R',
    warehouse_id = 6,
    driver_id = 13,
    status = 'ASSIGNED',
    current_location = 'Kolkata Eastern Corridor Hub'
WHERE id = 8;

-- 12. Setup Warehouse Manager User mappings
UPDATE users
SET role = 'WAREHOUSE_MANAGER',
    warehouse_id = 1,
    full_name = 'Priya Sharma',
    status = 'ACTIVE'
WHERE email = 'priya@primeroute.com';

UPDATE users
SET role = 'WAREHOUSE_MANAGER',
    warehouse_id = 6,
    full_name = 'P. Mukherjee',
    status = 'ACTIVE'
WHERE email = 'ccu.east@primeroute.com';

-- Ensure shipment 40 (PR-TRK-5HE8CLL3) is origin WH 1 -> destination WH 6
UPDATE shipments
SET origin_warehouse_id = 1,
    destination_warehouse_id = 6,
    driver_id = 21,
    vehicle_id = 13,
    status = 'IN_TRANSIT',
    operational_stage = 'DISPATCHED'
WHERE id = 40;

COMMIT;
