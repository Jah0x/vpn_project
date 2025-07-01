import { ValidationUtils } from './helpers';

export const validateNickname = (nickname: string): boolean => {
  return /^[a-zA-Z0-9_]{3,50}$/.test(nickname);
};

export const validateEmail = (email: string): boolean => {
  return ValidationUtils.isValidEmail(email);
};

export const validatePassword = (password: string) => {
  return ValidationUtils.validatePassword(password);
};
