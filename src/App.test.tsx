import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { AppRoutes } from './App'

describe('App Router', () => {
  describe('Dashboard route', () => {
    it('renders Dashboard at root path', () => {
      render(<AppRoutes />, { initialEntries: ['/'] })
      // Dashboard shows loading state initially, which confirms route works
      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument()
    })
  })

  describe('Forecasts route', () => {
    it('renders ForecastsPage at /forecasts', () => {
      render(<AppRoutes />, { initialEntries: ['/forecasts'] })
      expect(screen.getByRole('heading', { name: /forecasts/i })).toBeInTheDocument()
    })
  })

  describe('Market Snapshots route', () => {
    it('renders MarketSnapshotsPage at /market-snapshots', () => {
      render(<AppRoutes />, { initialEntries: ['/market-snapshots'] })
      expect(screen.getByRole('heading', { name: /market snapshots/i })).toBeInTheDocument()
    })
  })

  describe('Macro Strategies route', () => {
    it('renders MacroStrategiesPage at /macro-strategies', () => {
      render(<AppRoutes />, { initialEntries: ['/macro-strategies'] })
      expect(screen.getByRole('heading', { name: /macro strategies/i })).toBeInTheDocument()
    })
  })

  describe('Decisions route', () => {
    it('renders DecisionsPage at /decisions', () => {
      render(<AppRoutes />, { initialEntries: ['/decisions'] })
      expect(screen.getByRole('heading', { name: /trading decisions/i })).toBeInTheDocument()
    })
  })

  describe('404 handling', () => {
    it('renders NotFound for unknown routes', () => {
      render(<AppRoutes />, { initialEntries: ['/unknown-route'] })
      expect(screen.getByText('Page Not Found')).toBeInTheDocument()
    })
  })
})
