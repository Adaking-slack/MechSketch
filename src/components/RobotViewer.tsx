import { useMemo, useRef, Suspense, Component, ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Center, ContactShadows, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface RobotViewerProps {
  modelUrl: string;
}

class ErrorBoundary extends Component<{ children: ReactNode, fallback: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidUpdate(prevProps: { children: ReactNode, fallback: ReactNode }) {
    if (this.props.children !== prevProps.children) {
      this.setState({ hasError: false });
    }
  }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

function GLTFModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const meshRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15; // smooth auto-rotation
    }
  });

  const targetSize = 4.5;
  const scale = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    return maxDim > 0 ? targetSize / maxDim : 1;
  }, [scene]);

  return (
    <group position={[0, -targetSize / 2, 0]}>
      <Center position={[0, targetSize / 2, 0]}>
        <primitive object={scene} ref={meshRef} scale={scale} />
      </Center>
      <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={10} blur={2} far={4} />
    </group>
  );
}

function FallbackUI() {
  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial color="#ff4444" wireframe={true} />
    </mesh>
  );
}

function LoadingUI() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta;
      ref.current.rotation.y += delta;
    }
  });
  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <octahedronGeometry args={[0.5]} />
      <meshStandardMaterial color="#888" wireframe={true} />
    </mesh>
  );
}

export default function RobotViewer({ modelUrl }: RobotViewerProps) {
  return (
    <Canvas 
      camera={{ position: [0, 1.5, 6], fov: 45 }} 
      style={{ width: '100%', height: '100%', background: 'transparent' }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      <Environment preset="city" />
      
      <Suspense fallback={<LoadingUI />}>
        <ErrorBoundary fallback={<FallbackUI />}>
          <GLTFModel key={modelUrl} url={modelUrl} />
        </ErrorBoundary>
      </Suspense>

      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        autoRotate={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 1.5}
      />
    </Canvas>
  );
}
