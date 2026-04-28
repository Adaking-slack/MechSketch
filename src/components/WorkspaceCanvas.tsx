import { Suspense, Component, type ReactNode, useRef, useEffect, useMemo } from 'react';
import type { ErrorInfo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Center, Bounds } from '@react-three/drei';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Vector3 } from 'three';
import { SkeletonUtils } from 'three-stdlib';
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

  useEffect(() => {
    if (scene) {
      scene.position.set(0, 0, 0);
      scene.rotation.set(0, 0, 0);
      scene.updateMatrixWorld(true);
    }
  }, [scene]);

  return (
    <Bounds fit clip observe margin={1.1}>
      <Center>
        <primitive object={scene} position={position} />
      </Center>
    </Bounds>
  );
}

// Fallback offset used only if the GLB has no recognizable gripper bone
const GRIPPER_FALLBACK_OFFSET = new THREE.Vector3(0, 0.5, 0);
const GOAL_LERP_RATE = 3.0; // gripper goal smoothing
const CCD_ITERATIONS = 6;
const CCD_MAX_STEP_RAD = 0.18; // damp per-bone rotation per CCD step to avoid flips

// End-effector and IK chain names for Robotik-arm.glb.
// Chain is ordered root→tip; CCD iterates tip→root each pass.
const END_EFFECTOR_NAMES = [
  'Bone.006',
  'Bone006',
  'Bone_006',
  'gripper',
  'tcp',
  'end_effector',
];
const IK_CHAIN_NAMES = [
  'Bone.001',
  'Bone001',
  'Bone_001',
  'Bone.002',
  'Bone002',
  'Bone_002',
  'Bone.003',
  'Bone003',
  'Bone_003',
  'Bone.004',
  'Bone004',
  'Bone_004',
  'Bone.005',
  'Bone005',
  'Bone_005',
];

// Scratch math objects reused across frames
const _vBone = new THREE.Vector3();
const _vEnd = new THREE.Vector3();
const _vToEnd = new THREE.Vector3();
const _vToGoal = new THREE.Vector3();
const _vAxis = new THREE.Vector3();
const _qWorld = new THREE.Quaternion();
const _qParent = new THREE.Quaternion();
const _qParentInv = new THREE.Quaternion();
const _qDelta = new THREE.Quaternion();

function solveCCD(chain: THREE.Object3D[], end: THREE.Object3D, goal: THREE.Vector3) {
  if (chain.length === 0) return;
  for (let iter = 0; iter < CCD_ITERATIONS; iter++) {
    for (let i = chain.length - 1; i >= 0; i--) {
      const bone = chain[i];
      bone.updateMatrixWorld(true);
      end.updateMatrixWorld(true);

      _vBone.setFromMatrixPosition(bone.matrixWorld);
      _vEnd.setFromMatrixPosition(end.matrixWorld);
      _vToEnd.copy(_vEnd).sub(_vBone);
      _vToGoal.copy(goal).sub(_vBone);
      const lenEnd = _vToEnd.length();
      const lenGoal = _vToGoal.length();
      if (lenEnd < 1e-5 || lenGoal < 1e-5) continue;
      _vToEnd.divideScalar(lenEnd);
      _vToGoal.divideScalar(lenGoal);

      const dot = Math.max(-1, Math.min(1, _vToEnd.dot(_vToGoal)));
      const angle = Math.acos(dot);
      if (angle < 1e-3) continue;

      _vAxis.crossVectors(_vToEnd, _vToGoal);
      if (_vAxis.lengthSq() < 1e-8) continue;
      _vAxis.normalize();

      const stepAngle = Math.min(angle, CCD_MAX_STEP_RAD);
      _qWorld.setFromAxisAngle(_vAxis, stepAngle);

      // Convert world-space delta into the bone's local-rotation premultiplier:
      // L' = (P^-1 · Q · P) · L
      if (bone.parent) {
        bone.parent.getWorldQuaternion(_qParent);
        _qParentInv.copy(_qParent).invert();
        _qDelta.copy(_qParentInv).multiply(_qWorld).multiply(_qParent);
      } else {
        _qDelta.copy(_qWorld);
      }
      bone.quaternion.premultiply(_qDelta);
    }
  }
}

function findIKRig(sceneRoot: THREE.Object3D): { endBone: THREE.Object3D | null; ikChain: THREE.Object3D[] } {
  let endBone: THREE.Object3D | null = null;
  for (const name of END_EFFECTOR_NAMES) {
    const found = sceneRoot.getObjectByName(name);
    if (found) {
      endBone = found;
      break;
    }
  }

  // Fallback: use the deepest leaf bone when explicit naming is unavailable.
  if (!endBone) {
    const leaves: Array<{ node: THREE.Object3D; depth: number }> = [];
    const stack: Array<{ node: THREE.Object3D; depth: number }> = [{ node: sceneRoot, depth: 0 }];
    while (stack.length) {
      const item = stack.pop();
      if (!item) break;
      const { node, depth } = item;
      const isBone = (node as THREE.Bone).isBone === true;
      if (isBone) {
        const hasBoneChild = node.children.some((c) => (c as THREE.Bone).isBone === true);
        if (!hasBoneChild) leaves.push({ node, depth });
      }
      for (const child of node.children) stack.push({ node: child, depth: depth + 1 });
    }
    leaves.sort((a, b) => b.depth - a.depth);
    endBone = leaves[0]?.node ?? null;
  }

  const explicitChain: THREE.Object3D[] = [];
  for (const name of IK_CHAIN_NAMES) {
    const found = sceneRoot.getObjectByName(name);
    if (found && !explicitChain.includes(found)) explicitChain.push(found);
  }

  if (endBone && explicitChain.length > 0) {
    return { endBone, ikChain: explicitChain };
  }

  // Fallback chain: walk from end-effector up through parent bones.
  const fallbackChain: THREE.Object3D[] = [];
  let cur = endBone?.parent ?? null;
  while (cur) {
    if ((cur as THREE.Bone).isBone === true) fallbackChain.unshift(cur);
    cur = cur.parent;
  }

  return { endBone, ikChain: fallbackChain };
}

interface SimulatedRobotProps {
  robotModelUrl: string;
  robotRotation: number;
  gripperGoal?: { x: number; y: number; z: number };
  gripperWorldRef: React.MutableRefObject<THREE.Vector3>;
  simulationPaused: boolean;
}

function SimulatedRobot({ robotModelUrl, robotRotation, gripperGoal, gripperWorldRef, simulationPaused }: SimulatedRobotProps) {
  const { scene } = useGLTF(robotModelUrl);
  // Clone the scene so the cached non-sim preview isn't mutated by IK
  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const groupRef = useRef<THREE.Group>(null);

  // Resolve end-effector and IK chain bones by name
  const { endBone, ikChain } = useMemo(() => findIKRig(clonedScene), [clonedScene]);

  // Smoothed gripper goal (world-space) for visible motion between waypoints
  const currentGoal = useRef<THREE.Vector3 | null>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (simulationPaused) {
      // Keep gripper world position fresh even while paused
      if (endBone) {
        endBone.updateWorldMatrix(true, false);
        gripperWorldRef.current.setFromMatrixPosition(endBone.matrixWorld);
      }
      return;
    }

    // 1) Keep base fixed. Only the articulated joints should move.
    groupRef.current.position.set(0, 0, 0);

    // 2) Lerp gripper goal
    if (gripperGoal) {
      if (!currentGoal.current) {
        currentGoal.current = new THREE.Vector3(gripperGoal.x, gripperGoal.y, gripperGoal.z);
      } else {
        const goalFactor = Math.min(delta * GOAL_LERP_RATE, 1);
        currentGoal.current.lerp(
          _vToGoal.set(gripperGoal.x, gripperGoal.y, gripperGoal.z),
          goalFactor
        );
      }
    }

    // 3) Run CCD if we have a usable rig + goal
    if (endBone && ikChain.length > 0 && currentGoal.current) {
      solveCCD(ikChain, endBone, currentGoal.current);
    }

    // 4) Publish the resulting gripper world position (after IK) for held objects to track
    if (endBone) {
      endBone.updateWorldMatrix(true, false);
      gripperWorldRef.current.setFromMatrixPosition(endBone.matrixWorld);
    } else {
      gripperWorldRef.current.set(
        groupRef.current.position.x + GRIPPER_FALLBACK_OFFSET.x,
        groupRef.current.position.y + GRIPPER_FALLBACK_OFFSET.y,
        groupRef.current.position.z + GRIPPER_FALLBACK_OFFSET.z
      );
    }
  });

  return (
    <group ref={groupRef} rotation={[0, robotRotation, 0]}>
      <Center>
        <primitive object={clonedScene} />
      </Center>
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
    const labelOffsetX = width / 2 + 0.12;
    const labelOffsetY = tableHeight + 0.04;

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
        <Html
          position={[labelOffsetX, labelOffsetY, 0]}
          center
          transform
          occlude
          distanceFactor={8}
          style={{ pointerEvents: 'none' }}
        >
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.82)',
            padding: '3px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 700,
            color: markerColor,
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
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
      {(() => {
        const labelOffsetX = 0.24;
        const labelOffsetY = 0.18;
        return (
          <Html
            position={[labelOffsetX, labelOffsetY, 0]}
            center
            transform
            occlude
            distanceFactor={8}
            style={{ pointerEvents: 'none' }}
          >
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.82)',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              color: markerColor,
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              border: `1px solid ${markerColor}`,
            }}>
              {target.name}
            </div>
          </Html>
        );
      })()}
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
    </group>
  );
}

interface SimulatedObjectProps {
  object: SimObject;
  held: boolean;
  gripperWorldRef: React.MutableRefObject<THREE.Vector3>;
  simulationPaused?: boolean;
}

function SimulatedObject({ object, held, gripperWorldRef, simulationPaused = false }: SimulatedObjectProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const initializedRef = useRef(false);
  const tmpVec = useRef(new Vector3());
  const OBJECT_Y_OFFSET = 0.28;

  // Snap to declared position on mount so we don't lerp in from origin
  useEffect(() => {
    if (meshRef.current && !initializedRef.current) {
      meshRef.current.position.set(object.position.x, object.position.y + OBJECT_Y_OFFSET, object.position.z);
      initializedRef.current = true;
    }
  }, [object.position.x, object.position.y, object.position.z]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    if (simulationPaused) return;

    if (held) {
      // Track the live (animated) gripper position so the object visibly hangs off the arm tip
      meshRef.current.position.lerp(gripperWorldRef.current, Math.min(delta * 8, 1));
    } else {
      // Lerp toward declared position (handles place transitions smoothly)
      tmpVec.current.set(object.position.x, object.position.y + OBJECT_Y_OFFSET, object.position.z);
      meshRef.current.position.lerp(tmpVec.current, Math.min(delta * 6, 1));
    }
  });

  const geometry = useMemo(() => {
    const idStr = object.id.toLowerCase();
    if (idStr.includes('cylinder')) return 'cylinder';
    if (idStr.includes('sphere')) return 'sphere';
    return 'box';
  }, [object.id]);

  const objectColor = held ? '#F59E0B' : '#F97316';

  return (
    <mesh
      ref={meshRef}
      userData={{ pickable: object.userData?.pickable ?? true }}
    >
      {geometry === 'box' && <boxGeometry args={[0.56, 0.5, 0.56]} />}
      {geometry === 'cylinder' && <cylinderGeometry args={[0.22, 0.22, 0.5, 20]} />}
      {geometry === 'sphere' && <sphereGeometry args={[0.28, 24, 24]} />}
      <meshStandardMaterial
        color={objectColor}
        roughness={0.3}
        metalness={0.1}
        emissive={held ? '#B45309' : '#7C2D12'}
        emissiveIntensity={held ? 0.75 : 0.3}
      />
      <Html position={[0, 0.42, 0]} center style={{ pointerEvents: 'none' }}>
        <div style={{
          backgroundColor: held ? 'rgba(245,158,11,0.92)' : 'rgba(249,115,22,0.9)',
          color: '#111827',
          fontWeight: 700,
          fontSize: '11px',
          padding: '2px 8px',
          borderRadius: '999px',
          border: '1px solid rgba(17,24,39,0.2)',
          whiteSpace: 'nowrap',
        }}>
          SIM BOX
        </div>
      </Html>
    </mesh>
  );
}

interface WorkspaceCanvasProps {
  robotModelUrl: string;
  simulationMode?: boolean;
  simulationPaused?: boolean;
  simState?: SimState | null;
  onSimStateChange?: (state: SimState) => void;
  targets?: Target[];
  children?: ReactNode;
}

export default function WorkspaceCanvas({
  robotModelUrl,
  simulationMode = false,
  simulationPaused = false,
  simState,
  targets = [],
  children
}: WorkspaceCanvasProps) {
  // Shared world-space position of the robot's gripper tip — written by the robot, read by held objects
  const gripperWorldRef = useRef<THREE.Vector3>(new THREE.Vector3());
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 0 }}>
      <ErrorBoundary fallback={<div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff4444', backgroundColor: '#fee' }}>Failed to load 3D model</div>}>
        <Canvas gl={{ preserveDrawingBuffer: true }} shadows dpr={[1, 2]} camera={{ position: [0, 1.2, 3.5], fov: 50 }}>
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
                {/* Static Target Markers - NOT parented to anything, fixed in world space */}
                {targets.map((target) => (
                  <SimTargetMarker
                    key={`sim-target-${target.id}`}
                    target={target}
                    isActive={(simState?.currentBlockIndex ?? -1) >= 0}
                  />
                ))}

                {/* Simulated Robot - moves independently */}
                {simState && (
                  <SimulatedRobot
                    robotModelUrl={robotModelUrl}
                    robotRotation={simState.robotRotation}
                    gripperGoal={simState.gripperGoal}
                    gripperWorldRef={gripperWorldRef}
                    simulationPaused={simulationPaused}
                  />
                )}

                {/* Simulated Objects - track the gripper while held, otherwise stay put */}
                {simState && simState.objects.map((obj) => (
                  <SimulatedObject
                    key={obj.id}
                    object={obj}
                    held={simState.heldObject?.id === obj.id}
                    gripperWorldRef={gripperWorldRef}
                    simulationPaused={simulationPaused}
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