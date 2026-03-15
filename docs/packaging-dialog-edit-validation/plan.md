# Move Add Box Form into Dialog + Edit Support + Validation

## Context
The packaging settings page currently renders the "Add New Box" form inline on the page. The user wants it moved into a popup/dialog, with the page showing only the box list (or empty state). Additional requirements: edit existing boxes, proper field-level validation (red error messages under fields instead of browser defaults).

## Changes

### 1. Create Dialog UI component
**New file**: `src/components/ui/dialog.tsx`
- Build a reusable modal/dialog using a portal + backdrop overlay
- Support open/close state, title, and children
- Close on backdrop click and Escape key
- Animate with Tailwind transitions

### 2. Add `updateBox` server action
**Edit**: `src/actions/box-actions.ts`
- Add `updateBox(id: string, formData: FormData)` server action
- Reuse the existing `createBoxSchema` for validation
- Verify ownership before updating
- Return field-level errors (change error format from single string to `Record<string, string>`)

### 3. Update server action error format for field-level validation
**Edit**: `src/actions/box-actions.ts`
- Change `createBox` and new `updateBox` to return `{ fieldErrors: Record<string, string> }` instead of `{ error: string }`
- Map Zod `issues` array to a field name -> message record

### 4. Refactor BoxForm for dialog use + field-level validation
**Edit**: `src/components/boxes/box-form.tsx`
- Accept optional `box` prop for edit mode (pre-fill fields)
- Accept `onSuccess` callback (to close dialog)
- Remove the wrapping `<Card>` (dialog provides the container)
- Replace HTML5 `required`/`min` attributes with client-side validation before submit
- Display red error messages under each field using the `Input` component's existing `error` prop
- Adjust button text: "Add Box" / "Save Changes" based on mode

### 5. Update PackagingSettingsClient page layout
**Edit**: `src/app/(dashboard)/settings/packaging/client.tsx`
- Remove inline `<BoxForm />`
- Add "Add New Box" button in the header area (upper right, next to unit toggle)
- Manage dialog open/close state
- Render `<Dialog>` with `<BoxForm>` inside
- Pass boxes + unit to BoxList

### 6. Add edit button to BoxCard + edit dialog
**Edit**: `src/components/boxes/box-card.tsx`
- Add an "Edit" button next to the "Delete" button
- On click, open edit dialog with BoxForm pre-filled with box data
- Manage local dialog state

### 7. Update BoxList empty state text
**Edit**: `src/components/boxes/box-list.tsx`
- Change empty state message from "Add your first box using the form above" to something like "Add your first box using the button above"

### 8. Add field-level validation to ProductForm (dashboard)
**Edit**: `src/components/calculator/product-form.tsx`
- Same validation pattern as BoxForm: remove HTML5 `required`/`min` attributes
- Add client-side validation before submit that checks each field individually
- Display red error messages under each field using `Input`'s existing `error` prop
- Replace the single error banner with per-field errors
- Validate: dimensions are required and must be positive, weight (if provided) must be non-negative

## Files to modify
- `src/components/ui/dialog.tsx` (new)
- `src/actions/box-actions.ts`
- `src/components/boxes/box-form.tsx`
- `src/app/(dashboard)/settings/packaging/client.tsx`
- `src/components/boxes/box-card.tsx`
- `src/components/boxes/box-list.tsx`
- `src/components/calculator/product-form.tsx`

## Verification / Test Plan

### Manual browser testing checklist:

**Empty state**
- [ ] Navigate to /settings/packaging with no boxes — see empty state placeholder
- [ ] "Add New Box" button is visible in the header area

**Add box dialog**
- [ ] Click "Add New Box" — dialog opens with empty form
- [ ] Click backdrop or press Escape — dialog closes
- [ ] Submit empty form — red error messages appear under each required field
- [ ] Enter only name, submit — dimension fields show validation errors
- [ ] Enter negative dimension — shows "must be positive" error
- [ ] Enter valid data and submit — dialog closes, new box appears in list
- [ ] Verify unit conversion works (toggle to inches, add box, verify stored correctly)

**Edit box dialog**
- [ ] Click "Edit" on an existing box — dialog opens with fields pre-filled
- [ ] Verify pre-filled values match the box (in correct unit)
- [ ] Change name and save — list updates with new name
- [ ] Clear a required field and save — validation error shown
- [ ] Close edit dialog without saving — no changes applied

**Delete box (regression)**
- [ ] Delete a box — it disappears from the list
- [ ] Delete all boxes — empty state appears

**Field-level validation (packaging page)**
- [ ] No browser-native validation popups appear (no `required` HTML attributes)
- [ ] Each field shows its own red error message below the input
- [ ] Error clears when user re-submits with valid data
- [ ] Server-side errors (e.g., duplicate name if applicable) display correctly

**Product form validation (dashboard page)**
- [ ] Navigate to /dashboard
- [ ] Submit product form with empty dimensions — red error under each empty dimension field
- [ ] No browser-native validation popups appear
- [ ] Enter negative dimension — shows "must be positive" error under that field
- [ ] Enter valid dimensions — product added successfully, errors cleared
- [ ] Enter invalid weight (negative) — error shown under weight field
- [ ] Leave weight empty (optional) — no error, product added fine
