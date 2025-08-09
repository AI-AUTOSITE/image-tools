
// ===================================
// 8. app/layout.tsx - 更新版（認証プロバイダー追加）
// ===================================
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/components/AuthProvider'
import AuthButton from '@/components/AuthButton'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Free Image Tools - No Limits, No Sign Up',
  description: 'Professional image compression, resizing, and conversion tools. 100% free, no registration required.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <nav className="bg-white shadow-sm sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-8">
                  <a href="/" className="text-xl font-bold text-gray-900">
                    Image Tools
                  </a>
                  <div className="hidden md:flex space-x-6">
                    <a href="/compress" className="text-gray-600 hover:text-gray-900">
                      Compress
                    </a>
                    <a href="/resize" className="text-gray-400 cursor-not-allowed">
                      Resize (Soon)
                    </a>
                    <a href="/convert" className="text-gray-400 cursor-not-allowed">
                      Convert (Soon)
                    </a>
                  </div>
                </div>
                <AuthButton />
              </div>
            </div>
          </nav>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
