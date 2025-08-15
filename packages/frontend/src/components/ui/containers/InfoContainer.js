import './InfoContainer.scss'

function InfoContainer ({ children, styles = [], id, className }) {
  const styleClasses = {
    tabs: 'InfoContainer--Tabs',
    translucentBg: 'InfoContainer--TranslucentBg'
  }

  const extraClasses = styles
    .map(style => styleClasses[style])
    .filter(Boolean)
    .join(' ')

  return (
    <div className={`InfoContainer ${extraClasses} ${className || ''}`} id={id}>
      {children}
    </div>
  )
}

export default InfoContainer
