import express from 'express';
import { requestOtp, verifyOtpCode, resendOtp } from '../controllers/otpController.js';

const router = express.Router();

router.post('/request', requestOtp);
router.post('/verify', verifyOtpCode);
router.post('/resend', resendOtp);

export default router;
