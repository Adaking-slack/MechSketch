export interface ObjectData {
  id: string;
  name: string;
  description: string;
  tag: string;
  specs: string;
  model: string;
  defaultSize?: {
    x: number;
    y: number;
    z: number;
  };
  color: string;
}

export const objectsData: ObjectData[] = [
  {
    id: "box",
    name: "Box",
    description: "Standard cardboard box for packaging and shipping.",
    tag: "Beginner Friendly",
    specs: "200×150×100mm • Up to 5kg",
    model: "/Objects/box.glb",
    defaultSize: { x: 0.15, y: 0.1, z: 0.15 },
    color: "#8B5CF6",
  },
  {
    id: "cylinder",
    name: "Cylinder",
    description: "Cylindrical container or can for liquids and small parts.",
    tag: "Intermediate",
    specs: "Ø80mm × 120mm • Up to 2kg",
    model: "/Objects/cylinder.glb",
    defaultSize: { x: 0.08, y: 0.12, z: 0.08 },
    color: "#10B981",
  },
  {
    id: "sphere",
    name: "Sphere",
    description: "Spherical object for precision handling tasks.",
    tag: "Advanced",
    specs: "Ø60mm • Precision required",
    model: "/Objects/sphere.glb",
    defaultSize: { x: 0.06, y: 0.06, z: 0.06 },
    color: "#F59E0B",
  },
  {
    id: "pallet",
    name: "Pallet",
    description: "Standard shipping pallet for bulk material handling.",
    tag: "Beginner Friendly",
    specs: "1200×1000×150mm • Up to 100kg",
    model: "/Objects/pallet.glb",
    defaultSize: { x: 0.4, y: 0.15, z: 0.3 },
    color: "#92400E",
  },
];