export const isValidEmail = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export const isValidOtp = (v: string) => /^\d{6}$/.test(v.trim());

export const validatePassword = (v: string): string | null => {
  if (v.length < 8) return 'Password must be at least 8 characters.';
  return null;
};
