import './ValueContainer.scss'
import { ArrowCornerIcon } from '../../ui/icons'

function ValueContainer ({ children, clickable, external, className, ...props }) {
  let extraClass = ''

  if (clickable) extraClass += ' ValueContainer--Clickable'
  if (external) extraClass += ' ValueContainer--External'

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
