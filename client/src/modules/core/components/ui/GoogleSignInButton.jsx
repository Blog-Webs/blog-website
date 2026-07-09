import { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Loads the Google Identity Services script once and renders the official button.
// Uses popup ux_mode so it works correctly on all deployment domains (including
// custom domains like httptechnex.online) without needing redirect URI config.
const GoogleSignInButton = ({ onSuccess }) => {
  const buttonRef = useRef(null);
  const { loginWithGoogle } = useAuth();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    const initGoogle = () => {
      if (!window.google || !buttonRef.current || !isMounted.current) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        // 'popup' mode works on every domain with no extra redirect URI setup.
        // 'redirect' mode requires the exact domain to be listed in Google Cloud
        // Console → Authorized redirect URIs which breaks on custom domains.
        ux_mode: 'popup',
        callback: async (response) => {
          if (!isMounted.current) return;
          try {
            const user = await loginWithGoogle(response.credential);
            onSuccess?.(user);
          } catch (err) {
            console.error('Google sign-in failed:', err);
          }
        },
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'filled_black',
        size: 'large',
        shape: 'pill',
        text: 'signin_with',
        logo_alignment: 'left',
      });
    };

    if (window.google) {
      initGoogle();
    } else {
      // Avoid adding duplicate script tags if this component re-renders
      const existingScript = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );
      if (existingScript) {
        existingScript.addEventListener('load', initGoogle);
      } else {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = initGoogle;
        document.body.appendChild(script);
      }
    }

    return () => {
      isMounted.current = false;
    };
  }, [loginWithGoogle, onSuccess]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <div className="text-xs px-3 py-2 rounded-lg border" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
        Set VITE_GOOGLE_CLIENT_ID in client/.env to enable Google Sign-In.
      </div>
    );
  }

  return <div ref={buttonRef} />;
};

export default GoogleSignInButton;
