import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { ToastContainer } from '@/components/Toast'
import { CartDrawer } from '@/components/CartDrawer'
import { CookieBanner } from '@/components/CookieBanner'
import '../styles.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'BTH BountyTradinghiTech – Investment Platform' },
      { name: 'description', content: 'Next-generation crypto and investment platform with algorithmic trading, DeFi yield farming, and institutional-grade portfolio management.' },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=IBM+Plex+Mono:wght@400;500;600&family=Manrope:wght@400;500;600;700&display=swap',
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body style={{ background: '#050810', color: '#e2e8f0', fontFamily: 'Manrope, sans-serif' }}>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              {children}
              <CartDrawer />
              <ToastContainer />
              <CookieBanner />
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
        <Scripts />
      </body>
    </html>
  )
}
