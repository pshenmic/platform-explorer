import '../../../styles/components/InfoBlock.scss'

function InfoBlock ({ children, colorScheme = 'blue', gradient, className }) {
  const schemeClasses = {
    blue: '',
    green: 'InfoBlock--Green',
    red: 'InfoBlock--Red'
  }

  const classes = ['InfoBlock']

  if (schemeClasses?.[colorScheme]) classes.push(schemeClasses?.[colorScheme])
  if (gradient) classes.push('InfoBlock--Gradient')
  if (className) classes.push(className)

  return (
    <div className={classes.join(' ')}>
      {children}
    </div>
  )
}

export default InfoBlock
