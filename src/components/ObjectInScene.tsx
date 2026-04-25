import { Suspense, Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Center, Bounds } from '@react-three/drei';
import type { ObjectData } from '../data/objects.data';

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

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);

  return (
    <Bounds fit clip observe margin={1.2}>
      <Center>
        <primitive object={scene} />
      </Center>
    </Bounds>
  );
}

function ProceduralObject({ objectData }: { objectData: ObjectData }) {
  const color = objectData.color || '#8B5CF6';
  const size = objectData.defaultSize || { x: 0.1, y: 0.1, z: 0.1 };

  const renderGeometry = () => {
    switch (objectData.id) {
      case 'box':
        return (
          <mesh position={[0, size.y / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[size.x, size.y, size.z]} />
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
          </mesh>
        );
      case 'cylinder':
        return (
          <mesh position={[0, size.y / 2, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[size.x / 2, size.x / 2, size.y, 32]} />
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
          </mesh>
        );
      case 'sphere':
        return (
          <mesh position={[0, size.x / 2, 0]} castShadow receiveShadow>
            <sphereGeometry args={[size.x / 2, 32, 32]} />
            <meshStandardMaterial color={color} roughness={0.2} metalness={0.05} />
          </mesh>
        );
      case 'pallet':
        return (
          <group>
            <mesh position={[0, 0.02, 0]} receiveShadow>
              <boxGeometry args={[size.x, 0.04, size.z]} />
              <meshStandardMaterial color="#8B6914" roughness={0.8} />
            </mesh>
            <mesh position={[0, size.y * 0.5, 0]} receiveShadow>
              <boxGeometry args={[size.x - 0.05, size.y, size.z - 0.05]} />
              <meshStandardMaterial color="#A07814" roughness={0.7} />
            </mesh>
            <mesh position={[0, size.y - 0.02, 0]} receiveShadow>
              <boxGeometry args={[size.x - 0.1, size.y - 0.04, size.z - 0.1]} />
              <meshStandardMaterial color="#8B6914" roughness={0.8} />
            </mesh>
          </group>
        );
      default:
        return (
          <mesh position={[0, size.y / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[size.x, size.y, size.z]} />
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
          </mesh>
        );
    }
  };

  return <group>{renderGeometry()}</group>;
}

export default function ObjectInScene({ objectData }: { objectData: ObjectData }) {
  const hasModel = objectData.model && objectData.model.trim() !== '';

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
              {hasModel ? <Model url={objectData.model} /> : <ProceduralObject objectData={objectData} />}
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