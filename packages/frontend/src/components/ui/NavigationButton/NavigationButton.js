import './NavigationButton.scss'

function NavigationButton ({ active, name, subName, activeButton, ...props }) {
  return (
    <button
      className={`NavigationButton ${!activeButton ? 'NavigationButton__NoActive' : ''} ${active === name ? 'NavigationButton__Active' : ''}`}
      disabled={!activeButton}
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
