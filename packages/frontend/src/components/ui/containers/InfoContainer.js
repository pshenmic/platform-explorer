import './InfoContainer.scss'

function InfoContainer ({ children, styles = [], className }) {
  let extraClass = ''

  if (styles.includes('tabs')) extraClass += ' InfoContainer--Tabs'

  return (
    <div className={`InfoContainer ${extraClass} ${className || ''}`}>
      {children}
    </div>
  )
}

export default InfoContainer
