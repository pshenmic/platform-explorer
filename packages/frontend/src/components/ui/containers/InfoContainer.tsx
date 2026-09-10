import type { WithChildren, WithClassName } from '../../../types/common'
import './InfoContainer.css'

type InfoContainerStyle = 'tabs' | 'translucentBg'

interface InfoContainerProps extends WithChildren, WithClassName {
  styles?: InfoContainerStyle[]
  id?: string
}

function InfoContainer ({ children, styles = [], id, className }: InfoContainerProps) {
  const styleClasses: Record<InfoContainerStyle, string> = {
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
