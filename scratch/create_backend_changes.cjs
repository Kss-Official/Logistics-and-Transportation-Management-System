const fs = require('fs');
const path = require('path');

const backendBase = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

// 1. UserAlreadyExistsException.java
const userAlreadyExistsContent = `package com.primeroute.logistics.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class UserAlreadyExistsException extends RuntimeException {
    public UserAlreadyExistsException(String message) {
        super(message);
    }
}
`;

fs.writeFileSync(path.join(backendBase, 'exception/UserAlreadyExistsException.java'), userAlreadyExistsContent, 'utf8');
console.log('Created UserAlreadyExistsException.java');
