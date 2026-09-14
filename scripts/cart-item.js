function money(value) {
  const amount = Number(value) || 0;
  return `$${amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2)}`;
}

function createQty(item, onQty) {
  const qty = document.createElement('div');
  qty.className = 'cart-item-qty';
  const minus = document.createElement('button');
  minus.type = 'button';
  minus.setAttribute('aria-label', `Decrease ${item.name}`);
  minus.textContent = '−';
  const input = document.createElement('input');
  input.type = 'number';
  input.min = '1';
  input.value = String(item.quantity);
  input.setAttribute('aria-label', `Quantity for ${item.name}`);
  const plus = document.createElement('button');
  plus.type = 'button';
  plus.setAttribute('aria-label', `Increase ${item.name}`);
  plus.textContent = '+';
  minus.addEventListener('click', () => onQty(item.key, item.quantity - 1));
  plus.addEventListener('click', () => onQty(item.key, item.quantity + 1));
  input.addEventListener('change', () => {
    onQty(item.key, Math.max(1, Number(input.value) || 1));
  });
  qty.append(minus, input, plus);
  return qty;
}

/**
 * Figma Storefront Kit Cart Item (Large on /cart, Small in mini-cart).
 * @param {object} item
 * @param {{ compact?: boolean, onQty: Function, onRemove: Function }} options
 * @returns {HTMLElement}
 */
export default function createCartItem(item, { compact = false, onQty, onRemove } = {}) {
  const row = document.createElement('article');
  row.className = compact ? 'cart-item cart-item-small' : 'cart-item';

  const media = document.createElement('div');
  media.className = 'cart-item-media';
  const img = document.createElement('img');
  img.src = item.image || '';
  img.alt = item.name || '';
  media.append(img);

  const info = document.createElement('div');
  info.className = 'cart-item-info';
  const name = document.createElement('p');
  name.className = 'cart-item-name';
  name.textContent = item.name;
  info.append(name);
  const meta = [item.size, item.color].filter(Boolean).join(', ');
  if (meta) {
    const variant = document.createElement('p');
    variant.className = 'cart-item-meta';
    variant.textContent = meta;
    info.append(variant);
  }

  const actions = document.createElement('div');
  actions.className = 'cart-item-actions';
  const price = document.createElement('p');
  price.className = 'cart-item-price';
  price.textContent = money(item.price);

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'cart-item-remove';
  remove.setAttribute('aria-label', `Remove ${item.name}`);
  const icon = document.createElement('img');
  icon.src = `${window.hlx.codeBasePath}/icons/trash.svg`;
  icon.alt = '';
  icon.width = 20;
  icon.height = 20;
  remove.append(icon);
  remove.addEventListener('click', () => onRemove(item.key));

  const controls = document.createElement('div');
  controls.className = 'cart-item-controls';
  controls.append(createQty(item, onQty), remove);

  actions.append(price, controls);
  if (compact) {
    const body = document.createElement('div');
    body.className = 'cart-item-body';
    body.append(info, actions);
    row.append(media, body);
  } else {
    row.append(media, info, actions);
  }
  return row;
}

export { money };
