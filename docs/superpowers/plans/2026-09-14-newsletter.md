# Newsletter Form Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a footer newsletter block that builds a semantic email form from authored heading/copy and shows a client-side success state.

**Architecture:** New `blocks/newsletter/` only. `footer.js` stays a fragment loader. Authors add a `newsletter` table on `/footer`; decorate reads cells, then replaces them with heading, body, and a `<form>` (never authored as HTML). Submit is `preventDefault` + native email validation + success text. No POST.

**Tech Stack:** EDS blocks (vanilla JS/CSS, no build). Verify with `npm run lint`, `curl localhost:3000/footer.plain.html`, and the browser on `localhost:3000`.

## Global Constraints

- Never edit `scripts/aem.js`.
- Cross-block import only `fragment/fragment.js`; this block imports nothing.
- Scope CSS to `.newsletter`.
- Authors omit cells; decorate supplies defaults.
- No spreadsheet, no real POST, no footer.js form logic.
- Stylelint: prefer `rgb(19 19 19)` over `rgba()` if you need alpha; hex matching footer (`#131313`) is fine.
- Do not commit unless the user explicitly asks (this repo’s git rule). Skip every Commit step unless they asked.

---

### Task 1: Newsletter decorate (form DOM + submit)

**Files:**
- Create: `blocks/newsletter/newsletter.js`
- Test: `curl -sS http://localhost:3000/footer.plain.html` (content) and `npm run lint:js`

**Interfaces:**
- Consumes: decorated block cells — either one row with two columns or two rows. `block.children` are rows; each row’s children are cells.
- Produces: `export default function decorate(block)` that leaves `h2.newsletter-title`, `p.newsletter-copy`, and `form.newsletter-form` (or `p.newsletter-success` after submit). Input id is `newsletter-email`.

- [x] **Step 1: Confirm how `/footer` is authored**

Run:

```bash
curl -sS http://localhost:3000/footer.plain.html
```

Expected: existing columns + copyright. If a `newsletter` table is already Previewed, you will see `class="newsletter"` (or a table that becomes that after decorate). If it is missing, the block still ships; the form appears only after Rac Previews `/footer` with the table from the spec. Do not invent footer.js injection.

- [x] **Step 2: Write `blocks/newsletter/newsletter.js`**

```javascript
const DEFAULT_TITLE = 'Sign up for our newsletter';
const DEFAULT_COPY = 'Get 15% off and new drops. No spam.';
const SUCCESS = 'Thanks — you’re on the list.';

function cellText(cell) {
  return cell?.textContent.replace(/\s+/g, ' ').trim() || '';
}

function readAuthored(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  return {
    title: cellText(cells[0]) || DEFAULT_TITLE,
    copy: cellText(cells[1]) || DEFAULT_COPY,
  };
}

function createForm() {
  const form = document.createElement('form');
  form.className = 'newsletter-form';
  form.noValidate = false;

  const label = document.createElement('label');
  label.className = 'newsletter-label';
  label.htmlFor = 'newsletter-email';
  label.textContent = 'Email';

  const field = document.createElement('div');
  field.className = 'newsletter-field';

  const input = document.createElement('input');
  input.id = 'newsletter-email';
  input.name = 'email';
  input.type = 'email';
  input.required = true;
  input.autocomplete = 'email';
  input.placeholder = 'Enter email';

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'newsletter-submit';
  submit.textContent = 'Subscribe';

  field.append(input, submit);
  form.append(label, field);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const done = document.createElement('p');
    done.className = 'newsletter-success';
    done.textContent = SUCCESS;
    form.replaceWith(done);
  });

  return form;
}

export default function decorate(block) {
  const { title, copy } = readAuthored(block);
  const heading = document.createElement('h2');
  heading.className = 'newsletter-title';
  heading.textContent = title;
  const body = document.createElement('p');
  body.className = 'newsletter-copy';
  body.textContent = copy;
  block.replaceChildren(heading, body, createForm());
}
```

Use a straight apostrophe in `SUCCESS` if eslint `quotes` or `max-len` complains: `Thanks — you're on the list.`

- [x] **Step 3: Lint JS**

Run: `npm run lint:js`

Expected: PASS (no errors in `blocks/newsletter/newsletter.js`).

- [x] **Step 4: Commit (only if the user asked)**

```bash
git add blocks/newsletter/newsletter.js
git commit -m "$(cat <<'EOF'
Add newsletter block that builds a footer email form from authored cells.

EOF
)"
```

Skip this step unless the user asked to commit.

---

### Task 2: Newsletter CSS (Figma inline form)

**Files:**
- Create: `blocks/newsletter/newsletter.css`
- Test: `npm run lint:css`

**Interfaces:**
- Consumes: classes from Task 1: `.newsletter-title`, `.newsletter-copy`, `.newsletter-form`, `.newsletter-label`, `.newsletter-field`, `.newsletter-submit`, `.newsletter-success`, plus input `#newsletter-email`.
- Produces: footer-width signup: 4XL heading, body, 56px field, dark pill submit inset on the right.

- [x] **Step 1: Write `blocks/newsletter/newsletter.css`**

```css
.newsletter {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  max-width: 720px;
}

.newsletter-title {
  margin: 0;
  color: #131313;
  font-size: 40px;
  font-weight: 400;
  letter-spacing: -0.01em;
  line-height: 44px;
}

.newsletter-copy,
.newsletter-success {
  margin: 0;
  color: #575757;
  font-size: 16px;
  line-height: 24px;
}

.newsletter-success {
  color: #131313;
}

.newsletter-label {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

.newsletter-form {
  position: relative;
  width: 100%;
}

.newsletter-field {
  position: relative;
}

.newsletter input[type='email'] {
  display: block;
  box-sizing: border-box;
  width: 100%;
  height: 56px;
  padding: 16px 128px 16px 20px;
  border: 1px solid #d1d1d1;
  border-radius: 12px;
  background: #fff;
  color: #131313;
  font: inherit;
  font-size: 16px;
  line-height: 24px;
}

.newsletter input[type='email']::placeholder {
  color: #575757;
}

.newsletter input[type='email']:focus {
  outline: 2px solid #131313;
  outline-offset: 2px;
}

.newsletter-submit {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  margin: 0;
  padding: 10px 16px;
  border: 0;
  border-radius: 500px;
  background: #131313;
  color: #fff;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  cursor: pointer;
}

.newsletter-submit:hover,
.newsletter-submit:focus-visible {
  background: #000;
}

@media (width >= 900px) {
  .newsletter {
    max-width: 720px;
  }
}
```

- [x] **Step 2: Lint CSS**

Run: `npm run lint:css`

Expected: PASS. If `clip` is rejected, use:

```css
.newsletter-label {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
```

- [x] **Step 3: Commit (only if the user asked)**

```bash
git add blocks/newsletter/newsletter.css
git commit -m "$(cat <<'EOF'
Style the footer newsletter field to match the Figma inline form.

EOF
)"
```

Skip unless the user asked to commit.

---

### Task 3: Browser + content check

**Files:**
- Modify: none (unless lint/layout bugs from Tasks 1–2)
- Test: `http://localhost:3000/` footer, and `curl localhost:3000/footer.plain.html`

**Interfaces:**
- Consumes: Task 1 `decorate` + Task 2 CSS; authored `/footer` fragment after Preview.
- Produces: working footer form on every page.

- [x] **Step 1: Confirm content**

Run:

```bash
curl -sS http://localhost:3000/footer.plain.html
```

Expected: a `newsletter` block in the HTML (class `newsletter` on a div). If it is missing, stop the browser pass and tell Rac: add the spec table on `/footer` above copyright, Preview, then re-curl. Do not patch `footer.js` to inject the block.

- [x] **Step 2: Exercise the form in the browser**

With `aem up` on [http://localhost:3000/](http://localhost:3000/):

1. Scroll to footer: heading, copy, email field, dark **Subscribe** pill inside the field.
2. Submit empty → browser required message; page does not navigate.
3. Submit `not-an-email` → browser email message; page does not navigate.
4. Submit `jane@aurelia.demo` → form is replaced with `Thanks — you're on the list.`
5. Open `/category/jewellery` and `/product/gold-hoops` and confirm the same footer form (one store, header badge / cart must still work).
6. Desktop (~1440) and a narrow viewport: field stays readable; submit stays inside the input.

If the form is missing after a confirmed Preview, check that the DA table name is exactly `newsletter` (hyphen, no extra class).

- [x] **Step 3: Full lint**

Run: `npm run lint`

Expected: PASS.

---

### Task 4: Interview note

**Files:**
- Modify: `docs/interview-qa.md` (append one section after the last Q)

**Interfaces:**
- Consumes: Task 1 behavior (form built in JS, no POST).
- Produces: a new Q13 Rac can memorize.

- [x] **Step 1: Append this section to `docs/interview-qa.md`**

```markdown
---

## 13. How do forms work in EDS?

DA does not ship a working \`<form>\`. Authors put a \`newsletter\` table on the \`/footer\` **fragment** (heading + copy only). \`blocks/newsletter/newsletter.js\` builds \`<form>\`, label, \`type="email"\`, and submit.

Submit is \`preventDefault\` + native validity + a success line. No spreadsheet in this demo.

**Production:** official form block + definition/submission sheets, or POST to a marketing endpoint. Same rule as other blocks: one flat table, no nested form inside footer columns, decorate defensively.
```

- [x] **Step 2: Commit (only if the user asked)**

```bash
git add docs/interview-qa.md
git commit -m "$(cat <<'EOF'
Document how the footer newsletter form is authored and submitted.

EOF
)"
```

Skip unless the user asked to commit.
