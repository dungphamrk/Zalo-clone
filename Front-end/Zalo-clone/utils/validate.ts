/**
 * Validation utilities
 * Functions for validating user input (email, phone, password, etc.)
 */

/**
 * Validate Vietnamese phone number
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validate email
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * - At least 8 characters
 * - At least one letter
 * - At least one number
 */
export const validatePassword = (password: string): boolean => {
  if (password.length < 8) {
    return false;
  }
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasLetter && hasNumber;
};

/**
 * Validate password and return detailed error message
 */
export const validatePasswordWithMessage = (password: string): { valid: boolean; message: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Mật khẩu phải có ít nhất 8 ký tự' };
  }
  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, message: 'Mật khẩu phải có ít nhất một chữ cái' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Mật khẩu phải có ít nhất một số' };
  }
  return { valid: true, message: '' };
};

/**
 * Validate Vietnamese name (allow Vietnamese characters)
 */
export const validateName = (name: string): boolean => {
  const nameRegex = /^[a-zA-ZÀ-ỹ\s]+$/;
  return name.trim().length >= 2 && nameRegex.test(name);
};

/**
 * Check if string is empty or only whitespace
 */
export const isEmpty = (value: string | null | undefined): boolean => {
  return !value || value.trim().length === 0;
};

/**
 * Validate URL
 */
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate OTP (6 digits)
 */
export const validateOTP = (otp: string): boolean => {
  const otpRegex = /^\d{6}$/;
  return otpRegex.test(otp);
};

