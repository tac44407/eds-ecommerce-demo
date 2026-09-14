/**
 * Reads the author-managed catalog sheet (stand-in for a commerce API).
 * @param {{ category?: string }} [options]
 * @returns {Promise<object[]>}
 */
export default async function getProducts({ category } = {}) {
  const resp = await fetch('/catalog.json');
  if (!resp.ok) return [];
  const json = await resp.json();
  const rows = json.data || [];
  if (!category) return rows;
  const slug = category.toLowerCase();
  return rows.filter((row) => (row.category || '').toLowerCase() === slug);
}
