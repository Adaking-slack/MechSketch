import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { Robot } from '../data/robots.data';
import { loadSelectedRobot, saveProjectName } from '../utils/robotStorage';

export default function Planner() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedRobot = (location.state?.selectedRobot as Robot) || loadSelectedRobot();

  const [projectName, setProjectName] = useState("Untitled");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-select the "Untitled" text on mount
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

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
          onBlur={(e) => e.target.style.backgroundColor = '#e6e6e6'}
        />

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
