# Changelog

All notable changes to the HyperSense Dashboard will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
