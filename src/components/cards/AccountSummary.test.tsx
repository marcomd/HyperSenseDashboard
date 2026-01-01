import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@/test/test-utils'
import { AccountSummary } from './AccountSummary'
import { createAccountSummary } from '@/test/factories'
import * as TradingStatusContext from '@/contexts/TradingStatusContext'

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
      // Mock context to return tradingAllowed: false
      vi.spyOn(TradingStatusContext, 'useTradingStatus').mockReturnValue({
        tradingAllowed: false,
        paperTrading: false,
        backendVersion: '0.27.0',
        frontendVersion: '0.10.0',
        environment: 'test',
        isLoading: false,
      })

      render(
        <AccountSummary
          account={createAccountSummary({
            circuit_breaker: {
              daily_loss: -500,
              consecutive_losses: 3,
            },
          })}
        />
      )
      expect(screen.getByText('Circuit Breaker Active')).toBeInTheDocument()

      vi.restoreAllMocks()
    })

    it('hides Circuit Breaker badge when trading is allowed', () => {
      render(
        <AccountSummary
          account={createAccountSummary({
            circuit_breaker: {
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

  describe('Volatility', () => {
    it('displays Volatility label', () => {
      render(<AccountSummary account={createAccountSummary()} />)
      expect(screen.getByText('Volatility')).toBeInTheDocument()
    })

    it('displays volatility badge when volatility_info is present', () => {
      render(
        <AccountSummary
          account={createAccountSummary({
            volatility_info: {
              volatility_level: 'high',
              atr_value: 0.025,
              next_cycle_interval: 6,
              next_cycle_at: new Date().toISOString(),
              last_decision_at: new Date().toISOString(),
              intervals: { very_high: 3, high: 6, medium: 12, low: 25 },
            },
          })}
        />
      )
      expect(screen.getByText('High')).toBeInTheDocument()
    })

    it('displays dash when volatility_info is null', () => {
      render(
        <AccountSummary
          account={createAccountSummary({ volatility_info: null })}
        />
      )
      // VolatilityBadge renders "-" for null level
      const volatilitySection = screen.getByText('Volatility').closest('div')?.parentElement
      expect(volatilitySection?.textContent).toContain('-')
    })

    describe('Tooltip', () => {
      beforeEach(() => {
        vi.useFakeTimers()
      })

      afterEach(() => {
        vi.useRealTimers()
      })

      it('shows tooltip with intervals on hover', async () => {
        render(
          <AccountSummary
            account={createAccountSummary({
              volatility_info: {
                volatility_level: 'medium',
                atr_value: 0.015,
                next_cycle_interval: 12,
                next_cycle_at: new Date().toISOString(),
                last_decision_at: new Date().toISOString(),
                intervals: { very_high: 3, high: 6, medium: 12, low: 25 },
              },
            })}
          />
        )

        // Find the info icon and hover over it
        const infoIcon = document.querySelector('.cursor-help')
        expect(infoIcon).toBeInTheDocument()

        fireEvent.mouseEnter(infoIcon!)

        act(() => {
          vi.advanceTimersByTime(200)
        })

        // Tooltip content should be visible
        expect(screen.getByRole('tooltip')).toBeInTheDocument()
        expect(screen.getByText('How volatility affects trading:')).toBeInTheDocument()
        expect(screen.getByText('3 min')).toBeInTheDocument()
        expect(screen.getByText('6 min')).toBeInTheDocument()
        expect(screen.getByText('12 min')).toBeInTheDocument()
        expect(screen.getByText('25 min')).toBeInTheDocument()
      })

      it('shows fallback message when intervals not available', async () => {
        render(
          <AccountSummary
            account={createAccountSummary({
              volatility_info: {
                volatility_level: 'medium',
                atr_value: 0.015,
                next_cycle_interval: 12,
                next_cycle_at: new Date().toISOString(),
                last_decision_at: new Date().toISOString(),
                // No intervals provided
              },
            })}
          />
        )

        const infoIcon = document.querySelector('.cursor-help')
        fireEvent.mouseEnter(infoIcon!)

        act(() => {
          vi.advanceTimersByTime(200)
        })

        expect(screen.getByText('Interval data not available')).toBeInTheDocument()
      })
    })
  })
})
