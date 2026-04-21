# Left Panel — Home Page

## Overview
The left panel contains dynamically generated **Action Cards** based on the selected robot. These cards represent key actions a user can perform and support drag-and-drop interactions.

---

## Section: Action Cards

### Heading
- **Text:** Action Cards
- **Font Size:** 22px
- **Line Height:** 31px
- **Letter Spacing:** -1
- **Color:** #374049

---

## Action Cards (Dynamic Component)

### Core Principle
- Action Cards must represent **all possible movements and actions** a selected robot can perform.
- Every **movement capability** (e.g., rotate, extend, lift) and every **functional action** (e.g., pick, place, scan) must be reflected as an Action Card.
- The system should ensure **complete coverage** of the robot’s capabilities — no supported action should be omitted.

---

### Behavior
- Action cards are **dynamically generated** based on the selected robot.
- Each robot defines its own set of action cards.
- Cards are **interactive** and support **drag-and-drop (pick and drop)** functionality.

---

## Drag and Drop

### Interaction
- Users can:
  - Pick up a card
  - Drag it
  - Drop it into a target area

### Implementation
- Built using:
  - **DND Kit (Drag-and-Drop Toolkit)**

---

## Card Structure

Each Action Card includes:
- Icon
- Label (text)
- Background container

---

## Example Card: "Pick"

### Container
- **Background Color:** #F6F7F9
- **Border:** 1px solid #EAEAEA
- **Border Radius:** (define if needed, e.g. 8px)
- **Padding:** (define if needed)

### Text
- **Content:** Pick
- **Color:** #374049

### Icon
- **Icon Background Color:** #A71065
- **Icon Color:** #FDF6FE
  - (Derived from ~98% lightness of icon background)

---

## Theming System

### Key Rule
- Each Action Card has a **unique color theme**.
- Colors change per card but follow the same structure:

#### Theme Properties
- Card Background Color
- Text Color
- Icon Background Color
- Icon Color (derived from background)
- Border Color

---

## Dynamic Generation Logic

```pseudo
onRobotSelect(robot):
    capabilities = getRobotCapabilities(robot)

    for each capability in capabilities:
        create ActionCard with:
            - label (action name)
            - icon
            - theme colors
            - drag enabled