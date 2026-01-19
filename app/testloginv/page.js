'use client';

import Script from 'next/script';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from 'firebase/auth';
import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

const firebaseConfig = {
  apiKey: "AIzaSyA1EAzdL9dV1GlBPTav6CtGu6Sde34nyVg",
  authDomain: "test-1e84c.firebaseapp.com",
  projectId: "test-1e84c",
  storageBucket: "test-1e84c.firebasestorage.app",
  messagingSenderId: "328279961324",
  appId: "1:328279961324:web:913e7bc471a8253ad7bfc9",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const isLiffReady = () =>
  typeof window !== 'undefined' && window.liff;

export default function Page() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const liffInitialized = useRef(false);

  useEffect(() => {
    async function autoLineLogin() {
      if (!isLiffReady() || liffInitialized.current) return;

      liffInitialized.current = true;

      await window.liff.init({ liffId: '2008832546-imfGfnFj' });

      if (!window.liff.isLoggedIn()) return;

      const idToken = window.liff.getIDToken();
      if (!idToken) return;

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'line.com',
          token: idToken,
        }),
      });

      if (!res.ok) throw new Error('LINE login failed');

      router.push('/resultv');
    }

    const timer = setInterval(() => {
      if (isLiffReady()) {
        clearInterval(timer);
        autoLineLogin();
      }
    }, 100);

    return () => clearInterval(timer);
  }, [router]);

  async function linelogin() {
    if (!isLiffReady()) return;

    if (!window.liff.isLoggedIn()) {
      window.liff.login({ scope: 'profile openid email' });
    }
  }

  async function googlelogin() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    const idToken = result._tokenResponse.idToken;
    const gUser = result.user;
    const [firstname, lastname] = gUser.displayName.split(' ');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: result._tokenResponse.providerId,
        token: idToken,
        firstname,
        lastname,
        email: gUser.email,
      }),
    });

    if (!res.ok) throw new Error('Google login failed');

    await refreshUser();
    router.push('/resultv');
  }

  async function facebooklogin() {
    const provider = new FacebookAuthProvider();
    provider.addScope('email');
    provider.addScope('public_profile');

    const result = await signInWithPopup(auth, provider);
    const idToken = result._tokenResponse.idToken;

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'facebook.com',
        token: idToken,
      }),
    });

    if (!res.ok) throw new Error('Facebook login failed');

    router.push('/resultv');
  }

  return (
    <>
      <Script
        src="https://static.line-scdn.net/liff/edge/versions/2.22.3/sdk.js"
        strategy="afterInteractive"
      />

      <h2>Login</h2>

      <button onClick={linelogin}>Login with LINE</button>
      <button onClick={googlelogin}>Login with Google</button>
      <button onClick={facebooklogin}>Login with Facebook</button>
    </>
  );
}
