import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { AccountSummary } from './AccountSummary'
import { createAccountSummary } from '@/test/factories'

describe('AccountSummary', () => {
  it('renders the Account Summary title', () => {
    render(<AccountSummary account={createAccountSummary()} />)
    expect(screen.getByText('Account Summary')).toBeInTheDocument()
  })

  it('displays open positions count', () => {
    render(<AccountSummary account={createAccountSummary({ open_positions_count: 5 })} />)
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('Open Positions')).toBeInTheDocument()
  })

  describe('Unrealized PnL', () => {
    it('displays positive PnL with plus sign and green color', () => {
      render(<AccountSummary account={createAccountSummary({ total_unrealized_pnl: 150.5 })} />)
      const pnlElement = screen.getByText('+$150.50')
      expect(pnlElement).toBeInTheDocument()
      expect(pnlElement).toHaveClass('text-green-400')
    })

    it('displays negative PnL without plus sign and red color', () => {
      render(<AccountSummary account={createAccountSummary({ total_unrealized_pnl: -50.25 })} />)
      const pnlElement = screen.getByText('$-50.25')
      expect(pnlElement).toBeInTheDocument()
      expect(pnlElement).toHaveClass('text-red-400')
    })

    it('displays zero PnL as positive', () => {
      render(<AccountSummary account={createAccountSummary({ total_unrealized_pnl: 0 })} />)
      const pnlElement = screen.getByText('+$0.00')
      expect(pnlElement).toBeInTheDocument()
      expect(pnlElement).toHaveClass('text-green-400')
    })
  })

  it('displays margin used', () => {
    render(<AccountSummary account={createAccountSummary({ total_margin_used: 980.0 })} />)
    expect(screen.getByText('$980.00')).toBeInTheDocument()
    expect(screen.getByText('Margin Used')).toBeInTheDocument()
  })

  describe("Today's P&L", () => {
    it('displays positive daily PnL with plus sign', () => {
      render(<AccountSummary account={createAccountSummary({ realized_pnl_today: 75.5 })} />)
      const pnlElement = screen.getByText('+$75.50')
      expect(pnlElement).toBeInTheDocument()
      expect(pnlElement).toHaveClass('text-green-400')
    })

    it('displays negative daily PnL without plus sign', () => {
      render(<AccountSummary account={createAccountSummary({ realized_pnl_today: -25.0 })} />)
      const pnlElement = screen.getByText('$-25.00')
      expect(pnlElement).toBeInTheDocument()
      expect(pnlElement).toHaveClass('text-red-400')
    })
  })

  describe('Circuit Breaker', () => {
    it('shows Circuit Breaker Active badge when trading not allowed', () => {
      render(
        <AccountSummary
          account={createAccountSummary({
            circuit_breaker: {
              trading_allowed: false,
              daily_loss: -500,
              consecutive_losses: 3,
            },
          })}
        />
      )
      expect(screen.getByText('Circuit Breaker Active')).toBeInTheDocument()
    })

    it('hides Circuit Breaker badge when trading is allowed', () => {
      render(
        <AccountSummary
          account={createAccountSummary({
            circuit_breaker: {
              trading_allowed: true,
              daily_loss: null,
              consecutive_losses: null,
            },
          })}
        />
      )
      expect(screen.queryByText('Circuit Breaker Active')).not.toBeInTheDocument()
    })

    it('displays daily loss in circuit breaker info', () => {
      render(
        <AccountSummary
          account={createAccountSummary({
            circuit_breaker: {
              trading_allowed: true,
              daily_loss: -150.5,
              consecutive_losses: null,
            },
          })}
        />
      )
      expect(screen.getByText('Daily Loss:')).toBeInTheDocument()
      expect(screen.getByText('-$150.50')).toBeInTheDocument()
    })

    it('displays consecutive losses in circuit breaker info', () => {
      render(
        <AccountSummary
          account={createAccountSummary({
            circuit_breaker: {
              trading_allowed: true,
              daily_loss: null,
              consecutive_losses: 3,
            },
          })}
        />
      )
      expect(screen.getByText('Consecutive Losses:')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })
  })
})
