const fs = require('fs');
const path = require('path');

const BACKEND_BASE = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

// 1. AdminSystemPreferencesDTO.java
const prefDTO = `package com.primeroute.logistics.dto;

public class AdminSystemPreferencesDTO {
    private String defaultCurrency;
    private String defaultDeliveryType;
    private String dateFormat;
    private String timeFormat;
    private String timeZone;

    public AdminSystemPreferencesDTO() {}

    public String getDefaultCurrency() { return defaultCurrency; }
    public void setDefaultCurrency(String defaultCurrency) { this.defaultCurrency = defaultCurrency; }

    public String getDefaultDeliveryType() { return defaultDeliveryType; }
    public void setDefaultDeliveryType(String defaultDeliveryType) { this.defaultDeliveryType = defaultDeliveryType; }

    public String getDateFormat() { return dateFormat; }
    public void setDateFormat(String dateFormat) { this.dateFormat = dateFormat; }

    public String getTimeFormat() { return timeFormat; }
    public void setTimeFormat(String timeFormat) { this.timeFormat = timeFormat; }

    public String getTimeZone() { return timeZone; }
    public void setTimeZone(String timeZone) { this.timeZone = timeZone; }
}
`;
fs.writeFileSync(path.join(BACKEND_BASE, 'dto', 'AdminSystemPreferencesDTO.java'), prefDTO, 'utf8');

// 2. Update AdminSettingsService.java to include timeFormat
const servicePath = path.join(BACKEND_BASE, 'service', 'AdminSettingsService.java');
let serviceCode = fs.readFileSync(servicePath, 'utf8');

if (!serviceCode.includes('pref_time_format')) {
  serviceCode = serviceCode.replace(
    'dto.setDateFormat(getSetting("pref_date_format", "DD/MM/YYYY"));',
    'dto.setDateFormat(getSetting("pref_date_format", "DD/MM/YYYY"));\n        dto.setTimeFormat(getSetting("pref_time_format", "12-hour (hh:mm A)"));'
  );

  serviceCode = serviceCode.replace(
    'saveSetting("pref_date_format", req.getDateFormat(), "SYSTEM");',
    'saveSetting("pref_date_format", req.getDateFormat(), "SYSTEM");\n        saveSetting("pref_time_format", req.getTimeFormat(), "SYSTEM");'
  );

  fs.writeFileSync(servicePath, serviceCode, 'utf8');
  console.log('Updated AdminSettingsService with timeFormat');
} else {
  console.log('AdminSettingsService already has timeFormat');
}

console.log('Backend models updated.');
