import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import LeftPanel from '../components/LeftPanel';
import TopNav from '../components/TopNav';
import WorkspaceCanvas from '../components/WorkspaceCanvas';
import SequencePanel from '../components/SequencePanel';
import PropertiesPanel from '../components/PropertiesPanel';
import TargetPropertiesPanel from '../components/TargetPropertiesPanel';
import InteractiveObject from '../components/InteractiveObject';
import { type ActionCardData, type SequenceBlock, type BlockType, getBlockParams } from '../data/robots.data';
import { loadSelectedRobot, loadProjectName, saveProjectName, loadSelectedObject, loadTargets, addTarget, removeTarget, type Target, type TargetType, getTargetColor, loadObjectState, saveObjectState, type PlacedObject, type ObjectState } from '../utils/robotStorage';
import { initSimState, type SimState } from '../utils/simState';
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
  const [highlightAddTarget, setHighlightAddTarget] = useState(false);
  
  const navigate = useNavigate();
  
  const selectedRobot = loadSelectedRobot();
  const selectedObject = loadSelectedObject();
  const [projectName, setProjectName] = useState(loadProjectName());
  
  const [targets, setTargets] = useState<Target[]>([]);
  const [newlyAddedTargetId, setNewlyAddedTargetId] = useState<string | null>(null);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [editingTargetId, setEditingTargetId] = useState<string | null>(null);
  
  // Object state for interactive objects in the scene
  const [objectState, setObjectState] = useState<ObjectState>(() => loadObjectState() || { objects: [], selectedObjectId: null, newlyAddedObjectId: null });
  const [newlyAddedObjectId, setNewlyAddedObjectId] = useState<string | null>(null);
  const hasInitializedRef = useRef(false);
  
  const [sequenceBlocks, setSequenceBlocks] = useState<SequenceBlock[]>([]);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [simState, setSimState] = useState<SimState | null>(null);
  const [simMessage, setSimMessage] = useState<string | null>(null);
  const simulationRef = useRef<{ running: boolean; timeout: ReturnType<typeof setTimeout> | null; blockIndex: number }>({ running: false, timeout: null, blockIndex: 0 });

  useEffect(() => {
    setTargets(loadTargets());
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
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && sequenceBlocks.length > 0 && !activeBlockId && !editingTargetId) {
        setSequenceBlocks(prev => prev.slice(0, -1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sequenceBlocks, activeBlockId, editingTargetId, showStartNewModal, showNoActionsModal, showNoTargetsModal]);

  const activeBlock = sequenceBlocks.find(b => b.instanceId === activeBlockId);
  const editingTarget = targets.find(t => t.id === editingTargetId);

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
        setSimState(s => s ? { ...s, executionState: 'executing' } : s);
        
        const resumeExecution = () => {
          if (!simulationRef.current.running) return;
          
          const blockIndex = simulationRef.current.blockIndex;
          if (blockIndex >= sequenceBlocks.length) {
            console.log('Sequence complete');
            simulationRef.current.running = false;
            setSimulationMode(false);
            setSimulationPaused(false);
            setSimulationCompleted(true);
            setActiveBlockId(null);
            setSimMessage('Simulation complete');
            if (simState) {
              const committedObjects = objectState.objects.map(existingObj => {
                const simObj = simState.objects.find(so => so.id === existingObj.id);
                if (simObj) return { ...existingObj, position: simObj.position };
                return existingObj;
              });
              const newObjectState = { ...objectState, objects: committedObjects };
              setObjectState(newObjectState);
              saveObjectState(newObjectState);
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
          setSimState(currentState => {
            if (!currentState) return currentState;
            const nextState = { ...currentState, currentBlockIndex: blockIndex };

            switch (block.type) {
              case 'move': {
                if (target) {
                  nextState.robotPosition = { ...target.position };
                  nextState.message = `Moving to ${target.name}`;
                  delay = 1500;
                } else if (block.params?.targetX !== undefined) {
                  nextState.robotPosition = { x: block.params.targetX, y: block.params.targetY || 0, z: block.params.targetZ || 0 };
                  nextState.message = 'Moving to position';
                  delay = 1500;
                } else {
                  setSimMessage('No position for Move');
                  delay = 500;
                }
                if (nextState.heldObject) {
                  nextState.objects = nextState.objects.map(o => o.id === nextState.heldObject!.id ? { ...o, position: { ...nextState.robotPosition } } : o);
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
                  nextState.heldObject = objToPick;
                  nextState.objects = nextState.objects.map(o => o.id === objToPick!.id ? { ...o, state: 'held', currentHolderId: 'robot' } : o);
                  nextState.message = `Picked ${objToPick.id}`;
                } else {
                  nextState.message = 'No object to pick';
                }
                delay = 1000;
                break;
              }
              case 'place': {
                if (nextState.heldObject && target) {
                  const placementY = target.type === 'zone' ? target.position.y + 0.20 : target.position.y + 0.05;
                  const placementPos = { x: target.position.x, y: placementY, z: target.position.z };
                  nextState.objects = nextState.objects.map(o => o.id === nextState.heldObject!.id ? { ...o, position: placementPos, targetId: target.id, state: 'placed', currentHolderId: null } : o);
                  nextState.heldObject = null;
                  nextState.message = `Placed at ${target.name}`;
                } else if (nextState.heldObject) {
                  const dropPos = { ...nextState.robotPosition, y: 0 };
                  nextState.objects = nextState.objects.map(o => o.id === nextState.heldObject!.id ? { ...o, position: dropPos, targetId: null, state: 'placed', currentHolderId: null } : o);
                  nextState.heldObject = null;
                  nextState.message = 'Placed object';
                } else {
                  nextState.message = 'No object held to place';
                }
                delay = 1000;
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
        setSimState(s => s ? { ...s, executionState: 'paused' } : s);
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
        simulationRef.current.running = false;
        setSimulationMode(false);
        setSimulationPaused(false);
        setSimulationCompleted(true);
        setActiveBlockId(null);
        setSimMessage('Simulation complete');

        if (simState) {
          const committedObjects = objectState.objects.map(existingObj => {
            const simObj = simState.objects.find(so => so.id === existingObj.id);
            if (simObj) {
              return {
                ...existingObj,
                position: simObj.position,
              };
            }
            return existingObj;
          });
          const newObjectState = {
            ...objectState,
            objects: committedObjects,
          };
          setObjectState(newObjectState);
          saveObjectState(newObjectState);
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

      setSimState(currentState => {
        if (!currentState) return currentState;

        const nextState = { ...currentState, currentBlockIndex: blockIndex };

        switch (block.type) {
          case 'move': {
            if (target) {
              nextState.robotPosition = { ...target.position };
              nextState.message = `Moving to ${target.name}`;
              delay = 1500;
            } else if (block.params?.targetX !== undefined) {
              nextState.robotPosition = { x: block.params.targetX, y: block.params.targetY || 0, z: block.params.targetZ || 0 };
              nextState.message = 'Moving to position';
              delay = 1500;
            } else {
              setSimMessage('No position for Move');
              delay = 500;
            }
            // Update object position if held
            if (nextState.heldObject) {
              nextState.objects = nextState.objects.map(o => 
                o.id === nextState.heldObject!.id
                  ? { ...o, position: { ...nextState.robotPosition } }
                  : o
              );
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
              nextState.heldObject = objToPick;
              // Mark object as held
              nextState.objects = nextState.objects.map(o =>
                o.id === objToPick!.id
                  ? { ...o, state: 'held', currentHolderId: 'robot' }
                  : o
              );
              nextState.message = `Picked ${objToPick.id}`;
            } else {
              nextState.message = 'No object to pick';
            }
            delay = 1000;
            break;
          }
          case 'place': {
            if (nextState.heldObject && target) {
              // Calculate proper placement position based on target type
              let placementY: number;
              if (target.type === 'zone') {
                placementY = target.position.y + 0.20;
              } else {
                placementY = target.position.y + 0.05;
              }
              const placementPos = { x: target.position.x, y: placementY, z: target.position.z };
              nextState.objects = nextState.objects.map(o =>
                o.id === nextState.heldObject!.id
                  ? { ...o, position: placementPos, targetId: target.id, state: 'placed', currentHolderId: null }
                  : o
              );
              nextState.heldObject = null;
              nextState.message = `Placed at ${target.name}`;
            } else if (nextState.heldObject) {
              // Detach object at CURRENT robot location if no target is specified
              const dropPos = { ...nextState.robotPosition, y: 0 };
              nextState.objects = nextState.objects.map(o => 
                o.id === nextState.heldObject!.id
                  ? { ...o, position: dropPos, targetId: null, state: 'placed', currentHolderId: null }
                  : o
              );
              nextState.heldObject = null;
              nextState.message = 'Placed object';
            } else {
              nextState.message = 'No object held to place';
            }
            delay = 1000;
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
    setSimState(initialState);

    simulationRef.current.running = true;
    simulationRef.current.blockIndex = 0;

    simulationRef.current.timeout = setTimeout(runSimulation, 500);
  }, [sequenceBlocks, targets, objectState.objects]);

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
    simulationRef.current.running = false;
    setSimulationMode(false);
    setSimulationPaused(false);
    setSimMessage(null);
    setActiveBlockId(null);

    if (simState) {
      const committedObjects = objectState.objects.map(existingObj => {
        const simObj = simState.objects.find(so => so.id === existingObj.id);
        if (simObj) {
          return {
            ...existingObj,
            position: simObj.position,
          };
        }
        return existingObj;
      });
      const newObjectState = {
        ...objectState,
        objects: committedObjects,
      };
      setObjectState(newObjectState);
      saveObjectState(newObjectState);
    }

    setSimState(null);
  }, [simState, objectState]);

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
    setTimeout(() => setHighlightAddTarget(false), 3000);
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
}, [objectState]);

  const handleShare = useCallback(() => {
    const exportData = {
      projectName,
      robot: selectedRobot,
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
        onShare={handleShare}
        onStop={handleStopSimulate}
        onStartNew={handleStartNewClick}
        onSettings={handleSettings}
        onLogout={handleLogout}
        simulationMode={simulationMode}
        simulationPaused={simulationPaused}
        simulationCompleted={simulationCompleted}
        robotName={selectedRobot?.name}
        objectName={selectedObject?.name}
      />

      <div style={{ display: 'flex', flex: 1, position: 'relative', overflow: 'hidden' }}>
        <aside style={{ width: simulationMode && !simulationCompleted ? 0 : (leftOpen ? '280px' : '0px'), height: '100%', backgroundColor: '#ffffff', borderRight: leftOpen && !(simulationMode && !simulationCompleted) ? '1px solid #e2e8f0' : 'none', boxShadow: leftOpen && !(simulationMode && !simulationCompleted) ? '4px 0 16px rgba(0,0,0,0.02)' : 'none', zIndex: 10, transition: 'all 0.3s', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {!(simulationMode && !simulationCompleted) && <div style={{ width: '280px', padding: '24px', boxSizing: 'border-box', height: '100%', overflow: 'hidden' }}>
            <LeftPanel robot={selectedRobot} onActionClick={handleAddAction} targets={targets} selectedTargetId={selectedTargetId} onTargetSelect={handleTargetSelectFromCanvas} onAddTarget={handleAddTarget} onDeleteTarget={handleDeleteTarget} highlightAddTarget={highlightAddTarget} />
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
              <SequencePanel blocks={sequenceBlocks} activeBlockId={activeBlockId} onBlockSelect={handleBlockSelect} onBlockDelete={handleBlockDelete} onBlockReorder={setSequenceBlocks} />
            </div>
            
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', boxShadow: '0 -4px 16px rgba(0,0,0,0.05)', borderTopLeftRadius: '16px', borderTopRightRadius: '16px', transform: (activeBlock || editingTarget) ? 'translateY(0)' : 'translateY(100%)', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 30, maxHeight: '80%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ width: '36px', height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px' }} />
              </div>
              <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                {editingTarget ? (
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
    </div>
  );
}