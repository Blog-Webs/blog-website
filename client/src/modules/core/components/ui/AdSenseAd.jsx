import React, { useEffect } from 'react';

/**
 * Reusable Google AdSense Ad Unit Component.
 * Ensures ads are properly pushed and rendered during React SPA navigations.
 *
 * @param {Object} props
 * @param {string} props.adClient - The Google AdSense Publisher ID (e.g. ca-pub-XXXXXXXXXXXXXXXX)
 * @param {string} props.adSlot - The Ad Unit Slot ID from your AdSense Console
 * @param {string} [props.adFormat='auto'] - Ad format: 'auto', 'fluid', 'rectangle', etc.
 * @param {string} [props.fullWidthResponsive='true'] - Responsive layout setting
 * @param {Object} [props.style={ display: 'block' }] - Inline styles for wrapper
 */
const AdSenseAd = ({
  adClient,
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = 'true',
  style = { display: 'block' }
}) => {
  useEffect(() => {
    try {
      // Execute AdSense script initialization for this ad unit
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      // Fail silently in development, or if script is blocked by AdBlocker
      console.warn('[AdSense] Failed to load ad unit:', error.message);
    }
  }, [adSlot]); // Re-trigger only if the ad slot changes

  return (
    <div className="adsense-container" style={{ margin: '20px 0', minHeight: '100px' }}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive}
      />
    </div>
  );
};

export default AdSenseAd;
