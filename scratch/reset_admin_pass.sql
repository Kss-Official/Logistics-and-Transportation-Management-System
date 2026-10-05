UPDATE users 
SET password = (SELECT password FROM users WHERE email = 'customer@primeroute.com') 
WHERE email = 'admin@primeroute.com';

SELECT id, email, password FROM users WHERE role = 'ADMIN';
