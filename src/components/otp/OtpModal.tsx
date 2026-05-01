import { useState, useEffect } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import OtpInput from './OtpInput';
import { useOtpTimer } from '../../hooks/useOtpTimer';
import { otpService } from '../../services/otpService';
import type { ActionType } from '../../services/otpService';

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
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        width: '100%',
        maxWidth: '420px',
        borderRadius: '12px',
        padding: '32px 24px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#64748b'
          }}
        >
          <X size={20} />
        </button>

        {isSuccess ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '24px 0' }}>
            <CheckCircle2 size={48} color="#22c55e" />
            <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0, color: '#0f172a' }}>Verified Successfully</h2>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#0f172a', margin: '0 0 8px 0' }}>
              Verify your identity
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', textAlign: 'center', margin: '0 0 24px 0', lineHeight: 1.5 }}>
              We sent a 6-digit code to<br />
              <strong style={{ color: '#334155' }}>{email}</strong>
            </p>

            <OtpInput 
              length={6} 
              onComplete={(val) => { setOtp(val); handleVerify(val); }} 
              error={!!errorMsg} 
            />

            {errorMsg && (
              <p style={{ color: '#e53e3e', fontSize: '13px', margin: '-8px 0 16px 0', fontWeight: 500 }}>
                {errorMsg}
              </p>
            )}

            <button
              onClick={() => handleVerify(otp)}
              disabled={otp.length !== 6 || loading}
              style={{
                width: '100%',
                backgroundColor: otp.length !== 6 || loading ? '#cbd5e1' : '#0f172a',
                color: '#ffffff',
                border: 'none',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: otp.length !== 6 || loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                marginBottom: '16px'
              }}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>

            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
              Didn't receive a code?{' '}
              <button
                onClick={handleResend}
                disabled={isActive || loading}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: isActive || loading ? '#94a3b8' : '#3b82f6',
                  fontWeight: 600,
                  cursor: isActive || loading ? 'not-allowed' : 'pointer',
                  textDecoration: isActive || loading ? 'none' : 'underline'
                }}
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
