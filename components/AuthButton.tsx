
// ===================================
// 6. components/AuthButton.tsx - 認証ボタン
// ===================================
'use client'

import { useAuth } from '@/components/AuthProvider'
import { LogIn, LogOut, Crown, User } from 'lucide-react'
import { useState } from 'react'

export default function AuthButton() {
  const { user, loading, signInWithGoogle, signOut, isPremium } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)

  if (loading) {
    return (
      <div className="h-10 w-32 bg-gray-200 animate-pulse rounded-lg"></div>
    )
  }

  if (!user) {
    return (
      <button
        onClick={signInWithGoogle}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <LogIn className="w-4 h-4" />
        <span>Sign in with Google</span>
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <User className="w-4 h-4" />
        <span className="max-w-[150px] truncate">{user.email}</span>
        {isPremium && (
          <Crown className="w-4 h-4 text-yellow-500" />
        )}
      </button>

      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            {isPremium && (
              <div className="px-4 py-2 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">Premium Member</span>
                </div>
              </div>
            )}
            <button
              onClick={() => {
                signOut()
                setShowDropdown(false)
              }}
              className="flex items-center space-x-2 px-4 py-2 w-full text-left hover:bg-gray-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
