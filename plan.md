
# Remove Phone Sign-In Option from Vendor Auth Page

## Overview
Remove the phone/OTP authentication method from the vendor authentication page, leaving only Google Sign-In and Email/Password options.

## Changes Required

### 1. Remove Phone-Related Imports
- Remove `Phone` from lucide-react imports
- Remove `signInWithPhone` and `verifyOTP` from AuthContext destructuring

### 2. Remove Phone-Related State
Remove the following state variables:
- `authMethod` state (no longer needed without tabs)
- `showOTP` state
- `phoneNumber` state

### 3. Remove Phone-Related Schemas and Types
- Remove `phoneSchema` definition
- Remove `otpSchema` definition
- Remove `PhoneFormData` type
- Remove `OTPFormData` type

### 4. Remove Phone-Related Form Hooks
- Remove `phoneForm` useForm hook
- Remove `otpForm` useForm hook

### 5. Remove Phone-Related Handlers
- Remove `handlePhoneAuth` function
- Remove `handleOTPVerify` function

### 6. Simplify the UI - Remove Tabs Component
Since we only have email now, remove the entire Tabs structure and show the email form directly:
- Remove `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` components
- Keep only the email form content
- Remove the Tabs import from UI components

## Resulting Auth Options
After this change, vendors will have two authentication methods:
1. **Google Sign-In** - Primary OAuth option
2. **Email/Password** - Traditional login with forgot password support

## Technical Details
The changes are straightforward removal of unused code with no impact on existing email or Google authentication flows.
