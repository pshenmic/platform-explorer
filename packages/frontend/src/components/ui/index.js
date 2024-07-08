import './Switcher.scss'

function Switcher ({ options = [], onChange }) {
  if (!options?.length) return <></>
  if (!onChange) onChange = () => {}

  return (
    <div className={'Switcher'} onChange={e => onChange(e.target.value)}>
        {options.map((option, i) => (
            <label className={'Switcher__Option'} key={i}>
                <input type="radio" name="switcher" value={option.title} defaultChecked={i === 0 || option.selected}/>
                <span className={'Switcher__OptionTitle'}>{option.title}</span>
            </label>
        ))}
    </div>
  )
}

export {
  Switcher
}
