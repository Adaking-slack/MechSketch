# Password Settings

## Overview
Allows users to securely change their password.

## UI Elements
- Input: Current Password
- Input: New Password
- Input: Confirm New Password
- Button: Update Password

## Behavior
- New password must be at least 6 characters
- If passwords do not match → “Passwords do not match”
- If current password is wrong → “Incorrect current password”

## Actions
- On Update Password:
  - Validate inputs
  - Update password
  - Show success: “Password updated successfully”

## Notes
- Clear fields after successful update