export default function decorate(block) {
  const link = block.querySelector('a[href*="/category/"]');
  if (!link) return;
  link.classList.add('button', 'primary');
  link.closest('p')?.classList.add('button-wrapper');
}
