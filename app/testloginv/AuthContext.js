'use client'

import { createContext, useContext, useEffect, useState } from 'react'
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchUser() {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
      })

      if (!res.ok) {
        setUser(null)
        return
      }
      const data = await res.json()
      setUser(data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  async function logout() {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout,
        refreshUser: fetchUser, // 🔑 KEY FIX
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
