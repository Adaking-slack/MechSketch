1. Overview

MechSketch is a web-based visual planning platform for robotics and mechatronics workflows. It enables users to design, simulate, and document robot task sequences using a drag-and-drop interface and 3D simulation.

The system is built with a frontend-heavy architecture, supported by a cloud-based backend for persistence, authentication, and real-time updates.

2. High-Level Architecture
Frontend (React + R3F)
        ↓
State Management (Workflow Engine)
        ↓
API Layer (Supabase Client)
        ↓
Backend (Supabase)
        ↓
PostgreSQL Database
        ↓
Storage (3D Models, Exports)
3. Core Architecture Components
3.1 Frontend Layer

Technology:

React
React Three Fiber (R3F)
Three.js (via R3F)

Responsibilities:

UI rendering (panels, canvas, navigation)
Drag-and-drop workflow builder
Block-based interaction system
3D simulation rendering
State-driven updates (robot, workflow, simulation)
3.2 State Management Layer

Purpose:
Acts as the “brain” of the application.

Responsibilities:

Stores current workflow state
Manages block connections
Handles simulation logic (step execution)
Controls UI synchronization
Applies robot capability constraints

Key Concept:

Robot → Capabilities → Blocks → Workflow → Simulation
3.3 3D Rendering Layer

Technology:

React Three Fiber
Three.js
GLTF/GLB models

Responsibilities:

Render robot models
Animate robot movements
Display simulation playback
Handle camera controls and scene updates

Notes:

Does not handle physics or path planning (handled separately or later)
3.4 API Layer

Technology:

Supabase Client SDK

Responsibilities:

Communicate with backend services
Fetch and persist workflows
Trigger simulations (if server-assisted later)
Handle authentication state
3.5 Backend Layer

Platform:

Supabase

Responsibilities:

Authentication (user login, session handling)
Database access (PostgreSQL)
Real-time updates (optional future feature)
File storage (robot models, exports)
3.6 Database Layer

Technology:

PostgreSQL (managed by Supabase)

Responsibilities:

Store users, projects, workflows
Store block structures and connections
Store simulation results and steps
Maintain version control of workflows
3.7 Storage Layer

Platform:

Supabase Storage

Stores:

Robot 3D models (.glb / .gltf)
Exported workflow files (JSON, PDF)
Simulation assets (future)
4. Core System Flows
4.1 Robot Selection Flow
User selects robot
    ↓
Fetch robot data (capabilities, model)
    ↓
Update application state
    ↓
Filter available blocks
    ↓
Render robot in 3D canvas
4.2 Workflow Creation Flow
User drags block onto canvas
    ↓
Block added to workflow state
    ↓
User connects blocks
    ↓
Connections stored as directed graph
    ↓
Workflow saved to database
4.3 Simulation Flow
User clicks "Simulate"
    ↓
Workflow parsed step-by-step
    ↓
Simulation engine executes blocks
    ↓
Robot state updated per step
    ↓
3D scene reflects movement
    ↓
Simulation steps stored in database
4.4 Data Persistence Flow
User action (edit, create, delete)
    ↓
State updated locally
    ↓
Synced via Supabase client
    ↓
Stored in PostgreSQL
5. Key Architectural Decisions
5.1 Frontend-Driven Simulation
Simulation logic handled on the client (initially)
Enables fast iteration and responsiveness
5.2 Capability-Based System
Robot defines allowed actions
UI and logic both enforce constraints
5.3 Graph-Based Workflow Model
Workflows stored as nodes + connections
Enables branching and conditional logic
5.4 JSON-Based Extensibility
Parameters, states, and configs stored as JSON
Allows flexible future expansion
5.5 Version-Controlled Workflows
Each workflow change creates a new version
Simulations tied to specific versions
6. Scalability Considerations
Future Enhancements
Server-side simulation engine
Physics engine integration
Real-time collaboration
AI-assisted workflow generation
Advanced path planning
Performance Considerations
Lazy loading of 3D assets
Efficient state updates for large workflows
Indexed database queries
Canvas rendering optimization
7. Security Considerations
Authentication handled by Supabase
Row-level security (RLS) for data isolation
Secure storage access for assets
Validation of workflow data before execution
8. System Boundaries
Handled by MechSketch
Workflow design
Visual simulation
Task planning
Not handled (for now)
Real-world robot execution
Hardware integration
Advanced physics simulation
9. Summary

MechSketch is built as a modular, state-driven system where:

The frontend controls interaction and simulation
The backend manages persistence and authentication
The database ensures structure and reproducibility

The architecture is designed to:

scale with complexity
support robotics-specific logic
maintain a clean separation of concerns