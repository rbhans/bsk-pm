import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold">
                <span className="text-matrix-green">[</span>
                <span className="text-white">basidekick</span>
                <span className="text-matrix-green">]</span>
              </div>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link
                to="/"
                className={`flex items-center space-x-2 hover:text-matrix-green transition-colors ${
                  location.pathname === '/' ? 'text-matrix-green' : ''
                }`}
              >
                <Home size={20} />
                <span>Dashboard</span>
              </Link>
            </nav>
          </div>
          <div className="mt-2 text-sm text-gray-400">
            projectsidekick
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-center py-4 mt-12">
        <p className="text-sm">
          <span className="text-matrix-green">[</span>
          <span>basidekick</span>
          <span className="text-matrix-green">]</span>
          {' '}© {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  )
}
