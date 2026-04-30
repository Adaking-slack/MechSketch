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
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
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
          gap: '8px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '13px',
          lineHeight: '18px',
          color: '#374049',
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
        minHeight: '100%',
        paddingTop: '15vh',
        display: 'flex',
        flexDirection: 'column'
      }}>

        <style>{`
          .project-name-input::placeholder {
            color: #656768;
            font-size: 13px;
            line-height: 8px;
          }
        `}</style>

        {/* Top Centered Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          width: '380px',
          margin: '0 auto'
        }}>
          <h2 style={{
            fontSize: '15px',
            lineHeight: '23px',
            fontWeight: 400,
            color: '#001529',
            margin: '0 0 12px 0'
          }}>
            Input your project name
          </h2>

          <input
            ref={inputRef}
            placeholder="Untitled"
            className="project-name-input"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            style={{
              width: '100%',
              height: '46px',
              padding: '0 16px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '15px',
              fontWeight: 500,
              color: '#1a1a1a',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />

          <button
            style={{
              width: '100%',
              height: '46px',
              marginTop: '24px',
              backgroundColor: '#00376E',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'opacity 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
            onClick={() => {
              saveProjectName(projectName || 'Untitled');
              navigate('/home');
            }}
          >
            Continue
          </button>
        </div>

        {/* Recently Saved Section */}
        <div style={{
          marginTop: '100px',
          paddingLeft: '32px',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <h3 style={{ fontSize: '18px', lineHeight: '25px', fontWeight: 500, color: '#374049', margin: '0 0 20px 0', letterSpacing: '-0.3px' }}>
            Recently saved
          </h3>

          {savedSimulations.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 260px)', gap: '24px 24px', paddingBottom: '20px', maxWidth: '1112px' }}>
              {savedSimulations.map(sim => (
                <div
                  key={sim.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                  }}
                  onClick={() => {
                    saveProjectName(projectName || 'Untitled');
                    sessionStorage.setItem('mechsketch_load_simulation', JSON.stringify(sim));
                    sessionStorage.setItem('mechsketch_load_simulation_id', sim.id);
                    navigate('/home');
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div
                    style={{
                      width: '260px',
                      height: '260px',
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
                    }}
                  >
                    <div style={{ pointerEvents: 'none', width: '100%', height: '100%', backgroundColor: '#f0f4f8' }}>
                      <img
                        src={sim.thumbnail || "https://placehold.co/260x260/e2e8f0/a0aec0?text=No+Thumbnail"}
                        alt={`${sim.name} thumbnail`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', color: '#1a1a1a', marginTop: '16px', letterSpacing: '-0.2px', fontWeight: 500 }}>
                    {sim.name}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              width: '100%',
              textAlign: 'center',
              marginTop: '100px',
              marginLeft: '-32px'
            }}>
              <span style={{ fontSize: '15px', lineHeight: '23px', color: '#374049', fontWeight: 500 }}>
                No recently saved project
              </span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
