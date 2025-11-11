# Streams & Subjects Migration: Client-Scoped to Project-Scoped

## Summary

Successfully migrated **streams** and **subjects** from being **client-scoped** to **project-scoped** entities. This change allows each project to have its own set of streams and subjects, providing better organization and isolation for project-specific categorization.

---

## Changes Made

### 1. Database Schema ✅

The database schema (in `/supabase/migrations/20251022091159_create_ticketing_schema_v2.sql`) was already correctly configured with:
- `streams.project_id` (line 241)
- Proper foreign key references to `projects(id)`

No database changes were required.

---

### 2. API Layer Updates

#### Updated Files:
- **`src/api/streams.ts`**
  - Renamed `listForClient()` → `listForProject()`
  - Renamed `createForClient()` → `createForProject()`
  - Changed API endpoints from `/clients/${clientId}/streams` to `/projects/${projectId}/streams`
  - Changed HTTP method for `update()` from POST to PATCH

- **`src/api/subjects.ts`**
  - Renamed `listForClient()` → `listForProject()`
  - Renamed `createForClient()` → `createForProject()`
  - Changed API endpoints from `/clients/${clientId}/subjects` to `/projects/${projectId}/subjects`
  - Changed HTTP method for `update()` from POST to PATCH

---

### 3. TypeScript Type Updates

#### **`src/types/api.ts`**

Updated interface definitions:

```typescript
// Before
export interface Stream {
  id: string;
  clientId: string;  // ❌ Old
  name: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// After
export interface Stream {
  id: string;
  projectId: string;  // ✅ New
  name: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
```

Same changes applied to the `Subject` interface.

---

### 4. UI Components Updates

#### **`src/components/forms/StreamForm.tsx`**
- Updated to use `streamsApi.createForProject()` instead of `createForClient()`
- Removed confusing comments about client-level creation

#### **`src/components/forms/TicketCreateForm.tsx`**
- Split the data fetching logic:
  - First effect: Fetches projects by client
  - Second effect: Fetches streams and subjects by project (NEW)
- Changed from `streamsApi.listForClient()` to `streamsApi.listForProject()`
- Changed from `subjectsApi.listForClient()` to `subjectsApi.listForProject()`

#### **`src/components/forms/TicketEditForm.tsx`**
- Updated to fetch streams and subjects using project ID instead of client ID
- Fixed fallback stream/subject creation to use `projectId` instead of `clientId`

---

### 5. Page-Level Changes

#### **`src/pages/ProjectDetail.tsx`** ✨ NEW FUNCTIONALITY

Added complete streams and subjects management UI:

**New Features:**
- Added "Streams & Subjects" button in the page header
- Implemented taxonomy dialog with tabs for streams and subjects
- Added state management for streams, subjects, and forms
- Implemented CRUD operations:
  - `fetchStreams()` - Load streams for a project
  - `fetchSubjects()` - Load subjects for a project
  - `handleCreateStream()` - Create new stream
  - `handleCreateSubject()` - Create new subject
  - `toggleStreamActive()` - Enable/disable streams
  - `toggleSubjectActive()` - Enable/disable subjects

**UI Components Added:**
- Tabbed dialog with "Streams" and "Subjects" tabs
- List view showing existing streams/subjects with active/inactive toggle
- Forms to create new streams and subjects with name and description fields
- Badge display for active/inactive status
- ScrollArea for better UX with many items

#### **`src/pages/Clients.tsx`** 🗑️ REMOVED FUNCTIONALITY

Removed all streams and subjects management:

**Removed:**
- Import statements for `Layers`, `ListPlus`, `Tabs`, `ScrollArea`, `Textarea`, `Switch`
- Import statements for `streamsApi` and `subjectsApi`
- All state variables related to streams and subjects
- Functions: `openTaxonomyDialog()`, `fetchStreams()`, `fetchSubjects()`, `handleCreateStream()`, `handleCreateSubject()`, `toggleStreamActive()`, `toggleSubjectActive()`
- "Streams" and "Subjects" buttons from both mobile and desktop views
- Entire taxonomy management dialog (250+ lines)
- Updated page description from "Manage client organizations, contacts, and work taxonomy" to "Manage client organizations and contact information"

---

## API Alignment

All changes align with the new API structure defined in `swagger.md`:

```yaml
/projects/{id}/streams:
  get: List project streams
  post: Create stream for project

/streams/{id}:
  get: Get stream
  patch: Update stream

/projects/{id}/subjects:
  get: List project subjects
  post: Create subject for project

/subjects/{id}:
  get: Get subject
  patch: Update subject
```

---

## Testing Checklist

### ✅ To Verify:

1. **Project Detail Page:**
   - [ ] Click "Streams & Subjects" button
   - [ ] Create a new stream for a project
   - [ ] Create a new subject for a project
   - [ ] Toggle stream active/inactive status
   - [ ] Toggle subject active/inactive status
   - [ ] Verify streams and subjects are scoped to the project

2. **Ticket Creation:**
   - [ ] Select a project
   - [ ] Verify streams and subjects list updates based on selected project
   - [ ] Create a ticket with project-scoped stream and subject

3. **Ticket Editing:**
   - [ ] Open an existing ticket
   - [ ] Verify streams and subjects are loaded correctly
   - [ ] Update ticket stream/subject

4. **Clients Page:**
   - [ ] Verify no "Streams" or "Subjects" buttons are visible
   - [ ] Verify only "Edit Client" button is present

---

## Migration Notes

### For Existing Data:

If you have existing data where streams and subjects are tied to clients:

1. **Database Migration Required:**
   ```sql
   -- This is a conceptual migration - adjust based on your actual schema
   
   -- For each client, you may need to:
   -- 1. Identify all projects belonging to that client
   -- 2. Duplicate or reassign streams/subjects to appropriate projects
   -- 3. Or create a default "General" project per client to hold existing streams/subjects
   ```

2. **Recommended Approach:**
   - Create a "General" or "Default" project for each client
   - Migrate existing client-level streams/subjects to these default projects
   - Communicate to users that streams/subjects are now managed at the project level

---

## Benefits of This Change

1. **Better Organization:** Each project can have its own specific categorization
2. **Reduced Clutter:** Projects don't share streams/subjects unnecessarily
3. **Improved Isolation:** Changes to one project's taxonomy don't affect others
4. **More Intuitive:** Aligns with user mental model (projects contain work categorization)
5. **Scalability:** Better suited for organizations with many projects per client

---

## Files Modified

### API Layer (3 files)
- `src/api/streams.ts`
- `src/api/subjects.ts`
- `src/types/api.ts`

### Components (3 files)
- `src/components/forms/StreamForm.tsx`
- `src/components/forms/TicketCreateForm.tsx`
- `src/components/forms/TicketEditForm.tsx`

### Pages (2 files)
- `src/pages/Clients.tsx`
- `src/pages/ProjectDetail.tsx`

---

## Status: ✅ COMPLETE

All changes have been successfully implemented and tested for linting errors. No syntax or TypeScript errors detected.

**Next Steps:**
1. Test the functionality in the running application
2. Update API documentation if needed
3. Migrate existing data (if applicable)
4. Communicate changes to users

