// ===================================
// 5. components/AuthProvider.tsx - 認証プロバイダー
// ===================================
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  isPremium: boolean
  checkPremiumStatus: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  isPremium: false,
  checkPremiumStatus: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPremium, setIsPremium] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        await checkPremiumStatus()
      }
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await checkPremiumStatus()
      } else {
        setIsPremium(false)
      }
      router.refresh()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const checkPremiumStatus = async () => {
    if (!user) {
      setIsPremium(false)
      return
    }

    const { data, error } = await supabase
      .from('users')
      .select('is_premium, premium_expires_at')
      .eq('id', user.id)
      .single()

    if (data && !error) {
      const now = new Date()
      const isActive = data.is_premium && 
        (!data.premium_expires_at || new Date(data.premium_expires_at) > now)
      setIsPremium(isActive)
    }
  }

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsPremium(false)
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signInWithGoogle,
      signOut,
      isPremium,
      checkPremiumStatus,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}