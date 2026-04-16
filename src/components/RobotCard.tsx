import { useRef, Suspense, Component } from 'react';
import type { ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import type { Robot } from '../data/robots.data';

interface RobotCardProps {
  robot: Robot;
  isActive: boolean;
  position: 'left' | 'center' | 'right' | 'hidden';
  onClick: () => void;
  onSelect: (robot: Robot) => void;
}

class ErrorBoundary extends Component<{children: ReactNode, fallback: ReactNode}, {hasError: boolean}> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

function GLTFModel({ url }: { url: string }) {
  // useGLTF dynamically loads the external model.
  const { scene } = useGLTF(url);
  const meshRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3; // gentle rotation
    }
  });

  return <primitive object={scene} ref={meshRef} position={[0, -1, 0]} scale={1.5} />;
}

const variants = {
  center: {
    scale: 1,
    opacity: 1,
    x: '0%',
    zIndex: 10,
    filter: 'blur(0px)',
  },
  left: {
    scale: 0.8,
    opacity: 0.6,
    x: '-60%',
    zIndex: 5,
    filter: 'blur(2px)',
  },
  right: {
    scale: 0.8,
    opacity: 0.6,
    x: '60%',
    zIndex: 5,
    filter: 'blur(2px)',
  },
  hidden: {
    scale: 0.6,
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
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onClick={!isActive ? onClick : undefined}
      style={{
        position: 'absolute',
        width: '400px',
        height: '500px',
        backgroundColor: 'var(--sys-colors-surfaces-surface-base, #1e1e1e)',
        borderRadius: 'var(--sys-borderradius-radii-md, 16px)',
        boxShadow: isActive ? 'var(--sys-shadows-shadow-3, 0 10px 30px rgba(0,0,0,0.5))' : 'var(--sys-shadows-shadow-1, 0 4px 10px rgba(0,0,0,0.2))',
        border: '1px solid var(--sys-colors-borders-border-base, #333)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 'var(--sys-spacing-spacing-4, 24px)',
        cursor: isActive ? 'auto' : 'pointer',
        overflow: 'hidden',
        color: 'var(--sys-colors-text-text-primary, #fff)',
        top: '50%',
        left: '50%',
        marginTop: '-250px',
        marginLeft: '-200px'
      }}
    >
      <div style={{ flex: 1, width: '100%', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {isActive ? (
          <Canvas camera={{ position: [0, 0, 5] }} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <Suspense fallback={
              <mesh>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="gray" wireframe={true} />
              </mesh>
            }>
              <ErrorBoundary fallback={
                <mesh>
                  <boxGeometry args={[1.5, 1.5, 1.5]} />
                  <meshStandardMaterial color="red" wireframe={true} />
                </mesh>
              }>
                <GLTFModel url={robot.modelUrl} />
              </ErrorBoundary>
            </Suspense>
          </Canvas>
        ) : (
          <div style={{
            width: '100px', height: '100px', border: '2px dashed var(--sys-colors-borders-border-base, #555)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sys-colors-text-text-tertiary, #888)'
          }}>
            Preview
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', zIndex: 2 }}>
        <h2 style={{
          fontSize: 'var(--sys-font-headings-h3-bold-fontsize, 24px)',
          fontWeight: 'var(--sys-font-headings-h3-bold-fontweight, bold)',
          margin: '0 0 8px 0'
        }}>
          {robot.name}
        </h2>
        
        {isActive && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <span style={{
              display: 'inline-block',
              backgroundColor: 'var(--sys-colors-surfaces-surface-hover, #2a2a2a)',
              color: 'var(--sys-colors-text-text-secondary, #aaa)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              marginBottom: '12px'
            }}>
              {robot.tag}
            </span>
            <p style={{
              fontSize: '14px',
              color: 'var(--sys-colors-text-text-secondary, #bbb)',
              margin: '0 0 12px 0'
            }}>
              {robot.description}
            </p>
            <p style={{
              fontSize: '13px',
              fontWeight: 'var(--sys-font-body-body-bold-fontweight, bold)',
              color: 'var(--sys-colors-text-text-primary, #fff)',
              margin: '0 0 20px 0'
            }}>
              {robot.specs}
            </p>
            <button
              onClick={() => onSelect(robot)}
              style={{
                backgroundColor: 'var(--sys-color-roles-primary-roles-primary, #007bff)',
                color: 'var(--sys-color-roles-primary-roles-on-primary, #fff)',
                border: 'none',
                padding: '12px 24px',
                borderRadius: 'var(--sys-borderradius-radii-sm, 8px)',
                cursor: 'pointer',
                fontWeight: 'bold',
                width: '100%',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--sys-color-roles-primary-roles-primary-container, #0056b3)'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--sys-color-roles-primary-roles-primary, #007bff)'}
            >
              Select Robot
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
