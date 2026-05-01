export type ActionType = 'login' | 'password_reset' | 'security_action';

export interface OtpResponse {
  success: boolean;
  message: string;
}

const API_BASE_URL = 'http://localhost:3000/api/otp';

export const otpService = {
  async requestOtp(email: string, actionType: ActionType): Promise<OtpResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, actionType }),
      });
      return await response.json();
    } catch (error) {
      console.error('Request OTP Error:', error);
      return { success: false, message: 'Network error occurred.' };
    }
  },

  async verifyOtp(email: string, otp: string, actionType: ActionType): Promise<OtpResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, actionType }),
      });
      return await response.json();
    } catch (error) {
      console.error('Verify OTP Error:', error);
      return { success: false, message: 'Network error occurred.' };
    }
  },

  async resendOtp(email: string, actionType: ActionType): Promise<OtpResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, actionType }),
      });
      return await response.json();
    } catch (error) {
      console.error('Resend OTP Error:', error);
      return { success: false, message: 'Network error occurred.' };
    }
  }
};
