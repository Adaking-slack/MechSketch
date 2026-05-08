import { motion } from 'framer-motion';
import type { Robot } from '../data/robots.data';
import RobotViewer from './RobotViewer';
import ObjectInScene from './ObjectInScene';
import type { ObjectData } from '../data/objects.data';
import { Bot } from 'lucide-react';

interface RobotCardProps {
  robot?: Robot;
  objectData?: ObjectData;
  isActive: boolean;
  offset: number;
  onSelect: () => void;
}

export default function RobotCard({ robot, objectData, isActive, offset, onSelect }: RobotCardProps) {
  const width = isActive ? 400 : 320;
  const height = isActive ? 550 : 450;
  
  const isVisible = Math.abs(offset) <= 1;
  const x = offset * 280; // Distance between cards
  const scale = isActive ? 1 : 0.8;
  const zIndex = isActive ? 10 : isVisible ? 5 : 0;
  const opacity = isActive ? 1 : isVisible ? 0.6 : 0;
  const blur = isActive ? "blur(0px)" : "blur(6px)";
  
  const yOffset = isActive ? -4 : 4;
  const shadow = isActive 
    ? '0 20px 40px rgba(0,0,0,0.08)' 
    : '0 8px 16px rgba(0,0,0,0.04)';
  return (
    <motion.div
      initial={false}
      animate={{
        x: `calc(-50% + ${x}px)`,
        y: `calc(-50% + ${yOffset}px)`,
        scale,
        opacity,
        zIndex,
        filter: blur,
        boxShadow: shadow
      }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={isActive ? { scale: 1.01, y: `calc(-50% - 6px)`, boxShadow: '0 28px 48px rgba(0,0,0,0.12)' } : {}}

      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        pointerEvents: isVisible ? 'auto' : 'none',
        width,
        height,
        backgroundColor: 'var(--sys-colors-surfaces-surface-primary, #ffffff)',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden',
        border: '1px solid var(--sys-colors-borders-border-primary, #e0e0e0)',
        transformOrigin: 'center center',
        padding: '32px',
        boxSizing: 'border-box',
        cursor: 'default'
      }}
    >
      {/* 3D Viewer */}
      <div style={{
        width: '100%',
        height: isActive ? '240px' : '200px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px'
      }}>
        {isActive ? (
          robot ? <RobotViewer modelUrl={robot.model} /> : (objectData ? <ObjectInScene objectData={objectData} /> : <Bot size={64} color="#ccc" strokeWidth={1} />)
        ) : (
          <Bot size={64} color="#ccc" strokeWidth={1} />
        )}
      </div>

      {/* Name */}
      <h3 style={{
        margin: '0 0 12px 0',
        fontSize: '24px',
        fontWeight: 700,
        textAlign: 'center',
        color: 'var(--sys-colors-text-text-primary, #1a1a1a)'
      }}>
        {robot?.name || objectData?.name}
      </h3>

      {/* Tag */}
      {isActive && (
        <span style={{
          fontSize: '12px',
          fontWeight: 600,
          padding: '4px 12px',
          backgroundColor: '#f0f4ff',
          color: '#0055ff',
          borderRadius: '999px',
          display: 'inline-block',
          marginBottom: '20px'
        }}>
          {robot?.tag || objectData?.tag}
        </span>
      )}

      {/* Description */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            width: '100%',
            flex: 1
          }}
        >
          <p style={{
            margin: '0 0 16px 0',
            fontSize: '14px',
            lineHeight: '20px',
            color: 'var(--sys-colors-text-text-secondary, #666)',
            width: '100%'
          }}>
            {robot?.description || objectData?.description}
          </p>
          <p style={{
            margin: '0',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--sys-colors-text-text-secondary, #888)'
          }}>
            {robot?.specs || objectData?.specs}
          </p>
          <div style={{ width: '100%', marginTop: 'auto', paddingTop: '24px', display: 'flex', justifyContent: 'center' }}>
            <button 
              onClick={onSelect}
              style={{
                padding: '12px 120px',
                backgroundColor: '#00376E',
                color: '#ECF5FE',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {objectData ? 'Select Object' : 'Select Robot'}
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
