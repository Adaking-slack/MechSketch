import { createAndStoreOtp, sendOtpEmail, verifyOtp } from '../services/otpService.js';

export const requestOtp = async (req, res) => {
  const { email, actionType } = req.body;

  if (!email || !actionType) {
    return res.status(400).json({ success: false, message: 'Email and actionType are required.' });
  }

  try {
    const rawOtp = await createAndStoreOtp(email, actionType);
    await sendOtpEmail(email, rawOtp, actionType);

    res.status(200).json({ success: true, message: 'OTP sent successfully.' });
  } catch (err) {
    console.error('Error requesting OTP:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export const verifyOtpCode = async (req, res) => {
  const { email, otp, actionType } = req.body;

  if (!email || !otp || !actionType) {
    return res.status(400).json({ success: false, message: 'Email, otp, and actionType are required.' });
  }

  try {
    const result = await verifyOtp(email, otp, actionType);
    if (!result.success) {
      return res.status(401).json(result);
    }

    res.status(200).json(result);
  } catch (err) {
    console.error('Error verifying OTP:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export const resendOtp = async (req, res) => {
  const { email, actionType } = req.body;

  if (!email || !actionType) {
    return res.status(400).json({ success: false, message: 'Email and actionType are required.' });
  }

  // Technically, resend is identical to generating a new one which invalidates the old automatically 
  // since otpStore.set() overwrites the existing record for that email!
  try {
    const rawOtp = await createAndStoreOtp(email, actionType);
    await sendOtpEmail(email, rawOtp, actionType);

    res.status(200).json({ success: true, message: 'OTP resent successfully.' });
  } catch (err) {
    console.error('Error resending OTP:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
