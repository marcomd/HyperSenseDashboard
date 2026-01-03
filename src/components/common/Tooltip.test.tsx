import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@/test/test-utils';
import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders children', () => {
    render(
      <Tooltip content="Test tooltip">
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument();
  });

  it('does not show tooltip initially', () => {
    render(
      <Tooltip content="Test tooltip">
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip on hover after delay', async () => {
    render(
      <Tooltip content="Test tooltip" delay={200}>
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);

    // Tooltip not visible before delay
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    // Advance timers past delay
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByText('Test tooltip')).toBeInTheDocument();
  });

  it('hides tooltip on mouse leave', async () => {
    render(
      <Tooltip content="Test tooltip" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.mouseLeave(button);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('cancels tooltip if mouse leaves before delay', async () => {
    render(
      <Tooltip content="Test tooltip" delay={300}>
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);

    // Leave before delay completes
    act(() => {
      vi.advanceTimersByTime(100);
    });
    fireEvent.mouseLeave(button);

    // Complete the delay
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip on focus', async () => {
    render(
      <Tooltip content="Test tooltip" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByRole('button');
    fireEvent.focus(button);

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('hides tooltip on blur', async () => {
    render(
      <Tooltip content="Test tooltip" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByRole('button');
    fireEvent.focus(button);

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.blur(button);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('renders rich content in tooltip', async () => {
    render(
      <Tooltip
        content={
          <div>
            <strong>Bold text</strong>
            <p>Paragraph</p>
          </div>
        }
        delay={0}
      >
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(screen.getByText('Bold text')).toBeInTheDocument();
    expect(screen.getByText('Paragraph')).toBeInTheDocument();
  });

  it('applies custom className', async () => {
    render(
      <Tooltip content="Test" className="custom-class" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);

    act(() => {
      vi.advanceTimersByTime(0);
    });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveClass('custom-class');
  });

  describe('Click/Tap (Touch Support)', () => {
    it('shows tooltip on click', () => {
      render(
        <Tooltip content="Test tooltip">
          <button>Tap me</button>
        </Tooltip>
      );

      const container = screen.getByRole('button').parentElement!;
      fireEvent.click(container);

      expect(screen.getByRole('tooltip')).toBeInTheDocument();
      expect(screen.getByText('Test tooltip')).toBeInTheDocument();
    });

    it('hides tooltip on second click (toggle)', () => {
      render(
        <Tooltip content="Test tooltip">
          <button>Tap me</button>
        </Tooltip>
      );

      const container = screen.getByRole('button').parentElement!;

      // First click - show
      fireEvent.click(container);
      expect(screen.getByRole('tooltip')).toBeInTheDocument();

      // Second click - hide
      fireEvent.click(container);
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('hides tooltip on click outside', () => {
      render(
        <div>
          <Tooltip content="Test tooltip">
            <button>Tap me</button>
          </Tooltip>
          <span data-testid="outside">Outside element</span>
        </div>
      );

      const container = screen.getByRole('button').parentElement!;

      // Open tooltip
      fireEvent.click(container);
      expect(screen.getByRole('tooltip')).toBeInTheDocument();

      // Click outside
      fireEvent.mouseDown(screen.getByTestId('outside'));
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('Position', () => {
    it('applies top position classes by default', async () => {
      render(
        <Tooltip content="Test" delay={0}>
          <button>Hover me</button>
        </Tooltip>
      );

      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);

      act(() => {
        vi.advanceTimersByTime(0);
      });

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('bottom-full');
    });

    it('applies bottom position classes', async () => {
      render(
        <Tooltip content="Test" position="bottom" delay={0}>
          <button>Hover me</button>
        </Tooltip>
      );

      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);

      act(() => {
        vi.advanceTimersByTime(0);
      });

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('top-full');
    });

    it('applies left position classes', async () => {
      render(
        <Tooltip content="Test" position="left" delay={0}>
          <button>Hover me</button>
        </Tooltip>
      );

      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);

      act(() => {
        vi.advanceTimersByTime(0);
      });

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('right-full');
    });

    it('applies right position classes', async () => {
      render(
        <Tooltip content="Test" position="right" delay={0}>
          <button>Hover me</button>
        </Tooltip>
      );

      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);

      act(() => {
        vi.advanceTimersByTime(0);
      });

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('left-full');
    });
  });
});
