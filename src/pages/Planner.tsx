import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { Robot } from '../data/robots.data';
import { loadSelectedRobot, saveProjectName } from '../utils/robotStorage';
import { loadSavedSimulations, type SavedSimulation } from '../utils/simState';


export default function Planner() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedRobot = (location.state?.selectedRobot as Robot) || loadSelectedRobot();

  const [projectName, setProjectName] = useState("");
  const [savedSimulations, setSavedSimulations] = useState<SavedSimulation[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    setSavedSimulations(loadSavedSimulations());
  }, []);

  if (!selectedRobot) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f7f8f9' }}>
        <p style={{ marginBottom: '16px' }}>No robot selected for planning.</p>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '12px 120px',
            backgroundColor: '#00376E',
            color: '#ECF5FE',
            border: 'none',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Select a Robot
        </button>
      </div>
    );
  }

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      backgroundColor: '#f7f8f9',
      position: 'relative',
      fontFamily: 'var(--sys-typography-font-family-font-sans-serif), -apple-system, sans-serif',
      overflowY: 'auto',
      overflowX: 'hidden'
    }}>
      {/* Back Button */}
      <button
        onClick={() => navigate('/select-robot')}
        style={{
          position: 'absolute',
          top: '24px',
          left: '32px',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--sys-tokens-spacing-spacing-xs)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 'var(--sys-typography-size-13, 13px)',
          lineHeight: '18px',
          color: 'var(--sys-primitives-colors-neutral-neutral-800)',
          padding: 0,
          zIndex: 10
        }}
        onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
        onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Main Container */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        padding: '24px'
      }}>

        {/* Action Flow Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: '480px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              margin: '0 0 var(--sys-tokens-spacing-spacing-xxs) 0',
              fontSize: 'var(--sys-typography-size-28, 28px)',
              lineHeight: '1.2',
              letterSpacing: '-0.5px',
              fontWeight: 700,
              color: 'var(--sys-primitives-colors-neutral-neutral-900)',
            }}>
              Name your project
            </h1>
            <p style={{
              margin: '0 0 var(--sys-tokens-spacing-spacing-xl) 0',
              fontSize: 'var(--sys-typography-size-15, 15px)',
              lineHeight: '1.5',
              color: 'var(--sys-primitives-colors-neutral-neutral-600)',
            }}>
              Give your project a name to get started
            </p>
          </div>

          <div style={{ width: '100%' }}>
            <input
              ref={inputRef}
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. My First Robot Task"
              style={{
                width: '100%',
                height: '48px',
                padding: '0 var(--sys-tokens-spacing-spacing-md)',
                backgroundColor: 'var(--sys-primitives-colors-base-white)',
                border: '1px solid var(--sys-primitives-colors-neutral-neutral-200)',
                borderRadius: 'var(--sys-tokens-radius-radius-xs)',
                fontSize: 'var(--sys-typography-size-15)',
                fontWeight: 500,
                color: 'var(--sys-primitives-colors-neutral-neutral-900)',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s ease',
                cursor: 'text'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--sys-primitives-colors-primary-primary-400)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--sys-primitives-colors-neutral-neutral-200)'}
            />

            <button
              style={{
                width: '100%',
                height: '48px',
                marginTop: 'var(--sys-tokens-spacing-spacing-md)',
                backgroundColor: 'var(--sys-primitives-colors-primary-primary-500)',
                color: 'var(--sys-primitives-colors-base-white)',
                border: 'none',
                borderRadius: 'var(--sys-tokens-radius-radius-xs)',
                fontSize: 'var(--sys-typography-size-15)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
              onClick={() => {
                saveProjectName(projectName || 'Untitled');
                navigate('/home');
              }}
            >
              Continue to workspace
            </button>
          </div>
        </div>

        {/* Recently Saved Section */}
        <div style={{
          marginTop: 'var(--sys-tokens-spacing-spacing-2xl)',
          width: '100%',
          maxWidth: '480px',
          boxSizing: 'border-box'
        }}>
          <h3 style={{ 
            fontSize: 'var(--sys-typography-size-13)', 
            fontWeight: 500, 
            color: 'var(--sys-primitives-colors-neutral-neutral-500)', 
            margin: '0 0 var(--sys-tokens-spacing-spacing-xxs) 0', 
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Recently saved
          </h3>

          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            width: '100%'
          }}>
            {savedSimulations.length > 0 ? (
              savedSimulations.map(sim => (
                <div 
                  key={sim.id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    padding: 'var(--sys-tokens-spacing-spacing-xs) var(--sys-tokens-spacing-spacing-xxs)',
                    borderBottom: '1px solid var(--sys-primitives-colors-neutral-neutral-200)',
                    transition: 'background-color 0.2s ease',
                    borderRadius: 'var(--sys-tokens-radius-radius-xxs)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--sys-primitives-colors-neutral-netural-100)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={() => {
                    saveProjectName(projectName || 'Untitled');
                    sessionStorage.setItem('mechsketch_load_simulation', JSON.stringify(sim));
                    sessionStorage.setItem('mechsketch_load_simulation_id', sim.id);
                    navigate('/home');
                  }}
                >
                  <div style={{ 
                    fontSize: 'var(--sys-typography-size-15)', 
                    color: 'var(--sys-primitives-colors-neutral-neutral-700)', 
                    fontWeight: 500 
                  }}>
                    {sim.name}
                  </div>
                  <div style={{
                    fontSize: 'var(--sys-typography-size-13)',
                    color: 'var(--sys-primitives-colors-neutral-neutral-500)',
                  }}>
                    {sim.updatedAt || sim.savedAt ? `Edited ${new Date(sim.updatedAt || sim.savedAt).toLocaleDateString()}` : 'Unknown date'}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ 
                fontSize: 'var(--sys-typography-size-13)', 
                color: 'var(--sys-primitives-colors-neutral-neutral-500)',
                textAlign: 'left',
                paddingTop: 'var(--sys-tokens-spacing-spacing-xxs)',
                opacity: 0.8
              }}>
                No projects yet
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
