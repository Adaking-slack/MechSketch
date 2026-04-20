import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Center, Bounds } from '@react-three/drei';

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);

  return (
    <Bounds fit clip observe margin={1.1}>
      <Center>
        <primitive object={scene} />
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
    </div>
  );
}
