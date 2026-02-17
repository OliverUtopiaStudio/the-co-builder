# WO-6: Database Persistence for Framework Editor — Implementation Plan

**Work Order:** 6  
**Status:** In Progress  
**Scope:** Add version history, notifications, and rollback functionality to the framework editor

---

## Current State Analysis

### ✅ Already Implemented
- Database persistence (`framework_edits` table)
- Server actions for CRUD operations (`src/app/actions/framework.ts`)
- Hook for managing edits (`useFrameworkEdits`)
- Real-time collaboration (`useRealTimeFramework`)
- Conflict resolution dialog
- Migration utilities from localStorage
- JSON export/import

### ❌ Missing Features (Per Work Order Requirements)
1. **Version history** - Track who changed what and when
2. **Notifications to fellows** - When framework assets are updated
3. **Rollback functionality** - Ability to revert to previous versions
4. **API endpoints** - For version history and notifications

---

## Implementation Plan

### 1. Database Schema Extensions

#### 1.1 Framework Edit History Table
**File:** `migrations/014_framework_edit_history.sql`

Create `framework_edit_history` table to track all changes:
- `id` (uuid, primary key)
- `framework_edit_id` (uuid → framework_edits.id, nullable for deleted edits)
- `asset_number` (integer, 1-27)
- `admin_id` (uuid → fellows.id)
- `field_type` (text)
- `field_id` (text)
- `field_key` (text)
- `old_value` (text, nullable)
- `new_value` (text, nullable)
- `action` (text: 'created' | 'updated' | 'deleted')
- `created_at` (timestamp)

This allows full audit trail and rollback capability.

#### 1.2 Notifications Table
**File:** `migrations/015_framework_notifications.sql`

Create `framework_notifications` table:
- `id` (uuid, primary key)
- `fellow_id` (uuid → fellows.id, nullable for all fellows)
- `asset_number` (integer, 1-27)
- `notification_type` (text: 'framework_updated')
- `message` (text)
- `read` (boolean, default false)
- `created_at` (timestamp)
- `read_at` (timestamp, nullable)

Indexes on `fellow_id`, `asset_number`, `read`, `created_at`.

---

### 2. Server Actions Updates

#### 2.1 Update `saveFrameworkEdit` to Create History
**File:** `src/app/actions/framework.ts`

- Before update/insert, check if edit exists
- If exists, create history record with `old_value` and action 'updated'
- If new, create history record with action 'created'
- On delete, create history record with action 'deleted' and `old_value`

#### 2.2 Add Version History Actions
**File:** `src/app/actions/framework.ts`

- `getFrameworkEditHistory(assetNumber: number)` - Get all history for an asset
- `getFrameworkEditHistoryForField(assetNumber, fieldType, fieldId, fieldKey)` - Get history for specific field
- `rollbackFrameworkEdit(historyId: string)` - Restore a previous version

#### 2.3 Add Notification Actions
**File:** `src/app/actions/framework.ts`

- `notifyFellowsOfFrameworkUpdate(assetNumber: number, message?: string)` - Create notifications for all fellows
- `getFrameworkNotifications(fellowId?: string)` - Get notifications (all or for specific fellow)
- `markNotificationRead(notificationId: string)` - Mark notification as read

---

### 3. API Endpoints

#### 3.1 Version History Endpoint
**File:** `src/app/api/admin/framework/history/[assetNumber]/route.ts`

- GET `/api/admin/framework/history/[assetNumber]`
- Returns version history for an asset
- Requires admin authentication
- Returns array of history records with admin info

#### 3.2 Notifications Endpoint
**File:** `src/app/api/admin/framework/notify/route.ts`

- POST `/api/admin/framework/notify`
- Body: `{ assetNumber: number, message?: string }`
- Creates notifications for all fellows
- Requires admin authentication

---

### 4. UI Components

#### 4.1 Version History Component
**File:** `src/app/(admin)/admin/framework/components/VersionHistory.tsx`

- Display history timeline for selected asset
- Show: who changed, what changed, when, old vs new value
- "Rollback" button for each history entry
- Filter by field type

#### 4.2 Rollback Confirmation Dialog
**File:** `src/app/(admin)/admin/framework/components/RollbackDialog.tsx`

- Confirm rollback action
- Show preview of what will be restored
- Execute rollback via server action

#### 4.3 Integration into Framework Page
**File:** `src/app/(admin)/admin/framework/page.tsx`

- Add "Version History" button/section
- Show history panel when selected
- Add rollback functionality

---

### 5. Notification System

#### 5.1 Fellow Notification Display
**File:** `src/app/(app)/dashboard/page.tsx` or new notifications component

- Display unread framework update notifications
- Link to affected asset
- Mark as read on click

#### 5.2 Admin Notification Trigger
**File:** `src/app/(admin)/admin/framework/page.tsx`

- After saving edits, optionally trigger notification
- "Notify fellows" checkbox or button
- Call notification API

---

## Implementation Order

1. ✅ **Database migrations** - Create history and notifications tables
2. ✅ **Update schema.ts** - Add new table definitions
3. ✅ **Update saveFrameworkEdit** - Create history records
4. ✅ **Add history server actions** - getFrameworkEditHistory, rollbackFrameworkEdit
5. ✅ **Add notification server actions** - notifyFellowsOfFrameworkUpdate, etc.
6. ✅ **Create API endpoints** - History and notify endpoints
7. ✅ **Create UI components** - VersionHistory, RollbackDialog
8. ✅ **Integrate into framework page** - Add history view and rollback
9. ✅ **Add notification display** - Show notifications to fellows
10. ✅ **Testing** - Verify all functionality works

---

## Acceptance Criteria

- ✅ Version history shows who changed what and when
- ✅ Rollback functionality restores previous versions
- ✅ Notifications are created when framework assets are updated
- ✅ API endpoints return correct data
- ✅ UI displays history and allows rollback
- ✅ Fellows receive and can view notifications
- ✅ All existing functionality preserved

---

## Out of Scope

- Real-time collaborative editing (Google Docs style) - Already out of scope
- Automated framework validation
- Integration with external content management systems
- Advanced workflow approval for framework changes
