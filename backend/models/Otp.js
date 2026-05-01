// Simple in-memory mapped storage for OTP development
// Production should use a real DB like Supabase, Redis, or MongoDB

const otpStore = new Map();

// otpStore Map Structure:
// {
//   "email@example.com": {
//     hashedOtp: "string",
//     expiresAt: Date,
//     attempts: Number,
//     actionType: "login"
//   }
// }

export default otpStore;
