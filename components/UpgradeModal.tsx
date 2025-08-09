
// ===================================
// 7. components/UpgradeModal.tsx - アップグレードモーダル
// ===================================
'use client'

import { X, Crown, Check } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const { user, signInWithGoogle } = useAuth()

  if (!isOpen) return null

  const features = [
    'Unlimited image processing',
    'Batch processing (100+ files)',
    'Priority processing queue',
    'Advanced compression settings',
    'API access (coming soon)',
    'Premium support',
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Upgrade to Premium
          </h2>
          <p className="text-gray-600">
            Unlock unlimited processing and advanced features
          </p>
        </div>

        <div className="mb-6">
          <div className="text-center mb-4">
            <span className="text-4xl font-bold text-gray-900">$4.99</span>
            <span className="text-gray-600">/month</span>
          </div>
          
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {user ? (
          <button
            onClick={() => {
              // TODO: Stripe決済へリダイレクト
              alert('Stripe payment coming soon!')
            }}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors"
          >
            Upgrade Now
          </button>
        ) : (
          <button
            onClick={signInWithGoogle}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors"
          >
            Sign in to Upgrade
          </button>
        )}

        <p className="text-xs text-center text-gray-500 mt-4">
          Cancel anytime. No questions asked.
        </p>
      </div>
    </div>
  )
}
