# Supabase Integration - Code Examples

This guide shows how to use the Supabase integration and add new features.

## Using the Wedding Context Hook

### Basic Usage in Components

```tsx
import { useWedding } from '../contexts/WeddingContext';

export const MyComponent = () => {
  const { wedding, timelineEvents, contracts, moodBoardImages, loading } = useWedding();

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>{wedding?.coupleNames}</h1>
      <p>{timelineEvents.length} milestones</p>
      <p>{contracts.length} vendor contracts</p>
      <p>{moodBoardImages.length} inspiration items</p>
    </div>
  );
};
```

## Data Operations

### Update Timeline Event (Mark as Complete)

```tsx
const { updateTimelineEvent } = useWedding();

const handleMarkComplete = async (eventId: string) => {
  try {
    await updateTimelineEvent(eventId, { completed: true });
    // UI automatically updates via context
  } catch (error) {
    console.error('Failed:', error);
  }
};
```

### Delete Contract

```tsx
const { deleteContract } = useWedding();

const handleDelete = async (contractId: string) => {
  if (confirm('Delete this contract?')) {
    try {
      await deleteContract(contractId);
      // UI automatically updates
    } catch (error) {
      console.error('Failed:', error);
    }
  }
};
```

### Delete Mood Board Image

```tsx
const { deleteMoodBoardImage } = useWedding();

const handleDeleteImage = async (imageId: string) => {
  try {
    await deleteMoodBoardImage(imageId);
    // UI automatically updates
  } catch (error) {
    console.error('Failed:', error);
  }
};
```

## Adding New Features

### Example: Adding a New Timeline Event

```tsx
// In a form component
const { addTimelineEvent } = useWedding();

const handleAddEvent = async (formData: FormData) => {
  try {
    const newEvent = await addTimelineEvent({
      title: formData.get('title'),
      description: formData.get('description'),
      date: formData.get('date'),
      category: formData.get('category'),
      completed: false,
    });
    
    console.log('Event added:', newEvent);
    // Form can be reset
  } catch (error) {
    console.error('Failed to add event:', error);
  }
};
```

### Example: Adding a Contract

```tsx
const { addContract } = useWedding();

const handleUploadContract = async (vendor: string, file: File) => {
  try {
    const newContract = await addContract({
      vendorName: vendor,
      vendorType: 'caterer',
      fileName: file.name,
      uploadedDate: new Date().toISOString(),
      amount: 1000,
      notes: 'Sample contract',
    });
    
    console.log('Contract added:', newContract);
  } catch (error) {
    console.error('Failed to add contract:', error);
  }
};
```

## Querying Data

### Filter Timeline Events

```tsx
const { timelineEvents } = useWedding();

// Get uncompleted events
const upcoming = timelineEvents.filter(e => !e.completed);

// Get events by category
const planning = timelineEvents.filter(e => e.category === 'planning');

// Get events by date
const sorted = timelineEvents.sort((a, b) => 
  new Date(a.date).getTime() - new Date(b.date).getTime()
);
```

### Filter Contracts

```tsx
const { contracts } = useWedding();

// Get total amount
const total = contracts.reduce((sum, c) => sum + (c.amount || 0), 0);

// Get contracts by vendor type
const caterers = contracts.filter(c => c.vendorType === 'caterer');

// Get contracts by upload date (most recent)
const recent = contracts.sort((a, b) =>
  new Date(b.uploadedDate).getTime() - new Date(a.uploadedDate).getTime()
);
```

### Filter Mood Board Images

```tsx
const { moodBoardImages } = useWedding();

// Get images by category
const flowers = moodBoardImages.filter(i => i.category === 'flowers');

// Get images by uploader
const sarahsImages = moodBoardImages.filter(i => i.uploadedBy === 'Sarah');

// Get recent additions
const recent = moodBoardImages.sort((a, b) =>
  new Date(b.uploadedDate).getTime() - new Date(a.uploadedDate).getTime()
).slice(0, 5); // Top 5 recent
```

## Extending the Context

### Add a New Data Type

1. **Add table to Supabase** via SQL Editor

2. **Update types** in `src/types/index.ts`:
```tsx
export interface VendorNote {
  id: string;
  vendorId: string;
  title: string;
  content: string;
  createdDate: string;
}
```

3. **Add to WeddingContext** in `src/contexts/WeddingContext.tsx`:

```tsx
interface WeddingContextType {
  // ... existing types
  vendorNotes: VendorNote[];
  addVendorNote: (note: Omit<VendorNote, 'id'>) => Promise<void>;
  deleteVendorNote: (id: string) => Promise<void>;
}

// In the component:
const [vendorNotes, setVendorNotes] = useState<VendorNote[]>([]);

// In loadData:
const notes = await db.getVendorNotes(weddingData.id);
setVendorNotes(notes);

// Add methods:
const addVendorNote = async (note: Omit<VendorNote, 'id'>) => {
  const newNote = await db.addVendorNote({
    wedding_id: wedding!.id,
    ...note,
  });
  setVendorNotes([...vendorNotes, newNote]);
};
```

4. **Add to Supabase handler** in `src/lib/supabase.ts`:

```tsx
async getVendorNotes(weddingId: string) {
  const { data, error } = await supabase
    .from('vendor_notes')
    .select('*')
    .eq('wedding_id', weddingId)
    .order('created_date', { ascending: false });
  
  if (error) throw error;
  return data;
},

async addVendorNote(note: any) {
  const { data, error } = await supabase
    .from('vendor_notes')
    .insert([note])
    .select();
  
  if (error) throw error;
  return data[0];
},

async deleteVendorNote(id: string) {
  const { error } = await supabase
    .from('vendor_notes')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}
```

## Error Handling

### Try-Catch Pattern

```tsx
const handleOperation = async () => {
  try {
    await someDataOperation();
    // Show success message
    showNotification('Success!');
  } catch (error) {
    console.error('Operation failed:', error);
    // Show error message
    if (error instanceof Error) {
      showError(error.message);
    }
  }
};
```

### Custom Hook for Operations

```tsx
function useDataOperation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (operation: () => Promise<any>) => {
    try {
      setLoading(true);
      setError(null);
      return await operation();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Operation failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error };
}
```

## Real-Time Updates (Future)

### Enable Real-Time Subscriptions

```tsx
// In WeddingContext useEffect (future implementation):
useEffect(() => {
  if (!wedding) return;

  // Subscribe to timeline changes
  const subscription = supabase
    .from('timeline_events')
    .on('*', payload => {
      // Reload timeline events
      loadData();
    })
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, [wedding?.id]);
```

## Debugging

### Check What's in Context

```tsx
const wedding = useWedding();
console.log('Wedding Context:', wedding);
console.log('Events:', wedding.timelineEvents);
console.log('Contracts:', wedding.contracts);
console.log('Images:', wedding.moodBoardImages);
```

### Monitor Supabase Calls

Enable SQL logging:
```tsx
// In Supabase dashboard: SQL Editor
-- See all recent queries and their performance
SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC;
```

## Best Practices

1. **Always use the hook** - Don't call Supabase directly in components
2. **Handle loading state** - Show loading UI while fetching
3. **Catch errors** - Always wrap operations in try-catch
4. **Validate data** - Check data types before displaying
5. **Optimize queries** - Use filters in database, not in JS
6. **Cache wisely** - Context caches well for most use cases

## Common Patterns

### Conditional Rendering with Loading

```tsx
const { data, loading, error } = useWedding();

if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (!data) return <EmptyState />;

return <DataDisplay data={data} />;
```

### List with Actions

```tsx
const { items, deleteItem } = useWedding();

return (
  <ul>
    {items.map(item => (
      <li key={item.id}>
        {item.name}
        <button onClick={() => deleteItem(item.id)}>Delete</button>
      </li>
    ))}
  </ul>
);
```

### Form Submission

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await addItem({ ...formData });
    setFormData({}); // Reset form
  } catch (error) {
    alert('Failed to save');
  }
};
```

Need more help? Check the existing implementations in:
- `src/pages/Dashboard.tsx`
- `src/pages/Timeline.tsx`
- `src/pages/ContractVault.tsx`
- `src/pages/MoodBoard.tsx`
