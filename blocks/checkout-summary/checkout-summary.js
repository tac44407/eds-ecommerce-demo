import { getItems, getTotals, placeOrder } from '../../scripts/cart.js';

function money(value) {
  const amount = Number(value) || 0;
  return `$${amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2)}`;
}

function createLine(item) {
  const row = document.createElement('article');
  row.className = 'checkout-line';
  const media = document.createElement('div');
  media.className = 'checkout-line-media';
  const img = document.createElement('img');
  img.src = item.image || '';
  img.alt = item.name || '';
  media.append(img);
  const info = document.createElement('div');
  const name = document.createElement('p');
  name.className = 'checkout-line-name';
  name.textContent = item.name;
  const meta = document.createElement('p');
  meta.className = 'checkout-line-meta';
  meta.textContent = [item.size, item.color, `Qty ${item.quantity}`].filter(Boolean).join(' · ');
  info.append(name, meta);
  const price = document.createElement('p');
  price.className = 'checkout-line-price';
  price.textContent = money(item.price * item.quantity);
  row.append(media, info, price);
  return row;
}

function createSummary() {
  const { subtotal, total } = getTotals();
  const aside = document.createElement('aside');
  aside.className = 'checkout-summary-panel';
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
  const place = document.createElement('button');
  place.type = 'button';
  place.className = 'button primary';
  place.textContent = 'Place order';
  place.addEventListener('click', () => {
    const order = placeOrder();
    if (!order) return;
    window.history.replaceState(null, '', `#order=${order.id}`);
    window.dispatchEvent(new CustomEvent('checkout:placed', { detail: order }));
  });
  const note = document.createElement('p');
  note.className = 'checkout-note';
  note.textContent = 'Demo checkout — no payment is collected.';
  aside.append(heading, table, place, note);
  return aside;
}

function renderEmpty(block) {
  const empty = document.createElement('div');
  empty.className = 'checkout-empty';
  const copy = document.createElement('p');
  copy.textContent = 'Nothing to review. Add something to your bag first.';
  const shop = document.createElement('a');
  shop.className = 'button primary';
  shop.href = '/category/jewellery';
  shop.textContent = 'Continue shopping';
  empty.append(copy, shop);
  block.replaceChildren(empty);
}

function renderConfirmation(block, order) {
  const done = document.createElement('div');
  done.className = 'checkout-done';
  const heading = document.createElement('h2');
  heading.textContent = 'Order placed';
  const copy = document.createElement('p');
  copy.textContent = `Thanks. Your demo order ${order.id} is saved on this browser only.`;
  const actions = document.createElement('div');
  actions.className = 'checkout-done-actions';
  const account = document.createElement('a');
  account.className = 'button primary';
  account.href = '/account';
  account.textContent = 'View account';
  const shop = document.createElement('a');
  shop.className = 'button secondary';
  shop.href = '/category/jewellery';
  shop.textContent = 'Continue shopping';
  actions.append(account, shop);
  done.append(heading, copy, actions);
  block.replaceChildren(done);
}

function renderReview(block) {
  const items = getItems();
  const review = document.createElement('div');
  review.className = 'checkout-review';
  const ship = document.createElement('section');
  ship.className = 'checkout-ship';
  const shipTitle = document.createElement('h2');
  shipTitle.textContent = 'Ship to';
  const shipCopy = document.createElement('p');
  [
    'Jane Shopper',
    '120 Market Street',
    'San Francisco, CA 94103',
    'jane@aurelia.demo',
  ].forEach((line, index) => {
    if (index) shipCopy.append(document.createElement('br'));
    shipCopy.append(line);
  });
  const edit = document.createElement('a');
  edit.href = '/cart';
  edit.textContent = 'Edit bag';
  ship.append(shipTitle, shipCopy, edit);
  const list = document.createElement('div');
  list.className = 'checkout-lines';
  items.forEach((item) => list.append(createLine(item)));
  review.append(ship, list);
  const layout = document.createElement('div');
  layout.className = 'checkout-layout';
  layout.append(review, createSummary());
  block.replaceChildren(layout);
}

export default function decorate(block) {
  const heading = block.closest('.section')?.querySelector('h1');
  if (heading) heading.className = 'checkout-title';

  const show = () => {
    const placed = new URLSearchParams(window.location.hash.replace('#', '')).get('order');
    const items = getItems();
    if (placed && !items.length) {
      renderConfirmation(block, { id: placed });
      return;
    }
    if (!items.length) {
      renderEmpty(block);
      return;
    }
    renderReview(block);
  };

  show();
  window.addEventListener('checkout:placed', (event) => {
    renderConfirmation(block, event.detail);
  });
}
