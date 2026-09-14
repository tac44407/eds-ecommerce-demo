function formatPrice(value) {
  const amount = Number(String(value).replace(/[^0-9.]/g, ''));
  if (!amount) return value || '';
  return `$${amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2)}`;
}

/**
 * Builds one Figma-style product card. Home and PLP both use this.
 * @param {{ path: string, name: string, price: string, image: string, subtext?: string }} product
 * @returns {HTMLAnchorElement}
 */
export default function createProductTeaser(product) {
  const link = document.createElement('a');
  link.className = 'product-teaser';
  link.href = product.path || '#';

  const media = document.createElement('div');
  media.className = 'product-teaser-media';
  const img = document.createElement('img');
  img.src = product.image || '';
  img.alt = product.name || '';
  img.loading = 'lazy';
  media.append(img);

  const body = document.createElement('div');
  body.className = 'product-teaser-body';
  const name = document.createElement('p');
  name.className = 'product-teaser-name';
  name.textContent = product.name || '';
  body.append(name);
  if (product.subtext) {
    const sub = document.createElement('p');
    sub.className = 'product-teaser-subtext';
    sub.textContent = product.subtext;
    body.append(sub);
  }
  const price = document.createElement('p');
  price.className = 'product-teaser-price';
  price.textContent = formatPrice(product.price);
  body.append(price);

  link.append(media, body);
  return link;
}
