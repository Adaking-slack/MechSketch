import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import RobotCarousel from '../components/RobotCarousel';
import { clearSelectedRobot } from '../utils/robotStorage';

export default function SelectRobot() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSkip = useCallback(() => {
    clearSelectedRobot();
    navigate('/select-object', {
      state: {
        flowType: location.state?.flowType
      }
    });
  }, [navigate, location.state?.flowType]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: 'var(--sys-colors-surfaces-surface-secondary, #f5f5f5)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--sys-typography-font-family-font-sans-serif), -apple-system, sans-serif'
    }}>
      {/* Top Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 32px'
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 'var(--sys-typography-size-13, 13px)',
            lineHeight: '18px',
            color: 'var(--sys-primitives-colors-neutral-neutral-800)',
            padding: 0
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
          onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <button
          onClick={handleSkip}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 'var(--sys-typography-size-13, 13px)',
            lineHeight: '18px',
            color: 'var(--sys-primitives-colors-neutral-neutral-800)',
            padding: 0,
            fontWeight: 500
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
          onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
        >
          Skip
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--sys-tokens-spacing-spacing-xl)', zIndex: 30 }}>
          <h1 style={{ 
            fontSize: 'var(--sys-typography-size-28, 28px)', 
            fontWeight: 700, 
            margin: '0 0 var(--sys-tokens-spacing-spacing-xxs) 0', 
            color: 'var(--sys-primitives-colors-neutral-neutral-900)',
            letterSpacing: '-0.5px'
          }}>
            Select a Robot
          </h1>
          <p style={{ 
            fontSize: 'var(--sys-typography-size-15, 15px)', 
            color: 'var(--sys-primitives-colors-neutral-neutral-600)', 
            margin: 0,
            lineHeight: '1.5'
          }}>
            Choose a robot to start planning your task sequence
          </p>
        </div>
        <RobotCarousel />
      </div>
    </div>
  );
}
