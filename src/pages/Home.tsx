import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import LeftPanel from '../components/LeftPanel';
import TopNav from '../components/TopNav';
import WorkspaceCanvas from '../components/WorkspaceCanvas';
import SequencePanel from '../components/SequencePanel';
import PropertiesPanel from '../components/PropertiesPanel';
import TargetPropertiesPanel from '../components/TargetPropertiesPanel';
import ObjectPropertiesPanel from '../components/ObjectPropertiesPanel';
import InteractiveObject from '../components/InteractiveObject';
import { type ActionCardData, type SequenceBlock, type BlockType, getBlockParams } from '../data/robots.data';
import { loadSelectedRobot, loadProjectName, saveProjectName, loadSelectedObject, loadTargets, addTarget, removeTarget, type Target, type TargetType, getTargetColor, loadObjectState, saveObjectState, type PlacedObject, type ObjectState } from '../utils/robotStorage';
import { initSimState, type SimState, type SimObject, saveSimulation, loadSavedSimulations, loadPendingSimulationState, type SavedSimulation } from '../utils/simState';
import TargetViewer from '../components/TargetViewer';

export default function Home() {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [simulationMode, setSimulationMode] = useState(false);
  const [simulationPaused, setSimulationPaused] = useState(false);
  const [simulationCompleted, setSimulationCompleted] = useState(false);
  const [showStartNewModal, setShowStartNewModal] = useState(false);
  const [showNoActionsModal, setShowNoActionsModal] = useState(false);
  const [showNoTargetsModal, setShowNoTargetsModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [currentSaveId, setCurrentSaveId] = useState<string | null>(null);
  const [highlightAddTarget, setHighlightAddTarget] = useState(false);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const navigate = useNavigate();
  
  const selectedRobot = loadSelectedRobot();
  const selectedObject = loadSelectedObject();
  const [projectName, setProjectName] = useState(loadProjectName());
  
  const [targets, setTargets] = useState<Target[]>([]);
  const [newlyAddedTargetId, setNewlyAddedTargetId] = useState<string | null>(null);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [editingTargetId, setEditingTargetId] = useState<string | null>(null);
  const [editingObjectId, setEditingObjectId] = useState<string | null>(null);
  
  // Object state for interactive objects in the scene
  const [objectState, setObjectState] = useState<ObjectState>(() => loadObjectState() || { objects: [], selectedObjectId: null, newlyAddedObjectId: null });
  const latestObjectStateRef = useRef<ObjectState>(loadObjectState() || { objects: [], selectedObjectId: null, newlyAddedObjectId: null });
  const [newlyAddedObjectId, setNewlyAddedObjectId] = useState<string | null>(null);
  const hasInitializedRef = useRef(false);
  
  const [sequenceBlocks, setSequenceBlocks] = useState<SequenceBlock[]>([]);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [simState, setSimState] = useState<SimState | null>(null);
  const latestSimStateRef = useRef<SimState | null>(null);
  const [simMessage, setSimMessage] = useState<string | null>(null);
  const canSave = targets.length > 0 && sequenceBlocks.length > 0;
  const simulationRef = useRef<{ running: boolean; timeout: ReturnType<typeof setTimeout> | null; blockIndex: number; phaseTimeouts: ReturnType<typeof setTimeout>[] }>({ running: false, timeout: null, blockIndex: 0, phaseTimeouts: [] });
  const pendingPickObjectIdRef = useRef<string | null>(null);
  const pendingPlacementRef = useRef<{ objectId: string; position: { x: number; y: number; z: number }; targetId: string | null } | null>(null);
  // Time the arm gets to reach a goal before grip/release commits.
  const APPROACH_MS = 2200;
  const POST_ACTION_MS = 700; // small tail after grip/release before next block

  useEffect(() => {
    latestSimStateRef.current = simState;
  }, [simState]);

  useEffect(() => {
    latestObjectStateRef.current = objectState;
  }, [objectState]);

  const resolveHeldObject = useCallback((state: SimState): SimObject | null => {
    if (state.heldObject) return state.heldObject;
    const byState = state.objects.find(o => o.state === 'held' || o.currentHolderId === 'robot');
    if (byState) return byState;
    if (pendingPickObjectIdRef.current) {
      return state.objects.find(o => o.id === pendingPickObjectIdRef.current) ?? null;
    }
    return null;
  }, []);

  const setSimStateTracked = useCallback((updater: (prev: SimState | null) => SimState | null) => {
    setSimState(prev => {
      const next = updater(prev);
      latestSimStateRef.current = next;
      return next;
    });
  }, []);

  const persistPlacedObject = useCallback((objectId: string, position: { x: number; y: number; z: number }) => {
    setObjectState(prev => {
      const next = {
        ...prev,
        objects: prev.objects.map(o => o.id === objectId ? { ...o, position: { ...position } } : o),
      };
      latestObjectStateRef.current = next;
      saveObjectState(next);
      return next;
    });
  }, []);

  const commitSimObjectsToObjectState = useCallback((finalState: SimState) => {
    setObjectState(prev => {
      const next = {
        ...prev,
        objects: prev.objects.map(existingObj => {
          const simObj = finalState.objects.find(so => so.id === existingObj.id);
          if (!simObj) return existingObj;
          return { ...existingObj, position: simObj.position };
        }),
      };
      latestObjectStateRef.current = next;
      saveObjectState(next);
      return next;
    });
  }, []);

  const flushPendingPlacement = useCallback((state: SimState | null): SimState | null => {
    if (!state) return state;
    const pending = pendingPlacementRef.current;
    if (!pending) return state;

    const nextState: SimState = {
      ...state,
      objects: state.objects.map(o =>
        o.id === pending.objectId
          ? { ...o, position: { ...pending.position }, targetId: pending.targetId, state: 'placed', currentHolderId: null }
          : o
      ),
      heldObject: state.heldObject?.id === pending.objectId ? null : state.heldObject,
    };

    persistPlacedObject(pending.objectId, pending.position);
    pendingPlacementRef.current = null;
    pendingPickObjectIdRef.current = null;
    latestSimStateRef.current = nextState;
    return nextState;
  }, [persistPlacedObject]);

  useEffect(() => {
    setTargets(loadTargets());
  }, []);

  // Keep block snapshot coords in sync when their bound target's position changes.
  useEffect(() => {
    setSequenceBlocks(prev => {
      let changed = false;
      const next = prev.map(b => {
        if (!b.params?.targetId) return b;
        const t = targets.find(tt => tt.id === b.params!.targetId);
        if (!t) return b;
        const isPlace = b.type === 'place';
        const xKey = isPlace ? 'targetX' : 'x';
        const yKey = isPlace ? 'targetY' : 'y';
        const zKey = isPlace ? 'targetZ' : 'z';
        const cur = b.params as any;
        if (cur[xKey] === t.position.x && cur[yKey] === t.position.y && cur[zKey] === t.position.z) return b;
        changed = true;
        return { ...b, params: { ...b.params, [xKey]: t.position.x, [yKey]: t.position.y, [zKey]: t.position.z } };
      });
      return changed ? next : prev;
    });
  }, [targets]);

  useEffect(() => {
    const pending = loadPendingSimulationState();
    if (pending) {
      setTargets(pending.targets);
      setSequenceBlocks(pending.sequenceBlocks);
      const pendingId = sessionStorage.getItem('mechsketch_load_simulation_id');
      if (pendingId) {
        setCurrentSaveId(pendingId);
        sessionStorage.removeItem('mechsketch_load_simulation_id');
      }
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showStartNewModal) {
          setShowStartNewModal(false);
        }
        if (showNoActionsModal) {
          setShowNoActionsModal(false);
        }
        if (showNoTargetsModal) {
          setShowNoTargetsModal(false);
        }
        if (showSaveModal) {
          setShowSaveModal(false);
        }
        if (showDeleteProjectModal) {
          setShowDeleteProjectModal(false);
        }
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && sequenceBlocks.length > 0 && !activeBlockId && !editingTargetId) {
        setSequenceBlocks(prev => prev.slice(0, -1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sequenceBlocks, activeBlockId, editingTargetId, showStartNewModal, showNoActionsModal, showNoTargetsModal, showSaveModal]);

  const activeBlock = sequenceBlocks.find(b => b.instanceId === activeBlockId);
  const editingTarget = targets.find(t => t.id === editingTargetId);
  const editingObject = objectState.objects.find(o => o.id === editingObjectId);

  const handleProjectNameChange = useCallback((name: string) => {
    const newName = name || 'Untitled';
    setProjectName(newName);
    saveProjectName(newName);
  }, []);

  const handleSimulate = useCallback(() => {
    console.log('Simulate clicked', { sequenceBlocksLength: sequenceBlocks.length, targetsLength: targets.length, paused: simulationPaused, mode: simulationMode });

    if (simulationMode) {
      if (simulationPaused) {
        console.log('Resuming simulation');
        setSimulationPaused(false);
        setSimStateTracked(s => s ? { ...s, executionState: 'executing' } : s);
        
        const resumeExecution = () => {
          if (!simulationRef.current.running) return;
          
          const blockIndex = simulationRef.current.blockIndex;
          if (blockIndex >= sequenceBlocks.length) {
            console.log('Sequence complete');
            for (const t of simulationRef.current.phaseTimeouts) clearTimeout(t);
            simulationRef.current.phaseTimeouts = [];
            simulationRef.current.running = false;
            setSimulationMode(false);
            setSimulationPaused(false);
            setSimulationCompleted(true);
            setActiveBlockId(null);
            setSimMessage('Simulation complete');
            const finalState = flushPendingPlacement(latestSimStateRef.current);
            if (finalState) {
              commitSimObjectsToObjectState(finalState);
            }
            setSimState(null);
            return;
          }

          const block = sequenceBlocks[blockIndex];
          setActiveBlockId(block.instanceId);

          const target = targets.find(t => {
            if (block.params?.targetId === t.id) return true;
            if (block.params?.targetX !== undefined) {
              const bx = block.params.targetX;
              const by = block.params.targetY || 0;
              const bz = block.params.targetZ || 0;
              return Math.abs(t.position.x - bx) < 0.01 && Math.abs(t.position.y - by) < 0.01 && Math.abs(t.position.z - bz) < 0.01;
            }
            return false;
          });

          let delay = 1000;
          setSimStateTracked(currentState => {
            if (!currentState) return currentState;
            const nextState = { ...currentState, currentBlockIndex: blockIndex };

            switch (block.type) {
              case 'move': {
                let goal: { x: number; y: number; z: number } | null = null;
                if (target) {
                  goal = { ...target.position };
                  nextState.message = `Moving to ${target.name}`;
                  delay = 1500;
                } else if (block.params?.x !== undefined || block.params?.targetX !== undefined) {
                  goal = {
                    x: block.params?.x ?? block.params?.targetX ?? 0,
                    y: block.params?.y ?? block.params?.targetY ?? 0,
                    z: block.params?.z ?? block.params?.targetZ ?? 0,
                  };
                  nextState.message = 'Moving to position';
                  delay = 1500;
                } else {
                  setSimMessage('No position for Move');
                  delay = 500;
                }
                if (goal) {
                  nextState.gripperGoal = goal;
                }
                break;
              }
              case 'pick': {
                let objToPick = null;
                const availableObjects = nextState.objects.filter(o => o.state !== 'held');
                if (target) {
                  objToPick = availableObjects.find(o => o.targetId === target.id);
                  if (!objToPick) {
                    let minDistance = Infinity;
                    for (const o of availableObjects) {
                      const dx = o.position.x - target.position.x;
                      const dz = o.position.z - target.position.z;
                      const dist = Math.sqrt(dx * dx + dz * dz);
                      if (dist < minDistance) {
                        minDistance = dist;
                        objToPick = o;
                      }
                    }
                  }
                } else {
                  let minDistance = Infinity;
                  for (const o of availableObjects) {
                    const dx = o.position.x - nextState.robotPosition.x;
                    const dz = o.position.z - nextState.robotPosition.z;
                    const dist = Math.sqrt(dx * dx + dz * dz);
                    if (dist < minDistance) {
                      minDistance = dist;
                      objToPick = o;
                    }
                  }
                }
                if (objToPick) {
                  pendingPickObjectIdRef.current = objToPick.id;
                  nextState.gripperGoal = { x: objToPick.position.x, y: objToPick.position.y + 0.05, z: objToPick.position.z };
                  nextState.message = `Reaching for ${objToPick.id}`;
                  const objId = objToPick.id;
                  const t = setTimeout(() => {
                    if (!simulationRef.current.running) return;
                    setSimStateTracked(s => {
                      if (!s) return s;
                      const updatedObjects = s.objects.map((o): SimObject => o.id === objId ? { ...o, state: 'held' as const, currentHolderId: 'robot' } : o);
                      const held = updatedObjects.find(o => o.id === objId) ?? null;
                      if (!held) return s;
                      return {
                        ...s,
                        heldObject: held,
                        objects: updatedObjects,
                        message: `Picked ${objId}`,
                      };
                    });
                  }, APPROACH_MS);
                  simulationRef.current.phaseTimeouts.push(t);
                } else {
                  pendingPickObjectIdRef.current = null;
                  nextState.message = 'No object to pick';
                }
                delay = APPROACH_MS + POST_ACTION_MS;
                break;
              }
              case 'place': {
                const heldObj = resolveHeldObject(nextState);
                if (heldObj) {
                  nextState.heldObject = heldObj;
                }

                if (heldObj && target) {
                  const placementY = target.type === 'zone' ? target.position.y + 0.20 : target.position.y + 0.05;
                  const placementPos = { x: target.position.x, y: placementY, z: target.position.z };
                  nextState.gripperGoal = placementPos;
                  nextState.message = `Placing at ${target.name}`;

                  const heldId = heldObj.id;
                  const targetId = target.id;
                  const targetName = target.name;
                  pendingPlacementRef.current = { objectId: heldId, position: placementPos, targetId };
                  const t = setTimeout(() => {
                    if (!simulationRef.current.running) return;
                    setSimStateTracked(s => {
                      if (!s) return s;
                      pendingPickObjectIdRef.current = null;
                      pendingPlacementRef.current = null;
                      persistPlacedObject(heldId, placementPos);
                      return {
                        ...s,
                        objects: s.objects.map(o => o.id === heldId ? { ...o, position: placementPos, targetId, state: 'placed', currentHolderId: null } : o),
                        heldObject: null,
                        message: `Placed at ${targetName}`,
                      };
                    });
                  }, APPROACH_MS);
                  simulationRef.current.phaseTimeouts.push(t);
                } else if (heldObj) {
                  const heldId = heldObj.id;
                  const dropPreview = nextState.gripperGoal ? { ...nextState.gripperGoal } : heldObj.position;
                  pendingPlacementRef.current = { objectId: heldId, position: dropPreview, targetId: null };
                  const t = setTimeout(() => {
                    if (!simulationRef.current.running) return;
                    setSimStateTracked(s => {
                      if (!s) return s;
                      pendingPickObjectIdRef.current = null;
                      pendingPlacementRef.current = null;
                      const drop = s.gripperGoal ? { ...s.gripperGoal } : s.objects.find(o => o.id === heldId)?.position ?? { x: 0, y: 0, z: 0 };
                      persistPlacedObject(heldId, drop);
                      return {
                        ...s,
                        objects: s.objects.map(o => o.id === heldId ? { ...o, position: drop, targetId: null, state: 'placed', currentHolderId: null } : o),
                        heldObject: null,
                        message: 'Placed object',
                      };
                    });
                  }, APPROACH_MS);
                  simulationRef.current.phaseTimeouts.push(t);
                  nextState.message = 'Placing object';
                } else {
                  nextState.message = 'No object held to place';
                }
                delay = APPROACH_MS + POST_ACTION_MS;
                break;
              }
              case 'rotate': {
                const angle = block.params?.angle || 90;
                nextState.robotRotation = (nextState.robotRotation || 0) + (angle * Math.PI / 180);
                nextState.message = `Rotating ${angle}°`;
                delay = 1000;
                break;
              }
              case 'wait': {
                const waitDuration = (block.params?.duration || 1) * 1000;
                nextState.message = `Waiting ${block.params?.duration || 1}s`;
                delay = waitDuration;
                break;
              }
              case 'inspect': {
                nextState.message = 'Inspecting...';
                delay = 1000;
                break;
              }
              default:
                nextState.message = `Unknown action: ${block.type}`;
                delay = 500;
            }
            return nextState;
          });

          simulationRef.current.blockIndex++;
          simulationRef.current.timeout = setTimeout(resumeExecution, delay);
        };
        
        simulationRef.current.timeout = setTimeout(resumeExecution, 500);
      } else {
        console.log('Pausing simulation');
        setSimulationPaused(true);
        setSimStateTracked(s => s ? { ...s, executionState: 'paused' } : s);
        if (simulationRef.current.timeout) {
          clearTimeout(simulationRef.current.timeout);
          simulationRef.current.timeout = null;
        }
      }
      return;
    }

    const runSimulation = () => {
      if (!simulationRef.current.running || simulationPaused) return;

      const blockIndex = simulationRef.current.blockIndex;
      if (blockIndex >= sequenceBlocks.length) {
        console.log('Sequence complete');
        for (const t of simulationRef.current.phaseTimeouts) clearTimeout(t);
        simulationRef.current.phaseTimeouts = [];
        simulationRef.current.running = false;
        setSimulationMode(false);
        setSimulationPaused(false);
        setSimulationCompleted(true);
        setActiveBlockId(null);
        setSimMessage('Simulation complete');

        const finalState = flushPendingPlacement(latestSimStateRef.current);
        if (finalState) {
          commitSimObjectsToObjectState(finalState);
        }

        setSimState(null);
        return;
      }

      const block = sequenceBlocks[blockIndex];
      setActiveBlockId(block.instanceId);

      const target = targets.find(t => {
        if (block.params?.targetId === t.id) return true;
        if (block.params?.targetX !== undefined) {
          const bx = block.params.targetX;
          const by = block.params.targetY || 0;
          const bz = block.params.targetZ || 0;
          return Math.abs(t.position.x - bx) < 0.01 && Math.abs(t.position.y - by) < 0.01 && Math.abs(t.position.z - bz) < 0.01;
        }
        return false;
      });

      let delay = 1000;

      setSimStateTracked(currentState => {
        if (!currentState) return currentState;

        const nextState = { ...currentState, currentBlockIndex: blockIndex };

        switch (block.type) {
          case 'move': {
            let goal: { x: number; y: number; z: number } | null = null;
            if (target) {
              goal = { ...target.position };
              nextState.message = `Moving to ${target.name}`;
              delay = 1500;
            } else if (block.params?.x !== undefined || block.params?.targetX !== undefined) {
              goal = {
                x: block.params?.x ?? block.params?.targetX ?? 0,
                y: block.params?.y ?? block.params?.targetY ?? 0,
                z: block.params?.z ?? block.params?.targetZ ?? 0,
              };
              nextState.message = 'Moving to position';
              delay = 1500;
            } else {
              setSimMessage('No position for Move');
              delay = 500;
            }
            if (goal) {
              // Base is fixed at origin — only joints bend via IK to reach the goal.
              nextState.gripperGoal = goal;
            }
            break;
          }
          case 'pick': {
            console.log('Pick action - objects:', JSON.stringify(nextState.objects, null, 2));

            let objToPick = null;

            // Get all objects that are not currently held
            const availableObjects = nextState.objects.filter(o => o.state !== 'held');

            console.log('Available objects:', JSON.stringify(availableObjects, null, 2));

            if (target) {
              // First, try to find object assigned to this specific target
              objToPick = availableObjects.find(o => o.targetId === target.id);
              console.log('Object with matching targetId:', objToPick);

              // If no object assigned to this target, find the nearest one
              if (!objToPick) {
                let minDistance = Infinity;
                for (const o of availableObjects) {
                  const dx = o.position.x - target.position.x;
                  const dz = o.position.z - target.position.z;
                  const dist = Math.sqrt(dx * dx + dz * dz);
                  if (dist < minDistance) {
                    minDistance = dist;
                    objToPick = o;
                  }
                }
                console.log('Nearest object to target:', objToPick, 'distance:', minDistance);
              }
            } else {
              // No target specified - pick the closest available object to robot
              const currentPos = nextState.robotPosition;
              let minDistance = Infinity;
              for (const o of availableObjects) {
                const dx = o.position.x - currentPos.x;
                const dz = o.position.z - currentPos.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                if (dist < minDistance) {
                  minDistance = dist;
                  objToPick = o;
                }
              }
              console.log('Nearest object to robot:', objToPick, 'distance:', minDistance);
            }

            if (objToPick) {
              pendingPickObjectIdRef.current = objToPick.id;
              // Phase 1: only set the gripper goal so the arm reaches toward the box.
              // The box stays still — we attach it after the arm arrives.
              nextState.gripperGoal = { x: objToPick.position.x, y: objToPick.position.y + 0.05, z: objToPick.position.z };
              nextState.message = `Reaching for ${objToPick.id}`;

              const objId = objToPick.id;
              const t = setTimeout(() => {
                if (!simulationRef.current.running) return;
                setSimStateTracked(s => {
                  if (!s) return s;
                  const updatedObjects = s.objects.map((o): SimObject => o.id === objId ? { ...o, state: 'held' as const, currentHolderId: 'robot' } : o);
                  const held = updatedObjects.find(o => o.id === objId) ?? null;
                  if (!held) return s;
                  return {
                    ...s,
                    heldObject: held,
                    objects: updatedObjects,
                    message: `Picked ${objId}`,
                  };
                });
              }, APPROACH_MS);
              simulationRef.current.phaseTimeouts.push(t);
            } else {
              pendingPickObjectIdRef.current = null;
              nextState.message = 'No object to pick';
            }
            delay = APPROACH_MS + POST_ACTION_MS;
            break;
          }
          case 'place': {
            const heldObj = resolveHeldObject(nextState);
            if (heldObj) {
              nextState.heldObject = heldObj;
            }

            if (heldObj && target) {
              // Phase 1: set the gripper goal to the placement spot. The held box rides the gripper
              // through IK because state stays 'held' until the arm arrives.
              const placementY = target.type === 'zone' ? target.position.y + 0.20 : target.position.y + 0.05;
              const placementPos = { x: target.position.x, y: placementY, z: target.position.z };
              nextState.gripperGoal = placementPos;
              nextState.message = `Placing at ${target.name}`;

              const heldId = heldObj.id;
              const targetId = target.id;
              const targetName = target.name;
              pendingPlacementRef.current = { objectId: heldId, position: placementPos, targetId };
              const t = setTimeout(() => {
                if (!simulationRef.current.running) return;
                setSimStateTracked(s => {
                  if (!s) return s;
                  pendingPickObjectIdRef.current = null;
                  pendingPlacementRef.current = null;
                  persistPlacedObject(heldId, placementPos);
                  return {
                    ...s,
                    objects: s.objects.map(o => o.id === heldId ? { ...o, position: placementPos, targetId, state: 'placed', currentHolderId: null } : o),
                    heldObject: null,
                    message: `Placed at ${targetName}`,
                  };
                });
              }, APPROACH_MS);
              simulationRef.current.phaseTimeouts.push(t);
            } else if (heldObj) {
              // No target specified — drop where the gripper currently is.
              const heldId = heldObj.id;
              const dropPreview = nextState.gripperGoal ? { ...nextState.gripperGoal } : heldObj.position;
              pendingPlacementRef.current = { objectId: heldId, position: dropPreview, targetId: null };
              const t = setTimeout(() => {
                if (!simulationRef.current.running) return;
                setSimStateTracked(s => {
                  if (!s) return s;
                  pendingPickObjectIdRef.current = null;
                  pendingPlacementRef.current = null;
                  // Use last known gripper goal as drop point, falling back to current heldObject position.
                  const drop = s.gripperGoal ? { ...s.gripperGoal } : s.objects.find(o => o.id === heldId)?.position ?? { x: 0, y: 0, z: 0 };
                  persistPlacedObject(heldId, drop);
                  return {
                    ...s,
                    objects: s.objects.map(o => o.id === heldId ? { ...o, position: drop, targetId: null, state: 'placed', currentHolderId: null } : o),
                    heldObject: null,
                    message: 'Placed object',
                  };
                });
              }, APPROACH_MS);
              simulationRef.current.phaseTimeouts.push(t);
              nextState.message = 'Placing object';
            } else {
              nextState.message = 'No object held to place';
            }
            delay = APPROACH_MS + POST_ACTION_MS;
            break;
          }
          case 'rotate': {
            const angle = block.params?.angle || 90;
            nextState.robotRotation = (nextState.robotRotation || 0) + (angle * Math.PI / 180);
            nextState.message = `Rotating ${angle}°`;
            delay = 1000;
            break;
          }
          case 'wait': {
            const waitDuration = (block.params?.duration || 1) * 1000;
            nextState.message = `Waiting ${block.params?.duration || 1}s`;
            delay = waitDuration;
            break;
          }
          case 'inspect': {
            nextState.message = 'Inspecting...';
            delay = 1000;
            break;
          }
          default:
            nextState.message = `Unknown action: ${block.type}`;
            delay = 500;
        }

        return nextState;
      });

simulationRef.current.blockIndex++;
      simulationRef.current.timeout = setTimeout(runSimulation, delay);
    }
    
    if (sequenceBlocks.length === 0) {
      setShowNoActionsModal(true);
      return;
    }

    if (targets.length === 0) {
      console.log('No targets defined');
      setShowNoTargetsModal(true);
      return;
    }

    if (objectState.objects.length === 0) {
      console.log('No objects defined');
      setSimMessage('No objects defined');
      return;
    }

    console.log('Starting sequence simulation');
    setSimMessage(null);
    setSimulationMode(true);
    setSimulationPaused(false);
    setSimulationCompleted(false);
    setEditingTargetId(null);
    setActiveBlockId(null);
    setSelectedTargetId(null);

    const initialState = initSimState(objectState.objects, targets);
    initialState.currentBlockIndex = 0;
    initialState.isPlaying = true;
    initialState.executionState = 'executing';
    latestSimStateRef.current = initialState;
    pendingPickObjectIdRef.current = null;
    pendingPlacementRef.current = null;
    setSimState(initialState);

    simulationRef.current.running = true;
    simulationRef.current.blockIndex = 0;
    simulationRef.current.phaseTimeouts = [];

    simulationRef.current.timeout = setTimeout(runSimulation, 500);
  }, [sequenceBlocks, targets, objectState.objects, resolveHeldObject, persistPlacedObject, setSimStateTracked, commitSimObjectsToObjectState]);

  const handleAddAction = useCallback((action: ActionCardData) => {
    const blockType = selectedRobot?.actionMap?.[action.id] || action.id.replace('action-', '').replace('-scara', '').replace('action-', '') as BlockType;
    
    const newBlock: SequenceBlock = {
      instanceId: `${action.id}-${Date.now()}`,
      type: blockType,
      label: action.label,
      icon: action.icon,
      theme: action.theme,
      params: getBlockParams(blockType),
    };
    setSequenceBlocks(prev => [...prev, newBlock]);
  }, [selectedRobot]);

  const handleBlockSelect = useCallback((instanceId: string) => {
    setActiveBlockId(instanceId);
    setEditingTargetId(null);
  }, []);

  const handleBlockDelete = useCallback((instanceId: string) => {
    setSequenceBlocks(prev => prev.filter(b => b.instanceId !== instanceId));
    if (activeBlockId === instanceId) {
      setActiveBlockId(null);
    }
  }, [activeBlockId]);

  const handleParamsChange = useCallback((instanceId: string, params: any) => {
    setSequenceBlocks(prev => prev.map(b => 
      b.instanceId === instanceId ? { ...b, params } : b
    ));
  }, []);

  const handleBackToSequence = useCallback(() => {
    setActiveBlockId(null);
    setEditingTargetId(null);
    setEditingObjectId(null);
  }, []);

  const handleTargetSelectFromCanvas = useCallback((id: string) => {
    setSelectedTargetId(id);
    setEditingTargetId(id);
    setActiveBlockId(null);
  }, []);

  const handleTargetUpdate = useCallback((updated: Target) => {
    setTargets(prev => prev.map(t => t.id === updated.id ? updated : t));
  }, []);

  const handleAddTarget = useCallback((type: TargetType) => {
    const count = targets.length + 1;
    const newTarget: Target = {
      id: `target-${Date.now()}`,
      type,
      name: `${type === 'point' ? 'Point' : 'Zone'} ${count}`,
      position: { x: 0, y: 0, z: 0 },
      size: type === 'zone' ? { width: 0.4, depth: 0.4 } : undefined,  // Larger default size
      color: getTargetColor(type),
    };
    addTarget(newTarget);
    setTargets(prev => [...prev, newTarget]);
    
    // Track newly added target for highlight animation
    setNewlyAddedTargetId(newTarget.id);
    setTimeout(() => setNewlyAddedTargetId(null), 3000);
  }, [targets]);

  const handleDeleteTarget = useCallback((id: string) => {
    removeTarget(id);
    setTargets(prev => prev.filter(t => t.id !== id));
    if (selectedTargetId === id) {
      setSelectedTargetId(null);
    }
    if (editingTargetId === id) {
      setEditingTargetId(null);
    }
  }, [selectedTargetId, editingTargetId]);

  const handleStopSimulate = useCallback(() => {
    console.log('Stopping simulation');
    if (simulationRef.current.timeout) {
      clearTimeout(simulationRef.current.timeout);
      simulationRef.current.timeout = null;
    }
    for (const t of simulationRef.current.phaseTimeouts) clearTimeout(t);
    simulationRef.current.phaseTimeouts = [];
    pendingPickObjectIdRef.current = null;
    pendingPlacementRef.current = null;
    simulationRef.current.running = false;
    setSimulationMode(false);
    setSimulationPaused(false);
    setSimMessage(null);
    setActiveBlockId(null);

    const finalState = flushPendingPlacement(latestSimStateRef.current);
    if (finalState) {
      commitSimObjectsToObjectState(finalState);
    }

    setSimState(null);
  }, [commitSimObjectsToObjectState, flushPendingPlacement]);

  const handleStartNewClick = useCallback(() => {
    setShowStartNewModal(true);
  }, []);

  const handleStartNewConfirm = useCallback(() => {
    console.log('Starting new project');
    setShowStartNewModal(false);
    setSimulationMode(false);
    setSimulationPaused(false);
    setSimulationCompleted(false);
    setSimState(null);
    setSimMessage(null);
    setSequenceBlocks([]);
    setActiveBlockId(null);
    setTargets([]);
    setSelectedTargetId(null);
    setEditingTargetId(null);
    setCurrentSaveId(null);

    const emptyObjectState = { objects: [], selectedObjectId: null, newlyAddedObjectId: null };
    setObjectState(emptyObjectState);
    saveObjectState(emptyObjectState);
  }, []);

  const handleSettings = useCallback(() => {
    console.log('Settings clicked');
  }, []);

  const handleLogout = useCallback(() => {
    console.log('Logging out');
    setSimulationMode(false);
    setSimulationPaused(false);
    setSimulationCompleted(false);
    setSimState(null);
    setSimMessage(null);
    if (simulationRef.current.timeout) {
      clearTimeout(simulationRef.current.timeout);
      simulationRef.current.timeout = null;
    }
    navigate('/auth?view=login');
  }, [navigate]);

  const handleSave = useCallback(() => {
    setSaveName(currentSaveId 
      ? (loadSavedSimulations().find(s => s.id === currentSaveId)?.name || `${projectName} - ${new Date().toLocaleString()}`)
      : `${projectName} - ${new Date().toLocaleString()}`
    );
    setShowSaveModal(true);
  }, [currentSaveId, projectName]);

  const handleStartNewCancel = useCallback(() => {
    setShowStartNewModal(false);
  }, []);

  const handleNoActionsModalDismiss = useCallback(() => {
    setShowNoActionsModal(false);
  }, []);

  const handleNoActionsModalGoToSequence = useCallback(() => {
    setShowNoActionsModal(false);
    setRightOpen(true);
  }, []);

  const handleNoTargetsModalDismiss = useCallback(() => {
    setShowNoTargetsModal(false);
  }, []);

  const handleNoTargetsModalAddTarget = useCallback(() => {
    setShowNoTargetsModal(false);
    setLeftOpen(true);
    setHighlightAddTarget(true);
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightAddTarget(false);
      highlightTimeoutRef.current = null;
    }, 4000);
  }, []);

  const handleDismissHighlight = useCallback(() => {
    setHighlightAddTarget(false);
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = null;
    }
  }, []);

  const handleDeleteProjectClick = useCallback(() => {
    setShowDeleteProjectModal(true);
  }, []);

  const handleDeleteProjectConfirm = useCallback(() => {
    const allSims = loadSavedSimulations();
    const filtered = allSims.filter(s => s.projectName !== projectName);
    sessionStorage.setItem('mechsketch_saved_simulations', JSON.stringify(filtered));
    setShowDeleteProjectModal(false);
    setSequenceBlocks([]);
    setTargets([]);
    setCurrentSaveId(null);
    setSimulationMode(false);
    setSimulationPaused(false);
    setSimulationCompleted(false);
    setSimState(null);
    const emptyObjectState = { objects: [], selectedObjectId: null, newlyAddedObjectId: null };
    setObjectState(emptyObjectState);
    saveObjectState(emptyObjectState);
    navigate('/planner');
  }, [projectName, navigate]);

  const handleDeleteProjectCancel = useCallback(() => {
    setShowDeleteProjectModal(false);
  }, []);

  // Automatically add the selected object to the scene if it doesn't match the current one
  useEffect(() => {
    // Only run during initial setup - not during simulation
    if (simulationMode || !selectedObject || hasInitializedRef.current) {
      return;
    }
    
    hasInitializedRef.current = true;
    
    const hasMatchingObject = objectState.objects.some(obj => obj.objectData.id === selectedObject.id);
    
    if (!hasMatchingObject) {
      const defaultSize = selectedObject.defaultSize || { x: 0.1, y: 0.1, z: 0.1 };
      
      // Place the object prominently in the foreground so the user sees it immediately
      const position = { x: 0.4, y: 0, z: 0.6 };
      
      const newObject: PlacedObject = {
        id: `object-${Date.now()}`,
        objectData: selectedObject,
        position,
        scale: defaultSize,
        rotation: { x: 0, y: 0, z: 0 },
      };
      
      const updatedState = {
        ...objectState,
        objects: [newObject], // Replace the scene objects with the newly selected one
        selectedObjectId: newObject.id,
        newlyAddedObjectId: newObject.id,
      };
      
      setObjectState(updatedState);
      saveObjectState(updatedState);
      
      setNewlyAddedObjectId(newObject.id);
      setTimeout(() => {
        setNewlyAddedObjectId(null);
        setObjectState(prev => ({ ...prev, newlyAddedObjectId: null }));
      }, 2000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedObject?.id]);

    const handleObjectPositionChange = useCallback((objectId: string, position: { x: number; y: number; z: number }) => {
    setObjectState(prev => {
      const updated = {
        ...prev,
        objects: prev.objects.map(o => o.id === objectId ? { ...o, position } : o),
      };
      saveObjectState(updated);
      return updated;
    });
  }, []);

  const handleSelectObject = useCallback((objectId: string) => {
    const updatedState = { ...objectState, selectedObjectId: objectId };
    setObjectState(updatedState);
    saveObjectState(updatedState);
    setEditingObjectId(objectId);
    setActiveBlockId(null);
    setEditingTargetId(null);
  }, [objectState]);

  const handleObjectUpdate = useCallback((updated: PlacedObject) => {
    setObjectState(prev => {
      const next = { ...prev, objects: prev.objects.map(o => o.id === updated.id ? updated : o) };
      saveObjectState(next);
      return next;
    });
  }, []);

  const handleShare = useCallback(() => {
    let sanitizedRobot = null;
    if (selectedRobot) {
      // Omit all available system actions to ensure export only contains the user's arranged sequence
      const { primaryActions, secondaryActions, actionMap, ...robotDetails } = selectedRobot;
      sanitizedRobot = robotDetails;
    }

    const exportData = {
      projectName,
      robot: sanitizedRobot,
      object: selectedObject,
      targets: targets,
      sequenceBlocks: sequenceBlocks,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName.replace(/\s+/g, '_')}_task_sequence.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [projectName, selectedRobot, selectedObject, targets, sequenceBlocks]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', backgroundColor: '#f7f8f9', overflow: 'hidden', fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      <TopNav
        projectName={projectName}
        onProjectNameChange={handleProjectNameChange}
        onSimulate={handleSimulate}
        onExport={handleShare}
        hasSequence={sequenceBlocks.length > 0}
        onStop={handleStopSimulate}
        onStartNew={handleStartNewClick}
        onSettings={handleSettings}
        onLogout={handleLogout}
        onSave={handleSave}
        onHome={() => navigate('/planner')}
        onDeleteProject={handleDeleteProjectClick}
        canSave={canSave}
        simulationMode={simulationMode}
        simulationPaused={simulationPaused}
        simulationCompleted={simulationCompleted}
        robotName={selectedRobot?.name}
        objectName={selectedObject?.name}
      />

      <div style={{ display: 'flex', flex: 1, position: 'relative', overflow: 'hidden' }}>
        <aside style={{ width: simulationMode && !simulationCompleted ? 0 : (leftOpen ? '280px' : '0px'), height: '100%', backgroundColor: '#ffffff', borderRight: leftOpen && !(simulationMode && !simulationCompleted) ? '1px solid #e2e8f0' : 'none', boxShadow: leftOpen && !(simulationMode && !simulationCompleted) ? '4px 0 16px rgba(0,0,0,0.02)' : 'none', zIndex: 10, transition: 'all 0.3s', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {!(simulationMode && !simulationCompleted) && <div style={{ width: '280px', padding: '24px', boxSizing: 'border-box', height: '100%', overflow: 'hidden' }}>
            <LeftPanel robot={selectedRobot} onActionClick={handleAddAction} targets={targets} selectedTargetId={selectedTargetId} onTargetSelect={handleTargetSelectFromCanvas} onAddTarget={handleAddTarget} onDeleteTarget={handleDeleteTarget} highlightAddTarget={highlightAddTarget} onDismissHighlight={handleDismissHighlight} />
          </div>}
        </aside>

        <button onClick={() => setLeftOpen(!leftOpen)} style={{ position: 'absolute', left: leftOpen ? '266px' : '16px', top: '24px', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 20, color: '#4a5568' }}>
          {leftOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        <main style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 0, margin: '16px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f0f2f5', backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
          {selectedRobot ? (
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
<WorkspaceCanvas robotModelUrl={selectedRobot.model} simulationMode={simulationMode} simulationPaused={simulationPaused} simState={simState} targets={targets}>
                {simulationMode && targets.length > 0 && (
                  <TargetViewer targets={targets} selectedTargetId={null} onTargetSelect={() => {}} newlyAddedTargetId={null} />
                )}
                {!simulationMode && targets.length > 0 && (
                  <TargetViewer targets={targets} selectedTargetId={selectedTargetId} onTargetSelect={handleTargetSelectFromCanvas} newlyAddedTargetId={newlyAddedTargetId} />
                )}
                
                {/* Interactive Objects */}
                {!simulationMode && objectState.objects.map((obj) => (
                  <InteractiveObject
                    key={obj.id}
                    objectData={obj.objectData}
                    position={obj.position}
                    scale={obj.scale}
                    rotation={obj.rotation}
                    isSelected={objectState.selectedObjectId === obj.id}
                    isNew={newlyAddedObjectId === obj.id}
                    onSelect={() => handleSelectObject(obj.id)}
                    onPositionChange={(pos) => handleObjectPositionChange(obj.id, pos)}
                  />
                ))}
              </WorkspaceCanvas>
              {simulationMode && (
                <div style={{ position: 'absolute', top: '16px', left: '16px', padding: '12px 24px', backgroundColor: simMessage?.includes('complete') ? 'rgba(16, 185, 129, 0.9)' : (simMessage?.includes('No') ? 'rgba(239, 68, 68, 0.9)' : 'rgba(0, 55, 110, 0.95)'), borderRadius: '8px', color: 'white', fontSize: '14px', fontWeight: 500 }}>
                  {simState?.isPlaying ? (simState.message || 'Simulating...') : (simMessage || 'Ready')}
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: '#94a3b8', fontWeight: 500, fontSize: '14px' }}>Select a robot to begin</div>
          )}
        </main>

        <button onClick={() => setRightOpen(!rightOpen)} style={{ position: 'absolute', right: rightOpen ? '326px' : '16px', top: '24px', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 20, color: '#4a5568' }}>
          {rightOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <aside style={{ width: rightOpen ? '360px' : '0px', height: '100%', backgroundColor: '#ffffff', borderLeft: rightOpen ? '1px solid #e2e8f0' : 'none', boxShadow: rightOpen ? '-4px 0 16px rgba(0,0,0,0.02)' : 'none', zIndex: 10, transition: 'all 0.3s', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ width: '360px', height: '100%', position: 'relative', overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '100%', padding: '24px', boxSizing: 'border-box', overflowY: 'auto' }}>
              <SequencePanel blocks={sequenceBlocks} activeBlockId={activeBlockId} onBlockSelect={handleBlockSelect} onBlockDelete={handleBlockDelete} onBlockReorder={setSequenceBlocks} targets={targets} />
            </div>
            
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', boxShadow: '0 -4px 16px rgba(0,0,0,0.05)', borderTopLeftRadius: '16px', borderTopRightRadius: '16px', transform: (activeBlock || editingTarget || editingObject) ? 'translateY(0)' : 'translateY(100%)', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 30, maxHeight: '80%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ width: '36px', height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px' }} />
              </div>
              <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                {editingObject ? (
                  <ObjectPropertiesPanel
                    object={editingObject}
                    targets={targets}
                    onBack={handleBackToSequence}
                    onObjectUpdate={handleObjectUpdate}
                  />
                ) : editingTarget ? (
                  <TargetPropertiesPanel
                    target={editingTarget}
                    onBack={handleBackToSequence}
                    onTargetUpdate={handleTargetUpdate}
                  />
                ) : activeBlock ? (
                  <PropertiesPanel
                    type={activeBlock.type}
                    label={activeBlock.label}
                    icon={activeBlock.icon}
                    params={activeBlock.params}
                    onParamsChange={(params) => handleParamsChange(activeBlock.instanceId, params)}
                    onBack={handleBackToSequence}
                    targets={targets}
                    selectedTargetId={selectedTargetId}
                    onTargetSelect={handleTargetSelectFromCanvas}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {showStartNewModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }} onClick={handleStartNewCancel}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: 600, color: '#1a1a1a' }}>
              Start a New Project?
            </h2>
            <p style={{ margin: '0 0 24px 0', fontSize: '15px', color: '#555', lineHeight: 1.5 }}>
              This will clear your current workspace, including all objects, robot actions, and sequences. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={handleStartNewCancel}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  backgroundColor: '#fff',
                  color: '#333',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}>
                Cancel
              </button>
              <button
                onClick={handleStartNewConfirm}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#EF4444',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}>
                Start New
              </button>
            </div>
          </div>
        </div>
      )}

      {showNoActionsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }} onClick={handleNoActionsModalDismiss}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: 600, color: '#1a1a1a' }}>
              Nothing to Simulate Yet
            </h2>
            <p style={{ margin: '0 0 24px 0', fontSize: '15px', color: '#555', lineHeight: 1.5 }}>
              You haven&apos;t added any actions to your sequence yet. Add at least one action card before running the simulation.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={handleNoActionsModalDismiss}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  backgroundColor: '#fff',
                  color: '#333',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}>
                Dismiss
              </button>
              <button
                onClick={handleNoActionsModalGoToSequence}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#00376E',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}>
                Add Actions
              </button>
            </div>
          </div>
        </div>
      )}

      {showNoTargetsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }} onClick={handleNoTargetsModalDismiss}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: 600, color: '#1a1a1a' }}>
              No Target Found
            </h2>
            <p style={{ margin: '0 0 24px 0', fontSize: '15px', color: '#555', lineHeight: 1.5 }}>
              You can&apos;t run a simulation because no target has been placed in the scene. Add at least one target to continue.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={handleNoTargetsModalDismiss}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  backgroundColor: '#fff',
                  color: '#333',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}>
                Dismiss
              </button>
              <button
                onClick={handleNoTargetsModalAddTarget}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#00376E',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}>
                Add Target
              </button>
            </div>
          </div>
        </div>
)}

      {showSaveModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setShowSaveModal(false)}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 600, color: '#1a1a1a' }}>
              Save Simulation
            </h2>
            <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#555', lineHeight: 1.5 }}>
              Enter a name for this simulation:
            </p>
            <input
              value={saveName}
              onChange={e => setSaveName(e.target.value)}
              placeholder="Enter simulation name"
              autoFocus
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '15px',
                color: '#1a1a1a',
                outline: 'none',
                marginBottom: '20px',
                boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = '#00376E'}
              onBlur={e => e.target.style.borderColor = '#ddd'}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowSaveModal(false)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  backgroundColor: '#fff',
                  color: '#333',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}>
                Cancel
              </button>
              <button
                onClick={() => {
                  let thumbnailDataUrl = '';
                  const canvas = document.querySelector('canvas');
                  if (canvas) {
                    try {
                      thumbnailDataUrl = canvas.toDataURL('image/webp', 0.5);
                    } catch(e) {
                      console.error("Failed to capture thumbnail", e);
                    }
                  }

                  const savedSimulation: SavedSimulation = {
                    id: currentSaveId || `sim-${Date.now()}`,
                    name: saveName || `${projectName} - ${new Date().toLocaleString()}`,
                    projectName: projectName,
                    savedAt: new Date().toISOString(),
                    targets: targets,
                    sequenceBlocks: sequenceBlocks,
                    state: simState || initSimState(objectState.objects, targets),
                    robotId: selectedRobot?.id,
                    robotModelUrl: selectedRobot?.model,
                    thumbnail: thumbnailDataUrl,
                    createdAt: currentSaveId ? undefined : new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  };
                  saveSimulation(savedSimulation);
                  setCurrentSaveId(savedSimulation.id);
                  setShowSaveModal(false);
                  setSimMessage('Work saved successfully');
                  setTimeout(() => setSimMessage(null), 2000);
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#00376E',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}>
                Save File
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteProjectModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }} onClick={handleDeleteProjectCancel}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: 600, color: '#1a1a1a' }}>
              Delete Project?
            </h2>
            <p style={{ margin: '0 0 24px 0', fontSize: '15px', color: '#555', lineHeight: 1.5 }}>
              This will permanently delete the project "{projectName}" and all saved simulations. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={handleDeleteProjectCancel}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  backgroundColor: '#fff',
                  color: '#333',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}>
                Cancel
              </button>
              <button
                onClick={handleDeleteProjectConfirm}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#dc2626',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}>
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
