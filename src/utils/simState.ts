import type { PlacedObject, Target } from './robotStorage';

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
}

export const SIM_STORAGE_KEY = 'mechsketch_sim_state';

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