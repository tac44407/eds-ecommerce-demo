export default function decorate(block) {
  const picture = block.querySelector('picture');
  const heading = block.querySelector('h1');
  const link = block.querySelector('a');
  const tagline = [...block.querySelectorAll('p')].find((p) => !p.querySelector('picture, a'));

  if (picture) {
    const img = picture.querySelector('img');
    if (img) {
      img.loading = 'eager';
      img.fetchPriority = 'high';
    }
  }

  if (link) {
    link.classList.add('button', 'primary');
    const wrap = document.createElement('p');
    wrap.className = 'button-wrapper';
    link.replaceWith(wrap);
    wrap.append(link);
  }

  const copy = document.createElement('div');
  copy.className = 'hero-copy';
  if (heading) copy.append(heading);
  if (tagline) copy.append(tagline);
  const cta = block.querySelector('.button-wrapper');
  if (cta) copy.append(cta);

  block.replaceChildren(...[picture, copy].filter(Boolean));
}
