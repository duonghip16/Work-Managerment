"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  emailVerified: boolean
}

interface AuthContextType {
  user: User | null
  accessToken: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  refreshToken: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Auto refresh token
  useEffect(() => {
    const initAuth = async () => {
      const success = await refreshToken()
      if (!success) {
        setIsLoading(false)
      }
    }
    initAuth()
  }, [])

  // Auto refresh token every 14 minutes
  useEffect(() => {
    if (accessToken) {
      const interval = setInterval(() => {
        refreshToken()
      }, 14 * 60 * 1000) // 14 minutes

      return () => clearInterval(interval)
    }
  }, [accessToken])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        setAccessToken(data.accessToken)
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Có lỗi xảy ra, vui lòng thử lại' }
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      })

      const data = await response.json()

      if (response.ok) {
        // In development, show verification link
        if (data.verificationLink) {
          const shouldVerify = window.confirm(
            `Đăng ký thành công!\n\nTrong môi trường development, nhấn OK để tự động xác thực email.`
          )
          if (shouldVerify) {
            window.open(data.verificationLink, '_blank')
          }
        }
        return { success: true, message: data.message }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Có lỗi xảy ra, vui lòng thử lại' }
    }
  }

  const logout = () => {
    setUser(null)
    setAccessToken(null)
    // Clear refresh token cookie
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  }

  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setAccessToken(data.accessToken)
        setIsLoading(false)
        return true
      } else {
        setUser(null)
        setAccessToken(null)
        setIsLoading(false)
        return false
      }
    } catch (error) {
      setUser(null)
      setAccessToken(null)
      setIsLoading(false)
      return false
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      isLoading,
      login,
      register,
      logout,
      refreshToken
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}