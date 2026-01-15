'use client'

import Script from "next/script";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { FacebookAuthProvider } from "firebase/auth";
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
  const { login } = useAuth()

  async function linelogin() {
    if (!window.liff) return;

    await window.liff.init({ liffId: "2008832546-imfGfnFj" });

    if (!window.liff.isLoggedIn()) {
      window.liff.login({ scope: "profile openid email" });
      return;
    }

    const profile = await window.liff.getProfile();
    const idToken = window.liff.getDecodedIDToken();
    const userData = {
      provider: "line.com",
      userId: profile.userId,
      firstname: profile.displayName,
      lastname: "@line",
      iss: idToken.iss,
      email: idToken?.email,
      sub: idToken?.sub
    }
    login(userData)
    router.push('/result')
  }

  async function googlelogin() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const gUser = result.user;
    const fullname = gUser.displayName.split(" ");
    const userData = {
      provider: result._tokenResponse.providerId,
      userId: gUser.uid,
      firstname: fullname[0],
      lastname: fullname[1],
      email: gUser.email,
      sub: gUser.uid,
    }
    login(userData)
    router.push('/result')
  }

  async function facebooklogin() {
    const provider = new FacebookAuthProvider();
    provider.addScope("email");
    provider.addScope("public_profile");

    const result = await signInWithPopup(auth, provider)
    const gUser = result.user
    const fullname = gUser.displayName.split(" ")
    const userData = {
      provider: "facebook.com",
      userId: gUser.uid,
      firstname: fullname[0],
      lastname: fullname[1],
      email: gUser.email,
      sub: gUser.uid,
    }
    login(userData)
    router.push('/result')
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
