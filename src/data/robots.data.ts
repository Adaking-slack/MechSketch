export interface Robot {
  id: string;
  name: string;
  tag: string;
  description: string;
  specs: string;
  modelUrl: string;
}

export const robotsData: Robot[] = [
  {
    id: "6-axis",
    name: "6-Axis Robotic Arm",
    tag: "Beginner Friendly",
    description: "Versatile 6-axis articulated robot for complex, multi-directional tasks.",
    specs: "6 DOF • Up to 10kg • ~1.3m reach",
    modelUrl: "/models/6-axis.glb"
  },
  {
    id: "scara",
    name: "SCARA Robot",
    tag: "High-Speed Assembly",
    description: "Selective Compliance Assembly Robot Arm specialized for fast horizontal plane operations.",
    specs: "4 DOF • Up to 5kg • High precision",
    modelUrl: "/models/scara.glb"
  },
  {
    id: "cartesian",
    name: "Cartesian Robot",
    tag: "Simple & Precise",
    description: "Gantry-style robot moving in linear paths along X, Y, and Z axes.",
    specs: "3 DOF • Up to 15kg • X/Y/Z movement",
    modelUrl: "/models/cartesian.glb"
  },
  {
    id: "delta",
    name: "Delta Robot",
    tag: "Ultra-Fast Pick & Place",
    description: "Parallel robot structure perfect for extremely rapid, lightweight overhead sorting.',",
    specs: "4 DOF • Up to 3kg • Very high speed",
    modelUrl: "/models/delta.glb"
  }
];
