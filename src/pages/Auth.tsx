import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Bot } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type View = 'signin' | 'signup' | 'recovery';

interface FieldErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface Touched {
  fullName?: boolean;
  email?: boolean;
  password?: boolean;
  confirmPassword?: boolean;
}

// ─── Validation ───────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@,]+@[^\s@]+\.[^\s@]+$/;
const NAME_RE = /^[a-zA-Z\s'-]+$/;

function validateSignIn(email: string, password: string, touched: Touched = {}): FieldErrors {
  const e: FieldErrors = {};
  if (touched.email) {
    if (!email) e.email = 'Email is required.';
    else if (!EMAIL_RE.test(email)) e.email = 'Enter a valid email address.';
  }
  if (touched.password) {
    if (!password) e.password = 'Password is required.';
    else if (password.length < 8) e.password = 'At least 8 characters required.';
  }
  return e;
}

function validateSignUp(
  fullName: string, email: string, password: string, confirmPassword: string, touched: Touched = {}
): FieldErrors {
  const e: FieldErrors = {};
  if (touched.fullName) {
    if (!fullName.trim()) e.fullName = 'Full name is required.';
    else if (fullName.trim().length < 2) e.fullName = 'At least 2 characters required.';
    else if (!NAME_RE.test(fullName.trim())) e.fullName = 'Letters, hyphens, and apostrophes only.';
    else if (fullName.trim().length > 50) e.fullName = 'Maximum 50 characters allowed.';
  }
  if (touched.email) {
    if (!email) e.email = 'Email is required.';
    else if (!EMAIL_RE.test(email)) e.email = 'Enter a valid email address.';
  }
  if (touched.password) {
    if (!password) e.password = 'Password is required.';
    else if (password.length < 8) e.password = 'At least 8 characters required.';
    else if (!/[A-Z]/.test(password)) e.password = 'At least 1 uppercase letter required.';
    else if (!/[a-z]/.test(password)) e.password = 'At least 1 lowercase letter required.';
    else if (!/[0-9]/.test(password)) e.password = 'At least 1 number required.';
    else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) e.password = 'At least 1 special character required.';
  }
  if (touched.confirmPassword) {
    if (!confirmPassword) e.confirmPassword = 'Please confirm your password.';
    else if (confirmPassword !== password) e.confirmPassword = 'Passwords do not match.';
  }
  return e;
}

function validateRecovery(email: string, touched: boolean = false): FieldErrors {
  const e: FieldErrors = {};
  if (touched) {
    if (!email) e.email = 'Email is required.';
    else if (!EMAIL_RE.test(email)) e.email = 'Enter a valid email address.';
  }
  return e;
}

// ─── Animation variants ───────────────────────────────────────────────────────

function RollingBot() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--sys-primitives-colors-primary-primary-500)',
      }}
    >
      <Bot size={40} strokeWidth={1.5} />
    </motion.div>
  );
}

function slideVariants() {
  return {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.95 },
  };
}

// ─── Fluid Background ─────────────────────────────────────────────────────────

interface FluidBlob {
  angle: number;
  speed: number;
  orbitX: number;
  orbitY: number;
  cx: number;
  cy: number;
  radius: number;
  r: number; g: number; b: number; a: number;
}

function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const blobs: FluidBlob[] = [
      { angle: 0, speed: 0.0007, orbitX: 320, orbitY: 200, cx: 0.25, cy: 0.30, radius: 380, r: 0, g: 55, b: 110, a: 0.15 },
      { angle: 1.2, speed: 0.0005, orbitX: 260, orbitY: 180, cx: 0.70, cy: 0.65, radius: 340, r: 0, g: 133, b: 122, a: 0.12 },
      { angle: 2.4, speed: 0.0009, orbitX: 200, orbitY: 240, cx: 0.50, cy: 0.20, radius: 280, r: 62, g: 152, b: 242, a: 0.08 },
      { angle: 3.6, speed: 0.0006, orbitX: 300, orbitY: 160, cx: 0.15, cy: 0.75, radius: 300, r: 27, g: 239, b: 216, a: 0.06 },
      { angle: 0.8, speed: 0.0008, orbitX: 180, orbitY: 220, cx: 0.85, cy: 0.25, radius: 250, r: 1, g: 80, b: 74, a: 0.10 },
      { angle: 4.2, speed: 0.0004, orbitX: 240, orbitY: 280, cx: 0.40, cy: 0.80, radius: 320, r: 0, g: 32, b: 64, a: 0.14 },
    ];

    let raf: number;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'screen';

      blobs.forEach(blob => {
        blob.angle += blob.speed;
        const x = blob.cx * w + Math.cos(blob.angle) * blob.orbitX;
        const y = blob.cy * h + Math.sin(blob.angle * 0.65) * blob.orbitY;

        const grad = ctx.createRadialGradient(x, y, 0, x, y, blob.radius);
        grad.addColorStop(0, `rgba(${blob.r},${blob.g},${blob.b},${blob.a})`);
        grad.addColorStop(0.5, `rgba(${blob.r},${blob.g},${blob.b},${blob.a * 0.4})`);
        grad.addColorStop(1, `rgba(${blob.r},${blob.g},${blob.b},0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, blob.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalCompositeOperation = 'source-over';

      const vignette = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.75);
      vignette.addColorStop(0, 'rgba(248,250,252,0)');
      vignette.addColorStop(1, 'rgba(248,250,252,0.3)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0,
        width: '100%', height: '100%',
        zIndex: 0, display: 'block',
        pointerEvents: 'none',
      }}
    />
  );
}

// ─── InputField ───────────────────────────────────────────────────────────────

interface InputFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string;
}

function InputField({ id, label, type = 'text', placeholder, value, onChange, onBlur, error }: InputFieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sys-tokens-spacing-spacing-xxs)' }}>
      <label
        htmlFor={id}
        style={{
          fontSize: 'var(--sys-typography-size-13)',
          fontWeight: 700,
          fontFamily: 'var(--sys-typography-font-family-font-sans-serif)',
          color: 'var(--sys-primitives-colors-neutral-neutral-700)',
          letterSpacing: '0.5px',
        }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); onBlur?.(); }}
        style={{
          fontFamily: 'var(--sys-typography-font-family-font-sans-serif)',
          fontSize: 'var(--sys-typography-size-15)',
          fontWeight: 400,
          background: error
            ? 'rgba(173,1,1,0.06)'
            : focused
              ? '#ffffff'
              : '#f1f5f9',
          border: `1.5px solid ${error
            ? 'var(--sys-primitives-colors-error-error-600)'
            : focused
              ? 'var(--sys-primitives-colors-primary-primary-400)'
              : 'var(--sys-primitives-colors-neutral-neutral-300)'
            }`,
          borderRadius: 'var(--sys-tokens-radius-radius-xs)',
          padding: '13px var(--sys-tokens-spacing-spacing-md)',
          color: '#1e293b',
          outline: 'none',
          width: '100%',
          boxSizing: 'border-box',
          transition: 'border-color 0.18s, background 0.18s',
        }}
      />
      <AnimatePresence>
        {error && (
          <motion.span
            key={error}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              fontSize: 'var(--sys-typography-size-13)',
              color: 'var(--sys-primitives-colors-error-error-500)',
              fontFamily: 'var(--sys-typography-font-family-font-sans-serif)',
            }}
          >
            ⚠ {error}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

interface PasswordFieldProps extends Omit<InputFieldProps, 'type'> {
  showToggle?: boolean;
}

function PasswordField({ id, label, value, onChange, onBlur, error, showToggle = true }: PasswordFieldProps) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sys-tokens-spacing-spacing-xxs)' }}>
      <label
        htmlFor={id}
        style={{
          fontSize: 'var(--sys-typography-size-13)',
          fontWeight: 700,
          fontFamily: 'var(--sys-typography-font-family-font-sans-serif)',
          color: 'var(--sys-primitives-colors-neutral-neutral-400)',
          letterSpacing: '0.5px',
        }}
      >
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); onBlur?.(); }}
          style={{
            fontFamily: 'var(--sys-typography-font-family-font-sans-serif)',
            fontSize: 'var(--sys-typography-size-15)',
            fontWeight: 400,
            background: error
              ? 'rgba(173,1,1,0.06)'
              : focused
                ? 'rgba(62,152,242,0.06)'
                : 'var(--sys-primitives-colors-neutral-neutral-100)',
            border: `1.5px solid ${error
              ? 'var(--sys-primitives-colors-error-error-600)'
              : focused
                ? 'var(--sys-primitives-colors-primary-primary-400)'
                : 'var(--sys-primitives-colors-neutral-neutral-300)'
              }`,
            borderRadius: 'var(--sys-tokens-radius-radius-xs)',
            padding: '13px var(--sys-tokens-spacing-spacing-md)',
            paddingRight: showToggle ? '44px' : 'var(--sys-tokens-spacing-spacing-md)',
            color: 'var(--sys-primitives-colors-neutral-tertiary-1000)',
            outline: 'none',
            width: '100%',
            boxSizing: 'border-box',
            transition: 'border-color 0.18s, background 0.18s',
          }}
        />
        {showToggle && (
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {visible ? (
              <Eye size={18} color="var(--sys-primitives-colors-neutral-neutral-500)" />
            ) : (
              <EyeOff size={18} color="var(--sys-primitives-colors-neutral-neutral-500)" />
            )}
          </button>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.span
            key={error}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              fontSize: 'var(--sys-typography-size-13)',
              color: 'var(--sys-primitives-colors-error-error-400)',
              fontFamily: 'var(--sys-typography-font-family-font-sans-serif)',
            }}
          >
            ⚠ {error}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── PrimaryButton ────────────────────────────────────────────────────────────

interface PrimaryButtonProps { loading: boolean; label: string; }
function PrimaryButton({ loading, label }: PrimaryButtonProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="submit"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={loading}
      style={{
        width: '100%',
        padding: '14px var(--sys-tokens-spacing-spacing-md)',
        background: loading
          ? 'var(--sys-primitives-colors-primary-primary-600)'
          : hovered
            ? 'var(--sys-primitives-colors-primary-primary-600)'
            : 'var(--sys-primitives-colors-primary-primary-500)',
        border: 'none',
        borderRadius: 'var(--sys-tokens-radius-radius-xs)',
        color: 'var(--sys-primitives-colors-primary-primary-100)',
        fontSize: 'var(--sys-typography-size-15)',
        fontWeight: 700,
        fontFamily: 'var(--sys-typography-font-family-font-sans-serif)',
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'background 0.18s, transform 0.12s, box-shadow 0.18s',
        transform: hovered && !loading ? 'translateY(-1px)' : 'translateY(0)',
        boxShadow: hovered && !loading
          ? '0 6px 18px rgba(0,55,110,0.35)'
          : '0 2px 8px rgba(0,55,110,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--sys-tokens-spacing-spacing-xs)',
      }}
    >
      {loading && (
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          style={{ animation: 'auth-spin 0.9s linear infinite', flexShrink: 0 }}
        >
          <line x1="12" y1="2" x2="12" y2="6" />
          <line x1="12" y1="18" x2="12" y2="22" />
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
          <line x1="2" y1="12" x2="6" y2="12" />
          <line x1="18" y1="12" x2="22" y2="12" />
        </svg>
      )}
      {loading ? 'Processing...' : label}
    </button>
  );
}

// ─── SocialButton ─────────────────────────────────────────────────────────────

interface SocialButtonProps { icon: React.ReactNode; label: string; }
function SocialButton({ icon, label }: SocialButtonProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--sys-tokens-spacing-spacing-xs)',
        padding: '11px var(--sys-tokens-spacing-spacing-md)',
        background: hovered
          ? 'var(--sys-primitives-colors-neutral-neutral-200)'
          : 'var(--sys-primitives-colors-neutral-neutral-100)',
        border: '1.5px solid var(--sys-primitives-colors-neutral-neutral-300)',
        borderRadius: 'var(--sys-tokens-radius-radius-xs)',
        color: 'var(--sys-primitives-colors-neutral-tertiary-1000)',
        cursor: 'pointer',
        fontSize: 'var(--sys-typography-size-13)',
        fontWeight: 500,
        fontFamily: 'var(--sys-typography-font-family-font-sans-serif)',
        transition: 'background 0.18s, border-color 0.18s',
      }}
    >
      {icon}
      {label}
    </button>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

function OrDivider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sys-tokens-spacing-spacing-xs)' }}>
      <div style={{ flex: 1, height: '1px', background: 'var(--sys-primitives-colors-neutral-neutral-300)' }} />
      <span style={{
        fontSize: 'var(--sys-typography-size-13)',
        color: 'var(--sys-primitives-colors-neutral-neutral-500)',
        fontFamily: 'var(--sys-typography-font-family-font-sans-serif)',
        letterSpacing: '1px',
      }}>
        OR
      </span>
      <div style={{ flex: 1, height: '1px', background: 'var(--sys-primitives-colors-neutral-neutral-800)' }} />
    </div>
  );
}

// ─── Ghost link button ────────────────────────────────────────────────────────

interface GhostBtnProps {
  onClick: () => void;
  children: React.ReactNode;
  color?: string;
  size?: string;
}
function GhostBtn({ onClick, children, color, size }: GhostBtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        fontFamily: 'var(--sys-typography-font-family-font-sans-serif)',
        fontSize: size ?? 'var(--sys-typography-size-13)',
        fontWeight: 700,
        color: color ?? 'var(--sys-primitives-colors-primary-primary-400)',
        textDecoration: 'none',
      }}
    >
      {children}
    </button>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#24292e">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}



// ─── View: Sign In ────────────────────────────────────────────────────────────

interface SignInProps { onSwitch: (v: View) => void; }

function SignInView({ onSwitch }: SignInProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Touched>({});
  const [loading, setLoading] = useState(false);

  const handleBlur = (field: keyof Touched) => {
    setTouched(t => ({ ...t, [field]: true }));
    const errs = validateSignIn(email, password, { ...touched, [field]: true });
    setErrors(errs);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullTouched = { email: true, password: true };
    const errs = validateSignIn(email, password, fullTouched);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    setTimeout(() => navigate('/select-robot'), 1500);
  };

  return (
    <form id="signin-form" onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sys-tokens-spacing-spacing-md)' }}>
      {/* Heading */}
      <div style={{ marginBottom: 'var(--sys-tokens-spacing-spacing-xs)' }}>
<h2 style={{
          margin: 0,
          fontSize: 'var(--sys-typography-size-32)',
          fontWeight: 900,
          fontFamily: 'var(--sys-typography-font-family-font-sans-serif)',
          letterSpacing: 'var(--sys-typography-spacing-h3)',
          color: 'var(--sys-primitives-colors-neutral-tertiary-1000)',
          lineHeight: 'var(--sys-typography-height-h3)',
          textAlign: 'center',
        }}>
          Login
        </h2>
      </div>

      {/* Fields */}
      <InputField id="signin-email" label="Email" type="email" value={email} onChange={setEmail} onBlur={() => handleBlur('email')} error={errors.email} />
      <div>
        <PasswordField id="signin-password" label="Password" value={password} onChange={setPassword} onBlur={() => handleBlur('password')} error={errors.password} />
        <div style={{ textAlign: 'right', marginTop: 'var(--sys-tokens-spacing-spacing-xxs)' }}>
          <GhostBtn
            onClick={() => onSwitch('recovery')}
            color="var(--sys-primitives-colors-primary-primary-400)"
            size="var(--sys-typography-size-13)"
          >
            Forgot Password?
          </GhostBtn>
        </div>
      </div>

      {/* CTA */}
      <PrimaryButton loading={loading} label="Login" />

      {/* Social — below form */}
      <OrDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sys-tokens-spacing-spacing-xs)' }}>
        <SocialButton icon={<GoogleIcon />} label="Continue with Google" />
        <SocialButton icon={<GitHubIcon />} label="Continue with GitHub" />
      </div>

      {/* Switch */}
      <p style={{
        margin: 0,
        textAlign: 'center',
        fontSize: 'var(--sys-typography-size-13)',
        fontFamily: 'var(--sys-typography-font-family-font-sans-serif)',
        color: 'var(--sys-primitives-colors-neutral-neutral-500)',
      }}>
        Don't have an account?{' '}
        <GhostBtn onClick={() => onSwitch('signup')}>Sign up here</GhostBtn>
      </p>
    </form>
  );
}

// ─── View: Sign Up ────────────────────────────────────────────────────────────

interface SignUpProps { onSwitch: (v: View) => void; }

function SignUpView({ onSwitch }: SignUpProps) {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Touched>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleBlur = (field: keyof Touched) => {
    setTouched(t => ({ ...t, [field]: true }));
    const errs = validateSignUp(fullName, email, password, confirmPassword, { ...touched, [field]: true });
    setErrors(errs);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullTouched = { fullName: true, email: true, password: true, confirmPassword: true };
    const errs = validateSignUp(fullName, email, password, confirmPassword, fullTouched);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setSuccess(true); }, 1500);
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 'var(--sys-tokens-spacing-spacing-xl)', textAlign: 'center',
          padding: 'var(--sys-tokens-spacing-spacing-3xl) 0',
        }}
      >
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'rgba(0,133,122,0.12)',
          border: '2px solid var(--sys-primitives-colors-secondary-secondary-500)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
            stroke="var(--sys-primitives-colors-secondary-secondary-400)"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div>
          <h3 style={{
            margin: '0 0 var(--sys-tokens-spacing-spacing-xs) 0',
            fontSize: 'var(--sys-typography-size-22)',
            fontWeight: 700,
            fontFamily: 'var(--sys-typography-font-family-font-sans-serif)',
            color: 'var(--sys-primitives-colors-neutral-netural-100)',
          }}>
            Account Created
          </h3>
          <p style={{
            margin: 0,
            fontSize: 'var(--sys-typography-size-15)',
            fontFamily: 'var(--sys-typography-font-family-font-sans-serif)',
            color: 'var(--sys-primitives-colors-neutral-neutral-500)',
            lineHeight: 'var(--sys-typography-height-body)',
          }}>
            Your MechSketch account is ready.<br />Check your inbox to verify your email.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/select-robot')}
          style={{
            width: '100%', padding: '14px',
            background: 'var(--sys-primitives-colors-primary-primary-500)',
            border: 'none',
            borderRadius: 'var(--sys-tokens-radius-radius-xs)',
            color: 'var(--sys-primitives-colors-primary-primary-100)',
            fontSize: 'var(--sys-typography-size-15)',
            fontWeight: 700,
            fontFamily: 'var(--sys-typography-font-family-font-sans-serif)',
            cursor: 'pointer',
          }}
        >
          Launch MechSketch →
        </button>
        <GhostBtn
          onClick={() => onSwitch('signin')}
          color="var(--sys-primitives-colors-neutral-neutral-500)"
          size="var(--sys-typography-size-13)"
        >
          ← Back to Login
        </GhostBtn>
      </motion.div>
    );
  }

  return (
    <form id="signup-form" onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sys-tokens-spacing-spacing-md)' }}>
      {/* Heading */}
      <div style={{ marginBottom: 'var(--sys-tokens-spacing-spacing-xs)' }}>
<h2 style={{
          margin: '0 0 6px 0',
          fontSize: 'var(--sys-typography-size-32)',
          fontWeight: 900,
          fontFamily: 'var(--sys-typography-font-family-font-sans-serif)',
          letterSpacing: 'var(--sys-typography-spacing-h3)',
          color: 'var(--sys-primitives-colors-neutral-tertiary-1000)',
          lineHeight: 'var(--sys-typography-height-h3)',
          textAlign: 'center',
        }}>
          Sign Up
        </h2>
        <p style={{
          margin: 0,
          fontSize: 'var(--sys-typography-size-15)',
          fontFamily: 'var(--sys-typography-font-family-font-sans-serif)',
          color: 'var(--sys-primitives-colors-neutral-neutral-500)',
          textAlign: 'center',
        }}>
          Create your MechSketch account.
        </p>
      </div>

      {/* Fields */}
      <InputField id="signup-name" label="Full Name" value={fullName} onChange={setFullName} onBlur={() => handleBlur('fullName')} error={errors.fullName} />
      <InputField id="signup-email" label="Email" type="email" value={email} onChange={setEmail} onBlur={() => handleBlur('email')} error={errors.email} />
      <PasswordField id="signup-password" label="Password" value={password} onChange={setPassword} onBlur={() => handleBlur('password')} error={errors.password} />
      <PasswordField id="signup-confirm" label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} onBlur={() => handleBlur('confirmPassword')} error={errors.confirmPassword} />

      {/* CTA */}
      <PrimaryButton loading={loading} label="Sign Up" />

      {/* Social — below form */}
      <OrDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sys-tokens-spacing-spacing-xs)' }}>
        <SocialButton icon={<GoogleIcon />} label="Continue with Google" />
        <SocialButton icon={<GitHubIcon />} label="Continue with GitHub" />
      </div>

      {/* Switch */}
      <p style={{
        margin: 0,
        textAlign: 'center',
        fontSize: 'var(--sys-typography-size-13)',
        fontFamily: 'var(--sys-typography-font-family-font-sans-serif)',
        color: 'var(--sys-primitives-colors-neutral-neutral-500)',
      }}>
        Already have an account?{' '}
        <GhostBtn onClick={() => onSwitch('signin')}>Sign in here</GhostBtn>
      </p>
    </form>
  );
}

// ─── View: Password Recovery ──────────────────────────────────────────────────

interface RecoveryProps { onSwitch: (v: View) => void; }

function RecoveryView({ onSwitch }: RecoveryProps) {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (sent && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [sent, countdown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateRecovery(email);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); setCountdown(30); }, 1500);
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setCountdown(30); }, 1000);
  };

  return (
    <form id="recovery-form" onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sys-tokens-spacing-spacing-md)' }}>
      {/* Heading */}
      <div>
        <h2 style={{
          margin: '0 0 6px 0',
          fontSize: 'var(--sys-typography-size-32)',
          fontWeight: 900,
          fontFamily: 'var(--sys-typography-font-family-font-sans-serif)',
          letterSpacing: 'var(--sys-typography-spacing-h3)',
          color: '#1e293b',
          lineHeight: 'var(--sys-typography-height-h3)',
          textAlign: 'center',
        }}>
          Recover Password
        </h2>
        <p style={{
          margin: 0,
          fontSize: 'var(--sys-typography-size-15)',
          fontFamily: 'var(--sys-typography-font-family-font-sans-serif)',
          color: '#64748b',
          lineHeight: 'var(--sys-typography-height-body)',
          textAlign: 'center',
        }}>
          Enter your email and a reset code will be sent to you.
        </p>
      </div>

      {/* Field */}
      <InputField
        id="recovery-email" label="Email" type="email"
        value={email} onChange={setEmail} error={errors.email}
      />

      {/* Success banner */}
      <AnimatePresence>
        {sent && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              background: 'rgba(0,133,122,0.08)',
              border: '1.5px solid #0d9488',
              borderRadius: 'var(--sys-tokens-radius-radius-xs)',
              padding: 'var(--sys-tokens-spacing-spacing-xs) var(--sys-tokens-spacing-spacing-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--sys-tokens-spacing-spacing-xs)',
            }}
          >
            <svg width="16" height="16" fill="none"
              stroke="#0d9488"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <polyline points="22 2 15 22 11 13 2 9 22 2" />
              <line x1="22" y1="2" x2="11" y2="13" />
            </svg>
            <span style={{
              fontSize: 'var(--sys-typography-size-13)',
              fontFamily: 'var(--sys-typography-font-family-font-sans-serif)',
              color: '#0f766e',
              fontWeight: 500,
            }}>
              Recovery email sent.
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA */}
      <PrimaryButton loading={loading} label="Send Code" />

      {/* Resend & Back */}
      {sent ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--sys-tokens-spacing-spacing-md)' }}>
          <GhostBtn onClick={handleResend} color={countdown > 0 ? '#94a3b8' : 'var(--sys-primitives-colors-primary-primary-500)'} size="var(--sys-typography-size-13)">
            {countdown > 0 ? `Resend code (${countdown}s)` : 'Resend code'}
          </GhostBtn>
          <GhostBtn onClick={() => onSwitch('signin')} color="#64748b" size="var(--sys-typography-size-13)">
            Back to Login
          </GhostBtn>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GhostBtn onClick={() => onSwitch('signin')} color="#64748b" size="var(--sys-typography-size-13)">
            Back to Login
          </GhostBtn>
        </div>
      )}
    </form>
  );
}

// ─── Main Auth Page ───────────────────────────────────────────────────────────

export default function Auth() {
  const [view, setView] = useState<View>('signin');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSwitch = (next: View) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setView(next);
      setTimeout(() => setIsTransitioning(false), 300);
    }, 50);
  };

  const variants = slideVariants();

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'var(--sys-primitives-colors-neutral-tertiary-100)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--sys-tokens-spacing-spacing-xl)',
      boxSizing: 'border-box',
      position: 'relative',
    }}>
      <FluidBackground />
      <style>{`
        @keyframes auth-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        input::placeholder {
          color: var(--sys-primitives-colors-neutral-neutral-400);
          font-family: var(--sys-typography-font-family-font-sans-serif);
        }
        button:focus-visible {
          outline: 2px solid var(--sys-primitives-colors-primary-primary-400);
          outline-offset: 2px;
        }
      `}</style>

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: 'var(--sys-tokens-radius-radius-md)',
        border: '1px solid rgba(0,0,0,0.08)',
        padding: 'var(--sys-tokens-spacing-spacing-3xl) var(--sys-tokens-spacing-spacing-2xl)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.12)',
        position: 'relative',
        zIndex: 1,
        overflow: 'hidden',
      }}>
        {/* Top accent */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
          background: `linear-gradient(90deg,
            var(--sys-primitives-colors-primary-primary-500),
            var(--sys-primitives-colors-secondary-secondary-500))`,
        }} />



        {/* Animated views */}
        <div style={{ position: 'relative', overflow: 'hidden', minHeight: 360 }}>
          {isTransitioning ? (
            <RollingBot />
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={view}
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {view === 'signin' && <SignInView onSwitch={handleSwitch} />}
                {view === 'signup' && <SignUpView onSwitch={handleSwitch} />}
                {view === 'recovery' && <RecoveryView onSwitch={handleSwitch} />}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
