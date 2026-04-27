# Top Navigation

## Overview
The top navigation provides access to core actions (Simulate) and displays the current project name. It also includes user identity and quick interaction controls.

---

## Navbar Container

- **Background Color:** #FFFFFF
- **Padding:**
  - Top: 8px
  - Bottom: 8px
- **Height:** 56px (recommended instead of 15 for usability — confirm if intentional)
- **Border (Bottom Stroke):** 1px solid #EAEAEE

---


### Layout
- Full-width horizontal container
- Background color: #FFFFFF
- Display: Flex
- Align items: Center
- Justify content: Space-between
- Vertical alignment: Center

---

## 🔹 Left Section (File Menu)

### File Text
- Text: **File**
- Font size: 15px
- Line height: 23px
- Letter spacing: 0
- Font weight: 500 (Medium)
- Color: #374049

---

### Dropdown Icon
- Type: Chevron down
- Size: 24px
- Color: #374049
- Position: Right of "File"
- Spacing: 4–8px from text

---

## 🔹 Center Section (Project Name)

### Project Name Container
- Background color: #F6F7F9
- Padding: (auto or ~8–12px horizontal depending on layout)
- Border radius: (optional: 6–8px for soft UI)

---

### Project Name Text
- Text: *Name of project* (editable)
- Font size: 15px
- Line height: 23px
- Letter spacing: 0
- Font weight: 600
- Color: #374049
- Alignment: Centered

---

## 🔹 Right Section (Actions & Profile)

### Simulate Button
- Text: Simulate
- Background color: #00376E

#### Padding
- Left/Right: 8px
- Top/Bottom: 6px

#### Typography
- Font size: 13px
- Line height: 18px
- Font weight: 600
- Letter spacing: 0
- Text color: #ECF5FE

---

### Selected Robot/Object Indicator

- Background color: #EDFCFC
- Text: *Name of robot/object*

#### Typography
- Font size: 13px
- Line height: 18px
- Font weight: 600
- Letter spacing: 0
- Text color: #00857A

---

### Profile Avatar

#### Container
- Shape: Circle
- Background color: #000000
- Size: (commonly 32–40px, define in implementation)

#### Text (Initial)
- Example: **E**
- Font size: 18px
- Line height: 18px
- Font weight: 300 (Thin)
- Letter spacing: 0
- Color: #FFFFFF
- Alignment: Centered

---

### Profile Dropdown Icon
- Type: Chevron down
- Size: 24px
- Color: #000000
- Position: Right of avatar
- Spacing: 6–10px

---

## 🔸 Spacing System

- Gap between right section elements:
  - Simulate → Robot/Object: 12–16px
  - Robot/Object → Profile: 12–16px
  - Profile → Dropdown: 6–10px

---

## 🧱 Notes for Implementation

- Ensure clear visual grouping:
  - Left = Navigation
  - Center = Context (Project)
  - Right = Actions + Identity
- Maintain consistent vertical alignment across all elements
- Use hover states for:
  - File menu
  - Buttons
  - Profile dropdown
- Ensure truncation/ellipsis for long project names

---