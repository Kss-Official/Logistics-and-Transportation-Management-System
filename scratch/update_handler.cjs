const fs = require('fs');
const path = require('path');

const handlerPath = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\exception\\GlobalExceptionHandler.java';

const content = `package com.primeroute.logistics.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import jakarta.validation.ConstraintViolationException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // ==========================================
    // AUTHENTICATION & SECURITY - 401
    // ==========================================

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentials(
            BadCredentialsException exception) {

        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "Invalid email or password.");
        response.put("status", HttpStatus.UNAUTHORIZED.value());
        response.put("timestamp", LocalDateTime.now());

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(response);
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleUsernameNotFound(
            UsernameNotFoundException exception) {

        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "Invalid email or password.");
        response.put("status", HttpStatus.UNAUTHORIZED.value());
        response.put("timestamp", LocalDateTime.now());

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(response);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthenticationException(
            AuthenticationException exception) {

        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "Invalid email or password.");
        response.put("status", HttpStatus.UNAUTHORIZED.value());
        response.put("timestamp", LocalDateTime.now());

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(response);
    }

    // ==========================================
    // ACCESS DENIED / FORBIDDEN - 403
    // ==========================================

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(
            org.springframework.security.access.AccessDeniedException exception) {

        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", exception.getMessage() != null ? exception.getMessage() : "Access denied.");
        response.put("status", HttpStatus.FORBIDDEN.value());
        response.put("timestamp", LocalDateTime.now());

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(response);
    }

    // ==========================================
    // RESOURCE NOT FOUND - 404
    // ==========================================

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFound(
            ResourceNotFoundException exception) {

        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", exception.getMessage());
        response.put("status", HttpStatus.NOT_FOUND.value());
        response.put("timestamp", LocalDateTime.now());

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(response);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNoResourceFound(
            NoResourceFoundException exception) {

        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "Requested resource not found: " + exception.getResourcePath());
        response.put("status", HttpStatus.NOT_FOUND.value());
        response.put("timestamp", LocalDateTime.now());

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(response);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<Map<String, Object>> handleMethodNotSupported(
            HttpRequestMethodNotSupportedException exception) {

        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", exception.getMessage());
        response.put("status", HttpStatus.METHOD_NOT_ALLOWED.value());
        response.put("timestamp", LocalDateTime.now());

        return ResponseEntity
                .status(HttpStatus.METHOD_NOT_ALLOWED)
                .body(response);
    }

    // ==========================================
    // CONFLICT - 409
    // ==========================================

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<Map<String, Object>> handleUserAlreadyExists(
            UserAlreadyExistsException exception) {

        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", exception.getMessage());
        response.put("status", HttpStatus.CONFLICT.value());
        response.put("data", null);
        response.put("timestamp", LocalDateTime.now());

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(response);
    }

    @ExceptionHandler(AddressInUseException.class)
    public ResponseEntity<Map<String, Object>> handleAddressInUse(
            AddressInUseException exception) {

        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", exception.getMessage());
        response.put("status", HttpStatus.CONFLICT.value());
        response.put("data", null);
        response.put("timestamp", LocalDateTime.now());

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(response);
    }

    @ExceptionHandler(AssignmentConflictException.class)
    public ResponseEntity<Map<String, Object>> handleAssignmentConflict(
            AssignmentConflictException exception) {

        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", exception.getMessage());
        response.put("status", HttpStatus.CONFLICT.value());
        response.put("data", null);
        response.put("timestamp", LocalDateTime.now());

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(response);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrityViolation(
            DataIntegrityViolationException exception) {

        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "An account with this email already exists or a data conflict occurred.");
        response.put("status", HttpStatus.CONFLICT.value());
        response.put("data", null);
        response.put("timestamp", LocalDateTime.now());

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(response);
    }

    // ==========================================
    // BUSINESS LOGIC & CONFLICT ERRORS - 400
    // ==========================================

    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
    public ResponseEntity<Map<String, Object>> handleBusinessRules(
            RuntimeException exception) {

        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", exception.getMessage());
        response.put("status", HttpStatus.BAD_REQUEST.value());
        response.put("data", null);
        response.put("timestamp", LocalDateTime.now());

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }

    // ==========================================
    // VALIDATION ERROR - 400
    // ==========================================

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(
            MethodArgumentNotValidException exception) {

        Map<String, String> errors = new HashMap<>();
        String firstMessage = "Validation failed";

        if (exception.getBindingResult().hasFieldErrors()) {
            firstMessage = exception.getBindingResult().getFieldErrors().get(0).getDefaultMessage();
        }

        exception.getBindingResult()
                .getFieldErrors()
                .forEach(error ->
                        errors.put(
                                error.getField(),
                                error.getDefaultMessage()
                        )
                );

        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", firstMessage != null ? firstMessage : "Validation failed");
        response.put("status", HttpStatus.BAD_REQUEST.value());
        response.put("data", errors);
        response.put("errors", errors);
        response.put("timestamp", LocalDateTime.now());

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraintViolation(
            ConstraintViolationException exception) {

        Map<String, String> errors = new HashMap<>();
        String firstMessage = "Validation failed";

        if (!exception.getConstraintViolations().isEmpty()) {
            var first = exception.getConstraintViolations().iterator().next();
            firstMessage = first.getMessage();
        }

        exception.getConstraintViolations().forEach(violation ->
                errors.put(violation.getPropertyPath().toString(), violation.getMessage())
        );

        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", firstMessage != null ? firstMessage : "Validation failed");
        response.put("status", HttpStatus.BAD_REQUEST.value());
        response.put("data", errors);
        response.put("errors", errors);
        response.put("timestamp", LocalDateTime.now());

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }

    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<Map<String, Object>> handleHandlerMethodValidation(
            HandlerMethodValidationException exception) {

        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "Validation failed. Please check all input parameters.");
        response.put("status", HttpStatus.BAD_REQUEST.value());
        response.put("timestamp", LocalDateTime.now());

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }

    // ==========================================
    // GENERAL ERROR - 500
    // ==========================================

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneralException(
            Exception exception) {

        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "An unexpected error occurred. Please try again later.");
        response.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        response.put("timestamp", LocalDateTime.now());

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(response);
    }
}
`;

fs.writeFileSync(handlerPath, content, 'utf8');
console.log('Updated GlobalExceptionHandler.java');
