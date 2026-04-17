import { motion } from 'framer-motion';
import type { Robot } from '../data/robots.data';
import RobotViewer from './RobotViewer';

interface RobotCardProps {
  robot: Robot;
  isActive: boolean;
  position: 'left' | 'center' | 'right' | 'hidden';
  onClick: () => void;
  onSelect: (robot: Robot) => void;
}

const variants = {
  center: {
    scale: 1,
    opacity: 1,
    x: '0%',
    zIndex: 20,
    filter: 'blur(0px)',
  },
  left: {
    scale: 0.85,
    opacity: 0.5,
    x: '-60%',
    zIndex: 10,
    filter: 'blur(2px)',
  },
  right: {
    scale: 0.85,
    opacity: 0.5,
    x: '60%',
    zIndex: 10,
    filter: 'blur(2px)',
  },
  hidden: {
    scale: 0.7,
    opacity: 0,
    x: '0%',
    zIndex: 0,
    filter: 'blur(5px)',
  }
};

export default function RobotCard({ robot, isActive, position, onClick, onSelect }: RobotCardProps) {
  return (
    <motion.div
      variants={variants}
      initial={false}
      animate={position}
      transition={{ type: 'spring', stiffness: 250, damping: 25 }}
      onClick={!isActive ? onClick : undefined}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        // Center the card around its origin
        marginTop: '-280px',
        marginLeft: isActive ? '-450px' : '-150px', // width changes based on active state
        width: isActive ? '900px' : '300px',
        height: '560px',
        backgroundColor: '#ffffff', // Clean white background
        borderRadius: '24px',
        boxShadow: isActive ? '0 20px 40px rgba(0,0,0,0.1)' : '0 10px 20px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'row',
        cursor: isActive ? 'auto' : 'pointer',
        overflow: 'hidden',
        color: '#111827', // Dark slate text
        border: '1px solid #f0f0f0'
      }}
    >
      {isActive ? (
        <>
          {/* Left Pane: 3D Viewer */}
          <div style={{
            flex: 1,
            backgroundColor: '#f8f9fa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <RobotViewer modelUrl={robot.model} />
          </div>

          {/* Right Pane: Details */}
          <div style={{
            flex: 1,
            padding: '48px',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#ffffff'
          }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '800',
              color: '#0f172a', // Dark blue/slate
              margin: '0 0 16px 0',
              letterSpacing: '-0.5px'
            }}>
              {robot.name}
            </h2>

            <p style={{
              fontSize: '16px',
              color: '#475569',
              lineHeight: '1.6',
              margin: '0 0 40px 0'
            }}>
              {robot.description}
            </p>

            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#0f172a',
              margin: '0 0 16px 0'
            }}>
              Capabilities
            </h3>

            <ul style={{
              listStyleType: 'none',
              padding: 0,
              margin: '0 0 auto 0',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {robot.capabilities.map((cap, idx) => (
                <li key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '15px',
                  color: '#334155'
                }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#0d9488', // Teal dot matching the image
                    borderRadius: '50%',
                    marginRight: '12px',
                    display: 'inline-block'
                  }} />
                  {cap}
                </li>
              ))}
            </ul>

            <button
              onClick={() => onSelect(robot)}
              style={{
                marginTop: '32px',
                width: '100%',
                padding: '16px',
                backgroundColor: '#003366', // Dark blue matching the image CTA
                color: '#ffffff',
                border: 'none',
                borderRadius: '24px', // Highly rounded pill shape
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.1s, background-color 0.2s',
                boxShadow: '0 4px 12px rgba(0, 51, 102, 0.2)'
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#002244'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = '#003366'}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              Select robot
            </button>
          </div>
        </>
      ) : (
        /* Inactive State: Just show the name */
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#94a3b8',
            margin: 0,
            textAlign: 'center'
          }}>
            {robot.name}
          </h2>
        </div>
      )}
    </motion.div>
  );
}
