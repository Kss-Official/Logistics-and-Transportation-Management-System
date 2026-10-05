SELECT table_name, column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND (column_name LIKE '%order%' OR column_name LIKE '%invoice%')
ORDER BY table_name, column_name;
