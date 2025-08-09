import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/components/AuthProvider'
import AuthButton from '@/components/AuthButton'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Free Image Tools - No Limits, No Sign Up',
  description: 'Professional image compression, resizing, and conversion tools. 100% free, no registration required.',
  keywords: 'image compressor, free image tools, image resizer, format converter, no registration',
  openGraph: {
    title: 'Free Image Tools - No Limits',
    description: 'The only image tools you need. No limits, no sign up, no BS.',
    url: 'https://tools.ai-autosite.com',
    siteName: 'Free Image Tools',
    locale: 'en_US',
    type: 'website',
  },
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
          {/* Navigation Bar */}
          <nav className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                {/* Left side - Logo and navigation */}
                <div className="flex items-center space-x-8">
                  <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                    Image Tools
                  </Link>
                  <div className="hidden md:flex space-x-6">
                    <Link 
                      href="/compress" 
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Compress
                    </Link>
                    <span className="text-gray-400 cursor-not-allowed">
                      Resize (Soon)
                    </span>
                    <span className="text-gray-400 cursor-not-allowed">
                      Convert (Soon)
                    </span>
                  </div>
                </div>
                
                {/* Right side - Auth Button */}
                <div className="flex items-center">
                  <AuthButton />
                </div>
              </div>
            </div>
          </nav>
          
          {/* Main Content */}
          <main className="min-h-screen">
            {children}
          </main>
          
          {/* Footer */}
          <footer className="bg-gray-50 border-t border-gray-200 mt-20">
            <div className="max-w-7xl mx-auto px-4 py-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="text-gray-600 text-sm mb-4 md:mb-0">
                  © 2024 Free Image Tools. All rights reserved.
                </div>
                <div className="flex space-x-6 text-sm">
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    Privacy Policy
                  </a>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    Terms of Service
                  </a>
                  <a href="mailto:support@ai-autosite.com" className="text-gray-600 hover:text-gray-900">
                    Contact
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  )
}