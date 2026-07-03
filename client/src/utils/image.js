/**
 * Optimizes Cloudinary URLs by injecting f_auto,q_auto
 * f_auto: Automatically delivers the best image format (like WebP or AVIF)
 * q_auto: Automatically adjusts compression to minimize size without visible quality loss
 */
export const optimizeImage = (url) => {
  if (!url || !url.includes('cloudinary.com')) return url;
  
  // If it already has optimization params, return as is
  if (url.includes('f_auto') || url.includes('q_auto')) return url;

  // Insert f_auto,q_auto after /upload/
  return url.replace('/upload/', '/upload/f_auto,q_auto/');
};
