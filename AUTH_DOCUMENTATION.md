# Authentication System Documentation

## Overview

This authentication system provides comprehensive user management with role-based access control, protected routes, and automatic API token injection.

## Features

- **Role-based Authentication**: Support for ADMIN, DOCTOR, PATIENT, and DISPENSARY roles
- **Protected Routes**: Route-level access control based on user roles
- **Automatic Token Management**: Persistent token storage and automatic injection in API calls
- **Session Management**: Automatic logout on token expiry
- **API Service**: Centralized API service with error handling
- **Token Persistence**: Tokens and user data are stored in localStorage for session persistence across browser refreshes

## Token Storage Strategy

The system uses localStorage to persist authentication state:

- `auth_token`: Stores the JWT token
- `auth_user`: Stores user information (id, email, role)

**Note**: This approach prioritizes user experience over maximum security. For applications requiring higher security, consider:

- Using HTTP-only cookies instead of localStorage
- Implementing token refresh mechanisms
- Adding token expiration validation

## Usage

### 1. Authentication Context

The `AuthProvider` wraps your entire application and provides authentication state:

```jsx
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return <AuthProvider>{/* Your app components */}</AuthProvider>;
}
```

### 2. Using Authentication in Components

```jsx
import { useAuth } from "../contexts/AuthContext";

const MyComponent = () => {
  const { isAuthenticated, user, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <LoginButton onClick={() => login({ email, password })} />;
  }

  return (
    <div>
      Welcome, {user.email}!<button onClick={logout}>Logout</button>
    </div>
  );
};
```

### 3. Protected Routes

Protect entire routes or route sections:

```jsx
import ProtectedRoute from './components/auth/ProtectedRoute'

// Admin only
<Route path="/admin/*" element={
  <ProtectedRoute requiredRole="ADMIN">
    <AdminDashboard />
  </ProtectedRoute>
} />

// Multiple roles
<Route path="/prescriptions" element={
  <ProtectedRoute requiredRoles={["DOCTOR", "PATIENT"]}>
    <PrescriptionsPage />
  </ProtectedRoute>
} />

// Any authenticated user
<Route path="/profile" element={
  <ProtectedRoute>
    <ProfilePage />
  </ProtectedRoute>
} />
```

### 4. API Service

Use the `useApi` hook for authenticated API calls:

```jsx
import { useApi } from "../hooks/useApi";

const MyComponent = () => {
  const { get, post, put, delete: del, loading, error } = useApi();

  const loadData = async () => {
    try {
      const data = await get("/api/data");
      setData(data);
    } catch (err) {
      console.error("Failed to load data:", err);
    }
  };

  const saveData = async (newData) => {
    try {
      await post("/api/data", newData);
    } catch (err) {
      console.error("Failed to save data:", err);
    }
  };
};
```

### 5. Role Checking

Use role checking hooks for conditional rendering:

```jsx
import { useRoleCheck } from "../hooks/useRoleGuard";

const MyComponent = () => {
  const { isAdmin, isDoctor, hasRole, hasAnyRole } = useRoleCheck();

  return (
    <div>
      {isAdmin && <AdminPanel />}
      {isDoctor && <DoctorTools />}
      {hasRole("PATIENT") && <PatientInfo />}
      {hasAnyRole(["DOCTOR", "ADMIN"]) && <AdvancedFeatures />}
    </div>
  );
};
```

## API Endpoints Expected

The system expects these backend endpoints:

- `POST /api/auth/login` - Login endpoint
- `POST /api/auth/logout` - Logout endpoint (optional - for server-side cleanup)
- `POST /api/auth/register` - Registration endpoint

**Note**: The system does NOT require a token verification endpoint. Authentication state is managed client-side using localStorage persistence.### Login Response Format

The login endpoint should return:

```json
{
  "token": "jwt-token-here",
  "id": 123,
  "email": "user@example.com",
  "role": "ADMIN"
}
```

## Security Features

- **Token Persistence**: Tokens are stored in localStorage for persistence across sessions
- **Automatic Logout**: Users are logged out when tokens expire (401 responses)
- **Route Protection**: Unauthorized access redirects to appropriate pages
- **Role Validation**: Backend roles are validated before allowing access

## File Structure

```
src/
├── contexts/
│   └── AuthContext.js          # Main authentication context
├── components/
│   └── auth/
│       └── ProtectedRoute.jsx  # Protected route component
├── hooks/
│   ├── useApi.js              # API service hook
│   └── useRoleGuard.js        # Role checking hooks
├── pages/
│   └── UnauthorizedPage.jsx   # Unauthorized access page
└── components/
    └── AuthModal/
        ├── LoginForm.jsx       # Updated login form
        └── RegistrationForm.jsx # Updated registration form
```

## Best Practices

1. **Always use the API service** for authenticated requests
2. **Check roles at both route and component levels** for security
3. **Handle loading and error states** appropriately
4. **Use protected routes** for sensitive pages
5. **Clear sensitive data** on logout

## Common Patterns

### Conditional Navigation

```jsx
const Navigation = () => {
  const { isAuthenticated, user } = useAuth();
  const { isAdmin } = useRoleCheck();

  return (
    <nav>
      <Link to="/">Home</Link>
      {isAuthenticated ? (
        <>
          <Link to="/profile">Profile</Link>
          {isAdmin && <Link to="/admin">Admin</Link>}
          <LogoutButton />
        </>
      ) : (
        <LoginButton />
      )}
    </nav>
  );
};
```

### Data Fetching with Authentication

```jsx
const DataComponent = () => {
  const { get } = useApi();
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await get("/api/protected-data");
        setData(result);
      } catch (error) {
        // Handle error (user will be auto-logged out if token expired)
      }
    };

    fetchData();
  }, []);

  return <div>{/* Render data */}</div>;
};
```
