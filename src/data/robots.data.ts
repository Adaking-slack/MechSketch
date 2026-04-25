export interface ActionCardTheme {
  bgColor: string;
  textColor: string;
  iconBgColor: string;
  iconColor: string;
  borderColor: string;
}

export interface ActionCardData {
  id: string;
  label: string;
  icon: string;
  theme: ActionCardTheme;
}

export interface Robot {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  specs: string;
  model: string;
  tag: string;
  primaryActions?: ActionCardData[];
  secondaryActions?: ActionCardData[];
  actionMap?: Record<string, BlockType>;
}

export interface BlockParams {
  x?: number;
  y?: number;
  z?: number;
  targetX?: number;
  targetY?: number;
  targetZ?: number;
  angle?: number;
  axis?: 'X' | 'Y' | 'Z';
  duration?: number;
  targetId?: string;
}

export type BlockType = 'pick' | 'place' | 'move' | 'wait' | 'rotate' | 'inspect';

export interface SequenceBlock {
  instanceId: string;
  type: BlockType;
  label: string;
  icon: string;
  theme: ActionCardTheme;
  params: BlockParams;
}

const themePick: ActionCardTheme = {
  bgColor: '#F6F7F9',
  borderColor: '#EAEAEA',
  textColor: '#374049',
  iconBgColor: '#A71065',
  iconColor: '#FDF6FE',
};

const themePlace: ActionCardTheme = {
  bgColor: '#F6F7F9',
  borderColor: '#EAEAEA',
  textColor: '#374049',
  iconBgColor: '#1065A7',
  iconColor: '#F6FCFD',
};

const themeWeld: ActionCardTheme = {
  bgColor: '#F6F7F9',
  borderColor: '#EAEAEA',
  textColor: '#374049',
  iconBgColor: '#E67E22',
  iconColor: '#FDFAF6',
};

const themeMove: ActionCardTheme = {
  bgColor: '#F6F7F9',
  borderColor: '#EAEAEA',
  textColor: '#374049',
  iconBgColor: '#2ECC71',
  iconColor: '#FFFFFF',
};

const themeWait: ActionCardTheme = {
  bgColor: '#F6F7F9',
  borderColor: '#EAEAEA',
  textColor: '#374049',
  iconBgColor: '#9B59B6',
  iconColor: '#FFFFFF',
};

const themeRotate: ActionCardTheme = {
  bgColor: '#F6F7F9',
  borderColor: '#EAEAEA',
  textColor: '#374049',
  iconBgColor: '#3498DB',
  iconColor: '#FFFFFF',
};

const themeInspect: ActionCardTheme = {
  bgColor: '#F6F7F9',
  borderColor: '#EAEAEA',
  textColor: '#374049',
  iconBgColor: '#E74C3C',
  iconColor: '#FFFFFF',
};

export const availableActions: ActionCardData[] = [
  { id: 'action-pick', label: 'Pick', icon: 'Grab', theme: themePick },
  { id: 'action-place', label: 'Place', icon: 'Box', theme: themePlace },
  { id: 'action-move', label: 'Move', icon: 'Move', theme: themeMove },
  { id: 'action-wait', label: 'Wait', icon: 'Clock', theme: themeWait },
  { id: 'action-rotate', label: 'Rotate', icon: 'RotateCw', theme: themeRotate },
  { id: 'action-inspect', label: 'Inspect', icon: 'Search', theme: themeInspect },
];

export const defaultParams: Record<BlockType, BlockParams> = {
  pick: { x: 0, y: 0, z: 0 },
  place: { targetX: 0, targetY: 0, targetZ: 0 },
  move: { x: 0, y: 0, z: 0 },
  wait: { duration: 1 },
  rotate: { angle: 90, axis: 'Z' },
  inspect: { x: 0, y: 0, z: 0 },
};

export function getBlockParams(type: BlockType): BlockParams {
  return { ...defaultParams[type] };
}

export function getBlockSummary(type: BlockType, params: BlockParams): string {
  switch (type) {
    case 'pick':
      return `X:${params.x ?? 0} Y:${params.y ?? 0} Z:${params.z ?? 0}`;
    case 'place':
      return `X:${params.targetX ?? 0} Y:${params.targetY ?? 0} Z:${params.targetZ ?? 0}`;
    case 'move':
      return `X:${params.x ?? 0} Y:${params.y ?? 0} Z:${params.z ?? 0}`;
    case 'wait':
      return `${params.duration ?? 1}s`;
    case 'rotate':
      return `${params.angle ?? 90}° ${params.axis ?? 'Z'}`;
    case 'inspect':
      return `X:${params.x ?? 0} Y:${params.y ?? 0} Z:${params.z ?? 0}`;
    default:
      return '';
  }
}

export const robotsData: Robot[] = [
  {
    id: "6-axis",
    name: "6-Axis Robotic Arm",
    description: "Versatile 6-axis articulated robot for complex, multi-directional tasks.",
    capabilities: ["Pick & Place", "Welding", "Assembly", "Painting"],
    specs: "6 DOF • Up to 10kg • ~1.3m reach",
    model: "/Models/six-axis-robot-arm.glb",
    tag: "Beginner Friendly",
    primaryActions: [
      { id: 'action-pick', label: 'Pick', icon: 'Grab', theme: themePick },
      { id: 'action-place', label: 'Place', icon: 'Box', theme: themePlace },
    ],
    secondaryActions: [
      { id: 'action-weld', label: 'Weld', icon: 'Zap', theme: themeWeld },
      { id: 'action-move', label: 'Move', icon: 'Move', theme: themeMove },
      { id: 'action-rotate', label: 'Rotate', icon: 'RotateCw', theme: themeRotate },
    ],
    actionMap: {
      'action-pick': 'pick',
      'action-place': 'place',
      'action-weld': 'inspect',
      'action-move': 'move',
      'action-rotate': 'rotate',
    }
  },
  {
    id: "scara",
    name: "SCARA Robot",
    description: "Selective Compliance Assembly Robot Arm specialized for fast horizontal plane operations.",
    capabilities: ["High-Speed Assembly", "Packaging", "Material Handling"],
    specs: "4 DOF • Up to 5kg • High precision",
    model: "/Models/scara-robot.glb",
    tag: "High-Speed Assembly",
    primaryActions: [
      { id: 'action-pick-scara', label: 'Pick', icon: 'Grab', theme: themePick },
      { id: 'action-place-scara', label: 'Place', icon: 'Box', theme: themePlace },
    ],
    secondaryActions: [
      { id: 'action-assemble', label: 'Assemble', icon: 'Settings', theme: themeWeld },
      { id: 'action-move', label: 'Move', icon: 'Move', theme: themeMove },
    ],
    actionMap: {
      'action-pick-scara': 'pick',
      'action-place-scara': 'place',
      'action-assemble': 'inspect',
      'action-move': 'move',
    }
  },
  {
    id: "cartesian",
    name: "Cartesian Robot",
    description: "Gantry-style robot moving in linear paths along X, Y, and Z axes.",
    capabilities: ["CNC Machining", "3D Printing", "Palletizing"],
    specs: "3 DOF • Up to 15kg • X/Y/Z movement",
    model: "/Models/cartesian-robot.glb",
    tag: "Simple & Precise",
    primaryActions: [
      { id: 'action-move', label: 'Move', icon: 'Move', theme: themeMove },
      { id: 'action-pick', label: 'Pick', icon: 'Grab', theme: themePick },
    ],
    secondaryActions: [
      { id: 'action-place', label: 'Place', icon: 'Box', theme: themePlace },
    ],
    actionMap: {
      'action-move': 'move',
      'action-pick': 'pick',
      'action-place': 'place',
    }
  },
  {
    id: "delta",
    name: "Delta Robot",
    description: "Parallel robot structure perfect for extremely rapid, lightweight overhead sorting.",
    capabilities: ["Sorting", "Food Processing", "Light Assembly"],
    specs: "4 DOF • Up to 3kg • Very high speed",
    model: "/Models/delta-robot.glb",
    tag: "Ultra-Fast Pick & Place",
    primaryActions: [
      { id: 'action-pick', label: 'Pick', icon: 'Grab', theme: themePick },
      { id: 'action-place', label: 'Place', icon: 'Box', theme: themePlace },
    ],
    secondaryActions: [
      { id: 'action-wait', label: 'Wait', icon: 'Clock', theme: themeWait },
    ],
    actionMap: {
      'action-pick': 'pick',
      'action-place': 'place',
      'action-wait': 'wait',
    }
  }
];