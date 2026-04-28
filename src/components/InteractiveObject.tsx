import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { ObjectData } from '../data/objects.data';

const HIGHLIGHT_COLOR = '#0088FF';

interface InteractiveObjectProps {
  objectData: ObjectData;
  position: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  isSelected: boolean;
  isNew: boolean;
  onSelect: () => void;
  onPositionChange?: (position: { x: number; y: number; z: number }) => void;
}

export default function InteractiveObject({
  objectData,
  position,
  scale,
  rotation,
  isSelected,
  isNew,
  onSelect,
  onPositionChange: _onPositionChange,
}: InteractiveObjectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [pulseScale, setPulseScale] = useState(1);
  const [_showHandles, setShowHandles] = useState(isSelected || isNew);

  const color = objectData.color || '#8B5CF6';

  useEffect(() => {
    if (isNew) {
      setPulseScale(1.15);
      setShowHandles(true);
      const timer = setTimeout(() => {
        setPulseScale(1);
        setShowHandles(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
    setShowHandles(isSelected);
  }, [isSelected, isNew]);

  useFrame((_, delta) => {
    if (pulseScale > 1 && pulseScale <= 1.15) {
      setPulseScale(prev => Math.max(1, prev - delta * 0.3));
    }
  });

  const currentScale = {
    x: scale.x * pulseScale,
    y: scale.y * pulseScale,
    z: scale.z * pulseScale,
  };
  const labelOffsetX = Math.max(currentScale.x, currentScale.z) * 0.7 + 0.08;
  const labelOffsetY = Math.max(currentScale.y * 0.65, 0.14);

  const renderGeometry = () => {
    switch (objectData.id) {
      case 'box':
        return (
          <mesh ref={meshRef} position={[0, currentScale.y / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[currentScale.x, currentScale.y, currentScale.z]} />
            <meshStandardMaterial 
              color={color} 
              roughness={0.3} 
              metalness={0.1}
              transparent
              opacity={0.95}
            />
          </mesh>
        );
      case 'cylinder':
        return (
          <mesh ref={meshRef} position={[0, currentScale.y / 2, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[currentScale.x / 2, currentScale.x / 2, currentScale.y, 24]} />
            <meshStandardMaterial 
              color={color} 
              roughness={0.3} 
              metalness={0.1}
              transparent
              opacity={0.95}
            />
          </mesh>
        );
      case 'sphere':
        return (
          <mesh ref={meshRef} position={[0, currentScale.y / 2, 0]} castShadow receiveShadow>
            <sphereGeometry args={[currentScale.x / 2, 24, 24]} />
            <meshStandardMaterial 
              color={color} 
              roughness={0.2} 
              metalness={0.05}
              transparent
              opacity={0.95}
            />
          </mesh>
        );
      case 'pallet':
        return (
          <group ref={meshRef}>
            <mesh position={[0, 0.02, 0]} receiveShadow>
              <boxGeometry args={[currentScale.x, 0.04, currentScale.z]} />
              <meshStandardMaterial color="#8B6914" roughness={0.8} />
            </mesh>
            <mesh position={[0, currentScale.y * 0.5, 0]} receiveShadow>
              <boxGeometry args={[currentScale.x - 0.05, currentScale.y, currentScale.z - 0.05]} />
              <meshStandardMaterial color="#A07814" roughness={0.7} />
            </mesh>
            <mesh position={[0, currentScale.y - 0.02, 0]} receiveShadow>
              <boxGeometry args={[currentScale.x - 0.1, currentScale.y - 0.04, currentScale.z - 0.1]} />
              <meshStandardMaterial color="#8B6914" roughness={0.8} />
            </mesh>
          </group>
        );
      default:
        return (
          <mesh ref={meshRef} position={[0, currentScale.y / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[currentScale.x, currentScale.y, currentScale.z]} />
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
          </mesh>
        );
    }
  };

  return (
    <group
      ref={groupRef}
      position={[position.x, position.y, position.z]}
      rotation={[rotation.x, rotation.y, rotation.z]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Glow/shadow base for visibility */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[scale.x * 1.3, scale.z * 1.3]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>

      {/* Object geometry */}
      {renderGeometry()}

      {/* Selection/new glow outline */}
      {(isSelected || isNew) && (
        <mesh position={[0, currentScale.y / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[scale.x * 1.1, scale.z * 1.1]} />
          <meshBasicMaterial color={HIGHLIGHT_COLOR} transparent opacity={0.25} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Selection border - blue */}
      {isSelected && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[
            Math.max(scale.x, scale.z) * 0.6,
            Math.max(scale.x, scale.z) * 0.65,
            32
          ]} />
          <meshBasicMaterial color={HIGHLIGHT_COLOR} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Hover highlight */}
      {hovered && (
        <mesh position={[0, currentScale.y / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[scale.x * 1.05, scale.z * 1.05]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.2} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Label */}
      {(isSelected || hovered || isNew) && (
        <Html
          position={[labelOffsetX, labelOffsetY, 0]}
          center
          transform
          occlude
          distanceFactor={8}
          style={{ pointerEvents: 'none', userSelect: 'none' as React.CSSProperties['userSelect'] }}
        >
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.82)',
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: 600,
            color: color,
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
            border: isSelected ? `2px solid ${HIGHLIGHT_COLOR}` : `1px solid #e2e8f0`,
          }}>
            {objectData.name}
          </div>
        </Html>
      )}
    </group>
  );
}