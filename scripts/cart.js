const STORAGE_KEY = 'aurelia-cart';

function read() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function write(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('cart:change'));
}

export function getItems() {
  return read();
}

export function getCount() {
  return read().reduce((sum, item) => sum + item.quantity, 0);
}

export function getTotals() {
  const items = read();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { subtotal, shipping: 0, total: subtotal };
}

export function addItem(product) {
  const items = read();
  const key = [product.sku, product.size || '', product.color || ''].join('|');
  const existing = items.find((item) => item.key === key);
  const quantity = product.quantity || 1;
  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({
      key,
      sku: product.sku,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image || '',
      size: product.size || '',
      color: product.color || '',
    });
  }
  write(items);
  return items;
}

export function removeItem(key) {
  write(read().filter((item) => item.key !== key));
}

export function updateQty(key, quantity) {
  if (quantity < 1) {
    removeItem(key);
    return;
  }
  const items = read();
  const item = items.find((entry) => entry.key === key);
  if (item) item.quantity = quantity;
  write(items);
}

const ORDERS_KEY = 'aurelia-orders';

export function getOrders() {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
  } catch {
    return [];
  }
}

export function placeOrder() {
  const items = read();
  if (!items.length) return null;
  const totals = getTotals();
  const order = {
    id: `AUR-${Date.now().toString().slice(-6)}`,
    placedAt: new Date().toISOString(),
    items,
    ...totals,
  };
  localStorage.setItem(ORDERS_KEY, JSON.stringify([order, ...getOrders()]));
  write([]);
  return order;
}
