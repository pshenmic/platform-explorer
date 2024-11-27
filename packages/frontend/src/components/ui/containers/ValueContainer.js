import './ValueContainer.scss'
import { ArrowCornerIcon } from '../icons'

function ValueContainer ({ children, clickable, external, light, className, ...props }) {
  let extraClass = ''

  if (clickable) extraClass += ' ValueContainer--Clickable'
  if (external) extraClass += ' ValueContainer--External'
  if (light) extraClass += ' ValueContainer--Light'

  return (
    <div className={`ValueContainer ${extraClass} ${className || ''}`} {...props}>
      {external && (
        <div className={'ValueContainer__ExternalIcon'}>
          <ArrowCornerIcon color={'brand.normal'} w={'10px'} h={'10px'} mr={'12px'}/>
        </div>
      )}
      <div className={'ValueContainer__Value'}>
        {children}
      </div>
    </div>
  )
}

export default ValueContainer
