const fs = require('fs');
const path = require('path');

const BACKEND_DIR = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics';

// 1. DataInitializer.java
const dataInitPath = path.join(BACKEND_DIR, 'config/DataInitializer.java');
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

import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initializeUsers(
            UserRepository userRepository,
            SupportContactRepository supportContactRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            // Initialize Admin user ONLY if no ADMIN account exists in database.
            // Existing admin credentials, updated email (sanjanaaa.shru@gmail.com), and password updates
            // MUST be preserved across server restarts.
            List<User> existingAdmins = userRepository.findByRoleOrderByCreatedAtDesc(Role.ADMIN);
            if (existingAdmins.isEmpty()) {
                User admin = new User(
                        "sanjanaaa.shru@gmail.com",
                        passwordEncoder.encode("Admin@PrimeRoute2026!"),
                        "PrimeRoute Operations",
                        Role.ADMIN
                );
                userRepository.save(admin);
                System.out.println("Admin user initialized with email: " + admin.getEmail());
            } else {
                System.out.println("Admin user already present (" + existingAdmins.get(0).getEmail() + "); credentials preserved.");
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
console.log('Wrote', dataInitPath);

// 2. EmailService.java
const emailServicePath = path.join(BACKEND_DIR, 'service/EmailService.java');
const emailServiceContent = `package com.primeroute.logistics.service;

import com.primeroute.logistics.exception.EmailServiceException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("\${app.mail.from:no-reply@primeroute.com}")
    private String fromEmail;

    @Value("\${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("\${spring.mail.username:}")
    private String mailUsername;

    @Value("\${spring.mail.password:}")
    private String mailPassword;

    @Value("\${app.reset-token.expiration-minutes:15}")
    private int expirationMinutes;

    public void sendPasswordResetEmail(String toEmail, String resetToken, String recipientName) {
        String resetLink = frontendUrl + "/reset-password?token=" + resetToken;

        // Ensure JavaMailSenderImpl has latest credentials if provided in env
        if (mailSender instanceof JavaMailSenderImpl impl) {
            if (mailUsername != null && !mailUsername.isBlank()) {
                impl.setUsername(mailUsername.trim());
            }
            if (mailPassword != null && !mailPassword.isBlank()) {
                impl.setPassword(mailPassword.trim());
            }
        }

        if (mailSender == null || mailUsername == null || mailUsername.isBlank() || mailPassword == null || mailPassword.isBlank()) {
            log.error("Email service is not fully configured. Please set MAIL_USERNAME and MAIL_PASSWORD environment variables.");
            throw new EmailServiceException("Email service is not configured. Please set MAIL_USERNAME and MAIL_PASSWORD.");
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String senderAddress = (mailUsername != null && !mailUsername.isBlank()) ? mailUsername.trim() : fromEmail;
            helper.setFrom(senderAddress, "PrimeRoute Logistics Support");
            helper.setTo(toEmail);
            helper.setSubject("PrimeRoute Logistics — Admin Password Reset");

            String htmlContent = "<!DOCTYPE html>"
                    + "<html>"
                    + "<head><meta charset=\\"UTF-8\\"></head>"
                    + "<body style=\\"margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a;\\">"
                    + "<div style=\\"max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);\\">"
                    + "  <div style=\\"background: linear-gradient(135deg, #1e293b, #0f172a); padding: 32px 28px; text-align: center;\\">"
                    + "    <h1 style=\\"margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.02em;\\">PrimeRoute <span style=\\"color: #38bdf8; font-weight: 500;\\">Logistics</span></h1>"
                    + "    <p style=\\"margin: 6px 0 0; color: #94a3b8; font-size: 13px;\\">Global Supply Chain & Operations Management</p>"
                    + "  </div>"
                    + "  <div style=\\"padding: 32px 28px;\\">"
                    + "    <p style=\\"font-size: 16px; margin: 0 0 16px; font-weight: 600; color: #0f172a;\\">Hello,</p>"
                    + "    <p style=\\"font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 24px;\\">"
                    + "      We received a request to reset the password for your PrimeRoute Logistics administrator account."
                    + "    </p>"
                    + "    <div style=\\"text-align: center; margin: 28px 0;\\">"
                    + "      <a href=\\"" + resetLink + "\\" style=\\"display: inline-block; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; font-weight: 600; font-size: 15px; padding: 14px 34px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);\\">Reset Password</a>"
                    + "    </div>"
                    + "    <p style=\\"font-size: 13px; line-height: 1.6; color: #64748b; margin: 0 0 12px;\\">"
                    + "      This link will expire after " + expirationMinutes + " minutes."
                    + "    </p>"
                    + "    <p style=\\"font-size: 13px; line-height: 1.6; color: #64748b; margin: 0 0 24px;\\">"
                    + "      If you did not request this password reset, you can safely ignore this email."
                    + "    </p>"
                    + "    <div style=\\"border-top: 1px solid #f1f5f9; padding-top: 20px; font-size: 13px; color: #475569;\\">"
                    + "      Regards,<br/>"
                    + "      <strong>PrimeRoute Logistics Support</strong>"
                    + "    </div>"
                    + "    <div style=\\"margin-top: 24px; padding: 14px; background-color: #f8fafc; border-radius: 6px; font-size: 12px; color: #64748b; word-break: break-all;\\">"
                    + "      If the button above does not work, copy and paste this link into your browser:<br/>"
                    + "      <a href=\\"" + resetLink + "\\" style=\\"color: #2563eb;\\">" + resetLink + "</a>"
                    + "    </div>"
                    + "  </div>"
                    + "  <div style=\\"background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 28px; text-align: center; font-size: 12px; color: #94a3b8;\\">"
                    + "    &copy; 2026 PrimeRoute Logistics Management. All rights reserved."
                    + "  </div>"
                    + "</div>"
                    + "</body>"
                    + "</html>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Password reset email sent successfully to: {}", toEmail);
        } catch (EmailServiceException ese) {
            throw ese;
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", toEmail, e.getMessage());
            throw new EmailServiceException("Unable to send the password reset email right now. Please try again later.", e);
        }
    }
}
`;
fs.writeFileSync(emailServicePath, emailServiceContent, 'utf8');
console.log('Wrote', emailServicePath);

// 3. ForgotPasswordService.java
const forgotServicePath = path.join(BACKEND_DIR, 'service/ForgotPasswordService.java');
const forgotServiceContent = `package com.primeroute.logistics.service;

import com.primeroute.logistics.entity.PasswordResetToken;
import com.primeroute.logistics.entity.User;
import com.primeroute.logistics.repository.PasswordResetTokenRepository;
import com.primeroute.logistics.repository.UserRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

@Service
public class ForgotPasswordService {

    private static final Logger log = LoggerFactory.getLogger(ForgotPasswordService.class);
    private final SecureRandom secureRandom = new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;

    @Value("\${app.reset-token.expiration-minutes:15}")
    private int expirationMinutes;

    @Value("\${app.reset-token.cooldown-minutes:1}")
    private int cooldownMinutes;

    public ForgotPasswordService(
            UserRepository userRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            EmailService emailService) {

        this.userRepository = userRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.emailService = emailService;
    }

    @Transactional
    public void createPasswordResetToken(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Please enter your email address.");
        }

        String normalizedEmail = email.trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail).orElse(null);

        // Security best practice: do not reveal if account exists (prevent email enumeration)
        if (user == null) {
            log.info("Password reset requested for non-existent email: {}", normalizedEmail);
            return;
        }

        Optional<PasswordResetToken> latestToken = passwordResetTokenRepository.findTopByUserOrderByCreatedAtDesc(user);
        if (latestToken.isPresent() && !latestToken.get().isUsed()) {
            LocalDateTime cooldownUntil = latestToken.get().getCreatedAt().plusMinutes(cooldownMinutes);
            if (LocalDateTime.now().isBefore(cooldownUntil)) {
                log.warn("Password reset requested too quickly for email: {}, cooldown in effect.", normalizedEmail);
                throw new IllegalArgumentException("A password reset link was recently sent. Please wait a moment before trying again.");
            }
        }

        passwordResetTokenRepository.deleteByUser(user);

        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

        String hashedToken = hashToken(rawToken);
        LocalDateTime expiryDate = LocalDateTime.now().plusMinutes(expirationMinutes);

        PasswordResetToken resetToken = new PasswordResetToken(
                hashedToken,
                user,
                expiryDate
        );

        passwordResetTokenRepository.save(resetToken);
        emailService.sendPasswordResetEmail(user.getEmail(), rawToken, user.getFullName());
    }

    public static String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm unavailable", e);
        }
    }
}
`;
fs.writeFileSync(forgotServicePath, forgotServiceContent, 'utf8');
console.log('Wrote', forgotServicePath);

// 4. AuthController.java
const authControllerPath = path.join(BACKEND_DIR, 'controller/AuthController.java');
const authControllerContent = `package com.primeroute.logistics.controller;

import com.primeroute.logistics.dto.ForgotPasswordRequest;
import com.primeroute.logistics.dto.RegisterRequest;
import com.primeroute.logistics.dto.LoginRequest;
import com.primeroute.logistics.dto.LoginResponse;
import com.primeroute.logistics.dto.ResetPasswordRequest;
import com.primeroute.logistics.exception.EmailServiceException;
import com.primeroute.logistics.service.AuthService;
import com.primeroute.logistics.service.ForgotPasswordService;
import com.primeroute.logistics.service.ResetPasswordService;

import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:5174"
})
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;
    private final ForgotPasswordService forgotPasswordService;
    private final ResetPasswordService resetPasswordService;

    public AuthController(
            AuthService authService,
            ForgotPasswordService forgotPasswordService,
            ResetPasswordService resetPasswordService) {

        this.authService = authService;
        this.forgotPasswordService = forgotPasswordService;
        this.resetPasswordService = resetPasswordService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/register")
    public ResponseEntity<String> register(
            @Valid @RequestBody RegisterRequest request) {

        String message = authService.register(request);
        return ResponseEntity.ok(message);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        try {
            forgotPasswordService.createPasswordResetToken(request.getEmail());

            return ResponseEntity.ok(
                    "If an account exists for this email address, a password reset link has been sent."
            );
        } catch (IllegalArgumentException e) {
            log.warn("Forgot password validation notice: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (EmailServiceException e) {
            log.error("Email delivery failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("We couldn't send the password reset email right now. Please try again.");
        } catch (Exception e) {
            log.error("Unexpected error during forgot password processing: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("We couldn't send the password reset email right now. Please try again.");
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        try {
            resetPasswordService.resetPassword(
                    request.getToken(),
                    request.getNewPassword(),
                    request.getConfirmPassword()
            );

            return ResponseEntity.ok("Password reset successfully.");
        } catch (IllegalArgumentException e) {
            log.warn("Password reset rejected: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error during password reset: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Unable to reset password. Please request a new reset link.");
        }
    }
}
`;
fs.writeFileSync(authControllerPath, authControllerContent, 'utf8');
console.log('Wrote', authControllerPath);

// 5. Update start-backend.ps1 to load .env.local if present
const startBackendPath = 'd:/Transportation-Logistic/start-backend.ps1';
const startBackendContent = `# PrimeRoute Logistics - Backend Startup Script
$STS_JDK = "C:\\Users\\shrut\\Downloads\\spring-tools\\sts-5.0.0.RELEASE\\plugins\\org.eclipse.justj.openjdk.hotspot.jre.full.win32.x86_64_25.0.1.v20251108-1451\\jre"
$BACKEND_DIR = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management"

if (Test-Path "$STS_JDK\\bin\\java.exe") {
    $env:JAVA_HOME = $STS_JDK
    $env:Path = "$STS_JDK\\bin;" + $env:Path
    Write-Host "[PrimeRoute] Using Java from STS: $STS_JDK" -ForegroundColor Green
}

# Load local environment variables from .env.local if present
$ENV_FILE = Join-Path $PSScriptRoot ".env.local"
if (Test-Path $ENV_FILE) {
    Get-Content $ENV_FILE | ForEach-Object {
        $line = $_.Trim()
        if ($line -and !$line.StartsWith("#") -and $line.Contains("=")) {
            $parts = $line.Split("=", 2)
            $name = $parts[0].Trim()
            $val = $parts[1].Trim()
            [System.Environment]::SetEnvironmentVariable($name, $val, "Process")
        }
    }
    Write-Host "[PrimeRoute] Loaded environment variables from .env.local" -ForegroundColor Green
}

Write-Host "[PrimeRoute] Starting Spring Boot server at $BACKEND_DIR..." -ForegroundColor Cyan
& "$BACKEND_DIR\\mvnw.cmd" -f "$BACKEND_DIR\\pom.xml" spring-boot:run
`;
fs.writeFileSync(startBackendPath, startBackendContent, 'utf8');
console.log('Wrote', startBackendPath);
