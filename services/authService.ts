// Mock auth service — swap fetch() calls for real API endpoints when ready

const MOCK_OTP = '123456';
const MOCK_DELAY = 1200;

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function sendOtp(email: string): Promise<void> {
  await delay(MOCK_DELAY);
  // Real: await fetch('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) })
  if (!email) throw new Error('Email is required.');
}

export async function verifyOtp(email: string, otp: string): Promise<void> {
  await delay(MOCK_DELAY);
  // Real: await fetch('/api/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) })
  if (otp !== MOCK_OTP) throw new Error('Invalid or expired OTP. Please try again.');
}

export async function resetPassword(email: string, otp: string, newPassword: string): Promise<void> {
  await delay(MOCK_DELAY);
  // Real: await fetch('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ email, otp, newPassword }) })
  if (!newPassword) throw new Error('Password is required.');
}
