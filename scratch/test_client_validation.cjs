// Test validation functions from src/utils/validation.ts
const INDIAN_PHONE_REGEX = /^(?:\+91[\-\s]?)?[6-9]\d{9}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+=\-\[\]{}|;:'",.<>\/?~`\\]).{8,}$/;
const NAME_REGEX = /^[a-zA-Z\s.'-]{2,100}$/;

function validateFullName(name, fieldLabel = 'Full Name') {
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
  if (/\d/.test(trimmed)) {
    return { isValid: false, error: `${fieldLabel} cannot contain numbers.` };
  }
  if (!NAME_REGEX.test(trimmed)) {
    return { isValid: false, error: `${fieldLabel} can only contain letters, spaces, dots, hyphens, and apostrophes.` };
  }
  if (!/[a-zA-Z]/.test(trimmed)) {
    return { isValid: false, error: `${fieldLabel} must contain at least one letter.` };
  }
  return { isValid: true, normalized: trimmed };
}

function validateEmail(email) {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Email address is required.' };
  }
  const trimmed = email.trim();
  if (!EMAIL_REGEX.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address (e.g. name@domain.com).' };
  }
  return { isValid: true, normalized: trimmed.toLowerCase() };
}

function validateIndianPhone(phone) {
  if (!phone || !phone.trim()) {
    return { isValid: false, error: 'Phone number is required.' };
  }
  const trimmed = phone.trim();
  const cleanDigits = trimmed.replace(/[\s\-\(\)]/g, '');
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
  const core10 = cleanDigits.replace(/^\+91/, '');
  return { isValid: true, normalized: `+91 ${core10}` };
}

function validatePassword(password) {
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
  if (!/[@$!%*?&#^()_+=\-\[\]{}|;:'",.<>\/?~`\\]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one special character (e.g. @, #, $, !).' };
  }
  return { isValid: true };
}

console.log('=== TESTING CLIENT VALIDATION UTILITIES ===\n');

// Names
const nameTestCases = [
  { val: 'J789', expectedValid: false },
  { val: '12345', expectedValid: false },
  { val: '@@@', expectedValid: false },
  { val: 'A', expectedValid: false },
  { val: 'Shruti Sahoo', expectedValid: true },
  { val: "O'Connor", expectedValid: true },
  { val: 'Jean-Luc Picard', expectedValid: true },
  { val: 'Dr. John Doe', expectedValid: true },
];

nameTestCases.forEach(({ val, expectedValid }) => {
  const res = validateFullName(val);
  const pass = res.isValid === expectedValid;
  console.log(`Name "${val}": ${pass ? '✅ PASS' : '❌ FAIL'} (isValid=${res.isValid}, error=${res.error || 'none'})`);
});

console.log('\n--- Emails ---');
const emailTestCases = [
  { val: 'shruti@gmail.com', expectedValid: true },
  { val: 'gudi.sahoo@gmail.com', expectedValid: true },
  { val: 'test.user123@gmail.com', expectedValid: true },
  { val: 'P%7@2.jk', expectedValid: false },
  { val: 'abc', expectedValid: false },
  { val: 'abc@', expectedValid: false },
  { val: 'abc@gmail', expectedValid: false },
  { val: '@gmail.com', expectedValid: false },
];

emailTestCases.forEach(({ val, expectedValid }) => {
  const res = validateEmail(val);
  const pass = res.isValid === expectedValid;
  console.log(`Email "${val}": ${pass ? '✅ PASS' : '❌ FAIL'} (isValid=${res.isValid}, error=${res.error || 'none'})`);
});

console.log('\n--- Phones ---');
const phoneTestCases = [
  { val: '9000000000', expectedValid: true },
  { val: '9876543210', expectedValid: true },
  { val: '+91 9876543210', expectedValid: true },
  { val: '1234567890', expectedValid: false },
  { val: '98765abcde', expectedValid: false },
  { val: '98765', expectedValid: false },
];

phoneTestCases.forEach(({ val, expectedValid }) => {
  const res = validateIndianPhone(val);
  const pass = res.isValid === expectedValid;
  console.log(`Phone "${val}": ${pass ? '✅ PASS' : '❌ FAIL'} (isValid=${res.isValid}, error=${res.error || 'none'})`);
});

console.log('\n--- Passwords ---');
const passTestCases = [
  { val: 'Prime@12345', expectedValid: true },
  { val: 'Logistics@2026', expectedValid: true },
  { val: 'PrimeRoute#45', expectedValid: true },
  { val: 'Ab1', expectedValid: false },
  { val: 'password', expectedValid: false },
  { val: 'Password', expectedValid: false },
  { val: 'Password123', expectedValid: false },
  { val: '12345678', expectedValid: false },
  { val: 'Ab1😂😂😂😂😂', expectedValid: false },
];

passTestCases.forEach(({ val, expectedValid }) => {
  const res = validatePassword(val);
  const pass = res.isValid === expectedValid;
  console.log(`Password "${val}": ${pass ? '✅ PASS' : '❌ FAIL'} (isValid=${res.isValid}, error=${res.error || 'none'})`);
});
