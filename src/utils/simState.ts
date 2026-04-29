import { type PlacedObject, type Target } from './robotStorage';
import { type SequenceBlock } from '../data/robots.data';

export interface SimObject {
  id: string;
  targetId: string | null;
  position: SimPosition;
  userData: { pickable: boolean };
  type: 'object';
  currentHolderId: string | null;
  state: 'idle' | 'held' | 'placed';
}

export interface SimPosition {
  x: number;
  y: number;
  z: number;
}

export type ExecutionState = 'idle' | 'executing' | 'paused' | 'completed';
export interface SimState {
  robotPosition: SimPosition;
  robotRotation: number;
  heldObject: SimObject | null;
  objects: SimObject[];
  currentBlockIndex: number;
  isPlaying: boolean;
  message: string | null;
  executionState: ExecutionState;
  // World-space target for the gripper end-effector — drives IK on rigged arms.
  gripperGoal?: SimPosition;
  // Gripper jaw openness: 1 = fully open, 0 = closed around object.
  gripperOpenness?: number;
}

export const SIM_STORAGE_KEY = 'mechsketch_sim_state';
export const SAVED_SIMULATIONS_KEY = 'mechsketch_saved_simulations';

export interface SavedSimulation {
  id: string;
  name: string;
  projectName: string;
  savedAt: string;
  targets: Target[];
  sequenceBlocks: SequenceBlock[];
  state: SimState;
  robotId?: string;
  robotModelUrl?: string;
  thumbnail?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function initSimState(objects: PlacedObject[], targets: Target[]): SimState {
  const simObjects: SimObject[] = objects.map(o => {
    let nearestTargetId: string | null = null;
    let minDistance = Infinity;
    
    // Assign to nearest target if available
    for (const t of targets) {
      const dx = t.position.x - o.position.x;
      const dy = t.position.y - o.position.y;
      const dz = t.position.z - o.position.z;
      const dist = dx*dx + dy*dy + dz*dz;
      if (dist < minDistance) {
        minDistance = dist;
        nearestTargetId = t.id;
      }
    }
    
    return {
      id: o.id,
      targetId: nearestTargetId,
      position: { ...o.position },
      userData: { pickable: true },
      type: 'object',
      currentHolderId: null,
      state: 'idle'
    };
  });

  return {
    robotPosition: { x: 0, y: 0, z: 0 },
    robotRotation: 0,
    heldObject: null,
    objects: simObjects,
    currentBlockIndex: -1,
    isPlaying: false,
    message: null,
    executionState: 'idle',
    gripperOpenness: 1,
  };
}

export function saveSimState(state: SimState): void {
  try {
    sessionStorage.setItem(SIM_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save simulation state:', e);
  }
}

export function loadSimState(): SimState | null {
  try {
    const data = sessionStorage.getItem(SIM_STORAGE_KEY);
    if (data) {
      return JSON.parse(data) as SimState;
    }
  } catch (e) {
    console.error('Failed to load simulation state:', e);
  }
  return null;
}

export function clearSimState(): void {
  try {
    sessionStorage.removeItem(SIM_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear simulation state:', e);
  }
}

export function saveSimulation(simulation: SavedSimulation): void {
  try {
    const existing = loadSavedSimulations();
    const index = existing.findIndex(s => s.id === simulation.id);
    if (index >= 0) {
      existing[index] = simulation;
    } else {
      existing.push(simulation);
    }
    sessionStorage.setItem(SAVED_SIMULATIONS_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error('Failed to save simulation:', e);
  }
}

export function loadSavedSimulations(): SavedSimulation[] {
  try {
    const data = sessionStorage.getItem(SAVED_SIMULATIONS_KEY);
    if (data) {
      return JSON.parse(data) as SavedSimulation[];
    }
  } catch (e) {
    console.error('Failed to load saved simulations:', e);
  }
  return [];
}

export function loadSavedSimulationsForProject(projectName: string): SavedSimulation[] {
  return loadSavedSimulations().filter(s => s.projectName === projectName);
}

export function getAllProjectNames(): string[] {
  const simulations = loadSavedSimulations();
  const names = new Set(simulations.map(s => s.projectName));
  return Array.from(names);
}

export interface SavedSimulationState {
  targets: Target[];
  sequenceBlocks: SequenceBlock[];
}

export function loadPendingSimulationState(): SavedSimulationState | null {
  try {
    const data = sessionStorage.getItem('mechsketch_load_simulation');
    if (data) {
      const sim = JSON.parse(data) as SavedSimulation;
      sessionStorage.removeItem('mechsketch_load_simulation');
      return {
        targets: sim.targets,
        sequenceBlocks: sim.sequenceBlocks,
      };
    }
  } catch (e) {
    console.error('Failed to load pending simulation state:', e);
  }
  return null;
}