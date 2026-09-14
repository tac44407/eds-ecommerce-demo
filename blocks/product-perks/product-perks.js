export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.className = 'product-perks-item';
    const [title, note] = row.children;
    if (title) title.className = 'product-perks-title';
    if (note) note.className = 'product-perks-note';
  });
}
