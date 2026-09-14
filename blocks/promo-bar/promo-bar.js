const DISMISS_KEY = 'aurelia-promo-dismissed';

function hide(block) {
  const wrap = block.closest('.promo-bar-wrapper') || block.parentElement;
  wrap?.remove();
}

export default async function decorate(block) {
  if (sessionStorage.getItem(DISMISS_KEY)) {
    hide(block);
    return;
  }

  const resp = await fetch('/promo.plain.html');
  if (!resp.ok) {
    hide(block);
    return;
  }

  const tmp = document.createElement('div');
  tmp.innerHTML = await resp.text();
  const source = tmp.querySelector('p, h1, h2') || tmp;
  const copy = document.createElement('p');
  copy.className = 'promo-bar-copy';
  copy.append(...source.childNodes);

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'promo-bar-close';
  close.setAttribute('aria-label', 'Dismiss offer');
  close.textContent = '×';
  close.addEventListener('click', () => {
    sessionStorage.setItem(DISMISS_KEY, 'true');
    hide(block);
  });

  block.replaceChildren(copy, close);
}
