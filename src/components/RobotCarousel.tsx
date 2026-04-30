import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { robotsData } from '../data/robots.data';
import RobotCard from './RobotCard';
import { saveSelectedRobot } from '../utils/robotStorage';

export default function RobotCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Create an extended array for buffering transitions
  const extendedRobots = [...robotsData, ...robotsData, ...robotsData];

  const handleSelect = useCallback((robot: typeof robotsData[0]) => {
    saveSelectedRobot(robot);
    navigate('/select-object', { 
      state: { 
        selectedRobot: robot,
        flowType: location.state?.flowType
      } 
    });
  }, [navigate, location.state?.flowType]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % extendedRobots.length);
  }, []);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + extendedRobots.length) % extendedRobots.length);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  // Calculate shortest path offset for circular layout
  const getOffset = (index: number, currentActive: number, total: number) => {
    let diff = index - currentActive;
    if (diff > Math.floor(total / 2)) {
      diff -= total;
    } else if (diff < -Math.floor(total / 2)) {
      diff += total;
    }
    return diff;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', justifyContent: 'center' }}>
      
      {/* Container for the cards */}
      <div style={{ position: 'relative', width: '100%', height: '600px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {extendedRobots.map((robot, i) => {
          const offset = getOffset(i, activeIndex, extendedRobots.length);
          return (
            <RobotCard 
              key={`${robot.id}-${i}`}
              robot={robot}
              isActive={i === activeIndex}
              offset={offset}
              onSelect={() => handleSelect(robot)}
            />
          );
        })}

        {/* Navigation Buttons */}
        <button 
          onClick={handlePrev}
          aria-label="Previous robot"
          style={{ 
            position: 'absolute', 
            left: '10%', 
            zIndex: 20, 
            padding: '16px', 
            borderRadius: '50%', 
            border: 'none', 
            background: 'var(--sys-colors-surfaces-surface-primary, #ffffff)', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
            cursor: 'pointer', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s cubic-bezier(0.25, 0.1, 0.25, 1), background-color 0.2s ease',
            color: 'var(--sys-colors-text-text-primary, #1a1a1a)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--sys-colors-surfaces-surface-primary, #ffffff)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <ChevronLeft />
        </button>
        <button 
          onClick={handleNext}
          aria-label="Next robot"
          style={{ 
            position: 'absolute', 
            right: '10%', 
            zIndex: 20, 
            padding: '16px', 
            borderRadius: '50%', 
            border: 'none', 
            background: 'var(--sys-colors-surfaces-surface-primary, #ffffff)', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
            cursor: 'pointer', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s cubic-bezier(0.25, 0.1, 0.25, 1), background-color 0.2s ease',
            color: 'var(--sys-colors-text-text-primary, #1a1a1a)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--sys-colors-surfaces-surface-primary, #ffffff)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <ChevronRight />
        </button>
      </div>


    </div>
  );
}
