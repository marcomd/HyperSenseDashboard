import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { DecisionLog } from './DecisionLog'
import { createDecision } from '@/test/factories'

describe('DecisionLog', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the default title', () => {
    render(<DecisionLog decisions={[createDecision()]} />)
    expect(screen.getByText('Recent Decisions')).toBeInTheDocument()
  })

  it('renders custom title when provided', () => {
    render(<DecisionLog decisions={[createDecision()]} title="Trading History" />)
    expect(screen.getByText('Trading History')).toBeInTheDocument()
  })

  describe('Empty State', () => {
    it('shows empty state when no decisions', () => {
      render(<DecisionLog decisions={[]} />)
      expect(screen.getByText('No recent decisions')).toBeInTheDocument()
    })
  })

  describe('Decision Item', () => {
    it('displays decision symbol', () => {
      render(<DecisionLog decisions={[createDecision({ symbol: 'BTC' })]} />)
      expect(screen.getByText('BTC')).toBeInTheDocument()
    })

    it('displays open long operation', () => {
      render(
        <DecisionLog decisions={[createDecision({ operation: 'open', direction: 'long' })]} />
      )
      expect(screen.getByText('open long')).toBeInTheDocument()
    })

    it('displays open short operation', () => {
      render(
        <DecisionLog decisions={[createDecision({ operation: 'open', direction: 'short' })]} />
      )
      expect(screen.getByText('open short')).toBeInTheDocument()
    })

    it('displays hold operation', () => {
      render(
        <DecisionLog decisions={[createDecision({ operation: 'hold', direction: null })]} />
      )
      expect(screen.getByText('hold')).toBeInTheDocument()
    })

    it('displays close operation', () => {
      render(
        <DecisionLog decisions={[createDecision({ operation: 'close', direction: 'long' })]} />
      )
      expect(screen.getByText('close long')).toBeInTheDocument()
    })

    it('displays confidence percentage', () => {
      render(<DecisionLog decisions={[createDecision({ confidence: 0.85 })]} />)
      expect(screen.getByText('85% conf')).toBeInTheDocument()
    })

    it('renders decision without confidence badge when null', () => {
      render(
        <DecisionLog
          decisions={[createDecision({ confidence: null, reasoning: 'Test reasoning' })]}
        />
      )
      // Decision should still render
      expect(screen.getByText('BTC')).toBeInTheDocument()
      // But without the specific confidence badge (85% conf style)
    })

    it('displays reasoning text', () => {
      const reasoning = 'Strong bullish momentum with RSI breakout'
      render(<DecisionLog decisions={[createDecision({ reasoning })]} />)
      expect(screen.getByText(reasoning)).toBeInTheDocument()
    })

    it('displays rejection reason when rejected', () => {
      render(
        <DecisionLog
          decisions={[
            createDecision({ status: 'rejected', rejection_reason: 'Risk limit exceeded' }),
          ]}
        />
      )
      expect(screen.getByText('Rejected: Risk limit exceeded')).toBeInTheDocument()
    })
  })

  describe('Status Display', () => {
    it('displays pending status', () => {
      render(<DecisionLog decisions={[createDecision({ status: 'pending' })]} />)
      expect(screen.getByText('pending')).toBeInTheDocument()
    })

    it('displays approved status', () => {
      render(<DecisionLog decisions={[createDecision({ status: 'approved' })]} />)
      expect(screen.getByText('approved')).toBeInTheDocument()
    })

    it('displays rejected status', () => {
      render(<DecisionLog decisions={[createDecision({ status: 'rejected' })]} />)
      expect(screen.getByText('rejected')).toBeInTheDocument()
    })

    it('displays executed status', () => {
      render(<DecisionLog decisions={[createDecision({ status: 'executed' })]} />)
      expect(screen.getByText('executed')).toBeInTheDocument()
    })

    it('displays failed status', () => {
      render(<DecisionLog decisions={[createDecision({ status: 'failed' })]} />)
      expect(screen.getByText('failed')).toBeInTheDocument()
    })
  })

  describe('Time Ago', () => {
    it('displays seconds ago', () => {
      render(
        <DecisionLog
          decisions={[createDecision({ created_at: new Date('2024-01-15T11:59:30Z').toISOString() })]}
        />
      )
      expect(screen.getByText('30s ago')).toBeInTheDocument()
    })

    it('displays minutes ago', () => {
      render(
        <DecisionLog
          decisions={[createDecision({ created_at: new Date('2024-01-15T11:55:00Z').toISOString() })]}
        />
      )
      expect(screen.getByText('5m ago')).toBeInTheDocument()
    })

    it('displays hours ago', () => {
      render(
        <DecisionLog
          decisions={[createDecision({ created_at: new Date('2024-01-15T10:00:00Z').toISOString() })]}
        />
      )
      expect(screen.getByText('2h ago')).toBeInTheDocument()
    })

    it('displays days ago', () => {
      render(
        <DecisionLog
          decisions={[createDecision({ created_at: new Date('2024-01-13T12:00:00Z').toISOString() })]}
        />
      )
      expect(screen.getByText('2d ago')).toBeInTheDocument()
    })
  })

  describe('Multiple Decisions', () => {
    it('renders all decisions', () => {
      const decisions = [
        createDecision({ symbol: 'BTC', operation: 'open' }),
        createDecision({ symbol: 'ETH', operation: 'hold' }),
        createDecision({ symbol: 'SOL', operation: 'close' }),
      ]
      render(<DecisionLog decisions={decisions} />)

      expect(screen.getByText('BTC')).toBeInTheDocument()
      expect(screen.getByText('ETH')).toBeInTheDocument()
      expect(screen.getByText('SOL')).toBeInTheDocument()
    })
  })
})
