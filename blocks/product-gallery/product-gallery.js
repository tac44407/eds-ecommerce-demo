export default function decorate(block) {
  const pictures = [...block.querySelectorAll('picture')];
  if (!pictures.length) return;

  const main = document.createElement('div');
  main.className = 'product-gallery-main';

  const thumbs = document.createElement('ul');
  thumbs.className = 'product-gallery-thumbs';

  const show = (picture, button) => {
    main.replaceChildren(picture.cloneNode(true));
    thumbs.querySelectorAll('button').forEach((btn) => btn.removeAttribute('aria-current'));
    button.setAttribute('aria-current', 'true');
  };

  pictures.forEach((picture, index) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `View image ${index + 1}`);
    button.append(picture.cloneNode(true));
    button.addEventListener('click', () => show(picture, button));
    item.append(button);
    thumbs.append(item);
    if (index === 0) show(picture, button);
  });

  block.replaceChildren(thumbs, main);
}
