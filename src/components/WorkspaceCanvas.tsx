import { Suspense, Component, type ReactNode, useRef, useEffect, useMemo } from 'react';
import type { ErrorInfo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Center, Bounds } from '@react-three/drei';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Vector3 } from 'three';
import type { Target } from '../utils/robotStorage';
import type { SimState, SimObject } from '../utils/simState';

class ErrorBoundary extends Component<{children: ReactNode, fallback: ReactNode}, {hasError: boolean}> {
  constructor(props: {children: ReactNode, fallback: ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Canvas Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function Model({ url, position }: { url: string; position?: [number, number, number] }) {
  const { scene } = useGLTF(url);

  return (
    <Bounds fit clip observe margin={1.1}>
      <Center>
        <primitive object={scene} position={position} />
      </Center>
    </Bounds>
  );
}

interface SimulatedRobotProps {
  robotModelUrl: string;
  targetPosition: { x: number; y: number; z: number };
  targetRotation?: number;
}

function SimulatedRobot({ robotModelUrl, targetPosition, targetRotation = 0 }: SimulatedRobotProps) {
  const groupRef = useRef<THREE.Group>(null);
  const targetRef = useRef(targetPosition);
  const rotationRef = useRef(targetRotation);

  useEffect(() => {
    targetRef.current = targetPosition;
  }, [targetPosition]);

  useEffect(() => {
    rotationRef.current = targetRotation;
  }, [targetRotation]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Position interpolation
    const target = new Vector3(targetRef.current.x, targetRef.current.y, targetRef.current.z);
    const current = groupRef.current.position;
    const diff = target.clone().sub(current);

    if (diff.length() > 0.01) {
      const speed = 2.5;
      const step = diff.multiplyScalar(Math.min(delta * speed, 1));
      groupRef.current.position.add(step);
    }

    // Rotation interpolation
    const targetRot = rotationRef.current;
    const currentRot = groupRef.current.rotation.y;
    const rotDiff = targetRot - currentRot;
    
    if (Math.abs(rotDiff) > 0.01) {
      const rotSpeed = 3;
      groupRef.current.rotation.y += rotDiff * Math.min(delta * rotSpeed, 1);
    }
  });

  return (
    <group ref={groupRef}>
      <Model url={robotModelUrl} />
    </group>
  );
}

// Static Target Marker for Simulation - NO PHYSICS, purely visual
function SimTargetMarker({ target, isActive }: { target: Target; isActive: boolean }) {
  const markerColor = target.color || '#00FF88';

  if (target.type === 'zone') {
    const width = target.size?.width || 0.4;
    const depth = target.size?.depth || 0.4;
    const tableHeight = 0.15;

    return (
      <group position={[target.position.x, target.position.y, target.position.z]}>
        {/* Table top */}
        <mesh position={[0, tableHeight, 0]}>
          <boxGeometry args={[width, 0.015, depth]} />
          <meshStandardMaterial
            color="#9B7E5C"
            metalness={0.1}
            roughness={0.7}
          />
        </mesh>
        {/* Table edge */}
        <mesh position={[0, tableHeight + 0.008, 0]}>
          <boxGeometry args={[width + 0.015, 0.018, depth + 0.015]} />
          <meshStandardMaterial color="#7A5F45" metalness={0.1} roughness={0.8} />
        </mesh>
        {/* Legs */}
        {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([dx, dz], i) => (
          <mesh key={i} position={[dx * (width / 2 - 0.03), tableHeight / 2, dz * (depth / 2 - 0.03)]}>
            <boxGeometry args={[0.025, tableHeight, 0.025]} />
            <meshStandardMaterial color="#5C4835" metalness={0.1} roughness={0.8} />
          </mesh>
        ))}
        {/* Highlight if active */}
        {isActive && (
          <mesh position={[0, tableHeight + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[width + 0.04, depth + 0.04]} />
            <meshBasicMaterial color={markerColor} transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>
        )}
        <Html position={[0, tableHeight + 0.12, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.95)',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            color: markerColor,
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            border: `1px solid ${markerColor}`,
          }}>
            {target.name}
          </div>
        </Html>
      </group>
    );
  }

  // Point target
  return (
    <group position={[target.position.x, target.position.y, target.position.z]}>
      {/* Base circle */}
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.08, 32]} />
        <meshBasicMaterial color={markerColor} transparent opacity={0.3} />
      </mesh>
      {/* Pole */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.3, 12]} />
        <meshStandardMaterial color={markerColor} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Top marker */}
      <mesh position={[0, 0.32, 0]}>
        <octahedronGeometry args={[0.05, 0]} />
        <meshStandardMaterial
          color={markerColor}
          emissive={markerColor}
          emissiveIntensity={isActive ? 0.8 : 0.5}
          metalness={0.4}
          roughness={0.2}
        />
      </mesh>
      {/* Highlight ring if active */}
      {isActive && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.1, 0.12, 32]} />
          <meshBasicMaterial color={markerColor} side={THREE.DoubleSide} transparent opacity={0.8} />
        </mesh>
      )}
      <Html position={[0, 0.45, 0]} center style={{ pointerEvents: 'none' }}>
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.95)',
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 700,
          color: markerColor,
          whiteSpace: 'nowrap',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          border: `1px solid ${markerColor}`,
        }}>
          {target.name}
        </div>
      </Html>
    </group>
  );
}

interface SimulatedObjectProps {
  object: SimObject;
  held: boolean;
  robotPosition: { x: number; y: number; z: number };
}

function SimulatedObject({ object, held, robotPosition }: SimulatedObjectProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const positionRef = useRef(object.position);

  // Update position ref when object position changes
  useEffect(() => {
    positionRef.current = object.position;
  }, [object.position]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    if (held) {
      // Object is attached to robot - move with robot
      const targetPos = new Vector3(robotPosition.x, robotPosition.y + 0.25, robotPosition.z);
      meshRef.current.position.lerp(targetPos, Math.min(delta * 10, 1));
    }
    // Objects stay fixed when not held - NO automatic movement
  });

  const geometry = useMemo(() => {
    const idStr = object.id.toLowerCase();
    if (idStr.includes('cylinder')) return 'cylinder';
    if (idStr.includes('sphere')) return 'sphere';
    return 'box';
  }, [object.id]);

  const objectColor = '#8B5CF6';

  return (
    <mesh
      ref={meshRef}
      position={[object.position.x, object.position.y + 0.05, object.position.z]}
      userData={{ pickable: object.userData?.pickable ?? true }}
    >
      {geometry === 'box' && <boxGeometry args={[0.1, 0.08, 0.1]} />}
      {geometry === 'cylinder' && <cylinderGeometry args={[0.04, 0.04, 0.1, 16]} />}
      {geometry === 'sphere' && <sphereGeometry args={[0.05, 16, 16]} />}
      <meshStandardMaterial
        color={objectColor}
        roughness={0.4}
        metalness={0.1}
        emissive={held ? "#4C1D95" : "#000000"}
        emissiveIntensity={held ? 0.3 : 0}
      />
    </mesh>
  );
}

// Ground plane for reference
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#e5e7eb" transparent opacity={0.5} />
    </mesh>
  );
}

interface WorkspaceCanvasProps {
  robotModelUrl: string;
  simulationMode?: boolean;
  simState?: SimState | null;
  onSimStateChange?: (state: SimState) => void;
  targets?: Target[];
  children?: ReactNode;
}

export default function WorkspaceCanvas({
  robotModelUrl,
  simulationMode = false,
  simState,
  targets = [],
  children
}: WorkspaceCanvasProps) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 0 }}>
      <ErrorBoundary fallback={<div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff4444', backgroundColor: '#fee' }}>Failed to load 3D model</div>}>
        <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 1.2, 3.5], fov: 50 }}>
          <OrbitControls
            enableZoom={!simulationMode}
            enablePan={!simulationMode}
            enabled={!simulationMode}
          />
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 5, 5]} />

            {simulationMode ? (
              <>
                {/* Ground plane */}
                <Ground />

                {/* Static Target Markers - NOT parented to anything, fixed in world space */}
                {targets.map((target) => (
                  <SimTargetMarker
                    key={`sim-target-${target.id}`}
                    target={target}
                    isActive={simState?.currentBlockIndex >= 0}
                  />
                ))}

                {/* Simulated Robot - moves independently */}
                {simState && (
                  <SimulatedRobot
                    robotModelUrl={robotModelUrl}
                    targetPosition={simState.robotPosition}
                    targetRotation={simState.robotRotation}
                  />
                )}

                {/* Simulated Objects - ONLY move when held by robot */}
                {simState && simState.objects.map((obj) => (
                  <SimulatedObject
                    key={obj.id}
                    object={obj}
                    held={simState.heldObject?.id === obj.id}
                    robotPosition={simState.robotPosition}
                  />
                ))}
              </>
            ) : (
              <>
                {/* Normal mode - show robot and interactive elements */}
                <Model url={robotModelUrl} />
                {children}
              </>
            )}
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  );
}