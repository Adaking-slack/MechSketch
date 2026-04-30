# Password Reset (Forgot Password)

## Overview
Allows users to reset their password via email.

## UI Elements
- Modal (centered)
- Input: Email Address
- Button: Send Reset Link
- Close (X) button

## Behavior
- Email must be valid
- Shows loading state on submit
- Success message: “Reset link sent to your email”

## Actions
- Trigger password reset request
- Close modal after success or manual close

## Notes
- Close modal on outside click or X