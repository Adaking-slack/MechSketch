export interface Robot {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  model: string;
}

export const robotsData: Robot[] = [
  {
    id: "6-axis",
    name: "6-Axis Robotic Arm",
    description: "Versatile 6-axis articulated robot for complex, multi-directional tasks.",
    capabilities: ["Pick & Place", "Welding", "Assembly", "Painting"],
    model: "/Models/Robot Arm.glb"
  },
  {
    id: "scara",
    name: "SCARA Robot",
    description: "Selective Compliance Assembly Robot Arm specialized for fast horizontal plane operations.",
    capabilities: ["High-Speed Assembly", "Packaging", "Material Handling"],
    model: "/Models/scara.glb"
  },
  {
    id: "cartesian",
    name: "Cartesian Robot",
    description: "Gantry-style robot moving in linear paths along X, Y, and Z axes.",
    capabilities: ["CNC Machining", "3D Printing", "Palletizing"],
    model: "/Models/Plasma.glb"
  },
  {
    id: "delta",
    name: "Delta Robot",
    description: "Parallel robot structure perfect for extremely rapid, lightweight overhead sorting.",
    capabilities: ["Sorting", "Food Processing", "Light Assembly"],
    model: "/Models/delta.glb"
  }
];
