import { loadCSS } from '../../scripts/aem.js';
import getProducts from '../../scripts/catalog.js';
import createProductTeaser from '../../scripts/product-teaser.js';

export default async function decorate(block) {
  await loadCSS(`${window.hlx.codeBasePath}/scripts/product-teaser.css`);
  const current = window.location.pathname.replace(/\/$/, '');
  const products = (await getProducts()).filter((product) => (
    (product.path || '').replace(/\/$/, '') !== current
  ));
  if (!products.length) {
    block.closest('.section')?.remove();
    return;
  }

  const heading = document.createElement('h2');
  heading.textContent = block.textContent.trim() || 'Featured items';
  const list = document.createElement('ul');
  list.className = 'related-products-list';
  products.forEach((product) => {
    const item = document.createElement('li');
    item.append(createProductTeaser(product));
    list.append(item);
  });
  block.replaceChildren(heading, list);
}
