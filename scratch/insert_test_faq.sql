INSERT INTO faqs (category, question, answer, display_order, is_active) 
VALUES ('General', 'What SLA response times does PrimeRoute guarantee?', 'PrimeRoute guarantees a 99.9% uptime SLA for tracking telemetry and under 15-minute priority dispatch confirmations for commercial freight accounts.', 11, true);

SELECT count(*) FROM faqs;
