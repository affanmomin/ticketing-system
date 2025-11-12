# Hierarchical Streams UI Guide

## Visual Flow Diagrams

### 1. Creating a Ticket with Hierarchical Streams

```
┌─────────────────────────────────────────────────────────────┐
│                     Create Ticket Form                       │
│                    Step 1: Basic Info                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Stream Category *                                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ -- Select Category --                            ▼    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘

User selects "Frontend" ↓

┌─────────────────────────────────────────────────────────────┐
│                     Create Ticket Form                       │
│                    Step 1: Basic Info                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Stream Category *                                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Frontend                                         ▼    │  │
│  └───────────────────────────────────────────────────────┘  │
│  Frontend development work                                   │
│                                                               │
│  Stream Type *                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ -- Select Type --                                ▼    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘

User selects "UI Components" ↓

┌─────────────────────────────────────────────────────────────┐
│                     Create Ticket Form                       │
│                    Step 1: Basic Info                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Stream Category *                                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Frontend                                         ▼    │  │
│  └───────────────────────────────────────────────────────┘  │
│  Frontend development work                                   │
│                                                               │
│  Stream Type *                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ UI Components                                    ▼    │  │
│  └───────────────────────────────────────────────────────┘  │
│  Reusable UI components                                      │
│                                                               │
│  ✓ Selected: Frontend > UI Components                       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 2. Parent Stream with No Children

```
User selects "Operations" (which has no children) ↓

┌─────────────────────────────────────────────────────────────┐
│                                                               │
│  Stream Category *                                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Operations                                       ▼    │  │
│  └───────────────────────────────────────────────────────┘  │
│  Operations and maintenance work                            │
│                                                               │
│  Stream Type (Optional)                                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ ℹ️  No sub-categories available.                       │  │
│  │   Using "Operations" directly.                         │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ✓ Selected: Operations                                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 3. Loading State

```
User selects "Backend" ↓

┌─────────────────────────────────────────────────────────────┐
│                                                               │
│  Stream Category *                                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Backend                                          ▼    │  │
│  └───────────────────────────────────────────────────────┘  │
│  Backend development work                                    │
│                                                               │
│  Stream Type *                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ ⟳ Loading options...                                  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Project Detail Page - Stream Management

### Creating a Level 1 (Parent) Stream

```
┌─────────────────────────────────────────────────────────────┐
│                     Create Stream                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Parent Stream (Optional)                                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ None (Create Level 1 Stream)                     ▼    │  │
│  └───────────────────────────────────────────────────────┘  │
│  This will create a Level 1 (parent) stream                 │
│                                                               │
│  Name *                                                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Frontend, Backend, Operations, etc.                    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  Description                                                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Optional details...                                    │  │
│  │                                                         │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Create Stream                             │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Creating a Level 2 (Child) Stream

```
┌─────────────────────────────────────────────────────────────┐
│                     Create Stream                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Parent Stream (Optional)                                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Frontend                                         ▼    │  │
│  └───────────────────────────────────────────────────────┘  │
│  This will create a Level 2 (child) stream under the        │
│  selected parent                                             │
│                                                               │
│  Name *                                                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ UI Components, API Endpoints, etc.                     │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  Description                                                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Optional details...                                    │  │
│  │                                                         │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Create Stream                             │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Stream List Display with Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                         Streams                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Frontend                                            │    │
│  │ Frontend development work                           │    │
│  │ Parent Stream (Level 1)                             │    │
│  │                                    [Active] ━       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│      ┌─────────────────────────────────────────────────┐    │
│  ┃   │ Frontend → UI Components                       │    │
│  ┃   │ Reusable UI components                         │    │
│  ┃   │                                  [Active] ━     │    │
│      └─────────────────────────────────────────────────┘    │
│                                                               │
│      ┌─────────────────────────────────────────────────┐    │
│  ┃   │ Frontend → Pages                               │    │
│  ┃   │ Application pages                              │    │
│  ┃   │                                  [Active] ━     │    │
│      └─────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Backend                                             │    │
│  │ Backend development work                            │    │
│  │ Parent Stream (Level 1)                             │    │
│  │                                    [Active] ━       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│      ┌─────────────────────────────────────────────────┐    │
│  ┃   │ Backend → API Endpoints                        │    │
│  ┃   │ RESTful API development                        │    │
│  ┃   │                                  [Active] ━     │    │
│      └─────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Operations                                          │    │
│  │ Operations and maintenance work                     │    │
│  │ Parent Stream (Level 1)                             │    │
│  │                                    [Active] ━       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘

Legend:
┃ = Child stream indicator (indented with left border)
━ = Toggle switch for active/inactive status
```

## Common User Scenarios

### Scenario 1: Create a Ticket for Frontend UI Work

1. Open ticket creation form
2. Select "Frontend" from Stream Category
3. Select "UI Components" from Stream Type
4. Continue with ticket details
5. **Result**: Ticket created with `streamId` = UI Components child ID

### Scenario 2: Create a Ticket for Operations (No Children)

1. Open ticket creation form
2. Select "Operations" from Stream Category
3. See message: "No sub-categories available"
4. Continue with ticket details
5. **Result**: Ticket created with `streamId` = Operations parent ID

### Scenario 3: Setup New Project Streams

1. Go to Project Detail page
2. Click "Streams & Subjects"
3. Create "Frontend" parent stream (no parent selected)
4. Create "Backend" parent stream (no parent selected)
5. Select "Frontend" as parent, create "UI Components" child
6. Select "Frontend" as parent, create "Pages" child
7. Select "Backend" as parent, create "API Endpoints" child
8. **Result**: Hierarchical stream structure ready for use

### Scenario 4: Edit a Ticket's Stream

1. Open ticket edit form
2. Current stream is shown (e.g., "Frontend > UI Components")
3. Change parent to "Backend"
4. Child streams for Backend load automatically
5. Select "API Endpoints"
6. Save changes
7. **Result**: Ticket stream updated to Backend > API Endpoints

## Error States

### No Streams Available

```
┌─────────────────────────────────────────────────────────────┐
│  Stream Category *                                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ -- Select Category --                            ▼    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ℹ️  No streams found. Create streams in the project         │
│     workspace first.                                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### API Error

```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️  Failed to load stream categories                        │
│                                                               │
│  Stream Category *                                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ -- Select Category --                            ▼    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Keyboard Navigation Tips

- **Tab**: Navigate between dropdowns
- **Space/Enter**: Open dropdown
- **Arrow Keys**: Navigate dropdown options
- **Esc**: Close dropdown
- **Type to Search**: Start typing to filter options (native select behavior)

## Accessibility Features

- ✅ Proper label associations
- ✅ Required field indicators
- ✅ Loading state announcements
- ✅ Error messages
- ✅ Helper text for context
- ✅ Keyboard navigation support

## Mobile Considerations

On mobile devices:
- Dropdowns use native select controls
- Better touch targets
- Optimized for small screens
- Reduced vertical space usage

## Performance Notes

- Parent streams: Loaded once on mount
- Child streams: Loaded on-demand when parent is selected
- No unnecessary re-renders
- Efficient state management
- Minimal API calls

## Best Practices for Users

1. **Organize Logically**: Group related work under parent streams
2. **Limit Children**: Keep 3-7 children per parent for usability
3. **Clear Names**: Use descriptive, consistent naming
4. **Active Management**: Deactivate unused streams instead of deleting
5. **Documentation**: Add descriptions to help team members understand purpose

---

This UI guide demonstrates the user-friendly, intuitive interface for managing and using hierarchical streams in your ticketing system.

