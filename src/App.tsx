import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TradingStatusProvider } from '@/contexts/TradingStatusContext';
import { Dashboard } from '@/pages/Dashboard';
import { ForecastsPage } from '@/pages/ForecastsPage';
import { MarketSnapshotsPage } from '@/pages/MarketSnapshotsPage';
import { MacroStrategiesPage } from '@/pages/MacroStrategiesPage';
import { DecisionsPage } from '@/pages/DecisionsPage';
import { ExecutionLogsPage } from '@/pages/ExecutionLogsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10000, // 10 seconds
      refetchOnWindowFocus: true,
      retry: 2,
    },
  },
});

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/forecasts" element={<ForecastsPage />} />
      <Route path="/market-snapshots" element={<MarketSnapshotsPage />} />
      <Route path="/macro-strategies" element={<MacroStrategiesPage />} />
      <Route path="/decisions" element={<DecisionsPage />} />
      <Route path="/execution-logs" element={<ExecutionLogsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TradingStatusProvider>
          <AppRoutes />
        </TradingStatusProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
