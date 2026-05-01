import bcrypt from 'bcrypt';
import otpStore from '../models/Otp.js';

const SALT_ROUNDS = 10;
const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;

/**
 * Generates a random 6 digit numeric code
 */
export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Creates, hashes, and stores the OTP in memory for the given email
 */
export const createAndStoreOtp = async (email, actionType) => {
  const otp = generateOtp();
  const hashedOtp = await bcrypt.hash(otp, SALT_ROUNDS);
  
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);

  otpStore.set(email, {
    hashedOtp,
    expiresAt,
    attempts: 0,
    actionType
  });

  return otp;
};

/**
 * Mocks tracking the email being sent. In production use Nodemailer/Sendgrid
 */
export const sendOtpEmail = async (email, otp, actionType) => {
  console.log(`\n================================`);
  console.log(`✉️ MOCK EMAIL SENT:`);
  console.log(`To: ${email}`);
  console.log(`Action: ${actionType}`);
  console.log(`Your OTP Code is: ${otp}`);
  console.log(`================================\n`);
  
  // Real implementation:
  // await transporter.sendMail({ to: email, subject: 'Your Code', text: `Code: ${otp}` });
};

/**
 * Verifies the submitted OTP against the stored hash
 * Validates expiration and limits max attempts
 */
export const verifyOtp = async (email, submittedOtp, actionType) => {
  const record = otpStore.get(email);

  if (!record) {
    return { success: false, message: "No OTP request found for this email." };
  }

  // Check action type match
  if (record.actionType !== actionType) {
    return { success: false, message: "Invalid action context." };
  }

  // Check attempts
  if (record.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(email); // Invalidate block
    return { success: false, message: "Too many failed attempts. Please request a new OTP." };
  }

  // Check expiration
  if (new Date() > record.expiresAt) {
    otpStore.delete(email);
    return { success: false, message: "OTP has expired. Please request a new one." };
  }

  // Verify hash
  const isValid = await bcrypt.compare(submittedOtp, record.hashedOtp);
  
  if (!isValid) {
    // Increment attempts
    record.attempts += 1;
    otpStore.set(email, record);
    return { success: false, message: "Invalid OTP code." };
  }

  // Success 
  otpStore.delete(email); // Cleanup consumed OTP
  return { success: true, message: "Identity verified successfully." };
};
