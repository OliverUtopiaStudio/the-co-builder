# ConflictResolutionDialog Design

## Context
WO-1 (Enhance Framework Editor Database Persistence) is 91% complete. The only missing deliverable is `ConflictResolutionDialog.tsx` — a modal that handles concurrent editing conflicts when two admins edit the same framework field simultaneously.

## Trigger
When `useRealTimeFramework` fires a refetch (another admin saved changes), the new server data is compared against the current admin's local unsaved edits. If any field differs, those fields are collected as conflicts and the dialog appears.

## Conflict Data Shape
```ts
type Conflict = {
  assetNumber: number
  fieldType: 'title' | 'purpose' | 'coreQuestion' | 'checklist' | 'question'
  fieldId: string
  fieldKey: string
  localValue: string
  serverValue: string
}
```

## Resolution Options
- **Keep mine**: Save the local value to the server (overwrite their change)
- **Keep theirs**: Accept the server value into local state (discard local edit)
- **Bulk**: "Keep all mine" / "Accept all updates" buttons at the bottom

## Files to Create/Modify
1. **Create** `src/app/(admin)/admin/framework/components/ConflictResolutionDialog.tsx` — Modal UI following MigrationDialog pattern
2. **Modify** `src/app/(admin)/admin/framework/hooks/useFrameworkEdits.ts` — Add conflict detection on refetch, expose `conflicts` state and resolution methods
3. **Modify** `src/app/(admin)/admin/framework/page.tsx` — Render dialog when conflicts exist, wire callbacks

## UI Layout
- Fixed overlay with centered modal (matches MigrationDialog)
- Scrollable conflict list with per-conflict resolution buttons
- Bulk resolution buttons at bottom
- Auto-dismisses when all conflicts are resolved

## Architecture Decisions
- **Client-side only**: No server changes needed. Conflict detection compares local state vs refetched data.
- **No version numbers**: Uses value comparison rather than optimistic concurrency control.
- **Coarse refetch preserved**: The existing full-refetch pattern continues; conflict detection intercepts before overwriting local state.
