import { getOrders } from '../../scripts/cart.js';

function money(value) {
  const amount = Number(value) || 0;
  return `$${amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2)}`;
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

function createProfile() {
  const section = document.createElement('section');
  section.className = 'account-profile';
  const heading = document.createElement('h2');
  heading.textContent = 'Profile';
  const dl = document.createElement('dl');
  [
    ['Name', 'Jane Shopper'],
    ['Email', 'jane@aurelia.demo'],
    ['Ship to', '120 Market Street, San Francisco, CA 94103'],
  ].forEach(([label, value]) => {
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = value;
    dl.append(dt, dd);
  });
  const note = document.createElement('p');
  note.className = 'account-note';
  note.textContent = 'Demo account — not signed in to a real identity service.';
  section.append(heading, dl, note);
  return section;
}

function createOrder(order) {
  const article = document.createElement('article');
  article.className = 'account-order';
  const header = document.createElement('div');
  header.className = 'account-order-header';
  const id = document.createElement('p');
  id.className = 'account-order-id';
  id.textContent = order.id;
  const badge = document.createElement('span');
  badge.className = 'account-order-badge';
  badge.textContent = 'Placed';
  header.append(id, badge);
  const meta = document.createElement('p');
  meta.className = 'account-order-meta';
  meta.textContent = `${formatDate(order.placedAt)} · ${money(order.total)}`;
  const items = document.createElement('p');
  items.className = 'account-order-items';
  items.textContent = (order.items || [])
    .map((item) => `${item.name} × ${item.quantity}`)
    .join(', ');
  article.append(header, meta, items);
  return article;
}

export default function decorate(block) {
  const heading = block.closest('.section')?.querySelector('h1');
  if (heading) heading.className = 'account-title';

  const layout = document.createElement('div');
  layout.className = 'account-layout';
  layout.append(createProfile());

  const orders = document.createElement('section');
  orders.className = 'account-orders';
  const ordersHeading = document.createElement('h2');
  ordersHeading.id = 'orders';
  ordersHeading.textContent = 'Orders';
  orders.append(ordersHeading);
  const list = getOrders();
  if (!list.length) {
    const empty = document.createElement('p');
    empty.className = 'account-note';
    empty.textContent = 'No orders yet. Place a demo order at checkout to see it here.';
    const shop = document.createElement('a');
    shop.className = 'button primary';
    shop.href = '/category/jewellery';
    shop.textContent = 'Shop jewellery';
    orders.append(empty, shop);
  } else {
    list.forEach((order) => orders.append(createOrder(order)));
  }
  layout.append(orders);
  block.replaceChildren(layout);
}
