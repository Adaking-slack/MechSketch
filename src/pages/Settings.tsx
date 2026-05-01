import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import OtpModal from '../components/otp/OtpModal';
import './Settings.css';


type SectionType = 'profile' | 'password' | 'security' | 'notifications' | 'appearance' | 'help';


interface SectionConfig {
  id: SectionType;
  label: string;
  title: string;
  subtitle: string;
}


const SECTIONS: SectionConfig[] = [
  { id: 'profile', label: 'Profile Settings', title: 'Profile Settings', subtitle: 'View and update your personal information' },
  { id: 'password', label: 'Password Settings', title: 'Password Settings', subtitle: 'Securely change your password' },
  { id: 'security', label: 'Security Settings', title: 'Security Settings', subtitle: 'Manage your account security options' },
  { id: 'notifications', label: 'Notifications', title: 'Notifications', subtitle: 'Control your notification preferences' },
  { id: 'appearance', label: 'Appearance', title: 'Appearance', subtitle: 'Control visual theme and styling preferences' },
  { id: 'help', label: 'Help & Support', title: 'Help & Support', subtitle: 'Access support and assistance' },
];


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
    <div className="settings-section-content">
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
  const [showOtpModal, setShowOtpModal] = useState(false);


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

    // Trigger OTP Verification before proceeding
    setShowOtpModal(true);
  };

  const finalizePasswordUpdate = () => {
    setSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    setTimeout(() => setSuccess(false), 3000);
  };


  return (
    <div className="settings-section-content">
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

      <OtpModal 
        email="jane.doe@mechsketch.com"
        actionType="password_reset"
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onSuccess={finalizePasswordUpdate}
      />
    </div>
  );
}


function SecuritySettings() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const navigate = useNavigate();


  const handleLogout = () => {
    // Hide native modal and show generic OTP Modal instead
    setShowLogoutModal(false);
    setShowOtpModal(true);
  };
  
  const finishLogout = () => {
    navigate('/auth?view=login');
  };


  return (
    <div className="settings-section-content">
      <div className="settings-form">
        <div className="settings-toggle-group">
          <Toggle label="Two-Factor Authentication" checked={twoFactor} onChange={() => setTwoFactor(!twoFactor)} />
          <p className="settings-field-helper">Verify your identity using a secondary security method.</p>
        </div>

        <div className="settings-field">
          <h3 className="settings-subsection-title">Active Sessions</h3>
          <p className="settings-subsection-description">Manage where you’re currently logged in and sign out from other devices.</p>
          <div className="settings-placeholder">
            <p>No other active sessions found.</p>
          </div>
        </div>


        <div className="settings-field security-action-section">
          <button
            type="button"
            className="settings-button-danger-outline"
            onClick={() => setShowLogoutModal(true)}
          >
            Log out of all devices
          </button>
        </div>
      </div>


      {showLogoutModal && (
        <div className="settings-modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="settings-modal-title">Log out of all devices?</h3>
            <p className="settings-modal-text">
              You will be signed out of all active sessions on other devices. You'll need to log back in to access your account.
            </p>
            <div className="settings-modal-actions">
              <button
                type="button"
                className="settings-button-secondary"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="settings-button-danger"
                onClick={handleLogout}
              >
                Log out everywhere
              </button>
            </div>
          </div>
        </div>
      )}

      <OtpModal 
        email="jane.doe@mechsketch.com"
        actionType="security_action"
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onSuccess={finishLogout}
      />
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
    <div className="settings-section-content">
      <div className="settings-form">
        <div className="settings-toggle-group">
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


function AppearanceSettings() {
  const [theme, setTheme] = useState('system');
  const [spacing, setSpacing] = useState('comfortable');


  return (
    <div className="settings-section-content">
      <div className="settings-form">
        <div className="settings-field">
          <h3 className="settings-subsection-title">Theme</h3>
          <div className="settings-toggle-group">
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
        <div className="settings-field">
          <h3 className="settings-subsection-title">Spacing</h3>
          <div className="settings-toggle-group">
            <Toggle
              label="Compact"
              isRadio
              name="spacing"
              checked={spacing === 'compact'}
              onChange={() => setSpacing('compact')}
            />
            <Toggle
              label="Comfortable"
              isRadio
              name="spacing"
              checked={spacing === 'comfortable'}
              onChange={() => setSpacing('comfortable')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}


function HelpSupportSettings() {
  const navigate = useNavigate();


  const handleContact = () => {
    window.location.href = 'mailto:support@mechsketch.com';
  };


  const handleReportBug = () => {
    window.location.href = 'mailto:support@mechsketch.com?subject=Bug%20Report';
  };


  return (
    <div className="settings-section-content">
      <div className="settings-form">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sys-tokens-spacing-spacing-md)' }}>
          <button type="button" className="settings-button-secondary" onClick={handleContact} style={{ marginTop: 0 }}>
            Contact Support
          </button>
          <button type="button" className="settings-button-secondary" onClick={handleReportBug} style={{ marginTop: 0 }}>
            Report a Bug
          </button>
        </div>
        <p className="settings-support-text">
          <button
            className="settings-support-link"
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 'inherit' }}
            onClick={() => navigate('/faq')}
          >
            FAQs
          </button>
        </p>
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
  const [activeSection, setActiveSection] = useState<SectionType>('profile');
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/workspace');
    }
  };

  const activeConfig = SECTIONS.find(s => s.id === activeSection) || SECTIONS[0];

  return (
    <div className="settings-container">

      <div className="settings-layout">
        <div className="settings-back-wrapper">
          <button className="settings-back-button" onClick={handleBack}>
            <ArrowLeft size={16} />
            <span style={{ fontSize: '13px' }}>Back</span>
          </button>
        </div>
        <aside className="settings-sidebar">
          <nav className="settings-sidebar-nav">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                className={`settings-sidebar-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </aside>
        <main className="settings-main">
          <div className="settings-header">
            <h1 className="settings-title">{activeConfig.title}</h1>
            <p className="settings-subtitle">{activeConfig.subtitle}</p>
          </div>
          <div className="settings-content">
            <div className={`settings-panel ${activeSection === 'profile' ? 'active' : ''}`}><ProfileSettings /></div>
            <div className={`settings-panel ${activeSection === 'password' ? 'active' : ''}`}><PasswordSettings /></div>
            <div className={`settings-panel ${activeSection === 'security' ? 'active' : ''}`}><SecuritySettings /></div>
            <div className={`settings-panel ${activeSection === 'notifications' ? 'active' : ''}`}><NotificationsSettings /></div>
            <div className={`settings-panel ${activeSection === 'appearance' ? 'active' : ''}`}><AppearanceSettings /></div>
            <div className={`settings-panel ${activeSection === 'help' ? 'active' : ''}`}><HelpSupportSettings /></div>
          </div>
        </main>
      </div>
    </div>
  );
}



