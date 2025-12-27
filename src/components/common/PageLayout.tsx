import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { useHealth } from '@/hooks/useApi'

interface PageLayoutProps {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export function PageLayout({ title, subtitle, children }: PageLayoutProps) {
  const { data: healthData } = useHealth()

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Header
        wsStatus="not-needed"
        paperTrading={healthData?.environment !== 'production'}
        tradingAllowed={true}
      />
      <main className="flex-1">
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
      </main>
    </div>
  )
}
