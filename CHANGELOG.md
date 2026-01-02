# Changelog

All notable changes to the HyperSense Dashboard will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.15.0] - 2026-01-02

### Added
- **EMA 200 Indicator Display** - MarketOverview card now shows EMA 200 position (Above/Below)
  - Complements existing EMA 50 display for long-term trend analysis
  - Helps identify bull/bear market structure at a glance

### Changed
- **Types** - Added `ema_200`, `above_ema_200` to `MarketAsset`, `MarketOverview`, and `MarketSnapshot` interfaces

### Technical Details
- `src/components/cards/MarketOverview.tsx` - Added EMA 200 row to asset cards
- `src/types/index.ts` - Updated interfaces for EMA 200 support
- `src/test/factories/marketData.ts` - Added `ema_200` and `above_ema_200` to factories

### Supports Backend (0.33.0)

## [0.14.0] - 2026-01-02

### Added
- **Orders Page** - New page to view and filter order history
  - Filters: Symbol, Status, Side, Order Type, Date Range
  - DataTable with columns: ID, Symbol, Side, Type, Size, Price, Status, Fill%, Submitted
  - Expandable rows showing order details, fill info, and timestamps
  - Pagination support
- **Account Balances Page** - New page to view balance history and deposits/withdrawals
  - Summary card: Initial Balance, Current Balance, Deposits, Withdrawals, Calculated P&L
  - Filters: Event Type, Date Range
  - DataTable with columns: ID, Event, Balance, Change, Notes, Recorded
  - Expandable rows showing previous balance and source
  - Pagination support
- **Calculated P&L in Dashboard** - Account Summary now shows accurate P&L that excludes deposits/withdrawals
  - Tooltip explaining the formula: `Current - Initial - Deposits + Withdrawals`
  - Shows balance history breakdown in tooltip
  - Link to Account Balances page when deposits/withdrawals exist
- **New Navigation Links** - "Orders" and "Balances" added to header navigation

### Changed
- **AccountSummary Component** - Updated to display calculated_pnl instead of all_time_pnl when balance history available
- **Types** - Added `Order`, `OrderDetail`, `OrdersStats`, `AccountBalance`, `AccountBalanceDetail`, `AccountBalanceSummary` interfaces

### Technical Details
- `src/pages/OrdersPage.tsx` - Orders history page with filters and pagination
- `src/pages/AccountBalancesPage.tsx` - Balance history page with summary card
- `src/api/client.ts` - Added `ordersApi` and `accountBalancesApi`
- `src/hooks/useApi.ts` - Added orders and account balances hooks
- `src/components/cards/AccountSummary.tsx` - Calculated P&L display with tooltip

### Supports Backend (0.31.0)

## [0.13.0] - 2026-01-02

### Added
- **Exchange Balance Display** - Account Summary now shows actual balance from Hyperliquid exchange
  - "Exchange Balance" card displays `hyperliquid.balance` from API
  - Shows "-" when Hyperliquid is not configured
- **All-Time PnL Display** - New card showing total realized + unrealized profit/loss
  - Replaces "Margin Used" card with more useful PnL tracking
  - Color-coded green (profit) / red (loss)
- **Testnet Mode Indicator** - Yellow badge in Account Summary header when using testnet
  - Helps distinguish testnet from mainnet at a glance

### Changed
- **Account Summary Layout** - Updated grid to 6 columns on large screens
  - Exchange Balance, Open Positions, Unrealized PnL, All-Time P&L, Today's P&L, Volatility
- **TypeScript Types** - Added `HyperliquidAccount` interface and new `AccountSummary` fields

### Technical Details
- `src/types/index.ts` - Added `HyperliquidAccount` interface
- `src/components/cards/AccountSummary.tsx` - New Exchange Balance and All-Time PnL cards
- `src/test/factories/dashboard.ts` - Updated factories with new fields

### Supports Backend (0.29.0)

## [0.12.0] - 2026-01-02

### Added
- **Tunnel Configuration via Environment Variables** - Configurable remote access for development
  - `VITE_BACKEND_TUNNEL_URL` - Backend tunnel URL for API and WebSocket connections
  - `VITE_ALLOWED_HOSTS` - Comma-separated list of allowed hosts for Vite dev server
  - `.env.example` - Template file documenting all environment variables

### Changed
- **Dynamic Backend URL Detection** - API client and WebSocket hook now detect tunnel access
  - When not on localhost, uses `VITE_BACKEND_TUNNEL_URL` for backend connections
  - Automatically matches protocol (http/https, ws/wss) to avoid mixed content issues
- **Vite Config Refactored** - Uses `loadEnv` for environment-aware configuration
  - `allowedHosts` now configurable via environment instead of hardcoded

### Technical Details
- `vite.config.ts` - Refactored to use `defineConfig` callback with `loadEnv`
- `src/api/client.ts` - Uses `import.meta.env.VITE_BACKEND_TUNNEL_URL`
- `src/hooks/useWebSocket.ts` - Uses `import.meta.env.VITE_BACKEND_TUNNEL_URL`
- `src/vite-env.d.ts` - TypeScript declarations for new env variables

### Supports Backend (0.28.0)

## [0.11.0] - 2026-01-01

### Added
- **Trading Status Tooltip** - Info icon next to "Trading Active/Halted" badge in Header
  - Explains what Active vs Halted means
  - Shows circuit breaker trigger conditions (5% daily loss, 3 consecutive losses)
  - Mentions 24h cooldown before auto-resume

### Changed
- **Wider Tooltips** - Increased tooltip width from `max-w-xs` (320px) to `max-w-md` (448px)
  - Added `min-w-64` (256px) minimum width for better readability
  - Fixes narrow text wrapping in volatility and trading status tooltips

### Technical Details
- `Tooltip` component updated with `min-w-64 max-w-md` classes
- `Header` component imports `Tooltip` and `Info` icon

### Supports Backend (0.25.0)

## [0.10.0] - 2026-01-01

### Added
- **Unified Layout Architecture** - Centralized layout system for consistent UI across all pages
  - `AppLayout` - New layout shell component wrapping Header and Footer
  - `Footer` - New component displaying version info, environment, and connection status
  - `TradingStatusContext` - React context for shared trading status across all pages
- **Footer on All Pages** - All pages now display footer with backend/frontend versions and status

### Changed
- **Dashboard** - Now uses `AppLayout` instead of custom Header/Footer implementation
- **PageLayout** - Simplified to use `AppLayout` internally, removing duplicate Header logic
- **Paper Trading Badge** - Now reads actual `paper_trading` setting from backend health endpoint
  - Previously used incorrect logic based on environment name
- **Trading Status** - Circuit breaker status now shown correctly on all pages (was hardcoded on detail pages)
- **Connection Status** - Changed "No realtime" label to "Polling" for clarity on detail pages

### Fixed
- **Paper Trading Display Bug** - Fixed issue where Paper Trading badge showed incorrectly on non-dashboard pages
  - Root cause: PageLayout used `environment !== 'production'` instead of actual setting
  - Now all pages use `TradingStatusContext` which fetches from `/health` endpoint

### Technical Details
- New `TradingStatusProvider` wraps all routes in `App.tsx`
- `useTradingStatus` hook provides `paperTrading`, `tradingAllowed`, versions to any component
- Backend `/health` endpoint is the single source of truth for `paper_trading` and `trading_allowed`
- `TradingStatusContext` fetches only from `/health` (DRY principle - no duplicate dashboard fetch)
- Test utilities updated to include `TradingStatusProvider` wrapper

### Supports Backend (0.25.0)

## [0.9.0] - 2026-01-01

### Added
- **Tooltip Component** - Reusable tooltip component for displaying contextual help
  - `Tooltip` - Hover/focus tooltip with customizable position (top/bottom/left/right)
  - Configurable delay, supports rich content (JSX)
  - Accessible with keyboard (focus) and mouse (hover) interactions
- **Volatility Info Tooltip** - Account Summary volatility card now shows info icon
  - Hover reveals tooltip explaining how volatility affects trading reactivity
  - Shows configured intervals for each level (very_high, high, medium, low)
  - Intervals fetched from backend to avoid hardcoded values

### Technical Details
- New `VolatilityIntervals` type for interval configuration
- `VolatilityInfo` interface extended with optional `intervals` field
- Tests for Tooltip component and AccountSummary tooltip behavior

### Supports Backend (0.25.0)

## [0.8.0] - 2026-01-01

### Added
- **Volatility Display on Dashboard** - Multiple components now show ATR volatility info
  - Color-coded volatility badge (green=low, yellow=medium, orange=high, red=very_high)
  - `VolatilityBadge` - Reusable component with size prop (`sm`, `md`)
- **Market Overview Volatility** - Each coin badge shows volatility level from latest decision
- **System Status Next Cycle** - Next trading cycle timing moved here with dynamic threshold
  - Shows interval and scheduled time (e.g., "12 min (at 14:30)")
  - Trading Cycle status now uses expected interval + buffer instead of hardcoded 15min
- **Recent Decisions Volatility** - DecisionLog shows volatility badge before LLM model
- **Volatility Column on Decisions Page** - Shows volatility level after Status column
- **Volatility Filter** - New dropdown filter on Decisions page

### Changed
- **Account Summary** - Shows only volatility badge (next cycle timing moved to System Status)
  - Grid now 5 columns on large screens (was 4)
- **Decisions Page** - Simplified table columns
  - Model column moved to expandable detail section
  - ATR value moved to expandable detail section
  - Next Cycle column removed (timing now in System Status)
  - Click row expand to view reasoning, model, ATR value

### Technical Details
- New TypeScript types: `VolatilityLevel`, `VolatilityInfo`, `SystemStatusWithVolatility`
- Updated `TradingDecision`, `AccountSummary` interfaces
- `VolatilityBadge` component with size prop for compact displays
- `SystemStatus` accepts `volatilityInfo` prop for dynamic threshold calculation
- `MarketOverview` accepts `recentDecisions` prop to derive per-symbol volatility

### Supports Backend (0.24.0)

## [0.7.0] - 2025-12-31

### Changed
- **Dashboard Layout** - Improved layout for better horizontal space utilization
  - Moved "Cost Summary" card next to "Account Summary" in the top row
  - Moved "Recent Decisions" below "Performance" graph for more display space
  - Right column now contains only "Macro Strategy" and "System Status"
- **Expandable Decision Reasoning** - Decision descriptions can now be expanded
  - Truncated text (over 150 chars) shows "...show more" button
  - Click to expand/collapse full reasoning text
  - Improved readability with more horizontal space

### Technical Details
- All 303 tests passing

## [0.6.0] - 2025-12-31

### Added
- **Cost Summary Card** - New dashboard component showing cost breakdown and net P&L
  - `CostSummaryCard` - Displays trading fees, LLM costs, server costs, and net realized P&L
  - Net P&L highlighted with color coding (green for profit, red for loss)
  - Shows LLM provider and model information
  - Shows gross vs net P&L breakdown
- **Position Fees Display** - Positions now show fee information
  - `PositionsTable` displays net P&L under gross P&L for each position
  - All position responses include `fees` object with entry/exit/total fees
- **Costs API Client** - New API methods for detailed cost queries
  - `costsApi.getSummary(period)` - Get detailed cost breakdown for a period
  - `costsApi.getLLM()` - Get LLM cost details
  - `costsApi.getTrading()` - Get trading fee details
- **Cost Types** - New TypeScript interfaces for cost data
  - `CostSummary`, `PositionFees`, `DetailedCosts`, `NetPnL`
  - `TradingFeesBreakdown`, `LLMCostsBreakdown`, `ServerCostBreakdown`

### Changed
- `DashboardData` interface now includes `cost_summary` field
- `Position` interface now includes optional `fees` field
- `EquityPoint` interface now includes fee-related fields
- `PerformanceStats` interface now includes `total_fees` and `net_pnl`

### Technical Details
- 9 new tests for CostSummaryCard component
- All 303 tests passing

### Supports Backend (0.21.0)

## [0.5.0] - 2025-12-29

### Added
- **LLM Model Display** - Show which LLM model made each trading decision
  - `DecisionLog` component now displays `llm_model` badge next to confidence
  - `DecisionsPage` table now includes "Model" column
  - `TradingDecision` TypeScript interface updated with `llm_model` field
  - `MacroStrategy` TypeScript interface updated with `llm_model` field

### Technical Details
- 2 new test examples for llm_model display
- All 294 tests passing

### Support Backend (0.16.0)

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
