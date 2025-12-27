import { useState, useEffect, useCallback } from 'react'
import { Search, X } from 'lucide-react'

interface SearchFilterProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchFilter({
  value,
  onChange,
  placeholder = 'Search...',
}: SearchFilterProps) {
  const [localValue, setLocalValue] = useState(value)

  // Sync local value with external value
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Debounced onChange
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [localValue, value, onChange])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value)
  }

  const handleClear = useCallback(() => {
    setLocalValue('')
    onChange('')
  }, [onChange])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear()
    }
  }

  return (
    <div className="relative flex items-center">
      <Search className="absolute left-2 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        type="search"
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="bg-bg-tertiary border border-slate-600 rounded pl-8 pr-8 py-1 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent w-48"
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-2 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
