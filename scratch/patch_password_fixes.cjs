const fs = require('fs');
const path = require('path');

const BACKEND_DIR = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';

// 1. Patch DataInitializer.java
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

            // Initialize Admin user ONLY if not already present in database
            // Existing admin credentials and password updates MUST be preserved across server restarts
            if (!userRepository.existsByEmail("admin@primeroute.com")) {
                User admin = new User(
                        "admin@primeroute.com",
                        passwordEncoder.encode("Admin@PrimeRoute2026!"),
                        "PrimeRoute Admin",
                        Role.ADMIN
                );
                userRepository.save(admin);
                System.out.println("Secure ADMIN user initialized.");
            }

            // Create Customer user if not present
            if (!userRepository.existsByEmail("customer@primeroute.com")) {
                User customer = new User(
                        "customer@primeroute.com",
                        passwordEncoder.encode("customer123"),
                        "Demo Customer",
                        Role.CUSTOMER
                );
                userRepository.save(customer);
                System.out.println("Demo CUSTOMER user created.");
            }

            // Initialize Support Contact configuration
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

// 2. Patch AdminSettingsService.java
const servicePath = path.join(BACKEND_DIR, 'src/main/java/com/primeroute/logistics/service/AdminSettingsService.java');
let serviceContent = fs.readFileSync(servicePath, 'utf8');

// Ensure import of ResourceNotFoundException
if (!serviceContent.includes('import com.primeroute.logistics.exception.ResourceNotFoundException;')) {
  serviceContent = serviceContent.replace(
    'import com.primeroute.logistics.repository.UserRepository;',
    'import com.primeroute.logistics.repository.UserRepository;\nimport com.primeroute.logistics.exception.ResourceNotFoundException;'
  );
}

// Replace changePassword method
const oldMethodRegex = /\/\/ =+\s*\n\s*\/\/ 2\. SECURITY \(CHANGE PASSWORD\)[\s\S]*?\/\/ =+\s*\n\s*\/\/ 3\. NOTIFICATION PREFERENCES/;
const newMethod = `// ==========================================
    // 2. SECURITY (CHANGE PASSWORD)
    // ==========================================
    @Transactional
    public void changePassword(String email, AdminSecurityChangePasswordRequest req) {
        if (req.getCurrentPassword() == null || req.getCurrentPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("Current password is required.");
        }

        if (req.getNewPassword() == null || req.getNewPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("New password is required.");
        }

        if (req.getNewPassword().length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters long.");
        }

        if (req.getConfirmPassword() == null || !req.getNewPassword().equals(req.getConfirmPassword())) {
            throw new IllegalArgumentException("New password and confirm password do not match.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found with email: " + email));

        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect.");
        }

        if (passwordEncoder.matches(req.getNewPassword(), user.getPassword())) {
            throw new IllegalArgumentException("New password must be different from current password.");
        }

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        user.setLastPasswordChange(LocalDateTime.now());
        userRepository.save(user);

        notificationService.createNotification(
                user,
                "Admin Security Alert",
                "Your administrator account password was changed successfully.",
                "SECURITY"
        );
    }

    // ==========================================
    // 3. NOTIFICATION PREFERENCES`;

if (oldMethodRegex.test(serviceContent)) {
  serviceContent = serviceContent.replace(oldMethodRegex, newMethod);
  fs.writeFileSync(servicePath, serviceContent, 'utf8');
  console.log('Successfully updated AdminSettingsService.java changePassword method');
} else {
  console.error('Could not find changePassword block in AdminSettingsService.java');
}
