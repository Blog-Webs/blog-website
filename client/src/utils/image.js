/**
 * Optimizes Cloudinary URLs by injecting f_auto, q_auto, and an optional width cap.
 *
 *  f_auto  → serves AVIF/WebP automatically based on browser Accept header
 *  q_auto  → automatic quality compression (60–80% size reduction vs raw PNG/JPEG)
 *  w_<n>   → resize to at most <n>px wide server-side; never send more pixels than needed
 *
 * @param {string} url      - Original Cloudinary URL
 * @param {number} [width]  - Max display width in px (e.g. 800 for cards, 1200 for hero)
 * @returns {string}        - Optimized URL
 */
export const optimizeImage = (url, width) => {
  if (!url || !url.includes('cloudinary.com')) return url;

  // Build the transformation string
  const transforms = ['f_auto', 'q_auto'];
  if (width && Number.isFinite(width) && width > 0) {
    transforms.push(`w_${Math.round(width)}`);
  }
  const transformStr = transforms.join(',');

  // If it already has all the transforms we'd add, skip mutation
  const alreadyOptimized = transforms.every((t) => url.includes(t));
  if (alreadyOptimized) return url;

  // Strip any previous optimization block after /upload/ so we don't double-up
  // e.g.  /upload/f_auto,q_auto/v1/  →  /upload/
  const cleaned = url.replace(/\/upload\/[^/]*(?:f_auto|q_auto|w_\d+)[^/]*\//, '/upload/');

  // Inject the transform block right after /upload/
  return cleaned.replace('/upload/', `/upload/${transformStr}/`);
};
