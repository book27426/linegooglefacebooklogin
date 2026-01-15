'use client'
import { useRouter } from 'next/navigation'
import Script from "next/script";
import { useEffect, useState } from 'react'
import { useAuth } from '../testlogin/AuthContext'

export default function Page() {
    const router = useRouter()
    const { user, logout, loading } = useAuth()

    useEffect(() => {
    if (!loading && !user) {
            router.replace('/testlogin')
        }
    }, [loading, user, router])
     if (loading || !user) return null

    function handleLogout() {
        if (user?.provider === "line.com") {
            window.liff.logout();
        }
        logout()
        router.replace('/testlogin')
    }

    return (
    <>
      <Script
        src="https://static.line-scdn.net/liff/edge/versions/2.22.3/sdk.js"
        strategy="afterInteractive"
      />

      <h2>Login</h2>

        <>
          <p><b>User ID:</b> {user.userId}</p>
          <p><b>Name:</b> {user.displayName}</p>
          <p><b>Status:</b> {user.statusMessage || "No status"}</p>
          <p><b>Email:</b> {user.email || "Not available"}</p>
          <button onClick={handleLogout}>
            Logout
          </button>
        </>
    </>
  );
}