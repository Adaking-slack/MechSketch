# Profile Settings

## Overview
Allows users to view and update their personal information.

## UI Elements
- Input: Full Name
- Input: Email Address (read-only / disabled)
- Button: Save Changes

## Behavior
- Fields are pre-filled with current user data
- Email must be valid (contains @ and domain)
- Empty fields show: “This field is required”

## Actions
- On Save Changes:
  - Validate inputs
  - Update user profile
  - Show success message: “Profile updated successfully”

## Notes
- Email change may require verification (optional)