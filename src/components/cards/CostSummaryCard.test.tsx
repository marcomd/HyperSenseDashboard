import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CostSummaryCard } from './CostSummaryCard';
import type { CostSummary } from '@/types';

const mockProfitableCosts: CostSummary = {
  period: 'today',
  trading_fees: 5.2345,
  llm_costs: 0.1234,
  server_cost_daily: 0.5,
  total_costs: 5.86,
  gross_realized_pnl: 150.0,
  net_realized_pnl: 144.77,
  llm_provider: 'anthropic',
  llm_model: 'claude-sonnet-4-5',
};

const mockUnprofitableCosts: CostSummary = {
  period: 'today',
  trading_fees: 5.2345,
  llm_costs: 0.1234,
  server_cost_daily: 0.5,
  total_costs: 5.86,
  gross_realized_pnl: -50.0,
  net_realized_pnl: -55.23,
  llm_provider: 'anthropic',
  llm_model: 'claude-sonnet-4-5',
};

describe('CostSummaryCard', () => {
  it('renders cost summary title', () => {
    render(<CostSummaryCard costs={mockProfitableCosts} />);
    expect(screen.getByText('Cost Summary')).toBeInTheDocument();
  });

  it('displays period label', () => {
    render(<CostSummaryCard costs={mockProfitableCosts} />);
    expect(screen.getByText('today')).toBeInTheDocument();
  });

  it('shows net P&L for profitable period', () => {
    render(<CostSummaryCard costs={mockProfitableCosts} />);
    expect(screen.getByText('Net Realized P&L')).toBeInTheDocument();
    expect(screen.getByText('+$144.77')).toBeInTheDocument();
  });

  it('shows negative P&L correctly', () => {
    render(<CostSummaryCard costs={mockUnprofitableCosts} />);
    // Negative values display as $-55.23 (dollar sign before negative)
    expect(screen.getByText('$-55.23')).toBeInTheDocument();
  });

  it('displays trading fees', () => {
    render(<CostSummaryCard costs={mockProfitableCosts} />);
    expect(screen.getByText('Trading Fees')).toBeInTheDocument();
    expect(screen.getByText('$5.2345')).toBeInTheDocument();
  });

  it('displays LLM costs with provider info', () => {
    render(<CostSummaryCard costs={mockProfitableCosts} />);
    expect(screen.getByText('LLM Costs')).toBeInTheDocument();
    expect(screen.getByText('anthropic / claude-sonnet-4-5')).toBeInTheDocument();
  });

  it('displays server costs', () => {
    render(<CostSummaryCard costs={mockProfitableCosts} />);
    expect(screen.getByText('Server (daily)')).toBeInTheDocument();
    expect(screen.getByText('$0.50')).toBeInTheDocument();
  });

  it('displays total costs', () => {
    render(<CostSummaryCard costs={mockProfitableCosts} />);
    expect(screen.getByText('Total Costs')).toBeInTheDocument();
    expect(screen.getByText('$5.86')).toBeInTheDocument();
  });

  it('shows gross P&L and fees breakdown', () => {
    render(<CostSummaryCard costs={mockProfitableCosts} />);
    expect(screen.getByText(/Gross: \$150.00/)).toBeInTheDocument();
    expect(screen.getByText(/Fees: \$5.2345/)).toBeInTheDocument();
  });
});
