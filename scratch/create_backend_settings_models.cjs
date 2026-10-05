const fs = require('fs');
const path = require('path');

const BACKEND_BASE = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

// 1. Entity: SystemSetting.java
const systemSettingEntity = `package com.primeroute.logistics.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "system_settings")
public class SystemSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "setting_key", nullable = false, unique = true, length = 100)
    private String settingKey;

    @Column(name = "setting_value", columnDefinition = "TEXT")
    private String settingValue;

    @Column(length = 50)
    private String category; // NOTIFICATIONS, SYSTEM, COMPANY

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public SystemSetting() {
    }

    public SystemSetting(String settingKey, String settingValue, String category) {
        this.settingKey = settingKey;
        this.settingValue = settingValue;
        this.category = category;
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getSettingKey() {
        return settingKey;
    }

    public void setSettingKey(String settingKey) {
        this.settingKey = settingKey;
    }

    public String getSettingValue() {
        return settingValue;
    }

    public void setSettingValue(String settingValue) {
        this.settingValue = settingValue;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
`;

fs.writeFileSync(path.join(BACKEND_BASE, 'entity', 'SystemSetting.java'), systemSettingEntity, 'utf8');
console.log('Created SystemSetting.java');

// 2. Repository: SystemSettingRepository.java
const systemSettingRepo = `package com.primeroute.logistics.repository;

import com.primeroute.logistics.entity.SystemSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SystemSettingRepository extends JpaRepository<SystemSetting, Long> {
    Optional<SystemSetting> findBySettingKey(String settingKey);
    List<SystemSetting> findByCategory(String category);
}
`;

fs.writeFileSync(path.join(BACKEND_BASE, 'repository', 'SystemSettingRepository.java'), systemSettingRepo, 'utf8');
console.log('Created SystemSettingRepository.java');

// 3. DTOs
const adminProfileDTO = `package com.primeroute.logistics.dto;

import java.time.LocalDateTime;

public class AdminProfileDTO {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String role;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime lastPasswordChange;
    private Boolean twoFactorEnabled;

    public AdminProfileDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getLastPasswordChange() { return lastPasswordChange; }
    public void setLastPasswordChange(LocalDateTime lastPasswordChange) { this.lastPasswordChange = lastPasswordChange; }

    public Boolean getTwoFactorEnabled() { return twoFactorEnabled; }
    public void setTwoFactorEnabled(Boolean twoFactorEnabled) { this.twoFactorEnabled = twoFactorEnabled; }
}
`;
fs.writeFileSync(path.join(BACKEND_BASE, 'dto', 'AdminProfileDTO.java'), adminProfileDTO, 'utf8');

const adminProfileUpdateRequest = `package com.primeroute.logistics.dto;

import jakarta.validation.constraints.NotBlank;

public class AdminProfileUpdateRequest {
    @NotBlank(message = "Full name is required")
    private String fullName;
    private String phone;

    public AdminProfileUpdateRequest() {}

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}
`;
fs.writeFileSync(path.join(BACKEND_BASE, 'dto', 'AdminProfileUpdateRequest.java'), adminProfileUpdateRequest, 'utf8');

const adminSecurityChangePasswordRequest = `package com.primeroute.logistics.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AdminSecurityChangePasswordRequest {
    @NotBlank(message = "Current password is required")
    private String currentPassword;

    @NotBlank(message = "New password is required")
    @Size(min = 6, message = "New password must be at least 6 characters")
    private String newPassword;

    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;

    public AdminSecurityChangePasswordRequest() {}

    public String getCurrentPassword() { return currentPassword; }
    public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }

    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }

    public String getConfirmPassword() { return confirmPassword; }
    public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }
}
`;
fs.writeFileSync(path.join(BACKEND_BASE, 'dto', 'AdminSecurityChangePasswordRequest.java'), adminSecurityChangePasswordRequest, 'utf8');

const adminNotificationSettingsDTO = `package com.primeroute.logistics.dto;

public class AdminNotificationSettingsDTO {
    private boolean emailNotifications = true;
    private boolean orderUpdates = true;
    private boolean shipmentUpdates = true;
    private boolean deliveryUpdates = true;
    private boolean invoiceNotifications = true;
    private boolean supportTicketNotifications = true;

    public AdminNotificationSettingsDTO() {}

    public boolean isEmailNotifications() { return emailNotifications; }
    public void setEmailNotifications(boolean emailNotifications) { this.emailNotifications = emailNotifications; }

    public boolean isOrderUpdates() { return orderUpdates; }
    public void setOrderUpdates(boolean orderUpdates) { this.orderUpdates = orderUpdates; }

    public boolean isShipmentUpdates() { return shipmentUpdates; }
    public void setShipmentUpdates(boolean shipmentUpdates) { this.shipmentUpdates = shipmentUpdates; }

    public boolean isDeliveryUpdates() { return deliveryUpdates; }
    public void setDeliveryUpdates(boolean deliveryUpdates) { this.deliveryUpdates = deliveryUpdates; }

    public boolean isInvoiceNotifications() { return invoiceNotifications; }
    public void setInvoiceNotifications(boolean invoiceNotifications) { this.invoiceNotifications = invoiceNotifications; }

    public boolean isSupportTicketNotifications() { return supportTicketNotifications; }
    public void setSupportTicketNotifications(boolean supportTicketNotifications) { this.supportTicketNotifications = supportTicketNotifications; }
}
`;
fs.writeFileSync(path.join(BACKEND_BASE, 'dto', 'AdminNotificationSettingsDTO.java'), adminNotificationSettingsDTO, 'utf8');

const adminCompanySettingsDTO = `package com.primeroute.logistics.dto;

public class AdminCompanySettingsDTO {
    private String companyName;
    private String tagline;
    private String gstin;
    private String corporateEmail;
    private String corporatePhone;
    private String website;
    private String address;
    private String city;
    private String state;
    private String postalCode;
    private String country;

    public AdminCompanySettingsDTO() {}

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getTagline() { return tagline; }
    public void setTagline(String tagline) { this.tagline = tagline; }

    public String getGstin() { return gstin; }
    public void setGstin(String gstin) { this.gstin = gstin; }

    public String getCorporateEmail() { return corporateEmail; }
    public void setCorporateEmail(String corporateEmail) { this.corporateEmail = corporateEmail; }

    public String getCorporatePhone() { return corporatePhone; }
    public void setCorporatePhone(String corporatePhone) { this.corporatePhone = corporatePhone; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
}
`;
fs.writeFileSync(path.join(BACKEND_BASE, 'dto', 'AdminCompanySettingsDTO.java'), adminCompanySettingsDTO, 'utf8');

const adminSupportSettingsDTO = `package com.primeroute.logistics.dto;

import jakarta.validation.constraints.NotBlank;

public class AdminSupportSettingsDTO {
    @NotBlank(message = "Support email is required")
    private String supportEmail;

    @NotBlank(message = "Support phone is required")
    private String supportPhone;

    @NotBlank(message = "Availability hours are required")
    private String availability;

    private String description;

    public AdminSupportSettingsDTO() {}

    public AdminSupportSettingsDTO(String supportEmail, String supportPhone, String availability, String description) {
        this.supportEmail = supportEmail;
        this.supportPhone = supportPhone;
        this.availability = availability;
        this.description = description;
    }

    public String getSupportEmail() { return supportEmail; }
    public void setSupportEmail(String supportEmail) { this.supportEmail = supportEmail; }

    public String getSupportPhone() { return supportPhone; }
    public void setSupportPhone(String supportPhone) { this.supportPhone = supportPhone; }

    public String getAvailability() { return availability; }
    public void setAvailability(String availability) { this.availability = availability; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
`;
fs.writeFileSync(path.join(BACKEND_BASE, 'dto', 'AdminSupportSettingsDTO.java'), adminSupportSettingsDTO, 'utf8');

const adminSystemPreferencesDTO = `package com.primeroute.logistics.dto;

public class AdminSystemPreferencesDTO {
    private String defaultCurrency;
    private String defaultDeliveryType;
    private String dateFormat;
    private String timeZone;

    public AdminSystemPreferencesDTO() {}

    public String getDefaultCurrency() { return defaultCurrency; }
    public void setDefaultCurrency(String defaultCurrency) { this.defaultCurrency = defaultCurrency; }

    public String getDefaultDeliveryType() { return defaultDeliveryType; }
    public void setDefaultDeliveryType(String defaultDeliveryType) { this.defaultDeliveryType = defaultDeliveryType; }

    public String getDateFormat() { return dateFormat; }
    public void setDateFormat(String dateFormat) { this.dateFormat = dateFormat; }

    public String getTimeZone() { return timeZone; }
    public void setTimeZone(String timeZone) { this.timeZone = timeZone; }
}
`;
fs.writeFileSync(path.join(BACKEND_BASE, 'dto', 'AdminSystemPreferencesDTO.java'), adminSystemPreferencesDTO, 'utf8');

console.log('Created all DTOs');
