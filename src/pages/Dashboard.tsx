import { RefreshCw, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import {
  Header,
  AccountSummary,
  PositionsTable,
  MacroStrategyCard,
  DecisionLog,
  MarketOverview,
  SystemStatus,
  EquityCurve,
  CostSummaryCard,
} from '@/components';
import { useDashboard, usePerformance, useHealth } from '@/hooks/useApi';

// Frontend version from Vite build
const FRONTEND_VERSION = __APP_VERSION__;

export function Dashboard() {
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch,
    wsConnected,
  } = useDashboard();

  const { data: performanceData, isLoading: perfLoading } = usePerformance(30);
  const { data: healthData } = useHealth();

  const backendVersion = healthData?.version ?? '...';
  const backendEnv = healthData?.environment;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-accent animate-spin mx-auto mb-4" />
          <div className="text-slate-400">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
          <div className="text-white mb-2">Failed to load dashboard</div>
          <div className="text-slate-400 text-sm mb-4">
            {error?.message || 'Unknown error'}
          </div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const {
    account,
    positions,
    market,
    macro_strategy,
    recent_decisions,
    system_status,
    cost_summary,
  } = dashboardData;

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        wsConnected={wsConnected}
        paperTrading={account.paper_trading}
        tradingAllowed={account.circuit_breaker.trading_allowed}
      />

      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Market Overview - Top of dashboard */}
          <MarketOverview market={market} recentDecisions={recent_decisions} />

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Account, Positions, Performance & Recent Decisions */}
            <div className="lg:col-span-2 space-y-6">
              <AccountSummary account={account} />
              <PositionsTable positions={positions} />
              <EquityCurve data={performanceData} isLoading={perfLoading} />
              <DecisionLog decisions={recent_decisions} />
            </div>

            {/* Right Column: Costs, Strategy & Status */}
            <div className="space-y-6">
              <CostSummaryCard costs={cost_summary} />
              <MacroStrategyCard strategy={macro_strategy} />
              <SystemStatus status={system_status} volatilityInfo={account.volatility_info} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-bg-secondary border-t border-slate-700/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-slate-400">
          <div className="flex items-center gap-3">
            <span>HyperSense</span>
            <span className="text-slate-500">|</span>
            <span>Backend v{backendVersion}</span>
            {backendEnv && backendEnv !== 'production' && (
              <>
                <span className="text-slate-500">|</span>
                <span className="text-yellow-500">{backendEnv}</span>
              </>
            )}
            <span className="text-slate-500">|</span>
            <span>Frontend v{FRONTEND_VERSION}</span>
          </div>
          <div className="flex items-center gap-4">
            <span
              className={clsx(
                'flex items-center gap-1',
                wsConnected ? 'text-green-400' : 'text-red-400'
              )}
            >
              <span
                className={clsx(
                  'w-2 h-2 rounded-full',
                  wsConnected ? 'bg-green-400' : 'bg-red-400'
                )}
              />
              {wsConnected ? 'Real-time' : 'Offline'}
            </span>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
