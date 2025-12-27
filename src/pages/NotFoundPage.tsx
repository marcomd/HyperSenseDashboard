import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Page Not Found</h1>
        <p className="text-slate-400 mb-8">The page you're looking for doesn't exist.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/80 transition-colors"
        >
          <Home className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
