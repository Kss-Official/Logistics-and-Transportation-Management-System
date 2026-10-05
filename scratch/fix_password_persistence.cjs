const fs = require('fs');
const path = require('path');
const BACKEND_DIR = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';

// 1. Update AuthService.java
const authServicePath = path.join(BACKEND_DIR, 'src/main/java/com/primeroute/logistics/service/AuthService.java');
const authServiceContent = `package com.primeroute.logistics.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.primeroute.logistics.dto.LoginRequest;
import com.primeroute.logistics.dto.LoginResponse;
import com.primeroute.logistics.dto.RegisterRequest;
import com.primeroute.logistics.entity.Role;
import com.primeroute.logistics.entity.User;
import com.primeroute.logistics.repository.UserRepository;
import com.primeroute.logistics.security.JwtService;

@Service
public class AuthService {

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

        String cleanEmail = (request.getEmail() != null) ? request.getEmail().trim().toLowerCase() : "";
        String rawPassword = (request.getPassword() != null) ? request.getPassword() : "";
        String trimmedPassword = rawPassword.trim();

        Authentication authentication = null;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(cleanEmail, rawPassword)
            );
        } catch (BadCredentialsException e) {
            if (!rawPassword.equals(trimmedPassword)) {
                try {
                    authentication = authenticationManager.authenticate(
                            new UsernamePasswordAuthenticationToken(cleanEmail, trimmedPassword)
                    );
                } catch (BadCredentialsException ignored) {}
            }

            if (authentication == null) {
                throw e;
            }
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

        return new LoginResponse(
                token,
                userDetails.getUsername(),
                fullName,
                role
        );
    }

    // =========================
    // CUSTOMER REGISTRATION
    // =========================

    public String register(RegisterRequest request) {

        String cleanEmail = (request.getEmail() != null) ? request.getEmail().trim().toLowerCase() : "";

        // Check whether email already exists
        if (userRepository.existsByEmailIgnoreCase(cleanEmail)) {
            throw new IllegalArgumentException(
                    "An account with this email already exists."
            );
        }

        // Create new customer
        User user = new User();

        user.setFullName(request.getFullName().trim());
        user.setEmail(cleanEmail);

        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            user.setPhone(request.getPhone().trim());
        }

        if (request.getCompanyName() != null && !request.getCompanyName().isBlank()) {
            user.setCompanyName(request.getCompanyName().trim());
        }

        // NEVER store plain-text password
        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        // Every public registration creates CUSTOMER
        user.setRole(Role.CUSTOMER);

        userRepository.save(user);

        return "Customer account created successfully.";
    }
}
`;
fs.writeFileSync(authServicePath, authServiceContent, 'utf8');
console.log('Successfully updated AuthService.java');

// 2. Update DataInitializer.java
const dataInitPath = path.join(BACKEND_DIR, 'src/main/java/com/primeroute/logistics/config/DataInitializer.java');
const dataInitContent = `package com.primeroute.logistics.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.primeroute.logistics.entity.Role;
import com.primeroute.logistics.entity.SupportContact;
import com.primeroute.logistics.entity.User;
import com.primeroute.logistics.repository.SupportContactRepository;
import com.primeroute.logistics.repository.UserRepository;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initializeUsers(
            UserRepository userRepository,
            SupportContactRepository supportContactRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            // Initialize Admin user ONLY if admin account does not exist.
            // Existing admin credentials, passwords, and accounts are NEVER overwritten.
            if (!userRepository.existsByEmailIgnoreCase("sanjanaaa.shru@gmail.com") && !userRepository.existsByEmail("sanjanaaa.shru@gmail.com")) {
                User admin = new User(
                        "sanjanaaa.shru@gmail.com",
                        passwordEncoder.encode("Admin@PrimeRoute2026!"),
                        "PrimeRoute Operations",
                        Role.ADMIN
                );
                userRepository.save(admin);
                System.out.println("Admin user initialized with email: " + admin.getEmail());
            }

            // Create Customer user ONLY if not present
            if (!userRepository.existsByEmailIgnoreCase("customer@primeroute.com") && !userRepository.existsByEmail("customer@primeroute.com")) {
                User customer = new User(
                        "customer@primeroute.com",
                        passwordEncoder.encode("customer123"),
                        "Demo Customer",
                        Role.CUSTOMER
                );
                userRepository.save(customer);
                System.out.println("Demo CUSTOMER user created.");
            }

            // Initialize Support Contact configuration ONLY if empty
            if (supportContactRepository.count() == 0) {
                SupportContact defaultContact = new SupportContact(
                        "support@primeroute.com",
                        "+91 98765 43210",
                        "24/7 Dedicated Logistics Assistance",
                        "Operations desk hotline for critical freight inquiries and routing delays."
                );
                supportContactRepository.save(defaultContact);
                System.out.println("Default Support Contact initialized.");
            }
        };
    }
}
`;
fs.writeFileSync(dataInitPath, dataInitContent, 'utf8');
console.log('Successfully updated DataInitializer.java');
