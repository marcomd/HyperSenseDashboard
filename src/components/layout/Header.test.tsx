import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import { Header } from './Header'

describe('Header', () => {
  it('renders the HyperSense title', () => {
    render(<Header wsConnected={true} paperTrading={false} tradingAllowed={true} />)
    expect(screen.getByText('HyperSense')).toBeInTheDocument()
    expect(screen.getByText('Autonomous Trading Agent')).toBeInTheDocument()
  })

  describe('Paper Trading Badge', () => {
    it('shows Paper Trading badge when paperTrading is true', () => {
      render(<Header wsConnected={true} paperTrading={true} tradingAllowed={true} />)
      expect(screen.getByText('Paper Trading')).toBeInTheDocument()
    })

    it('hides Paper Trading badge when paperTrading is false', () => {
      render(<Header wsConnected={true} paperTrading={false} tradingAllowed={true} />)
      expect(screen.queryByText('Paper Trading')).not.toBeInTheDocument()
    })
  })

  describe('Trading Status', () => {
    it('shows Trading Active when tradingAllowed is true', () => {
      render(<Header wsConnected={true} paperTrading={false} tradingAllowed={true} />)
      expect(screen.getByText('Trading Active')).toBeInTheDocument()
    })

    it('shows Trading Halted when tradingAllowed is false', () => {
      render(<Header wsConnected={true} paperTrading={false} tradingAllowed={false} />)
      expect(screen.getByText('Trading Halted')).toBeInTheDocument()
    })
  })

  describe('WebSocket Status', () => {
    it('shows Connected when wsConnected is true', () => {
      render(<Header wsConnected={true} paperTrading={false} tradingAllowed={true} />)
      expect(screen.getByText('Connected')).toBeInTheDocument()
    })

    it('shows Disconnected when wsConnected is false', () => {
      render(<Header wsConnected={false} paperTrading={false} tradingAllowed={true} />)
      expect(screen.getByText('Disconnected')).toBeInTheDocument()
    })

    it('shows Connected when wsStatus is connected', () => {
      render(<Header wsStatus="connected" paperTrading={false} tradingAllowed={true} />)
      expect(screen.getByText('Connected')).toBeInTheDocument()
    })

    it('shows Disconnected when wsStatus is disconnected', () => {
      render(<Header wsStatus="disconnected" paperTrading={false} tradingAllowed={true} />)
      expect(screen.getByText('Disconnected')).toBeInTheDocument()
    })

    it('shows No realtime when wsStatus is not-needed', () => {
      render(<Header wsStatus="not-needed" paperTrading={false} tradingAllowed={true} />)
      expect(screen.getByText('No realtime')).toBeInTheDocument()
    })

    it('prefers wsStatus over wsConnected when both provided', () => {
      render(<Header wsConnected={true} wsStatus="not-needed" paperTrading={false} tradingAllowed={true} />)
      expect(screen.getByText('No realtime')).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('renders navigation links', () => {
      render(<Header wsConnected={true} paperTrading={false} tradingAllowed={true} />)

      expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/')
      expect(screen.getByRole('link', { name: 'Decisions' })).toHaveAttribute('href', '/decisions')
      expect(screen.getByRole('link', { name: 'Strategies' })).toHaveAttribute('href', '/macro-strategies')
      expect(screen.getByRole('link', { name: 'Forecasts' })).toHaveAttribute('href', '/forecasts')
      expect(screen.getByRole('link', { name: 'Snapshots' })).toHaveAttribute('href', '/market-snapshots')
    })

    it('highlights active navigation link', () => {
      render(<Header wsConnected={true} paperTrading={false} tradingAllowed={true} />, {
        initialEntries: ['/decisions']
      })

      const decisionsLink = screen.getByRole('link', { name: 'Decisions' })
      expect(decisionsLink).toHaveClass('bg-accent/20')
    })
  })

  describe('Mobile Menu', () => {
    it('renders hamburger menu button', () => {
      render(<Header wsConnected={true} paperTrading={false} tradingAllowed={true} />)
      expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument()
    })

    it('toggles mobile menu when hamburger is clicked', () => {
      render(<Header wsConnected={true} paperTrading={false} tradingAllowed={true} />)

      const menuButton = screen.getByRole('button', { name: 'Open menu' })
      fireEvent.click(menuButton)

      // Mobile menu should now be open with all nav links
      const mobileNavLinks = screen.getAllByRole('link', { name: 'Dashboard' })
      expect(mobileNavLinks.length).toBeGreaterThan(1) // Desktop + mobile

      // Button should now say "Close menu"
      expect(screen.getByRole('button', { name: 'Close menu' })).toBeInTheDocument()
    })

    it('closes mobile menu when a link is clicked', () => {
      render(<Header wsConnected={true} paperTrading={false} tradingAllowed={true} />)

      // Open menu
      const menuButton = screen.getByRole('button', { name: 'Open menu' })
      fireEvent.click(menuButton)

      // Find mobile nav links (there will be duplicates - desktop and mobile)
      const decisionsLinks = screen.getAllByRole('link', { name: 'Decisions' })
      // Click the mobile one (last in list)
      fireEvent.click(decisionsLinks[decisionsLinks.length - 1])

      // Menu should close, button should say "Open menu" again
      expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument()
    })
  })
})
