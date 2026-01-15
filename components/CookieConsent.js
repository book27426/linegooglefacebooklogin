'use client';

import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = document.cookie
      .split('; ')
      .find(row => row.startsWith('cookie_consent='));

    if (!consent) {
      setVisible(true);
    }
  }, []);

  function acceptCookies() {
    document.cookie =
      'cookie_consent=accepted; path=/; max-age=31536000; SameSite=Lax';
    setVisible(false);
  }

  function rejectCookies() {
    document.cookie =
      'cookie_consent=rejected; path=/; max-age=31536000; SameSite=Lax';
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div style={styles.banner}>
      <p>
        We use cookies for essential functionality and analytics.
      </p>
      <div>
        <button onClick={acceptCookies}>Accept</button>
        <button onClick={rejectCookies}>Reject</button>
      </div>
    </div>
  );
}

const styles = {
  banner: {
    position: 'fixed',
    bottom: 0,
    width: '100%',
    background: '#222',
    color: '#fff',
    padding: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    zIndex: 1000,
  },
};
