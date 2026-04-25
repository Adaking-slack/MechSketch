import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { Robot } from '../data/robots.data';
import { loadSelectedRobot, saveProjectName } from '../utils/robotStorage';
import { loadSavedSimulationsForProject, getAllProjectNames, type SavedSimulation } from '../utils/simState';

export default function Planner() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedRobot = (location.state?.selectedRobot as Robot) || loadSelectedRobot();

  const [projectName, setProjectName] = useState("Untitled");
  const [savedSimulations, setSavedSimulations] = useState<SavedSimulation[]>([]);
  const [allProjects, setAllProjects] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  useEffect(() => {
    setSavedSimulations(loadSavedSimulationsForProject(projectName));
    setAllProjects(getAllProjectNames());
  }, [projectName]);

  if (!selectedRobot) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
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
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Back Button */}
      <button 
        onClick={() => navigate('/select-robot')}
        style={{
          position: 'absolute',
          top: '48px',
          left: '48px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'none',
          border: 'none',
          fontSize: '15px',
          fontWeight: 600,
          color: '#1a1a1a',
          cursor: 'pointer',
          padding: 0
        }}
        onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
        onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
      >
        <ArrowLeft size={20} strokeWidth={2.5} />
        Back
      </button>

      {/* Center Form Content */}
      <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h2 style={{
          width: '380px',
          textAlign: 'left',
          fontSize: '20px',
          fontWeight: 700,
          color: '#2d3748',
          margin: '0 0 16px 0',
          letterSpacing: '-0.3px'
        }}>
          Input Project name
        </h2>

        <input
          ref={inputRef}
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Untitled"
          style={{
            width: '380px',
            padding: '16px 20px',
            backgroundColor: '#e6e6e6', // Matches the light grey input in design
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 500,
            color: '#1a1a1a',
            outline: 'none',
            marginBottom: '24px',
            transition: 'background-color 0.2s ease',
            boxSizing: 'border-box'
          }}
          onFocus={(e) => e.target.style.backgroundColor = '#dedede'}
          onBlur={(e) => {
            e.target.style.backgroundColor = '#e6e6e6';
            setSavedSimulations(loadSavedSimulationsForProject(projectName));
          }}
        />

        <div style={{ width: '380px', marginTop: '32px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#4a5568', marginBottom: '12px' }}>
            Saved Work
          </h3>
          
          {savedSimulations.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#718096', margin: 0 }}>
              No saved work yet. Start building a simulation and save it to see it here.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {savedSimulations.map(sim => (
                <div
                  key={sim.id}
                  onClick={() => {
                    saveProjectName(projectName || 'Untitled');
                    sessionStorage.setItem('mechsketch_load_simulation', JSON.stringify(sim));
                    sessionStorage.setItem('mechsketch_load_simulation_id', sim.id);
                    navigate('/home');
                  }}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = '#cbd5e0'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                >
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#2d3748' }}>
                    {sim.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#718096', marginTop: '4px' }}>
                    {new Date(sim.savedAt).toLocaleString()} · {sim.sequenceBlocks.length} action{sim.sequenceBlocks.length !== 1 ? 's' : ''} · {sim.targets.length} target{sim.targets.length !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {allProjects.length > 0 && (
          <div style={{ width: '380px', marginTop: '32px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#4a5568', marginBottom: '12px' }}>
              All Projects
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {allProjects.map(name => (
                <div
                  key={name}
                  onClick={() => setProjectName(name)}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: name === projectName ? '#f0f7ff' : '#ffffff',
                    border: '1px solid',
                    borderColor: name === projectName ? '#00376E' : '#e2e8f0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    if (name !== projectName) e.currentTarget.style.borderColor = '#cbd5e0';
                  }}
                  onMouseOut={(e) => {
                    if (name !== projectName) e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#2d3748' }}>
                    {name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button 
          style={{
            padding: '12px 120px',
            backgroundColor: '#00376E',
            color: '#ECF5FE',
            border: 'none',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: 600,
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
    </div>
  );
}
