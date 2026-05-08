import { supabase } from '../lib/supabase';

export type ActionType = 'login' | 'password_reset' | 'security_action' | 'signup';

export interface OtpResponse {
  success: boolean;
  message: string;
}

export const otpService = {
  async requestOtp(email: string, actionType: ActionType): Promise<OtpResponse> {
    // For signup, the initial signUp call already sends the OTP.
    if (actionType === 'signup') {
      return { success: true, message: 'OTP already sent.' };
    }
    return this.resendOtp(email, actionType);
  },

  async verifyOtp(email: string, otp: string, actionType: ActionType): Promise<OtpResponse> {
    try {
      const type = actionType === 'signup' ? 'signup' : 'email';
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: type as any,
      });
      if (error) throw error;
      return { success: true, message: 'Verified successfully' };
    } catch (error: any) {
      console.error('Verify OTP Error:', error);
      return { success: false, message: error.message || 'Verification failed.' };
    }
  },

  async resendOtp(email: string, actionType: ActionType): Promise<OtpResponse> {
    try {
      const type = actionType === 'signup' ? 'signup' : 'magiclink';
      const { error } = await supabase.auth.resend({
        type: type as any,
        email,
      });
      if (error) throw error;
      return { success: true, message: 'OTP sent successfully' };
    } catch (error: any) {
      console.error('Resend OTP Error:', error);
      return { success: false, message: error.message || 'Failed to resend.' };
    }
  }
};
