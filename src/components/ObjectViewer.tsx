import { Suspense, Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center } from '@react-three/drei';

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

function BoxGeometry() {
  return (
    <group>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.4, 0.6]} />
        <meshStandardMaterial color="#8B5CF6" roughness={0.3} metalness={0.1} />
      </mesh>
    </group>
  );
}

function CylinderGeometry() {
  return (
    <group>
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.5, 32]} />
        <meshStandardMaterial color="#10B981" roughness={0.3} metalness={0.1} />
      </mesh>
    </group>
  );
}

function SphereGeometry() {
  return (
    <group>
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#F59E0B" roughness={0.2} metalness={0.05} />
      </mesh>
    </group>
  );
}

function PalletGeometry() {
  return (
    <group>
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <boxGeometry args={[0.8, 0.04, 0.6]} />
        <meshStandardMaterial color="#92400E" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <boxGeometry args={[0.7, 0.08, 0.5]} />
        <meshStandardMaterial color="#B45309" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.18, 0]} receiveShadow>
        <boxGeometry args={[0.6, 0.1, 0.4]} />
        <meshStandardMaterial color="#92400E" roughness={0.8} />
      </mesh>
    </group>
  );
}

interface ObjectViewerProps {
  objectType: 'box' | 'cylinder' | 'sphere' | 'pallet';
}

export default function ObjectViewer({ objectType }: ObjectViewerProps) {
  const renderGeometry = () => {
    switch (objectType) {
      case 'box':
        return <BoxGeometry />;
      case 'cylinder':
        return <CylinderGeometry />;
      case 'sphere':
        return <SphereGeometry />;
      case 'pallet':
        return <PalletGeometry />;
      default:
        return <BoxGeometry />;
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 0 }}>
      <ErrorBoundary fallback={<div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff4444', backgroundColor: '#fee' }}>Failed to load 3D model</div>}>
        <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0.8, 1.5], fov: 40 }}>
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minDistance={0.5}
            maxDistance={5}
            makeDefault
          />
          <Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 8, 5]} intensity={1} castShadow shadow-mapSize={[1024, 1024]} />
            <pointLight position={[-3, 3, -3]} intensity={0.3} />
            <Center>
              {renderGeometry()}
            </Center>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
              <planeGeometry args={[10, 10]} />
              <meshStandardMaterial color="#ffffff" roughness={0.9} />
            </mesh>
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  );
}