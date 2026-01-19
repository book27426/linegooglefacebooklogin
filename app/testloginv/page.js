'use client'

import Script from "next/script";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from 'firebase/auth'
import { useAuth } from './AuthContext'
import { useRouter } from 'next/navigation'

const firebaseConfig = {
  apiKey: "AIzaSyA1EAzdL9dV1GlBPTav6CtGu6Sde34nyVg",
  authDomain: "test-1e84c.firebaseapp.com",
  projectId: "test-1e84c",
  storageBucket: "test-1e84c.firebasestorage.app",
  messagingSenderId: "328279961324",
  appId: "1:328279961324:web:913e7bc471a8253ad7bfc9",
  measurementId: "G-ZJYQKHX5XV"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function Page() {
  const router = useRouter()
  const { refreshUser } = useAuth()
  async function linelogin() {
    if (!window.liff) return;

    await window.liff.init({ liffId: "2008832546-imfGfnFj" });

    if (!window.liff.isLoggedIn()) {
      window.liff.login({ scope: "profile openid email" });
      return;
    }

    const idToken = liff.getIDToken();
    console.log('LINE ID TOKEN:', idToken)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'line.com',
        token: idToken,
      }),
    })
    
    if (!res.ok) throw new Error('LINE login failed')
    router.push('/resultv')
  }

  async function googlelogin() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const idToken = result._tokenResponse.idToken;
    const gUser = result.user;
    const fullname = gUser.displayName.split(" ");
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: result._tokenResponse.providerId,
        token: idToken,
        firstname: fullname[0],
        lastname: fullname[1],
        email: gUser.email,
      }),
    })
    if (!res.ok) throw new Error('Google login failed')
    
    await refreshUser()
    router.push('/resultv')
  }

  async function facebooklogin() {
    const provider = new FacebookAuthProvider();
    provider.addScope("email");
    provider.addScope("public_profile");

    const result = await signInWithPopup(auth, provider)
    const accessToken = result._tokenResponse.idToken
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'facebook.com',
        token: accessToken,
      }),
    })

    if (!res.ok) throw new Error('Facebook login failed')

    router.push('/resultv')
  }

  return (
    <>
      <Script
        src="https://static.line-scdn.net/liff/edge/versions/2.22.3/sdk.js"
        strategy="afterInteractive"
      />
      <h2>Login</h2>
        <>
          <button onClick={linelogin}>Login with LINE</button>
          <button onClick={googlelogin}>Login with Google</button>
          <button onClick={facebooklogin}>Login with Facebook</button>
        </>
    </>
  );
}
