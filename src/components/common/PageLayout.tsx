import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'

interface PageLayoutProps {
  title: string
  subtitle?: string
  children: React.ReactNode
}

/**
 * Layout wrapper for subpages (not the Dashboard).
 * Provides consistent header/footer via AppLayout plus page title and back link.
 */
export function PageLayout({ title, subtitle, children }: PageLayoutProps) {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {subtitle && <p className="text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {children}
      </div>
    </AppLayout>
  )
}
