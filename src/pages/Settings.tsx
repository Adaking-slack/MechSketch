import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Settings.css';

function Toggle({ label, checked, onChange, isRadio = false, name }: { label: string, checked: boolean, onChange: () => void, isRadio?: boolean, name?: string }) {
  return (
    <label className="settings-toggle-label">
      <span className="settings-toggle-text">{label}</span>
      <input 
        type={isRadio ? "radio" : "checkbox"} 
        name={name}
        className="settings-toggle-input" 
        checked={checked} 
        onChange={onChange} 
      />
      <div className="settings-toggle-track">
        <div className="settings-toggle-thumb" />
      </div>
    </label>
  );
}

function ProfileSettings() {
  const [name, setName] = useState('Jane Doe');
  const [email] = useState('jane.doe@mechsketch.com');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    setError('');
    setSuccess(false);

    if (!name.trim()) {
      setError('This field is required');
      return;
    }

    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="settings-section">
      <h2 className="settings-section-title">Profile Settings</h2>
      <div className="settings-form">
        <div className="settings-field">
          <label className="settings-label" htmlFor="profile-name">
            Full Name
          </label>
          <input
            id="profile-name"
            type="text"
            className={`settings-input ${error ? 'error' : ''}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {error && <span className="settings-error-text">{error}</span>}
        </div>
        <div className="settings-field">
          <label className="settings-label" htmlFor="profile-email">
            Email Address
          </label>
          <input
            id="profile-email"
            type="email"
            className="settings-input"
            value={email}
            disabled
            readOnly
          />
        </div>
        <button type="button" className="settings-button-primary" onClick={handleSave}>
          Save Changes
        </button>
        {success && <div className="settings-success-text">Profile updated successfully</div>}
      </div>
    </div>
  );
}

function PasswordSettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleUpdate = () => {
    setError('');
    setSuccess(false);

    if (!currentPassword) {
      setError('This field is required');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (currentPassword === 'wrong') {
      setError('Incorrect current password');
      return;
    }

    setSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="settings-section">
      <h2 className="settings-section-title">Password Settings</h2>
      <div className="settings-form">
        <div className="settings-field">
          <label className="settings-label" htmlFor="current-password">
            Current Password
          </label>
          <input
            id="current-password"
            type="password"
            className="settings-input"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className="settings-field">
          <label className="settings-label" htmlFor="new-password">
            New Password
          </label>
          <input
            id="new-password"
            type="password"
            className="settings-input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="settings-field">
          <label className="settings-label" htmlFor="confirm-password">
            Confirm New Password
          </label>
          <input
            id="confirm-password"
            type="password"
            className="settings-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        {error && <div className="settings-error-text">{error}</div>}
        <button type="button" className="settings-button-primary" onClick={handleUpdate}>
          Update Password
        </button>
        {success && <div className="settings-success-text">Password updated successfully</div>}
      </div>
    </div>
  );
}

function AppearanceSettings() {
  const [theme, setTheme] = useState('light');

  return (
    <div className="settings-section">
      <h2 className="settings-section-title">Appearance Settings</h2>
      <div className="settings-form">
        <div className="settings-field">
          <Toggle 
            label="Light Mode" 
            isRadio 
            name="theme" 
            checked={theme === 'light'} 
            onChange={() => setTheme('light')} 
          />
          <Toggle 
            label="Dark Mode" 
            isRadio 
            name="theme" 
            checked={theme === 'dark'} 
            onChange={() => setTheme('dark')} 
          />
          <Toggle 
            label="System Default" 
            isRadio 
            name="theme" 
            checked={theme === 'system'} 
            onChange={() => setTheme('system')} 
          />
        </div>
      </div>
    </div>
  );
}

function NotificationsSettings() {
  const [email, setEmail] = useState(true);
  const [push, setPush] = useState(false);
  const [updates, setUpdates] = useState(true);
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="settings-section">
      <h2 className="settings-section-title">Notifications Settings</h2>
      <div className="settings-form">
        <div className="settings-field">
          <Toggle label="Email Notifications" checked={email} onChange={() => setEmail(!email)} />
          <Toggle label="Push Notifications" checked={push} onChange={() => setPush(!push)} />
          <Toggle label="Product Updates" checked={updates} onChange={() => setUpdates(!updates)} />
        </div>
        <button type="button" className="settings-button-primary" onClick={handleSave}>
          Save Preferences
        </button>
        {success && <div className="settings-success-text">Preferences updated</div>}
      </div>
    </div>
  );
}

function SecuritySettings() {
  const [confirming, setConfirming] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/auth?view=login');
  };

  return (
    <div className="settings-section">
      <h2 className="settings-section-title">Security Settings</h2>
      <div className="settings-form">
        {!confirming ? (
          <button 
            type="button" 
            className="settings-button-danger" 
            onClick={() => setConfirming(true)}
          >
            Log out of all devices
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span className="settings-error-text" style={{ textAlign: 'center', marginBottom: '8px' }}>
              Are you sure you want to log out everywhere?
            </span>
            <button 
              type="button" 
              className="settings-button-danger" 
              style={{ backgroundColor: 'var(--sys-primitives-colors-error-error-600)', color: 'white' }}
              onClick={handleLogout}
            >
              Yes, log out
            </button>
            <button 
              type="button" 
              className="settings-button-secondary" 
              style={{ marginTop: 0 }}
              onClick={() => setConfirming(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function HelpSupportSettings() {
  const handleContact = () => {
    window.location.href = 'mailto:support@mechsketch.com';
  };

  return (
    <div className="settings-section">
      <h2 className="settings-section-title">Help & Support</h2>
      <div className="settings-form">
        <button type="button" className="settings-button-secondary" onClick={handleContact}>
          Contact Support
        </button>
        <p className="settings-support-text">
          Have an issue? Email us directly at{' '}
          <a href="mailto:support@mechsketch.com" className="settings-support-link">
            support@mechsketch.com
          </a>
        </p>
      </div>
    </div>
  );
}

export default function Settings() {
  return (
    <div className="settings-container">
      <div className="settings-content">
        <ProfileSettings />
        <PasswordSettings />
        <AppearanceSettings />
        <NotificationsSettings />
        <SecuritySettings />
        <HelpSupportSettings />
      </div>
    </div>
  );
}
