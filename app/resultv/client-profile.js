'use client';

import Script from 'next/script';
import { useRouter } from 'next/navigation';

export default function ClientProfile({ user }) {
  const router = useRouter();
  async function handleLogout() {

    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    try{
      if (window.liff && window.liff.isLoggedIn()) {
        window.liff.logout();
      }
    }catch{}
      

    router.replace('/testloginv');
  }

  return (
    <>
      <Script
        src="https://static.line-scdn.net/liff/edge/versions/2.22.3/sdk.js"
        strategy="afterInteractive"
      />

      <h2>Login</h2>

      <p><b>Email:</b> {user.email}</p>
      <p><b>Name:</b> {user.firstname} {user.lastname}</p>

      <button onClick={handleLogout}>
        Logout
      </button>
    </>
  );
}
