import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import RobotCarousel from '../components/RobotCarousel';
import { clearSelectedRobot } from '../utils/robotStorage';
import './Selection.css';

export default function SelectRobot() {
  const navigate = useNavigate();

  const handleSkip = useCallback(() => {
    clearSelectedRobot();
    navigate('/home');
  }, [navigate]);

  return (
    <div className="selection-container">
      {/* Top Navigation & Header */}
      <div className="selection-header">
        <div className="selection-header-left">
          <button
            onClick={() => navigate(-1)}
            className="back-btn"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>

        <div className="selection-header-center">
          <h1 className="selection-title">
            Select a Robot
          </h1>
          <p className="selection-subtitle">
            Choose a robot to start planning your task sequence
          </p>
        </div>

        <div className="selection-header-right">
          <button
            onClick={handleSkip}
            className="skip-btn"
          >
            Skip
          </button>
        </div>
      </div>

      <div className="selection-content">
        <RobotCarousel />
      </div>
    </div>
  );
}
