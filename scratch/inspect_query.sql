SELECT a.id, a.address_line1, a.address_line2, a.city, a.state, a.postal_code, a.latitude, a.longitude 
FROM addresses a 
WHERE a.id IN (SELECT pickup_address_id FROM orders WHERE order_number = 'PR-ORD-19214882' UNION SELECT delivery_address_id FROM orders WHERE order_number = 'PR-ORD-19214882');
