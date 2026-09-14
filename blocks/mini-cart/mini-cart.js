import { loadCSS } from '../../scripts/aem.js';
import {
  getItems,
  getTotals,
  removeItem,
  updateQty,
} from '../../scripts/cart.js';
import createCartItem, { money } from '../../scripts/cart-item.js';

function wrapperOf(block) {
  return block.closest('.mini-cart-wrapper') || block.parentElement;
}

function isOpen(block) {
  return wrapperOf(block)?.classList.contains('is-open');
}

function open(block) {
  const wrap = wrapperOf(block);
  if (!wrap) return;
  wrap.classList.add('is-open');
  wrap.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  wrap.querySelector('.mini-cart-close')?.focus();
}

function close(block) {
  const wrap = wrapperOf(block);
  if (!wrap) return;
  wrap.classList.remove('is-open');
  wrap.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function render(block) {
  const items = getItems();
  const { subtotal } = getTotals();

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'mini-cart-close';
  closeBtn.setAttribute('aria-label', 'Close cart');
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', () => close(block));

  const heading = document.createElement('h2');
  heading.className = 'mini-cart-title';
  heading.textContent = 'Cart';

  const header = document.createElement('div');
  header.className = 'mini-cart-header';
  header.append(heading, closeBtn);

  if (!items.length) {
    const empty = document.createElement('div');
    empty.className = 'mini-cart-empty';
    const copy = document.createElement('p');
    copy.textContent = 'Your cart is empty.';
    const shop = document.createElement('a');
    shop.className = 'button primary';
    shop.href = '/category/jewellery';
    shop.textContent = 'Continue shopping';
    shop.addEventListener('click', () => close(block));
    empty.append(copy, shop);
    block.replaceChildren(header, empty);
    return;
  }

  const list = document.createElement('div');
  list.className = 'mini-cart-items';
  items.forEach((item) => list.append(createCartItem(item, {
    compact: true,
    onQty: updateQty,
    onRemove: removeItem,
  })));

  const footer = document.createElement('div');
  footer.className = 'mini-cart-footer';
  const total = document.createElement('p');
  total.className = 'mini-cart-subtotal';
  const label = document.createElement('span');
  label.textContent = 'Subtotal';
  const value = document.createElement('span');
  value.textContent = money(subtotal);
  total.append(label, value);

  const checkout = document.createElement('a');
  checkout.className = 'button primary';
  checkout.href = '/checkout';
  checkout.textContent = 'Proceed to checkout';

  const view = document.createElement('a');
  view.className = 'button secondary';
  view.href = '/cart';
  view.textContent = 'View cart';

  footer.append(total, checkout, view);
  block.replaceChildren(header, list, footer);
}

export default async function decorate(block) {
  await loadCSS(`${window.hlx.codeBasePath}/scripts/cart-item.css`);
  const wrap = wrapperOf(block);
  wrap.setAttribute('role', 'dialog');
  wrap.setAttribute('aria-modal', 'true');
  wrap.setAttribute('aria-label', 'Cart');
  wrap.setAttribute('aria-hidden', 'true');
  wrap.addEventListener('click', (event) => {
    if (event.target === wrap) close(block);
  });

  render(block);
  window.addEventListener('cart:change', () => render(block));
  window.addEventListener('mini-cart:open', () => {
    render(block);
    open(block);
  });
  window.addEventListener('keydown', (event) => {
    if (event.code === 'Escape' && isOpen(block)) close(block);
  });
}
