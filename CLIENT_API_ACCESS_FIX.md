# Client Role API Access Fix

**Date:** November 10, 2025

## Problem

When CLIENT role users attempted to create tickets or access various pages, the application was making unauthorized API calls to endpoints they don't have permission to access:
- `/clients` - List all clients (should only be accessible to ADMIN/EMPLOYEE)
- `/users` - List all users (should only be accessible to ADMIN/EMPLOYEE)

This resulted in 403 Forbidden errors and broken functionality.

## Solution

Modified the frontend to detect when a CLIENT user is logged in and:
1. Skip calling restricted APIs
2. Use the client's own `clientId` from the authenticated user data (`/auth/me`)
3. Hide UI elements that don't apply to CLIENT users

## Files Modified

### 1. `src/components/forms/TicketCreateForm.tsx`
**Changes:**
- Added `useAuthStore` to detect user role
- Skip `/clients` API call for CLIENT users
- Use `user.clientId` for CLIENT users instead of fetching from API
- Hide the client selector dropdown for CLIENT users (they can only create tickets for their own client)

**Key Logic:**
```typescript
const isClient = user?.role === "CLIENT";
const userClientId = user?.clientId || null;

// For client users, use their own clientId
const effectiveClientId = isClient ? userClientId : clientId;
```

### 2. `src/pages/Tickets.tsx`
**Changes:**
- Skip `/clients` and `/users` API calls for CLIENT users
- CLIENT users only fetch projects data
- Set empty arrays for clients and users lists

**Key Logic:**
```typescript
if (isClient) {
  // Only fetch projects
  const { data: projectsRes } = await projectsApi.list({ limit: 200, offset: 0 });
  setProjects(projectsRes.data);
  setClients([]);
  setUsers([]);
} else {
  // Admin/Employee fetch all data
  const [projectsRes, clientsRes, usersRes] = await Promise.all([...]);
}
```

### 3. `src/pages/Projects.tsx`
**Changes:**
- Skip `/clients` API call for CLIENT users
- Return early with empty clients array for CLIENT users

### 4. `src/pages/ProjectDetail.tsx`
**Changes:**
- Skip `/clients` and `/users` API calls for CLIENT users
- Set empty arrays for both when CLIENT user is detected

## Data Flow for CLIENT Users

### Before Fix:
```
CLIENT user clicks "Create Ticket"
  → Form loads
  → Calls /clients API → 403 Forbidden ❌
  → Form breaks
```

### After Fix:
```
CLIENT user clicks "Create Ticket"
  → Form loads
  → Detects user.role === "CLIENT"
  → Uses user.clientId from auth context ✅
  → Skips /clients API call
  → Form works correctly
```

## User Data Structure

The authenticated user data from `/auth/me` includes:
```typescript
interface AuthUser {
  id: string;
  organizationId: string;
  role: UserRole; // "ADMIN" | "EMPLOYEE" | "CLIENT"
  clientId: string | null; // ← CLIENT users have this populated
  fullName?: string | null;
  email?: string | null;
  isActive?: boolean;
}
```

For CLIENT users, `clientId` is populated with their associated client's ID, allowing the frontend to use this value without needing to call the `/clients` API.

## Testing Checklist

- [x] CLIENT users can create tickets without errors
- [x] CLIENT users don't see client selector (it's hidden)
- [x] CLIENT users can view tickets page
- [x] CLIENT users can view projects page
- [x] CLIENT users can view project detail page
- [x] ADMIN/EMPLOYEE users retain full functionality
- [x] No TypeScript compilation errors
- [x] No linter errors

## Impact

✅ **Fixed:** CLIENT users can now successfully create tickets and navigate the application
✅ **Improved:** Reduced unnecessary API calls for CLIENT users
✅ **Better UX:** Cleaner interface for CLIENT users (no irrelevant dropdowns)
✅ **Security:** Frontend respects backend permissions model

