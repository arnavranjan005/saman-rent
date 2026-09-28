import { IMG } from '../data/mock';

// Local asset map for `seed://` image references (Phase 2 seed data).
// Phase 4/11 replace these with Cloudinary URLs; this map is then deleted.
const LOCAL = {
  'banner.jpg': require('../assets/vendors/banner.jpg'),
  'avatar2.jpg': require('../assets/vendors/avatar2.jpg'),
  'djhero.jpg': require('../assets/vendors/djhero.jpg'),
  'dj1.jpg': require('../assets/vendors/dj1.jpg'),
  'dj2.jpg': require('../assets/vendors/dj2.jpg'),
  'dj3.jpg': require('../assets/vendors/dj3.jpg'),
  'dj4.jpg': require('../assets/vendors/dj4.jpg'),
  'tent.jpg': require('../assets/vendors/tent.jpg'),
  'bmw.jpg': require('../assets/vendors/bmw.jpg'),
};

const FALLBACK_IMG = require('../assets/vendors/dj1.jpg');

/**
 * Resolve an API image reference to an <Image> source.
 * - RN require() numbers (legacy mock) pass through.
 * - https:// URLs (Cloudinary) become { uri }.
 * - seed://assets/vendors/<file> resolve to the local asset map.
 */
export function resolveImage(ref) {
  if (ref == null) return FALLBACK_IMG;
  if (typeof ref === 'number') return ref;
  if (typeof ref !== 'string') return FALLBACK_IMG;
  if (ref.startsWith('http://') || ref.startsWith('https://')) return { uri: ref };
  const match = ref.match(/^seed:\/\/assets\/vendors\/(.+)$/);
  if (match && LOCAL[match[1]]) return LOCAL[match[1]];
  return FALLBACK_IMG;
}

export { IMG };
