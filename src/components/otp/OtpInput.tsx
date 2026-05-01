import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent, ClipboardEvent } from 'react';

interface OtpInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  error?: boolean;
}

export default function OtpInput({ length = 6, onComplete, error = false }: OtpInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus the first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, val: string) => {
    // Only allow numeric input
    if (!/^\d*$/.test(val)) return;

    const newValues = [...values];
    newValues[index] = val.substring(val.length - 1); // Only take latest char
    setValues(newValues);

    // Auto focus next
    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit if complete
    const fullOtp = newValues.join('');
    if (fullOtp.length === length) {
      onComplete(fullOtp);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, length);
    if (!pastedData) return;

    const newValues = [...values];
    pastedData.split('').forEach((char, i) => {
        newValues[i] = char;
    });
    setValues(newValues);

    // Focus on the rightmost pasted input or the end
    const targetIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[targetIndex]?.focus();

    if (pastedData.length === length) {
      onComplete(pastedData);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', width: '100%', marginBottom: '24px' }}>
      {values.map((val, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={val}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          style={{
            width: '44px',
            height: '52px',
            textAlign: 'center',
            fontSize: '20px',
            fontWeight: '600',
            border: `1px solid ${error ? '#e53e3e' : '#cbd5e1'}`,
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            color: '#1e293b',
            outline: 'none',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'border-color 0.2s, box-shadow 0.2s'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = error ? '#e53e3e' : '#3b82f6';
            e.currentTarget.style.boxShadow = error ? '0 0 0 2px rgba(229, 62, 62, 0.2)' : '0 0 0 2px rgba(59, 130, 246, 0.2)';
            e.currentTarget.select();
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? '#e53e3e' : '#cbd5e1';
            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
          }}
        />
      ))}
    </div>
  );
}
