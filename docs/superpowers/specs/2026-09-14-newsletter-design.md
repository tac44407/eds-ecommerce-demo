# Newsletter form (footer)

**Date:** 2026-09-14  
**Status:** approved in chat — waiting for spec review before implementation  
**Figma:** Storefront Kit home footer — “Sign up for our newsletter” + inline email + dark pill submit

## Goal

Teach EDS form handling on a real Figma control. Assignment does not require this. Front-end only.

## What authors do (DA)

Edit fragment `/footer` (not a page). Add a **new section above the copyright** with a `newsletter` table:

| newsletter | |
|---|---|
| Sign up for our newsletter | Get 15% off and new drops. No spam. |

Then Preview `/footer`.

Authors do **not** put `<input>` or `<form>` in DA. Heading and copy only. Missing cells are fine: JS supplies defaults.

## What code does

New block `blocks/newsletter/newsletter.js` + `newsletter.css`.

On decorate:

1. Read first cell as heading (`h2`), second as body (`p`). Defaults if empty.
2. Build a semantic `<form>`:
   - visually hidden `<label for="…">Email</label>`
   - `<input type="email" required autocomplete="email" placeholder="Enter email">`
   - `<button type="submit">` dark pill (Figma: inset on the right of the field)
3. `submit`: `preventDefault()`, rely on native `type="email"` + `required`, then replace the form with a success line (“Thanks — you’re on the list.”). No network call.
4. Scope CSS to `.newsletter`. Layout: heading (Heading 4XL), body, wide field. Sits in the existing footer column stack (gap already 64px), above copyright.

`footer.js` stays a fragment loader. No form logic there.

## Out of scope

- Spreadsheet / official EDS `form` block / real POST
- Checkout, review, or search forms
- Marketing vendor (Marketo, etc.)

Interview line: production would POST to an EDS form sheet or a marketing endpoint; this demo stops at validate + success.

## Success

- Form appears in the footer on every page after `/footer` is Previewed
- Invalid email is blocked by the browser
- Valid submit shows success and does not navigate
- CSS does not leak outside `.newsletter`
