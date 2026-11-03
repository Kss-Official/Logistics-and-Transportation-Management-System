const fs = require('fs');

const addressRequestCode = `package com.primeroute.logistics.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class AddressRequest {

    @NotBlank(message = "Location type is required.")
    @JsonAlias({"locationType"})
    private String addressType;

    @NotBlank(message = "Enter a valid contact name.")
    @Size(min = 2, max = 100, message = "Contact name must be between 2 and 100 characters.")
    @Pattern(
        regexp = "^(?=.*[a-zA-Z])[a-zA-Z\\\\s.'-]{2,100}$",
        message = "Enter a valid contact name."
    )
    @JsonAlias({"contactPerson"})
    private String contactName;

    @NotBlank(message = "Enter a valid phone number.")
    @Pattern(
        regexp = "^(?:\\\\+91[\\\\s-]?)?[6-9](?:[\\\\s-]?\\\\d){9}$",
        message = "Enter a valid 10-digit Indian mobile number (e.g. 9876543210)."
    )
    @JsonAlias({"contactPhone"})
    private String phone;

    @NotBlank(message = "Enter a valid street / building address.")
    @Size(min = 5, max = 250, message = "Street address must be between 5 and 250 characters.")
    @Pattern(
        regexp = "^(?=.*[a-zA-Z])[a-zA-Z0-9\\\\s,.\\\\-/#/()']{5,250}$",
        message = "Enter a valid street / building address."
    )
    @JsonAlias({"streetAddress", "street"})
    private String addressLine1;

    @Size(max = 150, message = "Apartment / landmark cannot exceed 150 characters.")
    @Pattern(
        regexp = "^$|^[a-zA-Z0-9\\\\s,.\\\\-/#/()']{1,150}$",
        message = "Enter a valid landmark or apartment details."
    )
    @JsonAlias({"apartmentUnitLandmark", "landmark", "apartment"})
    private String addressLine2;

    @NotBlank(message = "Enter a valid city name.")
    @Size(min = 2, max = 100, message = "City cannot exceed 100 characters.")
    @Pattern(
        regexp = "^(?=.*[a-zA-Z])[a-zA-Z\\\\s.'-]{2,100}$",
        message = "Enter a valid city name."
    )
    private String city;

    @NotBlank(message = "Select a valid state.")
    @Size(min = 2, max = 100, message = "State cannot exceed 100 characters.")
    private String state;

    @NotBlank(message = "Postal code is required.")
    @Pattern(
        regexp = "^[1-9][0-9]{5}$",
        message = "Postal code must be a valid 6-digit PIN code starting with digits 1-9."
    )
    private String postalCode;

    @NotBlank(message = "Country is required.")
    @Size(max = 100, message = "Country cannot exceed 100 characters.")
    private String country;

    @JsonAlias({"isDefault"})
    private boolean defaultAddress;

    public AddressRequest() {
    }

    public String getAddressType() {
        return addressType;
    }

    public void setAddressType(String addressType) {
        this.addressType = addressType != null ? addressType.trim() : null;
    }

    public void setLocationType(String locationType) {
        setAddressType(locationType);
    }

    public String getContactName() {
        return contactName;
    }

    public void setContactName(String contactName) {
        this.contactName = contactName != null ? contactName.trim() : null;
    }

    public void setContactPerson(String contactPerson) {
        setContactName(contactPerson);
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone != null ? phone.trim() : null;
    }

    public void setContactPhone(String contactPhone) {
        setPhone(contactPhone);
    }

    public String getAddressLine1() {
        return addressLine1;
    }

    public void setAddressLine1(String addressLine1) {
        this.addressLine1 = addressLine1 != null ? addressLine1.trim() : null;
    }

    public void setStreetAddress(String streetAddress) {
        setAddressLine1(streetAddress);
    }

    public String getAddressLine2() {
        return addressLine2;
    }

    public void setAddressLine2(String addressLine2) {
        this.addressLine2 = addressLine2 != null ? addressLine2.trim() : null;
    }

    public void setApartmentUnitLandmark(String apartmentUnitLandmark) {
        setAddressLine2(apartmentUnitLandmark);
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city != null ? city.trim() : null;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state != null ? state.trim() : null;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode != null ? postalCode.trim() : null;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country != null ? country.trim() : null;
    }

    public boolean isDefaultAddress() {
        return defaultAddress;
    }

    public void setDefaultAddress(boolean defaultAddress) {
        this.defaultAddress = defaultAddress;
    }

    public void setIsDefault(boolean isDefault) {
        setDefaultAddress(isDefault);
    }
}
`;

const addressServiceCode = `package com.primeroute.logistics.service;

import com.primeroute.logistics.dto.AddressRequest;
import com.primeroute.logistics.dto.AddressResponse;
import com.primeroute.logistics.entity.Address;
import com.primeroute.logistics.entity.User;
import com.primeroute.logistics.exception.AddressInUseException;
import com.primeroute.logistics.exception.ResourceNotFoundException;
import com.primeroute.logistics.repository.AddressRepository;
import com.primeroute.logistics.repository.OrderRepository;
import com.primeroute.logistics.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@Service
public class AddressService {

    public static final List<String> VALID_INDIAN_STATES = Arrays.asList(
            "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
            "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
            "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
            "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
            "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
            "Andaman and Nicobar Islands", "Chandigarh",
            "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
            "Ladakh", "Lakshadweep", "Puducherry"
    );

    public static final List<String> ALLOWED_ADDRESS_TYPES = Arrays.asList(
            "Office", "Home", "Warehouse", "Pickup", "Delivery", "Other",
            "OFFICE", "HOME", "WAREHOUSE", "PICKUP", "DELIVERY", "OTHER"
    );

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final GeocodingService geocodingService;

    public AddressService(
            AddressRepository addressRepository,
            UserRepository userRepository,
            OrderRepository orderRepository,
            GeocodingService geocodingService) {

        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.geocodingService = geocodingService;
    }

    // ==========================================
    // VALIDATE ADDRESS BUSINESS RULES
    // ==========================================

    private void validateAddressBusinessRules(AddressRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Address request body cannot be null.");
        }

        // 1. Validate State against controlled Indian States & UTs
        String state = request.getState();
        if (state == null || state.trim().isEmpty()) {
            throw new IllegalArgumentException("Select a valid state.");
        }
        String matchedState = matchState(state.trim());
        if (matchedState == null) {
            throw new IllegalArgumentException("Invalid state '" + state + "'. Please select a valid Indian State or Union Territory.");
        }
        request.setState(matchedState);

        // 2. Validate Country
        String country = request.getCountry();
        if (country == null || country.trim().isEmpty()) {
            throw new IllegalArgumentException("Country is required.");
        }
        if (!country.trim().equalsIgnoreCase("India")) {
            throw new IllegalArgumentException("Currently only India addresses are supported.");
        }
        request.setCountry("India");

        // 3. Validate Location / Address Type
        String addressType = request.getAddressType();
        if (addressType == null || addressType.trim().isEmpty()) {
            throw new IllegalArgumentException("Location type is required.");
        }
        String matchedType = matchAddressType(addressType.trim());
        if (matchedType == null) {
            throw new IllegalArgumentException("Invalid location type '" + addressType + "'. Supported types: Office, Home, Warehouse, Pickup, Delivery, Other.");
        }
        request.setAddressType(matchedType);

        // 4. Validate Street Address content (reject continuous gibberish without spaces)
        String street = request.getAddressLine1();
        if (street != null) {
            String trimmedStreet = street.trim();
            if (trimmedStreet.length() > 20 && !trimmedStreet.contains(" ") && !trimmedStreet.contains(",") && !trimmedStreet.contains("-") && !trimmedStreet.contains("/")) {
                throw new IllegalArgumentException("Enter a valid street / building address with recognizable location details.");
            }
        }
    }

    private String matchState(String input) {
        for (String validState : VALID_INDIAN_STATES) {
            if (validState.equalsIgnoreCase(input)) {
                return validState;
            }
        }
        return null;
    }

    private String matchAddressType(String input) {
        for (String validType : ALLOWED_ADDRESS_TYPES) {
            if (validType.equalsIgnoreCase(input)) {
                return validType;
            }
        }
        return null;
    }

    // ==========================================
    // CREATE ADDRESS
    // ==========================================

    @Transactional
    public AddressResponse createAddress(
            String email,
            AddressRequest request) {

        validateAddressBusinessRules(request);

        User customer = getCustomerByEmail(email);

        Address address = new Address();

        address.setCustomer(customer);
        address.setAddressType(request.getAddressType());
        address.setContactName(request.getContactName().trim());
        address.setPhone(request.getPhone().trim());
        address.setAddressLine1(request.getAddressLine1().trim());
        address.setAddressLine2(request.getAddressLine2() != null && !request.getAddressLine2().trim().isEmpty() ? request.getAddressLine2().trim() : null);
        address.setCity(request.getCity().trim());
        address.setState(request.getState().trim());
        address.setPostalCode(request.getPostalCode().trim());
        address.setCountry(request.getCountry().trim());

        // Geocode coordinates automatically
        GeocodingService.Coordinates coords = geocodingService.geocode(
                request.getAddressLine1(),
                request.getCity(),
                request.getState(),
                request.getPostalCode(),
                request.getCountry()
        );
        if (coords != null) {
            address.setLatitude(coords.getLatitude());
            address.setLongitude(coords.getLongitude());
        }

        // If this is the first address, automatically make it default.
        List<Address> existingAddresses = addressRepository.findByCustomer(customer);

        boolean makeDefault = request.isDefaultAddress() || existingAddresses.isEmpty();

        if (makeDefault) {
            clearDefaultAddresses(customer);
        }

        address.setDefaultAddress(makeDefault);

        Address savedAddress = addressRepository.save(address);

        return convertToResponse(savedAddress);
    }

    // ==========================================
    // GET ALL ADDRESSES
    // ==========================================

    public List<AddressResponse> getAllAddresses(String email) {

        User customer = getCustomerByEmail(email);

        return addressRepository
                .findByCustomer(customer)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // ==========================================
    // GET ADDRESS BY ID
    // ==========================================

    public AddressResponse getAddressById(
            String email,
            Long addressId) {

        User customer = getCustomerByEmail(email);

        Address address = addressRepository
                .findByIdAndCustomer(addressId, customer)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Address not found"));

        return convertToResponse(address);
    }

    // ==========================================
    // UPDATE ADDRESS
    // ==========================================

    @Transactional
    public AddressResponse updateAddress(
            String email,
            Long addressId,
            AddressRequest request) {

        validateAddressBusinessRules(request);

        User customer = getCustomerByEmail(email);

        Address address = addressRepository
                .findByIdAndCustomer(addressId, customer)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Address not found"));

        address.setAddressType(request.getAddressType());
        address.setContactName(request.getContactName().trim());
        address.setPhone(request.getPhone().trim());
        address.setAddressLine1(request.getAddressLine1().trim());
        address.setAddressLine2(request.getAddressLine2() != null && !request.getAddressLine2().trim().isEmpty() ? request.getAddressLine2().trim() : null);
        address.setCity(request.getCity().trim());
        address.setState(request.getState().trim());
        address.setPostalCode(request.getPostalCode().trim());
        address.setCountry(request.getCountry().trim());

        // Update geocoded coordinates
        GeocodingService.Coordinates coords = geocodingService.geocode(
                request.getAddressLine1(),
                request.getCity(),
                request.getState(),
                request.getPostalCode(),
                request.getCountry()
        );
        if (coords != null) {
            address.setLatitude(coords.getLatitude());
            address.setLongitude(coords.getLongitude());
        }

        // If this address is being made default, remove default status from other addresses.
        if (request.isDefaultAddress()) {
            clearDefaultAddresses(customer);
            address.setDefaultAddress(true);
        } else {
            address.setDefaultAddress(false);
        }

        Address updatedAddress = addressRepository.save(address);

        return convertToResponse(updatedAddress);
    }

    // ==========================================
    // DELETE ADDRESS
    // ==========================================

    @Transactional
    public void deleteAddress(
            String email,
            Long addressId) {

        User customer = getCustomerByEmail(email);

        Address address = addressRepository
                .findByIdAndCustomer(addressId, customer)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Address not found"));

        // Check if address is linked to existing orders (as pickup or delivery location)
        if (orderRepository.existsByPickupAddress(address) || orderRepository.existsByDeliveryAddress(address)) {
            throw new AddressInUseException(
                    "This address is linked to an existing order and cannot be deleted."
            );
        }

        boolean wasDefault = address.isDefaultAddress();

        addressRepository.delete(address);

        if (wasDefault) {
            List<Address> remainingAddresses = addressRepository.findByCustomer(customer);
            if (!remainingAddresses.isEmpty()) {
                Address newDefault = remainingAddresses.get(0);
                newDefault.setDefaultAddress(true);
                addressRepository.save(newDefault);
            }
        }
    }

    // ==========================================
    // CLEAR EXISTING DEFAULT ADDRESSES
    // ==========================================

    private void clearDefaultAddresses(User customer) {

        List<Address> addresses = addressRepository.findByCustomer(customer);

        for (Address address : addresses) {
            if (address.isDefaultAddress()) {
                address.setDefaultAddress(false);
                addressRepository.save(address);
            }
        }
    }

    // ==========================================
    // FIND CUSTOMER
    // ==========================================

    private User getCustomerByEmail(String email) {

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Customer not found"));
    }

    // ==========================================
    // ENTITY -> RESPONSE DTO
    // ==========================================

    private AddressResponse convertToResponse(Address address) {

        AddressResponse response = new AddressResponse();

        response.setId(address.getId());
        response.setAddressType(address.getAddressType());
        response.setContactName(address.getContactName());
        response.setPhone(address.getPhone());
        response.setAddressLine1(address.getAddressLine1());
        response.setAddressLine2(address.getAddressLine2());
        response.setCity(address.getCity());
        response.setState(address.getState());
        response.setPostalCode(address.getPostalCode());
        response.setCountry(address.getCountry());
        response.setDefaultAddress(address.isDefaultAddress());
        response.setLatitude(address.getLatitude());
        response.setLongitude(address.getLongitude());

        return response;
    }
}
`;

const reqPath = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics/dto/AddressRequest.java';
const svcPath = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics/service/AddressService.java';

fs.writeFileSync(reqPath, addressRequestCode, 'utf8');
fs.writeFileSync(svcPath, addressServiceCode, 'utf8');
console.log('Updated AddressRequest.java and AddressService.java successfully.');
