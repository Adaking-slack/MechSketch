name: mechsketch description: > Use this skill for any task
Product Context
MechSketch is a web-based visual planning tool that helps robotics and mechatronics
engineers design, simulate, and document robot task sequences — before writing any
code.
Core value proposition:
Replaces whiteboards and text notes with a structured drag-and-drop canvas
Bridges technical and non-technical stakeholders with a shared visual language
Provides step-by-step simulation to catch logic errors early
Exports clean structured data (JSON) for developers and visual docs (PDF) for
stakeholders
Target users: Robotics engineers, mechatronics engineers, operators, and technical
leads in manufacturing, medical, aerospace, and food processing industries.
Product vision — MechSketch will function as:
1. A thinking tool for robotic workflows
2. A communication layer between technical and non-technical stakeholders
3. A pre-programming environment that simplifies robot task creation
Feature Map (Reference This When Helping)
MVP Features
# Feature Key Components
1.1
Robot Selection &
Configuration
Robot library, capability display (DoF, reach, payload),
custom config
1.2 Visual Task Sequence
Builder
Drag-and-drop canvas, action blocks (MOVE, PICK,
PLACE, WAIT, ROTATE), config panel
1.3 Simulation & Playback
Engine
3D/simplified visual sim, Play/Pause/Step/Reset controls,
active step highlight
1.4 Templates & Prebuilt
Workflows
Predefined sequences, save custom templates, template
library UI
1.5
Error Detection &
Validation
Missing params, invalid flow, out-of-range positions,
visual error indicators
1.5 Conditional Logic
(Basic Branching) CONDITION (IF) block, sensor-state-based branching
1.5 Export &
Documentation
JSON export, PDF/image export with steps + params +
robot config
Post-MVP — Secondary Features (High Impact)
# Feature Key Components
2.1
Environment & Obstacle
Modeling
Drag-and-drop obstacles (boxes, walls, restricted
zones)
2.2 Collision Detection Red/green path feedback, collision point
highlights
2.3 Scenario-Based Simulation Multiple environment setups, toggle between
scenarios
2.4 Tool & Component System Tool library (gripper, welder, camera), toolspecific params
2.6 Versioning & History Save versions, view history, restore previous
states
2.7 Collaboration & Annotation Shared projects, block comments, general
annotations
V2 — Advanced Features (Differentiation)
# Feature Key Components
3.1 Smart Path Planning “Smart Move” block, auto obstacle avoidance, path
rendering
3.2 Advanced Logic Blocks IF/ELSE, REPEAT loops, event-based triggers
3.3 Auto Task Generation Natural language or goal input → editable
sequence output
3.4 Performance Optimization
Insights Time estimation, efficiency suggestions
3.5 Custom Robot Builder Define joints/constraints, simulate custom robots,
save profiles
Core Terminology
Always use these terms consistently across code, design, and documentation:
Meaning
Term
Block A single action unit on the canvas (e.g., PICK, MOVE)
Sequence An ordered chain of connected blocks
Canvas The main workspace where sequences are built
Block Library The sidebar panel containing available block types
Config Panel The right-side panel for editing a selected block’s parameters
Simulation Step-by-step visual playback of a sequence
Workspace Top-level container; a team or user’s project environment
Project A collection of sequences within a workspace
Template A saved, reusable sequence
Robot Profile A robot type with defined DoF, reach, and payload
Key User Flows (Reference for Design & Dev)
1. User Onboarding & Account Setup
Sign up (email/OAuth) → Verify email → Create workspace → Create first project →
Select robot type (or skip) → Connect robot or use simulation → Guided tour (canvas,
blocks, controls) → Select template or start blank → Land on dashboard
2. Creating a Task Sequence
New Sequence → Canvas + block library + properties panel load → Drag blocks (PICK,
MOVE, WAIT, ROTATE, etc.) → Connect blocks into sequence → Edit parameters
(position, duration, force) → Add logic (IF conditions, loops) → Rearrange or delete
blocks → Save
3. Simulation & Validation
Click Play → Step-by-step animation starts → Use Pause / Resume / Step controls →
Error detection flags missing data or invalid flows → Debug panel shows logs and
execution feedback → Edit sequence → Re-run simulation
4. Saving, Exporting & Collaboration
Auto or manual save → Access version history → Restore older version if needed →
Export as JSON / PDF / robot code → Generate share link or invite users → Real-time
collaboration (V2)
5. Templates & Reusability
Save current workflow as template → Access template library → Search/filter templates
→ Import external template files → Apply template to new sequence
6. Advanced Features & Integrations
Configure sensor inputs → Set conditional logic (CONDITION block) → Use AI assistance
to generate flows from text (V2) → Coordinate multi-robot workflows (V2) → Connect
external systems via API (V2)
7. Dashboard & Analytics
View project overview and recent activity → Check performance metrics and analytics →
Review execution logs → Manage alerts and notifications
8. Settings & Account Management
Update profile info → Manage workspace and team members → Configure robot profiles
→ Manage billing and subscription
Design Principles
When designing UI/UX for MechSketch, follow these principles:
1. Visual-first — Everything should be readable at a glance. Avoid text-heavy
interfaces.
2. Low barrier — Non-expert operators should be able to understand a sequence
without training.
3. Error prevention over error correction — Surface issues inline (on blocks) before
simulation.
4. Progressive disclosure — Show simple controls first; reveal advanced options on
demand.
5. Consistent block anatomy — Every block should have: icon, label, status indicator,
and a config entry point.
Block Design Spec
Each action block should visually communicate:
Type (color-coded by category — motion, manipulation, timing, logic)
Status (default / active / error / complete)
Key parameter preview (e.g., “X: 120, Y: 45, Z: 30” shown inline)
Connection points (top input, bottom output; branching blocks have multiple
outputs)
Suggested color coding:
Category Blocks Color
Motion MOVE, ROTATE Blue
Manipulation PICK, PLACE Green
Timing WAIT Yellow/Amber
Logic CONDITION (IF) Purple
Error state Any Red
Dev Guidelines
Tech Stack Assumptions
MechSketch is a web application. Unless the user specifies otherwise, assume:
Frontend: React (with hooks), TypeScript
Canvas/Flow: React Flow or a custom SVG/canvas layer
Styling: Tailwind CSS
State management: Zustand or Redux Toolkit
3D Simulation: Three.js (r128) or a 2D canvas fallback for MVP
Export: JSON serialization; PDF via browser print or a library like jsPDF
When Writing Code
Keep block logic modular — each block type is its own component
Sequence state should be serializable to JSON at all times (enables export + history)
Simulation engine should be decoupled from UI — it reads sequence state and emits
step events
Use TypeScript interfaces for all block types, robot profiles, and sequence schemas
Core Data Structures
// A single action block
interface Block {
 id: string;
 type: 'MOVE' | 'PICK' | 'PLACE' | 'WAIT' | 'ROTATE' | 'CONDITION';
 params: Record<string, number | string | boolean>;
 next: string | null; // next block id (null = end)
 branches?: string[]; // for CONDITION blocks
 status?: 'default' | 'active' | 'error' | 'complete';
}
// A full sequence
interface Sequence {
 id: string;
 name: string;
 robotProfileId: string;
 blocks: Block[];
 createdAt: string;
 updatedAt: string;
}
// A robot profile
interface RobotProfile {
 id: string;
 name: string;
 type: 'industrial-arm' | 'mobile-robot' | 'custom';
 degreesOfFreedom: number;
 reachMm: number;
 payloadKg: number;
 supportedBlocks: Block['type'][];
}
How to Help the Team
For Designers
Reference the Feature Map and User Flows above for scope
Apply Design Principles when reviewing or generating UI
Use the Block Design Spec when creating block components
For wireframes or specs, always include: empty state, error state, and active state
For Engineers
Reference Core Data Structures when implementing features
Simulation engine and UI should remain decoupled
Any new block type must fit the Block interface
Check Feature Map to determine if a feature is MVP, Post-MVP, or V2 before building
For Both
Use the Terminology table to keep language consistent across design and code
When in doubt about scope, refer back to the PRD goals:
1. Simplify Robot Task Planning
2. Improve Clarity and Communication
3. Enable Rapid Prototyping of Robot Workflows
4. Provide Structured Outputs for Development
5. Introduce Visual Simulation for Validation
6. Support Scalable and Complex Logic
Frontend & Interaction
React Three Fiber
Used for interactive robot selection in a 3D environment
Enables rendering and manipulation of 3D models directly within React
dnd-kit (Free Library)
Handles drag-and-drop functionality
Used for arranging sequences, components, or UI elements in an intuitive way
Chosen for its flexibility, performance, and modern React support
Animation & UI Experience
Framer Motion
Used for UI animations, including:
Cards
Transitions
Interactive elements
Enhances user experience with smooth and responsive motion
Backend & Data Persistence
Supabase
Serves as the database and backend service
Responsible for:
Saving user-created sequences
Enabling sharing of sequences
Provides real-time capabilities and scalable storage

