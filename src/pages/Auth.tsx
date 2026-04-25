import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type View = 'login' | 'signup';

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

function MailIcon() {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24'><g fill='none'><path d='M24 0v24H0V0zM12.593 23.258l-.011.002-.071.035-.02.004-.014-.004-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01-.017.428.005.02.01.013.104.074.015.004.012-.004.104-.074.012-.016.004-.017-.017-.427c-.002-.01-.009-.017-.017-.018m.265-.113-.013.002-.185.093-.01.01-.003.011.018.43.005.012.008.007.201.093c.012.004.023 0 .029-.008l.004-.014-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014-.034.614c0 .012.007.02.017.024l.015-.002.201-.093.01-.008.004-.011.017-.43-.003-.012-.01-.01z' /><path fill='#656768' d='M20 4a2 2 0 0 1 1.995 1.85L22 6v12a2 2 0 0 1-1.85 1.995L20 20H4a2 2 0 0 1-1.995-1.85L2 18V6a2 2 0 0 1 1.85-1.995L4 4zm0 3.414-6.94 6.94a1.5 1.5 0 0 1-2.12 0L4 7.414V18h16zM18.586 6H5.414L12 12.586z' /></g></svg>
  );
}

function LockIcon() {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24'><g fill='none'><path d='M24 0v24H0V0zM12.593 23.258l-.011.002-.071.035-.02.004-.014-.004-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01-.017.428.005.02.01.013.104.074.015.004.012-.004.104-.074.012-.016.004-.017-.017-.427c-.002-.01-.009-.017-.017-.018m.265-.113-.013.002-.185.093-.01.01-.003.011.018.43.005.012.008.007.201.093c.012.004.023 0 .029-.008l.004-.014-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014-.034.614c0 .012.007.02.017.024l.015-.002.201-.093.01-.008.004-.011.017-.43-.003-.012-.01-.01z' /><path fill='#656768' d='M12 2a6 6 0 0 1 5.996 5.775L18 8h1a2 2 0 0 1 1.995 1.85L21 10v10a2 2 0 0 1-1.85 1.995L19 22H5a2 2 0 0 1-1.995-1.85L3 20V10a2 2 0 0 1 1.85-1.995L5 8h1a6 6 0 0 1 6-6m7 8H5v10h14zm-7 2a2 2 0 0 1 1.134 3.647l-.134.085V17a1 1 0 0 1-1.993.117L11 17v-1.268A2 2 0 0 1 12 12m0-8a4 4 0 0 0-4 4h8a4 4 0 0 0-4-4' /></g></svg>
  );
}

function EyeIcon() {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24'><g fill='none'><path d='M24 0v24H0V0zM12.593 23.258l-.011.002-.071.035-.02.004-.014-.004-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01-.017.428.005.02.01.013.104.074.015.004.012-.004.104-.074.012-.016.004-.017-.017-.427c-.002-.01-.009-.017-.017-.018m.265-.113-.013.002-.185.093-.01.01-.003.011.018.43.005.012.008.007.201.093c.012.004.023 0 .029-.008l.004-.014-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014-.034.614c0 .012.007.02.017.024l.015-.002.201-.093.01-.008.004-.011.017-.43-.003-.012-.01-.01z' /><path fill='#656768' d='M12 4c2.787 0 5.263 1.257 7.026 2.813.885.781 1.614 1.658 2.128 2.531.505.857.846 1.786.846 2.656 0 .87-.34 1.799-.846 2.656-.514.873-1.243 1.75-2.128 2.531C17.263 18.743 14.786 20 12 20c-2.787 0-5.263-1.257-7.026-2.813-.885-.781-1.614-1.658-2.128-2.531C2.34 13.799 2 12.87 2 12c0-.87.34-1.799.846-2.656.514-.873 1.243-1.75 2.128-2.531C6.737 5.257 9.214 4 12 4m0 2c-2.184 0-4.208.993-5.702 2.312-.744.656-1.332 1.373-1.729 2.047C4.163 11.049 4 11.62 4 12c0 .38.163.951.569 1.641.397.674.985 1.39 1.729 2.047C7.792 17.007 9.816 18 12 18s4.208-.993 5.702-2.312c.744-.657 1.332-1.373 1.729-2.047.406-.69.569-1.261.569-1.641 0-.38-.163-.951-.569-1.641-.397-.674-.985-1.39-1.729-2.047C16.208 6.993 14.184 6 12 6m0 3c.088 0 .175.004.261.011a2 2 0 0 0 2.728 2.728A3 3 0 1 1 12 9' /></g></svg>
  );
}

function EyeCloseIcon() {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24'><g fill='none'><path d='M24 0v24H0V0zM12.593 23.258l-.011.002-.071.035-.02.004-.014-.004-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01-.017.428.005.02.01.013.104.074.015.004.012-.004.104-.074.012-.016.004-.017-.017-.427c-.002-.01-.009-.017-.017-.018m.265-.113-.013.002-.185.093-.01.01-.003.011.018.43.005.012.008.007.201.093c.012.004.023 0 .029-.008l.004-.014-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014-.034.614c0 .012.007.02.017.024l.015-.002.201-.093.01-.008.004-.011.017-.43-.003-.012-.01-.01z' /><path fill='#656768' d='M3.05 9.31a1 1 0 1 1 1.914-.577c2.086 6.986 11.982 6.987 14.07.004a1 1 0 1 1 1.918.57 9.509 9.509 0 0 1-1.813 3.417L20.414 14A1 1 0 0 1 19 15.414l-1.311-1.311a9.116 9.116 0 0 1-2.32 1.269l.357 1.335a1 1 0 1 1-1.931.518l-.364-1.357c-.947.14-1.915.14-2.862 0l-.364 1.357a1 1 0 1 1-1.931-.518l.357-1.335a9.118 9.118 0 0 1-2.32-1.27l-1.31 1.312A1 1 0 0 1 3.585 14l1.275-1.275c-.784-.936-1.41-2.074-1.812-3.414Z' /></g></svg>
  );
}

// ─── Shared Components ────────────────────────────────────────────────────────

function InputField({
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon
}: {
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {icon && (
          <div style={{ position: 'absolute', left: '16px', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
            {icon}
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            padding: `14px 16px 14px ${icon ? '44px' : '16px'}`,
            background: '#F6F8FA', // Matching the image's light grey input background
            border: `1px solid ${error ? '#ef4444' : 'transparent'}`,
            borderRadius: '8px',
            fontSize: '14px',
            fontFamily: 'Helvetica Neue, -apple-system, sans-serif',
            color: '#374049',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => { if (!error) e.currentTarget.style.borderColor = '#00376E'; }}
          onBlur={(e) => { if (!error) e.currentTarget.style.borderColor = 'transparent'; }}
        />
      </div>
      {error && <span style={{ color: '#ef4444', fontSize: '13px', marginTop: '2px' }}>{error}</span>}
    </div>
  );
}

function PasswordField({
  placeholder,
  value,
  onChange,
  error,
  icon
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  icon?: React.ReactNode;
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
        icon={icon}
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
          opacity: value ? 1 : 0,
          pointerEvents: value ? 'auto' : 'none',
        }}
      >
        {show ? <EyeCloseIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

function PrimaryButton({
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
        background: disabled ? '#EAEAEA' : '#00376E',
        color: disabled ? '#A0A0A0' : '#FFFFFF',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 500,
        fontFamily: 'Helvetica Neue, -apple-system, sans-serif',
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

function GoogleButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '14px',
        background: '#ECF5FE',
        color: '#001529',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 500,
        fontFamily: 'Helvetica Neue, -apple-system, sans-serif',
        cursor: 'pointer',
        transition: 'opacity 0.2s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
    >
      <GoogleIcon />
      Continue with Google
    </button>
  );
}

function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0', opacity: 0.5 }}>
      <div style={{ flex: 1, height: '1px', borderTop: '1px dashed #A0AAB5' }} />
      <span style={{ margin: '0 12px', fontSize: '12px', color: '#374049', fontWeight: 500 }}>OR</span>
      <div style={{ flex: 1, height: '1px', borderTop: '1px dashed #A0AAB5' }} />
    </div>
  );
}

function GridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cols = 40;
      const rows = 30;
      const spacingX = canvas.width / cols;
      const spacingY = canvas.height / rows;

      ctx.strokeStyle = 'rgba(0, 55, 100, 0.08)';
      ctx.lineWidth = 1;

      for (let i = 0; i <= cols; i++) {
        const x = i * spacingX;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      for (let j = 0; j <= rows; j++) {
        const y = j * spacingY;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const maxRadius = Math.max(canvas.width, canvas.height);

      for (let r = 0; r < maxRadius; r += 80) {
        const wobble = Math.sin(time + r * 0.01) * 5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, r + wobble, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 55, 100, ${0.03 * (1 - r / maxRadius)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
        const wobble = Math.cos(time + angle * 2) * 20;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
          centerX + Math.cos(angle) * (maxRadius + wobble),
          centerY + Math.sin(angle) * (maxRadius + wobble)
        );
        ctx.strokeStyle = 'rgba(0, 55, 100, 0.04)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      time += 0.02;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialView = searchParams.get('view') as View | null;

  const [view, setView] = useState<View>(initialView || 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [_error, setError] = useState<string | undefined>();
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const handleOAuth = async (provider: 'google') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/select-robot` }
    });
    if (error) setError(error.message);
  };

  const handleSubmit = async () => {
    setEmailError(undefined);
    setPasswordError(undefined);
    setError(undefined);

    if (!email) {
      setEmailError('Email is required');
      return;
    }
    if (!password) {
      setPasswordError('Password is required');
      return;
    }
    setLoading(true);

    if (view === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) setEmailError(error.message);
      else navigate('/select-robot');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setEmailError(error.message);
      else navigate('/select-robot');
    }
    setLoading(false);
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
      fontFamily: 'Helvetica Neue, -apple-system, sans-serif',
      color: '#001529',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <GridBackground />
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.04), 0px 2px 6px rgba(0, 0, 0, 0.02)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* Header inside Card */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            margin: '0 0 12px 0',
            fontSize: '24px',
            lineHeight: '32px',
            letterSpacing: '-0.5px',
            fontWeight: 700,
            color: '#001529',
          }}>
            {view === 'login' ? 'Welcome back' : 'Sign up with email'}
          </h1>
          <p style={{
            margin: 0,
            fontSize: '15px',
            lineHeight: '25px',
            color: '#374049',
          }}>
            Build, test, and refine robot task sequences using an interactive 3D environment.
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <InputField
                placeholder="Email"
                value={email}
                onChange={setEmail}
                error={emailError}
                icon={<MailIcon />}
              />
              <div>
                <PasswordField
                  placeholder="Password"
                  value={password}
                  onChange={setPassword}
                  error={passwordError}
                  icon={<LockIcon />}
                />
                {view === 'login' && (
                  <div style={{ textAlign: 'right', marginTop: '8px' }}>
                    <button
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        color: '#00376E',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 500,
                        fontFamily: 'Helvetica Neue, -apple-system, sans-serif'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                      Forgot password?
                    </button>
                  </div>
                )}
              </div>

              <PrimaryButton
                label={view === 'login' ? 'Sign In' : 'Get started'}
                onClick={handleSubmit}
                loading={loading}
              />
            </div>

            <Divider />

            <GoogleButton onClick={() => handleOAuth('google')} />

            <div style={{ textAlign: 'center', marginTop: '4px' }}>
              <span style={{ fontSize: '13px', color: '#374049' }}>
                {view === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => { setError(undefined); setEmailError(undefined); setPasswordError(undefined); setView(view === 'login' ? 'signup' : 'login'); }}
                  style={{
                    background: 'none', border: 'none', padding: 0,
                    color: '#00376E', cursor: 'pointer', fontWeight: 600,
                    fontSize: '13px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  {view === 'login' ? 'Sign up' : 'Login'}
                </button>
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
