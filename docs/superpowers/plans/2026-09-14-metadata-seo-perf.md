# Metadata, SEO, Performance, Best Practices

Learning track (not a feature build). Official refs:

- [Page Metadata](https://www.aem.live/docs/metadata)
- [Bulk Metadata](https://www.aem.live/docs/bulk-metadata)
- [Section Metadata](https://www.aem.live/developer/block-collection/section-metadata)
- [Indexing](https://www.aem.live/developer/indexing)
- [Dev collab and good practices](https://www.aem.live/docs/dev-collab-and-good-practices)

**How we work:** I explain, you author or inspect, we verify on `localhost:3000` / `.aem.page`. Code only when a session needs it. One session at a time.

---

### Session A — Page metadata

A `Metadata` table at the bottom of a DA doc is **not** a block you style. The pipeline turns it into `<title>` and `<meta>` in `<head>`. No JS in this repo does that.

You add title / description / image on `/index` (home still says “AEM Boilerplate”). We `curl` the `<head>` and confirm.

---

### Session B — Bulk metadata

A root `metadata` sheet (`/metadata.json`) applies properties by URL pattern (`**`, `/product/**`). Evaluated top to bottom. Page table **wins** over bulk.

You add a sheet: default `og` image / brand title suffix, `robots: noindex` on `/cart` and `/checkout`. We compare two pages.

---

### Session C — Section metadata

`Section Metadata` is **not** SEO. `Style` → section class. `Id` → anchor. Extra rows → `data-*`. Authors find it fiddly; skip until you need a theme band.

You add one `style` on a home or help section. We inspect the DOM. No new block JS.

---

### Session D — Indexing and SEO

`/query-index.json` is the published-page index (lists, search, sitemap). Columns come from `<head>` (`title`, `description`, `image`, `robots`, …). Sitemap skips `robots: noindex` if that column exists.

Config lives at tools.aem.live (not retired `helix-query.yaml`). We fetch `/query-index.json` and talk sitemap vs catalog sheet.

---

### Session E — Performance

EDS: small `head.html`, eager first section (LCP), lazy chrome, no frameworks in the LCP path, no build/minify for PSI, no GTM in `head.html`. Code Sync runs PageSpeed on PRs — green mobile + desktop.

We walk `loadEager` / `loadLazy` and your `head.html`. Optional: PSI on a preview URL.

---

### Session F — Best-practice interview pass

From [the same doc](https://www.aem.live/docs/dev-collab-and-good-practices): PRs (preview URL required), lint, small PRs, don’t edit `aem.js`, isolate CSS, mobile-first 600/900/1200, content first, `/drafts/`, strings from content, no binaries in git.

Quiz + add a short section to `docs/interview-qa.md`.

---

## Done when

You can explain precedence (page > folder > bulk), why section metadata is not SEO, why cart can be `noindex`, what `query-index.json` is for, and why `head.html` stays tiny.
