import type { WithClassName } from '../../types/common'
import './Presets.css'

interface PresetOption {
  label: string
}

interface PresetsProps extends WithClassName {
  options: PresetOption[]
  value: number
  onChange: (index: number) => void
}

// segmented range chips for CardHead's right slot: options=[{label}], value=index, onChange(i)
export default function Presets ({ options, value, onChange, className = '' }: PresetsProps) {
  return (
    <div className={`Presets ${className}`.trim()} role={'group'}>
      {options.map((o, i) => (
        <button
          key={o.label}
          type={'button'}
          className={`Presets__Chip ${i === value ? 'Presets__Chip--active' : ''}`.trim()}
          aria-pressed={i === value}
          onClick={() => onChange(i)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
