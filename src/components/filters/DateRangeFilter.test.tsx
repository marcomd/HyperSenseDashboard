import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import { DateRangeFilter } from './DateRangeFilter'

describe('DateRangeFilter', () => {
  const defaultProps = {
    startDate: '',
    endDate: '',
    onStartDateChange: vi.fn(),
    onEndDateChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders start and end date inputs', () => {
      render(<DateRangeFilter {...defaultProps} />)
      expect(screen.getByLabelText('Start Date')).toBeInTheDocument()
      expect(screen.getByLabelText('End Date')).toBeInTheDocument()
    })

    it('displays current date values', () => {
      render(
        <DateRangeFilter
          {...defaultProps}
          startDate="2024-01-01"
          endDate="2024-01-31"
        />
      )
      expect(screen.getByLabelText('Start Date')).toHaveValue('2024-01-01')
      expect(screen.getByLabelText('End Date')).toHaveValue('2024-01-31')
    })

    it('renders preset buttons', () => {
      render(<DateRangeFilter {...defaultProps} />)
      expect(screen.getByRole('button', { name: '24h' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '7d' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '30d' })).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('calls onStartDateChange when start date changes', () => {
      const onStartDateChange = vi.fn()
      render(
        <DateRangeFilter {...defaultProps} onStartDateChange={onStartDateChange} />
      )

      fireEvent.change(screen.getByLabelText('Start Date'), {
        target: { value: '2024-01-15' },
      })

      expect(onStartDateChange).toHaveBeenCalledWith('2024-01-15')
    })

    it('calls onEndDateChange when end date changes', () => {
      const onEndDateChange = vi.fn()
      render(
        <DateRangeFilter {...defaultProps} onEndDateChange={onEndDateChange} />
      )

      fireEvent.change(screen.getByLabelText('End Date'), {
        target: { value: '2024-01-31' },
      })

      expect(onEndDateChange).toHaveBeenCalledWith('2024-01-31')
    })

    it('applies 24h preset when clicked', () => {
      const onStartDateChange = vi.fn()
      const onEndDateChange = vi.fn()
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-01-15T12:00:00Z'))

      render(
        <DateRangeFilter
          {...defaultProps}
          onStartDateChange={onStartDateChange}
          onEndDateChange={onEndDateChange}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: '24h' }))

      expect(onStartDateChange).toHaveBeenCalledWith('2024-01-14')
      expect(onEndDateChange).toHaveBeenCalledWith('2024-01-15')

      vi.useRealTimers()
    })

    it('applies 7d preset when clicked', () => {
      const onStartDateChange = vi.fn()
      const onEndDateChange = vi.fn()
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-01-15T12:00:00Z'))

      render(
        <DateRangeFilter
          {...defaultProps}
          onStartDateChange={onStartDateChange}
          onEndDateChange={onEndDateChange}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: '7d' }))

      expect(onStartDateChange).toHaveBeenCalledWith('2024-01-08')
      expect(onEndDateChange).toHaveBeenCalledWith('2024-01-15')

      vi.useRealTimers()
    })

    it('applies 30d preset when clicked', () => {
      const onStartDateChange = vi.fn()
      const onEndDateChange = vi.fn()
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-01-31T12:00:00Z'))

      render(
        <DateRangeFilter
          {...defaultProps}
          onStartDateChange={onStartDateChange}
          onEndDateChange={onEndDateChange}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: '30d' }))

      expect(onStartDateChange).toHaveBeenCalledWith('2024-01-01')
      expect(onEndDateChange).toHaveBeenCalledWith('2024-01-31')

      vi.useRealTimers()
    })
  })

  describe('reset', () => {
    it('shows reset button when dates are set', () => {
      render(
        <DateRangeFilter
          {...defaultProps}
          startDate="2024-01-01"
          endDate="2024-01-31"
        />
      )
      expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument()
    })

    it('hides reset button when no dates are set', () => {
      render(<DateRangeFilter {...defaultProps} />)
      expect(screen.queryByRole('button', { name: 'Reset' })).not.toBeInTheDocument()
    })

    it('clears both dates when reset is clicked', () => {
      const onStartDateChange = vi.fn()
      const onEndDateChange = vi.fn()
      render(
        <DateRangeFilter
          {...defaultProps}
          startDate="2024-01-01"
          endDate="2024-01-31"
          onStartDateChange={onStartDateChange}
          onEndDateChange={onEndDateChange}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: 'Reset' }))

      expect(onStartDateChange).toHaveBeenCalledWith('')
      expect(onEndDateChange).toHaveBeenCalledWith('')
    })
  })
})
