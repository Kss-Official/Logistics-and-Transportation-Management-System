const fs = require('fs');

const testCode = `package com.primeroute.logistics.service;

import com.primeroute.logistics.dto.AddressRequest;
import com.primeroute.logistics.dto.AddressResponse;
import com.primeroute.logistics.entity.Address;
import com.primeroute.logistics.entity.Role;
import com.primeroute.logistics.entity.User;
import com.primeroute.logistics.exception.ResourceNotFoundException;
import com.primeroute.logistics.repository.AddressRepository;
import com.primeroute.logistics.repository.OrderRepository;
import com.primeroute.logistics.repository.UserRepository;
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
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AddressValidationTest {

    @Mock private AddressRepository addressRepository;
    @Mock private UserRepository userRepository;
    @Mock private OrderRepository orderRepository;
    @Mock private GeocodingService geocodingService;

    private AddressService addressService;
    private Validator validator;
    private User testCustomer;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
        addressService = new AddressService(addressRepository, userRepository, orderRepository, geocodingService);

        testCustomer = new User();
        testCustomer.setId(101L);
        testCustomer.setEmail("customer@primeroute.test");
        testCustomer.setFullName("Rahul Kumar");
        testCustomer.setRole(Role.ROLE_CUSTOMER);
    }

    private AddressRequest createValidAddressRequest() {
        AddressRequest req = new AddressRequest();
        req.setAddressType("Office");
        req.setContactName("Rahul Kumar");
        req.setPhone("9876543210");
        req.setAddressLine1("12 MG Road, Indiranagar");
        req.setAddressLine2("Near Metro Station");
        req.setCity("Bengaluru");
        req.setState("Karnataka");
        req.setPostalCode("560038");
        req.setCountry("India");
        req.setDefaultAddress(true);
        return req;
    }

    @Test
    @DisplayName("1. Valid address creation succeeds with geocoding and persistence")
    void testValidAddressCreation() {
        AddressRequest req = createValidAddressRequest();
        Set<ConstraintViolation<AddressRequest>> violations = validator.validate(req);
        assertTrue(violations.isEmpty(), "Valid address must have 0 constraint violations");

        when(userRepository.findByEmail("customer@primeroute.test")).thenReturn(Optional.of(testCustomer));
        when(addressRepository.findByCustomer(testCustomer)).thenReturn(Collections.emptyList());
        when(geocodingService.geocode(any(), any(), any(), any(), any()))
                .thenReturn(new GeocodingService.Coordinates(12.9716, 77.5946));
        when(addressRepository.save(any(Address.class))).thenAnswer(i -> {
            Address a = i.getArgument(0);
            return a;
        });

        AddressResponse res = addressService.createAddress("customer@primeroute.test", req);

        assertNotNull(res);
        assertEquals("Rahul Kumar", res.getContactName());
        assertEquals("9876543210", res.getPhone());
        assertEquals("12 MG Road, Indiranagar", res.getAddressLine1());
        assertEquals("Bengaluru", res.getCity());
        assertEquals("Karnataka", res.getState());
        assertEquals("560038", res.getPostalCode());
        assertEquals("India", res.getCountry());
        assertTrue(res.isDefaultAddress());

        verify(addressRepository, times(1)).save(any(Address.class));
    }

    @Test
    @DisplayName("2. Valid address update succeeds")
    void testValidAddressUpdate() {
        AddressRequest req = createValidAddressRequest();
        req.setAddressLine1("45 Park Street, Commercial Complex");
        req.setCity("Kolkata");
        req.setState("West Bengal");
        req.setPostalCode("700016");

        Set<ConstraintViolation<AddressRequest>> violations = validator.validate(req);
        assertTrue(violations.isEmpty());

        Address existing = new Address();
        existing.setCustomer(testCustomer);
        existing.setContactName("Old Contact");

        when(userRepository.findByEmail("customer@primeroute.test")).thenReturn(Optional.of(testCustomer));
        when(addressRepository.findByIdAndCustomer(eq(1L), eq(testCustomer))).thenReturn(Optional.of(existing));
        when(addressRepository.save(any(Address.class))).thenAnswer(i -> i.getArgument(0));

        AddressResponse res = addressService.updateAddress("customer@primeroute.test", 1L, req);

        assertNotNull(res);
        assertEquals("45 Park Street, Commercial Complex", res.getAddressLine1());
        assertEquals("Kolkata", res.getCity());
        assertEquals("West Bengal", res.getState());
        assertEquals("700016", res.getPostalCode());
    }

    @ParameterizedTest
    @ValueSource(strings = {"12L", "123456", "@@@@@@", ")))))))", "+_)))", "12@#$", "   ", "a"})
    @DisplayName("3. Reject invalid contact persons containing digits, symbols or too short")
    void testInvalidContactPerson(String invalidContact) {
        AddressRequest req = createValidAddressRequest();
        req.setContactName(invalidContact);

        Set<ConstraintViolation<AddressRequest>> violations = validator.validate(req);
        assertFalse(violations.isEmpty(), "Expected violation for contact person: " + invalidContact);
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("contactName")));
    }

    @ParameterizedTest
    @ValueSource(strings = {"Rahul Kumar", "Priya Sharma", "Anita R. Das", "John-Paul Smith", "O'Connor", "Dr. B. R. Ambedkar"})
    @DisplayName("Accept legitimate contact names with spaces, apostrophes and hyphens")
    void testValidContactPerson(String validContact) {
        AddressRequest req = createValidAddressRequest();
        req.setContactName(validContact);

        Set<ConstraintViolation<AddressRequest>> violations = validator.validate(req);
        assertTrue(violations.stream().noneMatch(v -> v.getPropertyPath().toString().equals("contactName")),
                "Legitimate name should be valid: " + validContact);
    }

    @ParameterizedTest
    @ValueSource(strings = {"1234567890", "12345", "987654", "abcdefghij", "90000000000", "90000abc00", "0987654321"})
    @DisplayName("4. Reject invalid phone numbers")
    void testInvalidPhone(String invalidPhone) {
        AddressRequest req = createValidAddressRequest();
        req.setPhone(invalidPhone);

        Set<ConstraintViolation<AddressRequest>> violations = validator.validate(req);
        assertFalse(violations.isEmpty(), "Expected violation for phone: " + invalidPhone);
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("phone")));
    }

    @ParameterizedTest
    @ValueSource(strings = {"9876543210", "9123456789", "8087654321", "9000000000", "+91 98765 43210", "+919876543210", "+91-9876543210"})
    @DisplayName("Accept valid Indian mobile numbers")
    void testValidPhone(String validPhone) {
        AddressRequest req = createValidAddressRequest();
        req.setPhone(validPhone);

        Set<ConstraintViolation<AddressRequest>> violations = validator.validate(req);
        assertTrue(violations.stream().noneMatch(v -> v.getPropertyPath().toString().equals("phone")),
                "Valid phone should pass: " + validPhone);
    }

    @ParameterizedTest
    @ValueSource(strings = {"@@@@@@", "!!!!!!!!", "12345", "wbhqwbdqd18u29w2u90e9ue9u", "   ", "abc"})
    @DisplayName("5. Reject invalid street addresses (symbols, purely numeric, or gibberish without spaces)")
    void testInvalidStreetAddress(String invalidStreet) {
        AddressRequest req = createValidAddressRequest();
        req.setAddressLine1(invalidStreet);

        Set<ConstraintViolation<AddressRequest>> violations = validator.validate(req);
        boolean beanViolation = !violations.isEmpty() && violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("addressLine1"));

        if (!beanViolation) {
            // Must be caught by service business validation
            when(userRepository.findByEmail("customer@primeroute.test")).thenReturn(Optional.of(testCustomer));
            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
                addressService.createAddress("customer@primeroute.test", req);
            });
            assertTrue(ex.getMessage().contains("street") || ex.getMessage().contains("address"));
        } else {
            assertTrue(beanViolation);
        }
    }

    @ParameterizedTest
    @ValueSource(strings = {"12 MG Road, Indiranagar", "45 Park Street", "Flat 12, Brigade Road", "Plot 18, Whitefield Main Road", "Plot No. 42-B, Industrial Estate"})
    @DisplayName("Accept legitimate street / building address strings")
    void testValidStreetAddress(String validStreet) {
        AddressRequest req = createValidAddressRequest();
        req.setAddressLine1(validStreet);

        Set<ConstraintViolation<AddressRequest>> violations = validator.validate(req);
        assertTrue(violations.stream().noneMatch(v -> v.getPropertyPath().toString().equals("addressLine1")),
                "Legitimate street should pass: " + validStreet);
    }

    @ParameterizedTest
    @ValueSource(strings = {"283899802290", "123456", "@@@@@@", "999999", "City123", "   ", "!"})
    @DisplayName("6. Reject invalid cities consisting only of digits, symbols or alphanumeric gibberish")
    void testInvalidCity(String invalidCity) {
        AddressRequest req = createValidAddressRequest();
        req.setCity(invalidCity);

        Set<ConstraintViolation<AddressRequest>> violations = validator.validate(req);
        assertFalse(violations.isEmpty(), "Expected violation for city: " + invalidCity);
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("city")));
    }

    @ParameterizedTest
    @ValueSource(strings = {"Bengaluru", "Bangalore", "Kolkata", "Mumbai", "Bhubaneswar", "New Delhi", "Navi Mumbai", "St. Thomas Mount"})
    @DisplayName("Accept valid city names")
    void testValidCity(String validCity) {
        AddressRequest req = createValidAddressRequest();
        req.setCity(validCity);

        Set<ConstraintViolation<AddressRequest>> violations = validator.validate(req);
        assertTrue(violations.stream().noneMatch(v -> v.getPropertyPath().toString().equals("city")),
                "Valid city should pass: " + validCity);
    }

    @ParameterizedTest
    @ValueSource(strings = {"29u929i20i2", "123456", "@@@@@@", "XYZ123", "RandomLand"})
    @DisplayName("7. Reject invalid states not in the controlled Indian States / UTs list")
    void testInvalidState(String invalidState) {
        AddressRequest req = createValidAddressRequest();
        req.setState(invalidState);

        when(userRepository.findByEmail("customer@primeroute.test")).thenReturn(Optional.of(testCustomer));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            addressService.createAddress("customer@primeroute.test", req);
        });
        assertTrue(ex.getMessage().contains("state") || ex.getMessage().contains("State"));
    }

    @ParameterizedTest
    @ValueSource(strings = {"Karnataka", "Odisha", "West Bengal", "Maharashtra", "Tamil Nadu", "Delhi", "karnataka", "WEST BENGAL"})
    @DisplayName("Accept legitimate Indian States and Union Territories")
    void testValidState(String validState) {
        AddressRequest req = createValidAddressRequest();
        req.setState(validState);

        when(userRepository.findByEmail("customer@primeroute.test")).thenReturn(Optional.of(testCustomer));
        when(addressRepository.findByCustomer(testCustomer)).thenReturn(Collections.emptyList());
        when(addressRepository.save(any(Address.class))).thenAnswer(i -> i.getArgument(0));

        AddressResponse res = addressService.createAddress("customer@primeroute.test", req);
        assertNotNull(res);
        assertNotNull(res.getState());
    }

    @ParameterizedTest
    @ValueSource(strings = {"77777", "7777777", "ABC123", "12A456", "000000", "056001", "   "})
    @DisplayName("8. Reject invalid postal PIN codes")
    void testInvalidPostalCode(String invalidPin) {
        AddressRequest req = createValidAddressRequest();
        req.setPostalCode(invalidPin);

        Set<ConstraintViolation<AddressRequest>> violations = validator.validate(req);
        assertFalse(violations.isEmpty(), "Expected violation for postal code: " + invalidPin);
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("postalCode")));
    }

    @ParameterizedTest
    @ValueSource(strings = {"560001", "751001", "700001", "110001", "777777", "560038"})
    @DisplayName("Accept valid 6-digit Indian PIN codes starting with 1-9")
    void testValidPostalCode(String validPin) {
        AddressRequest req = createValidAddressRequest();
        req.setPostalCode(validPin);

        Set<ConstraintViolation<AddressRequest>> violations = validator.validate(req);
        assertTrue(violations.stream().noneMatch(v -> v.getPropertyPath().toString().equals("postalCode")),
                "Valid pin code should pass: " + validPin);
    }

    @Test
    @DisplayName("9. Reject customer accessing or updating another customer's address")
    void testCustomerOwnershipEnforcement() {
        AddressRequest req = createValidAddressRequest();

        User attacker = new User();
        attacker.setId(999L);
        attacker.setEmail("attacker@test.com");

        when(userRepository.findByEmail("attacker@test.com")).thenReturn(Optional.of(attacker));
        when(addressRepository.findByIdAndCustomer(eq(1L), eq(attacker))).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            addressService.updateAddress("attacker@test.com", 1L, req);
        });

        assertThrows(ResourceNotFoundException.class, () -> {
            addressService.getAddressById("attacker@test.com", 1L);
        });

        assertThrows(ResourceNotFoundException.class, () -> {
            addressService.deleteAddress("attacker@test.com", 1L);
        });
    }
}
`;

const targetTestPath = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/test/java/com/primeroute/logistics/service/AddressValidationTest.java';
fs.writeFileSync(targetTestPath, testCode, 'utf8');
console.log('Successfully wrote AddressValidationTest.java');
