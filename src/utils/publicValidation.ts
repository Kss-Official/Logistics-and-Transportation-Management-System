/**
 * Validation rules for Public Freight Inquiries & Quotation requests.
 * Matches backend validation rules strictly.
 */

// 1. Company Name: 2-100 chars, at least one alphanumeric, allows business punctuation (& . , - ' / ())
export const COMPANY_NAME_REGEX = /^(?=.*[a-zA-Z0-9])[a-zA-Z0-9\s&.,\-'/()]{2,100}$/;

// 2. Contact Name: 2-100 chars, contains alphabetic chars, allows spaces, apostrophes, hyphens, dots
export const CONTACT_NAME_REGEX = /^(?=.*[a-zA-Z])[a-zA-Z\s.'-]{2,100}$/;

// 3. Email: Standard RFC-compliant business email format (rejects !#$%@jk, #$%%@L.9b, abc@, etc.)
export const EMAIL_REGEX = /^[a-zA-Z0-9_+&*-]+(?:\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,7}$/;

// 4. Phone: Indian 10 digits starting with 6,7,8,9 with optional +91 prefix and optional spacing/hyphens
export const PHONE_REGEX = /^(?:\+91[\s-]?)?[6-9](?:[\s-]?\d){9}$/;

// 5. Origin / Destination: 2-100 chars, at least one alphanumeric char, allows standard punctuation
export const LOCATION_REGEX = /^(?=.*[a-zA-Z0-9])[a-zA-Z0-9\s.,\-'/()]{2,100}$/;

export interface PublicFormErrors {
  companyName?: string;
  contactName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  origin?: string;
  destination?: string;
  serviceType?: string;
  weight?: string;
  message?: string;
}

export function validateCompanyName(val: string): string | undefined {
  const trimmed = val ? val.trim() : '';
  if (!trimmed) return 'Enter a valid company name.';
  if (trimmed.length < 2 || trimmed.length > 100) return 'Company name must be between 2 and 100 characters.';
  if (!COMPANY_NAME_REGEX.test(trimmed)) return 'Enter a valid company name.';
  return undefined;
}

export function validateContactName(val: string): string | undefined {
  const trimmed = val ? val.trim() : '';
  if (!trimmed) return 'Enter a valid contact name.';
  if (trimmed.length < 2 || trimmed.length > 100) return 'Contact name must be between 2 and 100 characters.';
  if (!CONTACT_NAME_REGEX.test(trimmed)) return 'Enter a valid contact name.';
  return undefined;
}

export function validateEmail(val: string): string | undefined {
  const trimmed = val ? val.trim() : '';
  if (!trimmed) return 'Enter a valid business email address.';
  if (trimmed.length > 120) return 'Email address must not exceed 120 characters.';
  if (!EMAIL_REGEX.test(trimmed)) return 'Enter a valid business email address.';
  return undefined;
}

export function validatePhone(val: string): string | undefined {
  const trimmed = val ? val.trim() : '';
  if (!trimmed) return 'Enter a valid phone number.';
  // Clean whitespace/hyphens for checking
  if (!PHONE_REGEX.test(trimmed)) return 'Enter a valid 10-digit mobile number (e.g. 9876543210).';
  return undefined;
}

export function validateOrigin(val: string): string | undefined {
  const trimmed = val ? val.trim() : '';
  if (!trimmed) return 'Enter a valid origin city or terminal.';
  if (trimmed.length < 2 || trimmed.length > 100) return 'Origin must be between 2 and 100 characters.';
  if (!LOCATION_REGEX.test(trimmed)) return 'Enter a valid origin city or terminal.';
  return undefined;
}

export function validateDestination(val: string): string | undefined {
  const trimmed = val ? val.trim() : '';
  if (!trimmed) return 'Enter a valid destination city or hub.';
  if (trimmed.length < 2 || trimmed.length > 100) return 'Destination must be between 2 and 100 characters.';
  if (!LOCATION_REGEX.test(trimmed)) return 'Enter a valid destination city or hub.';
  return undefined;
}

export function validateWeight(val: string | number | undefined, required = false): string | undefined {
  if (val === undefined || val === null || val === '') {
    if (required) return 'Enter a valid cargo weight greater than 0.';
    return undefined;
  }
  const cleanStr = String(val).replace(/,/g, '').replace(/kg/i, '').trim();
  const num = parseFloat(cleanStr);
  if (isNaN(num) || !isFinite(num) || num <= 0) {
    return 'Enter a valid cargo weight greater than 0.';
  }
  if (num > 100000) {
    return 'Cargo weight exceeds maximum allowed capacity (100,000 kg).';
  }
  return undefined;
}

export function validateMessage(val: string): string | undefined {
  const trimmed = val ? val.trim() : '';
  if (!trimmed) return undefined;
  if (trimmed.length > 1000) return 'Additional specifications must not exceed 1000 characters.';
  if (trimmed.length >= 3 && !/[a-zA-Z0-9]/.test(trimmed)) {
    return 'Additional specifications must contain meaningful text, not only symbols.';
  }
  return undefined;
}
