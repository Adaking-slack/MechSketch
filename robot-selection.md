# Robot Selection Page — AI Guardrail Contract

## 1. Scope

This file defines **non-negotiable constraints** for generating the Robot Selection Page in MechSketch.

Applies to:
- UI generation
- Component structure
- Animation logic
- Rendering logic

If any rule conflicts with general best practices:
> **THIS FILE TAKES PRIORITY**

---

## 2. Hard UI Constraint (CRITICAL)

### ❌ NEVER ALLOWED

- Grid layout
- List layout
- Flat horizontal slider
- Showing all cards equally

### ✅ REQUIRED

A **center-focused layered carousel**

Meaning:
- Exactly ONE card is visually dominant at any time
- Other cards exist only as background context

---

## 3. Card Visibility Rules (STRICT)

### Active Card

MUST:
- Be centered
- Be largest (scale ≈ 1)
- Have highest z-index
- Have full opacity
- Show FULL content:
  - 3D Canvas (R3F)
  - Name
  - Tag
  - Description
  - Specs
  - CTA button

---

### Background Cards

MUST:
- Be smaller (≤ 0.85 scale)
- Be visually de-emphasized (opacity < 1)
- Sit behind active card

MUST ONLY SHOW:
- Robot Name

---

### ❌ VIOLATION CONDITIONS

If ANY background card includes:
- button
- specs
- description
- 3D canvas

→ OUTPUT IS INVALID

---

## 4. Rendering Rules (R3F ENFORCEMENT)

### REQUIRED

- Use **React Three Fiber** for all 3D rendering
- Use `<Canvas>` ONLY inside active card

---

### ❌ NEVER ALLOWED

- Rendering 3D in multiple cards simultaneously
- Using raw Three.js without R3F abstraction (unless justified internally)
- DOM-based fake 3D

---

## 5. Animation Constraints

### REQUIRED

- Smooth transitions (`ease-in-out`)
- Position interpolation (no jumps)
- Depth illusion via:
  - scale
  - translateX
  - z-index
  - opacity

---

### ❌ NEVER ALLOWED

- Instant snapping between states
- Hard switching of cards
- Flickering or layout reflow jumps

---

## 6. State Model (MANDATORY)

Must include:

```ts
activeIndex: number
selectedRobot: Robot