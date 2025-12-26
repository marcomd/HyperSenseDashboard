# HyperSense Dashboard

Real-time trading dashboard for the HyperSense autonomous AI trading agent.

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite 7** - Build tool with HMR
- **Tailwind CSS 4** - Utility-first styling
- **Recharts** - Charting library
- **TanStack React Query** - Data fetching and caching
- **ActionCable** - WebSocket for real-time updates
- **Lucide React** - Icon library

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
│   └── client.ts           # Typed API client for all endpoints
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
│   └── layout/
│       └── Header.tsx            # App header with status indicators
├── hooks/
│   ├── useApi.ts           # React Query hooks for data fetching
│   └── useWebSocket.ts     # ActionCable WebSocket integration
├── pages/
│   └── Dashboard.tsx       # Main dashboard page
├── types/
│   └── index.ts            # TypeScript type definitions
├── App.tsx                 # Root component with QueryClient
├── main.tsx                # Entry point
└── index.css               # Tailwind CSS with custom theme
```

## Components

### Dashboard Cards

| Component | Description |
|-----------|-------------|
| `AccountSummary` | Open positions count, unrealized PnL, margin used, daily P&L |
| `MarketOverview` | Current prices, RSI, MACD, EMA signals, forecasts |
| `PositionsTable` | Open positions with entry, current price, PnL%, SL/TP |
| `EquityCurve` | Cumulative PnL chart with win rate statistics |
| `MacroStrategyCard` | Market bias (bullish/bearish/neutral), narrative, key levels |
| `DecisionLog` | Recent trading decisions with status and reasoning |
| `SystemStatus` | Health status of market data, trading cycle, macro strategy |

### Layout

| Component | Description |
|-----------|-------------|
| `Header` | App title, paper trading badge, trading status, WebSocket indicator |

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

| Type | Description |
|------|-------------|
| `market_update` | Price and indicator updates for all assets |
| `position_update` | Position opened, closed, or updated |
| `decision_update` | New trading decision created |
| `macro_strategy_update` | New macro strategy generated |
| `system_status_update` | System health changes |

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

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
