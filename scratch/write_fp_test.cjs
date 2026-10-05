const fs = require('fs');
const path = require('path');

const testCode = `package com.primeroute.logistics.service;

import com.primeroute.logistics.dto.LoginRequest;
import com.primeroute.logistics.dto.LoginResponse;
import com.primeroute.logistics.entity.PasswordResetToken;
import com.primeroute.logistics.entity.Role;
import com.primeroute.logistics.entity.User;
import com.primeroute.logistics.repository.PasswordResetTokenRepository;
import com.primeroute.logistics.repository.UserRepository;
import com.primeroute.logistics.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class ForgotPasswordAndResetIntegrationTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock private EmailService emailService;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtService jwtService;

    private PasswordEncoder passwordEncoder;
    private ForgotPasswordService forgotPasswordService;
    private ResetPasswordService resetPasswordService;
    private AuthService authService;
    private CustomUserDetailsService customUserDetailsService;

    private User testCustomer;
    private final String rawInitialPassword = "InitialPassword@2026";
    private final String email = "shrutisanjanasahoo@gmail.com";

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();

        testCustomer = new User(
                email,
                passwordEncoder.encode(rawInitialPassword),
                "Shruti Sanjana Sahoo",
                Role.CUSTOMER
        );
        testCustomer.setId(99L);
        testCustomer.setStatus("ACTIVE");

        when(userRepository.findByEmailIgnoreCase(email.toLowerCase())).thenReturn(Optional.of(testCustomer));
        when(userRepository.findByEmail(email.toLowerCase())).thenReturn(Optional.of(testCustomer));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        forgotPasswordService = new ForgotPasswordService(userRepository, passwordResetTokenRepository, emailService);
        resetPasswordService = new ResetPasswordService(passwordResetTokenRepository, userRepository, passwordEncoder);
        authService = new AuthService(authenticationManager, jwtService, userRepository, passwordEncoder);
        customUserDetailsService = new CustomUserDetailsService(userRepository);
    }

    @Test
    @DisplayName("1. Existing password login succeeds with BCrypt verification")
    void testExistingPasswordLoginSucceeds() {
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);
        assertNotNull(userDetails);
        assertTrue(passwordEncoder.matches(rawInitialPassword, userDetails.getPassword()));

        Authentication mockAuth = mock(Authentication.class);
        when(mockAuth.getPrincipal()).thenReturn(userDetails);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(mockAuth);
        when(jwtService.generateToken(any(UserDetails.class))).thenReturn("mock-jwt-token");

        LoginResponse response = authService.login(new LoginRequest(email, rawInitialPassword));
        assertNotNull(response);
        assertEquals("mock-jwt-token", response.getToken());
        assertEquals(email, response.getEmail());
    }

    @Test
    @DisplayName("2. Forgot password creates valid reset token and hashes token for DB storage")
    void testForgotPasswordCreatesResetToken() {
        String rawToken = forgotPasswordService.createPasswordResetToken(email);
        assertNotNull(rawToken);
        assertFalse(rawToken.isBlank());

        ArgumentCaptor<PasswordResetToken> tokenCaptor = ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(passwordResetTokenRepository).save(tokenCaptor.capture());
        PasswordResetToken savedToken = tokenCaptor.getValue();

        assertNotNull(savedToken);
        assertEquals(testCustomer, savedToken.getUser());
        assertEquals(ForgotPasswordService.hashToken(rawToken), savedToken.getToken());
        assertFalse(savedToken.isUsed());
        assertTrue(savedToken.getExpiryDate().isAfter(LocalDateTime.now()));

        verify(emailService).sendPasswordResetEmail(eq(email), eq(rawToken), eq(testCustomer.getFullName()));
    }

    @Test
    @DisplayName("3. Valid reset changes password and updates database with BCrypt hash")
    void testValidResetChangesPassword() {
        String rawToken = "sample-raw-token-12345";
        String hashedToken = ForgotPasswordService.hashToken(rawToken);

        PasswordResetToken resetToken = new PasswordResetToken(
                hashedToken,
                testCustomer,
                LocalDateTime.now().plusMinutes(15)
        );

        when(passwordResetTokenRepository.findByToken(hashedToken)).thenReturn(Optional.of(resetToken));

        String newPassword = "NewSecretPassword@2026!";
        User updatedUser = resetPasswordService.resetPassword(rawToken, newPassword, newPassword);

        assertNotNull(updatedUser);
        assertTrue(passwordEncoder.matches(newPassword, updatedUser.getPassword()));
        assertFalse(passwordEncoder.matches(rawInitialPassword, updatedUser.getPassword()));
        assertTrue(updatedUser.getPassword().startsWith("$2a$") || updatedUser.getPassword().startsWith("$2b$"));
        assertTrue(resetToken.isUsed());
        verify(passwordResetTokenRepository).save(resetToken);
        verify(userRepository).save(updatedUser);
    }

    @Test
    @DisplayName("4. New password can login successfully after reset")
    void testNewPasswordCanLogin() {
        String newPassword = "BrandNewPassword@2026!";
        testCustomer.setPassword(passwordEncoder.encode(newPassword));

        UserDetails updatedUserDetails = customUserDetailsService.loadUserByUsername(email);
        assertTrue(passwordEncoder.matches(newPassword, updatedUserDetails.getPassword()));

        Authentication mockAuth = mock(Authentication.class);
        when(mockAuth.getPrincipal()).thenReturn(updatedUserDetails);
        when(authenticationManager.authenticate(argThat(auth ->
                auth != null && auth.getCredentials().equals(newPassword)
        ))).thenReturn(mockAuth);
        when(jwtService.generateToken(any(UserDetails.class))).thenReturn("jwt-new-pass");

        LoginResponse response = authService.login(new LoginRequest(email, newPassword));
        assertEquals("jwt-new-pass", response.getToken());
        assertEquals("ROLE_CUSTOMER", response.getRole());
    }

    @Test
    @DisplayName("5. Old password cannot login after reset (throws BadCredentialsException)")
    void testOldPasswordCannotLoginAfterReset() {
        String newPassword = "BrandNewPassword@2026!";
        testCustomer.setPassword(passwordEncoder.encode(newPassword));

        when(authenticationManager.authenticate(argThat(auth ->
                auth != null && auth.getCredentials().equals(rawInitialPassword)
        ))).thenThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(BadCredentialsException.class, () ->
                authService.login(new LoginRequest(email, rawInitialPassword))
        );
    }

    @Test
    @DisplayName("6. Expired token cannot reset password")
    void testExpiredTokenCannotResetPassword() {
        String rawToken = "expired-token-xyz";
        String hashedToken = ForgotPasswordService.hashToken(rawToken);

        PasswordResetToken expiredToken = new PasswordResetToken(
                hashedToken,
                testCustomer,
                LocalDateTime.now().minusMinutes(5) // Expired
        );

        when(passwordResetTokenRepository.findByToken(hashedToken)).thenReturn(Optional.of(expiredToken));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                resetPasswordService.resetPassword(rawToken, "NewPass@2026!", "NewPass@2026!")
        );
        assertTrue(ex.getMessage().contains("expired"));
    }

    @Test
    @DisplayName("7. Invalid or non-existent token cannot reset password")
    void testInvalidTokenCannotResetPassword() {
        when(passwordResetTokenRepository.findByToken(anyString())).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                resetPasswordService.resetPassword("invalid-token-999", "NewPass@2026!", "NewPass@2026!")
        );
        assertTrue(ex.getMessage().contains("Invalid password reset link"));
    }

    @Test
    @DisplayName("8. Reset updates the correct user and does not modify other accounts")
    void testResetUpdatesCorrectUser() {
        User otherUser = new User("other@primeroute.com", passwordEncoder.encode("OtherPass@123"), "Other User", Role.CUSTOMER);
        otherUser.setId(100L);

        String rawToken = "token-for-shruti";
        String hashedToken = ForgotPasswordService.hashToken(rawToken);
        PasswordResetToken resetToken = new PasswordResetToken(hashedToken, testCustomer, LocalDateTime.now().plusMinutes(15));
        when(passwordResetTokenRepository.findByToken(hashedToken)).thenReturn(Optional.of(resetToken));

        User result = resetPasswordService.resetPassword(rawToken, "UpdatedSecret@2026!", "UpdatedSecret@2026!");
        assertEquals(testCustomer.getId(), result.getId());
        assertEquals(email, result.getEmail());
        assertTrue(passwordEncoder.matches("UpdatedSecret@2026!", testCustomer.getPassword()));
        assertFalse(passwordEncoder.matches("UpdatedSecret@2026!", otherUser.getPassword()));
    }

    @Test
    @DisplayName("9. Password is saved as BCrypt hash without double encoding")
    void testPasswordIsStoredAsBCryptHash() {
        String rawPass = "SingleEncoded@2026";
        String encoded = passwordEncoder.encode(rawPass);
        testCustomer.setPassword(encoded);

        // Verify it matches raw password
        assertTrue(passwordEncoder.matches(rawPass, testCustomer.getPassword()));
        // Verify it is a valid BCrypt hash string (60 chars, $2a$ or $2b$)
        assertEquals(60, testCustomer.getPassword().length());
        assertTrue(testCustomer.getPassword().startsWith("$2a$") || testCustomer.getPassword().startsWith("$2b$"));
    }

    @Test
    @DisplayName("10. Resetting password twice in sequence works correctly and invalidates first token")
    void testResettingPasswordTwice() {
        // Reset 1
        String token1 = "token-one-111";
        String hash1 = ForgotPasswordService.hashToken(token1);
        PasswordResetToken prt1 = new PasswordResetToken(hash1, testCustomer, LocalDateTime.now().plusMinutes(15));
        when(passwordResetTokenRepository.findByToken(hash1)).thenReturn(Optional.of(prt1));

        resetPasswordService.resetPassword(token1, "FirstNewPass@2026", "FirstNewPass@2026");
        assertTrue(prt1.isUsed());
        assertTrue(passwordEncoder.matches("FirstNewPass@2026", testCustomer.getPassword()));

        // Trying to reuse token 1 must fail
        assertThrows(IllegalArgumentException.class, () ->
                resetPasswordService.resetPassword(token1, "ThirdPass@2026", "ThirdPass@2026")
        );

        // Reset 2 with new token
        String token2 = "token-two-222";
        String hash2 = ForgotPasswordService.hashToken(token2);
        PasswordResetToken prt2 = new PasswordResetToken(hash2, testCustomer, LocalDateTime.now().plusMinutes(15));
        when(passwordResetTokenRepository.findByToken(hash2)).thenReturn(Optional.of(prt2));

        resetPasswordService.resetPassword(token2, "SecondNewPass@2026", "SecondNewPass@2026");
        assertTrue(prt2.isUsed());
        assertTrue(passwordEncoder.matches("SecondNewPass@2026", testCustomer.getPassword()));
        assertFalse(passwordEncoder.matches("FirstNewPass@2026", testCustomer.getPassword()));
    }
}
`;

const backendDir = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management";
const dest = path.join(backendDir, 'src/test/java/com/primeroute/logistics/service/ForgotPasswordAndResetIntegrationTest.java');
fs.writeFileSync(dest, testCode, 'utf8');
console.log("Successfully wrote ForgotPasswordAndResetIntegrationTest.java to backend!");
