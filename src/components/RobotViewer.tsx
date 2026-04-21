import { Suspense, Component, useRef } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Center, Bounds } from '@react-three/drei';
import * as THREE from 'three';
import { useRobotAction } from '../context/RobotActionContext';

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
  const { currentAction } = useRobotAction();
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (currentAction === 'pick' || currentAction === 'place') {
      // Bob up and down
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        Math.sin(state.clock.elapsedTime * 5) * 0.2 + 0.2,
        0.1
      );
    } else if (currentAction === 'rotate') {
      // Spin fast
      groupRef.current.rotation.y += delta * 5;
    } else if (currentAction === 'lift') {
      // Lift up
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 1, 0.1);
    } else if (currentAction === 'weld') {
      // Shake
      groupRef.current.position.x = Math.sin(state.clock.elapsedTime * 40) * 0.05;
      groupRef.current.position.z = Math.cos(state.clock.elapsedTime * 40) * 0.05;
    } else {
      // Reset
      groupRef.current.position.lerp(new THREE.Vector3(0, 0, 0), 0.1);
      // Don't reset rotation to allow OrbitControls autoRotate to work smoothly
    }
  });

  return (
    <Bounds fit clip observe margin={1.1}>
      <Center>
        <group ref={groupRef}>
          <primitive object={scene} />
        </group>
      </Center>
    </Bounds>
  );
}

export default function RobotViewer({ modelUrl }: { modelUrl: string }) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 0 }}>
      {/* 
        Using Canvas with shadows and reasonable camera defaults.
        We add a Suspense fallback to handled async loading of the .glb
      */}
      <ErrorBoundary fallback={<div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff4444', backgroundColor: '#fee' }}>Failed to load 3D model</div>}>
        <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 1.2, 3.5], fov: 50 }}>
          <OrbitControls
            autoRotate
            autoRotateSpeed={1}
            enableZoom={false}
            enablePan={false}
            makeDefault
          />
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 5, 5]} />

            <Model url={modelUrl} />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  );
}
