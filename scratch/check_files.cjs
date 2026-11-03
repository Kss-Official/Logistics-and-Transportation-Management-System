const fs = require('fs');
const path = require('path');

const backendBase = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

console.log('UserAlreadyExistsException exists?', fs.existsSync(path.join(backendBase, 'exception/UserAlreadyExistsException.java')));
console.log('RegisterRequest exists?', fs.existsSync(path.join(backendBase, 'dto/RegisterRequest.java')));
console.log('LoginRequest exists?', fs.existsSync(path.join(backendBase, 'dto/LoginRequest.java')));
console.log('GlobalExceptionHandler exists?', fs.existsSync(path.join(backendBase, 'exception/GlobalExceptionHandler.java')));
console.log('AuthService exists?', fs.existsSync(path.join(backendBase, 'service/AuthService.java')));
