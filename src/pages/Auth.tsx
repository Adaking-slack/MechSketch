import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff } from 'lucide-react';

type View = 'identify' | 'login' | 'signup';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Icons ────────────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.15 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.62 1.54-1.3 3.02-2.53 4.08zm-5.17-13.6c-.28-2.69 2.08-4.99 4.69-5.18.39 2.8-2.48 5.1-4.69 5.18z" />
    </svg>
  );
}

// ─── Shared Components ────────────────────────────────────────────────────────

function SocialButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '14px',
        background: '#0B3A6E',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: 500,
        fontFamily: 'Inter, system-ui, sans-serif',
        cursor: 'pointer',
        transition: 'opacity 0.2s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>{icon}</div>
      <span>{label}</span>
    </button>
  );
}

function InputField({
  type = 'text',
  placeholder,
  value,
  onChange,
  error
}: {
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '14px 16px',
          background: '#EAEAEA',
          border: `1px solid ${error ? '#ef4444' : 'transparent'}`,
          borderRadius: '8px',
          fontSize: '15px',
          fontFamily: 'Inter, system-ui, sans-serif',
          color: '#374049',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.2s',
        }}
        onFocus={(e) => { if (!error) e.currentTarget.style.borderColor = '#0B3A6E'; }}
        onBlur={(e) => { if (!error) e.currentTarget.style.borderColor = 'transparent'; }}
      />
      {error && <span style={{ color: '#ef4444', fontSize: '13px', marginTop: '2px' }}>{error}</span>}
    </div>
  );
}

function PasswordField({
  placeholder,
  value,
  onChange,
  error
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <InputField
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        error={error}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        style={{
          position: 'absolute',
          right: '12px',
          top: error ? '24px' : '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#656768',
        }}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

function SecondaryButton({
  label,
  onClick,
  disabled,
  loading = false
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        width: '100%',
        padding: '14px',
        background: disabled ? '#EAEAEA' : '#0B3A6E',
        color: disabled ? '#A0A0A0' : '#FFFFFF',
        border: 'none',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: 500,
        fontFamily: 'Inter, system-ui, sans-serif',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'opacity 0.2s',
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.opacity = '0.9'; }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.opacity = '1'; }}
    >
      {loading ? 'Processing...' : label}
    </button>
  );
}

function Divider() {
  return (
    <div style={{ height: '1px', background: '#D1D5DB', margin: '6px 0' }} />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Auth() {
  const navigate = useNavigate();

  const [view, setView] = useState<View>('identify');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const isEmailValid = EMAIL_RE.test(email);

  const handleOAuth = async (provider: 'google' | 'apple') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/select-robot` }
    });
    if (error) setError(error.message);
  };

  const handleIdentify = () => {
    if (isEmailValid) {
      setError(undefined);
      setView('signup');
    }
  };

  const handleSignIn = async () => {
    if (!password) {
      setError('Password is required');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      navigate('/select-robot');
    }
  };

  const handleSignUp = async () => {
    if (!fullName || !email || !password) {
      setError('All fields are required');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      // Assuming auto-login or redirect on successful signup
      navigate('/select-robot');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: '#F6F7F9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      boxSizing: 'border-box',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#374049'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '520px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <h1 style={{
            margin: '0 0 12px 0',
            fontSize: '48px',
            lineHeight: '67px',
            letterSpacing: '-1px',
            fontWeight: 600,
            color: '#374049',
          }}>
            {view === 'login' ? 'Welcome back' : 'Welcome to MechSketch'}
          </h1>
          <p style={{
            margin: 0,
            fontSize: '15px',
            lineHeight: '23px',
            color: '#374049',
          }}>
            Build, test, and refine robot task sequences using an interactive 3D environment.
          </p>
        </div>

        {/* Dynamic View Area */}
        <AnimatePresence mode="wait">
          {view === 'identify' && (
            <motion.div
              key="identify"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 1px' }}>
                <SocialButton icon={<GoogleIcon />} label="Continue with Google" onClick={() => handleOAuth('google')} />
                <SocialButton icon={<AppleIcon />} label="Continue with Apple" onClick={() => handleOAuth('apple')} />
              </div>

              <Divider />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 5px' }}>
                <InputField
                  placeholder="Enter your email"
                  value={email}
                  onChange={setEmail}
                  error={error}
                />
                <SecondaryButton
                  label="Continue with email"
                  onClick={handleIdentify}
                  disabled={!isEmailValid}
                />
              </div>

              <div style={{ textAlign: 'center', marginTop: '4px' }}>
                <span style={{ fontSize: '14px', color: '#656768' }}>
                  already have an account?{' '}
                  <button
                    onClick={() => { setError(undefined); setView('login'); }}
                    style={{
                      background: 'none', border: 'none', padding: 0,
                      color: '#0B3A6E', cursor: 'pointer', fontWeight: 500,
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                  >
                    log in
                  </button>
                </span>
              </div>
            </motion.div>
          )}

          {view === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 5px' }}>
                <SocialButton icon={<GoogleIcon />} label="Log in with Google" onClick={() => handleOAuth('google')} />
                <SocialButton icon={<AppleIcon />} label="Log in with Apple" onClick={() => handleOAuth('apple')} />
              </div>

              <Divider />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '0 5px' }}>
                <InputField
                  placeholder="Email address"
                  value={email}
                  onChange={setEmail}
                />
                <PasswordField
                  placeholder="Enter your password"
                  value={password}
                  onChange={setPassword}
                  error={error}
                />

                <SecondaryButton
                  label="Sign In"
                  onClick={handleSignIn}
                  loading={loading}
                />
              </div>

              <div style={{ textAlign: 'center', marginTop: '8px' }}>
                <span style={{ fontSize: '14px', color: '#656768' }}>
                  Don't have an account?{' '}
                  <button
                    onClick={() => { setError(undefined); setPassword(''); setView('identify'); }}
                    style={{
                      background: 'none', border: 'none', padding: 0,
                      color: '#0B3A6E', cursor: 'pointer', fontWeight: 500
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                  >
                    sign up here
                  </button>
                </span>
              </div>
            </motion.div>
          )}

          {view === 'signup' && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 5px' }}>
                <SocialButton icon={<GoogleIcon />} label="Sign up with Google" onClick={() => handleOAuth('google')} />
                <SocialButton icon={<AppleIcon />} label="Sign up with Apple" onClick={() => handleOAuth('apple')} />
              </div>

              <Divider />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '0 5px' }}>
                <InputField
                  placeholder="Full Name"
                  value={fullName}
                  onChange={setFullName}
                />
                <InputField
                  placeholder="Email address"
                  value={email}
                  onChange={setEmail}
                />
                <PasswordField
                  placeholder="Create a password"
                  value={password}
                  onChange={setPassword}
                  error={error}
                />

                <SecondaryButton
                  label="Create Account"
                  onClick={handleSignUp}
                  loading={loading}
                />
              </div>

              <div style={{ textAlign: 'center', marginTop: '8px' }}>
                <span style={{ fontSize: '14px', color: '#656768' }}>
                  already have an account?{' '}
                  <button
                    onClick={() => { setError(undefined); setView('login'); }}
                    style={{
                      background: 'none', border: 'none', padding: 0,
                      color: '#0B3A6E', cursor: 'pointer', fontWeight: 500
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                  >
                    log in
                  </button>
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
