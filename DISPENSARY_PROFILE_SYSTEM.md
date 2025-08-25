# Dispensary Profile Completion System

## Overview

This system ensures that dispensary users complete their profile with required business information before accessing their dashboard. This is essential for the backend to have complete dispensary data for the actual business logic.

## How It Works

### 1. User Flow

1. Dispensary user signs up (only basic info collected)
2. Admin approves the dispensary user
3. User logs in for the first time after approval
4. System checks if profile is complete via API call
5. If profile is incomplete, user is redirected to profile completion form
6. User must fill in all required fields before accessing dashboard
7. Once profile is complete, user can access all dashboard features

### 2. Required Profile Fields

- **Address** (required): Complete dispensary address
- **Contact Number** (required): Business contact number
- **Dispensary Type** (required): One of 4 types (Community, Hospital, Clinic, Specialty)
- **Description** (required): Business description and services
- **Latitude** (optional): For location services
- **Longitude** (optional): For location services
- **Website** (optional): Business website

### 3. Components Created

#### `DispensaryProfileCompletion.jsx`

- Main profile completion form
- Handles validation and submission
- Includes geolocation feature
- Responsive design with proper error handling

#### `DispensaryProfilePage.jsx`

- Profile management page for completed profiles
- View/edit profile information
- Located at `/dashboard/dispensary/profile`

#### `useProfileCompletion.js` Hook

- Checks profile completion status
- Only applies to DISPENSARY role users
- Manages loading states and error handling

#### `useDispensary.js` Hook

- Handles all dispensary-related API operations
- Profile completion, fetching, and updating
- Centralized error handling with notifications

### 4. API Endpoints Added

- `POST /dispensary/profile-status` - Check if profile is complete (sends email in request body)
- `POST /dispensary/complete-profile` - Submit completed profile
- `GET /dispensary/profile` - Fetch current profile
- `PUT /dispensary/profile` - Update existing profile

### 5. Enhanced Components

#### `ProtectedRoute.jsx`

- Now checks profile completion for dispensary users
- Shows profile completion form when needed
- Blocks dashboard access until profile is complete

#### `AuthContext.jsx`

- Added profile completion state management
- Enhanced user data persistence
- New action: `SET_PROFILE_COMPLETION`

#### `Sidebar.jsx`

- Dispensary users get dedicated profile route
- Different profile paths for different user roles

## Backend Integration Required

To make this system work, your backend needs to implement:

### 1. Database Schema

```sql
-- Add these fields to your dispensary table
ALTER TABLE dispensary ADD COLUMN address TEXT;
ALTER TABLE dispensary ADD COLUMN longitude DOUBLE;
ALTER TABLE dispensary ADD COLUMN latitude DOUBLE;
ALTER TABLE dispensary ADD COLUMN description TEXT;
ALTER TABLE dispensary ADD COLUMN contact_number VARCHAR(20);
ALTER TABLE dispensary ADD COLUMN website VARCHAR(255);
ALTER TABLE dispensary ADD COLUMN type ENUM('COMMUNITY', 'HOSPITAL', 'CLINIC', 'SPECIALTY');
ALTER TABLE dispensary ADD COLUMN profile_completed BOOLEAN DEFAULT FALSE;
```

### 2. API Endpoints

```java
// Check profile status
@PostMapping("/dispensary/profile-status")
public ResponseEntity<ProfileStatusResponse> checkProfileStatus(@RequestBody ProfileStatusRequest request, Authentication auth) {
    // Extract email from request body: request.getEmail()
    // Check if all required fields are filled for the dispensary
    // Return { "isComplete": true/false }
}

// Complete profile
@PostMapping("/dispensary/complete-profile")
public ResponseEntity<String> completeProfile(@RequestBody DispensaryProfileRequest request, Authentication auth) {
    // Save profile data to dispensary table
    // Mark profile_completed = true
    // Return success response
}

// Get profile
@GetMapping("/dispensary/profile")
public ResponseEntity<DispensaryProfile> getProfile(Authentication auth) {
    // Return current dispensary profile data
}

// Update profile
@PutMapping("/dispensary/profile")
public ResponseEntity<String> updateProfile(@RequestBody DispensaryProfileRequest request, Authentication auth) {
    // Update existing profile data
    // Return success response
}
```

#### Request Body Structures

For the profile status check endpoint:

```json
{
  "email": "dispensary@example.com"
}
```

For profile completion/update:

```json
{
  "address": "123 Main Street, City, State",
  "contactNumber": "+1234567890",
  "type": "COMMUNITY",
  "description": "Full service community pharmacy",
  "latitude": 40.7128,
  "longitude": -74.006,
  "website": "https://example.com"
}
```

### 3. Profile Status Check Logic

The profile is considered complete when all required fields are non-null/non-empty:

- address
- contact_number
- type
- description

## Security Considerations

1. **Role-based Access**: Only DISPENSARY role users see the profile completion
2. **JWT Validation**: All API calls include authentication tokens
3. **Data Validation**: Both frontend and backend validate required fields
4. **Unauthorized Access**: Users can't bypass profile completion

## Future Enhancements

1. **File Uploads**: Add support for dispensary licenses/certificates
2. **Address Validation**: Integrate with address validation services
3. **Business Hours**: Add operating hours configuration
4. **Multiple Locations**: Support for dispensary chains
5. **Image Gallery**: Add photos of the dispensary

## Testing the System

1. Create a dispensary user account
2. Have admin approve the account
3. Login as the dispensary user
4. Verify profile completion form appears
5. Fill out the form and submit
6. Verify dashboard access is granted
7. Check profile page for viewing/editing

## Error Handling

- **Network Errors**: Proper error messages and retry options
- **Validation Errors**: Field-level validation with clear messages
- **Server Errors**: Graceful error handling with user notifications
- **Session Expiry**: Automatic logout and login redirect

This system ensures data integrity and provides a smooth user experience while maintaining security and proper role-based access control.
