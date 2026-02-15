# WO-1: Enhance Framework Editor Database Persistence — Implementation Plan

**Work Order:** 1  
**Status:** In progress  
**Scope:** Convert framework editor from localStorage to database-backed persistence with real-time collaboration and migration path.

---

## 1. Current state

- **Framework editor** (`src/app/(admin)/admin/framework/page.tsx`): Edits asset title, purpose, core question, checklist items, and question label/description. All state is in React `allEdits`; persist via `localStorage` per asset key `framework-edits-${assetNumber}`.
- **Data shape:** `AssetEdits` = `{ title?, purpose?, coreQuestion?, checklist?: Record<id, string>, questions?: Record<questionId, { label?, description? }> }`. Stored as one JSON object per asset.
- **Consumers:** Fellow-facing app reads from `@/lib/data` (stages/assets) and `@/lib/questions` (workflows). They do **not** read from the framework editor; edits are editor-only. So we only need to persist and merge edits in the admin framework UI (and optionally later expose “resolved” content to fellows via an API).

---

## 2. Design decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Storage model | Granular rows per edit (asset_number + field_type + field_id/field_key + value) | Enables real-time per-field updates, simple conflict handling (last-write-wins per field), and export/import as JSON. |
| Merge strategy | Base (lib/data + lib/questions) + DB edits merged in editor only | Fellows keep using static modules; no change to fellow-facing pages in this WO. |
| Real-time | Supabase Realtime on `framework_edits` + optional presence | Reuse Supabase; broadcast row changes; show “X is editing” via presence or last-editor. |
| Conflict resolution | Last-write-wins per field; optional ConflictResolutionDialog if we detect same-field edit from another user | Keeps MVP simple; dialog can show “Another admin just edited this field” and let user choose version. |
| Migration | One-time: detect localStorage keys, offer “Import to database” or “Discard”; backup download before import | Preserves existing workflows; no silent overwrite. |

---

## 3. File-by-file plan

### 3.1 Database

**File:** `src/db/schema.ts`  
**Action:** Add table `framework_edits`.

- Columns: `id` (uuid), `asset_number` (integer 1–27), `admin_id` (uuid → fellows.id), `field_type` (text: 'title' | 'purpose' | 'coreQuestion' | 'checklist' | 'question'), `field_id` (text, nullable — checklist item id or question id), `field_key` (text, nullable — for question: 'label' | 'description'), `value` (text), `created_at`, `updated_at`.
- Unique constraint: one row per (asset_number, field_type, field_id, field_key) where field_id/field_key encode the same scope as current AssetEdits (e.g. for title: field_id and field_key null; for checklist item 1-1: field_id='1-1', field_key null; for question label: field_id=questionId, field_key='label'). So we can upsert by (asset_number, field_type, field_id, field_key).
- Indexes: `idx_framework_edits_asset` on (asset_number); optional index on (admin_id) for “my edits”.

**New migration file:** `migrations/012_framework_edits.sql`  
- `CREATE TABLE framework_edits (...);`  
- Unique constraint and indexes; RLS if we use Supabase RLS (only admin can read/write).

---

### 3.2 Server actions

**File:** `src/app/actions/framework.ts` (new)  
**Action:** Create server actions with admin check.

- `requireAdmin()`: same pattern as `src/app/actions/admin.ts` (get user, get fellow by auth_user_id, require role === 'admin').
- `getFrameworkEdits(assetNumber: number)`: return array of rows for that asset; convert to `AssetEdits` shape (group by field_type, field_id, field_key).
- `getFrameworkEditsForAllAssets()`: return all rows; convert to `AllEdits` (keyed by asset_number).
- `saveFrameworkEdit(assetNumber, fieldType, fieldId?, fieldKey?, value)`: upsert one row (admin_id = current fellow id, value, updated_at). If value is empty string, delete the row instead.
- `deleteFrameworkEdit(editId: string)`: delete by id (and optionally check admin_id for ownership).
- `exportFrameworkEdits()`: return JSON in same shape as current export (assets, modifications, exportedAt) for download.
- `importFrameworkEdits(jsonData)`: parse; for each asset’s modifications, call saveFrameworkEdit for each field; return count imported.

All actions must call `requireAdmin()` first.

---

### 3.3 Hook and page migration

**File:** `src/app/(admin)/admin/framework/hooks/useFrameworkEdits.ts` (new)  
**Action:** Custom hook.

- State: `allEdits: AllEdits`, `loading`, `error`, `saving` (or per-asset saving).
- `loadEdits()`: call `getFrameworkEditsForAllAssets()`, set `allEdits`.
- `loadEditsForAsset(assetNumber)`: call `getFrameworkEdits(assetNumber)`, merge into local `allEdits` for that asset.
- `saveEdit(assetNumber, fieldType, fieldId?, fieldKey?, value)`: optimistic update; call `saveFrameworkEdit`; on failure revert and set error.
- `deleteEdit(editId)`: remove from state; call `deleteFrameworkEdit(editId)`.
- `exportEdits()`: call `exportFrameworkEdits()`, trigger download (reuse current `downloadJson` logic).
- `importEdits(fileOrJson)`: call `importFrameworkEdits`, then `loadEdits()`.

Use same `AssetEdits` / `AllEdits` types as the page. Hook is the single place that talks to server actions; page uses hook only.

**File:** `src/app/(admin)/admin/framework/page.tsx`  
**Action:** Replace localStorage with hook.

- Remove: `getStorageKey`, `loadEditsForAsset`, `saveEditsForAsset`, `loadAllEdits` (and any other direct localStorage usage).
- Add: `useFrameworkEdits()`; on mount call `loadEdits()` (or load all in init).
- Replace `updateEdits` / `setFieldEdit` / `setChecklistEdit` / `setQuestionEdit` to call hook’s `saveEdit` with the correct (asset_number, field_type, field_id, field_key, value). Map current field names to field_type/field_id/field_key (e.g. title → field_type='title'; checklist item → field_type='checklist', field_id=itemId; question label → field_type='question', field_id=questionId, field_key='label').
- `clearAssetEdits(assetNumber)`: delete all edits for that asset (new server action `deleteFrameworkEditsForAsset(assetNumber)` or multiple `deleteFrameworkEdit` by id); then refresh from hook.
- Export All / Export Asset: use hook’s `exportEdits()` and export single-asset from hook data.
- Add loading state (e.g. spinner) while `loadEdits()` or per-field save; show error toast or inline message on failure.
- Copy for “Changes are stored locally” → “Changes are saved to the database and visible to other admins.”

---

### 3.4 Real-time and indicators

**File:** `src/lib/realtime/frameworkChannel.ts` (new)  
**Action:** Supabase Realtime channel.

- Subscribe to `framework_edits` table (INSERT, UPDATE, DELETE) for the project.
- Optionally: broadcast presence (e.g. “user X is on framework page” or “user X is editing asset N”) via Supabase Presence or a separate channel. If using only table subscription, we can show “Last updated by Y at Z” from the row’s admin_id and updated_at.
- Export: `subscribeToFrameworkEdits(callback)`, `unsubscribe()`.

**File:** `src/app/(admin)/admin/framework/hooks/useRealTimeFramework.ts` (new)  
**Action:** Hook for real-time.

- On mount: `subscribeToFrameworkEdits`; on payload, refetch edits for affected asset(s) and update hook state (or invalidate so UI refetches). Debounce to avoid flicker.
- Optional: presence state “currentEditors: { assetNumber: { userId, name }[] }” and “connectionStatus”.
- Conflict: if we receive an update for the same (asset_number, field_type, field_id, field_key) that the current user is editing, we can show ConflictResolutionDialog (see below).

**File:** `src/app/(admin)/admin/framework/components/RealTimeIndicator.tsx` (new)  
**Action:** UI component.

- Show “Saved” / “Saving…” / “Last updated by X at Y” and connection status. Optional: “Z is editing this asset” if presence is implemented. Small, non-intrusive (e.g. top-right of editor or next to header).

---

### 3.5 Migration and loading UI

**File:** `src/app/(admin)/admin/framework/utils/migrationUtils.ts` (new)  
**Action:** Migration helpers.

- `detectLocalStorageData()`: check for keys matching `framework-edits-${n}` for n in 1..27; return list of asset numbers that have data and the raw JSON.
- `convertLocalStorageToEdits(raw)`: convert to the same shape as `exportFrameworkEdits()` (array of edits or AllEdits).
- `migrateToDatabase(edits)`: call server action `importFrameworkEdits(edits)`.
- `clearLocalStorageData()`: remove all `framework-edits-*` keys.

**File:** `src/app/(admin)/admin/framework/components/MigrationDialog.tsx` (new)  
**Action:** One-time migration dialog.

- On first load of framework page (or when hook detects no DB edits but localStorage has data): show dialog “You have local framework edits. Import them to the database so your team can see them?”
- Options: “Import to database” (run migration, then clear localStorage), “Download backup” (export current localStorage as JSON), “Discard”.
- After choice, set a flag (e.g. in sessionStorage or DB) so we don’t show again for this user; then load from DB.

**File:** `src/components/ui/LoadingSpinner.tsx` (new)  
**Action:** Reusable spinner.

- Sizes: sm, md, lg. Optional: inline (for buttons) and overlay. Use Studio OS accent color. Used in framework page while loading/saving.

---

### 3.6 Conflict resolution (optional for MVP)

**File:** `src/app/(admin)/admin/framework/components/ConflictResolutionDialog.tsx` (new)  
**Action:** Dialog for same-field conflict.

- When real-time hook detects an update for a field the current user is editing: show dialog with “Another admin updated this field.” Show their value vs. current user’s value; buttons: “Keep mine”, “Use theirs”, “Merge manually” (or just Keep / Use theirs for MVP).
- On choice: write chosen value via saveFrameworkEdit and close dialog.

Can be added after the main persistence and real-time flow work.

---

## 4. Implementation order

1. **Schema + migration** — Add `framework_edits` table and run migration.
2. **Server actions** — Implement `framework.ts` (get, save, delete, export, import).
3. **useFrameworkEdits hook** — Load/save/export/import via actions; no real-time yet.
4. **Framework page** — Switch to hook; remove localStorage; add loading/error and copy change.
5. **MigrationDialog + migrationUtils** — Detect localStorage, offer import/discard, backup.
6. **LoadingSpinner** — Add and use in framework page.
7. **Real-time** — frameworkChannel + useRealTimeFramework; RealTimeIndicator.
8. **ConflictResolutionDialog** — Optional; can follow after real-time is stable.

---

## 5. Acceptance criteria checklist

- [ ] Framework edits persist to database (all field types: title, purpose, coreQuestion, checklist, question label/description).
- [ ] Multiple admins see each other’s edits (load from DB; real-time or refresh).
- [ ] Real-time or near-real-time updates when another admin makes changes (Supabase Realtime or short polling).
- [ ] Export/import for backup preserved (export from DB; import writes to DB).
- [ ] Version history or conflict resolution: last-write-wins per field; optional dialog for same-field conflict.
- [ ] Migration path: dialog to import existing localStorage to DB and optionally clear localStorage.
- [ ] All existing framework editor functionality preserved (UI and behavior unchanged except persistence and loading states).

---

## 6. Out of scope (per WO)

- Advanced version control or branching.
- Framework content approval workflows.
- Framework change notifications to fellows.
- Changing how fellow-facing app loads framework content (remains lib/data + lib/questions unless we add a separate “resolved” API later).

---

If you’re happy with this plan, next step is implementing in the order above (schema → actions → hook → page → migration UI → spinner → real-time → conflict dialog optional).
