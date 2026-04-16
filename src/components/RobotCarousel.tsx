import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import RobotCard from './RobotCard';
import { robotsData } from '../data/robots.data';
import type { Robot } from '../data/robots.data';
import { useNavigate } from 'react-router-dom';

export default function RobotCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % robotsData.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + robotsData.length) % robotsData.length);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelect = (robot: Robot) => {
    navigate('/planner', { state: { selectedRobot: robot } });
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* Cards Container */}
      <div style={{ position: 'relative', width: '800px', height: '100%' }}>
        {robotsData.map((robot, i) => {
          let position: 'left' | 'center' | 'right' | 'hidden' = 'hidden';
          const distance = (i - activeIndex + robotsData.length) % robotsData.length;
          
          if (distance === 0) position = 'center';
          else if (distance === 1) position = 'right';
          else if (distance === robotsData.length - 1) position = 'left';

          return (
            <RobotCard
              key={robot.id}
              robot={robot}
              isActive={position === 'center'}
              position={position}
              onClick={() => setActiveIndex(i)}
              onSelect={handleSelect}
            />
          );
        })}
      </div>

      {/* Navigation Controls */}
      <button 
        onClick={handlePrev}
        style={{
          position: 'absolute', left: '10%', top: '50%', transform: 'translateY(-50%)',
          background: 'var(--sys-colors-surfaces-surface-hover, rgba(255,255,255,0.1))', border: 'none', borderRadius: '50%', padding: '12px', cursor: 'pointer', zIndex: 20
        }}
      >
        <ChevronLeft color="var(--sys-colors-text-text-primary, #fff)" size={32} />
      </button>

      <button 
        onClick={handleNext}
        style={{
          position: 'absolute', right: '10%', top: '50%', transform: 'translateY(-50%)',
          background: 'var(--sys-colors-surfaces-surface-hover, rgba(255,255,255,0.1))', border: 'none', borderRadius: '50%', padding: '12px', cursor: 'pointer', zIndex: 20
        }}
      >
        <ChevronRight color="var(--sys-colors-text-text-primary, #fff)" size={32} />
      </button>

      {/* Indicator */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        color: 'var(--sys-colors-text-text-secondary, #888)',
        fontSize: '14px',
        fontWeight: 'bold',
        letterSpacing: '2px'
      }}>
        {activeIndex + 1} / {robotsData.length}
      </div>

    </div>
  );
}
