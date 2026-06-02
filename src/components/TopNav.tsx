import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Square, Play, Pause, RotateCcw, LogOut, Save, Home, Download, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './TopNav.css';

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
  const [currentUserInitial, setCurrentUserInitial] = useState(userInitial);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email) {
        setCurrentUserInitial(user.email.charAt(0).toUpperCase());
      }
    };
    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        setCurrentUserInitial(session.user.email.charAt(0).toUpperCase());
      } else {
        setCurrentUserInitial(userInitial);
      }
    });

    return () => subscription.unsubscribe();
  }, [userInitial]);

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
    <nav className="top-nav">
      <div className="top-nav-container">
        {/* Left: Project Name and File Menu */}
        <div className="top-nav-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
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
                className="top-nav-input"
                style={{ textAlign: 'left' }}
              />
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="top-nav-project-name"
                title="Click to edit project name"
              >
                {projectName}
              </button>
            )}

            <div ref={fileMenuRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <button
                onClick={() => setShowFileMenu(!showFileMenu)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
              >
                {showFileMenu ? <ChevronUp size={20} color="#374049" /> : <ChevronDown size={20} color="#374049" />}
              </button>
              {showFileMenu && (
                <div className="top-nav-dropdown" style={{ top: '100%', left: '0', marginTop: '4px' }}>
                  {onHome && (
                    <button
                      onClick={() => {
                        onHome();
                        setShowFileMenu(false);
                      }}
                      className="top-nav-dropdown-item"
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
                    className="top-nav-dropdown-item"
                    style={{
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
                      className="top-nav-dropdown-item"
                      style={{ color: '#dc2626' }}
                    >
                      Delete Project
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center: Simulation Controls */}
        <div className="top-nav-center">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {simulationMode && (
              <button
                onClick={onStop}
                className="top-nav-button top-nav-stop-btn"
              >
                <Square size={12} />
                <span>Stop</span>
              </button>
            )}

            {(canSave || simulationMode) && onSave && (
              <button
                onClick={onSave}
                className="top-nav-button top-nav-save-btn"
              >
                <Save size={12} />
                <span>Save</span>
              </button>
            )}

            <button
              onClick={onSimulate}
              className="top-nav-button top-nav-simulate-btn"
              style={{
                backgroundColor: simulationMode
                  ? (simulationPaused ? '#10B981' : '#F59E0B')
                  : '#00376E',
              }}
            >
              {simulationMode ? (
                simulationPaused ? (
                  <>
                    <Play size={12} />
                    <span>Resume</span>
                  </>
                ) : (
                  <>
                    <Pause size={12} />
                    <span>Pause</span>
                  </>
                )
              ) : (
                <>
                  <Play size={12} className="desktop-only" style={{ display: 'none' }} />
                  <span>Simulate</span>
                </>
              )}
            </button>

            {!simulationMode && simulationCompleted && (
              <button
                onClick={onStartNew}
                className="top-nav-button top-nav-start-new-btn"
              >
                <RotateCcw size={12} />
                <span>Start New</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Actions & Profile */}
        <div className="top-nav-right">
          <button
            onClick={handleRobotObjectClick}
            className="top-nav-robot-object-btn"
          >
            <span>{robotName || 'No robot'}</span>
            <span className="top-nav-separator">/</span>
            <span>{objectName || 'No object'}</span>
          </button>

          <div style={{ position: 'relative' }} ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="top-nav-user-section"
            >
              <div className="top-nav-avatar">{currentUserInitial}</div>
              {showUserMenu ? <ChevronUp size={24} color="#000000" /> : <ChevronDown size={24} color="#000000" />}
            </button>

            {showUserMenu && (
              <div className="top-nav-dropdown">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onSettings?.();
                  }}
                  className="top-nav-dropdown-item"
                >
                  <Settings size={16} />
                  <span>Settings</span>
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout?.();
                  }}
                  className="top-nav-dropdown-item"
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