import type { Robot } from '../data/robots.data';
import type { ObjectData } from '../data/objects.data';

const ROBOT_KEY = 'mechsketch_selected_robot';
const OBJECT_KEY = 'mechsketch_selected_object';
const OBJECT_STATE_KEY = 'mechsketch_object_state';
const PROJECT_NAME_KEY = 'mechsketch_project_name';
const TARGETS_KEY = 'mechsketch_targets';

export interface PlacedObject {
  id: string;
  objectData: ObjectData;
  position: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
}

export interface ObjectState {
  objects: PlacedObject[];
  selectedObjectId: string | null;
  newlyAddedObjectId: string | null;
}

export function saveSelectedRobot(robot: Robot): void {
  try {
    sessionStorage.setItem(ROBOT_KEY, JSON.stringify(robot));
  } catch (e) {
    console.error('Failed to save robot selection:', e);
  }
}

export function loadSelectedRobot(): Robot | null {
  try {
    const data = sessionStorage.getItem(ROBOT_KEY);
    if (data) {
      return JSON.parse(data) as Robot;
    }
  } catch (e) {
    console.error('Failed to load robot selection:', e);
  }
  return null;
}

export function saveSelectedObject(object: ObjectData): void {
  try {
    sessionStorage.setItem(OBJECT_KEY, JSON.stringify(object));
  } catch (e) {
    console.error('Failed to save object selection:', e);
  }
}

export function loadSelectedObject(): ObjectData | null {
  try {
    const data = sessionStorage.getItem(OBJECT_KEY);
    if (data) {
      return JSON.parse(data) as ObjectData;
    }
  } catch (e) {
    console.error('Failed to load object selection:', e);
  }
  return null;
}

export function saveObjectState(state: ObjectState): void {
  try {
    sessionStorage.setItem(OBJECT_STATE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save object state:', e);
  }
}

export function loadObjectState(): ObjectState | null {
  try {
    const data = sessionStorage.getItem(OBJECT_STATE_KEY);
    if (data) {
      return JSON.parse(data) as ObjectState;
    }
  } catch (e) {
    console.error('Failed to load object state:', e);
  }
  return null;
}

export function addPlacedObject(object: PlacedObject): void {
  const state = loadObjectState();
  const objects = state?.objects || [];
  objects.push(object);
  saveObjectState({ objects, selectedObjectId: object.id, newlyAddedObjectId: object.id });
}

export function updatePlacedObject(objectId: string, updates: Partial<PlacedObject>): void {
  const state = loadObjectState();
  if (!state) return;
  const index = state.objects.findIndex(o => o.id === objectId);
  if (index !== -1) {
    state.objects[index] = { ...state.objects[index], ...updates };
    saveObjectState(state);
  }
}

export function removePlacedObject(objectId: string): void {
  const state = loadObjectState();
  if (!state) return;
  const objects = state.objects.filter(o => o.id !== objectId);
  saveObjectState({ objects, selectedObjectId: null, newlyAddedObjectId: null });
}

export function selectPlacedObject(objectId: string | null): void {
  const state = loadObjectState();
  if (state) {
    saveObjectState({ ...state, selectedObjectId: objectId });
  }
}

export function getDefaultObjectPosition(robotPosition?: { x: number; y: number; z: number }, targetPosition?: { x: number; y: number; z: number }): { x: number; y: number; z: number } {
  const rx = robotPosition?.x ?? 0.3;
  const ry = robotPosition?.y ?? 0;
  const rz = robotPosition?.z ?? 0;
  
  const tx = targetPosition?.x ?? -0.3;
  const ty = targetPosition?.y ?? 0;
  const tz = targetPosition?.z ?? 0;
  
  return {
    x: (rx + tx) / 2,
    y: Math.max(ry, ty),
    z: (rz + tz) / 2,
  };
}

export function saveProjectName(name: string): void {
  try {
    sessionStorage.setItem(PROJECT_NAME_KEY, name);
  } catch (e) {
    console.error('Failed to save project name:', e);
  }
}

export function loadProjectName(): string {
  try {
    return sessionStorage.getItem(PROJECT_NAME_KEY) || 'Untitled';
  } catch (e) {
    console.error('Failed to load project name:', e);
  }
  return 'Untitled';
}

export type TargetType = 'point' | 'zone';

export interface TargetPosition {
  x: number;
  y: number;
  z: number;
}

export interface TargetSize {
  width: number;
  depth: number;
}

export interface Target {
  id: string;
  type: TargetType;
  name: string;
  position: TargetPosition;
  size?: TargetSize;
  color: string;
}

const TARGET_COLORS = {
  point: '#00DD77',  // Bright green - higher visibility
  zone: '#0077FF',  // Bright blue - higher visibility
};

export function getTargetColor(type: TargetType): string {
  return TARGET_COLORS[type];
}

export function saveTargets(targets: Target[]): void {
  try {
    sessionStorage.setItem(TARGETS_KEY, JSON.stringify(targets));
  } catch (e) {
    console.error('Failed to save targets:', e);
  }
}

export function loadTargets(): Target[] {
  try {
    const data = sessionStorage.getItem(TARGETS_KEY);
    if (data) {
      return JSON.parse(data) as Target[];
    }
  } catch (e) {
    console.error('Failed to load targets:', e);
  }
  return [];
}

export function addTarget(target: Target): void {
  const targets = loadTargets();
  targets.push(target);
  saveTargets(targets);
}

export function updateTarget(targetId: string, updates: Partial<Target>): void {
  const targets = loadTargets();
  const index = targets.findIndex(t => t.id === targetId);
  if (index !== -1) {
    targets[index] = { ...targets[index], ...updates };
    saveTargets(targets);
  }
}

export function removeTarget(targetId: string): void {
  const targets = loadTargets().filter(t => t.id !== targetId);
  saveTargets(targets);
}

export function clearSelectedRobot(): void {
  try {
    sessionStorage.removeItem(ROBOT_KEY);
  } catch (e) {
    console.error('Failed to clear robot selection:', e);
  }
}