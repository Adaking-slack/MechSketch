# Object Selection Page — AI Guardrail Contract

## 1. Scope

This file defines **non-negotiable constraints** for generating the Object Selection Page in MechSketch.

Applies to:
- UI generation

## 2. Design Spec

### Overview
Build an object selection page with a two-panel card layout. The page allows users to browse different object types and select one.

### Layout
The page uses a light gray background (#f0f2f5) with a centered two-panel card:
[ Left Panel: Object Image ]  [ Right Panel: Object Details ]

Both panels are white cards with rounded corners (border-radius: 16px) and a subtle box shadow
The two cards sit side by side with a small gap (~16px)
Overall card max-width: ~900px, centered on the page

### Left Panel – Object Image Card
White background, rounded corners
Contains a large object 3D viewer centered and filling most of the panel
Object should have a light/white background for clean presentation
No text in this panel

### Right Panel – Object Details Card
#### Header Section
Object Name — large bold heading (e.g. font-size: 28px, font-weight: 700, dark navy color #0d1b2a)
Subtitle/Description — one-line description in gray text below the name (e.g. color: #555, font-size: 15px)

#### Specs Section
Section heading: "Specifications" in bold (font-weight: 700, font-size: 16px)
Bulleted list of specs
Each bullet uses a teal/green filled circle (●) as the list marker (color: #0d9488)
Spec text in dark gray, font-size: 15px

#### Select Button
Full-width button at the bottom of the right panel
Background: deep navy blue (#0f2d5e or similar)
Text: white, font-size: 16px, centered
Border radius: fully rounded pill shape (border-radius: 50px)
Hover state: slightly lighter navy

### Color Palette
| Element | Color |
|---------|-------|
| Page background | #f0f2f5 |
| Card background | #ffffff |
| Heading text | #0d1b2a |
| Body/subtitle text | #555555 |
| Bullet marker | #0d9488 (teal) |
| Select button bg | #0f2d5e (deep navy) |
| Select button text | #ffffff |

### Typography
Font family: 'helvetica neue'
Object name heading: 28px, 700 weight
Section subheadings (e.g. "Specifications"): 16px, 700 weight
Body / description text: 15px, 400 weight
Button label: 16px, 500 weight

### Interaction / Navigation
The page should allow navigating between objects (previous / next arrows, or a carousel/tab approach)
The currently selected object is displayed in the two-panel card
Clicking "Select object" confirms the choice and navigates to the next step
The numbering (1/4) should be placed right under the card

### Objects to Show
| Object | Description | Specs |
|--------|------------|------|
| Box | Standard cardboard box for packaging and shipping | 200×150×100mm • Up to 5kg |
| Cylinder | Cylindrical container for liquids and small parts | Ø80mm × 120mm • Up to 2kg |
| Sphere | Spherical object for precision handling | Ø60mm • Precision required |
| Pallet | Standard shipping pallet for bulk material handling | 1200×1000×150mm • Up to 100kg |