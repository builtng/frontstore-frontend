export function formatOsmCategory(categoryValue: string | null | undefined): string {
  if (!categoryValue) return 'Business';
  return categoryValue
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
