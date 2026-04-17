export interface Robot {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  specs: string;
  model: string;
}

export const robotsData: Robot[] = [
  {
    id: "6-axis",
    name: "6-Axis Robotic Arm",
    description: "Versatile 6-axis articulated robot for complex, multi-directional tasks.",
    capabilities: ["Pick & Place", "Welding", "Assembly", "Painting"],
    specs: "6 DOF • Up to 10kg • ~1.3m reach",
    model: "/models/robot-arm.glb"
  },
  {
    id: "scara",
    name: "SCARA Robot",
    description: "Selective Compliance Assembly Robot Arm specialized for fast horizontal plane operations.",
    capabilities: ["High-Speed Assembly", "Packaging", "Material Handling"],
    specs: "4 DOF • Up to 5kg • High precision",
    model: "/models/scara.glb"
  },
  {
    id: "cartesian",
    name: "Cartesian Robot",
    description: "Gantry-style robot moving in linear paths along X, Y, and Z axes.",
    capabilities: ["CNC Machining", "3D Printing", "Palletizing"],
    specs: "3 DOF • Up to 15kg • X/Y/Z movement",
    model: "/models/cartesian.glb"
  },
  {
    id: "delta",
    name: "Delta Robot",
    description: "Parallel robot structure perfect for extremely rapid, lightweight overhead sorting.",
    capabilities: ["Sorting", "Food Processing", "Light Assembly"],
    specs: "4 DOF • Up to 3kg • Very high speed"
    model: "/models/delta.glb"
  }
];
