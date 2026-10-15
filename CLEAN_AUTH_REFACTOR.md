# Clean Authentication Architecture Refactor

## Goal
Consolidate authentication + role management into a single, reusable `useAuth` hook to eliminate duplication, race conditions, and prop drilling.

## Architecture

### Single Source of Truth
- **useAuth hook**: Reads Supabase session once, derives userRole synchronously, exposes `{ user, userRole, loading, logout }`
- **Location**: `src/hooks/useAuth.ts` ✅ CREATED
- **Consumers**: Any component that needs auth state reads directly from this hook

### Component Hierarchy

```
Supabase Auth (user + user_metadata.role)
        ↓ (single source)
    useAuth Hook (one place, one time)
        ↓
  ┌──────┴──────┐
  ↓            ↓
App.tsx     Dashboard
ProtectedApp  Timeline
Navigation   MoodBoard
             etc.
```

### Files Changed

#### Created
- ✅ `src/hooks/useAuth.ts` - Single source of truth for auth + role

#### Updated
- ✅ `src/App.tsx` - Use useAuth hook, remove session state duplication, simplify routes
- ✅ `src/pages/Dashboard.tsx` - Use useAuth hook instead of props
- ✅ `src/components/Navigation/Navigation.tsx` - Use useAuth hook instead of props

#### Still Need Updating
- ❌ `src/pages/AuthPage.tsx` - Remove onLogin callback prop
- ❌ `src/pages/DashboardView.tsx` - Remove userRole prop
- ❌ `src/pages/ClientProfile.tsx` - Remove userRole prop
- ❌ `src/pages/ContractVault.tsx` - Remove userRole prop
- ❌ `src/pages/Timeline.tsx` - Remove userRole prop
- ❌ `src/pages/MoodBoard.tsx` - Remove userRole prop
- ❌ `src/pages/Messages.tsx` - Remove userRole prop
- ❌ `src/pages/Clients.tsx` - Remove userRole prop
- ❌ `src/components/Skeleton.tsx` - Remove userRole props from all 4 interfaces
- ⏳ `src/contexts/WeddingContext.tsx` - Remove auth logic, use useAuth internally

## Pattern for Updating Components

**Before:**
```typescript
interface ComponentProps {
  userRole: 'planner' | 'couple';
}

export const Component: React.FC<ComponentProps> = ({ userRole }) => {
  return userRole === 'planner' ? <Planner /> : <Couple />;
};
```

**After:**
```typescript
import { useAuth } from '../hooks/useAuth';

export const Component: React.FC = () => {
  const { userRole } = useAuth();
  
  return userRole === 'planner' ? <Planner /> : <Couple />;
};
```

## Benefits Achieved

| Aspect | Before | After |
|--------|--------|-------|
| **Auth Source** | Duplicated (App + WeddingContext) | Single: useAuth hook |
| **userRole Derivation** | Async (WeddingContext) | Sync (useAuth) |
| **Prop Drilling** | Yes (3+ levels) | No (hook access) |
| **Race Conditions** | Yes (async hydration) | No (sync resolution) |
| **State Duplication** | High (multiple sources) | None (single hook) |
| **Type Safety** | Weak (props scattered) | Strong (centralized) |
| **Testing** | Hard (multiple mocks) | Easy (mock one hook) |

## Implementation Checklist

- [x] Create useAuth hook
- [x] Update App.tsx to use useAuth
- [x] Update Dashboard to use useAuth
- [x] Update Navigation to use useAuth
- [ ] Update AuthPage (remove onLogin callback)
- [ ] Update all page components (Timeline, Contracts, MoodBoard, Messages, Clients, ClientProfile, DashboardView)
- [ ] Update Skeleton components
- [ ] Update WeddingContext (remove auth logic, use useAuth internally)
- [ ] Verify build succeeds
- [ ] Test auth flow end-to-end

## Testing Strategy

1. **Login flow**: User logs in → Auth sets role → Dashboard renders with correct view
2. **Navigation**: Switch between routes → All show correct role
3. **Auth changes**: Logout → App clears state
4. **Wedding data**: Married flow: create wedding → see dashboard with data

