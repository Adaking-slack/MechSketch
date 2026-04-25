import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2, ChevronDown, Square, Play, Pause, RotateCcw, Settings, LogOut } from 'lucide-react';

interface TopNavProps {
  projectName?: string;
  userName?: string;
  userInitial?: string;
  robotName?: string;
  objectName?: string;
  onProjectNameChange?: (name: string) => void;
  onSimulate?: () => void;
  onShare?: () => void;
  onStop?: () => void;
  onStartNew?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
  simulationMode?: boolean;
  simulationPaused?: boolean;
  simulationCompleted?: boolean;
}

export default function TopNav({
  projectName = 'Untitled',
  userName: _userName = 'User',
  userInitial = 'U',
  robotName,
  objectName,
  onProjectNameChange,
  onSimulate,
  onShare,
  onStop,
  onStartNew,
  onSettings,
  onLogout,
  simulationMode = false,
  simulationPaused = false,
  simulationCompleted = false,
}: TopNavProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(projectName);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showUserMenu]);

  const handleNameSubmit = () => {
    setEditing(false);
    if (name.trim() && name !== projectName) {
      onProjectNameChange?.(name.trim());
    } else if (!name.trim()) {
      setName(projectName);
    }
  };

  const handleRobotObjectClick = () => {
    navigate('/select-robot');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        {/* Left: Project Name */}
        <div style={styles.leftSection}>
          {editing ? (
            <input
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNameSubmit();
                if (e.key === 'Escape') {
                  setName(projectName);
                  setEditing(false);
                }
              }}
              style={styles.input}
            />
          ) : (
            <button
              onClick={() => setEditing(true)}
              style={styles.projectNameBtn}
              title="Click to edit project name"
            >
              {projectName}
            </button>
          )}
        </div>

        {/* Center: Robot/Object Name */}
        <div style={styles.centerSection}>
          {(robotName || objectName) ? (
            <button onClick={handleRobotObjectClick} style={styles.robotObjectBtn}>
              {robotName && <span style={styles.robotObjectName}>{robotName}</span>}
              {robotName && objectName && <span style={styles.separator}>/</span>}
              {objectName && <span style={styles.robotObjectName}>{objectName}</span>}
            </button>
          ) : (
            <span style={styles.noSelection}>No robot selected</span>
          )}
        </div>

        {/* Right: Simulate, Share, User */}
        <div style={styles.rightSection}>
          {simulationMode && (
            <button
              onClick={onStop}
              style={{
                ...styles.stopBtn,
              }}
            >
              <Square size={12} />
              Stop
            </button>
          )}

          <button
            onClick={onSimulate}
            style={{
              ...styles.simulateBtn,
              backgroundColor: simulationMode
                ? (simulationPaused ? '#10B981' : '#F59E0B')
                : '#00376E',
            }}
          >
            {simulationMode ? (
              simulationPaused ? (
                <>
                  <Play size={12} style={{ marginRight: '4px' }} />
                  Resume
                </>
              ) : (
                <>
                  <Pause size={12} style={{ marginRight: '4px' }} />
                  Pause
                </>
              )
            ) : (
              'Simulate'
            )}
          </button>

          {!simulationMode && simulationCompleted && (
            <button onClick={onStartNew} style={styles.startNewBtn}>
              <RotateCcw size={12} style={{ marginRight: '4px' }} />
              Start New
            </button>
          )}

          {!simulationMode && (
            <button onClick={onShare} style={styles.shareBtn}>
              <Share2 size={14} style={styles.shareIcon} />
              Share
            </button>
          )}

          <div style={{ position: 'relative' }} ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={styles.userSection}
            >
              <div style={styles.avatar}>{userInitial}</div>
              <ChevronDown size={18} style={styles.chevron} />
            </button>

            {showUserMenu && (
              <div style={styles.userDropdown}>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onSettings?.();
                  }}
                  style={styles.dropdownItem}
                >
                  <Settings size={16} />
                  <span>Settings</span>
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout?.();
                  }}
                  style={{ ...styles.dropdownItem, borderTop: '1px solid #e2e8f0' }}
                >
                  <LogOut size={16} />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    width: '100%',
    height: '56px',
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #E2E8F0',
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
    padding: '0 24px',
  },
leftSection: {
    display: 'flex',
    alignItems: 'center',
  },
centerSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: '8px',
  },
  projectNameBtn: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontSize: '14px',
    lineHeight: '20px',
    color: '#374049',
    fontWeight: 500,
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '6px',
    cursor: 'pointer',
    padding: '6px 12px',
    transition: 'all 0.15s',
  },
  input: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontSize: '14px',
    lineHeight: '20px',
    color: '#374049',
    fontWeight: 500,
    border: '1px solid #00376E',
    borderRadius: '6px',
    padding: '6px 12px',
    outline: 'none',
    width: '150px',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  robotObjectBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px 12px',
    borderRadius: '6px',
    transition: 'background-color 0.15s',
  },
  robotObjectName: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontSize: '14px',
    fontWeight: 600,
    color: '#00376E',
  },
  separator: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontSize: '14px',
    fontWeight: 400,
    color: '#888',
  },
  noSelection: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontSize: '14px',
    color: '#888',
    fontStyle: 'italic',
  },
  simulateBtn: {
    color: '#FFFFFF',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontSize: '13px',
    lineHeight: '18px',
    fontWeight: 500,
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  },
  stopBtn: {
    backgroundColor: '#DC2626',
    color: '#FFFFFF',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontSize: '13px',
    lineHeight: '18px',
    fontWeight: 500,
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    cursor: 'pointer',
    transition: 'opacity 0.15s',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  shareBtn: {
    backgroundColor: '#F3F4F6',
    color: '#374049',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontSize: '13px',
    lineHeight: '18px',
    fontWeight: 500,
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'background-color 0.15s',
  },
  shareIcon: {
    flexShrink: 0,
  },
  startNewBtn: {
    backgroundColor: '#EF4444',
    color: '#FFFFFF',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontSize: '13px',
    lineHeight: '18px',
    fontWeight: 500,
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'background-color 0.15s',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
    marginLeft: '4px',
    backgroundColor: 'transparent',
    border: 'none',
    padding: '4px',
    borderRadius: '6px',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#0D9488',
    color: '#FFFFFF',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontSize: '13px',
    lineHeight: '18px',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    color: '#374049',
  },
  userDropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '8px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    border: '1px solid #e2e8f0',
    minWidth: '160px',
    overflow: 'hidden',
    zIndex: 100,
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '12px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: 0,
    fontSize: '14px',
    fontWeight: 500,
    color: '#374049',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 0.15s',
  },
};