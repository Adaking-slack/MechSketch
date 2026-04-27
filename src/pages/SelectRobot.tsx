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
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
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
            fontSize: '13px',
            lineHeight: '18px',
            color: '#374049',
            padding: 0
          }}
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

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px', zIndex: 30 }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, margin: '0 0 8px 0', color: '#374049' }}>
            Select a Robot
          </h1>
          <p style={{ fontSize: '18px', color: '#374049', margin: 0 }}>
            Choose a robot to start planning your task sequence
          </p>
        </div>
        <RobotCarousel />
      </div>
    </div>
  );
}
