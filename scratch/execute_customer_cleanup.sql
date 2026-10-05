-- ==========================================================
-- PRIME-ROUTE LOGISTICS: SINGLE-CUSTOMER TRANSACTION CLEANUP
-- Customer: shrutisanjanasahoo@gmail.com (ID: 4)
-- ==========================================================

BEGIN;

-- 1. Safety verification: Verify Customer ID 4 matches email
DO $$
DECLARE
    v_cust_id BIGINT;
BEGIN
    SELECT id INTO v_cust_id FROM users WHERE LOWER(email) = LOWER('shrutisanjanasahoo@gmail.com');
    IF v_cust_id IS NULL OR v_cust_id != 4 THEN
        RAISE EXCEPTION 'Safety check failed: User ID does not match expected customer ID 4';
    END IF;
END $$;

-- 2. Clean Support Ticket references to old orders/tracking numbers for customer 4
UPDATE support_tickets 
SET order_number = NULL, tracking_number = NULL 
WHERE customer_id = 4 
  AND (order_number IS NOT NULL OR tracking_number IS NOT NULL);

-- 3. Delete Invoices belonging to customer 4's orders / shipments
DELETE FROM invoices 
WHERE customer_id = 4 
   OR order_id IN (SELECT id FROM orders WHERE customer_id = 4)
   OR shipment_id IN (SELECT id FROM shipments WHERE order_id IN (SELECT id FROM orders WHERE customer_id = 4));

-- 4. Delete Shipment Tracking Events for shipments of customer 4's orders
DELETE FROM shipment_tracking_events 
WHERE shipment_id IN (
    SELECT s.id FROM shipments s 
    JOIN orders o ON s.order_id = o.id 
    WHERE o.customer_id = 4
);

-- 5. Delete Inventory Transactions referencing customer 4's orders or shipments
DELETE FROM inventory_transactions 
WHERE reference_order IN (SELECT order_number FROM orders WHERE customer_id = 4)
   OR reference_shipment IN (
       SELECT s.tracking_number FROM shipments s 
       JOIN orders o ON s.order_id = o.id 
       WHERE o.customer_id = 4
   );

-- 6. Delete Fulfillment Allocations for customer 4's orders (if any)
DELETE FROM fulfillment_allocations 
WHERE order_id IN (SELECT id FROM orders WHERE customer_id = 4);

-- 7. Delete Shipments for customer 4's orders
DELETE FROM shipments 
WHERE order_id IN (SELECT id FROM orders WHERE customer_id = 4);

-- 8. Delete Order Items for customer 4's orders (if any)
DELETE FROM order_items 
WHERE order_id IN (SELECT id FROM orders WHERE customer_id = 4);

-- 9. Delete Orders for customer 4
DELETE FROM orders 
WHERE customer_id = 4;

-- 10. Fleet Safety Check & Release:
-- Only update driver status if driver has NO remaining active shipments
UPDATE drivers 
SET status = 'AVAILABLE' 
WHERE id IN (13, 15, 17, 19) 
  AND id NOT IN (
      SELECT driver_id FROM shipments 
      WHERE driver_id IS NOT NULL 
        AND status NOT IN ('DELIVERED', 'CANCELLED')
  );

-- Only update vehicle status if vehicle has NO remaining active shipments
UPDATE vehicles 
SET status = 'AVAILABLE' 
WHERE id IN (8, 9) 
  AND id NOT IN (
      SELECT vehicle_id FROM shipments 
      WHERE vehicle_id IS NOT NULL 
        AND status NOT IN ('DELIVERED', 'CANCELLED')
  );

COMMIT;
