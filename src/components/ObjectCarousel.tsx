import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { objectsData } from '../data/objects.data';
import ObjectCard from './ObjectCard';
import { saveSelectedObject } from '../utils/robotStorage';

export default function ObjectCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  const extendedObjects = [...objectsData, ...objectsData, ...objectsData];

  const handleSelect = useCallback((object: typeof objectsData[0]) => {
    saveSelectedObject(object);
    navigate('/planner');
  }, [navigate]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % extendedObjects.length);
  }, []);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + extendedObjects.length) % extendedObjects.length);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  const getOffset = (index: number, currentActive: number, total: number) => {
    let diff = index - currentActive;
    if (diff > Math.floor(total / 2)) {
      diff -= total;
    } else if (diff < -Math.floor(total / 2)) {
      diff += total;
    }
    return diff;
  };

  if (objectsData.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '200px',
        color: '#888',
        fontSize: '16px',
      }}>
        No objects available. Please try again later.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: '100%', height: '600px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {extendedObjects.map((object, i) => {
          const offset = getOffset(i, activeIndex, extendedObjects.length);
          return (
            <ObjectCard 
              key={`${object.id}-${i}`}
              object={object}
              isActive={i === activeIndex}
              offset={offset}
              onSelect={() => handleSelect(object)}
            />
          );
        })}

        <button 
          onClick={handlePrev}
          aria-label="Previous object"
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
          aria-label="Next object"
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

      <div style={{ 
        width: '100%', 
        display: 'flex', 
        justifyContent: 'center', 
        marginTop: '64px',
        height: '24px'
      }}>
        <motion.div 
          key={activeIndex % objectsData.length}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ fontSize: '16px', fontWeight: 600, color: 'var(--sys-colors-text-text-secondary, #666)', letterSpacing: '2px' }}
        >
          {(activeIndex % objectsData.length) + 1} / {objectsData.length}
        </motion.div>
      </div>
    </div>
  );
}