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
  actions?: ActionCardData[];
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

export const robotsData: Robot[] = [
  {
    id: "6-axis",
    name: "6-Axis Robotic Arm",
    description: "Versatile 6-axis articulated robot for complex, multi-directional tasks.",
    capabilities: ["Pick & Place", "Welding", "Assembly", "Painting"],
    specs: "6 DOF • Up to 10kg • ~1.3m reach",
    model: "/Models/six-axis-robot-arm.glb",
    tag: "Beginner Friendly",
    actions: [
      { id: 'action-pick', label: 'Pick', icon: 'Grab', theme: themePick },
      { id: 'action-place', label: 'Place', icon: 'Box', theme: themePlace },
      { id: 'action-weld', label: 'Weld', icon: 'Zap', theme: themeWeld },
    ]
  },
  {
    id: "scara",
    name: "SCARA Robot",
    description: "Selective Compliance Assembly Robot Arm specialized for fast horizontal plane operations.",
    capabilities: ["High-Speed Assembly", "Packaging", "Material Handling"],
    specs: "4 DOF • Up to 5kg • High precision",
    model: "/Models/scara-robot.glb",
    tag: "High-Speed Assembly",
    actions: [
      { id: 'action-pick-scara', label: 'Pick', icon: 'Grab', theme: themePick },
      { id: 'action-place-scara', label: 'Place', icon: 'Box', theme: themePlace },
      { id: 'action-assemble', label: 'Assemble', icon: 'Settings', theme: themeWeld },
    ]
  },
  {
    id: "cartesian",
    name: "Cartesian Robot",
    description: "Gantry-style robot moving in linear paths along X, Y, and Z axes.",
    capabilities: ["CNC Machining", "3D Printing", "Palletizing"],
    specs: "3 DOF • Up to 15kg • X/Y/Z movement",
    model: "/Models/cartesian-robot.glb",
    tag: "Simple & Precise"
  },
  {
    id: "delta",
    name: "Delta Robot",
    description: "Parallel robot structure perfect for extremely rapid, lightweight overhead sorting.",
    capabilities: ["Sorting", "Food Processing", "Light Assembly"],
    specs: "4 DOF • Up to 3kg • Very high speed",
    model: "/Models/delta-robot.glb",
    tag: "Ultra-Fast Pick & Place"
  }
];
