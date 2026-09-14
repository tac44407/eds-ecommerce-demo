import { loadCSS } from '../../scripts/aem.js';
import getProducts from '../../scripts/catalog.js';
import createProductTeaser from '../../scripts/product-teaser.js';

function decorateHeader(section) {
  if (!section) return;
  const heading = section.querySelector('h1');
  const count = [...section.querySelectorAll('p')].find((p) => /\d+\s+products?/i.test(p.textContent));
  if (heading && count) {
    const wrap = document.createElement('div');
    wrap.className = 'category-grid-title';
    count.className = 'category-grid-count';
    heading.after(wrap);
    wrap.append(heading, count);
  }
  const crumb = [...section.querySelectorAll('p')].find((p) => p.textContent.includes('/'));
  if (crumb) crumb.className = 'category-grid-crumb';
}

export default async function decorate(block) {
  await loadCSS(`${window.hlx.codeBasePath}/scripts/product-teaser.css`);
  const section = block.closest('.section');
  decorateHeader(section);

  const parts = window.location.pathname.split('/').filter(Boolean);
  const category = parts[0] === 'category' ? parts[1] : undefined;
  const products = await getProducts({ category });
  const list = document.createElement('ul');
  list.className = 'category-grid-list';
  products.forEach((product) => {
    const item = document.createElement('li');
    item.append(createProductTeaser(product));
    list.append(item);
  });
  block.replaceChildren(list);
}
