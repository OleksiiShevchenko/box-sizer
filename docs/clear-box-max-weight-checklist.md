# Clear Box Max Weight Checklist

## Automated coverage

- [ ] `src/actions/box-actions.test.ts`: clearing `maxWeight` on create persists `null`
- [ ] `src/actions/box-actions.test.ts`: clearing `maxWeight` on edit persists `null`
- [ ] `src/components/boxes/box-form.test.tsx`: edit mode submits an empty `maxWeight` value after clearing the field
- [ ] `tests/e2e/boxes.spec.ts`: authenticated user clears an existing box max weight and the database stores `null`

## Manual verification

- [ ] Seed/login with the Packwell E2E account
- [ ] Open `/settings/boxes`
- [ ] Choose a seeded box that currently shows a `Max:` value
- [ ] Open `Edit`
- [ ] Confirm `Max Weight` is prefilled
- [ ] Clear the `Max Weight` input completely
- [ ] Save changes
- [ ] Confirm the dialog closes without errors
- [ ] Confirm the box row no longer shows `Max:`
- [ ] Confirm the database value for that box is `NULL`
- [ ] Re-open `Edit` and confirm the `Max Weight` input remains blank
