SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('orders', 'order_items', 'invoices', 'shipments', 'shipment_tracking_events', 'fulfillment_allocations', 'inventory_transactions', 'proof_of_deliveries')
ORDER BY table_name, ordinal_position;
