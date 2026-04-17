# Robot Selection Page — AI Guardrail Contract

## 1. Scope

This file defines **non-negotiable constraints** for generating the Robot Selection Page in MechSketch.

Applies to:
- UI generation
Robot Selection UI – Design Spec & Prompt
Overview
Build a robot selection page with a two-panel card layout. The page allows users to browse different robot types and select one. Reference the layout and style described below.

Layout
The page uses a light gray background (#f0f2f5) with a centered two-panel card:
[ Left Panel: Robot Image ]  [ Right Panel: Robot Details ]

Both panels are white cards with rounded corners (border-radius: 16px) and a subtle box shadow
The two cards sit side by side with a small gap (~16px)
Overall card max-width: ~900px, centered on the page


Left Panel – Robot Image Card

White background, rounded corners
Contains a large robot image centered and filling most of the panel
Image should have a light/white background for clean presentation
No text in this panel


Right Panel – Robot Details Card
Header Section

Robot Name — large bold heading (e.g. font-size: 28px, font-weight: 700, dark navy color #0d1b2a)
Subtitle/Description — one-line description in gray text below the name (e.g. color: #555, font-size: 15px)

Capabilities Section

Section heading: "Capabilities" in bold (font-weight: 700, font-size: 16px)
Bulleted list of 3–5 capabilities
Each bullet uses a teal/green filled circle (●) as the list marker (color: #0d9488)
Capability text in dark gray, font-size: 15px

Example capabilities:

High-Speed Assembly
3D Printing
Palletizing

Select Button

Full-width button at the bottom of the right panel
Background: deep navy blue (#0f2d5e or similar)
Text: white, font-size: 16px, centered
Border radius: fully rounded pill shape (border-radius: 50px)
Hover state: slightly lighter navy


Robot Data (Cards to Show)
Each robot card should include:
Robot TypeDescriptionCapabilitiesCartesian RobotGantry-style robot moving in linear paths along X, Y, and Z axes.High-Speed Assembly, 3D Printing, PalletizingSCARA RobotSelective compliance robot ideal for fast pick-and-place operations.Pick & Place, PCB Assembly, DispensingDelta RobotSpider-shaped parallel robot for extremely fast, light-duty tasks.Packaging, Sorting, Food HandlingArticulated RobotMulti-joint arm mimicking human shoulder, elbow, and wrist motion.Welding, Painting, Heavy LiftingCollaborative RobotHuman-safe cobot designed to work alongside people on the floor.Assembly Assist, Inspection, Screwdriving

Color Palette
ElementColorPage background#f0f2f5Card background#ffffffHeading text#0d1b2aBody/subtitle text#555555Bullet marker#0d9488 (teal)Select button bg#0f2d5e (deep navy)Select button text#ffffff

Typography

Font family: 'helvetica nue' 
Robot name heading: 28px, 700 weight
Section subheadings (e.g. "Capabilities"): 16px, 700 weight
Body / description text: 15px, 400 weight
Button label: 16px, 500 weight


Interaction / Navigation

The page should allow navigating between robots (previous / next arrows, or a carousel/tab approach)
The currently selected robot is displayed in the two-panel card
Clicking "Select robot" confirms the choice and can trigger a callback or route change

the numbering (1/4) should be placed right under the card

