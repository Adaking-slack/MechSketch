import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Target } from '../utils/robotStorage';

const HIGHLIGHT_COLOR = '#00FF88';
const HIGHLIGHT_COLOR_BLUE = '#0088FF';

interface TargetPointProps {
  target: Target;
  isSelected: boolean;
  onClick: () => void;
  isNew?: boolean;
}

function TargetPoint({ target, isSelected, onClick, isNew }: TargetPointProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [pulseScale, setPulseScale] = useState(1);

  useFrame((_, delta) => {
    if (isNew && pulseScale < 1.3) {
      setPulseScale(prev => Math.min(prev + delta * 0.5, 1.3));
    }
  });

  const baseSize = 0.06;
  const scaledSize = baseSize * pulseScale;
  const markerColor = target.color || HIGHLIGHT_COLOR;
  const labelOffsetX = scaledSize * 2.2 + 0.08;
  const labelOffsetY = 0.22;

  return (
    <group ref={groupRef} position={[target.position.x, target.position.y, target.position.z]}>
      {/* Glow/shadow base for visibility */}
      <mesh position={[0, 0.002, 0]} onClick={onClick}>
        <circleGeometry args={[scaledSize * 1.5, 32]} />
        <meshBasicMaterial color={markerColor} transparent opacity={0.2} />
      </mesh>

      {/* Vertical marker pole - larger for visibility */}
      <mesh position={[0, 0.2, 0]} onClick={onClick}>
        <cylinderGeometry args={[0.015, 0.015, 0.4, 12]} />
        <meshStandardMaterial color={markerColor} metalness={0.6} roughness={0.3} />
      </mesh>
      
      {/* Top marker - larger */}
      <mesh position={[0, 0.42, 0]} onClick={onClick}>
        <octahedronGeometry args={[scaledSize * 1.5, 0]} />
        <meshStandardMaterial 
          color={markerColor} 
          emissive={markerColor}
          emissiveIntensity={isSelected ? 0.8 : 0.5}
          metalness={0.4}
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Selection/new glow - pulsing ring */}
      {(isSelected || isNew) && (
        <>
          <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[scaledSize * 1.2, scaledSize * 1.4, 32]} />
            <meshBasicMaterial color={markerColor} side={THREE.DoubleSide} transparent opacity={0.8} />
          </mesh>
          {/* Outer glow outline */}
          <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[scaledSize * 1.6, scaledSize * 1.7, 32]} />
            <meshBasicMaterial color={markerColor} side={THREE.DoubleSide} transparent opacity={0.4} />
          </mesh>
        </>
      )}
      
      {/* Selection ring - blue for clear distinction */}
      {isSelected && (
        <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[scaledSize * 2, scaledSize * 2.2, 32]} />
          <meshBasicMaterial color={HIGHLIGHT_COLOR_BLUE} side={THREE.DoubleSide} />
        </mesh>
      )}
      
      {/* Ground marker - larger with boundary */}
      <mesh position={[0, 0.003, 0]} onClick={onClick}>
        <circleGeometry args={[scaledSize, 32]} />
        <meshStandardMaterial 
          color={markerColor}
          emissive={markerColor}
          emissiveIntensity={0.4}
          transparent
          opacity={0.85}
        />
      </mesh>
      
      {/* Outer boundary ring */}
      <mesh position={[0, 0.001, 0]} onClick={onClick}>
        <ringGeometry args={[scaledSize * 0.9, scaledSize * 1.0, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
      </mesh>
      
      {/* Label - always visible */}
      <Html
        position={[labelOffsetX, labelOffsetY, 0]}
        center
        transform
        occlude
        distanceFactor={8}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.82)',
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: 700,
          color: markerColor,
          whiteSpace: 'nowrap',
          boxShadow: '0 2px 8px rgba(0,0,0,0.14)',
          border: isSelected ? `2px solid ${markerColor}` : `1px solid ${markerColor}`,
          minWidth: 'fit-content',
        }}>
          {target.name}
        </div>
      </Html>
    </group>
  );
}

interface TargetZoneProps {
  target: Target;
  isSelected: boolean;
  onClick: () => void;
  isNew?: boolean;
}

function TargetZone({ target, isSelected, onClick, isNew }: TargetZoneProps) {
  const size = target.size || { width: 0.4, depth: 0.4 };
  const tableHeight = 0.15;
  const [pulseScale, setPulseScale] = useState(1);

  useFrame((_, delta) => {
    if (isNew && pulseScale < 1.05) {
      setPulseScale(prev => Math.min(prev + delta * 0.1, 1.05));
    }
  });

  const scaledWidth = size.width * pulseScale;
  const scaledDepth = size.depth * pulseScale;
  const markerColor = target.color || HIGHLIGHT_COLOR;
  const labelOffsetX = scaledWidth / 2 + 0.12;
  const labelOffsetY = tableHeight + 0.04;

  const tableColor = '#9B7E5C';
  const edgeColor = '#7A5F45';
  const legColor = '#5C4835';

  return (
    <group position={[target.position.x, target.position.y, target.position.z]}>
      {/* Glow/shadow base for visibility */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[scaledWidth + 0.1, scaledDepth + 0.1]} />
        <meshBasicMaterial color={markerColor} transparent opacity={0.15} />
      </mesh>

      {/* Selection/new glow - pulsing outline */}
      {(isSelected || isNew) && (
        <>
          <mesh position={[0, tableHeight + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[scaledWidth + 0.08, scaledDepth + 0.08]} />
            <meshBasicMaterial color={markerColor} transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, tableHeight + 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[
              Math.max(scaledWidth, scaledDepth) / 2,
              Math.max(scaledWidth, scaledDepth) / 2 + 0.02,
              32
            ]} />
            <meshBasicMaterial color={markerColor} side={THREE.DoubleSide} transparent opacity={0.6} />
          </mesh>
        </>
      )}

      {/* Table top - main surface with slight transparency */}
      <mesh position={[0, tableHeight, 0]} onClick={onClick}>
        <boxGeometry args={[scaledWidth, 0.015, scaledDepth]} />
        <meshStandardMaterial 
          color={tableColor}
          metalness={0.1}
          roughness={0.7}
          transparent
          opacity={0.92}
        />
      </mesh>
      
      {/* Table edge/border - high contrast */}
      <mesh position={[0, tableHeight + 0.008, 0]} onClick={onClick}>
        <boxGeometry args={[scaledWidth + 0.015, 0.018, scaledDepth + 0.015]} />
        <meshStandardMaterial 
          color={edgeColor}
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>
      
      {/* Table inner surface */}
      <mesh position={[0, tableHeight + 0.012, 0]} onClick={onClick}>
        <boxGeometry args={[scaledWidth - 0.01, 0.012, scaledDepth - 0.01]} />
        <meshStandardMaterial 
          color={tableColor}
          metalness={0.1}
          roughness={0.7}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Legs at corners - larger for visibility */}
      {[
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1]
      ].map(([dx, dz], i) => (
        <mesh 
          key={`leg-${i}`} 
          position={[
            dx * (scaledWidth / 2 - 0.03), 
            tableHeight / 2, 
            dz * (scaledDepth / 2 - 0.03)
          ]} 
          onClick={onClick}
        >
          <boxGeometry args={[0.025, tableHeight, 0.025]} />
          <meshStandardMaterial 
            color={legColor}
            metalness={0.1}
            roughness={0.8}
          />
        </mesh>
      ))}
      
      {/* Selection highlight border - blue for clear distinction */}
      {isSelected && (
        <mesh 
          position={[0, tableHeight + 0.03, 0]} 
          rotation={[-Math.PI / 2, 0, 0]} 
        >
          <planeGeometry args={[scaledWidth + 0.04, scaledDepth + 0.04]} />
          <meshBasicMaterial color={HIGHLIGHT_COLOR_BLUE} transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      )}
      
      {/* Label - always visible */}
      <Html
        position={[labelOffsetX, labelOffsetY, 0]}
        center
        transform
        occlude
        distanceFactor={8}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.82)',
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: 700,
          color: markerColor,
          whiteSpace: 'nowrap',
          boxShadow: '0 2px 8px rgba(0,0,0,0.14)',
          border: isSelected ? `2px solid ${markerColor}` : `1px solid ${markerColor}`,
          minWidth: 'fit-content',
        }}>
          {target.name}
        </div>
      </Html>
    </group>
  );
}

interface TargetViewerProps {
  targets: Target[];
  selectedTargetId: string | null;
  onTargetSelect: (id: string) => void;
  newlyAddedTargetId?: string | null;
}

export default function TargetViewer({ targets, selectedTargetId, onTargetSelect, newlyAddedTargetId }: TargetViewerProps) {
  return (
    <group>
      {targets.map((target) => (
        target.type === 'point' ? (
          <TargetPoint
            key={target.id}
            target={target}
            isSelected={selectedTargetId === target.id}
            isNew={newlyAddedTargetId === target.id}
            onClick={() => onTargetSelect(target.id)}
          />
        ) : (
          <TargetZone
            key={target.id}
            target={target}
            isSelected={selectedTargetId === target.id}
            isNew={newlyAddedTargetId === target.id}
            onClick={() => onTargetSelect(target.id)}
          />
        )
      ))}
    </group>
  );
}