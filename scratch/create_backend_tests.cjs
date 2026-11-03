const fs = require('fs');
const path = require('path');

const testPath = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\test\\java\\com\\primeroute\\logistics\\service\\CustomerRegistrationAndLoginValidationTest.java';

const testContent = `package com.primeroute.logistics.service;

import com.primeroute.logistics.dto.LoginRequest;
import com.primeroute.logistics.dto.LoginResponse;
import com.primeroute.logistics.dto.RegisterRequest;
import com.primeroute.logistics.entity.Role;
import com.primeroute.logistics.entity.User;
import com.primeroute.logistics.exception.UserAlreadyExistsException;
import com.primeroute.logistics.repository.UserRepository;
import com.primeroute.logistics.security.JwtService;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CustomerRegistrationAndLoginValidationTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @Mock
    private UserRepository userRepository;

    private PasswordEncoder passwordEncoder;
    private AuthService authService;
    private Validator validator;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        authService = new AuthService(authenticationManager, jwtService, userRepository, passwordEncoder);

        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    // ==========================================
    // REGISTRATION TESTS
    // ==========================================

    @Test
    @DisplayName("1. Valid registration creates customer account and BCrypt encodes password")
    void testValidRegistrationSuccess() {
        RegisterRequest req = new RegisterRequest(
                "Shruti Sahoo",
                "shruti@gmail.com",
                "9876543210",
                "Prime@12345",
                "Acme Logistics Pvt Ltd"
        );

        when(userRepository.existsByEmailIgnoreCase("shruti@gmail.com")).thenReturn(false);

        String result = authService.register(req);
        assertEquals("Customer account created successfully.", result);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertEquals("Shruti Sahoo", savedUser.getFullName());
        assertEquals("shruti@gmail.com", savedUser.getEmail());
        assertEquals("+91 9876543210", savedUser.getPhone());
        assertEquals(Role.CUSTOMER, savedUser.getRole());
        assertTrue(passwordEncoder.matches("Prime@12345", savedUser.getPassword()));
        assertNotEquals("Prime@12345", savedUser.getPassword());
        assertTrue(savedUser.getPassword().startsWith("$2a$") || savedUser.getPassword().startsWith("$2b$"));
    }

    @ParameterizedTest
    @ValueSource(strings = {"J789", "12345", "@@@", "John123", "A"})
    @DisplayName("2. Registration rejects invalid full names")
    void testInvalidFullNameRejected(String invalidName) {
        RegisterRequest req = new RegisterRequest(
                invalidName,
                "valid.user@gmail.com",
                "9876543210",
                "Logistics@2026",
                "Company Ltd"
        );

        // DTO Validation
        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(req);
        assertFalse(violations.isEmpty(), "DTO validation must reject invalid full name: " + invalidName);

        // Service Validation
        assertThrows(IllegalArgumentException.class, () -> authService.register(req));
    }

    @ParameterizedTest
    @ValueSource(strings = {"P%7@2.jk", "abc", "abc@", "abc@gmail", "@gmail.com", "plainaddress"})
    @DisplayName("3. Registration rejects malformed emails")
    void testInvalidEmailRejected(String invalidEmail) {
        RegisterRequest req = new RegisterRequest(
                "Valid Name",
                invalidEmail,
                "9876543210",
                "Logistics@2026",
                "Company Ltd"
        );

        // DTO Validation
        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(req);
        assertFalse(violations.isEmpty(), "DTO validation must reject malformed email: " + invalidEmail);

        // Service Validation
        assertThrows(IllegalArgumentException.class, () -> authService.register(req));
    }

    @ParameterizedTest
    @ValueSource(strings = {"1234567890", "98765abcde", "98765", "5000000000", "+91 1234567890"})
    @DisplayName("4. Registration rejects invalid Indian mobile numbers")
    void testInvalidPhoneRejected(String invalidPhone) {
        RegisterRequest req = new RegisterRequest(
                "Valid Name",
                "valid.user@gmail.com",
                invalidPhone,
                "Logistics@2026",
                "Company Ltd"
        );

        // DTO Validation
        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(req);
        assertFalse(violations.isEmpty(), "DTO validation must reject invalid phone: " + invalidPhone);

        // Service Validation
        assertThrows(IllegalArgumentException.class, () -> authService.register(req));
    }

    @Test
    @DisplayName("4b. Registration accepts 9000000000 as structurally valid Indian mobile number")
    void testTestPhoneNumberAcceptedStructurally() {
        RegisterRequest req = new RegisterRequest(
                "Test Customer",
                "test.qa@gmail.com",
                "9000000000",
                "Prime@12345",
                "Test Corp"
        );

        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(req);
        assertTrue(violations.isEmpty(), "9000000000 should be structurally valid");

        when(userRepository.existsByEmailIgnoreCase("test.qa@gmail.com")).thenReturn(false);
        assertDoesNotThrow(() -> authService.register(req));
    }

    @ParameterizedTest
    @ValueSource(strings = {"Ab1", "password", "Password", "Password123", "12345678", "Ab1😂😂😂😂😂", "Short!1"})
    @DisplayName("5. Registration rejects weak passwords lacking required character classes")
    void testWeakPasswordRejected(String weakPassword) {
        RegisterRequest req = new RegisterRequest(
                "Valid Name",
                "valid.user@gmail.com",
                "9876543210",
                weakPassword,
                "Company Ltd"
        );

        // DTO Validation
        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(req);
        assertFalse(violations.isEmpty(), "DTO validation must reject weak password: " + weakPassword);

        // Service Validation
        assertThrows(IllegalArgumentException.class, () -> authService.register(req));
    }

    @Test
    @DisplayName("6. Duplicate email throws UserAlreadyExistsException (409 Conflict)")
    void testDuplicateEmailReturnsConflict() {
        RegisterRequest req = new RegisterRequest(
                "Existing User",
                "existing@primeroute.com",
                "9876543210",
                "PrimeRoute#45",
                "Existing Inc"
        );

        when(userRepository.existsByEmailIgnoreCase("existing@primeroute.com")).thenReturn(true);

        UserAlreadyExistsException ex = assertThrows(UserAlreadyExistsException.class, () -> authService.register(req));
        assertEquals("An account with this email already exists.", ex.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    // ==========================================
    // LOGIN TESTS
    // ==========================================

    @Test
    @DisplayName("7. Valid login credentials return 200 with JWT token")
    void testValidLoginSuccess() {
        LoginRequest req = new LoginRequest("shruti@gmail.com", "Prime@12345");

        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername("shruti@gmail.com")
                .password(passwordEncoder.encode("Prime@12345"))
                .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_CUSTOMER")))
                .build();

        Authentication mockAuth = mock(Authentication.class);
        when(mockAuth.getPrincipal()).thenReturn(userDetails);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(mockAuth);
        when(jwtService.generateToken(userDetails)).thenReturn("mock-jwt-token-12345");

        User userEntity = new User("shruti@gmail.com", passwordEncoder.encode("Prime@12345"), "Shruti Sahoo", Role.CUSTOMER);
        when(userRepository.findByEmailIgnoreCase("shruti@gmail.com")).thenReturn(Optional.of(userEntity));

        LoginResponse response = authService.login(req);

        assertNotNull(response);
        assertEquals("mock-jwt-token-12345", response.getToken());
        assertEquals("shruti@gmail.com", response.getEmail());
        assertEquals("Shruti Sahoo", response.getFullName());
        assertEquals("ROLE_CUSTOMER", response.getRole());
    }

    @Test
    @DisplayName("8. Wrong password returns generic 401 message (Invalid email or password)")
    void testWrongPasswordThrowsBadCredentials() {
        LoginRequest req = new LoginRequest("shruti@gmail.com", "WrongPassword@123");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        BadCredentialsException ex = assertThrows(BadCredentialsException.class, () -> authService.login(req));
        assertEquals("Invalid email or password.", ex.getMessage());
    }

    @Test
    @DisplayName("9. Nonexistent email returns generic 401 message (Invalid email or password)")
    void testNonExistentEmailThrowsBadCredentials() {
        LoginRequest req = new LoginRequest("nonexistent@domain.com", "Prime@12345");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        BadCredentialsException ex = assertThrows(BadCredentialsException.class, () -> authService.login(req));
        assertEquals("Invalid email or password.", ex.getMessage());
    }

    @ParameterizedTest
    @ValueSource(strings = {"P%7@2.jk", "invalid-email", "user@", "@domain.com"})
    @DisplayName("10. Malformed login email is rejected")
    void testMalformedLoginEmailRejected(String malformedEmail) {
        LoginRequest req = new LoginRequest(malformedEmail, "Prime@12345");

        Set<ConstraintViolation<LoginRequest>> violations = validator.validate(req);
        assertFalse(violations.isEmpty(), "Login DTO validation must reject: " + malformedEmail);

        assertThrows(IllegalArgumentException.class, () -> authService.login(req));
    }

    @Test
    @DisplayName("11. Empty login fields are rejected")
    void testEmptyLoginFieldsRejected() {
        LoginRequest emptyReq = new LoginRequest("", "");

        Set<ConstraintViolation<LoginRequest>> violations = validator.validate(emptyReq);
        assertEquals(2, violations.size());

        assertThrows(IllegalArgumentException.class, () -> authService.login(emptyReq));
    }
}
`;

fs.writeFileSync(testPath, testContent, 'utf8');
console.log('Created CustomerRegistrationAndLoginValidationTest.java');
