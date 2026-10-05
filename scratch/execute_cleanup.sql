\pset pager off
BEGIN;

-- 1. Safely release any Driver / Vehicle operational state attached to demo shipments
UPDATE drivers 
SET status = 'AVAILABLE', updated_at = NOW() 
WHERE id IN (
    SELECT DISTINCT driver_id FROM shipments 
    WHERE driver_id IS NOT NULL 
      AND order_id IN (
          SELECT id FROM orders WHERE customer_id IN (2) OR id IN (52, 53, 54)
      )
);

UPDATE vehicles 
SET status = 'ASSIGNED', updated_at = NOW() 
WHERE id IN (
    SELECT DISTINCT vehicle_id FROM shipments 
    WHERE vehicle_id IS NOT NULL 
      AND order_id IN (
          SELECT id FROM orders WHERE customer_id IN (2) OR id IN (52, 53, 54)
      )
);

-- 2. Identify Demo Shipment IDs and Demo Order IDs
-- Demo Orders: Customer 2 ('customer@primeroute.com') and Orders 52, 53, 54 ('PrimeRoute Operations')
CREATE TEMP TABLE demo_orders ON COMMIT DROP AS
SELECT id, order_number FROM orders 
WHERE customer_id = 2 OR id IN (52, 53, 54);

CREATE TEMP TABLE demo_shipments ON COMMIT DROP AS
SELECT id, tracking_number FROM shipments 
WHERE order_id IN (SELECT id FROM demo_orders);

-- 3. Delete Shipment Tracking Events for demo shipments
DELETE FROM shipment_tracking_events 
WHERE shipment_id IN (SELECT id FROM demo_shipments);

-- 4. Delete Invoices for demo orders/shipments (if any)
DELETE FROM invoices 
WHERE order_id IN (SELECT id FROM demo_orders) 
   OR shipment_id IN (SELECT id FROM demo_shipments);

-- 5. Delete Inventory Transactions linked to demo orders / demo shipments
DELETE FROM inventory_transactions 
WHERE reference_order IN (SELECT order_number FROM demo_orders)
   OR reference_shipment IN (SELECT tracking_number FROM demo_shipments);

-- 6. Delete Shipments for demo orders
DELETE FROM shipments 
WHERE id IN (SELECT id FROM demo_shipments);

-- 7. Delete Fulfillment Allocations for demo orders
DELETE FROM fulfillment_allocations 
WHERE order_id IN (SELECT id FROM demo_orders);

-- 8. Delete Order Items for demo orders
DELETE FROM order_items 
WHERE order_id IN (SELECT id FROM demo_orders);

-- 9. Delete Orders for demo orders
DELETE FROM orders 
WHERE id IN (SELECT id FROM demo_orders);

-- 10. Delete demo addresses belonging exclusively to Demo Customer (user 2)
DELETE FROM addresses 
WHERE customer_id = 2;

-- 11. Delete support ticket messages and support tickets for Demo Customer (user 2)
DELETE FROM support_ticket_messages 
WHERE sender_id = 2 OR ticket_id IN (SELECT id FROM support_tickets WHERE customer_id = 2);

DELETE FROM support_tickets 
WHERE customer_id = 2;

-- 12. Delete notifications and password reset tokens for user 2
DELETE FROM notifications 
WHERE user_id = 2;

DELETE FROM password_reset_tokens 
WHERE user_id = 2;

-- 13. Delete Demo Customer user account (user 2)
DELETE FROM users 
WHERE id = 2;

-- 14. Verify master data remains intact
DO $$
DECLARE
    d_cnt INT;
    v_cnt INT;
    w_cnt INT;
BEGIN
    SELECT count(*) INTO d_cnt FROM drivers;
    SELECT count(*) INTO v_cnt FROM vehicles;
    SELECT count(*) INTO w_cnt FROM warehouses;

    IF d_cnt != 4 THEN
        RAISE EXCEPTION 'Driver count assertion failed: expected 4, found %', d_cnt;
    END IF;
    IF v_cnt != 4 THEN
        RAISE EXCEPTION 'Vehicle count assertion failed: expected 4, found %', v_cnt;
    END IF;
    IF w_cnt < 2 THEN
        RAISE EXCEPTION 'Warehouse count assertion failed: found %', w_cnt;
    END IF;
END $$;

COMMIT;
