/**
 * Centralized Business Validation Rules & Utilities for PrimeRoute Logistics
 * Standardized across both Customer Portal and Admin Portal
 */

// ── REGEX PATTERNS ───────────────────────────────────────────────────────────
export const INDIAN_PHONE_REGEX = /^(?:\+91[\-\s]?)?[6-9]\d{9}$/;
export const PINCODE_REGEX = /^\d{6}$/;
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
export const NAME_REGEX = /^(?!\d+$)[a-zA-Z0-9\s.'\-]{2,100}$/;
export const VEHICLE_NUMBER_REGEX = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}$|^[A-Z]{2}[ -]?[0-9]{2}[ -]?[A-Z]{1,2}[ -]?[0-9]{4}$/i;

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  normalized?: string;
}

/**
 * Validates Indian mobile numbers:
 * - Exactly 10 digits in the core mobile portion
 * - Must start with 6, 7, 8, or 9
 * - Allows optional '+91 ' or '+91-' prefix
 * - Normalizes to standard 10-digit or '+91 XXXXXXXXXX' format
 */
export function validateIndianPhone(phone?: string | null): ValidationResult {
  if (!phone || !phone.trim()) {
    return { isValid: false, error: 'Phone number is required.' };
  }

  const trimmed = phone.trim();

  // Strip common separators to count actual digits
  const cleanDigits = trimmed.replace(/[\s\-\(\)]/g, '');

  // Check with or without +91 prefix
  if (!INDIAN_PHONE_REGEX.test(trimmed)) {
    if (/[a-zA-Z]/.test(trimmed)) {
      return { isValid: false, error: 'Phone number cannot contain alphabetic letters.' };
    }
    const digitsOnly = cleanDigits.replace(/^\+91/, '');
    if (digitsOnly.length < 10) {
      return { isValid: false, error: 'Phone number is too short. Indian mobile numbers require 10 digits.' };
    }
    if (digitsOnly.length > 10) {
      return { isValid: false, error: 'Phone number is too long. Indian mobile numbers require exactly 10 digits.' };
    }
    if (digitsOnly.length === 10 && !/^[6-9]/.test(digitsOnly)) {
      return { isValid: false, error: 'Indian mobile numbers must start with digit 6, 7, 8, or 9.' };
    }
    return { isValid: false, error: 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210 or +91 9876543210).' };
  }

  // Extract core 10 digits
  const core10 = cleanDigits.replace(/^\+91/, '');
  const normalized = `+91 ${core10}`;

  return { isValid: true, normalized };
}

/**
 * Normalizes Indian mobile number to standardized '+91 XXXXXXXXXX' format
 */
export function formatIndianPhone(phone?: string | null): string {
  if (!phone) return '';
  const clean = phone.trim().replace(/[\s\-\(\)]/g, '').replace(/^\+91/, '');
  return clean.length === 10 ? `+91 ${clean}` : phone.trim();
}

/**
 * Validates Indian postal codes (Pincode):
 * - Exactly 6 numeric digits
 */
export function validatePincode(pincode?: string | null): ValidationResult {
  if (!pincode || !pincode.trim()) {
    return { isValid: false, error: 'Pincode is required.' };
  }

  const trimmed = pincode.trim();

  if (!PINCODE_REGEX.test(trimmed)) {
    if (/[a-zA-Z]/.test(trimmed)) {
      return { isValid: false, error: 'Pincode cannot contain letters. It must contain only numbers.' };
    }
    if (trimmed.length !== 6) {
      return { isValid: false, error: `Pincode must contain exactly 6 digits (received ${trimmed.length}).` };
    }
    return { isValid: false, error: 'Please enter a valid 6-digit Indian pincode (e.g. 751024).' };
  }

  return { isValid: true, normalized: trimmed };
}

/**
 * Validates email addresses
 */
export function validateEmail(email?: string | null): ValidationResult {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Email address is required.' };
  }

  const trimmed = email.trim();

  if (!EMAIL_REGEX.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address (e.g. name@domain.com).' };
  }

  return { isValid: true, normalized: trimmed.toLowerCase() };
}

/**
 * Validates passwords:
 * - Min 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 */
export function validatePassword(password?: string | null): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password is required.' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long.' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter (A-Z).' };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter (a-z).' };
  }

  if (!/\d/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number (0-9).' };
  }

  return { isValid: true };
}

/**
 * Validates full names for customer, driver, contact person:
 * - 2 to 100 characters
 * - Rejects purely numeric inputs
 * - Rejects blank or whitespace-only inputs
 */
export function validateFullName(name?: string | null, fieldLabel = 'Full Name'): ValidationResult {
  if (!name || !name.trim()) {
    return { isValid: false, error: `${fieldLabel} is required.` };
  }

  const trimmed = name.trim();

  if (trimmed.length < 2) {
    return { isValid: false, error: `${fieldLabel} must be at least 2 characters long.` };
  }

  if (trimmed.length > 100) {
    return { isValid: false, error: `${fieldLabel} cannot exceed 100 characters.` };
  }

  if (/^\d+$/.test(trimmed)) {
    return { isValid: false, error: `${fieldLabel} cannot be purely numeric.` };
  }

  if (!NAME_REGEX.test(trimmed)) {
    return { isValid: false, error: `${fieldLabel} contains invalid characters.` };
  }

  return { isValid: true, normalized: trimmed };
}

/**
 * Validates required text inputs to prevent blank or whitespace-only strings
 */
export function validateRequired(value?: string | null, fieldLabel = 'This field'): ValidationResult {
  if (!value || !value.trim()) {
    return { isValid: false, error: `${fieldLabel} is required.` };
  }
  return { isValid: true, normalized: value.trim() };
}

/**
 * Validates strictly positive numbers (weight, quantity, capacity, distance)
 */
export function validatePositiveNumber(
  value: number | string | undefined | null,
  fieldLabel: string,
  minVal = 0.01
): ValidationResult {
  if (value === undefined || value === null || value === '') {
    return { isValid: false, error: `${fieldLabel} is required.` };
  }

  const num = typeof value === 'number' ? value : parseFloat(String(value));

  if (isNaN(num)) {
    return { isValid: false, error: `${fieldLabel} must be a valid numeric value.` };
  }

  if (num < minVal) {
    return { isValid: false, error: `${fieldLabel} must be greater than ${minVal <= 1 && minVal > 0 ? '0' : minVal - 1}.` };
  }

  return { isValid: true };
}

/**
 * Validates dates (e.g. License expiry, expected delivery)
 */
export function validateFutureOrPresentDate(
  dateStr?: string | null,
  fieldLabel = 'Date',
  requireFuture = false
): ValidationResult {
  if (!dateStr || !dateStr.trim()) {
    return { isValid: false, error: `${fieldLabel} is required.` };
  }

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return { isValid: false, error: `${fieldLabel} must be a valid date.` };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (requireFuture && date < today) {
    return { isValid: false, error: `${fieldLabel} cannot be in the past.` };
  }

  return { isValid: true, normalized: dateStr.trim() };
}
