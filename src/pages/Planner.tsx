import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import type { Robot } from '../data/robots.data';

export default function Planner() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedRobot = location.state?.selectedRobot as Robot;
  
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
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--sys-colors-surfaces-surface-secondary, #f5f5f5)' }}>
        <p style={{ marginBottom: '16px' }}>No robot selected for planning.</p>
        <button 
          onClick={() => navigate('/')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#1a1a1a',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
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
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: 'var(--sys-colors-surfaces-surface-secondary, #f5f5f5)',
      overflow: 'hidden'
    }}>
      <main style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        backgroundColor: 'var(--sys-colors-surfaces-surface-primary, #ffffff)',
        padding: '48px',
        borderRadius: '24px',
        boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
        border: '1px solid var(--sys-colors-borders-border-primary, #e0e0e0)',
        width: '420px',
        maxWidth: '90%'
      }}>
        
        {/* 1. Project Name */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px', width: '100%' }}>
          <label style={{ 
            fontSize: '12px', 
            fontWeight: 600, 
            color: 'var(--sys-colors-text-text-secondary, #888)',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Project Name
          </label>
          <input 
            ref={inputRef}
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            style={{ 
              border: '1px solid var(--sys-colors-borders-border-primary, #e0e0e0)', 
              outline: 'none', 
              fontSize: '16px', 
              fontWeight: 600, 
              backgroundColor: 'var(--sys-colors-surfaces-surface-secondary, #fafafa)',
              color: 'var(--sys-colors-text-text-primary, #1a1a1a)',
              padding: '14px 16px',
              borderRadius: '12px',
              width: '100%',
              textAlign: 'center',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s, background-color 0.2s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--sys-color-roles-primary-roles-primary, #00376e)';
              e.target.style.backgroundColor = '#ffffff';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--sys-colors-borders-border-primary, #e0e0e0)';
              e.target.style.backgroundColor = 'var(--sys-colors-surfaces-surface-secondary, #fafafa)';
            }}
          />
        </div>

        {/* 2. Selected Robot */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px', width: '100%' }}>
          <label style={{ 
            fontSize: '12px', 
            fontWeight: 600, 
            color: 'var(--sys-colors-text-text-secondary, #888)',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Selected Robot
          </label>
          <div style={{
            width: '100%',
            padding: '14px 16px',
            backgroundColor: 'var(--sys-colors-surfaces-surface-secondary, #fafafa)',
            borderRadius: '12px',
            textAlign: 'center',
            fontSize: '16px',
            fontWeight: 500,
            color: 'var(--sys-colors-text-text-primary, #1a1a1a)',
            border: '1px solid transparent',
            boxSizing: 'border-box'
          }}>
            {selectedRobot.name}
          </div>
        </div>

        {/* 3. Task Sequence */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px', width: '100%' }}>
          <label style={{ 
            fontSize: '12px', 
            fontWeight: 600, 
            color: 'var(--sys-colors-text-text-secondary, #888)',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Task Sequence
          </label>
          <button style={{
            width: '100%',
            padding: '14px',
            backgroundColor: 'transparent',
            border: '1px dashed #ccc',
            borderRadius: '12px',
            color: 'var(--sys-colors-text-text-secondary, #666)',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.2s, border-color 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--sys-colors-surfaces-surface-secondary, #fafafa)';
            e.currentTarget.style.borderColor = '#999';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = '#ccc';
          }}
          >
            + Add Step
          </button>
        </div>

        {/* 4. Action Area */}
        <button style={{
          width: '100%',
          padding: '16px',
          backgroundColor: 'var(--sys-color-roles-primary-roles-primary, #00376e)',
          color: 'var(--sys-color-roles-primary-roles-on-primary, #ffffff)',
          border: 'none',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'background-color 0.2s, transform 0.1s, box-shadow 0.2s',
          boxShadow: '0 4px 12px rgba(0, 55, 110, 0.2)'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--sys-primitives-colors-primary-primary-600, #012950)';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 55, 110, 0.3)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--sys-color-roles-primary-roles-primary, #00376e)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 55, 110, 0.2)';
        }}
        >
          Save & Continue
        </button>
      </main>
    </div>
  );
}
