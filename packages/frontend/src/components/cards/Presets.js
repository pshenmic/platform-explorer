import './Presets.scss'

// segmented range chips for CardHead's right slot: options=[{label}], value=index, onChange(i)
export default function Presets ({ options, value, onChange, className = '' }) {
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
