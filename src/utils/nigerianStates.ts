// Mirrors be/app/Support/NigerianStates.php — keep the two lists in sync.
export const NIGERIAN_STATES: { slug: string; name: string }[] = [
  { slug: 'abia', name: 'Abia' },
  { slug: 'adamawa', name: 'Adamawa' },
  { slug: 'akwa-ibom', name: 'Akwa Ibom' },
  { slug: 'anambra', name: 'Anambra' },
  { slug: 'bauchi', name: 'Bauchi' },
  { slug: 'bayelsa', name: 'Bayelsa' },
  { slug: 'benue', name: 'Benue' },
  { slug: 'borno', name: 'Borno' },
  { slug: 'cross-river', name: 'Cross River' },
  { slug: 'delta', name: 'Delta' },
  { slug: 'ebonyi', name: 'Ebonyi' },
  { slug: 'edo', name: 'Edo' },
  { slug: 'ekiti', name: 'Ekiti' },
  { slug: 'enugu', name: 'Enugu' },
  { slug: 'fct-abuja', name: 'FCT Abuja' },
  { slug: 'gombe', name: 'Gombe' },
  { slug: 'imo', name: 'Imo' },
  { slug: 'jigawa', name: 'Jigawa' },
  { slug: 'kaduna', name: 'Kaduna' },
  { slug: 'kano', name: 'Kano' },
  { slug: 'katsina', name: 'Katsina' },
  { slug: 'kebbi', name: 'Kebbi' },
  { slug: 'kogi', name: 'Kogi' },
  { slug: 'kwara', name: 'Kwara' },
  { slug: 'lagos', name: 'Lagos' },
  { slug: 'nasarawa', name: 'Nasarawa' },
  { slug: 'niger', name: 'Niger' },
  { slug: 'ogun', name: 'Ogun' },
  { slug: 'ondo', name: 'Ondo' },
  { slug: 'osun', name: 'Osun' },
  { slug: 'oyo', name: 'Oyo' },
  { slug: 'plateau', name: 'Plateau' },
  { slug: 'rivers', name: 'Rivers' },
  { slug: 'sokoto', name: 'Sokoto' },
  { slug: 'taraba', name: 'Taraba' },
  { slug: 'yobe', name: 'Yobe' },
  { slug: 'zamfara', name: 'Zamfara' },
];

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
