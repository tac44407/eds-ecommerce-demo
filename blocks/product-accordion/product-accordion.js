export default function decorate(block) {
  const items = [...block.children];
  items.forEach((row, index) => {
    const headingCell = row.children[0];
    const bodyCell = row.children[1];
    if (!headingCell || !bodyCell) return;

    row.className = 'product-accordion-item';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'product-accordion-trigger';
    button.setAttribute('aria-expanded', index === 0 ? 'true' : 'false');
    const heading = headingCell.querySelector('h2, h3, p') || headingCell;
    button.append(heading.textContent.trim());
    headingCell.replaceWith(button);

    bodyCell.className = 'product-accordion-panel';
    if (index !== 0) bodyCell.hidden = true;

    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', open ? 'false' : 'true');
      bodyCell.hidden = open;
    });
  });
}
