import {
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateBlock,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadBlock,
  loadCSS,
  buildBlock,
} from './aem.js';

if (window.trustedTypes && window.trustedTypes.createPolicy) {
  const innerTT = window.trustedTypes.createPolicy('tt-inner', {
    createHTML: (s) => s, // avoid stack overflow
  });

  window.trustedTypes.createPolicy('default', {
    createHTML: (input, type, sink) => {
      let processedInput = input;
      if (/srcdoc\s*=/i.test(processedInput)) {
        const doc = new DOMParser().parseFromString(innerTT.createHTML(processedInput), 'text/html');
        doc.querySelectorAll('iframe[srcdoc]').forEach((el) => el.removeAttribute('srcdoc'));
        processedInput = doc.body.innerHTML;
      }
      if (sink.includes('createContextualFragment') || sink.includes('Document write')) {
        const doc = new DOMParser().parseFromString(innerTT.createHTML(processedInput), 'text/html');
        doc.querySelectorAll('script').forEach((el) => el.remove());
        processedInput = doc.body.innerHTML;
      }
      return processedInput;
    },
    createScriptURL: (input) => input,
    createScript: (input) => input,
  });
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Turns `/widgets/...` links into widget blocks.
 * @param {Element} main The container element
 */
function buildWidgetAutoBlocks(main) {
  const widgetLinks = [...main.querySelectorAll('a[href*="/widgets/"]')];
  widgetLinks.forEach((link) => {
    if (link.closest('.widget')) return;
    const newLink = link.cloneNode(true);
    const widgetBlock = buildBlock('widget', { elems: [newLink] });
    const p = link.closest('p');
    if (
      p
      && p.querySelectorAll('a').length === 1
      && p.querySelector('a') === link
      && p.textContent.trim() === link.textContent.trim()
    ) {
      p.replaceWith(widgetBlock);
    } else {
      link.replaceWith(widgetBlock);
    }
  });
}

/**
 * Turns authored product columns + headings into PDP blocks.
 * @param {Element} main The container element
 */
function buildProductAutoBlocks(main) {
  if (!window.location.pathname.startsWith('/product/')) return;
  // Fragments also call decorateMain(); footer columns must not become a PDP.
  if (main !== document.querySelector('main')) return;

  const columns = main.querySelector('.columns');
  if (columns) {
    const cells = columns.querySelector(':scope > div')?.children || [];
    const [left, right] = cells;
    if (left?.querySelector('picture') && right) {
      const gallery = buildBlock(
        'product-gallery',
        [...left.querySelectorAll('picture')].map((picture) => [{ elems: [picture] }]),
      );
      const details = buildBlock('product-details', { elems: [...right.children] });
      columns.replaceWith(gallery, details);
    }
  }

  const productSection = [...main.children].find((section) => section.querySelector('.product-gallery'));
  const infoSection = [...main.children].find((section) => (
    section.querySelector('h2') && !section.querySelector('.product-gallery')
  ));
  if (infoSection) {
    const groups = [];
    let current;
    [...infoSection.children].forEach((child) => {
      if (child.matches('h2')) {
        current = { heading: child, body: [] };
        groups.push(current);
      } else if (current) {
        current.body.push(child);
      }
    });
    if (groups.length) {
      const accordion = buildBlock(
        'product-accordion',
        groups.map((group) => [{ elems: [group.heading] }, { elems: group.body }]),
      );
      if (productSection) {
        productSection.append(accordion);
        infoSection.remove();
      } else {
        infoSection.replaceChildren(accordion);
      }
    }
  }

  if (productSection && !main.querySelector('.product-perks')) {
    const perksSection = document.createElement('div');
    perksSection.append(buildBlock('product-perks', [
      ['Free Shipping', 'On orders over $250'],
      ['Free Returns', 'On full priced items only'],
      ['2 Year Warranty', 'As standard'],
    ]));
    productSection.after(perksSection);
  }
}

function buildHelpAutoBlock(main) {
  if (window.location.pathname !== '/help') return;
  if (main !== document.querySelector('main')) return;
  const section = main.querySelector(':scope > div');
  if (!section || section.querySelector('.help')) return;
  section.replaceChildren(buildBlock('help', { elems: [...section.children] }));
}

function isHomePath() {
  const { pathname } = window.location;
  return pathname === '/' || pathname === '/index';
}

/**
 * Turns the authored home heading + image + CTA into a hero, then splits
 * the collection heading/grid into their own section.
 */
function buildHeroAutoBlock(main) {
  if (!isHomePath()) return;
  if (main !== document.querySelector('main')) return;
  const section = main.querySelector(':scope > div');
  if (!section || section.querySelector('.hero')) return;
  const heading = section.querySelector('h1');
  const picture = section.querySelector('picture');
  if (!heading || !picture) return;

  const heroElems = [];
  [...section.children].some((child) => {
    if (child.matches('h2') || child.classList.contains('category-grid')) return true;
    heroElems.push(child);
    return false;
  });
  if (!heroElems.length) return;

  const rest = [...section.children].filter((child) => !heroElems.includes(child));
  section.classList.remove('highlight');
  section.replaceChildren(buildBlock('hero', { elems: heroElems }));
  if (rest.length) {
    const next = document.createElement('div');
    next.append(...rest);
    section.after(next);
  }
  [...main.children].forEach((child) => {
    if (!child.children.length) child.remove();
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildProductAutoBlocks(main);
    // auto load `*/fragments/*` references
    const fragments = [...main.querySelectorAll('a[href*="/fragments/"]')].filter((f) => !f.closest('.fragment'));
    if (fragments.length > 0) {
      // eslint-disable-next-line import/no-cycle
      import('../blocks/fragment/fragment.js').then(({ loadFragment }) => {
        fragments.forEach(async (fragment) => {
          try {
            const { pathname } = new URL(fragment.href);
            const frag = await loadFragment(pathname);
            fragment.parentElement.replaceWith(...frag.children);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Fragment loading failed', error);
          }
        });
      });
    }
    buildWidgetAutoBlocks(main);
    buildHelpAutoBlock(main);
    buildHeroAutoBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates formatted links to style them as buttons.
 * @param {HTMLElement} main The main container element
 */
function decorateButtons(main) {
  main.querySelectorAll('p a[href]').forEach((a) => {
    a.title = a.title || a.textContent;
    const p = a.closest('p');
    const text = a.textContent.trim();

    // quick structural checks
    if (a.querySelector('img') || p.textContent.trim() !== text) return;

    // skip URL display links
    try {
      if (new URL(a.href).href === new URL(text, window.location).href) return;
    } catch { /* continue */ }

    // require authored formatting for buttonization
    const strong = a.closest('strong');
    const em = a.closest('em');
    if (!strong && !em) return;

    p.className = 'button-wrapper';
    a.className = 'button';
    if (strong && em) { // high-impact call-to-action
      a.classList.add('accent');
      const outer = strong.contains(em) ? strong : em;
      outer.replaceWith(a);
    } else if (strong) {
      a.classList.add('primary');
      strong.replaceWith(a);
    } else {
      a.classList.add('secondary');
      em.replaceWith(a);
    }
  });
}

function stackProductInfo(main) {
  const detailsWrap = main.querySelector('.product-details-wrapper');
  const accordionWrap = main.querySelector('.product-accordion-wrapper');
  if (!detailsWrap || !accordionWrap) return;
  if (detailsWrap.parentElement !== accordionWrap.parentElement) return;
  const stack = document.createElement('div');
  stack.className = 'product-info-stack';
  detailsWrap.before(stack);
  stack.append(detailsWrap, accordionWrap);
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateButtons(main);
  stackProductInfo(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

async function loadPromoBar(doc) {
  if (sessionStorage.getItem('aurelia-promo-dismissed')) return;
  const holder = document.createElement('aside');
  const block = buildBlock('promo-bar', '');
  holder.append(block);
  doc.body.prepend(holder);
  decorateBlock(block);
  await loadBlock(block);
  if (!block.isConnected || !block.querySelector('.promo-bar-copy')) {
    holder.remove();
  }
}

async function loadMiniCart(doc) {
  const holder = document.createElement('aside');
  const block = buildBlock('mini-cart', '');
  holder.append(block);
  doc.body.append(holder);
  decorateBlock(block);
  await loadBlock(block);
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  loadPromoBar(doc);
  loadHeader(doc.querySelector('body > header'));
  loadMiniCart(doc);

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(doc.querySelector('body > footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  import('./consent-check.js');
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
