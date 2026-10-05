SELECT table_name, column_name FROM information_schema.columns WHERE table_name = 'notifications';
SELECT * FROM notifications WHERE link LIKE '%PR-ORD-29842877%' OR link LIKE '%PR-ORD-74855865%' OR message LIKE '%PR-ORD-29842877%' OR message LIKE '%PR-ORD-74855865%' OR title LIKE '%PR-ORD-29842877%' OR title LIKE '%PR-ORD-74855865%';
