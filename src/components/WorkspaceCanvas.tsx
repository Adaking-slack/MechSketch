import { Suspense, Component, type ReactNode, useRef, useEffect } from 'react';
import type { ErrorInfo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Center, Bounds } from '@react-three/drei';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Vector3 } from 'three';
import { SkeletonUtils } from 'three-stdlib';
import type { Target, PlacedObject } from '../utils/robotStorage';
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
const GOAL_LERP_RATE = 1.8; // gripper goal smoothing — lower = gentler motion
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
// Gripper jaw bones — animated independently of the IK chain.
// Bone.007 / Bone.008 sit on opposite sides of the wrist (Bone.006);
// rotating them around their local X axis opens/closes the gripper.
const JAW_A_BONE_NAMES = ['Bone.007', 'Bone007', 'Bone_007'];
const JAW_B_BONE_NAMES = ['Bone.008', 'Bone008', 'Bone_008'];
// Mesh nodes parented to the jaw bones — their world midpoint is the
// real "between the jaws" attach point for held objects.
const JAW_A_MESH_NAMES = ['Cube.005'];
const JAW_B_MESH_NAMES = ['Cube.004'];
const JAW_AXIS = new THREE.Vector3(1, 0, 0);
const JAW_CLOSE_DELTA = 0.30; // rad — extra rotation from rest pose to closed
const JAW_LERP_RATE = 5.0;
// Toggle to render a small marker at the resolved attach point. Useful for
// verifying that held objects land between the jaws, not at the wrist.
const DEBUG_ATTACH = true;
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
const _vEndPos = new THREE.Vector3();
const _vJawA = new THREE.Vector3();
const _vJawB = new THREE.Vector3();
const _vAttach = new THREE.Vector3();
const _vIkGoal = new THREE.Vector3();
const _qWorld = new THREE.Quaternion();
const _qParent = new THREE.Quaternion();
const _qParentInv = new THREE.Quaternion();
const _qDelta = new THREE.Quaternion();
const _qJawTarget = new THREE.Quaternion();
const _qJawDelta = new THREE.Quaternion();

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

function findFirstByNames(root: THREE.Object3D, names: string[]): THREE.Object3D | null {
  for (const n of names) {
    const found = root.getObjectByName(n);
    if (found) return found;
  }
  return null;
}

interface IKRig {
  endBone: THREE.Object3D | null;
  ikChain: THREE.Object3D[];
  jawA: THREE.Object3D | null;
  jawB: THREE.Object3D | null;
  jawMeshA: THREE.Object3D | null;
  jawMeshB: THREE.Object3D | null;
}

function findIKRig(sceneRoot: THREE.Object3D): IKRig {
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

  const jawA = findFirstByNames(sceneRoot, JAW_A_BONE_NAMES);
  const jawB = findFirstByNames(sceneRoot, JAW_B_BONE_NAMES);
  const jawMeshA = findFirstByNames(sceneRoot, JAW_A_MESH_NAMES);
  const jawMeshB = findFirstByNames(sceneRoot, JAW_B_MESH_NAMES);

  if (endBone && explicitChain.length > 0) {
    return { endBone, ikChain: explicitChain, jawA, jawB, jawMeshA, jawMeshB };
  }

  // Fallback chain: walk from end-effector up through parent bones.
  const fallbackChain: THREE.Object3D[] = [];
  let cur = endBone?.parent ?? null;
  while (cur) {
    if ((cur as THREE.Bone).isBone === true) fallbackChain.unshift(cur);
    cur = cur.parent;
  }

  return { endBone, ikChain: fallbackChain, jawA, jawB, jawMeshA, jawMeshB };
}

interface SimulatedRobotProps {
  robotModelUrl: string;
  robotRotation: number;
  gripperGoal?: { x: number; y: number; z: number };
  gripperOpenness?: number;
  gripperWorldRef: React.MutableRefObject<THREE.Vector3>;
  simulationPaused: boolean;
}

function SimulatedRobot({ robotModelUrl, robotRotation, gripperGoal, gripperOpenness, gripperWorldRef, simulationPaused }: SimulatedRobotProps) {
  const { scene } = useGLTF(robotModelUrl);
  const groupRef = useRef<THREE.Group>(null);
  // Inner group lives inside <Center>. The cloned scene is imperatively
  // added/removed to/from this group via useEffect — never via <primitive> —
  // so attach/detach is fully controlled and the cloned scene cannot end up
  // stuck in the graph from a previous mount (which is what produced the
  // "ghost arm" with shared materials).
  const innerRef = useRef<THREE.Group>(null);

  // Bones resolved from the cloned scene. Stored in refs because useFrame
  // reads them imperatively and we don't need a render to use new values.
  const endBoneRef = useRef<THREE.Object3D | null>(null);
  const ikChainRef = useRef<THREE.Object3D[]>([]);
  const jawARef = useRef<THREE.Object3D | null>(null);
  const jawBRef = useRef<THREE.Object3D | null>(null);

  // Smoothed gripper goal (world-space) for visible motion between waypoints
  const currentGoal = useRef<THREE.Vector3 | null>(null);
  // Cached rest rotations of the jaw bones — captured once so we can layer
  // the open/close delta on top of the model's natural rest pose.
  const restRotA = useRef<THREE.Quaternion | null>(null);
  const restRotB = useRef<THREE.Quaternion | null>(null);
  // Cached attach offset in Bone.006's local frame. Computed once from the
  // visual bounding-box midpoint of the two jaw meshes at rest, so the held
  // object's center sits exactly between the jaws and rides rigidly with the
  // wrist as the arm articulates.
  const attachLocalOffset = useRef<THREE.Vector3 | null>(null);

  // Imperatively clone, attach, resolve, and (on cleanup) detach the scene.
  // Re-runs only when the source scene changes (i.e. robot model swap).
  useEffect(() => {
    const inner = innerRef.current;
    if (!inner || !scene) return;

    const cloned = SkeletonUtils.clone(scene);
    inner.add(cloned);

    const rig = findIKRig(cloned);
    endBoneRef.current = rig.endBone;
    ikChainRef.current = rig.ikChain;
    jawARef.current = rig.jawA;
    jawBRef.current = rig.jawB;
    restRotA.current = rig.jawA ? rig.jawA.quaternion.clone() : null;
    restRotB.current = rig.jawB ? rig.jawB.quaternion.clone() : null;
    // Reset cached state derived from the previous clone, if any.
    attachLocalOffset.current = null;
    currentGoal.current = null;

    return () => {
      inner.remove(cloned);
      // Dispose only geometry copies that the clone owns. Materials are
      // shared with the original cached scene (used by non-sim <Model>),
      // so we must NOT dispose those.
      cloned.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.isMesh && mesh.geometry) {
          // SkeletonUtils.clone shares geometry too — skipping dispose
          // is the safe default to avoid breaking the non-sim view.
        }
      });
      endBoneRef.current = null;
      ikChainRef.current = [];
      jawARef.current = null;
      jawBRef.current = null;
      restRotA.current = null;
      restRotB.current = null;
      attachLocalOffset.current = null;
    };
  }, [scene]);

  // Derive the attach point in Bone.006-local space from the world-space
  // bounding-box centers of the two jaw bones (which include their full
  // descendant geometry). Done lazily on the first useFrame so all parent
  // transforms (drei <Center>, etc.) are guaranteed applied.
  const ensureAttachOffset = () => {
    if (attachLocalOffset.current) return;
    const endBone = endBoneRef.current;
    const jawA = jawARef.current;
    const jawB = jawBRef.current;
    if (!endBone || !jawA || !jawB) return;

    endBone.updateWorldMatrix(true, false);
    jawA.updateWorldMatrix(true, true);
    jawB.updateWorldMatrix(true, true);

    const boxA = new THREE.Box3().setFromObject(jawA);
    const boxB = new THREE.Box3().setFromObject(jawB);
    if (boxA.isEmpty() || boxB.isEmpty()) return;

    const centerA = new THREE.Vector3(); boxA.getCenter(centerA);
    const centerB = new THREE.Vector3(); boxB.getCenter(centerB);
    const attachWorld = centerA.add(centerB).multiplyScalar(0.5);

    const inv = new THREE.Matrix4().copy(endBone.matrixWorld).invert();
    attachLocalOffset.current = attachWorld.applyMatrix4(inv);
    if (DEBUG_ATTACH) {
      console.log('[gripper] attach offset (Bone.006 local):', attachLocalOffset.current.toArray());
    }
  };

  // Resolve the current world-space attach point by transforming the cached
  // local offset through Bone.006's worldMatrix. Falls back to wrist position.
  const computeAttachWorld = (out: THREE.Vector3): boolean => {
    const endBone = endBoneRef.current;
    if (endBone && attachLocalOffset.current) {
      endBone.updateWorldMatrix(true, false);
      out.copy(attachLocalOffset.current).applyMatrix4(endBone.matrixWorld);
      return true;
    }
    if (endBone) {
      endBone.updateWorldMatrix(true, false);
      out.setFromMatrixPosition(endBone.matrixWorld);
      return true;
    }
    return false;
  };

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    ensureAttachOffset();

    const endBone = endBoneRef.current;
    const ikChain = ikChainRef.current;
    const jawA = jawARef.current;
    const jawB = jawBRef.current;

    if (simulationPaused) {
      computeAttachWorld(gripperWorldRef.current);
      return;
    }

    groupRef.current.position.set(0, 0, 0);

    // Drive jaw open/close BEFORE IK so the attach point reflects the new pose.
    const openness = THREE.MathUtils.clamp(gripperOpenness ?? 1, 0, 1);
    const closeAmt = (1 - openness) * JAW_CLOSE_DELTA;
    const jawFactor = Math.min(delta * JAW_LERP_RATE, 1);
    if (jawA && restRotA.current) {
      _qJawDelta.setFromAxisAngle(JAW_AXIS, +closeAmt);
      _qJawTarget.copy(restRotA.current).multiply(_qJawDelta);
      jawA.quaternion.slerp(_qJawTarget, jawFactor);
    }
    if (jawB && restRotB.current) {
      _qJawDelta.setFromAxisAngle(JAW_AXIS, -closeAmt);
      _qJawTarget.copy(restRotB.current).multiply(_qJawDelta);
      jawB.quaternion.slerp(_qJawTarget, jawFactor);
    }

    // Lerp the smoothed gripper goal toward the requested goal. First-frame
    // init from the live attach point avoids a snap from the rest pose.
    if (gripperGoal) {
      if (!currentGoal.current) {
        currentGoal.current = new THREE.Vector3();
        if (computeAttachWorld(_vAttach)) {
          currentGoal.current.copy(_vAttach);
        }
      }
      const goalFactor = Math.min(delta * GOAL_LERP_RATE, 1);
      currentGoal.current.lerp(
        _vToGoal.set(gripperGoal.x, gripperGoal.y, gripperGoal.z),
        goalFactor
      );
    }

    // Run CCD with a goal offset so the *attach point* reaches currentGoal,
    // not the wrist bone (which sits behind the jaws).
    if (endBone && ikChain.length > 0 && currentGoal.current) {
      computeAttachWorld(_vAttach);
      endBone.updateWorldMatrix(true, false);
      _vEndPos.setFromMatrixPosition(endBone.matrixWorld);
      _vIkGoal.copy(currentGoal.current).add(_vEndPos).sub(_vAttach);
      solveCCD(ikChain, endBone, _vIkGoal);
    }

    if (!computeAttachWorld(gripperWorldRef.current)) {
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
        <group ref={innerRef} />
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
  placed?: PlacedObject;
  held: boolean;
  gripperWorldRef: React.MutableRefObject<THREE.Vector3>;
  simulationPaused?: boolean;
}

function SimulatedObject({ object, placed, held, gripperWorldRef, simulationPaused = false }: SimulatedObjectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const initializedRef = useRef(false);
  const tmpVec = useRef(new Vector3());

  const scale = placed?.scale ?? { x: 0.1, y: 0.1, z: 0.1 };
  const rotation = placed?.rotation ?? { x: 0, y: 0, z: 0 };
  const objectColor = placed?.objectData.color || '#8B5CF6';
  const geometryId = placed?.objectData.id || 'box';
  // Center of the object above its base position — used so the gripper holds the
  // object's body rather than its floor anchor point.
  const objectYOffset = scale.y / 2;

  useEffect(() => {
    if (groupRef.current && !initializedRef.current) {
      groupRef.current.position.set(object.position.x, object.position.y + objectYOffset, object.position.z);
      initializedRef.current = true;
    }
  }, [object.position.x, object.position.y, object.position.z, objectYOffset]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (simulationPaused) return;

    if (held) {
      // Track the live (animated) gripper position so the object hangs off the arm tip
      groupRef.current.position.lerp(gripperWorldRef.current, Math.min(delta * 8, 1));
    } else {
      tmpVec.current.set(object.position.x, object.position.y + objectYOffset, object.position.z);
      groupRef.current.position.lerp(tmpVec.current, Math.min(delta * 6, 1));
    }
  });

  const renderGeometry = () => {
    switch (geometryId) {
      case 'cylinder':
        return (
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[scale.x / 2, scale.x / 2, scale.y, 24]} />
            <meshStandardMaterial color={objectColor} roughness={0.3} metalness={0.1} />
          </mesh>
        );
      case 'sphere':
        return (
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <sphereGeometry args={[scale.x / 2, 24, 24]} />
            <meshStandardMaterial color={objectColor} roughness={0.2} metalness={0.05} />
          </mesh>
        );
      case 'pallet':
        return (
          <group>
            <mesh position={[0, -scale.y / 2 + 0.02, 0]} receiveShadow>
              <boxGeometry args={[scale.x, 0.04, scale.z]} />
              <meshStandardMaterial color="#8B6914" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0, 0]} receiveShadow>
              <boxGeometry args={[scale.x - 0.05, scale.y, scale.z - 0.05]} />
              <meshStandardMaterial color="#A07814" roughness={0.7} />
            </mesh>
          </group>
        );
      case 'box':
      default:
        return (
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[scale.x, scale.y, scale.z]} />
            <meshStandardMaterial color={objectColor} roughness={0.3} metalness={0.1} />
          </mesh>
        );
    }
  };

  return (
    <group
      ref={groupRef}
      rotation={[rotation.x, rotation.y, rotation.z]}
      userData={{ pickable: object.userData?.pickable ?? true }}
    >
      {renderGeometry()}
    </group>
  );
}

// Renders a small bright sphere at the current gripper attach world position,
// used to verify the held-object mount point. Toggled via DEBUG_ATTACH.
function AttachDebugMarker({ gripperWorldRef }: { gripperWorldRef: React.MutableRefObject<THREE.Vector3> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (meshRef.current) meshRef.current.position.copy(gripperWorldRef.current);
  });
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.04, 16, 16]} />
      <meshBasicMaterial color="#FF1744" depthTest={false} transparent opacity={0.9} />
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
  placedObjects?: PlacedObject[];
  children?: ReactNode;
}

export default function WorkspaceCanvas({
  robotModelUrl,
  simulationMode = false,
  simulationPaused = false,
  simState,
  targets = [],
  placedObjects = [],
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
                    gripperOpenness={simState.gripperOpenness}
                    gripperWorldRef={gripperWorldRef}
                    simulationPaused={simulationPaused}
                  />
                )}

                {/* Simulated Objects - track the gripper while held, otherwise stay put */}
                {simState && simState.objects.map((obj) => (
                  <SimulatedObject
                    key={obj.id}
                    object={obj}
                    placed={placedObjects.find(p => p.id === obj.id)}
                    held={simState.heldObject?.id === obj.id}
                    gripperWorldRef={gripperWorldRef}
                    simulationPaused={simulationPaused}
                  />
                ))}

                {DEBUG_ATTACH && simState && (
                  <AttachDebugMarker gripperWorldRef={gripperWorldRef} />
                )}
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