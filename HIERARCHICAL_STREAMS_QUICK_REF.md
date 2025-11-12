# Hierarchical Streams - Quick Reference

## 🚀 Quick Start

### Using Hierarchical Streams in Ticket Creation

```typescript
import { StreamSelector } from "@/components/StreamSelector";

<StreamSelector
  projectId={projectId}
  value={streamId}
  onValueChange={(streamId) => setStreamId(streamId)}
  required
/>
```

### Creating Streams

```typescript
// Level 1 (Parent)
await streamsApi.createForProject(projectId, {
  name: "Frontend",
  description: "Frontend development work",
  parentStreamId: null  // or undefined
});

// Level 2 (Child)
await streamsApi.createForProject(projectId, {
  name: "UI Components",
  description: "Reusable UI components",
  parentStreamId: parentStreamId
});
```

## 📚 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/projects/{id}/streams/parents` | GET | Get all Level 1 streams for a project |
| `/streams/{id}/children` | GET | Get all Level 2 streams for a parent |
| `/projects/{id}/streams` | POST | Create a new stream (Level 1 or 2) |
| `/streams/{id}` | POST | Update a stream |

## 🎯 Key Concepts

### Stream Levels

- **Level 1 (Parent)**: Top-level categories (e.g., "Frontend", "Backend")
  - `parentStreamId` is `null`
  - Can have multiple children
  - Can be used directly if no children exist

- **Level 2 (Child)**: Sub-categories (e.g., "UI Components", "Pages")
  - `parentStreamId` points to a parent stream
  - Belongs to exactly one parent
  - Always used when available

### Selection Logic

```
IF child selected:
  ✓ Use child stream ID
ELSE IF parent has no children:
  ✓ Use parent stream ID
ELSE:
  ✗ Validation error (child required)
```

## 🔧 Component Props

### StreamSelector

```typescript
interface StreamSelectorProps {
  projectId: string;        // Required: Project to fetch streams for
  value: string;            // Required: Current stream ID
  onValueChange: (id: string) => void;  // Required: Callback
  disabled?: boolean;       // Optional: Disable dropdowns
  required?: boolean;       // Optional: Show * indicator
}
```

## 📊 Type Definitions

```typescript
interface Stream {
  id: string;
  projectId: string;
  parentStreamId: string | null;  // null = Level 1, string = Level 2
  name: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## 🎨 UI States

| State | Description | UI Behavior |
|-------|-------------|-------------|
| Initial | No parent selected | Only Dropdown 1 visible |
| Loading | Fetching children | Shows spinner in Dropdown 2 |
| Has Children | Parent has children | Dropdown 2 enabled and required |
| No Children | Parent has no children | Shows info message, uses parent |
| Error | API failure | Shows error alert |

## ✅ Validation

### Frontend Rules
- ✅ Parent selection is always required
- ✅ Child selection required only if children exist
- ✅ At least one dropdown must have a value

### Backend Rules (Already Implemented)
- ✅ Stream must exist
- ✅ Stream must belong to project
- ✅ Stream must be active
- ✅ No circular parent references

## 🐛 Common Issues & Solutions

### Issue: Dropdown 2 doesn't appear
**Solution**: Parent must be selected first

### Issue: Can't select child stream
**Solution**: Ensure parent stream has active children

### Issue: "No sub-categories" message
**Solution**: This is expected - use parent stream directly

### Issue: Stream not showing in list
**Solution**: Check stream is `active: true` and has correct `projectId`

## 💡 Code Examples

### Example 1: Basic Usage

```typescript
const [streamId, setStreamId] = useState("");

return (
  <StreamSelector
    projectId="project-123"
    value={streamId}
    onValueChange={setStreamId}
    required
  />
);
```

### Example 2: With Form

```typescript
const [form, setForm] = useState({
  title: "",
  streamId: "",
  // ... other fields
});

return (
  <StreamSelector
    projectId={projectId}
    value={form.streamId}
    onValueChange={(id) => setForm(prev => ({ 
      ...prev, 
      streamId: id 
    }))}
    disabled={!projectId}
    required
  />
);
```

### Example 3: Fetch Parent Streams

```typescript
import * as streamsApi from "@/api/streams";

const fetchParents = async () => {
  const { data } = await streamsApi.listParentsForProject(projectId);
  console.log(data); // Array of Level 1 streams
};
```

### Example 4: Fetch Child Streams

```typescript
const fetchChildren = async (parentId: string) => {
  const { data } = await streamsApi.listChildren(parentId);
  console.log(data); // Array of Level 2 streams
};
```

### Example 5: Create Ticket with Stream

```typescript
await ticketsApi.create({
  projectId: "project-123",
  streamId: "stream-abc",  // Can be parent OR child ID
  subjectId: "subject-xyz",
  priorityId: "priority-high",
  statusId: "status-open",
  title: "Fix button styling",
  descriptionMd: "Button is misaligned on mobile"
});
```

## 🎭 Visual Patterns

### Breadcrumb Display
```
✓ Selected: Frontend > UI Components
```

### Parent Only
```
✓ Selected: Operations
```

### Loading
```
⟳ Loading options...
```

### Empty State
```
ℹ️  No sub-categories available. Using "Frontend" directly.
```

## 🔍 Debugging Tips

### Check State in DevTools

```typescript
// StreamSelector internal state
{
  parentStreams: Stream[],      // All Level 1 streams
  childStreams: Stream[],        // Children of selected parent
  selectedParent: string,        // Parent stream ID
  selectedChild: string,         // Child stream ID
  loadingParents: boolean,
  loadingChildren: boolean,
  error: string | null
}
```

### Console Logging

```typescript
// Add to StreamSelector for debugging
useEffect(() => {
  console.log('Stream selection:', {
    parent: selectedParent,
    child: selectedChild,
    finalValue: selectedChild || selectedParent
  });
}, [selectedParent, selectedChild]);
```

## 📦 Import Paths

```typescript
// Component
import { StreamSelector } from "@/components/StreamSelector";

// API Functions
import * as streamsApi from "@/api/streams";

// Types
import type { Stream } from "@/types/api";
```

## 🚦 Status Checks

### Is Implementation Complete?
✅ Type definitions updated  
✅ API functions added  
✅ Component created  
✅ Forms integrated  
✅ Project page updated  
✅ Build passes  
✅ No linter errors  

### Ready for Testing?
✅ Yes - All code changes complete  
⚠️ Manual testing required  

## 📖 Related Documentation

- `HIERARCHICAL_STREAMS_IMPLEMENTATION.md` - Full implementation details
- `HIERARCHICAL_STREAMS_UI_GUIDE.md` - Visual UI guide with diagrams
- Frontend Integration Guide (from user) - Backend API documentation

## 🎯 Next Actions

1. Start development server: `npm run dev`
2. Navigate to a project
3. Open "Streams & Subjects" dialog
4. Create parent and child streams
5. Create a new ticket using the streams
6. Verify cascading dropdowns work correctly

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Check types
npx tsc --noEmit

# Lint
npm run lint
```

---

**Quick Tip**: The `StreamSelector` component handles all complexity internally. You just need to pass `projectId`, `value`, and `onValueChange` - it does the rest! 🎉

