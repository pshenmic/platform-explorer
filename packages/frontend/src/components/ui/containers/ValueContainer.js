import './ValueContainer.scss'
import { ArrowCornerIcon } from '../icons'

function ValueContainer ({ children, clickable, colorScheme = 'default', external, light, className, ...props }) {
  const colorClasses = {
    default: '',
    red: 'ValueContainer--Red',
    green: 'ValueContainer--Green',
    blue: 'ValueContainer--Blue',
    gray: 'ValueContainer--Gray'
  }

  let extraClass = ''

  if (clickable) extraClass += ' ValueContainer--Clickable'
  if (external) extraClass += ' ValueContainer--External'
  if (light) extraClass += ' ValueContainer--Light'

  extraClass += colorClasses?.[colorScheme] || colorClasses.default

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
