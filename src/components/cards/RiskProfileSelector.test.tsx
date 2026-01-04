import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import { RiskProfileSelector } from './RiskProfileSelector'
import { createRiskProfile } from '@/test/factories'

describe('RiskProfileSelector', () => {
  const mockOnSwitch = vi.fn()

  beforeEach(() => {
    mockOnSwitch.mockClear()
  })

  describe('rendering', () => {
    it('renders the Risk Profile header', () => {
      const profile = createRiskProfile({ name: 'moderate' })
      render(<RiskProfileSelector profile={profile} onSwitch={mockOnSwitch} />)

      expect(screen.getByText('Risk Profile')).toBeInTheDocument()
    })

    it('renders all three profile buttons', () => {
      const profile = createRiskProfile({ name: 'moderate' })
      render(<RiskProfileSelector profile={profile} onSwitch={mockOnSwitch} />)

      expect(screen.getByRole('button', { name: /cautious/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /moderate/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /fearless/i })).toBeInTheDocument()
    })

    it('displays profile descriptions', () => {
      const profile = createRiskProfile({ name: 'moderate' })
      render(<RiskProfileSelector profile={profile} onSwitch={mockOnSwitch} />)

      expect(screen.getByText('Conservative trading')).toBeInTheDocument()
      expect(screen.getByText('Balanced approach')).toBeInTheDocument()
      expect(screen.getByText('Aggressive trading')).toBeInTheDocument()
    })

    it('shows parameters summary', () => {
      const profile = createRiskProfile({ name: 'moderate' })
      render(<RiskProfileSelector profile={profile} onSwitch={mockOnSwitch} />)

      expect(screen.getByText('Active Parameters')).toBeInTheDocument()
      expect(screen.getByText('Confidence')).toBeInTheDocument()
      expect(screen.getByText('Leverage')).toBeInTheDocument()
      expect(screen.getByText('Max Pos')).toBeInTheDocument()
    })
  })

  describe('active profile display', () => {
    it('displays moderate profile parameters correctly', () => {
      const profile = createRiskProfile({ name: 'moderate' })
      render(<RiskProfileSelector profile={profile} onSwitch={mockOnSwitch} />)

      // Moderate: min_confidence: 0.6, default_leverage: 3, max_open_positions: 5
      expect(screen.getByText('60%')).toBeInTheDocument()
      expect(screen.getByText('3x')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
      // RSI: 30-70
      expect(screen.getByText('30')).toBeInTheDocument()
      expect(screen.getByText('70')).toBeInTheDocument()
    })

    it('displays cautious profile parameters correctly', () => {
      const profile = createRiskProfile({ name: 'cautious' })
      render(<RiskProfileSelector profile={profile} onSwitch={mockOnSwitch} />)

      // Cautious: min_confidence: 0.7, default_leverage: 2, max_open_positions: 3
      expect(screen.getByText('70%')).toBeInTheDocument()
      expect(screen.getByText('2x')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
      // RSI: 35-65
      expect(screen.getByText('35')).toBeInTheDocument()
      expect(screen.getByText('65')).toBeInTheDocument()
    })

    it('displays fearless profile parameters correctly', () => {
      const profile = createRiskProfile({ name: 'fearless' })
      render(<RiskProfileSelector profile={profile} onSwitch={mockOnSwitch} />)

      // Fearless: min_confidence: 0.5, default_leverage: 5, max_open_positions: 7
      expect(screen.getByText('50%')).toBeInTheDocument()
      expect(screen.getByText('5x')).toBeInTheDocument()
      expect(screen.getByText('7')).toBeInTheDocument()
      // RSI: 25-75
      expect(screen.getByText('25')).toBeInTheDocument()
      expect(screen.getByText('75')).toBeInTheDocument()
    })
  })

  describe('button interactions', () => {
    it('calls onSwitch with "cautious" when Cautious button is clicked', () => {
      const profile = createRiskProfile({ name: 'moderate' })
      render(<RiskProfileSelector profile={profile} onSwitch={mockOnSwitch} />)

      fireEvent.click(screen.getByRole('button', { name: /cautious/i }))
      expect(mockOnSwitch).toHaveBeenCalledWith('cautious')
    })

    it('calls onSwitch with "fearless" when Fearless button is clicked', () => {
      const profile = createRiskProfile({ name: 'moderate' })
      render(<RiskProfileSelector profile={profile} onSwitch={mockOnSwitch} />)

      fireEvent.click(screen.getByRole('button', { name: /fearless/i }))
      expect(mockOnSwitch).toHaveBeenCalledWith('fearless')
    })

    it('does not call onSwitch when active profile button is clicked', () => {
      const profile = createRiskProfile({ name: 'moderate' })
      render(<RiskProfileSelector profile={profile} onSwitch={mockOnSwitch} />)

      const moderateButton = screen.getByRole('button', { name: /moderate/i })
      fireEvent.click(moderateButton)
      expect(mockOnSwitch).not.toHaveBeenCalled()
    })

    it('disables the active profile button', () => {
      const profile = createRiskProfile({ name: 'moderate' })
      render(<RiskProfileSelector profile={profile} onSwitch={mockOnSwitch} />)

      expect(screen.getByRole('button', { name: /moderate/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /cautious/i })).not.toBeDisabled()
      expect(screen.getByRole('button', { name: /fearless/i })).not.toBeDisabled()
    })
  })

  describe('loading state', () => {
    it('disables all buttons when loading', () => {
      const profile = createRiskProfile({ name: 'moderate' })
      render(<RiskProfileSelector profile={profile} onSwitch={mockOnSwitch} isLoading={true} />)

      expect(screen.getByRole('button', { name: /cautious/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /moderate/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /fearless/i })).toBeDisabled()
    })

    it('does not call onSwitch when buttons are clicked while loading', () => {
      const profile = createRiskProfile({ name: 'moderate' })
      render(<RiskProfileSelector profile={profile} onSwitch={mockOnSwitch} isLoading={true} />)

      fireEvent.click(screen.getByRole('button', { name: /cautious/i }))
      expect(mockOnSwitch).not.toHaveBeenCalled()
    })
  })
})
