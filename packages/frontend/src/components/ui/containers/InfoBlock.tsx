import type { WithChildren, WithClassName } from '../../../types/common'
import '../../../styles/components/InfoBlock.css'

type ColorScheme = 'blue' | 'green' | 'red'

interface InfoBlockProps extends WithChildren, WithClassName {
  colorScheme?: ColorScheme
  gradient?: boolean
}

function InfoBlock({ children, colorScheme = 'blue', gradient, className }: InfoBlockProps) {
  const schemeClasses: Record<ColorScheme, string> = {
    blue: '',
    green: 'InfoBlock--Green',
    red: 'InfoBlock--Red'
  }

  const classes = ['InfoBlock']

  if (schemeClasses?.[colorScheme]) classes.push(schemeClasses?.[colorScheme])
  if (gradient) classes.push('InfoBlock--Gradient')
  if (className) classes.push(className)

  return <div className={classes.join(' ')}>{children}</div>
}

export default InfoBlock
