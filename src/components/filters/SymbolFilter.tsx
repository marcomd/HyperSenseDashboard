import { Coins } from 'lucide-react'

const DEFAULT_SYMBOLS = ['BTC', 'ETH', 'SOL', 'BNB']

interface SymbolFilterProps {
  value: string
  onChange: (value: string) => void
  symbols?: string[]
}

export function SymbolFilter({
  value,
  onChange,
  symbols = DEFAULT_SYMBOLS,
}: SymbolFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Coins className="w-4 h-4 text-slate-400" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-bg-tertiary border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-accent cursor-pointer"
      >
        <option value="">All Symbols</option>
        {symbols.map((symbol) => (
          <option key={symbol} value={symbol}>
            {symbol}
          </option>
        ))}
      </select>
    </div>
  )
}
