# HyperSense Dashboard

**Version 0.5.0** | Real-time trading dashboard for the [HyperSense](https://github.com/marcomd/HyperSense) autonomous AI trading agent.

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite 7** - Build tool with HMR
- **Tailwind CSS 4** - Utility-first styling
- **Recharts** - Charting library
- **TanStack React Query** - Data fetching and caching
- **ActionCable** - WebSocket for real-time updates
- **Lucide React** - Icon library
- **React Router** - Client-side routing
- **Vitest** - Unit testing framework
- **React Testing Library** - Component testing utilities
- **MSW** - Mock Service Worker for API mocking
- **Playwright** - E2E testing framework

## Getting Started

### Prerequisites

- Node.js 20+
- Backend running on http://localhost:3000

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The dashboard will be available at http://localhost:5173

### Build

```bash
npm run build
```

## Project Structure

```
src/
├── api/
│   └── client.ts                 # Typed API client for all endpoints
├── components/
│   ├── cards/
│   │   ├── AccountSummary.tsx    # Account stats (positions, PnL, margin)
│   │   ├── DecisionLog.tsx       # Recent trading decisions
│   │   ├── MacroStrategyCard.tsx # Market bias and narrative
│   │   ├── MarketOverview.tsx    # Asset prices and indicators
│   │   ├── PositionsTable.tsx    # Open positions table
│   │   └── SystemStatus.tsx      # Health status indicators
│   ├── charts/
│   │   └── EquityCurve.tsx       # Performance chart (Recharts)
│   ├── common/
│   │   ├── DataTable.tsx         # Generic data table with expand
│   │   └── PageLayout.tsx        # Page wrapper with back link
│   ├── filters/
│   │   ├── DateRangeFilter.tsx   # Date range picker with presets
│   │   ├── SymbolFilter.tsx      # Cryptocurrency symbol selector
│   │   ├── StatusFilter.tsx      # Generic status dropdown
│   │   ├── SearchFilter.tsx      # Debounced search input
│   │   ├── Pagination.tsx        # Page navigation controls
│   │   └── FilterBar.tsx         # Composite filter container
│   └── layout/
│       └── Header.tsx            # App header with navigation
├── hooks/
│   ├── useApi.ts                 # React Query hooks for data fetching
│   ├── useWebSocket.ts           # ActionCable WebSocket integration
│   ├── useFilters.ts             # Filter state management with URL sync
│   └── usePagination.ts          # Pagination state management
├── pages/
│   ├── Dashboard.tsx             # Main dashboard page
│   ├── DecisionsPage.tsx         # Trading decisions history
│   ├── MacroStrategiesPage.tsx   # Macro strategies history
│   ├── ForecastsPage.tsx         # Price forecasts history
│   ├── MarketSnapshotsPage.tsx   # Market snapshots history
│   ├── ExecutionLogsPage.tsx     # Execution logs history
│   └── NotFoundPage.tsx          # 404 page
├── types/
│   └── index.ts                  # TypeScript type definitions
├── App.tsx                       # Root component with router
├── main.tsx                      # Entry point
└── index.css                     # Tailwind CSS with custom theme
```

## Components

### Dashboard Cards

| Component           | Description                                                  |
| ------------------- | ------------------------------------------------------------ |
| `AccountSummary`    | Open positions count, unrealized PnL, margin used, daily P&L |
| `MarketOverview`    | Current prices, RSI, MACD, EMA signals, forecasts            |
| `PositionsTable`    | Open positions with entry, current price, PnL%, SL/TP        |
| `EquityCurve`       | Cumulative PnL chart with win rate statistics                |
| `MacroStrategyCard` | Market bias (bullish/bearish/neutral), narrative, key levels |
| `DecisionLog`       | Recent trading decisions with status and reasoning           |
| `SystemStatus`      | Health status of market data, trading cycle, macro strategy  |

### Layout

| Component | Description                                                                          |
| --------- | ------------------------------------------------------------------------------------ |
| `Header`  | App title, navigation menu, paper trading badge, trading status, WebSocket indicator |

### Filter Components

| Component         | Description                                                |
| ----------------- | ---------------------------------------------------------- |
| `DateRangeFilter` | Date range picker with 24h, 7d, 30d preset buttons         |
| `SymbolFilter`    | Dropdown for selecting cryptocurrency (BTC, ETH, SOL, BNB) |
| `StatusFilter`    | Generic dropdown for filtering by status/bias/operation    |
| `SearchFilter`    | Text input with 300ms debounce and clear button            |
| `Pagination`      | Page navigation with prev/next, page size selector         |
| `FilterBar`       | Composite component combining multiple filters             |

### Common Components

| Component    | Description                                                       |
| ------------ | ----------------------------------------------------------------- |
| `DataTable`  | Generic table with loading skeleton, empty state, expandable rows |
| `PageLayout` | Page wrapper with title, subtitle, back-to-dashboard link         |

## How the UI Works

### Page Types

The application has two types of pages with different data fetching strategies:

| Page Type        | Example Pages                                      | Data Strategy               |
| ---------------- | -------------------------------------------------- | --------------------------- |
| **Dashboard**    | `/` (Dashboard)                                    | Real-time WebSocket updates |
| **Detail Pages** | Decisions, Strategies, Forecasts, Market Snapshots | REST API with pagination    |

### Dashboard (Real-time)

The main Dashboard page connects to the backend via WebSocket (ActionCable) and receives live updates for:
- Market prices and indicators
- Position changes (opened, closed, updated)
- New trading decisions
- Macro strategy updates

This allows traders to monitor the system in real-time without refreshing.

### Detail Pages (Historical Data)

Detail pages display historical, paginated data fetched via REST API. They include filters (date range, symbol, status) and pagination controls. These pages **intentionally do not use WebSocket** because:
- They show historical data that doesn't change in real-time
- Pagination and filters make real-time updates impractical
- React Query handles data caching and optional polling

### Header Indicators

The header displays three status indicators:

| Indicator             | States                                                        | Description                                                            |
| --------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **Paper Trading**     | Yellow badge (shown/hidden)                                   | Indicates sandbox mode when environment is not production              |
| **Trading Status**    | Green "Trading Active" / Red "Trading Halted"                 | Reflects circuit breaker state - whether the system can execute trades |
| **Connection Status** | Green "Connected" / Red "Disconnected" / Orange "No realtime" | WebSocket connection state                                             |

#### Connection Status Explained

- **Connected** (green): WebSocket is active, receiving real-time updates (Dashboard only)
- **Disconnected** (red): WebSocket connection failed or dropped (Dashboard only)
- **No realtime** (orange): Page intentionally doesn't use WebSocket (Detail pages)

#### Trading Status Explained

The "Trading Active/Halted" indicator reflects the **circuit breaker** state from the backend:

- **Trading Active** (green): The trading engine is allowed to execute trades
- **Trading Halted** (red): The circuit breaker has stopped trading due to:
  - Maximum drawdown exceeded
  - Position limits violated
  - Other risk conditions met

The circuit breaker is a safety mechanism that automatically halts trading when risk thresholds are breached.

## Routing

The application uses React Router for client-side navigation:

| Route               | Page                | Description                            |
| ------------------- | ------------------- | -------------------------------------- |
| `/`                 | Dashboard           | Main dashboard with real-time overview |
| `/decisions`        | DecisionsPage       | Trading decisions history with filters |
| `/macro-strategies` | MacroStrategiesPage | Macro strategies history with filters  |
| `/forecasts`        | ForecastsPage       | Price forecasts history with filters   |
| `/market-snapshots` | MarketSnapshotsPage | Market snapshots history with filters  |
| `/execution-logs`   | ExecutionLogsPage   | Execution logs with status/action filters |

### Detail Pages Features

Each detail page includes:
- **Date Range Filter** - Filter by start/end date with presets
- **Symbol Filter** - Filter by cryptocurrency
- **Additional Filters** - Status, operation, timeframe (varies by page)
- **Data Table** - Sortable with expandable rows showing details
- **Pagination** - Navigate through results with configurable page size

## API Integration

The dashboard connects to the Rails backend API:

```typescript
import { api } from '@/api/client';

// Dashboard data (aggregated)
const data = await api.dashboard.getDashboard();

// Positions
const positions = await api.positions.getOpen();
const performance = await api.positions.getPerformance(30);

// Decisions
const decisions = await api.decisions.getRecent(20);

// Market data
const market = await api.marketData.getCurrent();

// Macro strategy
const strategy = await api.macroStrategies.getCurrent();
```

## Real-time Updates

The dashboard receives real-time updates via ActionCable WebSocket:

```typescript
import { useDashboardChannel } from '@/hooks/useWebSocket';

const { on, connected } = useDashboardChannel();

// Subscribe to market updates
on('market_update', (message) => {
  console.log('New prices:', message.data);
});

// Subscribe to position changes
on('position_update', (message) => {
  console.log('Position changed:', message.action, message.data);
});

// Subscribe to new decisions
on('decision_update', (message) => {
  console.log('New decision:', message.data);
});
```

### Message Types

| Type                    | Description                                |
| ----------------------- | ------------------------------------------ |
| `market_update`         | Price and indicator updates for all assets |
| `position_update`       | Position opened, closed, or updated        |
| `decision_update`       | New trading decision created               |
| `macro_strategy_update` | New macro strategy generated               |
| `system_status_update`  | System health changes                      |

## Custom Theme

The dashboard uses a dark theme with custom colors defined in `index.css`:

```css
@theme {
  --color-bullish: #22c55e;    /* Green for profits/long */
  --color-bearish: #ef4444;    /* Red for losses/short */
  --color-neutral: #94a3b8;    /* Gray for neutral */
  --color-bg-primary: #0f172a;
  --color-bg-secondary: #1e293b;
  --color-accent: #3b82f6;
}
```

## Scripts

| Command                 | Description                      |
| ----------------------- | -------------------------------- |
| `npm run dev`           | Start development server         |
| `npm run build`         | Build for production             |
| `npm run preview`       | Preview production build         |
| `npm run lint`          | Run ESLint                       |
| `npm test`              | Run unit tests in watch mode     |
| `npm run test:ui`       | Run unit tests with Vitest UI    |
| `npm run test:run`      | Run unit tests once (CI mode)    |
| `npm run test:coverage` | Run unit tests with coverage     |
| `npm run test:e2e`      | Run E2E tests                    |
| `npm run test:e2e:ui`   | Run E2E tests with Playwright UI |
| `npm run test:all`      | Run all tests (unit + E2E)       |

## Testing

### Unit Tests (Vitest + React Testing Library)

Unit tests are located alongside components with `.test.tsx` extension:

```
src/
├── components/
│   └── cards/
│       ├── AccountSummary.tsx
│       └── AccountSummary.test.tsx
├── test/
│   ├── setup.ts          # Test setup (MSW, mocks)
│   ├── test-utils.tsx    # Custom render with providers (MemoryRouter)
│   ├── factories/        # Test data factories
│   │   ├── position.ts
│   │   ├── decision.ts
│   │   ├── macroStrategy.ts
│   │   ├── marketData.ts
│   │   ├── dashboard.ts
│   │   ├── forecast.ts
│   │   └── marketSnapshot.ts
│   └── mocks/
│       ├── handlers.ts   # MSW API mock handlers
│       └── server.ts     # MSW server setup
```

Run unit tests:

```bash
npm test              # Watch mode
npm run test:run      # Single run
npm run test:coverage # With coverage report
```

### E2E Tests (Playwright)

E2E tests are in the `e2e/` directory:

```
e2e/
└── dashboard.spec.ts   # Dashboard happy path tests
```

Run E2E tests:

```bash
npx playwright install chromium  # First time setup
npm run test:e2e                 # Run tests
npm run test:e2e:ui              # Run with Playwright UI
```

### Writing Tests

**Component test example:**

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { AccountSummary } from './AccountSummary'
import { createAccountSummary } from '@/test/factories'

describe('AccountSummary', () => {
  it('displays account metrics', () => {
    render(<AccountSummary account={createAccountSummary()} />)
    expect(screen.getByText('Account Summary')).toBeInTheDocument()
  })
})
```

**Test data factories** create realistic typed data:

```typescript
import { createPosition, createDecision } from '@/test/factories'

const position = createPosition({ symbol: 'ETH', direction: 'short' })
const decision = createDecision({ operation: 'open', confidence: 0.9 })
```
