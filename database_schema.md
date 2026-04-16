1. Purpose
This document defines the database structure for MechSketch.
MechSketch is a web-based platform for designing, simulating, and documenting robot task sequences using a visual interface and 3D simulation.
The database must support:
user authentication
robot library and configuration
workflow (task sequence) creation
block-based logic representation
simulation state tracking
environment and obstacle modeling (future)
project versioning
export and documentation
collaboration (future)

2. General Database Principles
Backend Platform
Supabase
Primary Database
PostgreSQL (managed by Supabase)
Query Language
SQL
Data Access
Supabase client SDK

Core Principles
strong relational clarity
explicit relationships
auditability of changes
simulation reproducibility
extensibility for robotics logic
version-controlled workflows

ID Strategy
UUIDs for all major entities

3. Core Entities Overview
Minimum entities:
users
robots
robot_configs
projects
workflows
workflow_blocks
block_connections
simulations
simulation_steps
environments
obstacles
activity_logs

4. Enum Definitions
UserRole
OWNER
ADMIN
MEMBER

BlockType
START
MOVE
PICK
PLACE
WAIT
ROTATE
TOOL_ACTION
CONDITION

WorkflowStatus
DRAFT
ACTIVE
ARCHIVED

SimulationStatus
IDLE
RUNNING
PAUSED
COMPLETED
FAILED

ObstacleType
BOX
WALL
CYLINDER
CUSTOM

5. users
Represents application-specific user data (linked to Supabase Auth).
Fields
id (matches Supabase auth.users.id)
name
email
role
is_active
created_at
updated_at
Constraints
email must be unique

6. robots
Represents available robot types.
Fields
id
name
type (e.g., industrial_arm, mobile_robot)
description
model_url (GLB/GLTF file)
metadata_json (DOF, reach, payload)
capabilities (array of BlockType enum values)
created_at
updated_at
Notes
capabilities determine available blocks in UI and valid workflow construction

7. robot_configs
Represents customized robot configurations per project.
Fields
id
robot_id
user_id
name
config_json (tool setup, constraints)
created_at
updated_at
Relations
belongs to robots
belongs to users

8. projects
Represents a workspace for building workflows.
Fields
id
user_id
robot_config_id
name
description
status
created_at
updated_at
Relations
belongs to users
belongs to robot_configs

9. workflows
Represents a task sequence within a project.
Fields
id
project_id
name
status
version
created_at
updated_at
Relations
belongs to projects
has many workflow_blocks
has many simulations
Notes
workflow validity depends on robot capabilities

10. workflow_blocks
Represents individual nodes in the sequence.
Fields
id
workflow_id
type (BlockType enum)
label
parameters_json (coordinates, timing, etc.)
position_x
position_y
created_at
updated_at
Relations
belongs to workflows
Constraints
block type must be supported by the selected robot’s capabilities
 (via workflow → project → robot_config → robot)
Notes
core of the drag-and-drop system

11. block_connections
Represents relationships between blocks.
Fields
id
workflow_id
source_block_id
target_block_id
condition_type (TRUE / FALSE / DEFAULT)
created_at
Relations
belongs to workflows
source_block_id → workflow_blocks.id
target_block_id → workflow_blocks.id
Constraints
must form a valid directed graph

12. simulations
Represents a simulation run.
Fields
id
workflow_id
workflow_version
status
started_at
completed_at
created_at
Relations
belongs to workflows
has many simulation_steps

13. simulation_steps
Represents execution of each block during simulation.
Fields
id
simulation_id
block_id
step_order
state_json (position, rotation, tool state)
error_message
executed_at
Relations
belongs to simulations
block_id → workflow_blocks.id
Notes
critical for playback and debugging

14. environments (Secondary Feature)
Represents simulation environment.
Fields
id
project_id
name
created_at
updated_at
Relations
belongs to projects

15. obstacles (Secondary Feature)
Represents obstacles in environment.
Fields
id
environment_id
type (ObstacleType enum)
position_json
size_json
rotation_json
created_at
Relations
belongs to environments

16. activity_logs
Tracks system events.
Fields
id
user_id
project_id
workflow_id
simulation_id
event_type
metadata_json
created_at
Relations
belongs to users

17. Relationship Map
users has many:
projects
robot_configs
activity_logs

projects has many:
workflows
environments

workflows has many:
workflow_blocks
block_connections
simulations

simulations has many:
simulation_steps

environments has many:
obstacles

18. Versioning Strategy
workflows must support versioning
each update increments version
simulations are tied to specific workflow versions

19. Simulation Architecture Support
The database must support:
replayable simulations
step-by-step execution
error tracking
state snapshots per step

20. Indexing Strategy
workflows
index(project_id)
workflow_blocks
index(workflow_id)
block_connections
index(workflow_id)
simulations
index(workflow_id)
index(status)
simulation_steps
index(simulation_id)
index(step_order)

21. Minimum Viable Schema
For MVP:
users
projects
robots
workflows
workflow_blocks
block_connections
simulations
simulation_steps

22. Future Expansion
Planned additions:
collaboration (real-time editing)
comments
AI-generated workflows
smart path planning
advanced robot kinematics

23. Final Build Rules
The schema must ensure:
one project → one robot configuration
one workflow → many blocks
blocks form a directed graph
simulation is reproducible
no orphaned blocks or connections
simulation steps map exactly to workflow blocks 

