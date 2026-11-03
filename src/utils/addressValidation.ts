/**
 * Centralized Address Validation Rules for PrimeRoute Customer & Operations Addresses
 */

export const INDIAN_STATES: string[] = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

export const CONTACT_PERSON_REGEX = /^(?=.*[a-zA-Z])[a-zA-Z\s.'-]{2,100}$/;
export const PHONE_REGEX = /^(?:\+91[\s-]?)?[6-9](?:[\s-]?\d){9}$/;
export const STREET_REGEX = /^(?=.*[a-zA-Z])[a-zA-Z0-9\s,.\-/#/()']{5,250}$/;
export const LANDMARK_REGEX = /^[a-zA-Z0-9\s,.\-/#/()']{1,150}$/;
export const CITY_REGEX = /^(?=.*[a-zA-Z])[a-zA-Z\s.'-]{2,100}$/;
export const POSTAL_CODE_REGEX = /^[1-9][0-9]{5}$/;

export interface AddressFormErrors {
  contactName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  addressType?: string;
}

export function validateContactPerson(val?: string | null): string | undefined {
  if (!val || !val.trim()) return 'Enter a valid contact name.';
  const trimmed = val.trim();
  if (trimmed.length < 2 || trimmed.length > 100) return 'Contact name must be between 2 and 100 characters.';
  if (!CONTACT_PERSON_REGEX.test(trimmed)) return 'Enter a valid contact name.';
  return undefined;
}

export function validateContactPhone(val?: string | null): string | undefined {
  if (!val || !val.trim()) return 'Enter a valid phone number.';
  const trimmed = val.trim();
  if (!PHONE_REGEX.test(trimmed)) return 'Enter a valid 10-digit Indian mobile number (e.g. 9876543210).';
  return undefined;
}

export function validateStreetAddress(val?: string | null): string | undefined {
  if (!val || !val.trim()) return 'Enter a valid street / building address.';
  const trimmed = val.trim();
  if (trimmed.length < 5 || trimmed.length > 250) return 'Street address must be between 5 and 250 characters.';
  if (!STREET_REGEX.test(trimmed)) return 'Enter a valid street / building address.';
  // Check for long continuous gibberish without spaces
  if (trimmed.length > 20 && !trimmed.includes(' ') && !trimmed.includes(',') && !trimmed.includes('-') && !trimmed.includes('/')) {
    return 'Enter a valid street / building address with recognizable location details.';
  }
  return undefined;
}

export function validateLandmark(val?: string | null): string | undefined {
  if (!val || !val.trim()) return undefined; // optional
  const trimmed = val.trim();
  if (trimmed.length > 150) return 'Apartment / landmark cannot exceed 150 characters.';
  if (!LANDMARK_REGEX.test(trimmed)) return 'Enter a valid landmark or apartment details.';
  return undefined;
}

export function validateCity(val?: string | null): string | undefined {
  if (!val || !val.trim()) return 'Enter a valid city name.';
  const trimmed = val.trim();
  if (trimmed.length < 2 || trimmed.length > 100) return 'City name must be between 2 and 100 characters.';
  if (!CITY_REGEX.test(trimmed)) return 'Enter a valid city name.';
  return undefined;
}

export function validateState(val?: string | null): string | undefined {
  if (!val || !val.trim()) return 'Select a valid state.';
  const trimmed = val.trim();
  const matched = INDIAN_STATES.find((s) => s.toLowerCase() === trimmed.toLowerCase());
  if (!matched) return 'Select a valid state from the list.';
  return undefined;
}

export function validatePostalCode(val?: string | null): string | undefined {
  if (!val || !val.trim()) return 'Postal code is required.';
  const trimmed = val.trim();
  if (!POSTAL_CODE_REGEX.test(trimmed)) return 'Postal code must be a valid 6-digit PIN code starting with digits 1-9.';
  return undefined;
}

export function validateCountry(val?: string | null): string | undefined {
  if (!val || !val.trim()) return 'Country is required.';
  const trimmed = val.trim();
  if (trimmed.toLowerCase() !== 'india') return 'Currently only India addresses are supported.';
  return undefined;
}

export function validateAddressData(data: {
  contactName?: string | null;
  phone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
}): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const cErr = validateContactPerson(data.contactName);
  if (cErr) errors.contactName = cErr;
  const pErr = validateContactPhone(data.phone);
  if (pErr) errors.phone = pErr;
  const a1Err = validateStreetAddress(data.addressLine1);
  if (a1Err) errors.addressLine1 = a1Err;
  const a2Err = validateLandmark(data.addressLine2);
  if (a2Err) errors.addressLine2 = a2Err;
  const cityErr = validateCity(data.city);
  if (cityErr) errors.city = cityErr;
  const stateErr = validateState(data.state);
  if (stateErr) errors.state = stateErr;
  const pinErr = validatePostalCode(data.postalCode);
  if (pinErr) errors.postalCode = pinErr;
  const countryErr = validateCountry(data.country);
  if (countryErr) errors.country = countryErr;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
