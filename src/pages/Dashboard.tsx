import { RefreshCw, AlertCircle } from 'lucide-react';
import {
  AppLayout,
  AccountSummary,
  PositionsTable,
  MacroStrategyCard,
  DecisionLog,
  MarketOverview,
  SystemStatus,
  EquityCurve,
  CostSummaryCard,
  RiskProfileSelector,
  TradingModeSelector,
} from '@/components';
import { useDashboard, usePerformance, useSwitchRiskProfile, useSwitchTradingMode } from '@/hooks/useApi';

export function Dashboard() {
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch,
    wsConnected,
  } = useDashboard();

  const { data: performanceData, isLoading: perfLoading } = usePerformance(30);
  const { switchProfile, isLoading: profileSwitching } = useSwitchRiskProfile();
  const { switchMode, isLoading: modeSwitching } = useSwitchTradingMode();

  // Derive WebSocket status for the layout
  const wsStatus = wsConnected ? 'connected' : 'disconnected';

  if (isLoading) {
    return (
      <AppLayout wsStatus={wsStatus}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-accent animate-spin mx-auto mb-4" />
            <div className="text-slate-400">Loading dashboard...</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !dashboardData) {
    return (
      <AppLayout wsStatus={wsStatus}>
        <div className="flex-1 flex items-center justify-center">
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
      </AppLayout>
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
    risk_profile,
    trading_mode,
  } = dashboardData;

  return (
    <AppLayout wsStatus={wsStatus} onRefresh={refetch}>
      <div className="p-6">
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

            {/* Right Column: Risk Profile, Costs, Strategy & Status */}
            <div className="space-y-6">
              <RiskProfileSelector
                profile={risk_profile}
                onSwitch={switchProfile}
                isLoading={profileSwitching}
              />
              <TradingModeSelector
                tradingMode={trading_mode}
                onSwitch={switchMode}
                isLoading={modeSwitching}
              />
              <CostSummaryCard costs={cost_summary} />
              <MacroStrategyCard strategy={macro_strategy} />
              <SystemStatus status={system_status} volatilityInfo={account.volatility_info} />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
