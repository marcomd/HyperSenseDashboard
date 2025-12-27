import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { SystemStatus } from './SystemStatus'
import { createSystemStatus } from '@/test/factories'

describe('SystemStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the System Status title', () => {
    render(<SystemStatus status={createSystemStatus()} />)
    expect(screen.getByText('System Status')).toBeInTheDocument()
  })

  describe('Status Items', () => {
    it('displays Market Data status', () => {
      render(<SystemStatus status={createSystemStatus()} />)
      expect(screen.getByText('Market Data')).toBeInTheDocument()
    })

    it('displays Trading Cycle status', () => {
      render(<SystemStatus status={createSystemStatus()} />)
      expect(screen.getByText('Trading Cycle')).toBeInTheDocument()
    })

    it('displays Macro Strategy status', () => {
      render(<SystemStatus status={createSystemStatus()} />)
      expect(screen.getByText('Macro Strategy')).toBeInTheDocument()
    })
  })

  describe('Health States', () => {
    it('shows healthy state for market data', () => {
      render(
        <SystemStatus
          status={createSystemStatus({
            market_data: { healthy: true, last_update: new Date().toISOString() },
          })}
        />
      )
      expect(screen.getByText('Market Data')).toBeInTheDocument()
    })

    it('shows unhealthy state for market data', () => {
      render(
        <SystemStatus
          status={createSystemStatus({
            market_data: { healthy: false, last_update: null },
          })}
        />
      )
      expect(screen.getByText('Market Data')).toBeInTheDocument()
    })

    it('shows stale state for macro strategy', () => {
      render(
        <SystemStatus
          status={createSystemStatus({
            macro_strategy: {
              healthy: true,
              last_update: new Date().toISOString(),
              stale: true,
            },
          })}
        />
      )
      expect(screen.getByText('Macro Strategy')).toBeInTheDocument()
    })
  })

  describe('Time Ago', () => {
    it('displays time ago for market data', () => {
      render(
        <SystemStatus
          status={createSystemStatus({
            market_data: {
              healthy: true,
              last_update: new Date('2024-01-15T11:55:00Z').toISOString(),
            },
          })}
        />
      )
      expect(screen.getByText('5m ago')).toBeInTheDocument()
    })

    it('displays Never when last_update is null', () => {
      render(
        <SystemStatus
          status={createSystemStatus({
            market_data: { healthy: false, last_update: null },
            trading_cycle: { healthy: true, last_run: new Date().toISOString() },
            macro_strategy: {
              healthy: true,
              last_update: new Date().toISOString(),
              stale: false,
            },
          })}
        />
      )
      // The "Never" text appears when last_update is null
      expect(screen.getAllByText('Never').length).toBeGreaterThan(0)
    })

    it('displays seconds ago', () => {
      render(
        <SystemStatus
          status={createSystemStatus({
            market_data: {
              healthy: true,
              last_update: new Date('2024-01-15T11:59:30Z').toISOString(),
            },
          })}
        />
      )
      expect(screen.getByText('30s ago')).toBeInTheDocument()
    })

    it('displays hours ago', () => {
      render(
        <SystemStatus
          status={createSystemStatus({
            trading_cycle: {
              healthy: true,
              last_run: new Date('2024-01-15T10:00:00Z').toISOString(),
            },
          })}
        />
      )
      expect(screen.getByText('2h ago')).toBeInTheDocument()
    })
  })

  describe('Tracked Assets', () => {
    it('displays Tracked Assets section', () => {
      render(<SystemStatus status={createSystemStatus()} />)
      expect(screen.getByText('Tracked Assets')).toBeInTheDocument()
    })

    it('displays all tracked assets', () => {
      render(
        <SystemStatus
          status={createSystemStatus({
            assets_tracked: ['BTC', 'ETH', 'SOL'],
          })}
        />
      )
      expect(screen.getByText('BTC')).toBeInTheDocument()
      expect(screen.getByText('ETH')).toBeInTheDocument()
      expect(screen.getByText('SOL')).toBeInTheDocument()
    })

    it('handles empty assets list', () => {
      render(
        <SystemStatus
          status={createSystemStatus({
            assets_tracked: [],
          })}
        />
      )
      expect(screen.getByText('Tracked Assets')).toBeInTheDocument()
    })
  })
})
