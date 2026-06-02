import { useState, useEffect } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import OtpInput from './OtpInput';
import { useOtpTimer } from '../../hooks/useOtpTimer';
import { otpService } from '../../services/otpService';
import type { ActionType } from '../../services/otpService';
import './OtpModal.css';

interface OtpModalProps {
  email: string;
  actionType: ActionType;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function OtpModal({ email, actionType, isOpen, onClose, onSuccess }: OtpModalProps) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const { timeLeft, isActive, startTimer } = useOtpTimer(60);

  useEffect(() => {
    if (isOpen) {
      requestInitialOtp();
    } else {
      // Reset state on close
      setOtp('');
      setErrorMsg('');
      setIsSuccess(false);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const requestInitialOtp = async () => {
    // Only request if timer isn't already active
    if (isActive) return;
    
    setLoading(true);
    const res = await otpService.requestOtp(email, actionType);
    setLoading(false);

    if (res.success) {
      startTimer();
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleVerify = async (submittedOtp: string) => {
    setErrorMsg('');
    setLoading(true);
    const res = await otpService.verifyOtp(email, submittedOtp, actionType);
    setLoading(false);

    if (res.success) {
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500); // Wait 1.5s to show checkmark
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleResend = async () => {
    if (isActive || loading) return;
    
    setErrorMsg('');
    setLoading(true);
    const res = await otpService.resendOtp(email, actionType);
    setLoading(false);

    if (res.success) {
      startTimer();
    } else {
      setErrorMsg(res.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="otp-modal-overlay">
      <div className="otp-modal-content">
        <button 
          onClick={onClose}
          className="otp-modal-close"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {isSuccess ? (
          <div className="otp-success-container">
            <CheckCircle2 size={48} color="#22c55e" />
            <h2 className="otp-modal-title">Verified Successfully</h2>
          </div>
        ) : (
          <>
            <h2 className="otp-modal-title">
              Verify your identity
            </h2>
            <p className="otp-modal-subtitle">
              We sent a 6-digit code to<br />
              <strong style={{ color: '#334155' }}>{email}</strong>
            </p>

            <OtpInput 
              length={6} 
              onComplete={(val) => { setOtp(val); handleVerify(val); }} 
              error={!!errorMsg} 
            />

            {errorMsg && (
              <p className="otp-error-msg">
                {errorMsg}
              </p>
            )}

            <button
              onClick={() => handleVerify(otp)}
              disabled={otp.length !== 6 || loading}
              className="otp-verify-btn"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>

            <p className="otp-resend-container">
              Didn't receive a code?{' '}
              <button
                onClick={handleResend}
                disabled={isActive || loading}
                className="otp-resend-btn"
              >
                {isActive ? `Resend in ${timeLeft}s` : 'Resend code'}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
