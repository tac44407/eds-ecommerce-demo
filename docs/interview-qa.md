# EDS interview Q&A (Aurelia)

Use this before the interview. Answers match **this** repo, not generic boilerplate.

Local: `npx -y @adobe/aem-cli up` → [localhost:3000](http://localhost:3000/)  
Content: `https://main--eds-ecommerce-demo--tac44407.aem.page/`  
Code merge to `main` ships JS/CSS. Content publishes separately in DA / Preview / Publish.

---

## 1. Block vs section vs fragment? Why no `index.html`?

**Section** — a top-level slice of a page. In Document Authoring it is a horizontal break. In HTML it is a `div` under `main`. `decorateSections` adds `.section`, wraps leftover text as `.default-content-wrapper`, and hides the section until it loads.

**Block** — a named table in the document (`columns`, `category-grid`, `cart`). After decorate it is `div.block` with `data-block-name`. `loadBlock` then fetches `blocks/{name}/{name}.js` and `.css`. Authors omit and add cells; decorate must tolerate missing cells.

**Fragment** — a document that is **not** a page. Ours: `/nav`, `/footer`, `/promo`. Header, footer, and promo-bar fetch `{path}.plain.html` and decorate that HTML into chrome. You do not navigate to those URLs.

**No `index.html`** — HTML is not in the repo. Content lives in DA; the CDN serves it. The repo is only JS/CSS (plus icons). `aem up` pairs **local code** with **previewed content**. Home markup is `/index.plain.html` (`/.plain.html` 404s).

---

## 2. What does the decorate pipeline do? Why never edit `scripts/aem.js`?

The browser gets page HTML, then `loadPage()` in `scripts/scripts.js`:

1. **`loadEager`** (LCP first)
   - `decorateMain(main)`:
     - `decorateIcons`
     - `buildAutoBlocks` — rewrite markup **before** block JS runs (PDP columns → gallery/details, hero, help, fragment links)
     - `decorateSections`
     - `decorateBlocks` — mark `div.section > div > div` as blocks
     - `decorateButtons` — only **strong/em** links become buttons
     - `stackProductInfo` (PDP buy box + accordion)
   - load the **first** section + wait for the first image
2. **`loadLazy`** — promo-bar, header, mini-cart, remaining sections, footer
3. **`loadDelayed`** — non-critical (consent)

**Never edit `scripts/aem.js`.** It is vendored boilerplate (section/block/header/footer loaders). Project logic goes in `scripts/scripts.js` and `blocks/`. Editing it breaks upgrades and you cannot defend it.

`buildAutoBlocks` runs **before** your block. If you assume authored tables are still there, you are wrong.

---

## 3. What does `.plain.html` give you?

The inner content of a document **without** the full page chrome (no header/footer shell). Fragments and `loadFragment` use `GET {path}.plain.html`. That is how `/nav`, `/footer`, and `/promo` are injected.

Inspect locally: `curl localhost:3000/index.plain.html` or `/product/gold-hoops.plain.html`.

---

## 4. Why no nested blocks in the document?

EDS loads one block JS/CSS per authored table. A Word/DA table inside another table is not a supported “child block.”

**Allowed:** one authored block whose JS **calls a function** that builds cards.

Example: `category-grid` is one block. It fetches `/catalog.json` and calls `scripts/product-teaser.js` to render cards. The category **document** does not nest a `product-teaser` table. Same teaser function is reused on home and related products.

**Auto-blocks are still flat.** `buildProductAutoBlocks` **replaces** a `columns` table with sibling `product-gallery` + `product-details` blocks. It does not nest them.

---

## 5. Code vs content — what lives where?

| Content (DA, Preview) | Code (this repo) |
|---|---|
| Pages: `/`, `/category/jewellery`, `/product/…`, `/cart`, `/checkout`, `/account`, `/help` | `blocks/*`, `scripts/*`, `styles/*`, `icons/*` |
| Fragments: `/nav`, `/footer`, `/promo` | How those fragments are loaded and styled |
| `/catalog.json` sheet (name, price, image, path, category) | `catalog.js` fetch + filter |
| Copy, images, links, H1s, accordion headings | Decorate, layout, cart, mini-cart |

Merging `main` ships **code**. Publishing a DA doc ships **content**. Interviewers will ask this.

Config for the site lives at tools.aem.live. `fstab.yaml` / `helix-query.yaml` / `paths.json` are retired.

---

## 6. How does cart state work?

`scripts/cart.js` is the only store.

- Cart lines: `localStorage` key `aurelia-cart`
- Orders: `aurelia-orders`
- `write()` always dispatches `cart:change`
- Header badge and cart / mini-cart **listen** for `cart:change` and re-render
- PDP `addItem()` then dispatches `mini-cart:open`
- Header bag click: `preventDefault` + `mini-cart:open`, except on `/cart` and `/checkout`
- `placeOrder()` writes an `AUR-######` order, clears the cart, returns the order
- Checkout can show `#order=AUR-…`

This is a **front-end mock**. Production would use Adobe Commerce / Catalog Service for price, stock, and cart; EDS stays cached HTML + API calls.

Mini-cart is **not** a DA page. It is injected in `loadLazy` like the promo-bar.

`scripts/cart-item.js` only draws a line. Qty/remove callbacks live in the cart / mini-cart blocks so `cart.js` does not import UI (no circular import).

---

## 7. Documents vs catalog — how is the PLP different from the PDP?

**PDP URLs are documents.** `/product/gold-hoops` is authored HTML (gallery images + buy-box copy + Details/Specs). Auto-blocks rewrite that into gallery, details, accordion, perks, related.

**PLP is a sheet + one block.** `/category/jewellery` has crumb, H1, count, and an empty `category-grid`. JS does `GET /catalog.json` and filters `category === jewellery`. That sheet is a stand-in for Commerce Catalog Service.

Home “Shop the collection” is the same `category-grid` + teaser, unfiltered.

---

## 8. Fragments — how do header / footer / promo load?

1. `loadHeader` / `loadFooter` build empty `header` / `footer` blocks, then those blocks `loadFragment('/nav')` / `loadFragment('/footer')`.
2. `loadFragment` fetches `.plain.html`, puts it in a temporary `<main>`, calls **`decorateMain`**, then `loadSections`.
3. Promo-bar is not a page: `loadPromoBar` builds a `promo-bar` block that fetches `/promo.plain.html`. Dismiss is `sessionStorage` `aurelia-promo-dismissed`.

**Trap we hit:** `decorateMain` on a fragment would run `buildProductAutoBlocks`. Footer `columns` with pictures looked like a PDP. Guard: only run product/hero/help auto-blocks when `main === document.querySelector('main')`.

`fragment/fragment.js` is the **only** allowed cross-block import. Everything else goes through `/scripts/`.

---

## 9. `decorateButtons` — why is the home CTA special?

`decorateButtons` only buttonizes a link that is wrapped in **strong** or **em**. A plain `<a>` stays a text link.

Home “Shop jewellery” is a plain link in DA. `hero.js` force-styles it as the lime overlay CTA so authors do not have to remember bold.

---

## 10. What would you say about EDS vs a typical SPA?

EDS is **content HTML first**, then decorate. There is no app-owned `index.html` router. Pages are documents. Blocks are progressive enhancement.

LCP: eager-decorate `main`, paint the first section, then lazy-load chrome and the rest.

Commerce data that changes often (price, inventory, cart) should not be baked into the cached HTML forever — fetch it (we used `/catalog.json` + `localStorage` as the teaching stand-in).

---

## 11. Files you should be able to name

| Area | Files |
|---|---|
| Pipeline | `scripts/scripts.js` (`decorateMain`, `buildAutoBlocks`, eager/lazy). Not `aem.js`. |
| Shared | `scripts/catalog.js`, `product-teaser.js`, `cart.js`, `cart-item.js` |
| Chrome | `blocks/header`, `footer`, `promo-bar`, `mini-cart` |
| Home | `blocks/hero`, `category-grid` (also PLP) |
| PLP | `blocks/category-grid` |
| PDP | `product-gallery`, `product-details`, `product-accordion`, `product-perks`, `related-products` |
| Cart journey | `blocks/cart`, `checkout-summary`, `account` |
| Fragments | `blocks/fragment/fragment.js` only |

Never edit `scripts/aem.js`. Scope CSS to `.blockname`. `-wrapper` / `-container` are section classes.

---

## 12. Journey (click this in the interview if they ask for a demo)

Home → Shop jewellery → PDP → Add to cart → mini-cart → View cart → Proceed to checkout → Place order → Account (order listed).

---

## 13. How do forms work in EDS?

DA does not ship a working `<form>`. Authors put a `newsletter` table on the `/footer` **fragment** (heading + copy only). `blocks/newsletter/newsletter.js` builds `<form>`, label, `type="email"`, and submit.

Submit is `preventDefault` + native validity + a success line. No spreadsheet in this demo.

**Production:** official form block + definition/submission sheets, or POST to a marketing endpoint. Same rule as other blocks: one flat table, no nested form inside footer columns, decorate defensively.

---

## One-liners if you get stuck

- **Markup comes from the backend.** `curl` `.plain.html` before you write JS.
- **`buildAutoBlocks` rewrites first.** Your block sees the rewritten DOM.
- **Authors omit cells.** Decorate defensively.
- **No build step.** What you commit is what is served.
- **A PR without `{branch}--{repo}--{owner}.aem.page/{path}` is rejected.**
