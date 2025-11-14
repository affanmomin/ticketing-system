/**
 * Validation utility functions for form inputs
 */

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  if (!email.trim()) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates phone number (exactly 10 digits)
 */
export function isValidPhone(phone: string): boolean {
  if (!phone.trim()) return false;
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length === 10;
}

/**
 * Validates name (should not contain numbers)
 */
export function isValidName(name: string): boolean {
  if (!name.trim()) return false;
  // Name should not contain digits
  return !/\d/.test(name.trim());
}

/**
 * Gets email validation error message
 */
export function getEmailError(email: string): string | null {
  if (!email.trim()) {
    return "Email is required";
  }
  if (!isValidEmail(email)) {
    return "Please enter a valid email address";
  }
  return null;
}

/**
 * Gets phone validation error message
 */
export function getPhoneError(phone: string): string | null {
  if (!phone.trim()) {
    return null; // Phone is optional in most forms
  }
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length === 0) {
    return "Phone number must contain digits";
  }
  if (digitsOnly.length !== 10) {
    return "Phone number must be exactly 10 digits";
  }
  return null;
}

/**
 * Gets name validation error message
 */
export function getNameError(name: string, fieldName: string = "Name"): string | null {
  if (!name.trim()) {
    return `${fieldName} is required`;
  }
  if (/\d/.test(name.trim())) {
    return `${fieldName} should not contain numbers`;
  }
  return null;
}

