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
      minHeight: '100vh',
      backgroundColor: 'var(--sys-colors-surfaces-surface-secondary, #f5f5f5)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      overflowX: 'hidden',
      overflowY: 'auto'
    }}>
      {/* Top Navigation & Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        padding: '24px 32px',
        zIndex: 30
      }}>
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              lineHeight: '18px',
              color: '#374049',
              padding: 0
            }}
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-1px', margin: '0 0 8px 0', color: '#374049' }}>
            Select a Robot
          </h1>
          <p style={{ fontSize: '15px', fontWeight: 400, color: '#374049', margin: 0 }}>
            Choose a robot to start planning your task sequence
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleSkip}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              lineHeight: '18px',
              color: '#374049',
              padding: 0,
              fontWeight: 500
            }}
          >
            Skip
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'visible' }}>
        <RobotCarousel />
      </div>
    </div>
  );
}
