import './NavigationButton.scss'

function NavigationButton ({ active, name, subName, disabled, ...props }) {
  return (
    <button
      className={`NavigationButton ${disabled ? 'NavigationButton__NoActive' : ''} ${active ? 'NavigationButton__Active' : ''}`}
      disabled={disabled}
      {...props}
    >
      {name}
      {subName && (
        <span className={'NavigationButton__SubName'}>
          {subName}
        </span>
      )}
    </button>
  )
}

export default NavigationButton
