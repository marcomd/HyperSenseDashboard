import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { VolatilityBadge } from './VolatilityBadge'

describe('VolatilityBadge', () => {
  describe('rendering volatility levels', () => {
    it('renders low volatility in green', () => {
      render(<VolatilityBadge level="low" />)
      const badge = screen.getByText('Low')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('text-green-400')
    })

    it('renders medium volatility in yellow', () => {
      render(<VolatilityBadge level="medium" />)
      const badge = screen.getByText('Medium')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('text-yellow-400')
    })

    it('renders high volatility in orange', () => {
      render(<VolatilityBadge level="high" />)
      const badge = screen.getByText('High')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('text-orange-400')
    })

    it('renders very_high volatility in red', () => {
      render(<VolatilityBadge level="very_high" />)
      const badge = screen.getByText('Very High')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('text-red-400')
    })
  })

  describe('null handling', () => {
    it('renders dash for null level', () => {
      render(<VolatilityBadge level={null} />)
      expect(screen.getByText('-')).toBeInTheDocument()
    })
  })

  describe('showLabel prop', () => {
    it('shows label by default', () => {
      render(<VolatilityBadge level="high" />)
      expect(screen.getByText('High')).toBeInTheDocument()
    })

    it('hides label when showLabel is false', () => {
      render(<VolatilityBadge level="high" showLabel={false} />)
      expect(screen.queryByText('High')).not.toBeInTheDocument()
    })
  })
})
