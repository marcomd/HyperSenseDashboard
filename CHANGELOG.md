# Changelog

All notable changes to the HyperSense Dashboard will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2025-12-29

### Added
- **Execution Logs Page** - New page to view and filter execution logs
  - `ExecutionLogsPage` - Page with DataTable, expandable rows, and filters
  - `executionLogsApi` - API client methods for execution logs
  - `useExecutionLogsList`, `useExecutionLogsStats` - React Query hooks
  - Navigation link "Exec Logs" added to header
  - Route `/execution-logs` added
- **E2E Navigation Tests** - Comprehensive Playwright tests for all routes
  - `e2e/navigation.spec.ts` - Tests navigation to all pages
  - Verifies all nav links are visible
  - Tests filter components on detail pages

### Fixed
- **MarketOverview toFixed Error** - Fixed crash when `forecast_change_pct` is a string
  - Added `Number()` conversion for type safety
  - Changed `!== null` to `!= null` to also catch undefined

## [0.3.0] - 2025-12-27

### Added

- **Favicon** - Custom Activity icon favicon matching the header branding
- **"How the UI Works" Documentation** - New README section explaining:
  - Page types (Dashboard vs Detail pages)
  - Header indicators (Paper Trading, Trading Status, Connection Status)
  - Circuit breaker / Trading Active explanation

### Changed

- **WebSocket Status Indicator** - Now supports three states:
  - `Connected` (green) - WebSocket active, receiving real-time updates
  - `Disconnected` (red) - WebSocket connection failed
  - `No realtime` (orange) - Page intentionally doesn't use WebSocket
- **Detail Pages** - Now show "No realtime" in orange instead of "Disconnected" in red
- **Page Title** - Changed from "frontend" to "HyperSense"

### Technical Details

- 290 tests across 23 test files
- Header component accepts new `wsStatus` prop with backward compatibility for `wsConnected`

## [0.2.0] - 2025-12-26

### Added

- **React Router** - Client-side routing with `react-router-dom`
  - Routes: `/`, `/forecasts`, `/market-snapshots`, `/macro-strategies`, `/decisions`
  - 404 handling with NotFoundPage
  - Active route highlighting in navigation

- **Detail Pages** - Full-featured list views with filters and pagination
  - `ForecastsPage` - Price forecasts with symbol, timeframe, date filters
  - `MarketSnapshotsPage` - Market snapshots with RSI/MACD signals, expandable indicators
  - `MacroStrategiesPage` - Strategy history with bias filter, expandable narrative
  - `DecisionsPage` - Trading decisions with status, operation, symbol filters

- **Filter Components** - Reusable filter UI components
  - `DateRangeFilter` - Date range with 24h, 7d, 30d presets
  - `SymbolFilter` - Dropdown for BTC, ETH, SOL, BNB
  - `StatusFilter` - Generic status/bias/operation dropdown
  - `SearchFilter` - Debounced text search (300ms)
  - `Pagination` - Page navigation with size selector
  - `FilterBar` - Composite filter bar component

- **Common Components**
  - `DataTable` - Generic table with loading skeleton, empty state, expandable rows
  - `PageLayout` - Page wrapper with Header navigation and back link

- **Custom Hooks**
  - `useFilters` - Filter state management with URL sync
  - `usePagination` - Pagination state with URL sync

- **API Extensions**
  - `marketSnapshotsApi.getAll()` - Fetch paginated snapshots
  - `forecastsApi.getAll()` - Fetch paginated forecasts
  - `useMarketSnapshotsList`, `useForecastsList` - React Query hooks for list views

- **Test Factories**
  - `createMarketSnapshot()` - Market snapshot factory
  - `createForecastListItem()` - Forecast list item factory

### Changed

- `Header` - Added navigation links to all pages with active state
- `PageLayout` - Now includes Header for consistent navigation across all pages

### Technical Details

- 285 tests across 23 test files
- MSW handlers updated for new endpoints
- URL-synced filter state for shareable URLs

## [0.1.0] - 2025-12-26

### Added

- **Dashboard Page** - Main dashboard with real-time updates
- **Account Summary** - Open positions count, unrealized PnL, margin used, daily P&L
- **Market Overview** - Current prices, RSI, MACD, EMA signals for all tracked assets
- **Positions Table** - Open positions with entry price, current price, PnL, SL/TP levels
- **Equity Curve** - Cumulative PnL chart with win rate and statistics using Recharts
- **Macro Strategy Card** - Current market bias, risk tolerance, narrative, key levels
- **Decision Log** - Recent trading decisions with status and reasoning
- **System Status** - Health status of market data, trading cycle, macro strategy
- **Header** - Trading status indicators (paper trading, circuit breaker, WebSocket)
- **API Client** - Typed API client for all backend endpoints
- **WebSocket Integration** - Real-time updates via ActionCable (DashboardChannel, MarketsChannel)
- **React Query Hooks** - Data fetching with automatic cache invalidation on WebSocket updates

### Technical Stack

- React 19.2 with TypeScript
- Vite 7.2 for build tooling
- Tailwind CSS 4.1 for styling
- Recharts 3.6 for charting
- TanStack React Query 5.90 for data fetching
- ActionCable for WebSocket connections
- Lucide React for icons
