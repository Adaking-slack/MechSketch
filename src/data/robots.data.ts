export interface Robot {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  specs: string;
  model: string;
  tag: string;
}

export const robotsData: Robot[] = [
  {
    id: "6-axis",
    name: "6-Axis Robotic Arm",
    description: "Versatile 6-axis articulated robot for complex, multi-directional tasks.",
    capabilities: ["Pick & Place", "Welding", "Assembly", "Painting"],
    specs: "6 DOF \u2022 Up to 10kg \u2022 ~1.3m reach",
    model: "/Models/six-axis-robot-arm.glb",
    tag: "Beginner Friendly"
  },
  {
    id: "scara",
    name: "SCARA Robot",
    description: "Selective Compliance Assembly Robot Arm specialized for fast horizontal plane operations.",
    capabilities: ["High-Speed Assembly", "Packaging", "Material Handling"],
    specs: "4 DOF \u2022 Up to 5kg \u2022 High precision",
    model: "/Models/scara-robot.glb",
    tag: "High-Speed Assembly"
  },
  {
    id: "cartesian",
    name: "Cartesian Robot",
    description: "Gantry-style robot moving in linear paths along X, Y, and Z axes.",
    capabilities: ["CNC Machining", "3D Printing", "Palletizing"],
    specs: "3 DOF \u2022 Up to 15kg \u2022 X/Y/Z movement",
    model: "/Models/cartesian-robot.glb",
    tag: "Simple & Precise"
  },
  {
    id: "delta",
    name: "Delta Robot",
    description: "Parallel robot structure perfect for extremely rapid, lightweight overhead sorting.",
    capabilities: ["Sorting", "Food Processing", "Light Assembly"],
    specs: "4 DOF \u2022 Up to 3kg \u2022 Very high speed",
    model: "/Models/delta-robot.glb",
    tag: "Ultra-Fast Pick & Place"
  }
];
