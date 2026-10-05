
UPDATE users 
SET password = '$2a$10$aFsLu3WPz10TYEbe41KWiOhfGCK5ghTWrgv4XVfNDC/zgWAqjyYgW', status = 'ACTIVE' 
WHERE role = 'DRIVER' OR email IN ('priya.patel@primeroute.in', 'sneha.kulkarni@primeroute.in', 'ramesh@primeroute.com');

SELECT id, email, role, status, password FROM users WHERE role = 'DRIVER' OR email LIKE '%priya%' OR email LIKE '%ramesh%';
