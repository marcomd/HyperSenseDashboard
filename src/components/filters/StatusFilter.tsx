import { Filter } from 'lucide-react'

interface StatusOption {
  value: string
  label: string
}

interface StatusFilterProps {
  value: string
  onChange: (value: string) => void
  options: StatusOption[]
  label: string
}

export function StatusFilter({
  value,
  onChange,
  options,
  label,
}: StatusFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Filter className="w-4 h-4 text-slate-400" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-bg-tertiary border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-accent cursor-pointer"
      >
        <option value="">All {label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
