const fs = require('fs');
const path = require('path');

const backendBase = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

// 1. RegisterRequest.java
const registerRequestContent = `package com.primeroute.logistics.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    @Pattern(
        regexp = "^[a-zA-Z\\\\s.'-]+$",
        message = "Full name can only contain letters, spaces, dots, hyphens, and apostrophes"
    )
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(
        regexp = "^[a-zA-Z0-9._-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\\\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\\\\.[a-zA-Z]{2,}$",
        message = "Please enter a valid email address (e.g., name@domain.com)"
    )
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(
        regexp = "^(?:\\\\+91[\\\\-\\\\s]?)?[6-9]\\\\d{9}$",
        message = "Please provide a valid 10-digit Indian mobile number (e.g., +91 9876543210 or 9876543210)"
    )
    private String phone;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be at least 8 characters long")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\\\d)(?=.*[@$!%*?&#^()_+=\\\\-\\\\[\\\\]{}|;:'\\\",.<>\\\\/?~\\\\\`\\\\\\\\]).*$",
        message = "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character"
    )
    private String password;

    private String companyName;

    public RegisterRequest() {
    }

    public RegisterRequest(String fullName, String email, String phone, String password, String companyName) {
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.password = password;
        this.companyName = companyName;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }
}
`;
fs.writeFileSync(path.join(backendBase, 'dto/RegisterRequest.java'), registerRequestContent, 'utf8');
console.log('Updated RegisterRequest.java');

// 2. LoginRequest.java
const loginRequestContent = `package com.primeroute.logistics.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class LoginRequest {

    @NotBlank(message = "Email is required")
    @Email(
        regexp = "^[a-zA-Z0-9._-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\\\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\\\\.[a-zA-Z]{2,}$",
        message = "Please enter a valid email address (e.g., name@domain.com)"
    )
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    public LoginRequest() {
    }

    public LoginRequest(String email, String password) {
        this.email = email;
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
`;
fs.writeFileSync(path.join(backendBase, 'dto/LoginRequest.java'), loginRequestContent, 'utf8');
console.log('Updated LoginRequest.java');

// 3. AuthService.java
const authServiceContent = `package com.primeroute.logistics.service;

import com.primeroute.logistics.dto.LoginRequest;
import com.primeroute.logistics.dto.LoginResponse;
import com.primeroute.logistics.dto.RegisterRequest;
import com.primeroute.logistics.entity.Role;
import com.primeroute.logistics.entity.User;
import com.primeroute.logistics.exception.UserAlreadyExistsException;
import com.primeroute.logistics.repository.UserRepository;
import com.primeroute.logistics.security.JwtService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private static final Pattern NAME_PATTERN = Pattern.compile("^[a-zA-Z\\\\s.'-]+$");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[a-zA-Z0-9._-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\\\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\\\\.[a-zA-Z]{2,}$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^(?:\\\\+91[\\\\-\\\\s]?)?[6-9]\\\\d{9}$");
    private static final Pattern PASSWORD_PATTERN = Pattern.compile("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\\\d)(?=.*[@$!%*?&#^()_+=\\\\-\\\\[\\\\]{}|;:'\\\",.<>\\\\/?~\\\\\`\\\\\\\\]).*$");

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // =========================
    // LOGIN
    // =========================

    public LoginResponse login(LoginRequest request) {

        String cleanEmail = (request != null && request.getEmail() != null) ? request.getEmail().trim().toLowerCase() : "";
        String rawPassword = (request != null && request.getPassword() != null) ? request.getPassword() : "";

        if (cleanEmail.isEmpty() || !EMAIL_PATTERN.matcher(cleanEmail).matches()) {
            throw new IllegalArgumentException("Please enter a valid email address.");
        }

        if (rawPassword.isEmpty()) {
            throw new IllegalArgumentException("Password is required.");
        }

        log.info("LOGIN ATTEMPT email={}", cleanEmail);

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(cleanEmail, rawPassword)
            );
        } catch (BadCredentialsException e) {
            log.warn("Login failed for email={}", cleanEmail);
            throw new BadCredentialsException("Invalid email or password.");
        }

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtService.generateToken(userDetails);

        String role = userDetails.getAuthorities()
                .iterator()
                .next()
                .getAuthority();

        User user = userRepository.findByEmailIgnoreCase(cleanEmail)
                .or(() -> userRepository.findByEmail(cleanEmail))
                .orElse(null);

        String fullName = (user != null && user.getFullName() != null && !user.getFullName().isBlank())
                ? user.getFullName()
                : userDetails.getUsername();

        Long warehouseId = null;
        String warehouseCode = null;
        String warehouseName = null;

        if (user != null && user.getWarehouse() != null) {
            warehouseId = user.getWarehouse().getId();
            warehouseCode = user.getWarehouse().getWarehouseCode();
            warehouseName = user.getWarehouse().getWarehouseName();
        }

        return new LoginResponse(
                token,
                userDetails.getUsername(),
                fullName,
                role,
                warehouseId,
                warehouseCode,
                warehouseName
        );
    }

    // =========================
    // CUSTOMER REGISTRATION
    // =========================

    public String register(RegisterRequest request) {

        if (request == null) {
            throw new IllegalArgumentException("Registration data cannot be empty.");
        }

        String rawFullName = request.getFullName() != null ? request.getFullName().trim() : "";
        String cleanEmail = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        String rawPhone = request.getPhone() != null ? request.getPhone().trim() : "";
        String rawPassword = request.getPassword() != null ? request.getPassword() : "";

        // 1. Full name validation
        if (rawFullName.length() < 2 || rawFullName.length() > 100 || !NAME_PATTERN.matcher(rawFullName).matches() || !rawFullName.matches(".*[a-zA-Z].*")) {
            throw new IllegalArgumentException("Full name must be between 2 and 100 characters and contain only letters, spaces, dots, hyphens, or apostrophes.");
        }

        // 2. Email validation
        if (cleanEmail.isEmpty() || !EMAIL_PATTERN.matcher(cleanEmail).matches()) {
            throw new IllegalArgumentException("Please enter a valid email address (e.g., name@domain.com).");
        }

        // 3. Phone validation
        if (rawPhone.isEmpty() || !PHONE_PATTERN.matcher(rawPhone).matches()) {
            throw new IllegalArgumentException("Please provide a valid 10-digit Indian mobile number (e.g., 9876543210 or +91 9876543210).");
        }

        // 4. Password validation
        if (rawPassword.length() < 8 || rawPassword.length() > 100 || !PASSWORD_PATTERN.matcher(rawPassword).matches()) {
            throw new IllegalArgumentException("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character.");
        }

        // 5. Check whether email already exists (Controlled 409 Conflict)
        if (userRepository.existsByEmailIgnoreCase(cleanEmail)) {
            throw new UserAlreadyExistsException("An account with this email already exists.");
        }

        // Normalize phone number to clean 10 digits or standard format
        String cleanDigits = rawPhone.replaceAll("[\\\\s\\\\-\\\\(\\\\)]", "").replaceFirst("^\\\\+91", "");
        String normalizedPhone = "+91 " + cleanDigits;

        // Create new customer
        User user = new User();
        user.setFullName(rawFullName);
        user.setEmail(cleanEmail);
        user.setPhone(normalizedPhone);

        if (request.getCompanyName() != null && !request.getCompanyName().isBlank()) {
            user.setCompanyName(request.getCompanyName().trim());
        }

        // NEVER store plain-text password - BCrypt hash
        user.setPassword(passwordEncoder.encode(rawPassword));

        // Every public registration creates CUSTOMER
        user.setRole(Role.CUSTOMER);

        userRepository.save(user);
        log.info("Customer registered successfully with email={}", cleanEmail);

        return "Customer account created successfully.";
    }
}
`;
fs.writeFileSync(path.join(backendBase, 'service/AuthService.java'), authServiceContent, 'utf8');
console.log('Updated AuthService.java');
