import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Square, Play, Pause, RotateCcw, LogOut, Save, Home, Download, Settings } from 'lucide-react';

interface TopNavProps {
  projectName?: string;
  userName?: string;
  userInitial?: string;
  robotName?: string;
  objectName?: string;
  onProjectNameChange?: (name: string) => void;
  onSimulate?: () => void;
  onStop?: () => void;
  onStartNew?: () => void;
  onSave?: () => void;
  onHome?: () => void;
  onDeleteProject?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
  simulationMode?: boolean;
  simulationPaused?: boolean;
  simulationCompleted?: boolean;
  canSave?: boolean;
  onExport?: () => void;
  hasSequence?: boolean;
}

export default function TopNav({
  projectName = 'Untitled',
  userName: _userName = 'User',
  userInitial = 'U',
  robotName,
  objectName,
  onProjectNameChange,
  onSimulate,
  onStop,
  onStartNew,
  onSave,
  onHome,
  onDeleteProject,
  onSettings,
  onLogout,
  simulationMode = false,
  simulationPaused = false,
  simulationCompleted = false,
  canSave = false,
  onExport,
  hasSequence = false,
}: TopNavProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(projectName);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const fileMenuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  useEffect(() => {
    setName(projectName);
  }, [projectName]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (fileMenuRef.current && !fileMenuRef.current.contains(e.target as Node)) {
        setShowFileMenu(false);
      }
    };
    if (showUserMenu || showFileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu, showFileMenu]);

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
    navigate('/select-robot', { state: { flowType: 'editing' } });
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        {/* Left: File Menu */}
        <div style={styles.leftSection}>
          <div ref={fileMenuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowFileMenu(!showFileMenu)}
              style={styles.fileBtn}
              onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
            >
              File
              {showFileMenu ? <ChevronUp size={24} color="#374049" /> : <ChevronDown size={24} color="#374049" />}
            </button>
            {showFileMenu && (
              <div style={styles.dropdownMenu}>
                {onHome && (
                  <button
                    onClick={() => {
                      onHome();
                      setShowFileMenu(false);
                    }}
                    style={styles.fileDropdownItem}
                  >
                    <Home size={14} />
                    Home
                  </button>
                )}
                <button
                  onClick={() => {
                    if (hasSequence && onExport) {
                      onExport();
                      setShowFileMenu(false);
                    }
                  }}
                  style={{
                    ...styles.fileDropdownItem,
                    opacity: hasSequence ? 1 : 0.5,
                    cursor: hasSequence ? 'pointer' : 'not-allowed',
                  }}
                  disabled={!hasSequence}
                  title={hasSequence ? "Export as JSON" : "No sequence to export"}
                >
                  <Download size={14} />
                  Export
                </button>
                {onDeleteProject && (
                  <button
                    onClick={() => {
                      onDeleteProject();
                      setShowFileMenu(false);
                    }}
                    style={{ ...styles.fileDropdownItem, color: '#dc2626' }}
                  >
                    Delete Project
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Center: Project Name */}
        <div style={styles.centerSection}>
          <div style={styles.projectNameContainer}>
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
                onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
              >
                {projectName}
              </button>
            )}
          </div>
        </div>

        {/* Right: Actions & Profile */}
        <div style={styles.rightSection}>
          {simulationMode && (
            <button
              onClick={onStop}
              style={styles.stopBtn}
              onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
            >
              <Square size={12} style={{ marginRight: '4px' }} />
              Stop
            </button>
          )}

          {(canSave || simulationMode) && onSave && (
            <button
              onClick={onSave}
              style={styles.saveBtn}
              onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
            >
              <Save size={12} style={{ marginRight: '4px' }} />
              Save
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
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
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
            <button
              onClick={onStartNew}
              style={styles.startNewBtn}
              onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
            >
              <RotateCcw size={12} style={{ marginRight: '4px' }} />
              Start New
            </button>
          )}

          <button
            onClick={handleRobotObjectClick}
            style={styles.robotObjectBtn}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            <span>{robotName || 'No robot selected'}</span>
            <span style={styles.separator}>/</span>
            <span>{objectName || 'No object selected'}</span>
          </button>

          <div style={{ position: 'relative' }} ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={styles.userSection}
              onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
            >
              <div style={styles.avatar}>{userInitial}</div>
              {showUserMenu ? <ChevronUp size={24} color="#000000" /> : <ChevronDown size={24} color="#000000" />}
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
                  style={styles.dropdownItem}
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
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
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
  fileBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px', // 4-8px spacing requested
    padding: '6px 10px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#374049',
    fontSize: '15px',
    lineHeight: '23px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: '4px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    border: '1px solid #e2e8f0',
    minWidth: '160px',
    zIndex: 100,
    overflow: 'hidden',
  },
  fileDropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '10px 14px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#374049',
    fontSize: '14px',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  },
  centerSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  projectNameContainer: {
    backgroundColor: '#F6F7F9',
    padding: '4px 12px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '300px',
  },
  projectNameBtn: {
    fontSize: '15px',
    lineHeight: '23px',
    color: '#374049',
    fontWeight: 600,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    transition: 'opacity 0.15s',
  },
  input: {
    fontSize: '15px',
    lineHeight: '23px',
    color: '#374049',
    fontWeight: 600,
    border: 'none',
    background: 'transparent',
    outline: 'none',
    width: '100%',
    textAlign: 'center',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '16px',
  },
  robotObjectBtn: {
    backgroundColor: '#ffffffff',
    color: '#001529',
    fontSize: '13px',
    lineHeight: '18px',
    fontWeight: 600,
    border: '1px solid #EAEAEA',
    cursor: 'pointer',
    padding: '6px 12px',
    borderRadius: '6px',
    transition: 'opacity 0.15s',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  separator: {
    color: '#00857A',
    fontWeight: 600,
  },
  simulateBtn: {
    color: '#ECF5FE',
    fontSize: '13px',
    lineHeight: '18px',
    fontWeight: 500,
    border: 'none',
    borderRadius: '6px',
    padding: '6px 12px',
    cursor: 'pointer',
    transition: 'opacity 0.15s',
    display: 'flex',
    alignItems: 'center',
  },
  stopBtn: {
    backgroundColor: '#DC2626',
    color: '#FFFFFF',
    fontSize: '13px',
    lineHeight: '18px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '6px',
    padding: '6px 12px',
    cursor: 'pointer',
    transition: 'opacity 0.15s',
    display: 'flex',
    alignItems: 'center',
  },
  saveBtn: {
    backgroundColor: '#10B981',
    color: '#FFFFFF',
    fontSize: '13px',
    lineHeight: '18px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '6px',
    padding: '6px 12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'opacity 0.15s',
  },
  startNewBtn: {
    backgroundColor: '#EF4444',
    color: '#FFFFFF',
    fontSize: '13px',
    lineHeight: '18px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '6px',
    padding: '6px 12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'opacity 0.15s',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px', // 6-10px spacing
    cursor: 'pointer',
    backgroundColor: 'transparent',
    border: 'none',
    padding: '0',
    transition: 'opacity 0.15s',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#000000',
    color: '#FFFFFF',
    fontSize: '18px',
    lineHeight: '18px',
    fontWeight: 300,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '12px',
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