/**
 * Optimizes Cloudinary URLs by injecting transformation parameters.
 *
 * @param {string} url - Original Cloudinary URL
 * @param {number|Object} options - Max display width in px OR options object
 * @param {number} [options.width] - Max display width in px
 * @param {string} [options.format='auto'] - Image format (e.g. 'auto', 'jpg', 'webp')
 * @param {string|number} [options.quality='auto'] - Compression quality (e.g. 'auto', 'low', 30)
 * @returns {string} - Optimized URL
 */
export const optimizeImage = (url, options) => {
  if (!url || !url.includes('cloudinary.com')) return url;

  // Backwards compatibility for optimizeImage(url, width)
  if (typeof options === 'number') {
    options = { width: options };
  } else if (!options) {
    options = {};
  }

  const { width, format = 'auto', quality = 'auto' } = options;

  // Build the transformation string
  const transforms = [];
  if (format) transforms.push(`f_${format}`);
  if (quality) transforms.push(`q_${quality}`);
  if (width && Number.isFinite(width) && width > 0) {
    transforms.push(`w_${Math.round(width)}`);
  }
  const transformStr = transforms.join(',');

  // If it already has all the transforms we'd add, skip mutation
  const alreadyOptimized = transforms.every((t) => url.includes(t));
  if (alreadyOptimized) return url;

  // Strip any previous optimization block after /upload/ so we don't double-up
  const cleaned = url.replace(/\/upload\/[^/]*(?:f_[^/,]+|q_[^/,]+|w_\d+)[^/]*\//, '/upload/');

  // Inject the transform block right after /upload/
  return cleaned.replace('/upload/', `/upload/${transformStr}/`);
};
