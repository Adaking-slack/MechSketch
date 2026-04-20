# MechSketch Onboarding – Authentication Screen

## Overview
This screen serves as the entry point into MechSketch. It allows users to authenticate via social providers or email before entering the product.

---

## Layout Structure

- Centered vertical layout
- Max-width container (recommended: 400–480px)
- Elements stacked with consistent vertical spacing
- Background: Light neutral

---

## Typography

### Heading (Welcome Text)
- Text: "Welcome to MechSketch"
- Font Size: 48px
- Line Height: 67px
- Letter Spacing: -1px
- Font Weight: Medium / Semi-bold
- Color: #374049
- Alignment: Center

---

### Subtext
- Text: "Build, test, and refine robot task sequences using an interactive 3D environment."
- Font Size: 15px
- Line Height: 23px
- Letter Spacing: 0
- Color: #374049
- Alignment: Center

---

### Input Placeholder Text
- Font Size: 15px
- Line Height: 23px
- Letter Spacing: 0
- Color: #656768

---

## Buttons

### Primary Social Buttons

#### Google Button
- Text: "Continue with Google"
- Background: Dark Blue (#0B3A6E or similar from UI)
- Text Color: White
- Height: 48–56px
- Border Radius: 8–12px
- Icon: Google logo (left-aligned)
- Layout: Icon + Text centered

---

#### Apple Button
- Text: "Continue with Apple"
- Same styling as Google button
- Icon: Apple logo

---

## Input Field

### Email Input
- Placeholder: "Enter your email"
- Background Color: #F6F7F9
- Border: 1px solid #656768
- Input Fill (inner): #EAEAEA
- Height: 48–56px
- Border Radius: 8–10px
- Padding: 12–16px

---

## Secondary Button

### Continue with Email
- Text: "Continue with email"
- Background: #EAEAEA
- Text Color: Muted (dark gray)
- Disabled state until input is valid
- Same height as input field

---

## Footer Text

- Text: "Don’t have an account? sign up here"
- Font Size: 13–14px
- Alignment: Center

### Link
- "sign up here"
- Color: Blue (interactive)
- Underline on hover

---

## Spacing System (Recommended)

- Heading → Subtext: 8–12px
- Subtext → Buttons: 24–32px
- Button → Button: 12–16px
- Buttons → Input: 24px
- Input → CTA: 12px
- CTA → Footer: 16–20px

---

## States & Behavior

### Input Field
- Default: Neutral border (#656768)
- Focus: Highlight border (brand color)
- Error: Red border + helper text

---

### Button States
- Default: Active
- Hover: Slight elevation or brightness increase
- Disabled:
  - Reduced opacity
  - No pointer interaction

---

## Accessibility Notes

- Ensure contrast ratio meets WCAG standards
- All buttons must be keyboard navigable
- Labels should be screen-reader friendly
- Provide error feedback for invalid email input

---

## Functional Requirements

- Google OAuth integration
- Apple OAuth integration
- Email authentication via Supabase
- Validation:
  - Email must be correctly formatted before enabling CTA

---

## Entry Point to Product

On successful authentication:
→ Redirect to onboarding flow (robot selection / workspace)
