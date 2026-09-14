import { loadCSS } from '../../scripts/aem.js';
import {
  getItems,
  getTotals,
  removeItem,
  updateQty,
} from '../../scripts/cart.js';
import createCartItem, { money } from '../../scripts/cart-item.js';

function createSummary() {
  const { subtotal, total } = getTotals();
  const aside = document.createElement('aside');
  aside.className = 'cart-summary';
  const heading = document.createElement('h2');
  heading.textContent = 'Order summary';
  const table = document.createElement('dl');
  [
    ['Subtotal', money(subtotal)],
    ['Shipping', 'Free'],
    ['Total', money(total)],
  ].forEach(([label, value]) => {
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = value;
    table.append(dt, dd);
  });
  const actions = document.createElement('div');
  actions.className = 'cart-summary-actions';
  const shop = document.createElement('a');
  shop.className = 'button secondary';
  shop.href = '/category/jewellery';
  shop.textContent = 'Continue shopping';
  const checkout = document.createElement('a');
  checkout.className = 'button primary';
  checkout.href = '/checkout';
  checkout.textContent = 'Proceed to checkout';
  actions.append(shop, checkout);
  aside.append(heading, table, actions);
  return aside;
}

function render(block) {
  const items = getItems();
  const heading = block.closest('.section')?.querySelector('h1');
  if (heading) heading.className = 'cart-title';

  if (!items.length) {
    const empty = document.createElement('div');
    empty.className = 'cart-empty';
    const copy = document.createElement('p');
    copy.textContent = 'Your cart is empty.';
    const shop = document.createElement('a');
    shop.className = 'button primary';
    shop.href = '/category/jewellery';
    shop.textContent = 'Continue shopping';
    empty.append(copy, shop);
    block.replaceChildren(empty);
    return;
  }

  const layout = document.createElement('div');
  layout.className = 'cart-layout';
  const list = document.createElement('div');
  list.className = 'cart-items';
  items.forEach((item) => list.append(createCartItem(item, { onQty: updateQty, onRemove: removeItem })));
  layout.append(list, createSummary());
  block.replaceChildren(layout);
}

export default async function decorate(block) {
  await loadCSS(`${window.hlx.codeBasePath}/scripts/cart-item.css`);
  render(block);
  window.addEventListener('cart:change', () => render(block));
}
