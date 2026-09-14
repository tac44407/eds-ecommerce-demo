import { addItem } from '../../scripts/cart.js';

function parsePrice(text) {
  const match = text.replace(/,/g, '').match(/\$?\s*(\d+(?:\.\d{2})?)/);
  return match ? Number(match[1]) : 0;
}

function extractOptions(block) {
  const options = [];
  [...block.querySelectorAll('p')].forEach((paragraph) => {
    const lines = paragraph.innerHTML
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const optionLines = lines.filter((line) => /^(Size|Color)\s*:/i.test(line));
    if (!optionLines.length) return;
    optionLines.forEach((line) => {
      const [, name, values] = line.match(/^([^:]+):\s*(.+)$/) || [];
      if (!name || !values) return;
      options.push({
        name: name.trim(),
        values: values.split(',').map((value) => value.trim()).filter(Boolean),
      });
    });
    paragraph.remove();
  });
  return options;
}

const SWATCHES = {
  gold: '#c9a227',
  silver: '#c4c4c4',
  white: '#ffffff',
  black: '#131313',
  rose: '#e8b4b8',
};

function swatchHex(value) {
  return SWATCHES[value.toLowerCase()];
}

function createOptionGroup(option) {
  const field = document.createElement('div');
  field.className = 'product-details-option';
  const label = document.createElement('p');
  label.className = 'product-details-option-label';
  const valueLabel = document.createElement('span');
  valueLabel.className = 'product-details-option-value';
  label.append(option.name, ' ', valueLabel);

  const list = document.createElement('div');
  list.className = 'product-details-option-values';
  list.setAttribute('role', 'listbox');
  list.setAttribute('aria-label', option.name);
  const useSwatches = /color/i.test(option.name) && option.values.every(swatchHex);

  option.values.forEach((value, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('role', 'option');
    if (useSwatches) {
      button.className = 'product-details-swatch';
      button.setAttribute('aria-label', value);
      const fill = document.createElement('span');
      fill.style.background = swatchHex(value);
      button.append(fill);
    } else {
      button.className = 'product-details-chip';
      button.textContent = value;
    }
    if (index === 0) {
      button.setAttribute('aria-selected', 'true');
      valueLabel.textContent = value;
    }
    button.addEventListener('click', () => {
      list.querySelectorAll('[aria-selected="true"]').forEach((el) => el.removeAttribute('aria-selected'));
      button.setAttribute('aria-selected', 'true');
      valueLabel.textContent = value;
    });
    list.append(button);
  });

  field.append(label, list);
  field.dataset.name = option.name.toLowerCase();
  return field;
}

function selectedValue(block, name) {
  const group = block.querySelector(`.product-details-option[data-name="${name}"] [aria-selected="true"]`);
  return group ? (group.textContent.trim() || group.getAttribute('aria-label') || '') : '';
}

export default function decorate(block) {
  const brand = block.querySelector('p');
  if (brand && !brand.querySelector('a') && !/^\$/.test(brand.textContent.trim())) {
    brand.className = 'product-details-brand';
  }

  const title = block.querySelector('h1');
  const price = [...block.querySelectorAll('p')].find((p) => /^\$/.test(p.textContent.trim()));
  if (price) price.className = 'product-details-price';

  const desc = [...block.querySelectorAll('p')].find((p) => (
    p !== brand
    && p !== price
    && !p.querySelector('a')
    && !/^(Size|Color)\s*:/i.test(p.textContent)
  ));
  if (desc) desc.className = 'product-details-desc';

  const options = extractOptions(block);
  const optionEls = options.map(createOptionGroup);

  block.querySelectorAll('a[href*="/category/"]').forEach((link) => {
    link.closest('p')?.remove();
  });

  const addLink = block.querySelector('a[href*="/cart"]');
  if (addLink) {
    addLink.classList.add('button', 'primary');
    addLink.closest('p')?.classList.add('button-wrapper');
  }

  const actions = document.createElement('div');
  actions.className = 'product-details-actions';

  const qty = document.createElement('div');
  qty.className = 'product-details-qty';
  const minus = document.createElement('button');
  minus.type = 'button';
  minus.setAttribute('aria-label', 'Decrease quantity');
  minus.textContent = '−';
  const input = document.createElement('input');
  input.type = 'number';
  input.min = '1';
  input.value = '1';
  input.setAttribute('aria-label', 'Quantity');
  const plus = document.createElement('button');
  plus.type = 'button';
  plus.setAttribute('aria-label', 'Increase quantity');
  plus.textContent = '+';
  minus.addEventListener('click', () => {
    input.value = String(Math.max(1, Number(input.value) - 1));
  });
  plus.addEventListener('click', () => {
    input.value = String(Number(input.value) + 1);
  });
  qty.append(minus, input, plus);

  const wish = document.createElement('button');
  wish.type = 'button';
  wish.className = 'product-details-wish';
  wish.setAttribute('aria-label', 'Add to wishlist');
  wish.setAttribute('aria-pressed', 'false');
  const heart = document.createElement('span');
  heart.setAttribute('aria-hidden', 'true');
  heart.textContent = '♡';
  wish.append(heart);
  wish.addEventListener('click', () => {
    const pressed = wish.getAttribute('aria-pressed') === 'true';
    wish.setAttribute('aria-pressed', pressed ? 'false' : 'true');
  });

  if (addLink) actions.append(qty, addLink, wish);
  else actions.append(qty, wish);

  optionEls.forEach((el) => {
    if (addLink?.closest('p')) addLink.closest('p').before(el);
    else block.append(el);
  });
  if (addLink?.closest('p')) addLink.closest('p').replaceWith(actions);
  else block.append(actions);

  addLink?.addEventListener('click', (event) => {
    event.preventDefault();
    const skuMatch = document.body.innerText.match(/SKU:\s*(\S+)/i);
    addItem({
      sku: skuMatch ? skuMatch[1] : window.location.pathname.split('/').filter(Boolean).pop(),
      name: title ? title.textContent.trim() : document.title,
      price: price ? parsePrice(price.textContent) : 0,
      quantity: Math.max(1, Number(input.value) || 1),
      image: document.querySelector('.product-gallery-main img')?.src || '',
      size: selectedValue(block, 'size'),
      color: selectedValue(block, 'color'),
    });
    addLink.textContent = 'Added';
    window.dispatchEvent(new CustomEvent('mini-cart:open'));
    window.setTimeout(() => {
      addLink.textContent = 'Add to cart';
    }, 1200);
  });
}
