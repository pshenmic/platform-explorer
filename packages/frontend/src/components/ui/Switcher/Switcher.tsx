import './Switcher.scss'

interface SwitcherOption {
  title: string
}

interface SwitcherProps {
  options?: SwitcherOption[]
  onChange?: (value: string) => void
  defaultValue?: string
}

function Switcher ({ options = [], onChange, defaultValue }: SwitcherProps) {
  if (!options?.length) return <></>
  if (!onChange) onChange = () => {}

  return (
    <div className={'Switcher'} onChange={e => onChange((e.target as HTMLInputElement).value)}>
      {options.map((option, i) => (
        <label className={'Switcher__Option'} key={i}>
          <input
            type={'radio'}
            name={'switcher'}
            value={option.title}
            defaultChecked={String(defaultValue).toLowerCase() === String(option.title).toLowerCase() || (!defaultValue && i === 0)}/>
          <span className={'Switcher__OptionTitle'}>{option.title}</span>
        </label>
      ))}
    </div>
  )
}

export {
  Switcher
}
